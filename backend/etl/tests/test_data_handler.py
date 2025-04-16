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
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy import text
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.etl.tsunami_data_handler import TsunamiDataHandler
from backend.etl.soft_story_properties_data_handler import _SoftStoryPropertiesDataHandler


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
    def insert_policy(self, insert: Insert, data_dicts, id_field):
        return insert.values(data_dicts).on_conflict_do_nothing(index_elements=[id_field])
class SomeOtherModel(Base):
    __tablename__ = "other_table"
    id = Column(Integer, primary_key=True)
    sensitive_data = Column(String)

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

def test_bulk_insert_data_with_wrong_table_insert_policy(test_db, data_handler):
    """
    Verify that insert_policy cannot modify unexpected tables
    Verify that insert_policy must return the right type
    """
    existing = DummyModel(id=1, name="safe data", value=100, data_changed_at=datetime(2024, 1, 1, 12, 0))
    test_db.add(existing)
    test_db.commit()

    def malicious_insert_policy(insert, data_dicts, id_field):
        # Try to target a different table
        return pg_insert(SomeOtherModel)

    def incorrect_return_type_insert_policy(insert, data_dicts, id_fields):
        return "meow"

    data_handler.insert_policy = malicious_insert_policy

    with pytest.raises(ValueError, match="Update policy attempted to modify table"):
        data_handler.bulk_insert_data([{"id": 1}], 'id')
    
    data_handler.insert_policy = incorrect_return_type_insert_policy

    with pytest.raises(TypeError, match="Update policy returned incorrect type"):
        data_handler.bulk_insert_data([{"id": 1}], 'id')


    

def test_bulk_insert_data_with_timestamp_upsert_policy(test_db, data_handler):
    """
    Tests that bulk_insert_data updates existing records only when the new data 
    has a more recent data_changed_at timestamp
    """
    data_handler.db = test_db
    
    # Setup initial data with an older timestamp
    existing = DummyModel(
        id=1, 
        name="old name", 
        value=100,
        data_changed_at=datetime(2024, 1, 1, 12, 0)  # January 1st noon
    )
    test_db.add(existing)
    test_db.commit()

    # Three test cases: newer timestamp, older timestamp, and new record
    data_to_insert = [
        {   # Case 1: Newer timestamp - should update
            "id": 1,
            "name": "new name",
            "value": 200,
            "data_changed_at": datetime(2024, 1, 2, 12, 0)  # January 2nd
        },
        {   # Case 2: Older timestamp - should not update
            "id": 2,
            "name": "won't stick",
            "value": 300,
            "data_changed_at": datetime(2024, 1, 1, 11, 0)  # January 1st 11am
        },
        {   # Case 3: New record - should insert
            "id": 3,
            "name": "totally new",
            "value": 400,
            "data_changed_at": datetime(2024, 1, 1, 12, 0)
        }
    ]
    def timestamp_insert_policy(base_stmt: Insert, data_dicts: list[dict], id_field: str) -> Insert:
        return (
            base_stmt.values(data_dicts)
            .on_conflict_do_update(
                index_elements=[id_field],
                # The EXCLUDED table represents the row that would have been inserted
                # So EXCLUDED.data_changed_at is the new timestamp
                set_=dict(
                    name=text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at THEN EXCLUDED.name ELSE test_table.name END"),
                    value=text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at THEN EXCLUDED.value ELSE test_table.value END"),
                    data_changed_at=text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at THEN EXCLUDED.data_changed_at ELSE test_table.data_changed_at END")
                )
            )
        )
    data_handler.insert_policy = timestamp_insert_policy
    data_handler.bulk_insert_data(data_to_insert, 'id')

    # Check Case 1: Should have updated because newer timestamp
    result = test_db.query(DummyModel).filter_by(id=1).first()
    assert result.name == "new name"
    assert result.value == 200
    assert result.data_changed_at == datetime(2024, 1, 2, 12, 0)

    # Check Case 2: Should not have updated because older timestamp
    result = test_db.query(DummyModel).filter_by(id=2).first()
    assert result.name == "won't stick"
    assert result.value == 300
    assert result.data_changed_at == datetime(2024, 1, 1, 11, 0)

    # Check Case 3: Should have inserted new record
    result = test_db.query(DummyModel).filter_by(id=3).first()
    assert result.name == "totally new"
    assert result.value == 400
    assert result.data_changed_at == datetime(2024, 1, 1, 12, 0)

