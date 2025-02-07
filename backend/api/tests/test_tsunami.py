from backend.api.tests.test_session_config import test_session, test_engine, client


def test_get_tsunami_zones(client):
    response = client.get(f"api/tsunami-zones")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 1


def test_is_in_tsunami_zone(client):
    lon, lat = [-122.4, 37.75]
    response = client.get(f"api/tsunami-zones/is-in-tsunami-zone?lon={lon}&lat={lat}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in our tsunami zone
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"api/tsunami-zones/is-in-tsunami-zone?lon={wrong_lon}&lat={wrong_lat}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
