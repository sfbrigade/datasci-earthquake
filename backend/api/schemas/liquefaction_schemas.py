from pydantic import BaseModel, Field
from backend.api.models.liquefaction_zones import LiquefactionZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from geoalchemy2.shape import to_shape
from typing import List
import json
from datetime import datetime


class LiquefactionProperties(BaseModel):
    """
    Pydantic model for liquefaction properties.

    Attributes:
        identifier (str): Unique identifier for the liquefaction zone.
        liq (str): Represents the level of susceptibility (High (H) or Very High (VH)).
    """

    identifier: str
    liq: str
    update_timestamp: datetime


class LiquefactionFeature(Feature):
    """
    Pydantic model for a liquefaction feature, conforming to GeoJSON Feature structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "Feature".
        geometry (MultiPolygon): The geographical shape of the liquefaction zone.
        properties (LiquefactionProperties): Additional properties of the liquefaction zone.
    """

    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: LiquefactionProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(liquefaction_zone: LiquefactionZone):
        """
        Convert SQLAlchemy model to Pydantic LiquefactionFeature.

        Args:
            liquefaction_zone (LiquefactionZone): SQLAlchemy LiquefactionZone model instance.

        Returns:
            LiquefactionFeature: Pydantic model instance representing the liquefaction zone as a GeoJSON Feature.
        """
        return LiquefactionFeature(
            type="Feature",
            geometry=json.loads(liquefaction_zone.multipolygon_as_geosjon),
            properties={
                "identifier": liquefaction_zone.identifier,
                "liq": liquefaction_zone.liq,
                "update_timestamp": liquefaction_zone.update_timestamp,
            },
        )


class LiquefactionFeatureCollection(FeatureCollection):
    """
    Pydantic model for a collection of liquefaction features, conforming to GeoJSON FeatureCollection structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "FeatureCollection".
        features (List[LiquefactionFeature]): List of LiquefactionFeature objects.
    """

    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[LiquefactionFeature]
