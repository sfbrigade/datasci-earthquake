"""All data of the Liquefaction Zones table from SFData"""

from sqlalchemy import Integer, String, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from backend.api.models.base import Base
from geoalchemy2.shape import to_shape
from shapely import to_geojson
from sqlalchemy.ext.hybrid import hybrid_property


class LiquefactionZone(Base):
    """
    All data of the Liquefaction Zones table from SFData

    Contains multipolygon geometries defining soil liquefaction zones
    as High (H) or Very High (VH) susceptibility
    """

    __tablename__ = "liquefaction_zones"

    identifier: Mapped[str] = mapped_column(String, primary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    liq: Mapped[str] = mapped_column(String)
    shape_length: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    @hybrid_property
    def multipolygon_as_geosjon(self):
        """Convert multipolygons to a geojson"""
        return to_geojson(to_shape(self.geometry))

    def __repr__(self) -> str:
        return f"<LiquefactionZone(id={self.identifier})>"
