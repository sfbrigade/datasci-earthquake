"""All data of the Seismic Hazard table from SFData"""

from sqlalchemy import Integer, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from backend.api.models.base import Base
from geoalchemy2.shape import to_shape
from shapely import to_geojson
from sqlalchemy.ext.hybrid import hybrid_property


class SeismicHazardZone(Base):
    """
    All data of the Seismic Hazard table from SFData

    Contains multipolygon geometries defining seismic hazard areas
    """

    __tablename__ = "seismic_hazard_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    @hybrid_property
    def multipolygon_as_geosjon(self):
        """Convert multipolygons to Shapely Point"""
        return to_geojson(to_shape(self.geometry))

    def __repr__(self) -> str:
        return f"<SeismicHazardZone(id={self.identifier})>"
