"""Router to get tsunami risk"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2 import functions as geo_func
from backend.database.session import get_db
from backend.api.schemas.tsunami_schemas import TsunamiFeature, TsunamiFeatureCollection
from backend.api.models.tsunami import TsunamiZone


router = APIRouter(
    prefix="/tsunami-zones",
    tags=[Tags.TSUNAMI],
)


@router.get("/", response_model=TsunamiFeatureCollection)
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
    tsunami_zones = (
        db.query(TsunamiZone)
        .filter(TsunamiZone.evacuate == "Yes, Tsunami Hazard Area")
        .all()
    )
    print("tsunami zones:", tsunami_zones)
    if not tsunami_zones:
        raise HTTPException(status_code=404, detail="No tsunami zones found")
    features = [TsunamiFeature.from_sqlalchemy_model(zone) for zone in tsunami_zones]
    return TsunamiFeatureCollection(type="FeatureCollection", features=features)


@router.get("/is-in-tsunami-zone", response_model=bool)
async def is_in_tsunami_zone(lon: float, lat: float, db: Session = Depends(get_db)):
    """
    Check if a point is in a tsunami zone.

    Args:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        db (Session): The database session dependency.

    Returns:
        bool: True if the point is in a tsunami zone, False otherwise.
    """
    query = db.query(TsunamiZone).filter(
        TsunamiZone.geometry.ST_Contains(
            geo_func.ST_SetSRID(geo_func.ST_GeomFromText(f"POINT({lon} {lat})"), 4326)
        )
    )
    return db.query(query.exists()).scalar()
