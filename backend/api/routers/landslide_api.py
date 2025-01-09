"""Router to handle landslide-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from backend.database.session import get_db
from ..schemas.landslide_schemas import (
    LandslideFeature,
    LandslideFeatureCollection,
)
from backend.api.models.landslide_zones import LandslideZone

router = APIRouter(
    prefix="/landslide-zones",
    tags=[Tags.LANDSLIDE],
)


@router.get("/", response_model=LandslideFeatureCollection)
async def get_landslide_zones(db: Session = Depends(get_db)):
    """
    Retrieve all hazardous landslide zones (with gridcode 8, 9, 10) from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        LandslideFeatureCollection: A collection of all landslide zones as GeoJSON Features.

    Raises:
        HTTPException: If no zones are found (404 error).
    """
    # Query the database for all seismic zones
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
