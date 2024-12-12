from pydantic import BaseModel, Field
from backend.api.models.landslide_zones import LandslideZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from geoalchemy2.shape import to_shape
from typing import List
import json


class LandslideProperties(BaseModel):
    identifier: int
    gridcode: int


class LandslideFeature(Feature):
    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: LandslideProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(landslide_zone: LandslideZone):
        return LandslideFeature(
            type="Feature",
            geometry=json.loads(landslide_zone.multipolygon_as_geosjon),
            properties={
                "identifier": landslide_zone.identifier,
                "gridcode": landslide_zone.gridcode,
            },
        )


class LandslideFeatureCollection(FeatureCollection):
    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[LandslideFeature]
