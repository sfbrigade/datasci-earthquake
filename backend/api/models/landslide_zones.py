"""All data of the Landslide Zones table from SFData"""

from sqlalchemy import Integer, DateTime, func, Float
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from backend.api.models.base import Base
from geoalchemy2.shape import to_shape
from shapely import to_geojson
from sqlalchemy.ext.hybrid import hybrid_property


class LandslideZone(Base):
    """
    All data of the Landslide Zones table from SFData

    Contains multipolygon geometries defining landslide zones
    """

    __tablename__ = "landslide_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    gridcode: Mapped[int] = mapped_column(Integer)
    sum_shape: Mapped[float] = mapped_column(Float)
    shape_length: Mapped[float] = mapped_column(Float)
    shape_length_1: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    @hybrid_property
    def multipolygon_as_geosjon(self):
        """Convert multipolygon to a geojson"""
        return to_geojson(to_shape(self.geometry))

    def __repr__(self) -> str:
        return f"<LandslideZone(id={self.identifier})>"
