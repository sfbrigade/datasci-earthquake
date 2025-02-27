from backend.api.tests.test_session_config import test_engine, test_session, client
import logging


def test_get_soft_stories(client):
    response = client.get("api/soft-stories")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 6


def test_is_soft_story(client, caplog):
    """Test soft story check with logging verification"""
    caplog.set_level(logging.INFO)

    # Test existing soft story
    lon, lat = [-122.424968, 37.76293]
    response = client.get(f"api/soft-stories/is-soft-story?lon={lon}&lat={lat}")

    assert response.status_code == 200
    assert response.json()["exists"]
    assert response.json()["last_updated"] is not None
    assert (
        f"Checking soft story status for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
    assert "Soft story check result" in caplog.text
    assert f"exists: {response.json()['exists']}" in caplog.text

    # Test non-existent soft story
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"api/soft-stories/is-soft-story?lon={wrong_lon}&lat={wrong_lat}"
    )

    assert response.status_code == 200
    assert not response.json()["exists"]
    assert response.json()["last_updated"] is None
    assert (
        f"Checking soft story status for coordinates: lon={wrong_lon}, lat={wrong_lat}"
        in caplog.text
    )
    assert "exists: False" in caplog.text
