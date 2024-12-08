"""Data from https://data.sfgov.org/Geographic-Locations-and-Boundaries/Addresses-with-Units-Enterprise-Addressing-System/ramy-di5m/about_data"""
from sqlalchemy import Integer, String, Boolean, Float, DateTime, func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
from backend.api.models.base import Base


_STRING_LENGTH = 255


class Address(Base):
    __tablename__ = "addresses"
    eas_fullid: Mapped[str] = mapped_column(String, primary_key=True)
    address: Mapped[str] = mapped_column(String, nullable=False)
    unit_number: Mapped[str] = mapped_column(String, nullable=True)
    address_number: Mapped[int] = mapped_column(Integer, nullable=False)  # str
    street_name: Mapped[str] = mapped_column(String, nullable=False)
    street_type: Mapped[str] = mapped_column(String, nullable=True)
    parcel_number: Mapped[str] = mapped_column(String, nullable=True)
    block: Mapped[str] = mapped_column(String, nullable=True)
    lot: Mapped[str] = mapped_column(String, nullable=True)
    cnn: Mapped[int] = mapped_column(Integer, nullable=True)
    longitude: Mapped[str] = mapped_column(Float, nullable=False)  # str
    latitude: Mapped[str] = mapped_column(Float, nullable=False)  # str
    zip_code: Mapped[int] = mapped_column(Integer, nullable=False)  # str
    point: Mapped[Geometry] = mapped_column(
        Geometry("POINT", srid=4326, spatial_index=True), nullable=False
    )
    supdist: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    supervisor: Mapped[int] = mapped_column(Integer, nullable=True)  # str
    supname: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=True)
    nhood: Mapped[str] = mapped_column(String(_STRING_LENGTH), nullable=False)
    sfdata_as_of: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    created_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self):
        return f"<Address(id={self.eas_fullid}, address='{self.address}, lot={self.lot}, point={self.point}, created_timestamp={self.created_timestamp}, update_timestamp={self.update_timestamp}')"
