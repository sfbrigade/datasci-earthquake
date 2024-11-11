"""
Test the API of polygons.py.
"""

import pytest
from fastapi.testclient import TestClient
from ..schemas import Polygon
from ..main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_post_polygon(client):
    table_name = "seismic"
    response = client.put(
        "/api/polygons/?table_name={table_name}", json=Polygon().model_dump()
    )
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_polygon(client):
    polygon_id = 1
    table_name = "seismic"
    response = client.put(
        "/api/polygons/{polygon_id}?table_name={table_name}",
        json=Polygon().model_dump(),
    )
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_polygon(client):
    polygon_id = 1
    table_name = "seismic"
    response = client.get("/api/polygons/{polygon_id}?table_name={table_name}")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_delete_polygon(client):
    polygon_id = 1
    table_name = "seismic"
    response = client.delete("/api/polygons/{polygon_id}?table_name={table_name}")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False
