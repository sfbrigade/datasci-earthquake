"""Router to handle seismic-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2 import functions as geo_func
from backend.database.session import get_db
from ..schemas.seismic_schemas import (
    SeismicFeature,
    SeismicFeatureCollection,
)
from backend.api.models.seismic_hazard_zones import SeismicHazardZone

router = APIRouter(
    prefix="/seismic-zones",
    tags=[Tags.SEISMIC],
)


@router.get("/", response_model=SeismicFeatureCollection)
async def get_seismic_hazard_zones(db: Session = Depends(get_db)):
    """
    Retrieve all seismic zones from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        SeismicFeatureCollection: A collection of all seismic zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all seismic zones
    seismic_zones = db.query(SeismicHazardZone).all()

    # If no zones are found, raise a 404 error
    if not seismic_zones:
        raise HTTPException(status_code=404, detail="No seismic zones found")

    features = [SeismicFeature.from_sqlalchemy_model(zone) for zone in seismic_zones]
    return SeismicFeatureCollection(type="FeatureCollection", features=features)


@router.get("/is-in-seismic-zone", response_model=bool)
async def is_in_seismic_zone(lat: float, lon: float, db: Session = Depends(get_db)):
    """
    Check if a point is in a liquefaction zone.

    Args:
        lat (float): Latitude of the point.
        lon (float): Longitude of the point.
        db (Session): The database session dependency.

    Returns:
        bool: True if the point is in a liquefaction zone, False otherwise.
    """
    query = db.query(SeismicHazardZone).filter(
        SeismicHazardZone.geometry.ST_Contains(
            geo_func.ST_SetSRID(geo_func.ST_GeomFromText(f"POINT({lon} {lat})"), 4326)
        )
    )
    return db.query(query.exists()).scalar()
