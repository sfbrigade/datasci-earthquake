import json
from pathlib import Path
from unittest.mock import patch

import pytest
from geoalchemy2.shape import to_shape
from shapely.geometry import shape

from backend.etl.fema_data_handler import (
    _FemaDataHandler,
    _NRI_CENSUS_TRACTS_URL,
    _SF_STCOFIPS,
    main,
)
from backend.api.models.earthquake_risk import EarthquakeRisk

# A small (2-feature) real sample captured from FEMA's live
# National_Risk_Index_Census_Tracts ArcGIS FeatureServer, using the exact
# query params main() sends - kept as a fixture so tests exercise the
# actual response shape (real field values, real mix of Polygon/MultiPolygon
# geometry) rather than a synthetic approximation of it.
_LIVE_SAMPLE_PATH = Path(__file__).parent / "fixtures" / "fema_live_sample.geojson"

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


def _make_handler():
    return _FemaDataHandler(_NRI_CENSUS_TRACTS_URL, EarthquakeRisk)


def test_parse_data_builds_rows_and_geojson():
    handler = _make_handler()
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


def test_parse_data_normalizes_polygon_to_multipolygon():
    """The FEMA extract mixes Polygon and MultiPolygon tracts, but the
    database column and exported GeoJSON should always be MultiPolygon."""
    handler = _make_handler()
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


def test_main_reraises_on_failure():
    """backend/etl/startup.sh only re-runs/aborts on a non-zero exit code,
    so a failure during load must propagate rather than being swallowed."""
    with patch(
        "backend.etl.fema_data_handler._FemaDataHandler.fetch_data",
        side_effect=RuntimeError("boom"),
    ):
        with pytest.raises(RuntimeError, match="boom"):
            main()


def test_main_queries_live_service_and_loads_real_shaped_data():
    """
    End-to-end (mocked HTTP/DB) check that main() queries FEMA's live
    ArcGIS FeatureServer correctly and correctly processes its real
    response shape, using an actual captured sample (not synthetic data)
    of that response.
    """
    live_sample = json.loads(_LIVE_SAMPLE_PATH.read_text())

    with (
        patch(
            "backend.etl.request_handler.RequestHandler.make_request",
            return_value=live_sample,
        ) as mock_make_request,
        patch(
            "backend.etl.fema_data_handler._FemaDataHandler.export_geojson_if_changed"
        ) as mock_export,
        patch(
            "backend.etl.fema_data_handler._FemaDataHandler.bulk_insert_data"
        ) as mock_insert,
    ):
        main()

    # Queried FEMA's live service, filtered to SF, at the fields/precision/
    # SRID the rest of the pipeline expects.
    mock_make_request.assert_called_once()
    called_url, called_params = mock_make_request.call_args[0]
    assert called_url == _NRI_CENSUS_TRACTS_URL
    assert called_params["where"] == f"STCOFIPS='{_SF_STCOFIPS}'"
    assert called_params["outFields"] == "TRACTFIPS,ERQK_RISKS,ERQK_RISKR"
    assert called_params["outSR"] == 4326
    assert called_params["f"] == "geojson"

    # The real sample's two tracts (one Polygon, one MultiPolygon) made it
    # through parse_data() with correct values and normalized geometry.
    mock_insert.assert_called_once()
    rows, id_field = mock_insert.call_args[0]
    assert id_field == "tract_fips"
    rows_by_tract = {row["tract_fips"]: row for row in rows}
    assert rows_by_tract.keys() == {
        f["properties"]["TRACTFIPS"] for f in live_sample["features"]
    }
    for feature in live_sample["features"]:
        row = rows_by_tract[feature["properties"]["TRACTFIPS"]]
        assert row["risk_score"] == feature["properties"]["ERQK_RISKS"]
        assert row["risk_rating"] == feature["properties"]["ERQK_RISKR"]
        assert to_shape(row["geometry"]).geom_type == "MultiPolygon"

    mock_export.assert_called_once()
    (exported_geojson,) = mock_export.call_args[0]
    assert len(exported_geojson["features"]) == len(live_sample["features"])
