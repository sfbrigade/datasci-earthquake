"""Router to get seismic risk."""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from backend.database.session import get_db
from ..schemas.seismic_schemas import (
    SeismicFeature,
    SeismicFeatureCollection,
)
from backend.api.models.seismic_hazard_zones import SeismicHazardZone

router = APIRouter(
    prefix="/api/seismic",
    tags=[Tags.SEISMIC],
)


@router.get("/", response_model=SeismicFeatureCollection)
async def get_seismic_hazard_zones(db: Session = Depends(get_db)):
    # Query the database for all seismic zones
    seismic_zones = db.query(SeismicHazardZone).all()

    # If no zones are found, raise a 404 error
    if not seismic_zones:
        raise HTTPException(status_code=404, detail="No seismic zones found")

    features = [SeismicFeature.from_sqlalchemy_model(zone) for zone in seismic_zones]
    return SeismicFeatureCollection(type="FeatureCollection", features=features)
