"""
Unit tests for parallel ETL orchestration.

Following TDD principles - these tests are written BEFORE implementation.
Tests use mocks to isolate the orchestration logic from actual ETL execution.
"""

import pytest
from unittest.mock import Mock, patch, call
from datetime import datetime, timedelta
import time
from concurrent.futures import TimeoutError as FuturesTimeoutError

from backend.etl.parallel_etl_types import (
    ETLStatus,
    ETLResult,
    ParallelETLResult,
    ETLExecutionError,
    ETLTimeoutError,
    ETLValidationError,
)
from backend.etl.parallel_etl import run_single_etl, run_parallel_etls


class TestETLResult:
    """Test the ETLResult dataclass validation"""

    def test_create_successful_result(self):
        """Should create a valid successful result"""
        start = datetime.now()
        end = start + timedelta(seconds=5)

        result = ETLResult(
            name="test_etl",
            status=ETLStatus.SUCCESS,
            duration_seconds=5.0,
            start_time=start,
            end_time=end,
            records_processed=100,
        )

        assert result.name == "test_etl"
        assert result.is_successful
        assert result.records_processed == 100

    def test_create_failed_result(self):
        """Should create a valid failed result with error"""
        start = datetime.now()
        end = start + timedelta(seconds=3)
        error = ValueError("Test error")

        result = ETLResult(
            name="test_etl",
            status=ETLStatus.FAILED,
            duration_seconds=3.0,
            start_time=start,
            end_time=end,
            error=error,
        )

        assert not result.is_successful
        assert result.error == error

    def test_reject_empty_name(self):
        """Should reject empty ETL name"""
        start = datetime.now()
        end = start + timedelta(seconds=1)

        with pytest.raises(ValueError, match="name cannot be empty"):
            ETLResult(
                name="",
                status=ETLStatus.SUCCESS,
                duration_seconds=1.0,
                start_time=start,
                end_time=end,
            )

    def test_reject_whitespace_name(self):
        """Should reject whitespace-only ETL name"""
        start = datetime.now()
        end = start + timedelta(seconds=1)

        with pytest.raises(ValueError, match="name cannot be empty"):
            ETLResult(
                name="   ",
                status=ETLStatus.SUCCESS,
                duration_seconds=1.0,
                start_time=start,
                end_time=end,
            )

    def test_reject_negative_duration(self):
        """Should reject negative duration"""
        start = datetime.now()
        end = start + timedelta(seconds=1)

        with pytest.raises(ValueError, match="Duration cannot be negative"):
            ETLResult(
                name="test",
                status=ETLStatus.SUCCESS,
                duration_seconds=-1.0,
                start_time=start,
                end_time=end,
            )

    def test_reject_end_before_start(self):
        """Should reject end time before start time"""
        start = datetime.now()
        end = start - timedelta(seconds=1)

        with pytest.raises(ValueError, match="End time.*cannot be before start time"):
            ETLResult(
                name="test",
                status=ETLStatus.SUCCESS,
                duration_seconds=1.0,  # Will also fail consistency check
                start_time=start,
                end_time=end,
            )

    def test_reject_duration_timestamp_mismatch(self):
        """Should reject if duration doesn't match timestamps"""
        start = datetime.now()
        end = start + timedelta(seconds=5)

        with pytest.raises(ValueError, match="Duration.*doesn't match"):
            ETLResult(
                name="test",
                status=ETLStatus.SUCCESS,
                duration_seconds=10.0,  # Doesn't match 5 second difference
                start_time=start,
                end_time=end,
            )

    def test_reject_negative_records(self):
        """Should reject negative record count"""
        start = datetime.now()
        end = start + timedelta(seconds=1)

        with pytest.raises(ValueError, match="Records processed cannot be negative"):
            ETLResult(
                name="test",
                status=ETLStatus.SUCCESS,
                duration_seconds=1.0,
                start_time=start,
                end_time=end,
                records_processed=-5,
            )

    def test_reject_success_with_error(self):
        """Should reject successful result that has an error"""
        start = datetime.now()
        end = start + timedelta(seconds=1)

        with pytest.raises(ValueError, match="Successful.*cannot have an error"):
            ETLResult(
                name="test",
                status=ETLStatus.SUCCESS,
                duration_seconds=1.0,
                start_time=start,
                end_time=end,
                error=ValueError("Shouldn't be here"),
            )

    def test_reject_failed_without_error(self):
        """Should reject failed result without an error"""
        start = datetime.now()
        end = start + timedelta(seconds=1)

        with pytest.raises(ValueError, match="Failed.*must have an error"):
            ETLResult(
                name="test",
                status=ETLStatus.FAILED,
                duration_seconds=1.0,
                start_time=start,
                end_time=end,
                error=None,
            )


