"""
Test the API of soft_story.py.
"""

import pytest
from fastapi.testclient import TestClient

# Will the .. be stable?
from ..main import app


@pytest.fixture
def client():
    return TestClient(app)


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


def test_is_soft_story(client):
    lat, lon = [-122.446575165, 37.766034349]
    response = client.get(f"/api/soft-story/is-soft-story?lat={lat}&lon={lon}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be soft stories
    wrong_lat, wrong_lon = [0.0, 0.0]
    response = client.get(
        f"/api/soft-story/is-soft-story?lat={wrong_lat}&lon={wrong_lon}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
