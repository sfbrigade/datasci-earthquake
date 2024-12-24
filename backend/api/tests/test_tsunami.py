from backend.api.tests.test_session_config import client


def test_get_tsunami_zones(client):
    response = client.get(f"/tsunami-zones/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 1


def test_is_in_tsunami_zone(client):
    lat, lon = [37.759039, -122.509515]
    response = client.get(f"/api/tsunami/is-in-tsunami-zone?lat={lat}&lon={lon}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be in our tsunami zone
    wrong_lat, wrong_lon = [0.0, 0.0]
    response = client.get(
        f"/api/tsunami/is-in-tsunami-zone?lat={wrong_lat}&lon={wrong_lon}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
