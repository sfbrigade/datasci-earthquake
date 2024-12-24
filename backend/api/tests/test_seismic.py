from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_seismic_hazard_zones(client):
    response = client.get(f"/seismic-zones/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 2


def test_is_in_seismic_zone(client):
    lon, lat = [-122.407436, 37.779759]
    response = client.get(f"/seismic-zones/is-in-seismic-zone?lon={lon}&lat={lat}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in a seismic hazard zone
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"/seismic-zones/is-in-seismic-zone?lon={wrong_lon}&lat={wrong_lat}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
