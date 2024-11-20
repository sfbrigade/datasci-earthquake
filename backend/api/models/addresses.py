from sqlalchemy import Integer, String, Boolean, Float, DateTime, func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
from backend.api.models.base import Base

"""Data from https://data.sfgov.org/Geographic-Locations-and-Boundaries/Addresses-with-Units-Enterprise-Addressing-System/ramy-di5m/about_data"""


MAPPED_COLUMN_STRING_LENGTH = 255


class Address(Base):
    __tablename__ = "addresses"
    eas_baseid: Mapped[int] = mapped_column(Integer, nullable=False)  # str
    eas_subid: Mapped[int] = mapped_column(Integer, nullable=False)  # str
    eas_fullid: Mapped[str] = mapped_column(String, primary_key=True)
    address: Mapped[str] = mapped_column(String, nullable=False)
    unit_number: Mapped[str] = mapped_column(String)
    address_number: Mapped[int] = mapped_column(Integer, nullable=False)  # str
    address_number_suffix: Mapped[str] = mapped_column(String)
    street_name: Mapped[str] = mapped_column(String, nullable=False)
    street_type: Mapped[str] = mapped_column(String)
    parcel_number: Mapped[str] = mapped_column(String)
    block: Mapped[str] = mapped_column(String)
    lot: Mapped[str] = mapped_column(String)
    cnn: Mapped[int] = mapped_column(Integer)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)  # str
    latitude: Mapped[float] = mapped_column(Float, nullable=False)  # str
    zip_code: Mapped[int] = mapped_column(Integer, nullable=False)  # str
    point: Mapped[Geometry] = mapped_column(
        Geometry("POINT", srid=3395, spatial_index=True), nullable=False
    )
    supdist: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    supervisor: Mapped[int] = mapped_column(Integer)  # str
    # supdistpad: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    # numbertext: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    supname: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    nhood: Mapped[str] = mapped_column(
        String(MAPPED_COLUMN_STRING_LENGTH), nullable=False
    )
    # complete_landmark_name: Mapped[str] = mapped_column(
    #    String(MAPPED_COLUMN_STRING_LENGTH)
    # )
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
