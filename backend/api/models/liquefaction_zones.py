"""All data of the Liquefaction Zones table from SFData."""

from sqlalchemy import Integer, String, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from .base import Base


class LiquefactionZone(Base):
    """
    All data of the Liquefaction Zones table from SFData.
    Contains multipolygon geometries defining soil liquefaction zones as High (H) or
    Very High (VH) susceptibility.
    """

    __tablename__ = "liquefaction_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    susceptibility: Mapped[str] = mapped_column(String)
    shape_length: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<LiquefactionZone(id={self.identifier})>"
