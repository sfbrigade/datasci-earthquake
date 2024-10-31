"""PyDantic schemas for the database."""

from pydantic import BaseModel


class Polygon(BaseModel):
    """
    Contains the vertices (and their relations) of a risk field.

    Complex pydantic object bounding which addresses are at
    risk of area-based perils and which ones are not.
    """
    pass
