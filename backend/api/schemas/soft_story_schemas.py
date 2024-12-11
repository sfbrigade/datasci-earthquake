from pydantic import BaseModel, Field
from backend.api.models.soft_story_properties import SoftStoryProperty
from geojson_pydantic import Feature, FeatureCollection, Point
from geoalchemy2.shape import to_shape
from typing import List
import json


class SoftStoryProperties(BaseModel):
    identifier: int


class SoftStoryFeature(Feature):
    type: str = Field(default="Feature")  # type: ignore
    geometry: Point
    properties: SoftStoryProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(soft_story: SoftStoryProperty):
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
            },
        )


class SoftStoryFeatureCollection(FeatureCollection):
    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[SoftStoryFeature]
