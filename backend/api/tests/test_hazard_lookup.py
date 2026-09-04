from backend.api.tests.test_session_config import test_engine, test_session, client
import logging
from .utils import assert_database_error_returns_500
from datetime import datetime, timezone
from backend.api.routers import hazard_lookup_api
from backend.api.schemas.hazard_lookup_schemas import HazardStatus


def test_lookup_hazards_all_present(client, caplog):
    """Test composite hazard lookup for a point within all three hazard zones"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.41211, 37.80541]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["soft_story"]["exists"] is True
    assert body["soft_story"]["last_updated"] is not None
    assert body["soft_story"]["check_failed"] is False

    assert body["liquefaction"]["exists"] is True
    assert body["liquefaction"]["last_updated"] is not None
    assert body["liquefaction"]["check_failed"] is False

    assert body["tsunami"]["exists"] is True
    assert body["tsunami"]["last_updated"] is not None
    assert body["tsunami"]["check_failed"] is False

    assert (
        f"Checking composite hazards for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
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
    assert body["soft_story"]["check_failed"] is False

    assert body["liquefaction"]["exists"] is True
    assert body["liquefaction"]["last_updated"] is not None
    assert body["liquefaction"]["check_failed"] is False

    assert body["tsunami"]["exists"] is True
    assert body["tsunami"]["last_updated"] is not None
    assert body["tsunami"]["check_failed"] is False


def test_lookup_hazards_none_present(client, caplog):
    """Test composite hazard lookup for a point outside all hazard zones"""
    caplog.set_level(logging.INFO)

    lon, lat = [0.0, 0.0]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["soft_story"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }
    assert body["liquefaction"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }
    assert body["tsunami"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }


def test_lookup_hazards_returns_partial_result_when_one_check_fails(
    client, monkeypatch, caplog
):
    """Test composite lookup returns successful checks when one hazard check fails."""
    caplog.set_level(logging.ERROR)
    last_updated = datetime(2026, 8, 5, tzinfo=timezone.utc)

    def fail_soft_story(db, point):
        raise RuntimeError("soft story lookup failed")

    monkeypatch.setattr(hazard_lookup_api, "_check_soft_story", fail_soft_story)
    monkeypatch.setattr(
        hazard_lookup_api,
        "_check_liquefaction",
        lambda db, point: HazardStatus(exists=True, last_updated=last_updated),
    )
    monkeypatch.setattr(
        hazard_lookup_api,
        "_check_tsunami",
        lambda db, point: HazardStatus(exists=False, last_updated=None),
    )

    response = client.get("api/hazards/lookup?lon=-122.35&lat=37.83")

    assert response.status_code == 200
    body = response.json()
    assert body["soft_story"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": True,
    }
    assert body["liquefaction"]["exists"] is True
    assert body["liquefaction"]["check_failed"] is False
    assert body["tsunami"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }
    assert "Soft story hazard check failed" in caplog.text


def test_lookup_hazards_returns_500_when_all_checks_fail(client, monkeypatch, caplog):
    """Test composite lookup raises only when every hazard check fails."""
    caplog.set_level(logging.ERROR)

    def fail_check(db, point):
        raise RuntimeError("lookup failed")

    monkeypatch.setattr(hazard_lookup_api, "_check_soft_story", fail_check)
    monkeypatch.setattr(hazard_lookup_api, "_check_liquefaction", fail_check)
    monkeypatch.setattr(hazard_lookup_api, "_check_tsunami", fail_check)

    response = client.get("api/hazards/lookup?lon=-122.35&lat=37.83")

    assert response.status_code == 500
    assert response.json().get("error_id") is not None
    assert "Error checking composite status" in caplog.text


def test_lookup_hazards_ping(client, caplog):
    caplog.set_level(logging.INFO)

    response = client.get("api/hazards/lookup?ping=true")

    assert response.status_code == 200
    body = response.json()
    assert body["soft_story"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }
    assert body["liquefaction"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }
    assert body["tsunami"] == {
        "exists": False,
        "last_updated": None,
        "check_failed": False,
    }
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
