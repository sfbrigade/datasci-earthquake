from backend.api.tests.test_session_config import test_engine, test_session, client
import logging
from .utils import assert_database_error_returns_500

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_get_fema_zone(client, caplog):
    """Test FEMA earthquake risk zone check with logging verification"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.4, 37.8]
    response = client.get(f"api/fema/get-fema-zone?lon={lon}&lat={lat}")

    assert response.status_code == 200
    json = response.json()
    assert json["exists"]
    assert json["last_updated"] is not None
    assert json["risk_rating"] == "Very High"
    assert json["risk_score"] == 98.78
    assert (
        f"Checking FEMA earthquake risk zone for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
    assert "FEMA earthquake risk zone check result" in caplog.text
    assert f"exists: {json['exists']}" in caplog.text


def test_outside_fema_zones(client, caplog):
    """Test point outside all FEMA earthquake risk zones with logging verification"""
    caplog.set_level(logging.INFO)

    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(f"api/fema/get-fema-zone?lon={wrong_lon}&lat={wrong_lat}")

    assert response.status_code == 200
    json = response.json()
    assert not json["exists"]
    assert json["last_updated"] is None
    assert json["risk_rating"] is None
    assert json["risk_score"] is None
    assert (
        f"Checking FEMA earthquake risk zone for coordinates: lon={wrong_lon}, lat={wrong_lat}"
        in caplog.text
    )
    assert "exists: False" in caplog.text


def test_get_fema_zone_ping(client):
    """Test ping short-circuits without hitting the database"""
    response = client.get("api/fema/get-fema-zone?ping=true")

    assert response.status_code == 200
    json = response.json()
    assert not json["exists"]
    assert json["last_updated"] is None
    assert json["risk_rating"] is None
    assert json["risk_score"] is None


def test_get_fema_zone_missing_params(client, caplog):
    caplog.set_level(logging.WARN)
    response = client.get("api/fema/get-fema-zone", params={"lon": -122.424968})
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("api/fema/get-fema-zone", params={"lat": 37.76293})
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("api/fema/get-fema-zone")
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text


def test_get_fema_zone_database_error_returns_500(client, caplog):
    assert_database_error_returns_500(
        client,
        caplog,
        "api/fema/get-fema-zone?lon=0&lat=0",
        "Error checking fema status",
    )
