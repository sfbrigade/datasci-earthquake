"""CRUD for soft story properties"""

from fastapi import APIRouter, HTTPException, Depends
from ..tags import Tags
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.api.schemas.soft_story_schemas import (
    SoftStoryFeature,
    SoftStoryFeatureCollection,
)
from backend.api.models.soft_story_properties import SoftStoryProperty

router = APIRouter(
    prefix="/api/soft-stories",
    tags=[Tags.SOFT_STORY],
)


@router.get("/", response_model=SoftStoryFeatureCollection)
async def get_soft_stories(db: Session = Depends(get_db)):
    soft_stories = (
        db.query(SoftStoryProperty).filter(SoftStoryProperty.point.isnot(None)).all()
    )
    # If no soft story properties are found, raise a 404 error
    if not soft_stories:
        raise HTTPException(status_code=404, detail="No soft stories found")

    features = [SoftStoryFeature.from_sqlalchemy_model(story) for story in soft_stories]
    return SoftStoryFeatureCollection(type="FeatureCollection", features=features)
