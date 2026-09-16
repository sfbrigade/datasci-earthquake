from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class FemaZoneView(BaseModel):
    """
    Pydantic View model for the FEMA earthquake risk zone check endpoint.

    Attributes:
        exists (bool): Whether the point falls within a mapped census tract
        last_updated (Optional[datetime]): Timestamp of last update if exists
        risk_rating (Optional[str]): FEMA NRI earthquake risk rating (e.g. "Very High")
        risk_score (Optional[float]): FEMA NRI earthquake risk score (0-100 national percentile)
    """

    exists: bool
    last_updated: Optional[datetime] = None
    risk_rating: Optional[str] = None
    risk_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
