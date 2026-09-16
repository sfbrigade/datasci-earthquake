import json
from unittest.mock import patch

import pytest
from geoalchemy2.shape import to_shape
from shapely.geometry import shape, mapping

from backend.etl.fema_data_handler import _FemaDataHandler, main
from backend.api.models.earthquake_risk import EarthquakeRisk

_SAMPLE_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [-122.5, 37.7],
                            [-122.5, 37.8],
                            [-122.4, 37.8],
                            [-122.4, 37.7],
                            [-122.5, 37.7],
                        ]
                    ]
                ],
            },
            "properties": {
                "TRACTFIPS": "06075010101",
                "ERQK_RISKS": 98.78,
                "ERQK_RISKR": "Very High",
            },
        },
        {
            # FEMA's extract mixes single-part Polygon and MultiPolygon
            # tracts; most SF tracts are actually plain Polygon.
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.3, 37.6],
                        [-122.3, 37.65],
                        [-122.25, 37.65],
                        [-122.25, 37.6],
                        [-122.3, 37.6],
                    ]
                ],
            },
            "properties": {
                "TRACTFIPS": "06075010102",
                "ERQK_RISKS": 40.1,
                "ERQK_RISKR": "Relatively Low",
            },
        },
    ],
}


def _make_handler(path):
    return _FemaDataHandler(str(path), EarthquakeRisk)


def test_fetch_data_reads_local_file(tmp_path):
    geojson_path = tmp_path / "sf_earthquake_risk.geojson"
    geojson_path.write_text(json.dumps(_SAMPLE_GEOJSON))

    handler = _make_handler(geojson_path)
    data = handler.fetch_data()

    assert data == _SAMPLE_GEOJSON


def test_parse_data_builds_rows_and_geojson(tmp_path):
    geojson_path = tmp_path / "sf_earthquake_risk.geojson"
    geojson_path.write_text(json.dumps(_SAMPLE_GEOJSON))

    handler = _make_handler(geojson_path)
    rows, geojson = handler.parse_data(_SAMPLE_GEOJSON)

    assert len(rows) == 2
    first_row = rows[0]
    assert first_row["tract_fips"] == "06075010101"
    assert first_row["risk_score"] == 98.78
    assert first_row["risk_rating"] == "Very High"
    assert to_shape(first_row["geometry"]).equals(
        shape(_SAMPLE_GEOJSON["features"][0]["geometry"])
    )

    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 2
    first_feature = geojson["features"][0]
    assert first_feature["properties"] == {
        "tract_fips": "06075010101",
        "fema_risk_rating": "Very High",
        "fema_risk_score": 98.78,
    }
    assert shape(first_feature["geometry"]).equals(
        shape(_SAMPLE_GEOJSON["features"][0]["geometry"])
    )


def test_parse_data_normalizes_polygon_to_multipolygon(tmp_path):
    """The FEMA extract mixes Polygon and MultiPolygon tracts, but the
    database column and exported GeoJSON should always be MultiPolygon."""
    geojson_path = tmp_path / "sf_earthquake_risk.geojson"
    geojson_path.write_text(json.dumps(_SAMPLE_GEOJSON))

    handler = _make_handler(geojson_path)
    rows, geojson = handler.parse_data(_SAMPLE_GEOJSON)

    assert _SAMPLE_GEOJSON["features"][1]["geometry"]["type"] == "Polygon"

    second_row = rows[1]
    assert second_row["tract_fips"] == "06075010102"
    assert to_shape(second_row["geometry"]).geom_type == "MultiPolygon"

    second_feature = geojson["features"][1]
    assert second_feature["geometry"]["type"] == "MultiPolygon"
    assert shape(second_feature["geometry"]).equals(
        shape(_SAMPLE_GEOJSON["features"][1]["geometry"])
    )


def test_main_reraises_on_failure(tmp_path):
    """backend/etl/startup.sh only re-runs/aborts on a non-zero exit code,
    so a failure during load must propagate rather than being swallowed."""
    with patch(
        "backend.etl.fema_data_handler._FemaDataHandler.fetch_data",
        side_effect=RuntimeError("boom"),
    ):
        with pytest.raises(RuntimeError, match="boom"):
            main()
