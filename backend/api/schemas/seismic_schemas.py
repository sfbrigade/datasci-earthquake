from pydantic import BaseModel, Field
from backend.api.models.seismic_hazard_zones import SeismicHazardZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from geoalchemy2.shape import to_shape
from typing import List
import json


class SeismicProperties(BaseModel):
    identifier: int


class SeismicFeature(Feature):
    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: SeismicProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(seismic_hazard_zone: SeismicHazardZone):
        return SeismicFeature(
            type="Feature",
            geometry=json.loads(seismic_hazard_zone.multipolygon_as_geosjon),
            properties={
                "identifier": seismic_hazard_zone.identifier,
            },
        )


class SeismicFeatureCollection(FeatureCollection):
    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[SeismicFeature]
