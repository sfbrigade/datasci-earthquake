from pydantic import BaseModel, Field
from backend.api.models.tsunami import TsunamiZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from typing import List
import json


class TsunamiProperties(BaseModel):
    identifier: int
    evacuate: str


class TsunamiFeature(Feature):
    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: TsunamiProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(tsunami_zone: TsunamiZone):
        return TsunamiFeature(
            type="Feature",
            geometry=json.loads(tsunami_zone.multipolygon_as_geosjon),
            properties={
                "identifier": tsunami_zone.identifier,
                "evacuate": tsunami_zone.evacuate,
            },
        )


class TsunamiFeatureCollection(FeatureCollection):
    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[TsunamiFeature]
