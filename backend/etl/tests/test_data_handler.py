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
        {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.413289566, 37.797485886],
                    },
                    "properties": {
                        "tier": "3",
                        "data_loaded_at": "2025-01-15T01:03:50.028",
                        "block": "0149",
                        "property_address": "1632 TAYLOR ST",
                        "status": "Work Complete, CFC Issued",
                        "bos_district": "3",
                        "lot": "094",
                        "address": "1632 TAYLOR ST, SAN FRANCISCO CA",
                        "parcel_number": "0149094",
                        "data_as_of": "2025-01-15T01:02:43.989",
                    },
                }
            ],
        },
        {"type": "FeatureCollection", "features": []},  # Empty page to end pagination
    ]

    mock_response = Mock()
    mock_response.json.side_effect = mock_responses
    mock_response.raise_for_status.return_value = None

    mock_session = Mock()
    mock_session.get.return_value = mock_response

    with patch("requests.Session") as mock_session_class:
        mock_session_class.return_value = mock_session

        result = data_handler.fetch_data()

        assert len(result["features"]) == 3  # Should have features
        assert (
            mock_session.get.call_count == 3
        )  # Should make 3 calls (2 with data, 1 empty)

        first_call = mock_session.get.call_args_list[0]
        assert first_call[1]["params"] == {"$offset": 0}
        second_call = mock_session.get.call_args_list[1]
        assert second_call[1]["params"] == {"$offset": 2}
        third_call = mock_session.get.call_args_list[2]
        assert third_call[1]["params"] == {"$offset": 3}


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
