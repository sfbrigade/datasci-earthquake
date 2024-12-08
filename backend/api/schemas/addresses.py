# backend/schemas/address.py
from pydantic import BaseModel
from datetime import datetime
from geoalchemy2 import Geometry
from backend.api.models.addresses import Address
from backend.api.schemas.geo import PointModel
from backend.api.schemas.base_geojson_models import (
    FeatureProperties,
    FeatureModel,
    FeatureCollectionModel,
)
from geoalchemy2.shape import to_shape
from typing import List
from pydantic import BaseModel, Field


class AddressProperties(FeatureProperties):
    eas_fullid: str
    address: str

    """class Config:
        orm_mode = True"""


class AddressResponse(FeatureModel):
    geometry: PointModel
    properties: AddressProperties

    @staticmethod
    def from_sqlalchemy_model(address: Address):
        """Convert SQLAlchemy model to Pydantic AddressResponse"""
        # Extract coordinates from the Shapely Point
        coordinates = [
            address.point_as_shapely.x,
            address.point_as_shapely.y,
        ]  # Longitude, Latitude
        return AddressResponse(
            type="Feature",
            geometry={"type": "Point", "coordinates": coordinates},
            properties={
                "eas_fullid": address.eas_fullid,
                "address": address.address,
            },
        )

    def to_dict(self):
        return {
            "type": self.type,
            "geometry": self.geometry.dict(),
            "properties": self.properties.dict(),
        }

    """class Config:
        orm_mode = True"""


"""class AddressesResponse(FeatureCollectionModel):
    features: List[AddressResponse]

    class Config:
        # orm_mode = True
        json_encoders = {
            AddressResponse: lambda v: v.dict(),
            PointModel: lambda v: v.dict(),
            AddressProperties: lambda v: v.dict(),
        }

"""


class AddressFeatureCollection(BaseModel):
    type: str = Field(default="FeatureCollection")
    features: List[AddressResponse]
