"""
Loads the two liquefaction zone geojsons into the public/data folder
from a running backend Docker container.

Note that running this script from a local backend may not work.
"""

from http.client import HTTPException
import requests


URLS = {
    "base": "http://localhost:8000/api/liquefaction-zones/",
    "high": "high-susceptibility",
    "very-high": "very-high-susceptibility",
}

FILE_PATHS = {
    "base": "public/data",
    "high": "HighSusceptibilityLiquefactionZone.geojson",
    "very-high": "VeryHighSusceptibilityLiquefactionZone.geojson",
}


def fetch(type: str) -> str:
    """
    Fetch the geojson of this liquefaction zone type from the backend
    Docker container
    """
    response = requests.get(URLS["base"] + URLS[type])
    if response.ok:
        return response.json()
    else:
        raise HTTPException(response)


def load(data: str, type: str) -> None:
    """Save the geojson in the appropriate folder"""
    with open(FILE_PATHS["base"] + "/" + FILE_PATHS[type], "w") as f:
        f.write(str(data))


if __name__ == "__main__":
    load(fetch("high"), "high")
    load(fetch("very-high"), "very-high")
