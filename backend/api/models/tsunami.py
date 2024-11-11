"""Tsunami Risk Zone data"""

from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime, DateTime


MAPPED_COLUMN_STRING_LENGTH = 200


class TsunamiZones(DeclarativeBase):
    """
    All data of the Tsunami Hazard table from conservation.ca.gov.
    """

    __tablename__ = "tsunami_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    evacuate: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    county: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    gis_link: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    kmz_link: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    map_link: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    label: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    shape_length: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    # This data is ingested as PolygonZ but should be stored as MultiPolygon
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<TsunamiZones(id={self.identifier})>"
