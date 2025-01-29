from http.client import HTTPException
from typing import Type, Dict, Tuple
from backend.etl.data_handler import DataHandler
from backend.api.models.soft_story_properties import SoftStoryProperty
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os
from typing import Dict, Tuple
from backend.etl.mapbox_geojson_manager import MapboxConfig, MapboxGeojsonManager
from backend.api.models.base import ModelType
import json
from pathlib import Path


_SOFT_STORY_PROPERTIES_URL = "https://data.sfgov.org/resource/beah-shgi.geojson"
_MAPBOX_GEOCODE_API_ENDPOINT_URL = "https://api.mapbox.com/search/geocode/v6/batch"
_MAPBOX_SOFT_STORY_GEOJSON_PATH = "backend/etl/data/mapbox_soft_story.geojson"
_DEBUG_DATA_PATH = "backend/etl/data/debug_soft_story_data.json"


class _SoftStoryPropertiesDataHandler(DataHandler):
    """
    Fetches, parses and loads SF tsunami data from
    data.sfgov.org
    """

    def __init__(self, url: str, table: Type[ModelType], mapbox_api_key: str):
        self.mapbox_geojson_manager = MapboxGeojsonManager(api_key=mapbox_api_key)
        super().__init__(url, table)

    def fill_in_missing_mapbox_points(
        self, parsed_data: list[dict], addresses: list[str]
    ):
        """
        Tries to fix the mapbox_point fields that were not in
        the geojson by batch geocoding these addresses
        """
        if not addresses:
            return parsed_data

        mapbox_coordinates_map: Dict[str, Tuple[float, float]] = (
            self.mapbox_geojson_manager.batch_geocode_addresses(addresses)  # type: ignore
        )

        for data_point in parsed_data:
            if (
                data_point["point_source"] != "mapbox"
                and data_point["address"] in mapbox_coordinates_map
                and mapbox_coordinates_map[data_point["address"]]
            ):
                # mapbox_coordinates_map only contains the addresses that MapBox could resolve, so not all addresses will be there
                address = data_point["address"]
                lon, lat = mapbox_coordinates_map[address]
                data_point["point"] = f"Point({lon} {lat})"
                data_point["point_source"] = "mapbox"

        return parsed_data

    def parse_data(self, sf_data: dict) -> list[dict]:
        """
        Extracts feature attributes and geometry data to construct a
        list of dictionaries

        Each dictionary represents a row for the database table.
        Geometry data is converted into a GeoAlchemy-compatible
        Point with srid 4326.
        """
        parsed_data, addresses = [], []
        for feature in sf_data["features"]:
            properties = feature.get("properties", {})
            sf_geometry = feature.get("geometry", {})

            # Search for the address in the mapbox geojson.
            # If it's not there, it might be new, so get it
            # from MapBox freshly.
            if not self.mapbox_geojson_manager.is_address_in_geojson(
                properties.get("address")
            ):
                # Save it for one big later MapBox query
                addresses.append(properties.get("address"))
                coordinates = sf_geometry["coordinates"] if sf_geometry else None
                point_source = "sfdata" if sf_geometry else None
            else:
                mapbox_coordinates = self.mapbox_geojson_manager.get_mapbox_coordinates(
                    properties.get("address")
                )
                coordinates = (
                    mapbox_coordinates
                    if mapbox_coordinates
                    else sf_geometry["coordinates"] if sf_geometry else None
                )
                point_source = (
                    "mapbox"
                    if mapbox_coordinates
                    else "sfdata" if sf_geometry else None
                )

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
                        f"Point({coordinates[0]} {coordinates[1]})"
                        if coordinates
                        else None
                    ),
                    "sfdata_as_of": properties.get("data_as_of"),
                    "sfdata_loaded_at": properties.get("data_loaded_at"),
                    "point_source": point_source,
                }
            )

        return self.fill_in_missing_mapbox_points(parsed_data, addresses)


if __name__ == "__main__":
    print("Starting soft story properties data handler")
    load_dotenv()

    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL,
        SoftStoryProperty,
        mapbox_api_key=os.environ["NEXT_PUBLIC_MAPBOX_TOKEN"],
    )
    try:
        # Fetch and save data for debugging
        soft_story_properties = handler.fetch_data()
        print("Fetched soft story properties: ", len(soft_story_properties))
        
        # Save to debug file
        debug_file = Path(_DEBUG_DATA_PATH)
        debug_file.parent.mkdir(parents=True, exist_ok=True)
        with open(debug_file, 'w') as f:
           json.dump(soft_story_properties, f, indent=2)
        print(f"Saved debug data to {_DEBUG_DATA_PATH}")

        # For debugging, read from file instead of API
        # with open(_DEBUG_DATA_PATH) as f:
        #     soft_story_properties = json.load(f)
        # print("Loaded from debug file: ", len(soft_story_properties['features']), "features")
        
        soft_story_property_objects = handler.parse_data(soft_story_properties)
        print("Parsed soft story properties: ", len(soft_story_property_objects))
        handler.bulk_insert_data(soft_story_property_objects, "property_address")
        print("Inserted soft story properties")
    except HTTPException as e:
        print(f"Failed after retries: {e}")