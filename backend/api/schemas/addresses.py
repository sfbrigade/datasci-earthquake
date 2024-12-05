# backend/schemas/address.py
from pydantic import BaseModel
from datetime import datetime
from geoalchemy2 import Geometry
from backend.api.models.addresses import Address
from backend.api.schemas.geo import PointModel


class AddressResponse(BaseModel):
    eas_fullid: str
    address: str
    zip_code: int
    point: PointModel

    @staticmethod
    def from_sqlalchemy_model(address: Address):
        """Convert SQLAlchemy model to Pydantic AddressResponse"""
        point_geometry = address.point_as_shapely
        return AddressResponse(
            eas_fullid=address.eas_fullid,
            address=address.address,
            zip_code=address.zip_code,
            point=PointModel(coordinates=(point_geometry.x, point_geometry.y)),
        )

    class Config:
        orm_mode = True
