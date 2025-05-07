from backend.api.tests.test_session_config import test_session, test_engine, client
import logging


def test_get_tsunami_zones(client):
    response = client.get(f"api/tsunami-zones")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 1


def test_is_in_tsunami_zone(client, caplog):
    """Test tsunami zone check with logging verification"""
    caplog.set_level(logging.INFO)

    # Test point in tsunami zone
    lon, lat = [-122.35, 37.83]
    response = client.get(f"api/tsunami-zones/is-in-tsunami-zone?lon={lon}&lat={lat}")

    assert response.status_code == 200
    assert response.json()["exists"]
    assert response.json()["last_updated"] is not None
    assert f"Checking tsunami zone for coordinates: lon={lon}, lat={lat}" in caplog.text
    assert "Tsunami zone check result" in caplog.text
    assert f"exists: {response.json()['exists']}" in caplog.text

    # Test point not in tsunami zone
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"api/tsunami-zones/is-in-tsunami-zone?lon={wrong_lon}&lat={wrong_lat}"
    )

    assert response.status_code == 200
    assert not response.json()["exists"]
    assert response.json()["last_updated"] is None
    assert (
        f"Checking tsunami zone for coordinates: lon={wrong_lon}, lat={wrong_lat}"
        in caplog.text
    )
    assert "exists: False" in caplog.text


def test_is_in_tsunami_zone_ping(client, caplog):
    response = client.get(f"api/tsunami-zones/is-in-tsunami-zone?ping=true")
    response_dict = response.json()
    assert response.status_code == 200
    assert response_dict["exists"] is False
    assert response_dict["last_updated"] is None
    assert "Pinging the is-in-tsunami-zone endpoint" in caplog.text


def test_is_in_tsunami_zone_missing_params(client, caplog):
    caplog.set_level(logging.WARN)
    response = client.get(
        "api/tsunami-zones/is-in-tsunami-zone", params={"lon": -122.424968}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get(
        "api/tsunami-zones/is-in-tsunami-zone", params={"lat": 37.76293}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("api/tsunami-zones/is-in-tsunami-zone")
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text
