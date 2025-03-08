from http.client import HTTPException
from backend.etl.data_handler import DataHandler
from backend.api.models.liquefaction_zones import LiquefactionZone
from shapely.geometry import shape
from geoalchemy2.shape import from_shape
from geoalchemy2.functions import ST_Simplify


_LIQUEFACTION_URL = "https://data.sfgov.org/resource/i4t7-35u3.geojson"


class _LiquefactionDataHandler(DataHandler):
    """
    This class fetches, parses and loads SF liquefaction data from
    data.sfgov.org
    """

    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        """
        Extracts feature attributes and geometry data, applies transformations and constructs:
         - A list of dictionaries where each dictionary represents a row for the database table.
         - A dictionary representing the same data in GeoJSON format.

        Geometry data is converted into a GeoAlchemy-compatible
        MultiPolygon with srid 4326.

        To avoid API timeout errors, this method reduces the complexity of the satabase-stored multipolygons by collapsing points that are closer than 0.0001 degrees into a single point.
        Note that the dataset contains the length and area of the original multipoygons.
        """
        tolerance = 0.0001
        features = data["features"]
        parsed_data = []
        geojson_features = []

        for feature in features:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            multipolygon = shape(geometry)  # Convert GeoJSON to Shapely geometry
            geoalchemy_multipolygon = from_shape(multipolygon, srid=4326)
            simplified_geoalchemy_multipolygon = ST_Simplify(
                geoalchemy_multipolygon, tolerance
            )
            liquefaction_zone = {
                "identifier": f'{properties.get("shape_leng")}-{properties.get("shape_area")}-{properties.get("liq")}',
                "liq": properties.get("liq"),
                "geometry": geoalchemy_multipolygon,
                "shape_length": properties.get("shape_leng"),
                "shape_area": properties.get("shape_area"),
            }
            parsed_data.append(liquefaction_zone)

            # Constructing GeoJSON feature
            geojson_feature = {
                "type": "Feature",
                "geometry": geometry,
                "properties": {"liq": liquefaction_zone["liq"]},
            }
            geojson_features.append(geojson_feature)
        geojson = {"type": "FeatureCollection", "features": geojson_features}
        return parsed_data, geojson


if __name__ == "__main__":
    handler = _LiquefactionDataHandler(_LIQUEFACTION_URL, LiquefactionZone)
    try:
        liquefaction_zones = handler.fetch_data()
        liquefaction_zones_objects, liquefaction_zones_geojson = handler.parse_data(
            liquefaction_zones
        )
        handler.save_geojson(liquefaction_zones_geojson)
        handler.bulk_insert_data(liquefaction_zones_objects, "identifier")
    except HTTPException as e:
        print(f"Failed after retries: {e}")
