"""
Type definitions and error classes for parallel ETL system.
"""

from dataclasses import dataclass
from typing import Optional, Callable
from datetime import datetime
from enum import Enum


class ETLStatus(Enum):
    """Status of an ETL execution"""

    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    SKIPPED = "skipped"


class ParallelETLError(Exception):
    """Base exception for parallel ETL system"""

    pass


class ETLExecutionError(ParallelETLError):
    """Wraps errors from individual ETL execution with context"""

    def __init__(self, etl_name: str, original_error: Exception):
        if not etl_name:
            raise ValueError("ETL name cannot be empty")
        if original_error is None:
            raise ValueError("Original error cannot be None")

        self.etl_name = etl_name
        self.original_error = original_error
        super().__init__(
            f"ETL '{etl_name}' failed: {type(original_error).__name__}: {original_error}"
        )


class ETLTimeoutError(ParallelETLError):
    """ETL exceeded time limit"""

    def __init__(self, etl_name: str, timeout_seconds: int):
        if not etl_name:
            raise ValueError("ETL name cannot be empty")
        if timeout_seconds <= 0:
            raise ValueError("Timeout must be positive")

        self.etl_name = etl_name
        self.timeout_seconds = timeout_seconds
        super().__init__(
            f"ETL '{etl_name}' exceeded timeout of {timeout_seconds} seconds"
        )


class ETLValidationError(ParallelETLError):
    """Invalid input to ETL system"""

    pass


@dataclass(frozen=True)
class ETLResult:
    """
    Immutable result of a single ETL execution.

    Attributes:
        name: ETL identifier
        status: Execution outcome
        duration_seconds: Time taken to complete
        start_time: Execution start time
        end_time: Execution end time
        error: Exception if failed, None if successful
        records_processed: Number of records processed
    """

    name: str
    status: ETLStatus
    duration_seconds: float
    start_time: datetime
    end_time: datetime
    error: Optional[Exception] = None
    records_processed: Optional[int] = None

    def __post_init__(self):
        """Validate result invariants"""
        if not self.name or not self.name.strip():
            raise ValueError("ETL name cannot be empty or whitespace")

        if self.duration_seconds < 0:
            raise ValueError(f"Duration cannot be negative: {self.duration_seconds}")

        if self.end_time < self.start_time:
            raise ValueError(
                f"End time ({self.end_time}) cannot be before start time ({self.start_time})"
            )

        # Verify duration matches timestamps (with small tolerance for floating point)
        actual_duration = (self.end_time - self.start_time).total_seconds()
        if abs(actual_duration - self.duration_seconds) > 0.1:  # 100ms tolerance
            raise ValueError(
                f"Duration ({self.duration_seconds}s) doesn't match "
                f"timestamps ({actual_duration}s)"
            )

        if self.records_processed is not None and self.records_processed < 0:
            raise ValueError(
                f"Records processed cannot be negative: {self.records_processed}"
            )

        # Status-error consistency
        if self.status == ETLStatus.SUCCESS and self.error is not None:
            raise ValueError("Successful ETL result cannot have an error")

        if self.status == ETLStatus.FAILED and self.error is None:
            raise ValueError("Failed ETL result must have an error")

    @property
    def is_successful(self) -> bool:
        """Convenience property for checking success"""
        return self.status == ETLStatus.SUCCESS

    def __str__(self) -> str:
        """Human-readable representation"""
        if self.is_successful:
            records = (
                f", {self.records_processed} records" if self.records_processed else ""
            )
            return (
                f"ETL '{self.name}': SUCCESS in {self.duration_seconds:.2f}s{records}"
            )
        else:
            error_msg = f": {self.error}" if self.error else ""
            return f"ETL '{self.name}': {self.status.value.upper()} in {self.duration_seconds:.2f}s{error_msg}"


@dataclass(frozen=True)
class ParallelETLResult:
    """
    Immutable result of parallel ETL execution.

    Aggregates results from all ETL processes.

    Attributes:
        results: List of individual ETL results
        total_duration_seconds: Wall-clock time for all ETLs
        start_time: When parallel execution began
        end_time: When parallel execution completed
    """

    results: tuple[ETLResult, ...]  # Tuple for immutability
    total_duration_seconds: float
    start_time: datetime
    end_time: datetime

    def __post_init__(self):
        """Validate aggregate result invariants"""
        if self.total_duration_seconds < 0:
            raise ValueError("Total duration cannot be negative")

        if self.end_time < self.start_time:
            raise ValueError("End time cannot be before start time")

        # Verify at least one result
        if not self.results:
            raise ValueError("Must have at least one ETL result")

    @property
    def all_successful(self) -> bool:
        """True if all ETLs succeeded"""
        return all(r.is_successful for r in self.results)

    @property
    def failed_etls(self) -> tuple[ETLResult, ...]:
        """Get list of failed ETL results"""
        return tuple(r for r in self.results if not r.is_successful)

    @property
    def success_count(self) -> int:
        """Number of successful ETLs"""
        return sum(1 for r in self.results if r.is_successful)

    def __str__(self) -> str:
        """Human-readable summary"""
        status = "SUCCESS" if self.all_successful else "FAILED"
        return (
            f"Parallel ETL: {status} - "
            f"{self.success_count}/{len(self.results)} succeeded in "
            f"{self.total_duration_seconds:.2f}s"
        )


# Type alias for ETL callable
ETLCallable = Callable[[], None]
