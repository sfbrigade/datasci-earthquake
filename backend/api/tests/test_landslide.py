from backend.api.tests.test_session_config import client, test_engine, test_session
import logging
from .utils import assert_database_error_returns_500


def test_get_landslide_zones(client):
    """GET /api/landslide-zones returns only gridcode 8/9/10 zones."""
    response = client.get("/api/landslide-zones")
    response_dict = response.json()

    assert response.status_code == 200
    assert len(response_dict["features"]) == 2
    gridcodes = {f["properties"]["gridcode"] for f in response_dict["features"]}
    assert gridcodes == {8, 10}


def test_is_in_landslide_zone(client, caplog):
    """Test high-susceptibility landslide zone check with logging verification."""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.43, 37.72]
    response = client.get(f"/api/landslide-zones/is-in-landslide-zone?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()
    assert body["exists"] is True
    assert body["last_updated"] is not None
    assert body["gridcode"] == 10
    assert (
        f"Checking landslide zone for coordinates: lon={lon}, lat={lat}" in caplog.text
    )
    assert "Landslide zone check result" in caplog.text
    assert f"exists: {body['exists']}" in caplog.text


def test_is_in_landslide_zone_excludes_low_gridcode(client, caplog):
    """A point only inside a low-gridcode zone should not match."""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.32, 37.88]
    response = client.get(f"/api/landslide-zones/is-in-landslide-zone?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()
    assert body["exists"] is False
    assert body["last_updated"] is None
    assert body["gridcode"] is None


def test_outside_landslide_zones(client, caplog):
    """Test outside all landslide zones with logging verification."""
    caplog.set_level(logging.INFO)

    lon, lat = [0.0, 0.0]
    response = client.get(f"/api/landslide-zones/is-in-landslide-zone?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()
    assert body["exists"] is False
    assert body["last_updated"] is None
    assert body["gridcode"] is None
    assert (
        f"Checking landslide zone for coordinates: lon={lon}, lat={lat}" in caplog.text
    )
    assert "exists: False" in caplog.text


def test_is_in_landslide_zone_ping(client, caplog):
    caplog.set_level(logging.INFO)

    response = client.get("/api/landslide-zones/is-in-landslide-zone?ping=true")

    assert response.status_code == 200
    body = response.json()
    assert body == {"exists": False, "last_updated": None, "gridcode": None}
    assert "Pinging the is-in-landslide-zone endpoint" in caplog.text


def test_is_in_landslide_zone_missing_params(client, caplog):
    caplog.set_level(logging.WARN)

    response = client.get(
        "/api/landslide-zones/is-in-landslide-zone", params={"lon": -122.424968}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get(
        "/api/landslide-zones/is-in-landslide-zone", params={"lat": 37.76293}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("/api/landslide-zones/is-in-landslide-zone")
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text


def test_is_in_landslide_zone_database_error_returns_500(client, caplog):
    assert_database_error_returns_500(
        client,
        caplog,
        "/api/landslide-zones/is-in-landslide-zone?lon=0&lat=0",
        "Error checking landslide status",
    )