# Tests for handler specific insert policies:
@pytest.fixture
def tsunami_data_handler(test_db):
    TSUNAMI_URL = "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query"
    handler = TsunamiDataHandler(TSUNAMI_URL, TsunamiZone)
    handler.db = test_db
    return handler
def test_bulk_insert_data_with_tsunami_policy(test_db, tsunami_data_handler):
    """
    TsunamiDataHandler's insert_policy should preserve existing records on conflict,
    following the conservation.ca.gov dataset handling requirements.
    """
    tsunami_data_handler.db = test_db
    
    # Setup initial data with real SF Bay geometry
    existing = TsunamiZone(
        identifier=1,
        evacuate="YES",
        county="San Francisco",
        global_id="sf123",
        shape_length=1.0,
        shape_area=1.0,
        geometry="MULTIPOLYGON(((-122.5 37.7,-122.5 37.9,-122.3 37.9,-122.3 37.7,-122.5 37.7)))"
    )
    test_db.add(existing)
    test_db.commit()

    # Attempt insert with conflicting and new data
    new_data_1 = {
        "identifier": 1,
        "evacuate": "NO",  # Changed
        "county": "Orange County",  # Changed
        "global_id": "sf123",
        "shape_length": 2.0,  # Changed
        "shape_area": 2.0,  # Changed
        "geometry": "MULTIPOLYGON(((-122.5 37.7,-122.5 37.9,-122.3 37.9,-122.3 37.7,-122.5 37.7)))"
    }
    new_data_2 = {
        "identifier": 2,
        "evacuate": "YES",
        "county": "Marin",
        "global_id": "marin456",
        "shape_length": 3.0,
        "shape_area": 3.0,
        "geometry": "MULTIPOLYGON(((-122.4 37.75,-122.4 37.85,-122.35 37.85,-122.35 37.75,-122.4 37.75)))"
    }
    
    tsunami_data_handler.bulk_insert_data([new_data_1, new_data_2], 'global_id')

    # Print for debugging
    print("All records in table:")
    all_records = test_db.query(TsunamiZone).all()
    for record in all_records:
        print(f"ID: {record.identifier}, County: {record.county}, Evacuate: {record.evacuate}")

    # Verify original record wasn't updated
    result = test_db.query(TsunamiZone).filter_by(identifier=1).first()
    assert result.county == "San Francisco"
    assert result.evacuate == "YES"
    assert result.shape_length == 1.0
    assert result.shape_area == 1.0

    # Verify new record was added
    result = test_db.query(TsunamiZone).filter_by(identifier=2).first()
    assert result.county == "Marin"
    assert result.evacuate == "YES"
    assert result.shape_length == 3.0
    assert result.shape_area == 3.0
@pytest.fixture
def soft_story_data_handler(test_db):
    
    _SOFT_STORY_PROPERTIES_URL = "https://data.sfgov.org/resource/beah-shgi.geojson"
    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL,
        SoftStoryProperty,
        mapbox_api_key="meow",
    )
    handler.db = test_db
    return handler
