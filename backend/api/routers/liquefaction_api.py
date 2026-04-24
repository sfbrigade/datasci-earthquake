"""Router to handle liquefaction-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter, Query
from typing import Optional
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from backend.database.session import get_db
from ..schemas.liquefaction_schemas import (
    LiquefactionFeature,
    InLiquefactionZoneView,
    LiquefactionFeatureCollection,
)
from backend.api.models.liquefaction_zones import LiquefactionZone
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/liquefaction-zones",
    tags=[Tags.LIQUEFACTION],
)


@router.get("", response_model=LiquefactionFeatureCollection)
def get_liquefaction_zones(db: Session = Depends(get_db)):
    """
    Retrieve all liquefaction zones from the database

    Included for backward compatibility

    Args:
        db (Session): The database session dependency.

    Returns:
        LiquefactionFeatureCollection: A collection of all liquefaction zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all liquefaction zones
    liquefaction_zones = db.query(LiquefactionZone).all()

    # If no zones are found, raise a 404 error
    if not liquefaction_zones:
        raise HTTPException(status_code=404, detail="No liquefaction zones found")

    features = [
        LiquefactionFeature.from_sqlalchemy_model(zone) for zone in liquefaction_zones
    ]
    return LiquefactionFeatureCollection(type="FeatureCollection", features=features)


@router.get("/high-susceptibility", response_model=LiquefactionFeatureCollection)
def get_high_susceptibility_zones(db: Session = Depends(get_db)):
    """
    Retrieve all high-susceptibility liquefaction zones from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        LiquefactionFeatureCollection: A collection of high-susceptibility liquefaction zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all high-susceptibility liquefaction zones
    high_susceptibility_zones = (
        db.query(LiquefactionZone).filter(LiquefactionZone.liq == "H").all()
    )

    # If no zones are found, raise a 404 error
    if not high_susceptibility_zones:
        raise HTTPException(
            status_code=404, detail="No high-susceptibility liquefaction zones found"
        )

    # Create features for high-susceptibility zones
    high_susceptibility_features = [
        LiquefactionFeature.from_sqlalchemy_model(zone)
        for zone in high_susceptibility_zones
    ]

    # Create feature collection
    high_susceptibility_collection = LiquefactionFeatureCollection(
        features=high_susceptibility_features
    )

    # Return the response
    return high_susceptibility_collection


@router.get("/very-high-susceptibility", response_model=LiquefactionFeatureCollection)
def get_very_high_susceptibility_zones(db: Session = Depends(get_db)):
    """
    Retrieve all very-high-susceptibility liquefaction zones from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        LiquefactionFeatureCollection: A collection of very-high-susceptibility liquefaction zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all very-high-susceptibility liquefaction zones
    very_high_susceptibility_zones = (
        db.query(LiquefactionZone).filter(LiquefactionZone.liq == "VH").all()
    )

    # If no zones are found, raise a 404 error
    if not very_high_susceptibility_zones:
        raise HTTPException(
            status_code=404,
            detail="No very-high-susceptibility liquefaction zones found",
        )

    # Create features for very-high-susceptibility zones
    very_high_susceptibility_features = [
        LiquefactionFeature.from_sqlalchemy_model(zone)
        for zone in very_high_susceptibility_zones
    ]

    # Create feature collection
    very_high_susceptibility_collection = LiquefactionFeatureCollection(
        features=very_high_susceptibility_features
    )

    # Return the response
    return very_high_susceptibility_collection


@router.get("/is-in-liquefaction-zone", response_model=InLiquefactionZoneView)
def is_in_liquefaction_zone(
    lon: Optional[float] = Query(None),
    lat: Optional[float] = Query(None),
    ping: bool = False,
    db: Session = Depends(get_db),
):
    """
    Check if a point is in a liquefaction zone.

    Args:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        ping (bool): Optional ping parameter, used to reduce cold starts.
        db (Session): The database session dependency.

    Returns:
        IsInLiquefactionZoneView containing:
            - exists: True if point is in a liquefaction zone
            - last_updated: Timestamp of last update if exists, None otherwise

         If `ping=true` is passed, skips DB call and returns a dummy IsInLiquefactionZoneView(exists=False, last_updated=None) instance.
    """
    if ping:
        logger.info(f"Pinging the is-in-liquefaction-zone endpoint")
        return InLiquefactionZoneView(
            exists=False, last_updated=None, liq=None
        )  # skip DB call

    if lon is None or lat is None:
        logger.warning("Missing coordinates in non-ping request")
        raise HTTPException(
            status_code=400,
            detail="Both 'lon' and 'lat' must be provided unless ping=true",
        )

    logger.info(f"Checking liquefaction zone for coordinates: lon={lon}, lat={lat}")

    try:
        point = from_shape(Point(lon, lat), srid=4326)
        zone = (
            db.query(LiquefactionZone)
            .filter(LiquefactionZone.geometry.ST_Intersects(point))
            .first()
        )
        exists = zone is not None
        last_updated = zone.update_timestamp if zone else None
        liq = zone.liq if zone else None

        logger.info(
            f"Liquefaction zone check result for coordinates: lon={lon}, lat={lat} - "
            f"exists: {exists}, "
            f"last_updated: {last_updated}"
            f"liq: {liq}"
        )

        return InLiquefactionZoneView(exists=exists, last_updated=last_updated, liq=liq)

    except Exception as e:
        logger.error(
            f"Error checking liquefaction zone status for coordinates: lon={lon}, lat={lat}, "
            f"error: {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Error checking liquefaction zone status for coordinates: lon={lon}, lat={lat}, "
            f"error: {str(e)}",
        )
