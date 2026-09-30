from http.client import HTTPException
from backend.etl.data_handler import DataHandler
from backend.api.models.landslide_zones import LandslideZone
from shapely import set_precision, transform
from shapely.geometry import MultiPolygon, mapping, shape
from shapely.ops import unary_union
from shapely.validation import make_valid
from geoalchemy2.shape import from_shape

# This API has a default limit of providing 1,000 rows
LANDSLIDE_URL = "https://data.sfgov.org/resource/bna4-itif.geojson"

# Susceptibility bands the API routers treat as landslide zones.
HAZARDOUS_GRIDCODES = (8, 9, 10)

# The source is a vectorized ~10 m raster (~230k vertices, ~10 MB of GeoJSON),
# and the display file is inlined into the map page. The DB keeps full
# resolution for address lookups; only the display layer is generalized.
DISPLAY_SIMPLIFY_TOLERANCE_DEG = 5 / 111_320  # ~5 m
DISPLAY_DECIMALS = 6  # ~11 cm


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

        The DB records keep every band at full resolution. The GeoJSON only
        contains the hazardous bands, merged into a single simplified feature.
        """
        features = data["features"]
        parsed_data = []
        hazard_geometries = []

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

            if lanslide_zone["gridcode"] in HAZARDOUS_GRIDCODES:
                hazard_geometries.append(make_valid(multipolygon))

        geojson_features = []
        if hazard_geometries:
            geojson_features.append(
                {
                    "type": "Feature",
                    "geometry": mapping(_display_geometry(hazard_geometries)),
                    "properties": {},
                }
            )
        geojson = {"type": "FeatureCollection", "features": geojson_features}
        return parsed_data, geojson


def _polygons(geometry) -> MultiPolygon:
    """Keep only the polygonal parts of a geometry, as a MultiPolygon."""
    parts = getattr(geometry, "geoms", [geometry])
    return MultiPolygon(
        [
            polygon
            for part in parts
            for polygon in getattr(part, "geoms", [part])
            if polygon.geom_type == "Polygon" and not polygon.is_empty
        ]
    )


def _display_geometry(geometries: list) -> MultiPolygon:
    """
    Merge the bands into one shape so the boundaries between them (which the
    map never draws) disappear, simplify it, then snap it to a
    DISPLAY_DECIMALS grid. set_precision keeps the result valid; rounding
    afterwards makes each coordinate serialize as a short decimal.
    """
    merged = _polygons(unary_union(geometries))
    simplified = merged.simplify(DISPLAY_SIMPLIFY_TOLERANCE_DEG, preserve_topology=True)
    snapped = _polygons(set_precision(simplified, 10**-DISPLAY_DECIMALS))
    return transform(snapped, lambda coords: coords.round(DISPLAY_DECIMALS))


if __name__ == "__main__":
    handler = LandslideDataHandler(LANDSLIDE_URL, LandslideZone)
    try:
        lanslide_zones = handler.fetch_data()
        lanslide_zone_objects, landslide_zone_geojson = handler.parse_data(
            lanslide_zones
        )
        handler.bulk_insert_data(lanslide_zone_objects, "identifier")
        handler.export_geojson_if_changed(landslide_zone_geojson)
    except HTTPException as e:
        print(f"Failed after retries: {e}")
