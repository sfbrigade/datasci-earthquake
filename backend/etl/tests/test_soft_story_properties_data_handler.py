import re
import pytest
from unittest.mock import patch, MagicMock
from backend.etl.soft_story_properties_data_handler import (
    _SoftStoryPropertiesDataHandler,
)
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.etl.mapbox_geojson_manager import MapboxGeojsonManager


@pytest.fixture
def mock_mapbox_manager():
    """
    Returns a MagicMock for MapboxGeojsonManager.
    """
    return MagicMock(spec=MapboxGeojsonManager)


@pytest.fixture
def handler(mock_mapbox_manager):
    """
    Returns an instance of _SoftStoryPropertiesDataHandler
    with a mocked MapboxGeojsonManager.
    """
    # Create instance of the handler
    # The third argument is a dummy API key; in real tests,
    # you might load from environment or pass a mock key.
    test_handler = _SoftStoryPropertiesDataHandler(
        url="dummy_url", table=SoftStoryProperty, mapbox_api_key="mock_api_key"
    )
    # Inject the mock MapboxGeojsonManager
    test_handler.mapbox_geojson_manager = mock_mapbox_manager

    return test_handler


def test_fill_in_missing_mapbox_points(handler, mock_mapbox_manager):
    mock_mapbox_manager.batch_geocode_addresses.return_value = {
        "address1": (123.456, 78.91),
        "address2": (98.765, 43.21),
    }

    parsed_data = [
        {
            "address": "address1",
            "point_source": "sfdata",
            "point": "Point(123.456 78.91)",
        },
        {
            "address": "address2",
            "point_source": "sfdata",
            "point": "Point(123.456 78.91)",
        },
        {"address": "address3", "point_source": None, "point": None},
    ]
    addresses = ["address1", "address2", "address3"]
    result = handler.fill_in_missing_mapbox_points(parsed_data, addresses)
    assert len(result) == 3
    # Happens to be the same as SFData
    assert result[0]["point"] == "Point(123.456 78.91)"
    assert result[0]["point_source"] == "mapbox"
    # Filled in by Mapbox
    assert result[1]["point"] == "Point(98.765 43.21)"
    assert result[1]["point_source"] == "mapbox"
    # Not found in Mapbox, so left as is
    assert result[2]["point"] is None
    assert result[2]["point_source"] is None


def test_parse_data_address_in_mapbox(handler, mock_mapbox_manager):
    """
    Test the scenario where the address is found in the Mapbox GeoJSON.
    The parse_data method should mark the 'point_source' as 'mapbox'
    and retrieve coordinates from the mock Mapbox manager.
    """
    # Address found in the pre-loaded Mapbox GeoJSON
    mock_mapbox_manager.is_address_in_geojson.return_value = True
    mock_mapbox_manager.get_mapbox_coordinates.return_value = (-122.4194, 37.7749)

    sf_data = {
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "block": "1234",
                    "lot": "5678",
                    "parcel_number": "1234-5678",
                    "property_address": "123 Test St",
                    "address": "123 Test St",
                    "tier": "2",
                    "status": "Complete",
                    "bos_district": "District 6",
                    "data_as_of": "2024-01-01",
                    "data_loaded_at": "2024-01-02",
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [-122.1, 37.7],
                },
            }
        ]
    }

    # Act
    parsed = handler.parse_data(sf_data)

    # Assert
    assert len(parsed) == 2
    result = parsed[0][0]

    # Because the address is found in Mapbox GeoJSON,
    # the parse_data method uses the coordinates from the manager
    assert result["point"] == "Point(-122.4194 37.7749)"
    assert result["point_source"] == "mapbox"

    assert result["block"] == "1234"
    assert result["lot"] == "5678"
    assert result["parcel_number"] == "1234-5678"
    assert result["property_address"] == "123 Test St"
    assert result["address"] == "123 Test St"
    assert result["tier"] == "2"
    assert result["status"] == "Complete"
    assert result["bos_district"] == "District 6"
    assert result["sfdata_as_of"] == "2024-01-01"
    assert result["sfdata_loaded_at"] == "2024-01-02"


