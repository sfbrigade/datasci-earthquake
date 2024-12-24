import pytest
from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_landslide_zones(client):
    response = client.get(f"/landslide-zones/")
    response_dict = response.json()
    print(response_dict["features"])
    assert response.status_code == 200
    assert len(response_dict["features"]) == 2
