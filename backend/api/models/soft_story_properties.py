"""All data of the Soft Story table from SFData."""
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from .base import Base


STRING_LENGTH = 200


class SoftStoryProperty(Base):
    """
    All data of the Soft Story table from SFData.

    Contains point geometries for properties.
    Used for spatial comparison to determine hazard zone overlaps.
    """

    __tablename__ = "soft_story_properties"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True, 
                                            autoincrement=True)
    block: Mapped[str] = mapped_column(String(STRING_LENGTH))
    lot: Mapped[str] = mapped_column(String(STRING_LENGTH))
    parcel_number: Mapped[str] = mapped_column(String(STRING_LENGTH))
    property_address: Mapped[str] = mapped_column(String(STRING_LENGTH))
    address: Mapped[str] = mapped_column(String(STRING_LENGTH))
    tier: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(STRING_LENGTH))
    bos_district: Mapped[int] = mapped_column(Integer)
    point: Mapped[Geometry] = mapped_column(Geometry("POINT", srid=4326))
    sfdata_as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    sfdata_loaded_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True))
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<SoftStoryProperty(id={self.identifier}, property_address={self.property_address})>"
