from pydantic import BaseModel, Field
from typing import Tuple, List
from backend.api.schemas.base_geojson_models import GeometryModel


class PointModel(GeometryModel):
    type: str = Field(default="Point")
    coordinates: Tuple[float, float]  # Longitude, Latitude

    """class Config:
        orm_mode = True """


class MultiPolygonModel(GeometryModel):
    type: str = Field(default="MultiPolygon")
    coordinates: List[List[List[Tuple[float, float]]]]

    """class Config:
        orm_mode = True"""


class Polygon(BaseModel):
    """
    Contains the vertices (and their relations) of a risk field.

    Complex pydantic object bounding which addresses are at
    risk of area-based perils and which ones are not.
    """

    pass
