from pydantic import BaseModel
from typing import Optional
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