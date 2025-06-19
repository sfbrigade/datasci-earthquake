import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from sqlalchemy import Column, Integer, String
from backend.etl.data_handler import DataHandler
from backend.api.models.base import Base
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
from unittest.mock import call
from backend.etl.retry import LoggingRetry
from backend.etl.request_handler import RequestHandler
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.api.config import settings
from sqlalchemy.dialects.postgresql import Insert
from sqlalchemy.dialects.postgresql import insert as pg_insert
from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy import text


class DummyModel(Base):
    """Dummy model for testing"""

    __tablename__ = "test_table"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    value = Column(Integer)
    data_changed_at = Column(DateTime)

class DummyDataHandler(DataHandler):
    """Concrete implementation of DataHandler for testing"""

    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        return [data], {"type": "FeatureCollection", "features": data}
    
    def insert_policy(self) -> dict:
        """Default behavior: Do nothing on conflict"""
        return {}

class TimestampDataHandler(DataHandler):
    """Handler that updates based on timestamp"""
    
    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        return [data], {"type": "FeatureCollection", "features": data}
    
    def insert_policy(self) -> dict:
        """Update only if new data is newer"""
        return {
            "name": text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                        "THEN EXCLUDED.name ELSE test_table.name END"),
            "value": text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                         "THEN EXCLUDED.value ELSE test_table.value END"),
            "data_changed_at": text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                                   "THEN EXCLUDED.data_changed_at ELSE test_table.data_changed_at END")
        }


@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(settings.localhost_database_url_sqlalchemy)
    connection = engine.connect()
    
    # We own this code, so we can create our tables!
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    
    transaction = connection.begin()
    Session = scoped_session(sessionmaker(bind=connection))
    session = Session()
    session.begin_nested()

    yield session

    session.rollback()
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())
    session.commit()
    session.close()
    connection.close()

@pytest.fixture
def data_handler():
    return DummyDataHandler(url="https://api.test.com", table=DummyModel, page_size=3)


@pytest.fixture
def fast_retry_session():
    """Create a session with fast retry settings for testing"""
    retry_strategy = LoggingRetry(
        total=5,
        backoff_factor=0.1,  # Fast backoff for tests
        status_forcelist=[504],
        allowed_methods=["GET"],
        raise_on_status=True,
    )

    session = requests.Session()
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


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
    data_handler.request_handler = RequestHandler(
        data_handler.session, data_handler.logger
    )

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
    data_handler.request_handler = RequestHandler(
        data_handler.session, data_handler.logger
    )

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
    data_handler.request_handler = RequestHandler(
        data_handler.session, data_handler.logger
    )

    # Act
    with pytest.raises(requests.RequestException):
        data_handler.fetch_data()

    # Assert
    assert data_handler.session.get.call_count == 1
    assert "Data fetch failed" in caplog.text
    assert "API Error" in caplog.text


def test_fetch_data_retry_exhausted(fast_retry_session, caplog):
    """Test that retry mechanism works and eventually exhausts"""
    # Create handler with fast retry session
    data_handler = DummyDataHandler(
        url="https://httpstat.us/504",
        table=DummyModel,
        page_size=3,
        session=fast_retry_session,
    )

    # Act
    with pytest.raises(requests.exceptions.RetryError) as exc_info:
        data_handler.fetch_data()

    # Assert
    assert "Retry Attempt 3 of 5" in caplog.text
    assert "Max retries (5) exceeded. Giving up." in caplog.text
    assert "too many 504 error responses" in str(exc_info.value)
    assert "Closed session" in caplog.text


def test_fetch_data_session_cleanup(data_handler, caplog):
    """Test that the session is properly closed"""

    # Arrange
    mock_response = Mock()
    mock_response.json.return_value = {"features": []}
    mock_response.raise_for_status.return_value = None

    data_handler.session = Mock()
    data_handler.session.get.return_value = mock_response
    data_handler.request_handler = RequestHandler(
        data_handler.session, data_handler.logger
    )

    # Act
    data_handler.fetch_data()

    # Assert
    assert data_handler.session.close.call_count == 1
    assert "Closed session" in caplog.text

