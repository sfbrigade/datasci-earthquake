"""Router to get tsunami risk"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from backend.database.session import get_db
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from backend.api.schemas.tsunami_schemas import (
    TsunamiFeature,
    TsunamiFeatureCollection,
    IsInTsunamiZoneView,
)
from backend.api.models.tsunami import TsunamiZone
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/tsunami-zones",
    tags=[Tags.TSUNAMI],
)


@router.get("", response_model=TsunamiFeatureCollection)
async def get_tsunami_zones(db: Session = Depends(get_db)):
    """
    Retrieve all tsunami hazard zones from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        SoftStoryFeatureCollection: A collection of all tsunami zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    tsunami_zones = db.query(TsunamiZone).all()
    print("tsunami zones:", tsunami_zones)
    if not tsunami_zones:
        raise HTTPException(status_code=404, detail="No tsunami zones found")
    features = [TsunamiFeature.from_sqlalchemy_model(zone) for zone in tsunami_zones]
    return TsunamiFeatureCollection(type="FeatureCollection", features=features)


@router.get("/is-in-tsunami-zone", response_model=IsInTsunamiZoneView)
async def is_in_tsunami_zone(lon: float, lat: float, db: Session = Depends(get_db)):
    """
    Check if a point is in a tsunami zone.

    Args:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        db (Session): The database session dependency.

    Returns:
        IsInTsunamiZoneView containing:
            - exists: True if point is in a tsunami zone
            - last_updated: Timestamp of last update if exists, None otherwise
    """
    logger.info(f"Checking tsunami zone for coordinates: lon={lon}, lat={lat}")

    try:
        point = from_shape(Point(lon, lat), srid=4326)
        zone = (
            db.query(TsunamiZone)
            .filter(TsunamiZone.geometry.ST_Intersects(point))
            .first()
        )

        exists = zone is not None
        last_updated = zone.update_timestamp if zone else None

        logger.info(
            f"Tsunami zone check result for coordinates: lon={lon}, lat={lat} - "
            f"exists: {exists}, "
            f"last_updated: {last_updated}"
        )

        return IsInTsunamiZoneView(exists=exists, last_updated=last_updated)

    except Exception as e:
        logger.error(
            f"Error checking tsunami zone status for coordinates: lon={lon}, lat={lat}, "
            f"error: {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Error checking tsunami zone status for coordinates: lon={lon}, lat={lat}, "
            f"error: {str(e)}",
        )
