from backend.api.tests.test_session_config import test_engine, test_session, client
import logging
from .utils import assert_database_error_returns_500


def test_lookup_hazards_all_present(client, caplog):
    """Test composite hazard lookup for a point within all three hazard zones"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.41211, 37.80541]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["soft_story"]["exists"] is True
    assert body["soft_story"]["last_updated"] is not None

    assert body["liquefaction"]["exists"] is True
    assert body["liquefaction"]["last_updated"] is not None

    assert body["tsunami"]["exists"] is True
    assert body["tsunami"]["last_updated"] is not None

    assert f"Checking composite hazards for coordinates: lon={lon}, lat={lat}" in caplog.text
    assert "Composite hazard check result" in caplog.text


def test_lookup_hazards_partial(client, caplog):
    """Test composite hazard lookup for a point within some, but not all, hazard zones"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.35, 37.83]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["soft_story"]["exists"] is False
    assert body["soft_story"]["last_updated"] is None

    assert body["liquefaction"]["exists"] is True
    assert body["liquefaction"]["last_updated"] is not None

    assert body["tsunami"]["exists"] is True
    assert body["tsunami"]["last_updated"] is not None


def test_lookup_hazards_none_present(client, caplog):
    """Test composite hazard lookup for a point outside all hazard zones"""
    caplog.set_level(logging.INFO)

    lon, lat = [0.0, 0.0]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["soft_story"] == {"exists": False, "last_updated": None}
    assert body["liquefaction"] == {"exists": False, "last_updated": None}
    assert body["tsunami"] == {"exists": False, "last_updated": None}


def test_lookup_hazards_ping(client, caplog):
    caplog.set_level(logging.INFO)

    response = client.get("api/hazards/lookup?ping=true")

    assert response.status_code == 200
    body = response.json()
    assert body["soft_story"] == {"exists": False, "last_updated": None}
    assert body["liquefaction"] == {"exists": False, "last_updated": None}
    assert body["tsunami"] == {"exists": False, "last_updated": None}
    assert "Pinging the hazards lookup endpoint" in caplog.text


def test_lookup_hazards_missing_params(client, caplog):
    caplog.set_level(logging.WARN)

    response = client.get("api/hazards/lookup", params={"lon": -122.424968})
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("api/hazards/lookup", params={"lat": 37.76293})
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("api/hazards/lookup")
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text


def test_lookup_hazards_database_error_returns_500(client, caplog):
    assert_database_error_returns_500(
        client,
        caplog,
        "api/hazards/lookup?lon=0&lat=0",
        "Error checking composite status",
    )
