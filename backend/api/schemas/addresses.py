from pydantic import BaseModel, Field
from backend.api.models.addresses import Address
from geojson_pydantic import Feature, FeatureCollection, Point
from geoalchemy2.shape import to_shape
from typing import List


class AddressProperties(BaseModel):
    eas_fullid: str
    address: str


class AddressFeature(Feature):
    type: str = Field(default="Feature")  # type: ignore
    geometry: Point
    properties: AddressProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(address: Address):
        """Convert SQLAlchemy model to Pydantic AddressResponse"""
        # Extract coordinates from the Shapely Point
        coordinates = [
            address.point_as_shapely.x,
            address.point_as_shapely.y,
        ]  # Longitude, Latitude
        return AddressFeature(
            type="Feature",
            geometry={"type": "Point", "coordinates": coordinates},
            properties={
                "eas_fullid": address.eas_fullid,
                "address": address.address,
            },
        )


class AddressFeatureCollection(FeatureCollection):
    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[AddressFeature]
