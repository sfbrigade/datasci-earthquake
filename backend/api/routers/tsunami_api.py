"""Router to get tsunami risk"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.api.schemas.tsunami_schemas import TsunamiFeature, TsunamiFeatureCollection
from backend.api.models.tsunami import TsunamiZone


router = APIRouter(
    prefix="/tsunami",
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
