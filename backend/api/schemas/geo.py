from pydantic import BaseModel, Field
from typing import Tuple


class PointModel(BaseModel):
    type: str = Field(default="Point")
    coordinates: Tuple[float, float]  # Longitude, Latitude


class Polygon(BaseModel):
    """
    Contains the vertices (and their relations) of a risk field.

    Complex pydantic object bounding which addresses are at
    risk of area-based perils and which ones are not.
    """

    pass
