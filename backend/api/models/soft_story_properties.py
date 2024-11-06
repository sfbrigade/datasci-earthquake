"""All data of the Soft Story table from SFData."""

from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime, DateTime
from .base import Base

MAPPED_COLUMN_STRING_LENGTH = 200


class SoftStoryProperty(Base):
    """
    All data of the Soft Story table from SFData.

    Contains point geometries for properties.
    Used for spatial comparison to determine hazard zone overlaps.
    """

    __tablename__ = "soft_story_property"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    block: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    lot: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    parcel_number: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    property_address: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    address: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    tier: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    bos_district: Mapped[int] = mapped_column(Integer)
    point: Mapped[Geometry] = mapped_column(Geometry("POINT", srid=4326))
    sfdata_as_of: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=datetime.utcnow
    )
    sfdata_loaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=datetime.utcnow
    )
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<SoftStoryProperty(id={self.identifier}, property_address={self.property_address})>"
