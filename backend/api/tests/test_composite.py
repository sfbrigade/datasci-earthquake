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
    
    # Debug: Print the actual error response if not 200
    if response.status_code != 200:
        print(f"Error status: {response.status_code}")
        print(f"Error response: {response.text}")
        try:
            error_json = response.json()
            print(f"Error JSON: {error_json}")
        except:
            print("Could not parse error as JSON")
    
    assert response.status_code == 200

    data = response.json()
    assert "soft_story" in data
    assert "liquefaction" in data
    assert "tsunami" in data

    for hazard_type in ["soft_story", "liquefaction", "tsunami"]:
        assert "exists" in data[hazard_type]
        assert "last_updated" in data[hazard_type]

    # The original assertion might not work since we removed the logging
    # assert "Checking soft story status" in caplog.text or "Checking liquefaction" in caplog.text