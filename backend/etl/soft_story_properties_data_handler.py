from http.client import HTTPException
from backend.etl.data_handler import DataHandler
from backend.api.models.soft_story_properties import SoftStoryProperty
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os
from pathlib import Path
from backend.etl.mapbox_geocoder import MapboxGeojsonManager
from typing import Dict, Tuple


_SOFT_STORY_PROPERTIES_URL = "https://data.sfgov.org/resource/beah-shgi.geojson"


class _SoftStoryPropertiesDataHandler(DataHandler):
    """
    Fetches, parses and loads SF tsunami data from
    data.sfgov.org
    """

    def __init__(self, url: str, table: DeclarativeMeta, mapbox_api_key: str):
        self.mapbox_geojson_manager = MapboxGeojsonManager(api_key=mapbox_api_key)
        super().__init__(url, table)

    def parse_data(self, data: dict) -> list[dict]:
        """
        Extracts feature attributes and geometry data to construct a
        list of dictionaries

        Each dictionary represents a row for the database table.
        Geometry data is converted into a GeoAlchemy-compatible
        Point with srid 4326.
        """
        parsed_data, addresses = [], []
        for feature in data["features"]:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            if geometry:
                geom_longitude, geom_latitude = geometry["coordinates"]
            addresses.append(properties.get("address"))

            # Search for the address in the mapbox geojson
            mapbox_coordinates = self.mapbox_geojson_manager.get_mapbox_coordinates(
                properties.get("address")
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
                        f"Point({geom_longitude} {geom_latitude})" if geometry else None
                    ),
                    "sfdata_as_of": properties.get("data_as_of"),
                    "sfdata_loaded_at": properties.get("data_loaded_at"),
                    "mapbox_point": f"Point({mapbox_coordinates[0]} {mapbox_coordinates[1]})"
                    if mapbox_coordinates
                    else None,
                }
            )

        # Try to fix the mapbox_point fields that were not in the geojson. We will batch geocode these addresses.
        # FIXME: two cases in which mapbox_point was None: 1. the address is not in the geojson,
        # 2. mapbox couldn't resolve the address, therefore it was stored in the geojson as None
        # We should handle the second case, but we are not doing it now.
        addresses = [
            data_point["address"]
            for data_point in parsed_data
            if data_point["mapbox_point"] is None
        ]
        mapbox_coordinates_map: Dict[
            str, Tuple[float, float]
        ] = self.mapbox_geojson_manager.batch_geocode_addresses(addresses)

        for data_point in parsed_data:
            if data_point["mapbox_point"] is None:
                # Try to fill, if found in the mapbox geojson
                address = data_point["address"]
                # mapbox_coordinates_map only contains the addresses that MapBox could resolve, so not all addresses will be there
                if address in mapbox_coordinates_map:
                    lon, lat = mapbox_coordinates_map[address]
                    data_point["mapbox_point"] = f"Point({lon} {lat})"

        # self.mapbox_geocoder.batch_geocode_and_store(addresses, self.output_path)

        return parsed_data


if __name__ == "__main__":
    load_dotenv()

    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL,
        SoftStoryProperty,
        mapbox_api_key=os.environ["NEXT_PUBLIC_MAPBOX_TOKEN"],
    )
    try:
        soft_story_properties = handler.fetch_data()
        soft_story_property_objects = handler.parse_data(soft_story_properties)
        handler.bulk_insert_data_autoincremented(soft_story_property_objects)
    except HTTPException as e:
        print(f"Failed after retries: {e}")
