from http.client import HTTPException
from backend.etl.data_handler import DataHandler
from backend.api.models.landslide_zones import LandslideZone
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

# This API has a default limit of providing 1,000 rows
LANDSLIDE_URL = "https://data.sfgov.org/resource/bna4-itif.geojson"


class LandslideDataHandler(DataHandler):
    """
    Fetches, parses and loads landslide zones from data.sfgov.org

    If gridcode is 8,9,10 then area is High Susceptibility for
    landslides
    """

    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        """
        Parses fetched GeoJSON data and returns:
        - A list of dictionaries representing address records
        - A dictionary representing the same data in GeoJSON format.

        Geometry data is converted into a GeoAlchemy-compatible
        MultiPolygon with srid 4326.
        """
        features = data["features"]
        parsed_data = []
        geojson_features = []

        for feature in features:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            multipolygon = shape(geometry)
            geoalchemy_multipolygon = from_shape(multipolygon, srid=4326)

            lanslide_zone = {
                "identifier": int(properties.get("objectid")),
                "geometry": geoalchemy_multipolygon,
                "gridcode": int(properties.get("gridcode")),
                "sum_shape": properties.get("sum_shape_"),
                "shape_length": properties.get("shape_leng"),
                "shape_length_1": properties.get("shape_le_1"),
                "shape_area": properties.get("shape_area"),
            }
            parsed_data.append(lanslide_zone)

            # Constructing GeoJSON feature
            geojson_feature = {
                "type": "Feature",
                "geometry": geometry,
                "properties": {},
            }
            geojson_features.append(geojson_feature)
        geojson = {"type": "FeatureCollection", "features": geojson_features}
        return parsed_data, geojson


if __name__ == "__main__":
    handler = LandslideDataHandler(LANDSLIDE_URL, LandslideZone)
    try:
        lanslide_zones = handler.fetch_data()
        lanslide_zone_objects, landslide_zone_geojson = handler.parse_data(
            lanslide_zones
        )
        handler.bulk_insert_data(lanslide_zone_objects, "identifier")
    except HTTPException as e:
        print(f"Failed after retries: {e}")
