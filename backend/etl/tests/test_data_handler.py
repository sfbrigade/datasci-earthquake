import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from sqlalchemy import Column, Integer
from backend.etl.data_handler import DataHandler
from backend.api.models.base import Base
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
from http.client import HTTPMessage
import json


class DummyModel(Base):
    """Dummy model for testing"""

    __tablename__ = "test_table"
    id = Column(Integer, primary_key=True)


class DummyDataHandler(DataHandler):
    """Concrete implementation of DataHandler for testing"""

    def parse_data(self, data: dict) -> list[dict]:
        return []


@pytest.fixture
def mock_session():
    mock_session = MagicMock()
    retry_strategy = Retry(
        total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    mock_session.mount("http://", adapter)
    mock_session.mount("https://", adapter)
    return mock_session


@pytest.fixture
def data_handler(mock_session):
    return DummyDataHandler(
        url="http://test.url",
        table=DummyModel,
        page_size=3,
        session=mock_session,
    )


def test_fetch_data_success(data_handler, caplog):
    """Test successful data fetching with pagination"""
    caplog.set_level(logging.INFO)
    mock_responses = [
        {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.431421543, 37.781306175],
                    },
                    "properties": {
                        "tier": "2",
                        "data_loaded_at": "2025-01-15T01:03:50.028",
                        "block": "0749",
                        "property_address": "1445 EDDY ST",
                        "status": "Work Complete, CFC Issued",
                        "bos_district": "5",
                        "lot": "006A",
                        "address": "1445 EDDY ST, SAN FRANCISCO CA",
                        "parcel_number": "0749006A",
                        "data_as_of": "2025-01-15T01:02:43.989",
                    },
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.465245267, 37.783172916],
                    },
                    "properties": {
                        "tier": "4",
                        "data_loaded_at": "2025-01-15T01:03:50.028",
                        "block": "1427",
                        "property_address": "544 CLEMENT ST",
                        "status": "Work Complete, CFC Issued",
                        "bos_district": "1",
                        "lot": "019",
                        "address": "544 CLEMENT ST, SAN FRANCISCO CA",
                        "parcel_number": "1427019",
                        "data_as_of": "2025-01-15T01:02:43.989",
                    },
                },
            ],
        },
    ]

    mock_response = Mock()
    mock_response.json.side_effect = mock_responses
    mock_response.raise_for_status.return_value = None

    mock_session = Mock()
    mock_session.get.return_value = mock_response

    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = mock_session

        result = data_handler.fetch_data()

        print("result", result)
        assert len(result["features"]) == 2
        assert mock_session.get.call_count == 1

        first_call = mock_session.get.call_args_list[0]
        assert first_call[1]["params"] == {"$offset": 0, "$limit": 1000}


def test_fetch_data_partial_page(data_handler, caplog):
    """Test fetching data with a partial second page"""
    caplog.set_level(logging.INFO)

    # Create first page response (full page)
    mock_response_1 = MagicMock()
    mock_response_1.json = MagicMock()
    mock_response_1.json.return_value = {
        "features": [{"id": i} for i in range(3)]  # 3 items (page_size)
    }
    mock_response_1.status_code = 200

    # Create second page response (partial page)
    mock_response_2 = MagicMock()
    mock_response_2.json = MagicMock()
    mock_response_2.json.return_value = {
        "features": [{"id": i} for i in range(2)]  # 2 items (less than page_size)
    }
    mock_response_2.status_code = 200

    data_handler.session.get.side_effect = [mock_response_1, mock_response_2]

    # Execute test
    with patch("time.sleep"):  # Skip sleep delays
        result = data_handler.fetch_data()

    assert len(result["features"]) == 5  # Total items (3 + 2)
    assert data_handler.session.get.call_count == 2  # Called twice for two pages

    first_call = data_handler.session.get.call_args_list[0]
    second_call = data_handler.session.get.call_args_list[1]
    assert first_call[1]["params"] == {"$offset": 0, "$limit": 3}  # First page
    assert second_call[1]["params"] == {"$offset": 3, "$limit": 3}  # Second page

    assert "Starting data fetch for DummyModel with params: {}" in caplog.text
    assert (
        "Making request to http://test.url with params {'$offset': 0, '$limit': 3}"
        in caplog.text
    )
    assert (
        "Making request to http://test.url with params {'$offset': 3, '$limit': 3}"
        in caplog.text
    )
    assert "Request completed successfully" in caplog.text
    assert f"URL: {data_handler.url}" in caplog.text
    assert "{'$offset': 0, '$limit': 3}" in caplog.text
    assert "{'$offset': 3, '$limit': 3}" in caplog.text