def test_parse_data_address_not_in_mapbox(handler, mock_mapbox_manager):
    """
    Test the scenario where the address is NOT found in the Mapbox GeoJSON.
    parse_data should initially use the geometry from the feature (if it exists).
    Then, it attempts to fill missing mapbox points in a batch.
    """
    # Arrange
    # Mock that the address is NOT in the pre-loaded Mapbox GeoJSON
    mock_mapbox_manager.is_address_in_geojson.return_value = False
    # Assume that the batch geocode can resolve the address
    mock_mapbox_manager.batch_geocode_addresses.return_value = {
        "123 New Test St": (-122.1234, 37.5678)
    }

    sf_data = {
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "block": "1111",
                    "lot": "2222",
                    "parcel_number": "1111-2222",
                    "property_address": "123 New Test St",
                    "address": "123 New Test St",
                    "tier": None,
                    "status": None,
                    "bos_district": "District 7",
                    "data_as_of": "2024-02-01",
                    "data_loaded_at": "2024-02-02",
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [-122.9, 37.8],
                },
            }
        ]
    }

    # Act
    parsed = handler.parse_data(sf_data)

    # Assert
    assert len(parsed) == 2
    result = parsed[0][0]

    # The fill_in_missing_mapbox_points method should update
    # the point from the batch geocode.
    assert result["point"] == "Point(-122.1234 37.5678)"
    assert result["point_source"] == "mapbox"

    # Check other fields
    assert result["block"] == "1111"
    assert result["lot"] == "2222"
    assert result["parcel_number"] == "1111-2222"
    assert result["property_address"] == "123 New Test St"
    assert result["address"] == "123 New Test St"
    assert result["bos_district"] == "District 7"
    assert result["sfdata_as_of"] == "2024-02-01"
    assert result["sfdata_loaded_at"] == "2024-02-02"
    # tier and status are None
    assert result["tier"] is None
    assert result["status"] is None


def test_parse_data_address_not_in_mapbox_and_no_geometry(handler, mock_mapbox_manager):
    """
    Test the scenario where the address is NOT found in the Mapbox GeoJSON
    and the geometry is also undefined. The batch geocode doesn't return
    any coordinates, so the final point remains None.
    """
    # Arrange
    # 1) Address is not in the pre-loaded Mapbox GeoJSON
    mock_mapbox_manager.is_address_in_geojson.return_value = False

    # 2) Batch geocode does NOT resolve the address (returns an empty dict)
    mock_mapbox_manager.batch_geocode_addresses.return_value = {}

    sf_data = {
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "block": "9999",
                    "lot": "8888",
                    "parcel_number": "9999-8888",
                    "property_address": "123 Mystery St",
                    "address": "123 Mystery St",
                    "tier": None,
                    "status": None,
                    "bos_district": "District 8",
                    "data_as_of": "2025-01-01",
                    "data_loaded_at": "2025-01-02",
                },
                "geometry": None,  # Geometry is undefined
            }
        ]
    }

    # Act
    parsed = handler.parse_data(sf_data)

    # Assert
    assert len(parsed) == 2
    result = parsed[0][0]

    # Because geometry was None and batch geocoding didn't resolve anything:
    #  - point remains None
    #  - point_source remains None
    assert result["point"] is None
    assert result["point_source"] is None

    # Check other fields
    assert result["block"] == "9999"
    assert result["lot"] == "8888"
    assert result["parcel_number"] == "9999-8888"
    assert result["property_address"] == "123 Mystery St"
    assert result["address"] == "123 Mystery St"
    assert result["bos_district"] == "District 8"
    assert result["sfdata_as_of"] == "2025-01-01"
    assert result["sfdata_loaded_at"] == "2025-01-02"
    assert result["tier"] is None
    assert result["status"] is None


