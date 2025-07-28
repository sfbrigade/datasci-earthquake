from pydantic import BaseModel, ConfigDict, Field
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon, Point
from geoalchemy2.shape import to_shape
from typing import List, Optional
import json
from datetime import datetime

class HazardStatus(BaseModel):
    """Pydantic view model for composite hazard API check endpoint.

    Attributes:
        exists (bool): Whether the point is in a liquefation, soft story, or tsunami zone
        last_updated (Optional[datetime]): Timestamp of last update if exists
    """
    exists: bool
    last_updated: Optional[datetime] = None

class CompositeHazardResponse(BaseModel):
    soft_story: HazardStatus
    liquefaction: HazardStatus
    tsunami: HazardStatus