"""Router to handle composite hazard lookups."""

from fastapi import Depends, HTTPException, APIRouter, Query
from typing import Callable, Optional
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2 import functions as geo_func
from geoalchemy2.shape import from_shape
from geoalchemy2.elements import WKBElement
from shapely.geometry import Point
from backend.database.session import get_db
from ..schemas.hazard_lookup_schemas import HazardStatus, CompositeHazardResponse
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.landslide_zones import LandslideZone
from backend.api.exceptions import HazardCheckError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/hazards",
    tags=[Tags.HAZARDS],
)

STATUS_NON_COMPLIANT = "non-compliant"

EMPTY_HAZARD_STATUS = HazardStatus(exists=False, last_updated=None)


def _check_soft_story(db: Session, point: WKBElement) -> HazardStatus:
    """Check whether a point is a non-compliant soft story property."""
    property = (
        db.query(SoftStoryProperty)
        .filter(geo_func.ST_DWithin(SoftStoryProperty.point, point, 0.000001))
        .first()
    )

    exists = False
    last_updated = None
    if property:
        last_updated = property.update_timestamp
        exists = (
            property.status is not None
            and property.status.lower() == STATUS_NON_COMPLIANT
        )

    return HazardStatus(exists=exists, last_updated=last_updated)


def _check_liquefaction(db: Session, point: WKBElement) -> HazardStatus:
    """Check whether a point is in a liquefaction zone."""
    zone = (
        db.query(LiquefactionZone)
        .filter(LiquefactionZone.geometry.ST_Intersects(point))
        .first()
    )
    return HazardStatus(
        exists=zone is not None,
        last_updated=zone.update_timestamp if zone else None,
    )


def _check_tsunami(db: Session, point: WKBElement) -> HazardStatus:
    """Check whether a point is in a tsunami zone."""
    zone = (
        db.query(TsunamiZone).filter(TsunamiZone.geometry.ST_Intersects(point)).first()
    )
    return HazardStatus(
        exists=zone is not None,
        last_updated=zone.update_timestamp if zone else None,
    )


def _check_landslide(db: Session, point: WKBElement) -> HazardStatus:
    """Check whether a point is in a high-susceptibility landslide zone."""
    zone = (
        db.query(LandslideZone)
        .filter(LandslideZone.gridcode.in_([8, 9, 10]))
        .filter(LandslideZone.geometry.ST_Intersects(point))
        .first()
    )
    return HazardStatus(
        exists=zone is not None,
        last_updated=zone.update_timestamp if zone else None,
    )


def _run_hazard_check(
    label: str,
    check: Callable[[Session, WKBElement], HazardStatus],
    db: Session,
    point: WKBElement,
) -> tuple[HazardStatus, Optional[Exception]]:
    try:
        return check(db, point), None
    except Exception as e:
        logger.exception("%s hazard check failed", label)
        return HazardStatus(exists=False, last_updated=None, check_failed=True), e


@router.get("/lookup", response_model=CompositeHazardResponse)
def lookup_hazards(
    lon: Optional[float] = Query(None, ge=-180, le=180),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    ping: bool = False,
    db: Session = Depends(get_db),
):
    """
    Look up all supported hazard types for a
    single location in one call.

    Args:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        ping (bool): Optional ping parameter, used to reduce cold starts.
        db (Session): The database session dependency.

    Returns:
        CompositeHazardResponse containing, for each hazard type:
            - exists: True if the point is affected by that hazard
            - last_updated: Timestamp of last update if exists, None otherwise

        If `ping=true` is passed, skips DB calls and returns a dummy
        CompositeHazardResponse with exists=False for every hazard type.
    """
    if ping:
        logger.info("Pinging the hazards lookup endpoint")
        return CompositeHazardResponse(
            soft_story=EMPTY_HAZARD_STATUS,
            liquefaction=EMPTY_HAZARD_STATUS,
            tsunami=EMPTY_HAZARD_STATUS,
            landslide=EMPTY_HAZARD_STATUS,
        )

    if lon is None or lat is None:
        logger.warning("Missing coordinates in non-ping request")
        raise HTTPException(
            status_code=400,
            detail="Both 'lon' and 'lat' must be provided unless ping=true",
        )

    logger.info(f"Checking composite hazards for coordinates: lon={lon}, lat={lat}")

    try:
        point = from_shape(Point(lon, lat), srid=4326)

        soft_story_status, soft_story_error = _run_hazard_check(
            "Soft story", _check_soft_story, db, point
        )
        liquefaction_status, liquefaction_error = _run_hazard_check(
            "Liquefaction", _check_liquefaction, db, point
        )
        tsunami_status, tsunami_error = _run_hazard_check(
            "Tsunami", _check_tsunami, db, point
        )
        landslide_status, landslide_error = _run_hazard_check(
            "Landslide", _check_landslide, db, point
        )

        check_errors = [
            soft_story_error,
            liquefaction_error,
            tsunami_error,
            landslide_error,
        ]
        if all(error is not None for error in check_errors):
            raise HazardCheckError(
                zone="composite",
                lon=lon,
                lat=lat,
                original_exception=check_errors[0],
            )

        logger.info(
            f"Composite hazard check result for coordinates: lon={lon}, lat={lat} - "
            f"soft_story exists: {soft_story_status.exists}, "
            f"liquefaction exists: {liquefaction_status.exists}, "
            f"tsunami exists: {tsunami_status.exists}, "
            f"landslide exists: {landslide_status.exists}"
        )

        return CompositeHazardResponse(
            soft_story=soft_story_status,
            liquefaction=liquefaction_status,
            tsunami=tsunami_status,
            landslide=landslide_status,
        )

    except HazardCheckError:
        raise
    except Exception as e:
        raise HazardCheckError(zone="composite", lon=lon, lat=lat, original_exception=e)
