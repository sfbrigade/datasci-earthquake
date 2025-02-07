import pytest
from unittest.mock import Mock, patch
import requests
from sqlalchemy import Column, Integer
from backend.etl.data_handler import DataHandler
from backend.api.models.base import Base


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
    return DummyDataHandler(url="https://api.test.com", table=DummyModel)


def test_fetch_data_success(data_handler):
    """Test successful data fetching with pagination"""

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

        assert len(result["features"]) == 2
        assert mock_session.get.call_count == 1

        first_call = mock_session.get.call_args_list[0]
        assert first_call[1]["params"] == {"$offset": 0, "$limit": 1000}


def test_fetch_data_partial_page():
    """Test that pagination stops when receiving fewer records than page_size"""
    
    page_size = 3
    handler = DummyDataHandler("http://test.url", DummyModel, page_size=page_size)
    
    # Create mock responses
    full_page_response = Mock()
    full_page_response.json.return_value = {
        "type": "FeatureCollection",
        "features": [
            {"id": 0},
            {"id": 1},
            {"id": 2},
        ]
    }
    
    partial_page_response = Mock()
    partial_page_response.json.return_value = {
        "type": "FeatureCollection",
        "features": [
            {"id": 3},
            {"id": 4},
        ]
    }
    
    mock_session = Mock()
    mock_session.get.side_effect = [full_page_response, partial_page_response]
    
    with patch('requests.Session', return_value=mock_session):
        with patch('time.sleep', return_value=None):  # Skip sleep delays
            result = handler.fetch_data()
            
            # Verify API calls
            assert mock_session.get.call_count == 2
        
            # Verify pagination params
            calls = mock_session.get.call_args_list
            assert calls[0][1]['params'] == {"$offset": 0, "$limit": page_size}
            assert calls[1][1]['params'] == {"$offset": 3, "$limit": page_size}
            
            # Verify content
            all_features = result["features"]
            assert len(all_features) == 5
            assert all_features[0]["id"] == 0
            assert all_features[-1]["id"] == 4


def test_fetch_data_request_exception(data_handler):
    """Test handling of request exceptions"""
    mock_session = Mock()
    mock_session.get.side_effect = requests.RequestException("API Error")

    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = mock_session

        with pytest.raises(requests.RequestException):
            data_handler.fetch_data()


def test_fetch_data_session_cleanup(data_handler):
    """Test that the session is properly closed"""
    mock_session = Mock()
    mock_response = Mock()
    mock_response.json.return_value = {"features": []}
    mock_response.raise_for_status.return_value = None
    mock_session.get.return_value = mock_response

    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = mock_session

        data_handler.fetch_data()

        mock_session.close.assert_called_once()
