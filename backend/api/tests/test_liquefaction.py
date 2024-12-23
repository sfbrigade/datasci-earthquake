"""
Test the API of liquefaction_api.py.
"""

import pytest
from fastapi.testclient import TestClient

# Will the .. be stable?
from ..main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_is_in_liquefaction_zone(client):
    lat, lon = [37.779759, -122.407436]
    response = client.get(
        f"/api/liquefaction-zones/is-in-liquefaction-zone?lat={lat}&lon={lon}"
    )
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in liquefaction zones
    wrong_lat, wrong_lon = [0.0, 0.0]
    response = client.get(
        f"/api/liquefaction-zones/is-in-liquefaction-zone?lat={wrong_lat}&lon={wrong_lon}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
