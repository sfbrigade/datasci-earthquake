from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

MAPPED_COLUMN_STRING_LENGTH_LENGTH = 200


class SoftStoryProperties:
    """
    All data of the Soft Story table from SFData.
    """
    __tablename__ = "soft_story_properties"

    id: Mapped[int] = mapped_column(primary_key=True)
    block: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH_LENGTH))
    lot: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH_LENGTH))
    parcel_number: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH_LENGTH))
    property_address: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH_LENGTH))
    address: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH_LENGTH))
    tier: Mapped[int] = mapped_column
    status: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH_LENGTH))
    bos_district: int
    point: geometry(point, 4326)
    sfdata_as_of: timestamp
    sfdata_loaded_at: timestamp
    update_timestamp: Mapped[] = mapped_column()

    def __repr__(self) -> str:
        return f"<SoftStoryProperties(id={self.id!r}, 
            property_address={self.property_address!r})>"