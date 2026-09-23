from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class HazardStatus(BaseModel):
    """
    Pydantic model representing the status of a single hazard type at a location.

    Attributes:
        exists (bool): Whether the location is affected by this hazard.
        last_updated (Optional[datetime]): Timestamp of last update if exists.
        check_failed (bool): Whether this specific hazard check failed.
    """

    exists: bool
    last_updated: Optional[datetime] = None
    check_failed: bool = False

    model_config = ConfigDict(from_attributes=True)


class CompositeHazardResponse(BaseModel):
    """
    Pydantic model for the composite hazard lookup response, combining the
    status of all supported hazard types for a single location.

    Attributes:
        soft_story (HazardStatus): Soft story hazard status.
        liquefaction (HazardStatus): Liquefaction hazard status.
        tsunami (HazardStatus): Tsunami hazard status.
    """

    soft_story: HazardStatus
    liquefaction: HazardStatus
    tsunami: HazardStatus
