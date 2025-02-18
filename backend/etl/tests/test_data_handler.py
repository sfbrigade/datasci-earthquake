import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from sqlalchemy import Column, Integer
from backend.etl.data_handler import DataHandler
from backend.api.models.base import Base
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
from unittest.mock import call


class DummyModel(Base):
    """Dummy model for testing"""

    __tablename__ = "test_table"
    id = Column(Integer, primary_key=True)


class DummyDataHandler(DataHandler):
    """Concrete implementation of DataHandler for testing"""

    def parse_data(self, data: dict) -> list[dict]:
        return [data]


@pytest.fixture
def data_handler():
    return DummyDataHandler(url="https://api.test.com", table=DummyModel, page_size=3)


def test_fetch_data_success(data_handler, caplog):
    """Test successful data fetching with pagination"""

    # Arrange
    stubbed_responses = [
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
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.465245267, 37.783172916],
                    },
                    "properties": {
                        "id": 3,
                    },
                },
            ],
        },
        {
            "type": "FeatureCollection",
            "features": [],
        },
    ]

    mock_response = Mock()
    mock_response.json.side_effect = stubbed_responses
    mock_response.raise_for_status.return_value = None

    data_handler.session = Mock()
    data_handler.session.get.return_value = mock_response

    # Act
    result = data_handler.fetch_data()

    # Assert
    assert len(result["features"]) == 3
    assert data_handler.session.get.call_count == 2

    first_call = data_handler.session.get.call_args_list[0]
    assert first_call[1]["params"] == {"$offset": 0, "$limit": 3}
    assert "Completed pagination" in caplog.text
    assert "Request completed successfully" in caplog.text
    assert "URL: https://api.test.com" in caplog.text


def test_fetch_data_partial_page(data_handler, caplog):
    """Test that pagination stops when receiving fewer records than page_size"""

    # Arrange
    # Create mock response objects instead of plain dictionaries, to simulate a response object.
    full_page_response = Mock()
    full_page_response.json.return_value = {
        "type": "FeatureCollection",
        "features": [
            {"id": 0},
            {"id": 1},
            {"id": 2},
        ],
    }
    full_page_response.status_code = 200
    full_page_response.raise_for_status.return_value = None

    partial_page_response = Mock()
    partial_page_response.json.return_value = {
        "type": "FeatureCollection",
        "features": [
            {"id": 3},
            {"id": 4},
        ],
    }
    partial_page_response.status_code = 200
    partial_page_response.raise_for_status.return_value = None

    data_handler.session = Mock()
    data_handler.session.get.side_effect = [full_page_response, partial_page_response]

    # Act
    result = data_handler.fetch_data()

    # Assert
    assert len(result["features"]) == 5
    assert data_handler.session.get.call_count == 2
    calls = data_handler.session.get.call_args_list
    assert calls[0][1]["params"] == {"$offset": 0, "$limit": 3}
    assert calls[1][1]["params"] == {"$offset": 3, "$limit": 3}
    assert result["features"][0]["id"] == 0
    assert result["features"][-1]["id"] == 4
    assert "Assuming final page and stopping fetch" in caplog.text


def test_fetch_data_request_exception(data_handler, caplog):
    """Test handling of request exceptions"""

    # Arrange
    data_handler.session = Mock()
    data_handler.session.get.side_effect = requests.RequestException("API Error")

    # Act
    with pytest.raises(requests.RequestException):
        data_handler.fetch_data()

    # Assert
    assert data_handler.session.get.call_count == 1
    assert "Data fetch failed" in caplog.text
    assert "API Error" in caplog.text


def test_fetch_data_retry_exhausted(data_handler, caplog):
    """Test that retry mechanism works and eventually exhausts"""

    # Arrange
    retry_strategy = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[404, 429, 500, 502, 503, 504],
        allowed_methods=["GET"],
        raise_on_status=True,
        respect_retry_after_header=True,
    )
    session = requests.Session()
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    mock_response = Mock()
    mock_response.status_code = 500
    mock_response.raise_for_status.side_effect = requests.HTTPError(
        "500 Server Error", response=mock_response
    )
    mock_response.json.return_value = {"error": "Server Error"}

    # Replace the session's get method but keep retry configuration
    session.get = Mock(return_value=mock_response)
    data_handler.session = session

    # Act
    with pytest.raises(requests.HTTPError) as exc_info:
        data_handler.fetch_data()

    # Assert
    assert session.get.call_count == 6  # 1 initial + 5 retries
    assert "Request failed:" in caplog.text
    assert "500 Server Error" in caplog.text
    calls = [call for call in caplog.records if "Closed session" in call.message]
    assert len(calls) == 1


def test_fetch_data_session_cleanup(data_handler, caplog):
    """Test that the session is properly closed"""

    # Arrange
    mock_response = Mock()
    mock_response.json.return_value = {"features": []}
    mock_response.raise_for_status.return_value = None

    data_handler.session = Mock()
    data_handler.session.get.return_value = mock_response

    # Act
    data_handler.fetch_data()

    # Assert
    assert data_handler.session.close.call_count == 1
    assert "Closed session" in caplog.text
