import pytest
from unittest.mock import Mock
import requests
import responses
from sqlalchemy import Column, Integer, String
from backend.etl.data_handler import DataHandler
from backend.api.models.base import Base
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
from unittest.mock import call, patch, MagicMock
from backend.etl.retry import LoggingRetry
from backend.etl.request_handler import RequestHandler
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.api.config import settings
from sqlalchemy.dialects.postgresql import Insert
from sqlalchemy.dialects.postgresql import insert as pg_insert
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy import text
from backend.database.session import _get_database_url
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.etl.tsunami_data_handler import TsunamiDataHandler
from backend.api.models.export_metadata import ExportMetadata
from backend.etl.soft_story_properties_data_handler import (
    _SoftStoryPropertiesDataHandler,
)
import os
import json
from pathlib import Path


class DummyModel(Base):
    """Dummy model for testing"""

    __tablename__ = "test_table"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    value = Column(Integer)
    data_changed_at = Column(DateTime)
    update_timestamp = Column(DateTime(timezone=True))


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
            "name": text(
                "CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                "THEN EXCLUDED.name ELSE test_table.name END"
            ),
            "value": text(
                "CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                "THEN EXCLUDED.value ELSE test_table.value END"
            ),
            "data_changed_at": text(
                "CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                "THEN EXCLUDED.data_changed_at ELSE test_table.data_changed_at END"
            ),
        }


@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(_get_database_url())
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


def create_test_db_context_manager(test_db):
    def test_db_context():
        try:
            yield test_db
        except Exception:
            test_db.rollback()
            raise

    return test_db_context


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


@responses.activate
def test_fetch_data_retry_exhausted(fast_retry_session, caplog):
    """Test that retry mechanism works and eventually exhausts"""

    fake_url = "https://fake.test/504"

    # Simulate 6 (1 initial attempt and 5 retries) consecutive 504 responses
    for _ in range(6):
        responses.add(
            responses.GET,
            fake_url,
            status=504,
            json={},
        )

    # Create handler with fast retry session
    data_handler = DummyDataHandler(
        url=fake_url,
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


def test_bulk_insert_data_with_timestamp_upsert_policy(test_db):
    """Test timestamp-based upsert policy"""

    # Setup initial data with older timestamp
    existing = DummyModel(
        id=1, name="old name", value=100, data_changed_at=datetime(2024, 1, 1, 12, 0)
    )
    test_db.add(existing)
    test_db.commit()

    timestamp_handler = TimestampDataHandler(
        url="https://api.test.com",
        table=DummyModel,
        page_size=3,
    )
    timestamp_handler.db_getter = create_test_db_context_manager(test_db)

    # Test data with newer timestamp - should update
    data_to_insert = [
        {
            "id": 1,
            "name": "new name",
            "value": 200,
            "data_changed_at": datetime(2024, 1, 2, 12, 0),
        }
    ]

    timestamp_handler.bulk_insert_data(data_to_insert, "id")

    # Verify update happened
    result = test_db.query(DummyModel).filter_by(id=1).first()
    assert result.name == "new name"
    assert result.value == 200


def test_bulk_insert_data_with_basic_policy(test_db, data_handler):
    """
    Test that basic policy (empty dict) does nothing on conflict
    """
    # Setup initial data
    existing = DummyModel(
        id=1, name="old name", value=100, data_changed_at=datetime(2024, 1, 1, 12, 0)
    )
    test_db.add(existing)
    test_db.commit()

    data_handler.db_getter = create_test_db_context_manager(test_db)

    # Attempt upsert with new data
    new_data_1 = {
        "id": 1,
        "name": "new name",
        "value": 200,
        "data_changed_at": datetime(2024, 1, 1, 12, 0),
    }
    new_data_2 = {
        "id": 2,
        "name": "new name",
        "value": 200,
        "data_changed_at": datetime(2024, 1, 1, 12, 0),
    }
    data_handler.bulk_insert_data([new_data_1, new_data_2], "id")

    # Verify no fields were updated (conflict ignored)
    result = test_db.query(DummyModel).filter_by(id=1).first()
    assert result.name == "old name"
    assert result.value == 100

    # Verify New Data 2 was added
    result = test_db.query(DummyModel).filter_by(id=2).first()
    assert result.name == "new name"
    assert result.value == 200


def test_get_last_export_time_from_db(test_db):
    """Test the last export time lookup"""
    data_handler = DummyDataHandler(url="", table=DummyModel)
    data_handler.db_getter = create_test_db_context_manager(test_db)

    # Add new metadata row with timestamp (use timezone-aware datetime)
    now = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
    row = ExportMetadata(dataset_name="DummyModel", last_exported_at=now)
    test_db.add(row)
    test_db.commit()

    # Assert that the latest timestamp is returned
    result = data_handler._get_last_export_time_from_db()
    assert result == now


def test_get_last_export_time_from_db_not_found(test_db):
    """Test the last export time lookup when the data is unavailable. The method should return the earliest date possible"""
    data_handler = DummyDataHandler(url="", table=DummyModel)
    data_handler.db_getter = create_test_db_context_manager(test_db)

    # No row exists
    result = data_handler._get_last_export_time_from_db()
    assert result == datetime.min


def test_data_changed_since_last_export_true(test_db):
    """Test when data in db is newer than last export (should return True)"""
    data_handler = DummyDataHandler(url="", table=DummyModel)
    data_handler.db_getter = create_test_db_context_manager(test_db)

    # New data in db: 2025-01-01 12:00
    row = DummyModel(
        id=1,
        name="old name",
        value=100,
        update_timestamp=datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc),
    )
    test_db.add(row)
    test_db.commit()

    # Last export time: 2024-01-01 12:00 (older)
    assert (
        data_handler._data_changed_since_last_export(
            datetime(2024, 1, 1, 12, 0, tzinfo=timezone.utc)
        )
        is True
    )


