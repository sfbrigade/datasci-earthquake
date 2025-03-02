"""Router for health check endpoint"""

from fastapi import APIRouter
from ..tags import Tags
import logging

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

    Returns:
        dict: Status message indicating the API is healthy.
    """
    logger.info("Health check endpoint called")
    return {"status": "healthy"}
