from pydantic import BaseModel, ConfigDict, Field
from backend.api.models.soft_story_properties import SoftStoryProperty
from geojson_pydantic import Feature, FeatureCollection, Point
from geoalchemy2.shape import to_shape
from typing import List, Optional
from datetime import datetime


class SoftStoryProperties(BaseModel):
    """
    Pydantic model for soft story properties.

    Attributes:
        identifier (int): Unique identifier for the soft story address.
    """

    identifier: int
    update_timestamp: datetime


class SoftStoryFeature(Feature):
    """
    Pydantic model for an soft story feature, conforming to GeoJSON Feature structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "Feature".
        geometry (Point): The geographical point of the soft story address.
        properties (SoftStoryProperties): Additional properties of the soft story.
    """

    type: str = Field(default="Feature")  # type: ignore
    geometry: Point
    properties: SoftStoryProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(soft_story: SoftStoryProperty):
        """
        Convert SQLAlchemy model to Pydantic SoftStoryFeature.

        Args:
            soft_story (SoftStoryProperty): SQLAlchemy SoftStoryProperty model instance.

        Returns:
            SoftStoryFeature: Pydantic model instance representing the soft story property as a GeoJSON Feature.
        """
        # Extract coordinates from the Shapely Point
        coordinates = [
            soft_story.point_as_shapely.x,
            soft_story.point_as_shapely.y,
        ]
        return SoftStoryFeature(
            type="Feature",
            geometry={"type": "Point", "coordinates": coordinates},
            properties={
                "identifier": soft_story.identifier,
                "update_timestamp": soft_story.update_timestamp,
            },
        )


class SoftStoryFeatureCollection(FeatureCollection):
    """
    Pydantic model for a collection of soft story features, conforming to GeoJSON FeatureCollection structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "FeatureCollection".
        features (List[SoftStoryFeature]): List of SoftStoryFeature objects.
    """

    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[SoftStoryFeature]


class IsSoftStoryPropertyView(BaseModel):
    """Pydantic view model for soft story property check endpoint.

    Attributes:
        exists (bool): Whether the point is in a soft story property
        last_updated (Optional[datetime]): Timestamp of last update if exists
    """

    exists: bool
    last_updated: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
