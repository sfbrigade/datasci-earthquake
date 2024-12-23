import pytest
from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_seismic_hazard_zones(client):
    response = client.get(f"/seismic-zones/")
    response_dict = response.json()
    print(response_dict)
    assert response.status_code == 200
    assert len(response_dict) == 2


def test_is_in_seismic_zone(client):
    lat, lon = [37.779759, -122.407436]
    response = client.get(f"/api/seismic-zones/is-in-seismic-zone?lat={lat}&lon={lon}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in a seismic hazard zone
    wrong_lat, wrong_lon = [0.0, 0.0]
    response = client.get(
        f"/api/seismic-zones/is-in-seismic-zone?lat={wrong_lat}&lon={wrong_lon}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
