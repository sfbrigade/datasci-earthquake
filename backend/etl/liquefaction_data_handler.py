from http.client import HTTPException
from pathlib import Path
from backend.etl.data_handler import DataHandler, get_geojson_prefix
from backend.api.models.liquefaction_zones import LiquefactionZone
from shapely.geometry import shape
from geoalchemy2.shape import from_shape
from shapely.geometry import mapping
from typing import Any


_LIQUEFACTION_URL = "https://data.sfgov.org/resource/i4t7-35u3.geojson"


class _LiquefactionDataHandler(DataHandler):
    """
    Fetches, parses and loads SF liquefaction data from data.sfgov.org
    """

    _TOLERANCE = 0.0001

    def _parse_feature(self, feature):
        properties = feature.get("properties", {})
        geometry = feature.get("geometry", {})
        multipolygon = shape(geometry)  # Convert GeoJSON to Shapely geometry
        simplified_shapely_multipolygon = multipolygon.simplify(
            _LiquefactionDataHandler._TOLERANCE, preserve_topology=True
        )

        trimmed_multipolygon = simplified_shapely_multipolygon.intersection(
            self.boundary
        )

        if trimmed_multipolygon.is_empty:
            return

        # Convert back to GeoAlchemy (if needed for storage)
        geoalchemy_multipolygon = from_shape(trimmed_multipolygon, srid=4326)
        # Convert back to GeoJSON
        simplified_geometry = mapping(trimmed_multipolygon)

        # Construct zone for database
        liquefaction_zone = {
            "identifier": f'{properties.get("shape_leng")}-{properties.get("shape_area")}-{properties.get("liq")}',
            "liq": properties.get("liq"),
            "geometry": geoalchemy_multipolygon,
            "shape_length": properties.get("shape_leng"),
            "shape_area": properties.get("shape_area"),
        }

        # Construct GeoJSON feature for public folder
        geojson_feature = {
            "type": "Feature",
            "geometry": simplified_geometry,
            "properties": {"liq": liquefaction_zone["liq"]},
        }

        return liquefaction_zone, geojson_feature

    def parse_data(self, data: dict) -> tuple[Any, Any | None, Any | None]:
        """
        Extracts feature attributes and geometry data, applies transformations, and constructs:
         - A list of dictionaries where each dictionary represents a row for the database table.
         - One dictionary representing the high liquefaction susceptibility of this data in GeoJSON format
         - Another dictionary representing the very high liquefaction susceptibility of this data, also in GeoJSON format

        Geometry data is converted into a GeoAlchemy-compatible
        MultiPolygon with srid 4326.

        To avoid API timeout errors, this method reduces the complexity of the
        database-stored multipolygons by collapsing points that are closer than 0.0001
        degrees into a single point.

        Note that the dataset contains the length and area of the original multipoygons.
        """
        features = data["features"]
        parsed_data_list = []
        high_liquefaction_susceptibility_feature = None
        very_high_liquefaction_susceptibility_feature = None
        for feature in features:
            feature_type = feature["properties"]["liq"]
            if feature_type == "H":  # High susceptibility
                parsed_data, high_liquefaction_susceptibility_feature = (
                    self._parse_feature(feature)
                )
            elif feature_type == "VH":  # Very high susceptibility
                parsed_data, very_high_liquefaction_susceptibility_feature = (
                    self._parse_feature(feature)
                )
            else:
                raise ValueError(f"Feature type {feature_type} is not H or VH.")
            parsed_data_list.append(parsed_data)
        return (
            parsed_data,
            high_liquefaction_susceptibility_feature,
            very_high_liquefaction_susceptibility_feature,
        )


def main():
    handler = _LiquefactionDataHandler(_LIQUEFACTION_URL, LiquefactionZone)
    try:
        liquefaction_zones = handler.fetch_data()
        (
            liquefaction_zones_objects,
            high_liquefaction_susceptibility_feature,
            very_high_liquefaction_susceptibility_feature,
        ) = handler.parse_data(liquefaction_zones)
        handler.export_geojson_if_changed(
            high_liquefaction_susceptibility_feature,
            Path(f"{get_geojson_prefix()}HighSusceptibilityZone.geojson"),
        )
        handler.export_geojson_if_changed(
            very_high_liquefaction_susceptibility_feature,
            Path(f"{get_geojson_prefix()}VeryHighSusceptibilityZone.geojson"),
        )
        handler.bulk_insert_data(liquefaction_zones_objects, "identifier")
    except HTTPException as e:
        print(f"Failed after retries: {e}")


if __name__ == "__main__":
    main()
