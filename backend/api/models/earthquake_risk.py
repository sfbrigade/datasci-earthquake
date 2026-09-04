"""FEMA National Risk Index earthquake risk data, San Francisco census tracts"""

from sqlalchemy import String, Float, DateTime, func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from backend.api.models.base import Base
from geoalchemy2.shape import to_shape
from shapely import to_geojson
from sqlalchemy.ext.hybrid import hybrid_property


class EarthquakeRisk(Base):
    """
    FEMA National Risk Index (NRI) earthquake risk data for San Francisco
    census tracts.

    Contains multipolygon geometries of census tracts along with their
    earthquake hazard risk score (ERQK_RISKS, a 0-100 national percentile)
    and risk rating (ERQK_RISKR, e.g. "Relatively Low", "Very High").
    """

    __tablename__ = "earthquake_risk"

    tract_fips: Mapped[str] = mapped_column(String, primary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)
    risk_rating: Mapped[str] = mapped_column(String, nullable=True)
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    @hybrid_property
    def multipolygon_as_geosjon(self):
        """Convert multipolygons to a geojson"""
        return to_geojson(to_shape(self.geometry))

    def __repr__(self) -> str:
        return f"<EarthquakeRisk(tract_fips={self.tract_fips})>"