class TestParallelETLResult:
    """Test the ParallelETLResult aggregate"""

    def test_create_successful_aggregate(self):
        """Should create valid aggregate result"""
        start = datetime.now()

        result1 = ETLResult(
            name="etl1",
            status=ETLStatus.SUCCESS,
            duration_seconds=5.0,
            start_time=start,
            end_time=start + timedelta(seconds=5),
        )

        result2 = ETLResult(
            name="etl2",
            status=ETLStatus.SUCCESS,
            duration_seconds=3.0,
            start_time=start,
            end_time=start + timedelta(seconds=3),
        )

        aggregate = ParallelETLResult(
            results=(result1, result2),
            total_duration_seconds=5.0,  # Wall clock (parallel)
            start_time=start,
            end_time=start + timedelta(seconds=5),
        )

        assert aggregate.all_successful
        assert aggregate.success_count == 2
        assert len(aggregate.failed_etls) == 0

    def test_aggregate_with_failures(self):
        """Should track failed ETLs"""
        start = datetime.now()

        result1 = ETLResult(
            name="etl1",
            status=ETLStatus.SUCCESS,
            duration_seconds=2.0,
            start_time=start,
            end_time=start + timedelta(seconds=2),
        )

        result2 = ETLResult(
            name="etl2",
            status=ETLStatus.FAILED,
            duration_seconds=1.0,
            start_time=start,
            end_time=start + timedelta(seconds=1),
            error=ValueError("Test failure"),
        )

        aggregate = ParallelETLResult(
            results=(result1, result2),
            total_duration_seconds=2.0,
            start_time=start,
            end_time=start + timedelta(seconds=2),
        )

        assert not aggregate.all_successful
        assert aggregate.success_count == 1
        assert len(aggregate.failed_etls) == 1
        assert aggregate.failed_etls[0].name == "etl2"

    def test_reject_empty_results(self):
        """Should reject aggregate with no results"""
        start = datetime.now()

        with pytest.raises(ValueError, match="Must have at least one ETL result"):
            ParallelETLResult(
                results=(),
                total_duration_seconds=1.0,
                start_time=start,
                end_time=start + timedelta(seconds=1),
            )


class TestETLErrors:
    """Test custom error types"""

    def test_execution_error_requires_name(self):
        """Should reject execution error without name"""
        with pytest.raises(ValueError, match="ETL name cannot be empty"):
            ETLExecutionError("", ValueError("test"))

    def test_execution_error_requires_error(self):
        """Should reject execution error without original error"""
        with pytest.raises(ValueError, match="Original error cannot be None"):
            ETLExecutionError("test", None)

    def test_execution_error_message_format(self):
        """Should format error message with context"""
        orig_error = ValueError("original message")
        error = ETLExecutionError("my_etl", orig_error)

        assert "my_etl" in str(error)
        assert "ValueError" in str(error)
        assert "original message" in str(error)

    def test_timeout_error_requires_name(self):
        """Should reject timeout error without name"""
        with pytest.raises(ValueError, match="ETL name cannot be empty"):
            ETLTimeoutError("", 60)

    def test_timeout_error_requires_positive_timeout(self):
        """Should reject timeout error with non-positive timeout"""
        with pytest.raises(ValueError, match="Timeout must be positive"):
            ETLTimeoutError("test", 0)

        with pytest.raises(ValueError, match="Timeout must be positive"):
            ETLTimeoutError("test", -10)


# Tests for the actual parallel execution logic


class TestRunSingleETL:
    """Tests for run_single_etl function"""

    def test_run_successful_etl(self):
        """Should execute ETL and return success result"""
        from backend.etl.parallel_etl import run_single_etl

        # Mock ETL that succeeds
        def mock_etl():
            time.sleep(0.1)  # Simulate work

        result = run_single_etl("test_etl", mock_etl, timeout=5)

        assert result.name == "test_etl"
        assert result.is_successful
        assert result.status == ETLStatus.SUCCESS
        assert result.duration_seconds >= 0.1
        assert result.error is None

    def test_run_failing_etl(self):
        """Should capture ETL exception and return failed result"""
        from backend.etl.parallel_etl import run_single_etl

        # Mock ETL that raises exception
        def mock_etl():
            raise ValueError("Test error")

        result = run_single_etl("test_etl", mock_etl)

        assert result.name == "test_etl"
        assert not result.is_successful
        assert result.status == ETLStatus.FAILED
        assert result.error is not None
        assert isinstance(result.error, ETLExecutionError)
        assert "Test error" in str(result.error)

    def test_timeout_slow_etl(self):
        """Should timeout ETL that takes too long"""
        from backend.etl.parallel_etl import run_single_etl

        # Mock ETL that takes forever
        def slow_etl():
            time.sleep(10)  # 10 seconds

        result = run_single_etl("slow_etl", slow_etl, timeout=1)

        assert result.name == "slow_etl"
        assert not result.is_successful
        assert result.status == ETLStatus.TIMEOUT
        assert result.error is not None
        assert isinstance(result.error, ETLTimeoutError)

    def test_reject_empty_name(self):
        """Should reject ETL with empty name"""
        from backend.etl.parallel_etl import run_single_etl

        with pytest.raises(ETLValidationError, match="name cannot be empty"):
            run_single_etl("", lambda: None)

    def test_reject_whitespace_name(self):
        """Should reject ETL with whitespace name"""
        from backend.etl.parallel_etl import run_single_etl

        with pytest.raises(ETLValidationError, match="name cannot be empty"):
            run_single_etl("   ", lambda: None)

    def test_reject_none_function(self):
        """Should reject None as ETL function"""
        from backend.etl.parallel_etl import run_single_etl

        with pytest.raises(ETLValidationError, match="cannot be None"):
            run_single_etl("test", None)

    def test_reject_non_callable(self):
        """Should reject non-callable as ETL function"""
        from backend.etl.parallel_etl import run_single_etl

        with pytest.raises(ETLValidationError, match="must be callable"):
            run_single_etl("test", "not a function")

    def test_reject_negative_timeout(self):
        """Should reject negative timeout"""
        from backend.etl.parallel_etl import run_single_etl

        with pytest.raises(ETLValidationError, match="must be positive"):
            run_single_etl("test", lambda: None, timeout=-1)

    def test_reject_zero_timeout(self):
        """Should reject zero timeout"""
        from backend.etl.parallel_etl import run_single_etl

        with pytest.raises(ETLValidationError, match="must be positive"):
            run_single_etl("test", lambda: None, timeout=0)


