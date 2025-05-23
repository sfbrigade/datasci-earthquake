import gzip
import requests
from requests import Response
from pathlib import Path
import json
import re
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class MapboxConfig:
    min_longitude: float
    min_latitude: float
    max_longitude: float
    max_latitude: float
    geocode_api_endpoint_url: str
    soft_story_geojson_path: Path
    api_key: str
    batch_limit: int = 1000
    post_request_result_limit: int = 1

    @property
    def bounding_box_string(self) -> str:
        return f"{self.min_longitude},{self.min_latitude},{self.max_longitude},{self.max_latitude}"


class _BatchMapboxGeocoder:
    _mapbox_config: MapboxConfig

    def __init__(self, mapbox_config: MapboxConfig):
        self._mapbox_config = mapbox_config

    def _build_address_request(self, address: str) -> Dict[str, Any]:
        """
        Builds a single address request for the Mapbox API
        """
        # Only use clean addresses to query mapbox but store original
        # address in the geojson
        clean_address = _BatchMapboxGeocoder._clean_address(address)

        # For consistency with the rest of the data, we assume here
        return {
            "types": ["address"],
            "q": clean_address,
            "limit": self._mapbox_config.post_request_result_limit,
            "bbox": self._mapbox_config.bounding_box_string,
        }

    def _post_request(self, batch_payload: List[Dict[str, Any]]) -> Response:
        """
        Sends a POST request to the Mapbox API with the batch payload
        """
        headers = {"Content-Type": "application/json"}
        params = {"access_token": self._mapbox_config.api_key, "permanent": "false"}

        response = requests.post(
            self._mapbox_config.geocode_api_endpoint_url,
            json=batch_payload,
            params=params,
            headers=headers,
        )

        # Raise an HTTPError if one occurred
        response.raise_for_status()
        return response

    @staticmethod
    def _clean_address(address: str) -> str:
        """
        Replaces address sub-strings so MapBox will return a result
        """
        # Remove leading zeros
        clean_address = re.sub(r"\b0+(\d)", r"\1", address)
        # Remove any text in parentheses
        clean_address = re.sub(r"\s*\([^)]*\)", "", clean_address)
        # BL to BOULEVARD
        clean_address = re.sub(r"\bBL\b", "BOULEVARD", clean_address)
        # TR to TERRACE
        clean_address = re.sub(r"\bTR\b", "TERRACE", clean_address)
        # AL to ALLEY
        clean_address = re.sub(r"\bAL\b", "ALLEY", clean_address)
        # WEST AV to AVENUE WEST
        clean_address = re.sub(r"\bWEST AV\b", "AVENUE WEST", clean_address)

        return clean_address

    def batch_geocode_addresses(self, addresses: List[str]) -> List[Dict[str, Any]]:
        """
        Geocodes a list of addresses in batches of _MAPBOX_BATCH_LIMIT
        addresses

        This limit is imposed by Mapbox.
        Returns a list of geojson features, with a property "sfdata_address"
        added to each feature
        """
        features = []
        for i in range(0, len(addresses), self._mapbox_config.batch_limit):
            batch_addresses = addresses[i : i + self._mapbox_config.batch_limit]
            batch_payload = [
                self._build_address_request(address) for address in batch_addresses
            ]
            response = self._post_request(batch_payload)

            batch_response = response.json().get("batch", [])

            if len(batch_response) != len(batch_addresses):
                raise ValueError(
                    "Number of batch addresses does not match number of batch responses"
                )

            # Update batch features with the SFData address, which will
            # be used to join the SFData soft story dataset
            for feature_collection, address in zip(batch_response, batch_addresses):
                if len(feature_collection["features"]) == 0:
                    feature_collection["features"].append({"properties": {}})
                for feature in feature_collection["features"]:
                    feature["properties"]["sfdata_address"] = address
                    features.append(feature)
        return features


class MapboxGeojsonManager:
    _mapbox_config: MapboxConfig
    _geocoder: _BatchMapboxGeocoder
    _mapbox_points: Dict[str, Optional[Tuple[float, float]]]

    def __init__(self, mapbox_config: MapboxConfig):
        self._mapbox_config = mapbox_config
        self._geocoder = _BatchMapboxGeocoder(self._mapbox_config)
        self._mapbox_points = self._get_mapbox_points()

    def _get_mapbox_points(self) -> Dict[str, Optional[Tuple[float, float]]]:
        """
        Parses the mapbox geojson file and return a dictionary mapping
        SFData addresses to their respective MapBox coordinates
        """
        if not self._mapbox_config.soft_story_geojson_path.exists():
            return {}

        with gzip.open(self._mapbox_config.soft_story_geojson_path, "rt") as f:
            soft_story_json = json.load(f)

        parsed_data: Dict[str, Optional[Tuple[float, float]]] = {}
        for feature in soft_story_json.get("features", []):
            properties = feature.get("properties", {})
            address = properties.get("sfdata_address")
            if address is None:
                raise ValueError("No address found in geojson's 'properties' field")
            if "coordinates" not in properties:
                parsed_data[address] = None
            else:
                longitude = properties["coordinates"]["longitude"]
                latitude = properties["coordinates"]["latitude"]
                parsed_data[address] = (longitude, latitude)

        return parsed_data

    def is_address_in_geojson(self, address: str) -> bool:
        """
        Returns True if the address exists in the geojson, otherwise
        False
        """
        return address in self._mapbox_points

    def get_mapbox_coordinates(self, address: str) -> Optional[Tuple[float, float]]:
        """
        Returns mapbox coordinates for this address if it exists in the
        geojson, otherwise None
        """
        return self._mapbox_points.get(address, None)

    def _parse_mapbox_features(
        self, features: List[Dict[str, Any]]
    ) -> Dict[str, Optional[Tuple[float, float]]]:
        """
        Parses the features from the Mapbox response and return a
        dictionary mapping addresses to their respective coordinates
        """
        coordinate_map: Dict[str, Optional[Tuple[float, float]]] = {}
        for feature in features:
            properties = feature["properties"]
            coordinates = properties.get("coordinates", {})
            if coordinates:
                longitude = float(coordinates["longitude"])
                latitude = float(coordinates["latitude"])
                coordinate_map[properties["sfdata_address"]] = (longitude, latitude)
            else:
                coordinate_map[properties["sfdata_address"]] = None

        return coordinate_map

    def _write_to_geojson(self, features: List[Dict[str, Any]]):
        """
        Writes the new features to a geojson file

        If the geojson file doesn't exist, it creates one with the
        given features.
        """
        # If file not found, create a new one
        if not self._mapbox_config.soft_story_geojson_path.exists():
            with gzip.open(self._mapbox_config.soft_story_geojson_path, "wt") as f:
                json.dump({"type": "FeatureCollection", "features": features}, f)
            return

        # Otherwise append
        with gzip.open(self._mapbox_config.soft_story_geojson_path, "rt") as f:
            soft_story_json = json.load(f)

        soft_story_json["features"] += features

        with gzip.open(self._mapbox_config.soft_story_geojson_path, "wt") as f:
            json.dump(soft_story_json, f)

    def batch_geocode_addresses(
        self, addresses: List[str]
    ) -> Dict[str, Optional[Tuple[float, float]]]:
        """
        Batch geocodes a list of addresses and update the geojson file
        with the new data
        """
        features = self._geocoder.batch_geocode_addresses(addresses)
        coordinates = self._parse_mapbox_features(features)

        self._write_to_geojson(features)

        return coordinates
