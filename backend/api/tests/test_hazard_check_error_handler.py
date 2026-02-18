import pytest
from unittest.mock import patch, MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from backend.api.exceptions import HazardCheckError
from api.index import hazard_check_error_handler


@pytest.fixture
def app():
    app = FastAPI()
    app.add_exception_handler(HazardCheckError, hazard_check_error_handler)

    @app.get("/test-hazard-check-error")
    def trigger_hazard_check_error():
        raise HazardCheckError(zone="test_zone", lon=1.23, lat=4.56)

    return app


@pytest.fixture
def client(app):
    return TestClient(app)


@patch("sentry_sdk.capture_exception")
@patch("sentry_sdk.flush")
def test_hazard_check_error_handler(
    mock_flush: MagicMock, mock_capture_exception: MagicMock, client: TestClient, caplog
):
    """
    GIVEN a FastAPI application with a HazardCheckError exception handler
    WHEN a HazardCheckError is raised
    THEN the handler should log the error, capture the exception with Sentry, and return a 500 response
    """
    with caplog.at_level("ERROR"):
        response = client.get("/test-hazard-check-error")

    # Verify that the correct status code and detail are returned
    assert response.status_code == 500
    assert response.json() == {
        "detail": "An unexpected error occurred while checking test_zone status."
    }

    # Verify that the error was logged
    assert "Error checking test_zone status for coordinates: lon=1.23, lat=4.56" in caplog.text

    # Verify that Sentry's capture_exception and flush were called
    mock_capture_exception.assert_called_once()
    mock_flush.assert_called_once_with(timeout=2.0)
