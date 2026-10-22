from pydantic import BaseModel, ConfigDict, Field
from backend.api.models.landslide_zones import LandslideZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from geoalchemy2.shape import to_shape
from typing import List, Optional
import json
from datetime import datetime


class LandslideProperties(BaseModel):
    """
    Pydantic model for landslide properties.

    Attributes:
        identifier (int): Unique identifier for the landslide zone.
        gridcode (int): Represents the hazard level. Gridcode 8, 9, 10 indicate high-risk zones.
    """

    identifier: int
    gridcode: int
    update_timestamp: datetime


class LandslideFeature(Feature):
    """
    Pydantic model for a landslide feature, conforming to GeoJSON Feature structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "Feature".
        geometry (MultiPolygon): The geographical shape of the landslide zone.
        properties (LandslideProperties): Additional properties of the landslide zone.
    """

    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: LandslideProperties

    model_config = ConfigDict(from_attributes=True)

    @staticmethod
    def from_sqlalchemy_model(landslide_zone: LandslideZone):
        """
        Convert SQLAlchemy model to Pydantic LandslideFeature.

        Args:
            landslide_zone (LandslideZone): SQLAlchemy LandslideZone model instance.

        Returns:
            LandslideFeature: Pydantic model instance representing the landslide zone as a GeoJSON Feature.
        """
        return LandslideFeature(
            type="Feature",
            geometry=json.loads(landslide_zone.multipolygon_as_geosjon),
            properties={
                "identifier": landslide_zone.identifier,
                "gridcode": landslide_zone.gridcode,
                "update_timestamp": landslide_zone.update_timestamp,
            },
        )


class LandslideFeatureCollection(FeatureCollection):
    """
    Pydantic model for a collection of landslide features, conforming to GeoJSON FeatureCollection structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "FeatureCollection".
        features (List[LandslideFeature]): List of LandslideFeature objects.
    """

    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[LandslideFeature]


class InLandslideZoneView(BaseModel):
    """
    Pydantic View model for landslide zone check endpoint.

    Attributes:
        exists (bool): Whether the point is in a high-susceptibility landslide zone.
        last_updated (Optional[datetime]): Timestamp of last update if exists.
        gridcode (Optional[int]): Gridcode of the matched zone (8, 9, or 10).
    """

    exists: bool
    last_updated: Optional[datetime] = None
    gridcode: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
