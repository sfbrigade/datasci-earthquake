"""Database schema to store addresses"""
from pydantic import BaseModel
from datetime import datetime
from .geo import PointModel


class AddressBase(BaseModel):
    eas_baseid: int
    eas_subid: int
    eas_fullid: str
    address: str
    unit_number: str
    address_number: int
    address_number_suffix: str
    street_name: str
    street_type: str
    parcel_number: str
    block: str
    lot: str
    cnn: int
    longitude: float
    latitude: float
    zip_code: int
    point: PointModel
    supdist: str
    supervisor: int
    supdistpad: str
    numbertext: str
    supname: str
    nhood: str
    complete_landmark_name: str
    sfdata_as_of: datetime
    sfdata_loaded_at: datetime


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    eas_fullid: str

    class Config:
        orm_mode = True