def test_bulk_insert_data_with_soft_story_policy(test_db, soft_story_data_handler):
    """
    SoftStoryDataHandler's insert_policy should:
    - Update all fields when sfdata_as_of is newer
    - Only update sfdata_loaded_at when data is older but loaded_at is newer
    - Always update update_timestamp when any change occurs
    """
    soft_story_data_handler.db = test_db
    
    # Setup initial data
    existing = SoftStoryProperty(
        identifier=1,
        block="123",
        lot="A",
        parcel_number="123A",
        property_address="123 Main St",
        address="123 Main St, SF",
        tier=1,
        status="Active",
        bos_district=6,
        point="POINT(-122.4194 37.7749)",
        sfdata_as_of=datetime(2024, 1, 1),
        sfdata_loaded_at=datetime(2024, 1, 1),
        point_source="geocoded"
    )
    test_db.add(existing)
    test_db.commit()

    # Test case 1: Newer data should update everything
    newer_data = {
        "identifier": 1,
        "block": "456",
        "lot": "B",
        "parcel_number": "456B",
        "property_address": "456 Main St",
        "address": "456 Main St, SF",
        "tier": 2,
        "status": "Completed",
        "bos_district": 8,
        "point": "POINT(-122.4194 37.7749)",
        "sfdata_as_of": datetime(2024, 2, 1),
        "sfdata_loaded_at": datetime(2024, 2, 1),
        "point_source": "manual"
    }

    # Test case 2: Older data with newer loaded_at
    older_data = {
        "identifier": 2,
        "block": "789",
        "lot": "C",
        "parcel_number": "789C",
        "property_address": "789 Main St",
        "address": "789 Main St, SF",
        "tier": 3,
        "status": "Pending",
        "bos_district": 9,
        "point": "POINT(-122.4194 37.7749)",
        "sfdata_as_of": datetime(2023, 12, 1),
        "sfdata_loaded_at": datetime(2024, 2, 2),
        "point_source": "geocoded"
    }

    # Test case 3: Same data_as_of but newer loaded_at
    same_date_data = {
        "identifier": 3,
        "block": "123",
        "lot": "A",
        "parcel_number": "123A",
        "property_address": "123 Oak St",
        "address": "123 Oak St, SF",
        "tier": 1,
        "status": "Active",
        "bos_district": 6,
        "point": "POINT(-122.4194 37.7749)",
        "sfdata_as_of": datetime(2024, 1, 1),
        "sfdata_loaded_at": datetime(2024, 2, 3),
        "point_source": "geocoded"
    }

    # Perform bulk insert
    soft_story_data_handler.bulk_insert_data([newer_data, older_data, same_date_data], 'identifier')

    # Print for debugging
    print("\nAll records in table:")
    all_records = test_db.query(SoftStoryProperty).all()
    for record in all_records:
        print(f"ID: {record.identifier}, Address: {record.property_address}, LoadedAt: {record.sfdata_loaded_at}, AsOf: {record.sfdata_as_of}")

    # Verify Case 1: Newer data should update everything
    result = test_db.query(SoftStoryProperty).filter_by(identifier=1).first()
    assert result.block == "456"
    assert result.lot == "B"
    assert result.parcel_number == "456B"
    assert result.property_address == "456 Main St"
    assert result.tier == 2
    assert result.status == "Completed"
    assert result.bos_district == 8
    assert result.point_source == "manual"
    assert result.sfdata_as_of == datetime(2024, 2, 1, tzinfo=timezone.utc)
    assert result.sfdata_loaded_at == datetime(2024, 2, 1, tzinfo=timezone.utc)
    assert result.update_timestamp is not None  # Should have been updated

    # Verify Case 2: Older data creates new record
    result = test_db.query(SoftStoryProperty).filter_by(identifier=2).first()
    assert result.block == "789"
    assert result.sfdata_loaded_at == datetime(2024, 2, 2, tzinfo=timezone.utc)

    # Verify Case 3: Same date data creates new record
    result = test_db.query(SoftStoryProperty).filter_by(identifier=3).first()
    assert result.block == "123"
    assert result.sfdata_loaded_at == datetime(2024, 2, 3, tzinfo=timezone.utc)
