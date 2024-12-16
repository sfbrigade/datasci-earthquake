import pytest
from backend.api.tests.test_session_config import test_engine, test_session, client


def test_get_address(client):
    id = "495990-764765-0"
    response = client.get(f"/api/addresses/{id}")
    print(response)
    assert response.status_code == 200
