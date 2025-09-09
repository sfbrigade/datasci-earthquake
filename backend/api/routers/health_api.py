"""Router for health check endpoints"""

from fastapi import APIRouter, HTTPException
from ..tags import Tags
from backend.etl.background_service import etl_service
from backend.etl.database_checker import db_checker
import logging
from typing import Dict, Any

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/health",
    tags=[Tags.SYSTEM],
)


@router.get("")
async def health_check():
    """
    Simple health check endpoint to verify API is running.
    This endpoint returns immediately, indicating the API is responsive.

    Returns:
        dict: Status message indicating the API is healthy.
    """
    logger.info("Health check endpoint called")
    return {"status": "healthy"}


@router.get("/startup")
async def startup_health_check():
    """
    Comprehensive health check that verifies ETL processes are ready.
    This endpoint should be used by Docker healthchecks to determine
    if the service is fully operational.

    Returns:
        dict: Detailed status including ETL process information.
    """
    logger.info("Startup health check endpoint called")

    try:
        etl_status = etl_service.get_status()
        is_ready = etl_service.is_ready()
        is_running = etl_service.is_running()

        # Determine overall health
        if is_ready:
            status = "ready"
            message = "All ETL processes completed successfully"
        elif is_running:
            status = "loading"
            message = "ETL processes are running in background"
        else:
            status = "error"
            message = "ETL service is not running"

        return {
            "status": status,
            "message": message,
            "etl_service_running": is_running,
            "etl_processes": {
                name: {
                    "status": process.status.value,
                    "started_at": (
                        process.started_at.isoformat() if process.started_at else None
                    ),
                    "completed_at": (
                        process.completed_at.isoformat()
                        if process.completed_at
                        else None
                    ),
                    "records_processed": process.records_processed,
                    "error_message": process.error_message,
                }
                for name, process in etl_status.items()
            },
        }

    except Exception as e:
        logger.error(f"Startup health check failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/etl")
async def etl_status():
    """
    Get detailed status of ETL processes.
    Useful for monitoring and debugging.

    Returns:
        dict: Detailed ETL process status information.
    """
    logger.info("ETL status endpoint called")

    try:
        etl_status = etl_service.get_status()
        is_running = etl_service.is_running()

        return {
            "etl_service_running": is_running,
            "processes": {
                name: {
                    "status": process.status.value,
                    "started_at": (
                        process.started_at.isoformat() if process.started_at else None
                    ),
                    "completed_at": (
                        process.completed_at.isoformat()
                        if process.completed_at
                        else None
                    ),
                    "records_processed": process.records_processed,
                    "error_message": process.error_message,
                }
                for name, process in etl_status.items()
            },
        }

    except Exception as e:
        logger.error(f"ETL status check failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"ETL status check failed: {str(e)}"
        )


@router.get("/cache")
async def cache_status():
    """
    Get cache statistics and status.
    Useful for monitoring cache performance and debugging.

    Returns:
        dict: Cache statistics and metadata.
    """
    logger.info("Cache status endpoint called")

    try:
        cache_stats = db_checker.get_table_stats()
        return cache_stats

    except Exception as e:
        logger.error(f"Cache status check failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Cache status check failed: {str(e)}"
        )


@router.post("/cache/clear/{dataset_name}")
async def clear_cache(dataset_name: str):
    """
    Clear cache for a specific dataset.
    Forces the next ETL run to refresh data from external APIs.

    Args:
        dataset_name: Name of the dataset to clear cache for

    Returns:
        dict: Confirmation message
    """
    logger.info(f"Cache clear requested for dataset: {dataset_name}")

    try:
        # Database data is persistent - clearing not applicable
        return {
            "message": "Database data is persistent - use database reset to clear data"
        }

    except Exception as e:
        logger.error(f"Failed to clear cache for {dataset_name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")
