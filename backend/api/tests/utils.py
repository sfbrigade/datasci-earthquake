import logging
from unittest.mock import Mock
from sqlalchemy.exc import SQLAlchemyError
from backend.database.session import get_db
from api.index import app


def assert_database_error_returns_500(
    client, caplog, endpoint_url, expected_log_message
):
    """
    Minimal helper to verify that database errors return a 500 status code
    and log the appropriate error message with an Error ID.
    """

    def mock_get_db():
        db = Mock()
        db.query.side_effect = SQLAlchemyError("Database error")
        yield db

    app.dependency_overrides[get_db] = mock_get_db
    try:
        with caplog.at_level(logging.ERROR):
            response = client.get(endpoint_url)

            assert response.status_code == 500
            error_id = response.json().get("error_id")
            assert error_id is not None
            assert expected_log_message in caplog.text
            assert f"Error ID: {error_id}" in caplog.text
    finally:
        app.dependency_overrides.pop(get_db, None)
