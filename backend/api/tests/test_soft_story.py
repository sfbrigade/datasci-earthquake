from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_soft_stories(client):
    response = client.get("/soft-stories/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 6


def test_is_soft_story(client):
    lon, lat = [-122.424968, 37.76293]
    response = client.get(f"/soft-stories/is-soft-story?lon={lon}&lat={lat}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be soft stories
    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"/soft-stories/is-soft-story?lon={wrong_lon}&lat={wrong_lat}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
