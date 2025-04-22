from http.client import HTTPException
from typing import Type, Dict, Tuple
from backend.etl.data_handler import DataHandler
from backend.api.models.soft_story_properties import SoftStoryProperty
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os
from pathlib import Path
from typing import Dict, Tuple
from backend.etl.mapbox_geojson_manager import MapboxConfig, MapboxGeojsonManager
from backend.api.models.base import ModelType
from shapely.wkt import loads


_SOFT_STORY_PROPERTIES_URL = "https://data.sfgov.org/resource/beah-shgi.geojson"
_MAPBOX_GEOCODE_API_ENDPOINT_URL = "https://api.mapbox.com/search/geocode/v6/batch"
_MAPBOX_SOFT_STORY_GEOJSON_PATH = "backend/etl/data/mapbox_soft_story.geojson.gz"


class _SoftStoryPropertiesDataHandler(DataHandler):
    """
    Fetches, parses and loads SF tsunami data from
    data.sfgov.org
    """

    def __init__(self, url: str, table: Type[ModelType], mapbox_api_key: str):
        mapbox_config = MapboxConfig(
            # These values are for San Francisco
            min_longitude=-122.51436038,
            min_latitude=37.70799051,
            max_longitude=-122.36206898,
            max_latitude=37.83179017,
            geocode_api_endpoint_url=_MAPBOX_GEOCODE_API_ENDPOINT_URL,
            soft_story_geojson_path=Path(_MAPBOX_SOFT_STORY_GEOJSON_PATH),
            api_key=mapbox_api_key,
        )
        self.mapbox_geojson_manager = MapboxGeojsonManager(mapbox_config)
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

    def _convert_to_geojson(self, data: list[dict]) -> dict:
        """
        Iterates over a list of dicts representing database rows and creates a geojson
        """
        features = []
        for item in data:
            if item["status"].lower() == "work complete, cfc issued":
                continue
            wkt_point = item.get("point")  # Extract 'point' value (WKT)
            if wkt_point:
                point_geom = loads(wkt_point)  # Convert WKT to Shapely Point

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [point_geom.x, point_geom.y],
                    },
                    "properties": {},
                }
                features.append(feature)
        geojson = {"type": "FeatureCollection", "features": features}
        self.logger.info(f"There are {len(features)} non-retroffited soft stories")
        return geojson

    def parse_data(self, sf_data: dict) -> tuple[list[dict], dict]:
        """
        Extracts feature attributes and geometry data to construct:
         - A list of dictionaries (each dictionary represents a row for the database table)
         - A dictionary representing the same data in GeoJSON format.

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

        parsed_data_complete = self.fill_in_missing_mapbox_points(
            parsed_data, addresses
        )
        geojson = self._convert_to_geojson(parsed_data_complete)

        return parsed_data_complete, geojson


if __name__ == "__main__":
    load_dotenv()

    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL,
        SoftStoryProperty,
        mapbox_api_key=os.environ["NEXT_PUBLIC_MAPBOX_TOKEN"],
    )
    try:
        soft_story_properties = handler.fetch_data()
        soft_story_property_objects, soft_story_property_geojson = handler.parse_data(
            soft_story_properties
        )
        handler.save_geojson(soft_story_property_geojson)
        handler.bulk_insert_data(soft_story_property_objects, "property_address")
    except HTTPException as e:
        print(f"Failed after retries: {e}")
