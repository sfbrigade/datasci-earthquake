"""Router to handle liquefaction-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2 import functions as geo_func
from backend.database.session import get_db
from ..schemas.liquefaction_schemas import (
    LiquefactionFeature,
    LiquefactionFeatureCollection,
)
from backend.api.models.liquefaction_zones import LiquefactionZone

router = APIRouter(
    prefix="/api/liquefaction-zones",
    tags=[Tags.LIQUEFACTION],
)


@router.get("", response_model=LiquefactionFeatureCollection)
async def get_liquefaction_zones(db: Session = Depends(get_db)):
    """
    Retrieve all liquefaction zones from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        LiquefactionFeatureCollection: A collection of all liquefaction zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all seismic zones
    liquefaction_zones = db.query(LiquefactionZone).all()

    # If no zones are found, raise a 404 error
    if not liquefaction_zones:
        raise HTTPException(status_code=404, detail="No liquefaction zones found")

    features = [
        LiquefactionFeature.from_sqlalchemy_model(zone) for zone in liquefaction_zones
    ]
    return LiquefactionFeatureCollection(type="FeatureCollection", features=features)


@router.get("/is-in-liquefaction-zone", response_model=bool)
async def is_in_liquefaction_zone(
    lon: float, lat: float, db: Session = Depends(get_db)
):
    """
    Check if a point is in a liquefaction zone.

    Args:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        db (Session): The database session dependency.

    Returns:
        bool: True if the point is in a liquefaction zone, False otherwise.
    """
    query = db.query(LiquefactionZone).filter(
        LiquefactionZone.geometry.ST_Contains(
            geo_func.ST_SetSRID(geo_func.ST_GeomFromText(f"POINT({lon} {lat})"), 4326)
        )
    )
    return db.query(query.exists()).scalar()
