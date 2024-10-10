"""
Test the API of combined_risks.py.
"""
import pytest
from fastapi.testclient import TestClient
# Will the .. be stable?
from ..index import app
from ..schemas import Polygon


@pytest.fixture
def client():
    return TestClient(app)


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