import json

from geoalchemy2.shape import to_shape
from shapely.geometry import shape, mapping

from backend.etl.fema_data_handler import _FemaDataHandler
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
            "type": "Feature",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [-122.3, 37.6],
                            [-122.3, 37.65],
                            [-122.25, 37.65],
                            [-122.25, 37.6],
                            [-122.3, 37.6],
                        ]
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
