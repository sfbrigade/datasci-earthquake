from backend.etl.data_handler import DataHandler
from backend.api.models.soft_story_properties import SoftStoryProperty


_SOFT_STORY_PROPERTIES_URL = "https://data.sfgov.org/resource/beah-shgi.geojson"


class _SoftStoryPropertiesDataHandler(DataHandler):
    """
    This class fetches, parses and loads SF tsunami data from
    data.sfgov.org
    """

    def parse_data(self, data: dict) -> list[dict]:
        """
        Extracts feature attributes and geometry data to construct a
        list of dictionaries.

        Each dictionary represents a row for the database table.
        Geometry data is converted into a GeoAlchemy-compatible
        Point with srid 4326.
        """
        parsed_data = []
        for feature in data["features"]:
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            if geometry:
                geom_longitude, geom_latitude = geometry["coordinates"]
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
                        f"Point({geom_latitude} {geom_longitude})" if geometry else None
                    ),
                    "sfdata_as_of": properties.get("data_as_of"),
                    "sfdata_loaded_at": properties.get("data_loaded_at"),
                }
            )
        return parsed_data


if __name__ == "__main__":
    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL, SoftStoryProperty
    )
    """soft_story_properties = handler.fetch_data()
    soft_story_property_objects = handler.parse_data(soft_story_properties)
    handler.bulk_insert_data_autoincremented(soft_story_property_objects)"""
    # ORIGINAL CODE: UN-COMMENT IT AFTER WORK
    try:
        soft_story_properties = handler.fetch_data()
        soft_story_property_objects = handler.parse_data(soft_story_properties)
        handler.bulk_insert_data_autoincremented(soft_story_property_objects)
    except Exception as e:
        print(f"Failed after retries: {e}")
