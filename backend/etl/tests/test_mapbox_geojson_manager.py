import pytest
import json
from unittest.mock import patch, MagicMock, mock_open
from requests import Response
from backend.etl.mapbox_geojson_manager import (
    _BatchMapboxGeocoder,
    MapboxGeojsonManager,
)
from pathlib import Path


@pytest.fixture
def api_key():
    return "abdefg"


@pytest.fixture
def geocoder(api_key):
    return _BatchMapboxGeocoder(api_key=api_key)


class TestBatchMapboxGeocoder:
    def test_build_address_request(self, geocoder):
        """
        Tests the _build_address_request method to ensure it returns
        the correct dict payload for a given address.
        """
        address = "1600 Pennsylvania Ave NW, Washington, DC"
        limit = 2
        request_payload = geocoder._build_address_request(address, limit)

        assert request_payload == {
            "types": ["address"],
            "q": address,
            "limit": limit,
        }, "Request payload should match expected structure"

    @patch("requests.post")
    def test_post_request_success(self, mock_post, geocoder, api_key):
        """
        Tests the _post_request method to ensure it calls requests.post correctly
        and returns the response when successful.
        """
        # Mock a 200 Response object
        mock_response = MagicMock(spec=Response)
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"batch": []}

        # The mock_post is the patched requests.post
        mock_post.return_value = mock_response

        batch_payload = [{"types": ["address"], "q": "Test", "limit": 1}]
        response = geocoder._post_request(batch_payload)

        # Check that requests.post was called with the correct arguments
        mock_post.assert_called_once_with(
            geocoder.url,
            json=batch_payload,
            params={"access_token": api_key, "permanent": "false"},
            headers={"Content-Type": "application/json"},
        )
        # Verify the return value
        assert response is mock_response
        assert response.json() == {"batch": []}

    @patch("requests.post")
    def test_post_request_http_error(self, mock_post, geocoder):
        """
        Tests that an HTTPError is raised if the response's raise_for_status() fails.
        """
        mock_response = MagicMock(spec=Response)
        # Make it raise an HTTPError
        mock_response.raise_for_status.side_effect = Exception("HTTP Error")
        mock_post.return_value = mock_response

        with pytest.raises(Exception) as excinfo:
            geocoder._post_request([{}])
        assert "HTTP Error" in str(excinfo.value)

    @patch.object(_BatchMapboxGeocoder, "_post_request")
    def test_batch_geocode_addresses_one_batch(self, mock_post_request, geocoder):
        """
        Tests batch_geocode_addresses by mocking _post_request to return a controlled response.
        """
        # Suppose we have 2 addresses
        addresses = ["Address 1", "Address 2"]

        # Mock the JSON response you'd get from Mapbox
        mock_response = MagicMock(spec=Response)
        # We expect "batch" to have the same # of items as addresses
        mock_response.json.return_value = {
            "batch": [
                {"features": [{"properties": {"longitude": -122.4, "latitude": 37.8}}]},
                {"features": [{"properties": {"longitude": -122.3, "latitude": 37.7}}]},
            ]
        }
        mock_post_request.return_value = mock_response

        # Call the method under test
        features = geocoder.batch_geocode_addresses(addresses, limit=1)

        # We expect two feature dictionaries, each with a "properties" dict containing "sfdata_address"
        assert len(features) == 2
        assert features[0]["properties"]["sfdata_address"] == "Address 1"
        assert features[1]["properties"]["sfdata_address"] == "Address 2"

        # Verify only one batch call was made since we have 2 addresses
        mock_post_request.assert_called_once()


