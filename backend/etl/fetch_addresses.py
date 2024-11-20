import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from backend.api.models.addresses import Address
from shapely.geometry import Point

ADDRESSES_URL = "https://data.sfgov.org/resource/ramy-di5m.geojson"  # This API has a default limit of providing 1,000 rows


def fetch_data(url):
    retry = Retry(total=5, backoff_factor=1)
    adapter = HTTPAdapter(max_retries=retry)
    session = requests.Session()
    session.mount("https://", adapter)
    response = session.get(url, timeout=60)
    response.raise_for_status()
    return response.json()


def parse_addresses(data):
    features = data["features"]
    parsed_data = []

    for feature in features:
        props = feature.get("properties", {})
        geometry = feature.get("geometry", {})

        if geometry.get("type") == "Point" and "coordinates" in geometry:
            geom_longitude, geom_latitude = geometry["coordinates"]
            address = Address(
                eas_baseid=props.get("eas_baseid"),
                eas_subid=props.get("eas_subid"),
                eas_fullid=props.get("eas_fullid"),
                address=props.get("address"),
                unit_number=props.get("address", ""),
                address_number=props.get("address_number"),
                address_number_suffix=props.get("address_number_suffix", ""),
                street_name=props.get("street_name"),
                street_type=props.get("street_type", ""),
                parcel_number=props.get("street_type", None),
                block=props.get("block", None),
                lot=props.get("lot", None),
                cnn=props.get("cnn", None),
                longitude=props.get("longitude"),
                latitude=props.get("latitude"),
                zip_code=props.get("zip_code"),
                point=Point(geom_longitude, geom_latitude),
                supdist=props.get("supdist", None),
                supervisor=props.get("supervisor", None),
                supname=props.get("supname", None),
                nhood=props.get("nhood"),
                sfdata_as_of=props.get("data_as_of"),
            )
            parsed_data.append(address)
    return parsed_data


def load_data(data):
    pass


if __name__ == "__main__":
    try:
        addresses = fetch_data(ADDRESSES_URL)
        address_objects = parse_addresses(addresses)
        for i in address_objects:
            print(i)
    except Exception as e:
        print(f"Failed after retries: {e}")
