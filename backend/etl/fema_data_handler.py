import json
from backend.etl.data_handler import DataHandler
from backend.api.models.earthquake_risk import EarthquakeRisk
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from geoalchemy2.shape import from_shape

_SF_EARTHQUAKE_RISK_PATH = "backend/etl/data/sf_earthquake_risk.geojson"


class _FemaDataHandler(DataHandler):
    """
    Loads FEMA National Risk Index earthquake risk data for San Francisco
    census tracts into the database.

    Unlike the other hazard data handlers, this data does not come from a
    live API - it's a small, pre-filtered extract of FEMA's national NRI
    census tract shapefile (see backend/etl/scripts/prepare_earthquake_risk_data.py
    for how that extract is produced and re-produced when FEMA updates its
    data). fetch_data() is overridden to read that local file instead of
    making an HTTP request.
    """

    def fetch_data(self, params=None) -> dict:
        self.logger.info(f"Reading local FEMA earthquake risk data from {self.url}")
        with open(self.url) as f:
            return json.load(f)

    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        """
        Extracts feature attributes and geometry data, and constructs:
         - A list of dictionaries where each dictionary represents a row for the database table.
         - A dictionary representing the same data in GeoJSON format, with
           friendlier property names (fema_risk_rating, fema_risk_score,
           tract_fips) for consumption by the frontend map layer.
        """
        features = data["features"]
        parsed_data = []
        geojson_features = []

        for feature in features:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            multipolygon = shape(geometry)
            if isinstance(multipolygon, Polygon):
                # The FEMA extract mixes single-part Polygon and MultiPolygon
                # tracts; normalize to MultiPolygon to match the
                # Geometry("MULTIPOLYGON", ...) column type.
                multipolygon = MultiPolygon([multipolygon])

            tract_fips = properties.get("TRACTFIPS")
            risk_score = properties.get("ERQK_RISKS")
            risk_rating = properties.get("ERQK_RISKR")

            earthquake_risk = {
                "tract_fips": tract_fips,
                "geometry": from_shape(multipolygon, srid=4326),
                "risk_score": risk_score,
                "risk_rating": risk_rating,
            }
            parsed_data.append(earthquake_risk)

            geojson_feature = {
                "type": "Feature",
                "geometry": mapping(multipolygon),
                "properties": {
                    "tract_fips": tract_fips,
                    "fema_risk_rating": risk_rating,
                    "fema_risk_score": risk_score,
                },
            }
            geojson_features.append(geojson_feature)

        geojson = {"type": "FeatureCollection", "features": geojson_features}
        return parsed_data, geojson


def main():
    handler = _FemaDataHandler(_SF_EARTHQUAKE_RISK_PATH, EarthquakeRisk)
    try:
        earthquake_risk_data = handler.fetch_data()
        earthquake_risk_objects, earthquake_risk_geojson = handler.parse_data(
            earthquake_risk_data
        )
        handler.export_geojson_if_changed(earthquake_risk_geojson)
        handler.bulk_insert_data(earthquake_risk_objects, "tract_fips")
    except Exception as e:
        print(f"Failed to load FEMA earthquake risk data: {e}")
        raise


if __name__ == "__main__":
    main()
