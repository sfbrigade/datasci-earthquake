"""Loads data from public sources into the database."""
import json
import requests
import time
import geopandas as gpd
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import SQLAlchemy
import geoalchemy2

# TODO: Obtain an SSL certification if necessary to access the API
# This problem has not occurred on a CodeSpace
# print(os.getenv('SSL_CERT_FILE'))


def fetch_data(url: str, max_retries: int=3, base_delay: float=1) -> json:
    """Return data from this url."""
    session = requests.Session()
    retry = Retry(
        total=max_retries,
        read=max_retries,
        connect=max_retries,
        backoff_factor=0.1
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    try:
        for attempt in range(max_retries):
            try:
                response = session.get(url, verify=False)
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                if attempt == max_retries - 1:
                    raise
                delay = base_delay * (2**attempt)
                print(f"Attempt {attempt+1} failed. Retrying in {delay:.2f} seconds...")
                time.sleep(delay)
    except Exception as e:
        print(f"An error occurred: {e}")


def soft_story():
    """Load soft story data into the database."""
    # TODO: Handle json data that lacks an associated geometry.
    # 7 rows lack geometry last we checked, but this number could change.
    # Should we impute locations for rows that lack geometry?
    #
    # InsecureRequestWarning: Unverified HTTPS request is being made to host 'data.sfgov.org'. 
    # Adding certificate verification is strongly advised. 
    # See: https://urllib3.readthedocs.io/en/latest/advanced-usage.html#tls-warnings
    geojson = fetch_data('https://data.sfgov.org/resource/beah-shgi.geojson')
    geodataframe = gpd.GeoDataFrame.from_features(geojson["features"])
    #print(geodataframe.columns)
    # TODO: Save the geodataframe to the database 

    
if __name__ == "__main__":
    soft_story()