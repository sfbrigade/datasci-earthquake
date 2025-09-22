from backend.api.tests.test_session_config import test_engine, test_session, client
import logging


def test_composite_hazards_lookup(client, caplog):
    """
    Test the composite hazard lookup endpoint with coordinates that are expected
    to return 'exists=True' for at least one hazard type (based on init.sql data).
    """
    caplog.set_level(logging.INFO)

    # Use known coordinates that exist in the test DB (update if needed)
    lon = -125.9
    lat = 37.8

    response = client.get(f"/api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200

    data = response.json()
    assert "soft_story" in data
    assert "liquefaction" in data
    assert "tsunami" in data

    # Based on the test data, we might expect specific outcomes.
    # This is an example; adjust based on your `init.sql` data.
    assert data["soft_story"]["exists"] is False
    assert data["liquefaction"]["exists"] is True
    assert data["tsunami"]["exists"] is False

    # Also check that last_updated is a valid datetime string or None
    assert data["liquefaction"]["last_updated"] is not None

    # The original assertion might not work since we removed the logging
    # assert "Checking soft story status" in caplog.text or "Checking liquefaction" in caplog.text
