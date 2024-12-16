from pydantic import BaseModel, Field
from backend.api.models.seismic_hazard_zones import SeismicHazardZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from geoalchemy2.shape import to_shape
from typing import List
import json


class SeismicProperties(BaseModel):
    """
    Pydantic model for seismic zones' properties.

    Attributes:
        identifier (int): Unique identifier for the seismic zone.
    """

    identifier: int


class SeismicFeature(Feature):
    """
    Pydantic model for a seismic feature, conforming to GeoJSON Feature structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "Feature".
        geometry (MultiPolygon): The geographical shape of the seismic zone.
        properties (SeismicProperties): Additional properties of the seismic zone.
    """

    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: SeismicProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(seismic_hazard_zone: SeismicHazardZone):
        """
        Convert SQLAlchemy model to Pydantic SeismicFeature.

        Args:
            seismic_hazard_zone (SeismicHazardZone): SQLAlchemy SeismicHazardZone model instance.

        Returns:
            SeismicFeature: Pydantic model instance representing the seismic zone as a GeoJSON Feature.
        """
        return SeismicFeature(
            type="Feature",
            geometry=json.loads(seismic_hazard_zone.multipolygon_as_geosjon),
            properties={
                "identifier": seismic_hazard_zone.identifier,
            },
        )


class SeismicFeatureCollection(FeatureCollection):
    """
    Pydantic model for a collection of seismic features, conforming to GeoJSON FeatureCollection structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "FeatureCollection".
        features (List[SeismicFeature]): List of SeismicFeature objects.
    """

    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[SeismicFeature]
