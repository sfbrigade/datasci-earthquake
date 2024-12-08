from backend.etl.data_handler import DataHandler
from backend.api.models.seismic_hazard_zones import SeismicHazardZone
from shapely.geometry import shape
from geoalchemy2.shape import from_shape


SEISMIC_URL = "https://data.sfgov.org/resource/re79-p8j5.geojson"  # This API has a default limit of providing 1,000 rows


class SeismicDataHandler(DataHandler):
    """
    Fetches, parses and loads seismic hazard zones from data.sfgov.org
    """

    def parse_data(self, data: dict) -> list[dict]:
        """
        Parses fetched GeoJSON data and returns a list of dictionaries
        representing seismic hazard zones

        Geometry data is converted into a GeoAlchemy-compatible
        MultiPolygon with srid 4326.
        """
        features = data["features"]
        parsed_data = []

        for feature in features:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            multipolygon = shape(geometry)
            geoalchemy_multipolygon = from_shape(multipolygon, srid=4326)

            lanslide_zone = {
                "identifier": int(properties.get("id")),
                "geometry": geoalchemy_multipolygon,
            }
            parsed_data.append(lanslide_zone)
        return parsed_data


if __name__ == "__main__":
    handler = SeismicDataHandler(SEISMIC_URL, SeismicHazardZone)
    try:
        seismic_zones = handler.fetch_data()
        seismic_zone_objects = handler.parse_data(seismic_zones)
        handler.bulk_insert_data(seismic_zone_objects, "identifier")
    except Exception as e:
        print(f"Failed after retries: {e}")
