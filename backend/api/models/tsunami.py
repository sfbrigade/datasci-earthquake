"""Tsunami Risk Zone data"""
from sqlalchemy import String, Integer, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from backend.api.models.base import Base


_STRING_LENGTH = 255


class TsunamiZone(Base):
    """
    All data of the Tsunami Hazard table from conservation.ca.gov
    """
    __tablename__ = "tsunami_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    evacuate: Mapped[str] = mapped_column(
        String(_STRING_LENGTH), nullable=False
    )
    county: Mapped[str] = mapped_column(
        String(_STRING_LENGTH), nullable=False
    )
    globalID: Mapped[str] = mapped_column(
        String(_STRING_LENGTH), nullable=False
    )
    shape_length: Mapped[float] = mapped_column(Float, nullable=True)
    shape_area: Mapped[float] = mapped_column(Float, nullable=True)
    geometry: Mapped[Geometry] = mapped_column(
        Geometry("MULTIPOLYGON", srid=4326), nullable=False
    )
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<TsunamiZone(id={self.identifier})>"
