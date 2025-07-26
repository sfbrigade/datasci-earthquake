from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.session import get_db
from geoalchemy2 import functions as geo_func

from backend.api.models.landslide_zones import LandslideZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.tsunami import TsunamiZone

from backend.api.schemas.landslide_schemas import (
    LandslideFeature,
    LandslideFeatureCollection,
)
from backend.api.schemas.liquefaction_schemas import (
    LiquefactionFeature,
    LiquefactionFeatureCollection,
    IsInLiquefactionZoneView,
)
from backend.api.schemas.soft_story_schemas import (
    SoftStoryFeature,
    SoftStoryFeatureCollection,
    IsSoftStoryPropertyView,
)
from backend.api.schemas.tsunami_schemas import (
    TsunamiFeature,
    TsunamiFeatureCollection,
    IsInTsunamiZoneView,
)
from backend.api.schemas.composite_schema import CompositeHazardResponse, HazardStatus
from ..tags import Tags

router = APIRouter(
    prefix="/api/hazards",
    tags=[Tags.HAZARDS],
)

def check_hazard_exists(model, lon, lat, db):
    """
    Checks whether a hazard record exists at the given coordinates 
    for the specified SQLAlchemy model and returns its status and update timestamp.

    Args:
        model: The SQLAlchemy ORM model representing a hazard dataset 
               (e.g., SoftStoryProperty, LiquefactionZone, TsunamiZone).
        lon (float): Longitude of the point to check.
        lat (float): Latitude of the point to check.
        db (Session): Active SQLAlchemy database session.

    Returns:
        Tuple[bool, Optional[datetime]]:
            - exists (bool): True if a record exists at the given location.
            - last_updated (datetime or None): The update timestamp of the record if found, else None.
    """
    geom = geo_func.ST_GeomFromText(f"POINT({lon} {lat})", 4326)
    record = db.query(model).filter(model.point == geom).first()
    return record is not None, getattr(record, "update_timestamp", None) if record else None

@router.get("/lookup", response_model=CompositeHazardResponse)
async def lookup_all_hazards(
    lon: float = Query(...),
    lat: float = Query(...),
    db: Session = Depends(get_db),
):
    try:
        # checks each hazard
        landslide_exists, landslide_updated = check_hazard_exists
        (LandslideZone, lon, lat, db)
        soft_story_exists, soft_story_updated = check_hazard_exists(SoftStoryProperty, lon, lat, db)
        liquefaction_exists, liquefaction_updated = check_hazard_exists(LiquefactionZone, lon, lat, db)
        tsunami_exists, tsunami_updated = check_hazard_exists(TsunamiZone, lon, lat, db)

        return CompositeHazardResponse(
            landslide = HazardStatus(exists = landslide_exists, 
            last_updated = landslide_updated),
            soft_story = HazardStatus(exists = soft_story_exists, last_updated=soft_story_updated),
            liquefaction = HazardStatus(exists = liquefaction_exists, last_updated = liquefaction_updated),
            tsunami = HazardStatus(exists = tsunami_exists, last_updated = tsunami_updated),
        )

    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))