"""
Parallel ETL orchestration system.

Provides functionality to run multiple ETL processes concurrently
with error handling, timeout protection, and result tracking.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime
from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed,
    TimeoutError as FuturesTimeoutError,
)

from backend.etl.parallel_etl_types import (
    ETLCallable,
    ETLResult,
    ParallelETLResult,
    ETLStatus,
    ETLExecutionError,
    ETLTimeoutError,
    ETLValidationError,
)

# Configure module logger
logger = logging.getLogger(__name__)

# Safety limits
MAX_CONCURRENT_ETLS = 3
DEFAULT_TIMEOUT_SECONDS = 180  # 3 minutes per ETL


def run_single_etl(
    name: str,
    etl_func: ETLCallable,
    timeout: int = DEFAULT_TIMEOUT_SECONDS,
    run_id: Optional[str] = None,
) -> ETLResult:
    """
    Execute a single ETL process with error handling and timeout protection.

    Args:
        name: ETL identifier
        etl_func: Callable that performs the ETL
        timeout: Maximum seconds before timeout
        run_id: Optional correlation ID for logging

    Returns:
        ETLResult with success/failure status and metrics
    """
    # Input validation
    if not name or not name.strip():
        raise ETLValidationError("ETL name cannot be empty or whitespace")

    if etl_func is None:
        raise ETLValidationError("ETL function cannot be None")

    if not callable(etl_func):
        raise ETLValidationError(f"ETL function must be callable, got {type(etl_func)}")

    if timeout <= 0:
        raise ETLValidationError(f"Timeout must be positive, got {timeout}")

    # Prepare logging context
    log_prefix = (
        f"[PARALLEL_ETL] [run_id={run_id}] [{name}]"
        if run_id
        else f"[PARALLEL_ETL] [{name}]"
    )

    start_time = datetime.now()
    logger.info(f"{log_prefix} Starting ETL execution (timeout={timeout}s)")

    try:
        # Execute with timeout using ThreadPoolExecutor
        # (Note: Python threading has GIL limitations, but ETL is I/O bound)
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(etl_func)
            try:
                # Wait for completion or timeout
                future.result(timeout=timeout)

                # Success!
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()

                logger.info(f"{log_prefix} Completed successfully in {duration:.2f}s")

                return ETLResult(
                    name=name,
                    status=ETLStatus.SUCCESS,
                    duration_seconds=duration,
                    start_time=start_time,
                    end_time=end_time,
                )

            except FuturesTimeoutError:
                # ETL exceeded timeout
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()

                timeout_error = ETLTimeoutError(name, timeout)
                logger.error(f"{log_prefix} Timeout after {duration:.2f}s")

                return ETLResult(
                    name=name,
                    status=ETLStatus.TIMEOUT,
                    duration_seconds=duration,
                    start_time=start_time,
                    end_time=end_time,
                    error=timeout_error,
                )

    except Exception as e:
        # ETL raised an exception
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        execution_error = ETLExecutionError(name, e)
        logger.error(
            f"{log_prefix} Failed after {duration:.2f}s: {type(e).__name__}: {e}",
            exc_info=True,
        )

        return ETLResult(
            name=name,
            status=ETLStatus.FAILED,
            duration_seconds=duration,
            start_time=start_time,
            end_time=end_time,
            error=execution_error,
        )


def run_parallel_etls(
    etl_map: Dict[str, ETLCallable],
    timeout_per_etl: int = DEFAULT_TIMEOUT_SECONDS,
    max_workers: int = MAX_CONCURRENT_ETLS,
    run_id: Optional[str] = None,
) -> ParallelETLResult:
    """
    Execute multiple ETL processes concurrently.

    This is the main orchestration function. It:
    - Validates all inputs before starting
    - Executes ETLs in parallel using thread pool
    - Collects all results (success and failure)
    - Returns aggregate metrics
    - Never crashes - always returns a result

    Args:
        etl_map: Dict mapping ETL name to callable
        timeout_per_etl: Max seconds per individual ETL
        max_workers: Maximum concurrent ETL processes
        run_id: Optional correlation ID for logging

    Returns:
        ParallelETLResult with all individual results and aggregate metrics

    Raises:
        ETLValidationError: If inputs are invalid (before any execution)

    Notes:
        - If ANY ETL fails, the aggregate result marks overall failure
        - But ALL ETLs complete (we don't cancel others on failure)
        - This allows maximum data collection and debugging
    """
    # Input validation
    if not etl_map:
        raise ETLValidationError("ETL map cannot be empty")

    if timeout_per_etl <= 0:
        raise ETLValidationError(f"Timeout must be positive, got {timeout_per_etl}")

    if max_workers <= 0:
        raise ETLValidationError(f"Max workers must be positive, got {max_workers}")

    # Validate all ETL names and callables upfront
    for name, func in etl_map.items():
        if not name or not name.strip():
            raise ETLValidationError("All ETL names must be non-empty")
        if not callable(func):
            raise ETLValidationError(f"ETL '{name}' function is not callable")

    # Prepare for execution
    num_etls = len(etl_map)
    log_prefix = f"[PARALLEL_ETL] [run_id={run_id}]" if run_id else "[PARALLEL_ETL]"

    logger.info(
        f"{log_prefix} Starting {num_etls} ETL processes in parallel "
        f"(max_workers={max_workers}, timeout_per_etl={timeout_per_etl}s)"
    )

    overall_start = datetime.now()
    results: List[ETLResult] = []

    # Execute in parallel
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all ETL jobs
        future_to_name = {
            executor.submit(run_single_etl, name, func, timeout_per_etl, run_id): name
            for name, func in etl_map.items()
        }

        # Collect results as they complete
        for future in as_completed(future_to_name):
            etl_name = future_to_name[future]
            try:
                result = future.result()  # Get the ETLResult
                results.append(result)

                if result.is_successful:
                    logger.info(f"{log_prefix} [{etl_name}] ✓ Completed")
                else:
                    logger.error(f"{log_prefix} [{etl_name}] ✗ Failed: {result.error}")

            except Exception as e:
                # This should never happen (run_single_etl catches everything)
                # But defensive programming: handle it anyway
                logger.error(
                    f"{log_prefix} [{etl_name}] Unexpected error in orchestration: {e}",
                    exc_info=True,
                )

                # Create a failure result
                end_time = datetime.now()
                duration = (end_time - overall_start).total_seconds()
                results.append(
                    ETLResult(
                        name=etl_name,
                        status=ETLStatus.FAILED,
                        duration_seconds=duration,
                        start_time=overall_start,
                        end_time=end_time,
                        error=ETLExecutionError(etl_name, e),
                    )
                )

    # Calculate aggregate metrics
    overall_end = datetime.now()
    total_duration = (overall_end - overall_start).total_seconds()

    aggregate = ParallelETLResult(
        results=tuple(results),
        total_duration_seconds=total_duration,
        start_time=overall_start,
        end_time=overall_end,
    )

    # Log summary
    if aggregate.all_successful:
        logger.info(
            f"{log_prefix} ✓ All {num_etls} ETLs succeeded in {total_duration:.2f}s "
        )
    else:
        failed = [r.name for r in aggregate.failed_etls]
        logger.error(
            f"{log_prefix} ✗ {len(failed)}/{num_etls} ETLs failed in {total_duration:.2f}s. "
            f"Failed: {', '.join(failed)}"
        )

    return aggregate
