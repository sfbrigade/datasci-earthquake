import requests
from requests import Response
from pathlib import Path
import json
from typing import List, Tuple, Dict, Any, Optional


_MAPBOX_GEOCODE_API_ENDPOINT = "https://api.mapbox.com/search/geocode/v6/batch"
_MAPBOX_SOFT_STORY_JSON = "etl/data/mapbox_soft_story.geojson"
_MAPBOX_BATCH_LIMIT = 1000


class _BatchMapboxGeocoder:
    url: str
    api_key: str

    def __init__(self, api_key: str):
        self.url = _MAPBOX_GEOCODE_API_ENDPOINT
        self.api_key = api_key

    def _build_address_request(self, address: str, limit: int) -> Dict[str, Any]:
        """
        Build a single address request for the Mapbox API.
        """
        # For consistency with the rest of the data, we assume here
        return {"types": ["address"], "q": address, "limit": limit}

    def _post_request(self, batch_payload: List[Dict[str, Any]]) -> Response:
        """
        Send a POST request to the Mapbox API with the batch payload.
        """
        headers = {"Content-Type": "application/json"}
        params = {"access_token": self.api_key, "permanent": "false"}

        response = requests.post(
            self.url, json=batch_payload, params=params, headers=headers
        )

        # Raise an HTTPError if one occurred
        response.raise_for_status()
        return response

    def batch_geocode_addresses(
        self, addresses: List[str], limit: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Geocode a list of addresses in batches of _MAPBOX_BATCH_LIMIT addresses. This limit is imposed by Mapbox.
        Returns a list of geojson features, with a property "sfdata_address" added to each feature.
        """
        features = []
        for i in range(0, len(addresses), _MAPBOX_BATCH_LIMIT):
            batch_addresses = addresses[i : i + _MAPBOX_BATCH_LIMIT]
            batch_payload = [
                self._build_address_request(address, limit)
                for address in batch_addresses
            ]
            response = self._post_request(batch_payload)

            batch_response = response.json().get("batch", [])

            if len(batch_response) != len(batch_addresses):
                raise ValueError(
                    "Number of batch addresses does not match number of batch responses"
                )

            # Update batch features with the SFData address, which will be used to join the SFData soft story dataset
            for feature_collection, address in zip(batch_response, batch_addresses):
                if len(feature_collection["features"]) == 0:
                    feature_collection["features"].append({"properties": {}})
                for feature in feature_collection["features"]:
                    feature["properties"]["sfdata_address"] = address
                    features.append(feature)
        return features


class MapboxGeojsonManager:
    geojson_file: Path
    geocoder: _BatchMapboxGeocoder
    mapbox_points: Dict[str, Optional[Tuple[float, float]]]

    def __init__(self, api_key: str):
        self.geojson_path = Path(_MAPBOX_SOFT_STORY_JSON)
        self.geocoder = _BatchMapboxGeocoder(api_key)
        self.mapbox_points = self._mapbox_points()

    def _mapbox_points(self) -> Dict[str, Optional[Tuple[float, float]]]:
        """
        Parse the mapbox geojson file and return a dictionary mapping SFData addresses to their respective MapBox coordinates.
        """
        with open(self.geojson_path, "r") as f:
            soft_story_json = json.load(f)

        parsed_data: Dict[str, Optional[Tuple[float, float]]] = {}
        for feature in soft_story_json.get("features", []):
            properties = feature.get("properties", {})
            address = properties.get("sfdata_address")
            if address is None:
                raise ValueError("No address found in geojson's 'properties' field")
            if properties is None:
                parsed_data[address] = None
            else:
                longitude = properties.get("longitude")
                latitude = properties.get("latitude")
                parsed_data[address] = (longitude, latitude)

        return parsed_data

    def get_mapbox_coordinates(self, address: str) -> Optional[Tuple[float, float]]:
        """
        Returns mapbox coordinates for this address if it exists in the geojson, otherwise None
        """
        return self.mapbox_points.get(address, None)

    def _parse_mapbox_features(
        self, features: List[Dict[str, Any]]
    ) -> Dict[str, Tuple[float, float]]:
        """
        Parse the features from the Mapbox response and return a dictionary mapping addresses to their respective coordinates.
        """
        coordinates = {}
        for feature in features:
            properties = feature["properties"]
            longitude = float(properties.get("longitude"))
            latitude = float(properties.get("latitude"))
            coordinates[properties["sfdata_address"]] = (longitude, latitude)
        return coordinates

    def write_to_geojson(self, features: List[Dict[str, Any]]):
        """
        Write the new features to a geojson file. If the geojson file doesn't exist, it creates one with the given features.
        """
        # If file not found, create a new one
        if not self.geojson_path.exists():
            with open(self.geojson_path, "w") as f:
                json.dump({"type": "FeatureCollection", "features": features}, f)
            return

        # Otherwise append
        with open(self.geojson_path, "r") as f:
            soft_story_json = json.load(f)

        soft_story_json["features"] += features

        with open(self.geojson_path, "w") as f:
            json.dump(soft_story_json, f)

    def batch_geocode_addresses(
        self, addresses: List[str]
    ) -> Dict[str, Tuple[float, float]]:
        """
        Batch geocode a list of addresses and update the geojson file with the new data.
        """
        features = self.geocoder.batch_geocode_addresses(addresses)
        coordinates = self._parse_mapbox_features(features)

        self.write_to_geojson(features)

        return coordinates
