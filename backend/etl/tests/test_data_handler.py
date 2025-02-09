import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from sqlalchemy import Column, Integer
from backend.etl.data_handler import DataHandler
from backend.api.models.base import Base
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging

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
    return MagicMock()


@pytest.fixture
def data_handler(mock_session):
    return DummyDataHandler(
        url="http://test.url",
        table=DummyModel,
        page_size=1000,
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


def test_fetch_data_partial_page(data_handler):
    data_handler.session.get.side_effect = [
        MagicMock(
            json=lambda: {"features": [{"id": i} for i in range(1000)]}
        ),
        MagicMock(
            json=lambda: {"features": [{"id": i} for i in range(500)]}
        )
    ]
    
    # Test
    with patch('time.sleep'):
        result = data_handler.fetch_data()
        assert len(result["features"]) == 1500


def test_fetch_data_request_exception(data_handler):
    """Test handling of request exceptions with retry logic"""
    # Create a session with retry configuration
    retry_strategy = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)


    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = data_handler.session
        
        # Mock the get method to always fail
        data_handler.session.get = Mock(side_effect=requests.RequestException("API Error"))
        
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
