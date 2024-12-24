from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_address_by_id(client):
    id = "495990-764765-0"
    response = client.get(f"/addresses/{id}")
    response_dict = response.json()
    assert response.status_code == 200
    assert response_dict["properties"]["address"] == "46 AUBURN ST"
    assert response_dict["geometry"]["coordinates"] == [-122.41228, 37.77967]


def test_get_addresses(client):
    response = client.get(f"/addresses/")
    response_dict = response.json()
    assert response.status_code == 200
    assert len(response_dict["features"]) == 2
