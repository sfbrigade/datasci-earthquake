from pydantic import BaseModel, ConfigDict, Field
from backend.api.models.tsunami import TsunamiZone
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from typing import List, Optional
import json
from datetime import datetime


class TsunamiProperties(BaseModel):
    """
    Pydantic model for tsunami zones' properties.

    Attributes:
        identifier (int): Unique identifier for the tsunami zone.
        evacuate (str): indicates whether the zone requires evacuation in the event of a tsunami
    """

    identifier: int
    evacuate: str
    update_timestamp: datetime


class TsunamiFeature(Feature):
    """
    Pydantic model for a tsunami feature, conforming to GeoJSON Feature structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "Feature".
        geometry (MultiPolygon): The geographical shape of the tsunami zone.
        properties (TsunamiProperties): Additional properties of the tsunami zone.
    """

    type: str = Field(default="Feature")  # type: ignore
    geometry: MultiPolygon
    properties: TsunamiProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(tsunami_zone: TsunamiZone):
        """
        Convert SQLAlchemy model to Pydantic TsunamiFeature.

        Args:
            tsunami_zone (TsunamiZone): SQLAlchemy TsunamiZone model instance.

        Returns:
            TsunamiFeature: Pydantic model instance representing the tsunami zone as a GeoJSON Feature.
        """
        return TsunamiFeature(
            type="Feature",
            geometry=json.loads(tsunami_zone.multipolygon_as_geosjon),
            properties={
                "identifier": tsunami_zone.identifier,
                "evacuate": tsunami_zone.evacuate,
                "update_timestamp": tsunami_zone.update_timestamp,
            },
        )


class TsunamiFeatureCollection(FeatureCollection):
    """
    Pydantic model for a collection of tsunami features, conforming to GeoJSON FeatureCollection structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "FeatureCollection".
        features (List[TsunamiFeature]): List of TsunamiFeature objects.
    """

    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[TsunamiFeature]


class IsInTsunamiZoneView(BaseModel):
    """
    Pydantic View model for tsunami zone check endpoint.

    Attributes:
        exists (bool): Whether the point is in a tsunami zone
        last_updated (Optional[datetime]): Timestamp of last update if exists
    """

    exists: bool
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