class TestRunParallelETLs:
    """Tests for run_parallel_etls function"""

    def test_run_multiple_etls_successfully(self):
        """Should run multiple ETLs in parallel and all succeed"""
        from backend.etl.parallel_etl import run_parallel_etls

        # Mock ETLs with different durations
        def etl1():
            time.sleep(0.2)

        def etl2():
            time.sleep(0.15)

        def etl3():
            time.sleep(0.1)

        etl_map = {"etl1": etl1, "etl2": etl2, "etl3": etl3}

        result = run_parallel_etls(etl_map)

        assert result.all_successful
        assert result.success_count == 3
        assert len(result.failed_etls) == 0
        assert result.total_duration_seconds < 0.4  # Some margin

    def test_handle_one_etl_failure(self):
        """Should continue other ETLs when one fails"""
        from backend.etl.parallel_etl import run_parallel_etls

        def success_etl():
            time.sleep(0.1)

        def failing_etl():
            raise ValueError("Intentional failure")

        etl_map = {
            "success1": success_etl,
            "failure": failing_etl,
            "success2": success_etl,
        }

        result = run_parallel_etls(etl_map)

        assert not result.all_successful
        assert result.success_count == 2
        assert len(result.failed_etls) == 1
        assert result.failed_etls[0].name == "failure"

    def test_handle_all_etls_failing(self):
        """Should handle all ETLs failing"""
        from backend.etl.parallel_etl import run_parallel_etls

        def failing_etl1():
            raise ValueError("Error 1")

        def failing_etl2():
            raise RuntimeError("Error 2")

        etl_map = {"fail1": failing_etl1, "fail2": failing_etl2}

        result = run_parallel_etls(etl_map)

        assert not result.all_successful
        assert result.success_count == 0
        assert len(result.failed_etls) == 2

    def test_handle_timeout_in_parallel(self):
        """Should handle timeout of one ETL while others complete"""
        from backend.etl.parallel_etl import run_parallel_etls

        def fast_etl():
            time.sleep(0.1)

        def slow_etl():
            time.sleep(5)

        etl_map = {"fast": fast_etl, "slow": slow_etl}

        result = run_parallel_etls(etl_map, timeout_per_etl=1)

        assert not result.all_successful
        assert result.success_count == 1

        # Find the slow ETL result
        slow_result = next(r for r in result.results if r.name == "slow")
        assert slow_result.status == ETLStatus.TIMEOUT

    def test_reject_empty_etl_map(self):
        """Should reject empty ETL map"""
        from backend.etl.parallel_etl import run_parallel_etls

        with pytest.raises(ETLValidationError, match="cannot be empty"):
            run_parallel_etls({})

    def test_reject_etl_with_empty_name(self):
        """Should reject ETL map with empty name"""
        from backend.etl.parallel_etl import run_parallel_etls

        with pytest.raises(ETLValidationError, match="must be non-empty"):
            run_parallel_etls({"": lambda: None})

    def test_reject_etl_with_non_callable(self):
        """Should reject ETL map with non-callable"""
        from backend.etl.parallel_etl import run_parallel_etls

        with pytest.raises(ETLValidationError, match="not callable"):
            run_parallel_etls({"test": "not a function"})

    def test_reject_negative_timeout(self):
        """Should reject negative timeout"""
        from backend.etl.parallel_etl import run_parallel_etls

        with pytest.raises(ETLValidationError, match="must be positive"):
            run_parallel_etls({"test": lambda: None}, timeout_per_etl=-1)

    def test_reject_negative_max_workers(self):
        """Should reject negative max_workers"""
        from backend.etl.parallel_etl import run_parallel_etls

        with pytest.raises(ETLValidationError, match="must be positive"):
            run_parallel_etls({"test": lambda: None}, max_workers=-1)

    def test_single_etl(self):
        """Should handle single ETL"""
        from backend.etl.parallel_etl import run_parallel_etls

        def single_etl():
            time.sleep(0.1)

        result = run_parallel_etls({"single": single_etl})

        assert result.all_successful
        assert result.success_count == 1
