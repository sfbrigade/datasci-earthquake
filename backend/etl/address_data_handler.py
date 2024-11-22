from backend.etl.data_handler import DataHandler
from backend.api.models.addresses import Address
from shapely.geometry import Point


ADDRESSES_URL = "https://data.sfgov.org/resource/ramy-di5m.geojson"  # This API has a default limit of providing 1,000 rows


class AddressDataHandler(DataHandler):
    def parse_data(self, data: dict) -> list[dict]:
        features = data["features"]
        parsed_data = []

        for feature in features:
            props = feature.get("properties", {})
            geometry = feature.get("geometry", {})

            if geometry.get("type") == "Point" and "coordinates" in geometry:
                geom_longitude, geom_latitude = geometry["coordinates"]
                address = {}
                address = {
                    "eas_fullid": props.get("eas_fullid"),
                    "address": props.get("address"),
                    "unit_number": props.get("address", None),
                    "address_number": int(props.get("address_number", None)),
                    "street_name": props.get("street_name"),
                    "street_type": props.get("street_type", None),
                    "parcel_number": props.get("street_type", None),
                    "block": props.get("block", None),
                    "lot": props.get("lot", None),
                    "cnn": props.get("cnn", None),
                    "longitude": props.get("longitude"),
                    "latitude": props.get("latitude"),
                    "zip_code": int(props.get("zip_code")),
                    "point": f"Point({geom_longitude} {geom_latitude})",
                    "supdist": props.get("supdist", None),
                    "supervisor": int(props.get("supervisor", None)),
                    "supname": props.get("supname", None),
                    "nhood": props.get("nhood"),
                    "sfdata_as_of": props.get("data_as_of"),
                }
                parsed_data.append(address)
        return parsed_data


if __name__ == "__main__":
    handler = AddressDataHandler(ADDRESSES_URL, Address)
    try:
        addresses = handler.fetch_data()
        address_objects = handler.parse_data(addresses)
        handler.bulk_insert_data(address_objects, "eas_fullid")
    except Exception as e:
        print(f"Failed after retries: {e}")
