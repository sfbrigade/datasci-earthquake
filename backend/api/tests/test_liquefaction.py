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

    assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
    assert "high_susceptibility" in response_dict, "Expected 'high_susceptibility' in response"
    assert "very_high_susceptibility" in response_dict, "Expected 'very_high_susceptibility' in response"

    # Check the number of features in each collection
    high_susceptibility_features = response_dict["high_susceptibility"]["features"]
    very_high_susceptibility_features = response_dict["very_high_susceptibility"]["features"]

    logger.info(f"High Susceptibility Features: {high_susceptibility_features}")
    logger.info(f"Very High Susceptibility Features: {very_high_susceptibility_features}")

    assert len(high_susceptibility_features) == 2, "Expected 2 features with 'H'"
    assert len(very_high_susceptibility_features) == 1, "Expected 1 feature with 'VH'"


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

    # Test point not in liquefaction zone
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"api/liquefaction-zones/is-in-liquefaction-zone?lon={wrong_lon}&lat={wrong_lat}"
    )

    assert response.status_code == 200
    assert not response.json()["exists"]
    assert response.json()["last_updated"] is None
    assert (
        f"Checking liquefaction zone for coordinates: lon={wrong_lon}, lat={wrong_lat}"
        in caplog.text
    )
    assert "exists: False" in caplog.text


def test_is_in_liquefaction_zone_ping(client, caplog):
    response = client.get(f"api/liquefaction-zones/is-in-liquefaction-zone?ping=true")
    response_dict = response.json()
    assert response.status_code == 200
    assert response_dict["exists"] is False
    assert response_dict["last_updated"] is None
    assert "Pinging the is-in-liquefaction-zone endpoint" in caplog.text


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
