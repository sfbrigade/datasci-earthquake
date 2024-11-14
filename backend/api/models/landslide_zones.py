"""All data of the Landslide Zones table from SFData."""


from sqlalchemy import String, Integer, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from .base import Base


class LandslideZone(Base):
    """
    All data of the Landslide Zones table from SFData.
    Contains multipolygon geometries defining landslide zones.
    """

    __tablename__ = "landslide_zones"

    identifier: Mapped[int] = mapped_column(Integerprimary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    gridcode: Mapped[int] = mapped_column(Integer)
    sum_shape: Mapped[float] = mapped_column(Float)
    shape_length: Mapped[float] = mapped_column(Float)
    created_us: Mapped[str] = mapped_column(String)
    created_da: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_edited: Mapped[str] = mapped_column(String)
    last_edi_1: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    shape_Le_1: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<LandslideZones(id={self.identifier})>"