def test_fetch_data_retry_exhausted(data_handler, caplog):
    """Test handling of request exceptions with retry logic"""
    caplog.set_level(logging.INFO)

    # Create retry strategy
    retry_strategy = Retry(
        total=5,
        backoff_factor=0.1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET", "HEAD", "PUT", "DELETE", "OPTIONS", "TRACE"],
        raise_on_status=True,
    )

    # Create session with retry strategy
    session = requests.Session()
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    # Create mock responses that will fail
    def get_with_retries(*args, **kwargs):
        # Track which attempt this is
        get_with_retries.calls += 1
        print(f"\n=== Request Attempt {get_with_retries.calls} ===")

        if get_with_retries.calls == 1:
            raise requests.exceptions.ConnectionError("Connection refused")
        elif get_with_retries.calls == 2:
            raise requests.exceptions.Timeout("Request timed out")
        else:
            raise requests.exceptions.RequestException("Server error")

    # Initialize call counter
    get_with_retries.calls = 0

    # Configure session to use our retry-enabled mock
    session.get = MagicMock(side_effect=get_with_retries)
    data_handler.session = session

    print("\n=== Debug Mock Setup ===")
    print("Configured session with retry strategy:")
    print(f"Max retries: {retry_strategy.total}")
    print(f"Backoff factor: {retry_strategy.backoff_factor}")
    print(f"Status forcelist: {retry_strategy.status_forcelist}")
    print("Configured failures:")
    print("Attempt 1: ConnectionError - Connection refused")
    print("Attempt 2: Timeout - Request timed out")
    print("Attempt 3: RequestException - Server error")

    # Execute test - should raise RequestException after retries
    with pytest.raises(requests.exceptions.RequestException), patch("time.sleep"):
        data_handler.fetch_data()

    # Print captured logs
    print("\n=== Captured Logs ===")
    for record in caplog.records:
        print(f"{record.levelname}: {record.name}: {record.message}")

    # Print call count
    print(f"\n=== Call Count: {get_with_retries.calls} ===")

    # Verify retry attempts
    assert (
        get_with_retries.calls == 3
    ), f"Expected 3 retries, got {get_with_retries.calls}"

    # Verify error logging
    assert "Request failed:" in caplog.text
    assert "Connection refused" in caplog.text
    assert "Request timed out" in caplog.text
    assert "Server error" in caplog.text


def test_fetch_data_request_exception(data_handler):
    """Test handling of request exceptions with retry logic"""
    # Create a session with retry configuration
    retry_strategy = Retry(
        total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)

    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = data_handler.session

        # Mock the get method to always fail
        data_handler.session.get = Mock(
            side_effect=requests.RequestException("API Error")
        )

        with pytest.raises(requests.RequestException):
            data_handler.fetch_data()

        # Verify it tried 5 times
        assert data_handler.session.get.call_count == 5


def test_fetch_data_session_cleanup(data_handler):
    """Test that the session is properly closed"""
    mock_response = Mock()
    mock_response.json.return_value = {"features": []}
    mock_response.raise_for_status.return_value = None
    data_handler.session.get.return_value = mock_response

    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = data_handler.session

        data_handler.fetch_data()

        data_handler.session.close.assert_called_once()
