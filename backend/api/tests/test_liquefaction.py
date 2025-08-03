from backend.api.tests.test_session_config import test_engine, test_session, client
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_get_liquefaction_zones(client):
    response = client.get("/api/liquefaction-zones")
    response_dict = response.json()
    logger.info(f"Response: {response_dict}")

    assert (
        response.status_code == 200
    ), f"Expected status code 200, but got {response.status_code}"
    assert len(response_dict["features"]) == 3


def test_is_in_high_susceptibility_liquefaction_zone(client, caplog):
    """Test high-susceptibility liquefaction zone check with logging verification"""
    caplog.set_level(logging.INFO)

    # Test point in high-susceptibility liquefaction zone
    lon, lat = [-124.15, 30.42]
    response = client.get(
        f"api/liquefaction-zones/is-in-liquefaction-zone?lon={lon}&lat={lat}"
    )

    assert response.status_code == 200
    json = response.json()
    assert json["exists"]
    assert json["last_updated"] is not None
    assert json["liq"] == "H"
    assert (
        f"Checking liquefaction zone for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
    assert "Liquefaction zone check result" in caplog.text
    assert f"exists: {json['exists']}" in caplog.text


def test_is_in_very_high_susceptibility_liquefaction_zone(client, caplog):
    """Test very-high-susceptibility liquefaction zone check with logging verification"""
    caplog.set_level(logging.INFO)

    # Test point in very-high-susceptibility liquefaction zone
    lon, lat = [-122.35, 37.83]
    response = client.get(
        f"api/liquefaction-zones/is-in-liquefaction-zone?lon={lon}&lat={lat}"
    )

    assert response.status_code == 200
    json = response.json()
    assert json["exists"]
    assert json["last_updated"] is not None
    assert json["liq"] == "VH"
    assert (
        f"Checking liquefaction zone for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
    assert "Liquefaction zone check result" in caplog.text
    assert f"exists: {json['exists']}" in caplog.text


def test_is_in_liquefaction_zone(client, caplog):
    """Test liquefaction zone check with logging verification"""
    caplog.set_level(logging.INFO)

    # Test point in liquefaction zone
    lon, lat = [-122.35, 37.83]
    response = client.get(
        f"api/liquefaction-zones/is-in-liquefaction-zone?lon={lon}&lat={lat}"
    )

    assert response.status_code == 200
    assert response.json()["exists"]
    assert response.json()["last_updated"] is not None
    assert (
        f"Checking liquefaction zone for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
    assert "Liquefaction zone check result" in caplog.text
    assert f"exists: {response.json()['exists']}" in caplog.text


def test_outside_liquefaction_zones(client, caplog):
    """Test outside all liquefaction zones with logging verification"""
    caplog.set_level(logging.INFO)

    # Test point not in any liquefaction zone
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"api/liquefaction-zones/is-in-liquefaction-zone?lon={wrong_lon}&lat={wrong_lat}"
    )

    assert response.status_code == 200
    json = response.json()
    assert not json["exists"]
    assert json["last_updated"] is None
    assert (
        f"Checking liquefaction zone for coordinates: lon={wrong_lon}, lat={wrong_lat}"
        in caplog.text
    )
    assert "exists: False" in caplog.text


def test_is_in_liquefaction_zone_missing_params(client, caplog):
    caplog.set_level(logging.WARN)
    response = client.get(
        "api/liquefaction-zones/is-in-liquefaction-zone", params={"lon": -122.424968}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get(
        "api/liquefaction-zones/is-in-liquefaction-zone", params={"lat": 37.76293}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("api/liquefaction-zones/is-in-liquefaction-zone")
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text
