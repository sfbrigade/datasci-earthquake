"""Router to handle landslide-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter, Query
from typing import Optional
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from backend.database.session import get_db
from ..schemas.landslide_schemas import (
    InLandslideZoneView,
    LandslideFeature,
    LandslideFeatureCollection,
)
from backend.api.exceptions import HazardCheckError
from backend.api.models.landslide_zones import LandslideZone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/landslide-zones",
    tags=[Tags.LANDSLIDE],
)


@router.get("/", response_model=LandslideFeatureCollection)
def get_landslide_zones(db: Session = Depends(get_db)):
    """
    Retrieve all hazardous landslide zones (with gridcode 8, 9, 10) from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        LandslideFeatureCollection: A collection of all landslide zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all landslide zones
    landslide_zones = (
        db.query(LandslideZone).filter(LandslideZone.gridcode.in_([8, 9, 10])).all()
    )

    # If no zones are found, raise a 404 error
    if not landslide_zones:
        raise HTTPException(status_code=404, detail="No landslide zones found")

    features = [
        LandslideFeature.from_sqlalchemy_model(zone) for zone in landslide_zones
    ]
    return LandslideFeatureCollection(type="FeatureCollection", features=features)


@router.get("/is-in-landslide-zone", response_model=InLandslideZoneView)
def is_in_landslide_zone(
    lon: Optional[float] = Query(None, ge=-180, le=180),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    ping: bool = False,
    db: Session = Depends(get_db),
):
    """
    Check if a point is in a high-susceptibility landslide zone
    (gridcode 8, 9, or 10).

    Args:
        lon (Optional[float]): Longitude of the point.
        lat (Optional[float]): Latitude of the point.
        ping (bool): Optional ping parameter, used to reduce cold starts.
        db (Session): The database session dependency.

    Returns:
        InLandslideZoneView: Whether the point is in a hazardous landslide
        zone, its last update time, and its gridcode.

    Raises:
        HTTPException: 400 if lon/lat are missing and ping is not true.
        HazardCheckError: If the database query fails.
    """
    if ping:
        logger.info("Pinging the is-in-landslide-zone endpoint")
        return InLandslideZoneView(exists=False, last_updated=None, gridcode=None)

    if lon is None or lat is None:
        logger.warning("Missing coordinates in non-ping request")
        raise HTTPException(
            status_code=400,
            detail="Both 'lon' and 'lat' must be provided unless ping=true",
        )

    logger.info(f"Checking landslide zone for coordinates: lon={lon}, lat={lat}")

    try:
        point = from_shape(Point(lon, lat), srid=4326)
        zone = (
            db.query(LandslideZone)
            .filter(LandslideZone.gridcode.in_([8, 9, 10]))
            .filter(LandslideZone.geometry.ST_Intersects(point))
            .first()
        )
        exists = zone is not None
        last_updated = zone.update_timestamp if zone else None
        gridcode = zone.gridcode if zone else None

        logger.info(
            f"Landslide zone check result for coordinates: lon={lon}, lat={lat} - "
            f"exists: {exists}, "
            f"last_updated: {last_updated}, "
            f"gridcode: {gridcode}"
        )

        return InLandslideZoneView(
            exists=exists, last_updated=last_updated, gridcode=gridcode
        )

    except Exception as e:
        raise HazardCheckError(zone="landslide", lon=lon, lat=lat, original_exception=e)
