from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_liquefaction_zones(client):
    response = client.get(f"/liquefaction-zones/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 3


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
