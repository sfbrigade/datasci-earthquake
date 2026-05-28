import pytest
from unittest.mock import patch, MagicMock, Mock
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError
from backend.database.session import get_db
from api.index import app


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def override_get_db():
    """A mock database session that raises an exception when queried"""
    mock_db = Mock()
    # Make db.query() raise SQLAlchemyError when called
    mock_db.query.side_effect = SQLAlchemyError("A mock database error occurred")
    yield mock_db


@patch("sentry_sdk.capture_exception")
@patch("sentry_sdk.flush")
def test_sentry_capture_on_hazard_api_error(
    mock_flush: MagicMock, mock_capture_exception: MagicMock, client: TestClient
):
    """
    GIVEN a running FastAPI application with a mocked database session
    WHEN a request to a hazard API endpoint triggers a database error
    THEN Sentry's capture_exception should be called
    """
    # Override the database dependency to return a mock that raises on query
    app.dependency_overrides[get_db] = override_get_db

    # Make a request to an endpoint that uses the database
    response = client.get("/api/liquefaction-zones/is-in-liquefaction-zone?lon=1&lat=1")

    # Verify that a 500 error was returned
    assert response.status_code == 500

    # Verify that Sentry's capture_exception and flush were called
    mock_capture_exception.assert_called_once()
    mock_flush.assert_called_once_with(timeout=2.0)

    # Clean up the dependency override
    app.dependency_overrides = {}
