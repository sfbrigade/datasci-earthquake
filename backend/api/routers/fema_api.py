"""Router to handle FEMA earthquake risk-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter, Query
from typing import Optional
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from backend.database.session import get_db
from ..schemas.fema_schemas import FemaZoneView
from backend.api.models.earthquake_risk import EarthquakeRisk
from backend.api.exceptions import HazardCheckError
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/fema",
    tags=[Tags.FEMA],
)


@router.get("/get-fema-zone", response_model=FemaZoneView)
def get_fema_zone(
    lon: Optional[float] = Query(None, ge=-180, le=180),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    ping: bool = False,
    db: Session = Depends(get_db),
):
    """
    Check if a point falls within a FEMA National Risk Index census tract
    and return its earthquake risk rating/score.

    Args:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        ping (bool): Optional ping parameter, used to reduce cold starts.
        db (Session): The database session dependency.

    Returns:
        FemaZoneView containing:
            - exists: True if point falls within a mapped census tract
            - last_updated: Timestamp of last update if exists, None otherwise
            - risk_rating: FEMA NRI earthquake risk rating if exists, None otherwise
            - risk_score: FEMA NRI earthquake risk score if exists, None otherwise

         If `ping=true` is passed, skips DB call and returns a dummy FemaZoneView instance.
    """
    if ping:
        logger.info("Pinging the get-fema-zone endpoint")
        return FemaZoneView(
            exists=False, last_updated=None, risk_rating=None, risk_score=None
        )  # skip DB call

    if lon is None or lat is None:
        logger.warning("Missing coordinates in non-ping request")
        raise HTTPException(
            status_code=400,
            detail="Both 'lon' and 'lat' must be provided unless ping=true",
        )

    logger.info(
        f"Checking FEMA earthquake risk zone for coordinates: lon={lon}, lat={lat}"
    )

    try:
        point = from_shape(Point(lon, lat), srid=4326)
        zone = (
            db.query(EarthquakeRisk)
            .filter(EarthquakeRisk.geometry.ST_Intersects(point))
            .first()
        )
        exists = zone is not None
        last_updated = zone.update_timestamp if zone else None
        risk_rating = zone.risk_rating if zone else None
        risk_score = zone.risk_score if zone else None

        logger.info(
            f"FEMA earthquake risk zone check result for coordinates: lon={lon}, lat={lat} - "
            f"exists: {exists}, "
            f"last_updated: {last_updated}, "
            f"risk_rating: {risk_rating}, "
            f"risk_score: {risk_score}"
        )

        return FemaZoneView(
            exists=exists,
            last_updated=last_updated,
            risk_rating=risk_rating,
            risk_score=risk_score,
        )

    except Exception as e:
        raise HazardCheckError(zone="fema", lon=lon, lat=lat, original_exception=e)
