from http.client import HTTPException
from backend.etl.data_handler import DataHandler
from backend.api.models.tsunami import TsunamiZone
from shapely.geometry import Polygon, MultiPolygon, mapping
from geoalchemy2.shape import from_shape, to_shape

TSUNAMI_URL = "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query"


class TsunamiDataHandler(DataHandler):
    """
    This class fetches, parses and loads SF tsunami data from
    conservation.ca.gov
    """

    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        """
        Extracts feature attributes and geometry data to construct:
         - A list of dictionaries (Each dictionary represents a row for the database table)
         - A dictionary representing the same data in the GeoJSON format.

        Geometry data is converted into a GeoAlchemy-compatible
        MultiPolygon with srid 4326.
        """
        features = data["features"]
        parsed_data = []
        geojson_features = []

        for feature in features:
            properties = feature.get("attributes", {})
            rings = feature["geometry"]["rings"]
            # Extract rings and create Polygons
            rings = feature["geometry"]["rings"]
            # Ensure valid polygons
            polygons = [Polygon(ring) for ring in rings if len(ring) >= 4]
            multi_polygon = MultiPolygon(polygons)
            # Transform MultiPolygon from SRID 3857 to 4326
            transformed_multipolygon = self.transform_geometry(
                multi_polygon, source_srid=3857, target_srid=4326
            )

            trimmed_multipolygon = transformed_multipolygon.intersection(self.boundary)

            # Skip if completely outside boundary
            if trimmed_multipolygon.is_empty:
                continue

            geoalchemy_multipolygon = from_shape(trimmed_multipolygon, srid=4326)
            shapely_multipolygon = to_shape(
                geoalchemy_multipolygon
            )  # Convert WKBElement to Shapely
            geojson_geometry = mapping(
                shapely_multipolygon
            )  # Convert Shapely geometry to GeoJSON format

            tsunami_zone = {
                "identifier": int(properties.get("OBJECTID")),
                "evacuate": properties.get("Evacuate"),
                "county": properties.get("County"),
                "global_id": properties.get("GlobalID"),
                "shape_length": properties.get("Shape__Length", None),
                "shape_area": properties.get("Shape__Area", None),
                "geometry": geoalchemy_multipolygon,
            }
            parsed_data.append(tsunami_zone)

            # Constructing GeoJSON feature for the tsunami evacuation zone
            geojson_feature = {
                "type": "Feature",
                "geometry": mapping(shapely_multipolygon),
                "properties": {"evacuate": tsunami_zone["evacuate"]},
            }
            geojson_features.append(geojson_feature)
            geojson = {"type": "FeatureCollection", "features": geojson_features}

        return parsed_data, geojson


if __name__ == "__main__":
    handler = TsunamiDataHandler(TSUNAMI_URL, TsunamiZone)
    try:
        params = {
            "where": "County='San Francisco' AND Evacuate='Yes, Tsunami Hazard Area'",
            "outFields": "*",
            "f": "json",
        }
        tsunami_zones = handler.fetch_data(params)
        tsunami_zones_objects, tsunami_zones_geojson = handler.parse_data(tsunami_zones)
        handler.save_geojson(tsunami_zones_geojson)
        handler.bulk_insert_data(tsunami_zones_objects, "identifier")
    except HTTPException as e:
        print(f"Failed after retries: {e}")
