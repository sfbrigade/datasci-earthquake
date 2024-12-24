from backend.api.tests.test_session_config import client


def test_get_soft_stories(client):
    response = client.get(f"/soft-stories/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 6


def test_is_soft_story(client):
    lat, lon = [-122.446575165, 37.766034349]
    response = client.get(f"/api/soft-story/is-soft-story?lat={lat}&lon={lon}")
    assert response.status_code == 200
    assert response.json()  # True

    # These should not be soft stories
    wrong_lat, wrong_lon = [0.0, 0.0]
    response = client.get(
        f"/api/soft-story/is-soft-story?lat={wrong_lat}&lon={wrong_lon}"
    )
    assert response.status_code == 200
    assert not response.json()  # False
