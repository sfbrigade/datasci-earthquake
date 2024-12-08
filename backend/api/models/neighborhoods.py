"""Neighborhood boundaries in San Francisco"""
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from .base import Base


_STRING_LENGTH = 255


class Neighborhood(Base):
    """
    Stores neighborhood boundaries as multipolygon geometries.
    """

    __tablename__ = "neighborhoods"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    neighborhood: Mapped[str] = mapped_column(String(_STRING_LENGTH))
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<Neighborhood(id={self.identifier}>"
