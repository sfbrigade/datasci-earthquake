"""
Test the API of tsunami.py.
"""

import pytest
from fastapi.testclient import TestClient

# Will the .. be stable?
from ..main import app
from ..schemas.geo import Polygon


@pytest.fixture
def client():
    return TestClient(app)


def test_delete_tsunami_polygon(client):
    response = client.delete("/api/polygons/1?table_name=tsunami")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_tsunami_polygon(client):
    response = client.put(
        "/api/polygons/1?table_name=tsunami", json=Polygon().model_dump()
    )
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_post_tsunami_polygon(client):
    response = client.put(
        "/api/polygons/1?table_name=tsunami", json=Polygon().model_dump()
    )
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_tsunami_polygon(client):
    response = client.get("/api/polygons/1?table_name=tsunami")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_is_in_tsunami_zone(client):
    lat, lon = [37.759039, -122.509515]
    response = client.get(f"/api/tsunami/is-in-tsunami-zone?lat={lat}&lon={lon}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in our tsunami zone
    wrong_lat, wrong_lon = [0.0, 0.0]
    response = client.get(f"/api/tsunami/is-in-tsunami-zone?lat={wrong_lat}&lon={wrong_lon}")
    assert response.status_code == 200
    assert not response.json()  # False
