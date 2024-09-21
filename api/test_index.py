"""
Test the API of index.py.
"""
import pytest
from fastapi.testclient import TestClient
# Why the . before index?  Will this be stable?
# The FastAPI tutorial says to do it.
from .index import app
from .schemas import Polygon


@pytest.fixture
def client():
    return TestClient(app)


def test_delete_tsunami_polygon(client):
    response = client.delete("/api/tsunami-polygon/1")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_tsunami_polygon(client):
    response = client.put("/api/tsunami-polygon/1",
                          json=Polygon().model_dump())
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_post_tsunami_polygon(client):
    response = client.put("/api/tsunami-polygon/1",
                          json=Polygon().model_dump())
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_tsunami_polygon(client):
    response = client.get("/api/tsunami-polygon/1")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_tsunami_risk(client):
    response = client.get("/api/tsunami-risk/addresss")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_delete_seismic_polygon(client):
    response = client.delete("/api/seismic-polygon/1")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_post_seismic_polygon(client):
    response = client.put("/api/seismic-polygon/1",
                          json=Polygon().model_dump())
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_seismic_polygon(client):
    response = client.put("/api/seismic-polygon/1",
                          json=Polygon().model_dump())
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_seismic_polygon(client):
    response = client.get("/api/seismic-polygon/1")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_seismic_risk(client):
    response = client.get("/api/seismic-risk/address")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_delete_soft_story(client):
    response = client.delete("/api/soft-story/address")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_soft_story(client):
    response = client.put("/api/soft-story/address?soft-story=true")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_post_soft_story(client):
    response = client.put("/api/soft-story/address?soft-story=true")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_soft_story(client):
    response = client.get("/api/soft-story/address")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_delete_combined_risks(client):
    response = client.delete("/api/combined-risks/address")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_put_combined_risks(client):
    response = client.put("/api/combined-risks/address",
                          json={"soft-story": True, "seismic": True,
                                "tsunami": True})
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_post_combined_risks(client):
    response = client.post("/api/combined-risks/address",
                          json={"soft-story": True, "seismic": True,
                                "tsunami": True})
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False


def test_get_combined_risks(client):
    response = client.get("/api/combined-risks/address")
    assert response.status_code == 200
    # Temporary guaranteed failure until test is written
    assert False