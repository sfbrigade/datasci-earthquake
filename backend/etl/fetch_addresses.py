import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

ADDRESSES_URL = "https://data.sfgov.org/resource/ramy-di5m.geojson"  # This API has a default limit of providing 1,000 rows


def fetch_data(url):
    retry = Retry(total=5, backoff_factor=1)
    adapter = HTTPAdapter(max_retries=retry)
    session = requests.Session()
    session.mount("https://", adapter)
    response = session.get(url, timeout=60)
    response.raise_for_status()
    return response.json()


def transform_addresses(data):
    pass


def load_data(data):
    pass


if __name__ == "__main__":
    try:
        addresses = fetch_data(ADDRESSES_URL)
        print(len(addresses))
        print(addresses)
    except Exception as e:
        print(f"Failed after retries: {e}")
