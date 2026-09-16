import json
from pathlib import Path

from backend.etl.data_handler import DataHandler, get_geojson_prefix
from backend.api.models.earthquake_risk import EarthquakeRisk
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from geoalchemy2.shape import from_shape
from geojson_pydantic import FeatureCollection
from pydantic import ValidationError
from sqlalchemy import text

_NRI_CENSUS_TRACTS_URL = (
    "https://services.arcgis.com/XG15cJAlne2vxtgt/ArcGIS/rest/services/"
    "National_Risk_Index_Census_Tracts/FeatureServer/0/query"
)
_SF_STCOFIPS = "06075"


class _FemaDataHandler(DataHandler):
    """
    Fetches, parses and loads FEMA National Risk Index earthquake risk data
    for San Francisco census tracts from FEMA's public ArcGIS FeatureServer
    (the backing service for FEMA's own NRI map viewer).
    """

    def _save_geojson_file(self, features: dict, geojson_path: Path) -> None:
        """
        Same as DataHandler._save_geojson_file, but writes compact (no
        whitespace) JSON: with 241 features this dataset is large enough
        that the default separators meaningfully bloat the file.
        """
        try:
            FeatureCollection.model_validate(features)
            with open(geojson_path, "wt") as f:
                json.dump(features, f, separators=(",", ":"))

            self.logger.info(
                f"Generated {get_geojson_prefix()}{self.table.__name__}.geojson"
            )
        except ValidationError as e:
            self.logger.error(f"Failed to validate GeoJSON: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Failed to write GeoJSON: {e}")
            raise

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

    def insert_policy(self) -> dict:
        """
        Update existing rows on conflict instead of leaving them stale.
        Unlike soft_story_properties_data_handler.py, there's no need to
        compare timestamps between old and new data - each fetch reflects
        FEMA's one current published dataset, so the incoming row is
        always authoritative.
        """
        return {
            "geometry": text("EXCLUDED.geometry"),
            "risk_score": text("EXCLUDED.risk_score"),
            "risk_rating": text("EXCLUDED.risk_rating"),
            "update_timestamp": text("now()"),
        }


def main():
    handler = _FemaDataHandler(_NRI_CENSUS_TRACTS_URL, EarthquakeRisk)
    params = {
        "where": f"STCOFIPS='{_SF_STCOFIPS}'",
        "outFields": "TRACTFIPS,ERQK_RISKS,ERQK_RISKR",
        "outSR": 4326,
        "geometryPrecision": 6,
        "f": "geojson",
    }
    try:
        earthquake_risk_data = handler.fetch_data(params)
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
