"""
Test the API of tsunami.py.
"""

import pytest
from fastapi.testclient import TestClient

# Will the .. be stable?
from ..main import app
from ..schemas import Polygon


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


def test_get_tsunami_risk(client):
    response = client.get("/api/tsunami-risk/addresss")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False