def test_parse_data_address_not_in_mapbox_but_has_sf_geometry(
    handler, mock_mapbox_manager
):
    """
    Test where address is NOT found in Mapbox GeoJSON, but the SF feature
    has valid geometry. The batch geocode also fails to return coordinates,
    so the final point should remain the SF geometry with 'point_source' = 'sfdata'.
    """
    # Arrange
    # 1) Address is not in the pre-loaded Mapbox GeoJSON
    mock_mapbox_manager.is_address_in_geojson.return_value = False

    # 2) Batch geocode returns no results (empty dict),
    #    so we won't override with Mapbox data
    mock_mapbox_manager.batch_geocode_addresses.return_value = {}

    sf_data = {
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "block": "5555",
                    "lot": "6666",
                    "parcel_number": "5555-6666",
                    "property_address": "123 Foggy St",
                    "address": "123 Foggy St",
                    "tier": "1",
                    "status": "In Progress",
                    "bos_district": "District 1",
                    "data_as_of": "2025-01-01",
                    "data_loaded_at": "2025-01-10",
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [-122.4167, 37.7833],
                },
            }
        ]
    }

    # Act
    parsed = handler.parse_data(sf_data)

    # Assert
    assert len(parsed) == 2
    result = parsed[0][0]

    # SF geometry should remain because Mapbox doesn't have or return anything
    assert result["point"] == "Point(-122.4167 37.7833)"
    assert result["point_source"] == "sfdata"

    # Check other fields
    assert result["block"] == "5555"
    assert result["lot"] == "6666"
    assert result["parcel_number"] == "5555-6666"
    assert result["property_address"] == "123 Foggy St"
    assert result["address"] == "123 Foggy St"
    assert result["bos_district"] == "District 1"
    assert result["sfdata_as_of"] == "2025-01-01"
    assert result["sfdata_loaded_at"] == "2025-01-10"
    assert result["tier"] == "1"
    assert result["status"] == "In Progress"


def test_parse_data_address_in_mapbox_but_mapbox_has_none_coordinates(
    handler, mock_mapbox_manager
):
    """
    Scenario:
      1) The address is found in Mapbox GeoJSON (is_address_in_geojson == True).
      2) However, get_mapbox_coordinates() returns None.
      3) The SF feature has valid geometry.

    Expected:
      - We should fall back to the SF geometry
      - point = "Point(<lon> <lat>)"
      - point_source = "sfdata"

    If the code incorrectly uses the Mapbox result (i.e., None),
    you'll see point=None, point_source="mapbox".
    """
    # Arrange
    # Indicate that the address is in the Mapbox GeoJSON
    mock_mapbox_manager.is_address_in_geojson.return_value = True
    # But the actual coordinates from Mapbox are None
    mock_mapbox_manager.get_mapbox_coordinates.return_value = None

    sf_data = {
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "block": "5555",
                    "lot": "6666",
                    "parcel_number": "5555-6666",
                    "property_address": "123 Foggy St",
                    "address": "123 Foggy St",
                    "tier": "1",
                    "status": "In Progress",
                    "bos_district": "District 1",
                    "data_as_of": "2025-01-01",
                    "data_loaded_at": "2025-01-10",
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [-122.4167, 37.7833],
                },
            }
        ]
    }

    # Act
    parsed = handler.parse_data(sf_data)

    # Assert
    assert len(parsed) == 2
    result = parsed[0][0]

    # Because Mapbox's coordinates are None, we expect the SF geometry to be used
    assert (
        result["point"] == "Point(-122.4167 37.7833)"
    ), "Expected to use SF geometry because Mapbox returned None"
    assert (
        result["point_source"] == "sfdata"
    ), "Expected point_source to be 'sfdata' when Mapbox coordinates are None"

    # Check other fields for completeness
    assert result["block"] == "5555"
    assert result["lot"] == "6666"
    assert result["parcel_number"] == "5555-6666"
    assert result["property_address"] == "123 Foggy St"
    assert result["address"] == "123 Foggy St"
    assert result["tier"] == "1"
    assert result["status"] == "In Progress"
    assert result["bos_district"] == "District 1"
    assert result["sfdata_as_of"] == "2025-01-01"
    assert result["sfdata_loaded_at"] == "2025-01-10"


def test_addresses_from_range():
    address_range = "1234-1237 Grove St."
    pattern = re.compile(r"(\d+)-(\d+)\s+(.*)")
    match_result = pattern.search(address_range)
    start_range = int(match_result[1])  # Before the hyphen
    end_range = int(match_result[2])  # After the hyphen
    street_name = match_result[3]  # After the range of addreses
    addresses = _SoftStoryPropertiesDataHandler._addresses_from_range(
        start_range, end_range, street_name
    )
    assert len(addresses) == 4
    assert addresses[0] == "1234 Grove St."
    assert addresses[1] == "1235 Grove St."
    assert addresses[2] == "1236 Grove St."
    assert addresses[3] == "1237 Grove St."
