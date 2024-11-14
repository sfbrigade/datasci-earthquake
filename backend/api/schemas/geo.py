from pydantic import BaseModel, Field


class Point(BaseModel):
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")


class Polygon(BaseModel):
    """
    Contains the vertices (and their relations) of a risk field.

    Complex pydantic object bounding which addresses are at
    risk of area-based perils and which ones are not.
    """

    pass
