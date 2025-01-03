from http.client import HTTPException
from backend.etl.data_handler import DataHandler
from backend.api.models.soft_story_properties import SoftStoryProperty
from typing import List, Tuple, Dict, Any
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os
import requests


_SOFT_STORY_PROPERTIES_URL = "https://data.sfgov.org/resource/beah-shgi.geojson"
_MAPBOX_GEOCODE_API = "https://api.mapbox.com/search/geocode/v6/batch"
_MAPBOX_BATCH_LIMIT = 1000


class _SoftStoryPropertiesMapboxHandler:
    url: str
    api_key: str

    def __init__(self, url, api_key):
        self.url = url
        self.api_key = api_key

    def _parse_response(self, response: Dict[str, Any]) -> List[Tuple[float, float]]:
        """
        Truncated example response:

        {
        "batch": [
          {
            "type": "FeatureCollection",
            "features": [
                {
                "type": "Feature",
                "id": "dXJuOm1ieGFkcjo2YzdhYjM4Yi05YzM4LTQ3ZDItODFkMS1jYzZlYjg5YzliMWM",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-77.03655, 38.89768]
                },
                "properties": {
                    "mapbox_id": "dXJuOm1ieGFkcjo2YzdhYjM4Yi05YzM4LTQ3ZDItODFkMS1jYzZlYjg5YzliMWM",
                    "feature_type": "address",
                    "name": "1600 Pennsylvania Avenue Northwest",
                    "coordinates": {
                    "longitude": -77.03655,
                    "latitude": 38.89768,
                    "accuracy": "rooftop"
                },
                ...
            ]
         }],
        }
        """
        coordinates = []
        for address in response.get("batch"):
            features = address.get("features")
            # features is a one-element list
            properties = features[0].get("properties")
            longitude = float(properties.get("longitude"))
            latitude = float(properties.get("latitude"))
            coordinates.append((longitude, latitude))
        return coordinates

    def _build_request(self, address: str, limit: int) -> Dict[str, Any]:
        return {"types": ["address"], "q": address, "limit": limit}

    def _make_request(self, batch_payload: List[Dict[str, Any]]) -> str:
        # Make the POST request
        headers = {"Content-Type": "application/json"}
        params = {"access_token": self.api_key, "permanent": "false"}

        response = requests.post(
            self.url, json=batch_payload, params=params, headers=headers
        )

        # Raise an HTTPError if one occurred
        response.raise_for_status()
        return response

    def batch_addresses(
        self, addresses: List[str], limit: int = 1
    ) -> List[Tuple[float, float]]:
        coordinates = []
        for i in range(0, len(addresses), _MAPBOX_BATCH_LIMIT):
            batch_addresses = addresses[i : i + _MAPBOX_BATCH_LIMIT]
            batch_payload = [
                self._build_request(address, limit) for address in batch_addresses
            ]
            response = self._make_request(batch_payload)
            coordinates += self._parse_response(response.json())

        return coordinates


class _SoftStoryPropertiesDataHandler(DataHandler):
    """
    Fetches, parses and loads SF tsunami data from
    data.sfgov.org
    """

    def __init__(self, url: str, table: DeclarativeMeta, api_key: str):
        self.mapbox_handler = _SoftStoryPropertiesMapboxHandler(
            _MAPBOX_GEOCODE_API, api_key
        )
        super().__init__(url, table)

    def parse_data(self, data: dict) -> list[dict]:
        """
        Extracts feature attributes and geometry data to construct a
        list of dictionaries.

        Each dictionary represents a row for the database table.
        Geometry data is converted into a GeoAlchemy-compatible
        Point with srid 4326.
        """
        parsed_data = []
        for feature in data["features"]:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            if geometry:
                geom_longitude, geom_latitude = geometry["coordinates"]
            parsed_data.append(
                {
                    "block": properties.get("block"),
                    "lot": properties.get("lot"),
                    "parcel_number": properties.get("parcel_number"),
                    "property_address": properties.get("property_address"),
                    "address": properties.get("address"),
                    "tier": properties.get("tier"),
                    "status": properties.get("status"),
                    "bos_district": properties.get("bos_district"),
                    "point": (
                        f"Point({geom_longitude} {geom_latitude})" if geometry else None
                    ),
                    "sfdata_as_of": properties.get("data_as_of"),
                    "sfdata_loaded_at": properties.get("data_loaded_at"),
                }
            )

        addresses = [property.get("address") for property in properties]
        coordinates = self.mapbox_handler.batch_addresses(addresses)
        for data_point, (longitude, latitude) in zip(parsed_data, coordinates):
            data_point["mapbox_point"] = f"Point({longitude} {latitude})"

        return parsed_data


if __name__ == "__main__":
    load_dotenv()

    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL,
        SoftStoryProperty,
        os.env["NEXT_PUBLIC_MAPBOX_TOKEN"],
    )
    try:
        soft_story_properties = handler.fetch_data()
        soft_story_property_objects = handler.parse_data(soft_story_properties)
        handler.bulk_insert_data_autoincremented(soft_story_property_objects)
    except HTTPException as e:
        print(f"Failed after retries: {e}")
