from http.client import HTTPException
from typing import Type, Dict, Tuple
from backend.etl.data_handler import DataHandler
from backend.api.models.soft_story_properties import SoftStoryProperty
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os
import re
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
                # mapbox_coordinates_map only contains the addresses
                # that MapBox could resolve, so not all addresses will
                # be there
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
            wkt_point = item.get("point")  # Extract 'point' value (WKT)
            self.logger.info(f"wkt_point: {wkt_point}")
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
        return geojson

    @staticmethod
    def _addresses_from_range(
        start_range: int, end_range: int, street_name: str
    ) -> list[str]:
        """
        Returns a list of addresses from an address range

        Args:
            start_range: first address number to include
            end_range: last address to include
            street_name: name of the street on which the addresses are

        """
        # Convert the start and end into a range object
        number_range = range(start_range, end_range + 1)
        # Generate the list of addresses
        addresses = []
        for number in number_range:
            addresses.append(f"{number} {street_name}")
        return addresses

    def _process_feature(
        self,
        properties: dict,
        address: str,
        sf_geometry: dict,
        parsed_data: list,
        addresses: list,
    ):
        """
        Adds the contents of a feature to parsed_data and possibly
        addresses

        Works by mutating parsed_data and addresses rather than
        returning a value because the only way to make this function
        pure would involve duplicatively checking the condition.

        address must be an argument rather than being taken from
        properties, which has an address field, because the value of
        that field can have a range of building numbers and therefore
        instead must be turned into a list of addresses, one per
        number, by _addresses_from_range and then passed individually
        to this function.
        """
        # Search for the address in the mapbox geojson.
        # If it's not there, it might be new, so get it
        # from MapBox freshly.
        if not self.mapbox_geojson_manager.is_address_in_geojson(address):
            # Save it for one big later MapBox query
            addresses.append(address)
            coordinates = sf_geometry["coordinates"] if sf_geometry else None
            point_source = "sfdata" if sf_geometry else None
        else:
            mapbox_coordinates = self.mapbox_geojson_manager.get_mapbox_coordinates(
                address
            )
            coordinates = (
                mapbox_coordinates
                if mapbox_coordinates
                else sf_geometry["coordinates"] if sf_geometry else None
            )
            point_source = (
                "mapbox" if mapbox_coordinates else "sfdata" if sf_geometry else None
            )

        parsed_data.append(
            {
                "block": properties.get("block"),
                "lot": properties.get("lot"),
                "parcel_number": properties.get("parcel_number"),
                # For some reason, address has , SAN FRANCISCO CA, at
                # its end, which is right for property_address,
                "property_address": address,
                # but not for address.
                # This split removes it from address.
                # TODO: Fix this problem at the source.
                "address": address.split(", SAN FRANCISCO CA")[0],
                "tier": properties.get("tier"),
                "status": properties.get("status"),
                "bos_district": properties.get("bos_district"),
                "point": (
                    f"Point({coordinates[0]} {coordinates[1]})" if coordinates else None
                ),
                "sfdata_as_of": properties.get("data_as_of"),
                "sfdata_loaded_at": properties.get("data_loaded_at"),
                "point_source": point_source,
            }
        )

    def parse_data(self, sf_data: dict) -> tuple[list[dict], dict]:
        """
        Extracts feature attributes and geometry data to construct:
         - A list of dictionaries (each dictionary represents a row for the database table)
         - A dictionary representing the same data in GeoJSON format.

        Geometry data is converted into a GeoAlchemy-compatible
        Point with srid 4326.
        """
        parsed_data: list[dict] = []
        addresses: list[str] = []
        # Address range of the form '1234-5678 Street Ave'
        # The pattern seeks digits separated by a hyphen
        pattern = re.compile(r"(\d+)-(\d+)\s+(.*)")
        for feature in sf_data["features"]:
            properties = feature.get("properties", {})
            sf_geometry = feature.get("geometry", {})
            address = properties.get("address")
            # Tries to find the regular expression in the address
            match_result = pattern.search(address)
            if match_result:
                start_range = int(match_result[1])  # Before the hyphen
                end_range = int(match_result[2])  # After the hyphen
                street_name = match_result[3]  # After the range of addreses
                for address in _SoftStoryPropertiesDataHandler._addresses_from_range(
                    start_range, end_range, street_name
                ):
                    self._process_feature(
                        properties, address, sf_geometry, parsed_data, addresses
                    )
            else:
                self._process_feature(
                    properties, address, sf_geometry, parsed_data, addresses
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
        handler.bulk_insert_data(soft_story_property_objects, "address")
    except HTTPException as e:
        print(f"Failed after retries: {e}")
