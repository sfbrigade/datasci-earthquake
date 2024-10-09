import pytest
from fastapi.testclient import TestClient
# Will the .. be stable?
from ..main import app
from ..schemas import Polygon


@pytest.fixture
def client():
    return TestClient(app)


def test_delete_polygon(client):
    response = client.delete("/api/polygons/1?database_name=seismic")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_polygon(client):
    response = client.put("/api/polygons/1?database_name=seismic",
                          json=Polygon().model_dump())
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_post_polygon(client):
    response = client.put("/api/polygons/1?database_name=seismic",
                          json=Polygon().model_dump())
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_polygon(client):
    response = client.get("/api/polygons/1?database_name=seismic")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_seismic_risk(client):
    response = client.get("/api/seismic-risk/address")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False