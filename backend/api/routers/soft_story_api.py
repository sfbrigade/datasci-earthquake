"""CRUD for soft story properties"""

from fastapi import APIRouter, HTTPException, Depends
from ..tags import Tags
from sqlalchemy import and_, func
from sqlalchemy.orm import Session
from backend.database.session import get_db
from geoalchemy2 import functions as geo_func
from backend.api.schemas.soft_story_schemas import (
    SoftStoryFeature,
    SoftStoryFeatureCollection,
    IsSoftStoryPropertyView,
)
from backend.api.models.soft_story_properties import SoftStoryProperty
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/soft-stories",
    tags=[Tags.SOFT_STORY],
)


@router.get("", response_model=SoftStoryFeatureCollection)
async def get_soft_stories(db: Session = Depends(get_db)):
    """
    Retrieves all soft story properties (of which coordinates are
    known) from the database except the ones for which work is
    complete

    Args:
        db (Session): The database session dependency

    Returns:
        SoftStoryFeatureCollection: A collection of all soft story
        properties as GeoJSON Features

    Raises:
        HTTPException: If no zones are found (404 error)
    """
    soft_stories = (
        db.query(SoftStoryProperty).filter(and_(
            SoftStoryProperty.point.isnot(None)),
            func.lower(SoftStoryProperty.status) != "Work Complete, CFC Issued".lower()
        ).all()
    )

    # If no soft story properties are found, raise a 404 error
    if not soft_stories:
        logger.warning("No soft story properties found in database")
        raise HTTPException(status_code=404, detail="No soft stories found")

    features = [SoftStoryFeature.from_sqlalchemy_model(story) for story in soft_stories]
    logger.info(f"Successfully retrieved {len(features)} soft story properties")
    return SoftStoryFeatureCollection(type="FeatureCollection", features=features)


@router.get("/is-soft-story", response_model=IsSoftStoryPropertyView)
async def is_soft_story(lon: float, lat: float, db: Session = Depends(get_db)):
    """
    Checks if a point is a soft story property and returns its last update time

    Args:
        lon (float): Longitude of the point
        lat (float): Latitude of the point
        db (Session): The database session dependency

    Returns:
        IsSoftStoryPropertyView containing:
        - exists: True if point is in a soft story property
        - last_updated: Timestamp of last update if exists, None otherwise
    """
    logger.info(f"Checking soft story status for coordinates: lon={lon}, lat={lat}")

    try:
        property = (
            db.query(SoftStoryProperty)
            .filter(
                SoftStoryProperty.point
                == geo_func.ST_GeomFromText(f"POINT({lon} {lat})", 4326)
            )
            .first()
        )

        exists = property is not None
        last_updated = property.update_timestamp if property else None

        logger.info(
            f"Soft story check result for coordinates: lon={lon}, lat={lat} - "
            f"exists: {exists}, "
            f"last_updated: {last_updated}"
        )

        return IsSoftStoryPropertyView(exists=exists, last_updated=last_updated)

    except Exception as e:
        logger.error(
            f"Error checking soft story status for coordinates: lon={lon}, lat={lat}, "
            f"error: {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Error checking soft story status for coordinates: lon={lon}, lat={lat}, "
            f"error: {str(e)}",
        )
