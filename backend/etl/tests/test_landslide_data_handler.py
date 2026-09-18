import json
import re

import pytest
from geoalchemy2.shape import to_shape
from geojson_pydantic import FeatureCollection
from shapely.geometry import Point, shape

from backend.api.models.landslide_zones import LandslideZone
from backend.etl.landslide_data_handler import LandslideDataHandler


def _feature(objectid, gridcode, *rings):
    """A source feature shaped like data.sfgov.org's landslide dataset."""
    return {
        "type": "Feature",
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[ring] for ring in rings],
        },
        "properties": {
            "objectid": str(objectid),
            "gridcode": str(gridcode),
            "sum_shape_": "1.0",
            "shape_leng": "1.0",
            "shape_le_1": "1.0",
            "shape_area": "1.0",
        },
    }


def _square(x0, y0, x1, y1):
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]


# Two hazardous bands sharing an edge. One vertex carries sub-grid noise.
BAND_8 = _feature(
    1,
    8,
    [
        [-122.450, 37.75000012345678],
        [-122.449, 37.750],
        [-122.449, 37.751],
        [-122.450, 37.751],
        [-122.450, 37.75000012345678],
    ],
)
BAND_9 = _feature(2, 9, _square(-122.449, 37.750, -122.448, 37.751))
# A low-susceptibility band the API does not treat as a landslide zone.
BAND_3 = _feature(3, 3, _square(-122.440, 37.760, -122.439, 37.761))
# A hazardous band with a ~1 m wiggle on its bottom edge and a ~55 m notch
# in its top edge.
WIGGLE_Y = 37.74001
BAND_10 = _feature(
    4,
    10,
    [
        [-122.420, 37.740],
        [-122.4195, WIGGLE_Y],
        [-122.419, 37.740],
        [-122.419, 37.741],
        [-122.4194, 37.741],
        [-122.4195, 37.7405],
        [-122.4196, 37.741],
        [-122.420, 37.741],
        [-122.420, 37.740],
    ],
)

SOURCE = {"type": "FeatureCollection", "features": [BAND_8, BAND_9, BAND_3, BAND_10]}


@pytest.fixture
def handler():
    return LandslideDataHandler(url="dummy_url", table=LandslideZone)


@pytest.fixture
def parsed(handler):
    return handler.parse_data(SOURCE)


def _display_geometry(geojson):
    assert len(geojson["features"]) == 1
    return shape(geojson["features"][0]["geometry"])


def test_db_rows_keep_every_band_at_full_resolution(parsed):
    rows, _ = parsed

    assert [row["gridcode"] for row in rows] == [8, 9, 3, 10]
    for row, source in zip(rows, SOURCE["features"]):
        assert to_shape(row["geometry"]).equals_exact(shape(source["geometry"]), 0)


def test_display_only_shows_hazardous_bands(parsed):
    _, geojson = parsed
    display = _display_geometry(geojson)

    assert not display.intersects(shape(BAND_3["geometry"]))
    for band in (BAND_8, BAND_9, BAND_10):
        assert display.contains(shape(band["geometry"]).representative_point())


def test_display_merges_adjacent_bands_into_one_polygon(parsed):
    _, geojson = parsed
    display = _display_geometry(geojson)

    # Bands 8 and 9 become one plain rectangle: the shared edge between them
    # is gone, and so are the collinear vertices where it met the outline.
    merged = [p for p in display.geoms if p.contains(Point(-122.449, 37.7505))]
    assert len(merged) == 1
    assert len(merged[0].exterior.coords) == 5
    assert len(display.geoms) == 2


def test_display_drops_small_wiggles_but_keeps_real_shape(parsed):
    rows, geojson = parsed
    display = _display_geometry(geojson)
    display_ys = {y for p in display.geoms for _, y in p.exterior.coords}

    assert WIGGLE_Y not in display_ys
    assert 37.7405 in display_ys
    # The DB row for band 10 still has the wiggle.
    db_band_10 = to_shape(rows[3]["geometry"])
    assert any(y == WIGGLE_Y for p in db_band_10.geoms for _, y in p.exterior.coords)


def test_display_coordinates_serialize_with_at_most_six_decimals(parsed):
    _, geojson = parsed
    serialized = json.dumps(geojson)

    assert re.search(r"\d\.\d{7,}", serialized) is None


def test_display_geojson_is_valid(parsed):
    _, geojson = parsed

    FeatureCollection.model_validate(geojson)
    assert _display_geometry(geojson).is_valid


def test_display_is_empty_when_no_band_is_hazardous(handler):
    rows, geojson = handler.parse_data(
        {"type": "FeatureCollection", "features": [BAND_3]}
    )

    assert len(rows) == 1
    assert geojson == {"type": "FeatureCollection", "features": []}
    FeatureCollection.model_validate(geojson)
