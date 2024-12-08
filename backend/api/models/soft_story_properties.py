"""All data of the Soft Story table from SFData."""
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from .base import Base


_STRING_LENGTH = 255


class SoftStoryProperty(Base):
    """
    All data of the Soft Story table from SFData.

    Contains point geometries for properties.
    Used for spatial comparison to determine hazard zone overlaps.
    """

    __tablename__ = "soft_story_properties"

    identifier: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    block: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    lot: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    parcel_number: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    property_address: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    address: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=False)
    tier: Mapped[int] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    bos_district: Mapped[int] = mapped_column(Integer, nullable=True)
    point: Mapped[Geometry] = mapped_column(Geometry("POINT", srid=4326), nullable=True)
    sfdata_as_of: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    sfdata_loaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<SoftStoryProperty(id={self.identifier}, property_address={self.property_address})>"
