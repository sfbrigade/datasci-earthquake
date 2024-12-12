from pydantic import BaseModel, Field
from backend.api.models.liquefaction_zones import LiquefactionZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from geoalchemy2.shape import to_shape
from typing import List
import json


class LiquefactionProperties(BaseModel):
    identifier: int
    liq: str


class LiquefactionFeature(Feature):
    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: LiquefactionProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(liquefaction_zone: LiquefactionZone):
        return LiquefactionFeature(
            type="Feature",
            geometry=json.loads(liquefaction_zone.multipolygon_as_geosjon),
            properties={
                "identifier": liquefaction_zone.identifier,
                "liq": liquefaction_zone.liq,
            },
        )


class LiquefactionFeatureCollection(FeatureCollection):
    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[LiquefactionFeature]
