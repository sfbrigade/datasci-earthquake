from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.session import get_db
import traceback
import logging 

from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.tsunami import TsunamiZone

from backend.api.schemas.composite_schema import CompositeHazardResponse, HazardStatus
from ..tags import Tags

router = APIRouter(
    prefix="/api/hazards",
    tags=[Tags.HAZARDS],
)

def check_hazard_exists(model: str, geom_column_name: str, lon: float, lat: float, db: dict):
    """
    Checks whether a hazard record exists at the given coordinates 
    for the specified SQLAlchemy model and returns its status and update timestamp. 

    Args:
        model (str): The SQLAlchemy ORM model representing a hazard dataset.
        geom_column_name (str): Name of the geometry column in the model.
        lon (float): Longitude of the point to check.
        lat (float): Latitude of the point to check.
        db (Session): Active SQLAlchemy database session.

    Returns:
        Tuple[bool, Optional[datetime]]:
            - exists (bool): True if a record exists at the given location.
            - last_updated (datetime or None): The update timestamp of the record if found, else None.
    """
    try:
        # Get the geometry column
        geom_column = getattr(model, geom_column_name)
        
        # Create point WKT
        point_wkt = f"POINT({lon} {lat})"
        
        # Query using ST_Intersects
        record = db.query(model).filter(geom_column.ST_Intersects(point_wkt)).first()
        
        exists = record is not None
        last_updated = getattr(record, "update_timestamp", None) if record else None
        
        return exists, last_updated
        
    except Exception as e:
        # Re-raise the exception to be caught by the main endpoint handler
        print(f"Error in check_hazard_exists for model {model.__name__}: {str(e)}")
        raise

@router.get("/lookup", response_model=CompositeHazardResponse)
def lookup_all_hazards(
    lon: float = Query(...),
    lat: float = Query(...),
    db: Session = Depends(get_db),
):
    try:
        logging.info(f"Looking up hazards for coordinates: lon={lon}, lat={lat}")
        
        # Check each hazard with the correct geometry column name
        soft_story_exists, soft_story_updated = check_hazard_exists(
            SoftStoryProperty, "point", lon, lat, db
        )
        logging.info(f"Soft story check complete: exists={soft_story_exists}, updated={soft_story_updated}")
        
        liquefaction_exists, liquefaction_updated = check_hazard_exists(
            LiquefactionZone, "geometry", lon, lat, db
        )
        logging.info(f"Liquefaction check complete: exists={liquefaction_exists}, updated={liquefaction_updated}")
        
        tsunami_exists, tsunami_updated = check_hazard_exists(
            TsunamiZone, "geometry", lon, lat, db
        )
        logging.info(f"Tsunami check complete: exists={tsunami_exists}, updated={tsunami_updated}")

        response = CompositeHazardResponse(
            soft_story = HazardStatus(exists=soft_story_exists, last_updated=soft_story_updated),
            liquefaction = HazardStatus(exists=liquefaction_exists, last_updated=liquefaction_updated),
            tsunami = HazardStatus(exists=tsunami_exists, last_updated=tsunami_updated),
        )
        
        logging.info(f"Returning response: {response}")
        return response

    except Exception as e:
        # Log the full error for debugging, but don't expose it to the client.
        error_detail = f"Error in lookup_all_hazards: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(error_detail) # Replace with proper logging
        raise HTTPException(status_code=500, detail="An internal server error occurred.")