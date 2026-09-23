from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import json
from geojson_pydantic import Feature, FeatureCollection, MultiPolygon
from backend.api.models.earthquake_risk import EarthquakeRisk


class FemaProperties(BaseModel):
    tract_fips: str
    fema_risk_rating: Optional[str] = None
    fema_risk_score: Optional[float] = None


class FemaFeature(Feature):
    geometry: MultiPolygon
    properties: FemaProperties

    @staticmethod
    def from_sqlalchemy_model(zone: EarthquakeRisk):
        return FemaFeature(
            type="Feature",
            geometry=json.loads(zone.multipolygon_as_geosjon),
            properties=FemaProperties(
                tract_fips=zone.tract_fips,
                fema_risk_rating=zone.risk_rating,
                fema_risk_score=zone.risk_score,
            ),
        )


class FemaFeatureCollection(FeatureCollection):
    features: list[FemaFeature]


class FemaZoneView(BaseModel):
    """
    Pydantic View model for the FEMA earthquake risk zone check endpoint.

    Attributes:
        exists (bool): Whether the point falls within a mapped census tract
        last_updated (Optional[datetime]): Timestamp of last update if exists
        risk_rating (Optional[str]): FEMA NRI earthquake risk rating (e.g. "Very High")
        risk_score (Optional[float]): FEMA NRI earthquake risk score (0-100 national percentile)
    """

    exists: bool
    last_updated: Optional[datetime] = None
    risk_rating: Optional[str] = None
    risk_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
