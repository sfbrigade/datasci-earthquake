from backend.etl.data_handler import DataHandler
from backend.api.models.tsunami import TsunamiZone
from shapely.geometry import Polygon, MultiPolygon
from geoalchemy2.shape import from_shape


TSUNAMI_URL = "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query"


class TsunamiDataHandler(DataHandler):
    def parse_data(self, data: dict) -> list[dict]:
        features = data["features"]
        parsed_data = []

        for feature in features:
            properties = feature.get("attributes", {})
            rings = feature["geometry"]["rings"]
            # Extract rings and create Polygons
            rings = feature["geometry"]["rings"]
            polygons = [
                Polygon(ring) for ring in rings if len(ring) >= 4
            ]  # Ensure valid polygons
            multi_polygon = MultiPolygon(polygons)
            geoalchemy_multipolygon = from_shape(multi_polygon, srid=3857)  # epsg 3395?
            tsunami_zone = {
                "identifier": properties.get("OBJECTID"),
                "evacuate": properties.get("Evacuate"),
                "county": properties.get("County"),
                "globalID": properties.get("GlobalID"),
                "shape_length": properties.get("Shape__Length", None),
                "shape_area": properties.get("Shape__Area", None),
                "geometry": geoalchemy_multipolygon,
            }
            parsed_data.append(tsunami_zone)
        return parsed_data


if __name__ == "__main__":
    handler = TsunamiDataHandler(TSUNAMI_URL, TsunamiZone)
    try:
        params = {
            "where": "County='San Francisco'",
            "outFields": "*",
            "f": "json",
        }
        tsunami_zones = handler.fetch_data(params)
        tsunami_zones_objects = handler.parse_data(tsunami_zones)
        handler.bulk_insert_data(tsunami_zones_objects, "identifier")
    except Exception as e:
        print(f"Failed after retries: {e}")
