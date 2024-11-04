from sqlalchemy import Integer, String, Boolean, Float, DateTime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

"""Data from https://data.sfgov.org/Geographic-Locations-and-Boundaries/Addresses-with-Units-Enterprise-Addressing-System/ramy-di5m/about_data"""


MAPPED_COLUMN_STRING_LENGTH = 255


class Base(DeclarativeBase):
    pass


class Address(Base):
    __tablename__ = "address"
    eas_baseid: Mapped[int] = mapped_column(Integer, nullable=False)
    eas_subid: Mapped[int] = mapped_column(Integer, nullable=False)
    eas_fullid: Mapped[str] = mapped_column(String, primary_key=True)
    address: Mapped[str] = mapped_column(String, nullable=False)
    unit_number: Mapped[str] = mapped_column(String)
    address_number: Mapped[int] = mapped_column(Integer, nullable=False)
    address_number_suffix: Mapped[str] = mapped_column(String)
    street_name: Mapped[str] = mapped_column(String, nullable=False)
    street_type: Mapped[str] = mapped_column(String)
    parcel_number: Mapped[str] = mapped_column(String)
    block: Mapped[str] = mapped_column(String)
    lot: Mapped[str] = mapped_column(String)
    cnn: Mapped[int] = mapped_column(Integer)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    zip_code: Mapped[int] = mapped_column(Integer, nullable=False)
    """point: Mapped[Geometry] = mapped_column(
        Geometry("POINT", srid=4326, spatial_index=True), nullable=False
    )"""
    supdist: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    supervisor: Mapped[int] = mapped_column(Integer)
    supdistpad: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    numbertext: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    supname: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    nhood: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    complete_landmark_name: Mapped[str] = mapped_column(
        String(MAPPED_COLUMN_STRING_LENGTH)
    )
    sfdata_as_of: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    sfdata_loaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    def __repr__(self):
        return f"<Address(id={self.eas_fullid}, address='{self.address}'"