class TestMapboxGeojsonManager:
    @pytest.fixture
    def manager(api_key):
        """
        Fixture that patches MapboxGeojsonManager._mapbox_points so it doesn't
        actually read from a file but instead returns a mock dictionary.
        """
        with patch.object(
            MapboxGeojsonManager,
            "_mapbox_points",
            return_value={"Some Address": (1.0, 2.0)},
        ):
            mgr = MapboxGeojsonManager(api_key=api_key)
            yield mgr

    def test_mapbox_points_read_file(self, manager):
        """
        Tests that _get_mapbox_points() reads the geojson file and builds the dict correctly.
        We'll patch the open call and simulate a small geojson.
        """
        result = manager._get_mapbox_points()

        assert result == {
            "Some Address": (1.0, 2.0)
        }, "Should parse addresses to coordinate tuples"

    def test_get_mapbox_coordinates(self, manager):
        """
        Tests get_mapbox_coordinates by mocking manager.mapbox_points directly.
        """
        manager.mapbox_points = {
            "Some Address": (-123.0, 38.0),
            "Missing Address": None,
        }

        coords = manager.get_mapbox_coordinates("Some Address")
        assert coords == (-123.0, 38.0)

        # TODO: dinstinguish between the following two cases
        coords_none = manager.get_mapbox_coordinates("Missing Address")
        assert coords_none is None

        coords_not_found = manager.get_mapbox_coordinates("Does Not Exist")
        assert coords_not_found is None

    def test_parse_mapbox_features(self, manager):
        """
        Tests _parse_mapbox_features() to ensure it extracts the data from a list of features.
        """
        features = [
            {
                "properties": {
                    "sfdata_address": "Addr 1",
                    "longitude": "-122.4",
                    "latitude": "37.8",
                }
            },
            {
                "properties": {
                    "sfdata_address": "Addr 2",
                    "longitude": "-122.3",
                    "latitude": "37.7",
                }
            },
        ]
        coords_map = manager._parse_mapbox_features(features)
        assert coords_map == {"Addr 1": (-122.4, 37.8), "Addr 2": (-122.3, 37.7)}

    def test_write_to_geojson_new_file(self, manager):
        """
        Tests write_to_geojson when the geojson file doesn't exist.
        """

        # Create the mock file object that will simulate reading/writing
        mocked_file = mock_open(
            read_data='{"type": "FeatureCollection", "features": []}'
        )

        # Patch the builtin open to use our mock
        with patch("builtins.open", mocked_file), patch.object(
            Path, "exists", return_value=False
        ):
            manager.write_to_geojson(
                [{"type": "Feature", "properties": {"sfdata_address": "New Address"}}]
            )

        handle = mocked_file()
        written_data = json.loads(
            "".join([call[0][0] for call in handle.write.call_args_list])
        )

        assert "features" in written_data
        assert len(written_data["features"]) == 1
        assert (
            written_data["features"][0]["properties"]["sfdata_address"] == "New Address"
        )

    def test_write_to_geojson_append(self, manager):
        """
        If the file exists, we append new features to existing ones.
        We'll patch Path.exists() to return True.
        """
        # Create a mock file containing one existing feature
        initial_data = '{"type": "FeatureCollection", "features": [{"properties": {"sfdata_address": "Old Address"}}]}'
        m = mock_open(read_data=initial_data)

        with patch("builtins.open", m), patch.object(Path, "exists", return_value=True):
            new_features = [
                {
                    "properties": {"sfdata_address": "Appended Address"},
                    "type": "Feature",
                }
            ]
            # This call now uses our mock file instead of a real file
            manager.write_to_geojson(new_features)

        # The final write should contain both the old and new features
        handle = m()  # 'm()' is the mock file handle
        written_data = json.loads(
            "".join([call[0][0] for call in handle.write.call_args_list])
        )
        all_features = written_data["features"]
        assert len(all_features) == 2

        addresses = [f["properties"]["sfdata_address"] for f in all_features]
        assert "Old Address" in addresses
        assert "Appended Address" in addresses

    @patch.object(_BatchMapboxGeocoder, "batch_geocode_addresses")
    @patch.object(MapboxGeojsonManager, "_parse_mapbox_features")
    @patch.object(MapboxGeojsonManager, "write_to_geojson")
    def test_batch_geocode_addresses_integration(
        self, mock_write, mock_parse, mock_batch, manager
    ):
        """
        Tests the batch_geocode_addresses() high-level method.
        Ensures it:
        1) Calls geocoder.batch_geocode_addresses()
        2) Calls _parse_mapbox_features() on the result
        3) Calls write_to_geojson() with those features
        4) Returns the coordinate dictionary
        """
        # Mock the geocoder's return
        mock_features = [
            {
                "properties": {
                    "sfdata_address": "Addr X",
                    "longitude": -122.4,
                    "latitude": 37.8,
                }
            }
        ]
        mock_batch.return_value = mock_features

        # Mock the parse to return a dict
        mock_parse.return_value = {"Addr X": (-122.4, 37.8)}

        addresses = ["Addr X"]
        result = manager.batch_geocode_addresses(addresses)

        # Check the calls
        mock_batch.assert_called_once_with(addresses)
        mock_parse.assert_called_once_with(mock_features)
        mock_write.assert_called_once_with(mock_features)

        assert result == {"Addr X": (-122.4, 37.8)}