def test_bulk_insert_data_with_basic_policy(test_db, data_handler):
    """
    As implemented in DummyModel, bulk_insert_data should insert into the database, and shouldn't update existing fields on conflict (upsert)

    Implementation tested:
    def insert_policy(self, insert: Insert, id_field):
        return insert.values(data_dicts).on_conflict_do_nothing(index_elements=[id_field])
    """
    # by default, data_handler.db is the production db.
    # maybe this should be changed depending on the environment?
    data_handler.db = test_db
    # Setup initial data
    existing = DummyModel(id=1, name="old name", value=100, data_changed_at=datetime(2024, 1, 1, 12, 0))
    test_db.add(existing)
    test_db.commit()

    # Attempt upsert with new data
    new_data_1 = {"id": 1, "name": "new name", "value": 200, "data_changed_at": datetime(2024, 1, 1, 12, 0)}
    new_data_2 = {"id": 2, "name": "new name", "value": 200, "data_changed_at": datetime(2024, 1, 1, 12, 0)}
    data_handler.bulk_insert_data([new_data_1, new_data_2], 'id')

    print("All records in table:")
    all_records = test_db.query(DummyModel).all()
    for record in all_records:
        print(f"ID: {record.id}, Name: {record.name}, Value: {record.value}")

    # Verify no fields were updated
    result = test_db.query(DummyModel).filter_by(id=1).first()
    assert result.name == "old name"
    assert result.value == 100

    # Verify New Data 2 was added
    result = test_db.query(DummyModel).filter_by(id=2).first()
    assert result.name == "new name"
    assert result.value == 200

def test_bulk_insert_data_with_timestamp_upsert_policy(test_db):
    """Test timestamp-based upsert policy"""
    timestamp_handler = TimestampDataHandler(url="https://api.test.com", table=DummyModel, page_size=3)
    timestamp_handler.db = test_db
    
    # Setup initial data with older timestamp
    existing = DummyModel(
        id=1, 
        name="old name", 
        value=100,
        data_changed_at=datetime(2024, 1, 1, 12, 0)
    )
    test_db.add(existing)
    test_db.commit()

    # Test data with newer timestamp - should update
    data_to_insert = [{
        "id": 1,
        "name": "new name", 
        "value": 200,
        "data_changed_at": datetime(2024, 1, 2, 12, 0)
    }]
    
    timestamp_handler.bulk_insert_data(data_to_insert, 'id')
    
    # Verify update happened
    result = test_db.query(DummyModel).filter_by(id=1).first()
    assert result.name == "new name"
    assert result.value == 200

def test_bulk_insert_data_with_basic_policy(test_db, data_handler):
    """
    Test that basic policy (empty dict) does nothing on conflict
    """
    data_handler.db = test_db
    
    # Setup initial data
    existing = DummyModel(id=1, name="old name", value=100, data_changed_at=datetime(2024, 1, 1, 12, 0))
    test_db.add(existing)
    test_db.commit()

    # Attempt upsert with new data
    new_data_1 = {"id": 1, "name": "new name", "value": 200, "data_changed_at": datetime(2024, 1, 1, 12, 0)}
    new_data_2 = {"id": 2, "name": "new name", "value": 200, "data_changed_at": datetime(2024, 1, 1, 12, 0)}
    data_handler.bulk_insert_data([new_data_1, new_data_2], 'id')

    print("All records in table:")
    all_records = test_db.query(DummyModel).all()
    for record in all_records:
        print(f"ID: {record.id}, Name: {record.name}, Value: {record.value}")

    # Verify no fields were updated (conflict ignored)
    result = test_db.query(DummyModel).filter_by(id=1).first()
    assert result.name == "old name"
    assert result.value == 100

    # Verify New Data 2 was added
    result = test_db.query(DummyModel).filter_by(id=2).first()
    assert result.name == "new name"
    assert result.value == 200