def test_data_changed_since_last_export_false(test_db):
    """Test when data in db is older than last export (should return False)"""
    data_handler = DummyDataHandler(url="", table=DummyModel)
    data_handler.db_getter = create_test_db_context_manager(test_db)

    # New data in db: 2024-01-01 12:00
    row = DummyModel(
        id=1,
        name="old name",
        value=100,
        update_timestamp=datetime(2024, 1, 1, 12, 0, tzinfo=timezone.utc),
    )
    test_db.add(row)
    test_db.commit()

    # Last export time: 2025-01-01 12:00 (newer)
    assert (
        data_handler._data_changed_since_last_export(
            datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
        )
        is False
    )


def test_update_last_export_time_in_db(test_db):
    """Test creation and updates of a row in the ExportMetadata table"""
    data_handler = DummyDataHandler(url="", table=DummyModel)
    data_handler.db_getter = create_test_db_context_manager(test_db)

    # Populate the ExportMetadata data with the datetime.utcnow() timestamp
    data_handler._update_last_export_time_in_db()
    row = test_db.query(ExportMetadata).filter_by(dataset_name="DummyModel").first()
    assert row is not None
    first_time = row.last_exported_at

    # Update the timestamp of the existing row
    data_handler._update_last_export_time_in_db()
    row2 = test_db.query(ExportMetadata).filter_by(dataset_name="DummyModel").first()
    second_time = row2.last_exported_at

    assert second_time >= first_time


def test_save_geojson_file(tmp_path):
    """Test that geojsons are saved"""
    data_handler = DummyDataHandler(url="", table=DummyModel)
    features = {"type": "FeatureCollection", "features": [{"id": 1}]}

    # Create a path where the geojson is going to be saved
    geojson_path = tmp_path / "test.geojson"

    data_handler._save_geojson_file(features, geojson_path)
    with open(geojson_path) as f:
        data = json.load(f)
    assert data == features


def test_export_geojson_if_changed_on_prod_data_changed(tmp_path, monkeypatch):
    data_handler = DummyDataHandler(url="", table=DummyModel)
    features = {"type": "FeatureCollection", "features": [{"id": 1}]}
    monkeypatch.setenv("ENVIRONMENT", "prod")

    # Patch methods to simulate data changed
    with patch.object(
        data_handler, "_get_last_export_time_from_db", return_value=datetime(2024, 1, 1)
    ):
        with patch.object(
            data_handler, "_data_changed_since_last_export", return_value=True
        ):
            with patch.object(data_handler, "_save_geojson_file") as mock_save:
                with patch.object(
                    data_handler, "_update_last_export_time_in_db"
                ) as mock_update:
                    data_handler.export_geojson_if_changed(features)
                    mock_save.assert_called_once()
                    mock_update.assert_called_once()


def test_export_geojson_if_changed_on_prod_data_not_changed(tmp_path, monkeypatch):
    data_handler = DummyDataHandler(url="", table=DummyModel)
    features = {"type": "FeatureCollection", "features": [{"id": 1}]}
    monkeypatch.setenv("ENVIRONMENT", "prod")

    # Patch methods to simulate data did not change
    with patch.object(
        data_handler, "_get_last_export_time_from_db", return_value=datetime(2024, 1, 1)
    ):
        with patch.object(
            data_handler, "_data_changed_since_last_export", return_value=False
        ):
            with patch.object(data_handler, "_save_geojson_file") as mock_save:
                with patch.object(
                    data_handler, "_update_last_export_time_in_db"
                ) as mock_update:
                    data_handler.export_geojson_if_changed(features)
                    mock_save.assert_not_called()
                    mock_update.assert_not_called()
