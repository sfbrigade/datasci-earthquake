from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_liquefaction_zones(client):
    response = client.get(f"/liquefaction-zones/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 3


def test_is_in_liquefaction_zone(client):
    lon, lat = [-122.35, 37.83]
    response = client.get(
        f"/liquefaction-zones/is-in-liquefaction-zone?lon={lon}&lat={lat}"
    )
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in liquefaction zones
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"/liquefaction-zones/is-in-liquefaction-zone?lon={wrong_lon}&lat={wrong_lat}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
