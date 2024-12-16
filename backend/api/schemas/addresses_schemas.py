from pydantic import BaseModel, Field
from backend.api.models.addresses import Address
from geojson_pydantic import Feature, FeatureCollection, Point
from geoalchemy2.shape import to_shape
from typing import List


class AddressProperties(BaseModel):
    """
    Pydantic model for address properties.

    Attributes:
        eas_fullid (str): Unique identifier for the address.
        address (str): Full address string.
    """

    eas_fullid: str
    address: str


class AddressFeature(Feature):
    """
    Pydantic model for an address feature, conforming to GeoJSON Feature structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "Feature".
        geometry (Point): The geographical point of the address.
        properties (AddressProperties): Additional properties of the address.
    """

    type: str = Field(default="Feature")  # type: ignore
    geometry: Point
    properties: AddressProperties

    class Config:
        from_attributes = True

    @staticmethod
    def from_sqlalchemy_model(address: Address):
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
    """
    Pydantic model for a collection of address features, conforming to GeoJSON FeatureCollection structure.

    Attributes:
        type (str): The type of GeoJSON object. Always "FeatureCollection".
        features (List[AddressFeature]): List of AddressFeature objects.
    """

    type: str = Field(default="FeatureCollection")  # type: ignore
    features: List[AddressFeature]
