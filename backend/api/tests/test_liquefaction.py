import pytest
from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_liquefaction_zones(client):
    response = client.get(f"/liquefaction-zones/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 3
