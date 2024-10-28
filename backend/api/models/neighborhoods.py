"""Neighborhood boundaries in San Francisco"""

from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime, DateTime


MAPPED_COLUMN_STRING_LENGTH = 200


class Neighborhoods(DeclarativeBase):
    """
    Stores neighborhood boundaries as multipolygon geometries.
    """

    __tablename__ = "neighborhoods"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    neighborhood: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=datetime.utc_now
    )

    def __repr__(self) -> str:
        return f"<Neighborhoods(id={self.identifier}>"
