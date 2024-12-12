"""Router to get liquefaction risk."""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
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


@router.get("/", response_model=LiquefactionFeatureCollection)
async def get_liquefaction_zones(db: Session = Depends(get_db)):
    # Query the database for all seismic zones
    liquefaction_zones = db.query(LiquefactionZone).all()

    # If no zones are found, raise a 404 error
    if not liquefaction_zones:
        raise HTTPException(status_code=404, detail="No liquefaction zones found")

    features = [
        LiquefactionFeature.from_sqlalchemy_model(zone) for zone in liquefaction_zones
    ]
    return LiquefactionFeatureCollection(type="FeatureCollection", features=features)
