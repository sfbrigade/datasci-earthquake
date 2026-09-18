import json
import copy
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


def test_parse_data_repairs_self_intersecting_polygon():
    sample = copy.deepcopy(_SAMPLE_GEOJSON)
    sample["features"][0]["geometry"] = {
        "type": "Polygon",
        "coordinates": [[[0, 0], [2, 2], [0, 2], [2, 0], [0, 0]]],
    }
    rows, exported = _make_handler().parse_data(sample)
    geometry = shape(exported["features"][0]["geometry"])
    assert geometry.is_valid
    assert geometry.geom_type == "MultiPolygon"
    assert geometry.area == 2
    assert to_shape(rows[0]["geometry"]).equals(geometry)


def test_parse_data_drops_line_left_by_repair():
    sample = copy.deepcopy(_SAMPLE_GEOJSON)
    sample["features"][0]["geometry"] = {
        "type": "Polygon",
        "coordinates": [[[0, 0], [1, 0], [1, 1], [3, 3], [1, 1], [0, 1], [0, 0]]],
    }
    rows, exported = _make_handler().parse_data(sample)
    geometry = shape(exported["features"][0]["geometry"])
    assert geometry.is_valid
    assert geometry.geom_type == "MultiPolygon"
    assert geometry.area == 1


@pytest.mark.parametrize("environment", ["dev_docker", "prod"])
def test_export_refreshes_existing_file(tmp_path, monkeypatch, environment):
    monkeypatch.setenv("DATA_GEOJSON_PATH", f"{tmp_path}/")
    monkeypatch.setenv("ENVIRONMENT", environment)
    handler = _make_handler()
    _, exported = handler.parse_data(_SAMPLE_GEOJSON)
    with patch.object(handler, "_update_last_export_time_in_db") as update_metadata:
        handler.export_geojson_if_changed(exported)
        exported["features"][0]["properties"]["fema_risk_score"] = 99.0
        handler.export_geojson_if_changed(exported)
        path = tmp_path / "EarthquakeRisk.geojson"
        assert json.loads(path.read_text()) == json.loads(json.dumps(exported))
        modified = path.stat().st_mtime_ns
        handler.export_geojson_if_changed(exported)
        assert path.stat().st_mtime_ns == modified
        assert update_metadata.call_count == (2 if environment == "prod" else 0)


@pytest.mark.parametrize("failure", ["write", "replace"])
def test_failed_export_preserves_existing_file(tmp_path, monkeypatch, failure):
    monkeypatch.setenv("DATA_GEOJSON_PATH", f"{tmp_path}/")
    monkeypatch.setenv("ENVIRONMENT", "prod")
    handler = _make_handler()
    _, exported = handler.parse_data(_SAMPLE_GEOJSON)
    path = tmp_path / "EarthquakeRisk.geojson"
    handler._save_geojson_file(exported, path)
    previous = path.read_bytes()
    exported["features"][0]["properties"]["fema_risk_score"] = 99.0

    def fail_during_write(features, file, **kwargs):
        file.write('{"type":')
        raise OSError("Write failed")

    failure_patch = (
        patch("backend.etl.fema_data_handler.json.dump", side_effect=fail_during_write)
        if failure == "write"
        else patch(
            "backend.etl.fema_data_handler.os.replace",
            side_effect=OSError("Write failed"),
        )
    )
    with (
        failure_patch,
        patch.object(handler, "_update_last_export_time_in_db") as update_metadata,
    ):
        with pytest.raises(OSError, match="Write failed"):
            handler.export_geojson_if_changed(exported)
        update_metadata.assert_not_called()
    assert path.read_bytes() == previous
    assert json.loads(path.read_text())["type"] == "FeatureCollection"
    assert list(tmp_path.iterdir()) == [path]


def test_committed_geojson_has_valid_sf_tracts():
    path = Path(__file__).parents[3] / "public/data/EarthquakeRisk.geojson"
    features = json.loads(path.read_text())["features"]
    ids = [feature["properties"]["tract_fips"] for feature in features]
    assert len(ids) == len(set(ids)) == 241
    for feature in features:
        properties = feature["properties"]
        assert properties["tract_fips"].startswith("06075")
        assert 0 <= properties["fema_risk_score"] <= 100
        geometry = shape(feature["geometry"])
        assert geometry.is_valid, properties["tract_fips"]
        assert not geometry.is_empty


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
