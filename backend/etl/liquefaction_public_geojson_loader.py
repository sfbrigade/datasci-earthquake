"""
Saves geojsons from the api of a running backend Docker container
to the public/data folder.
"""

import json
import requests
from pathlib import Path
from typing import Dict

URLS: Dict[str, str] = {
    "base": "http://localhost:8000/api/liquefaction-zones/",
    "high": "high-susceptibility",
    "very-high": "very-high-susceptibility",
}

FILE_PATHS: Dict[str, str] = {
    "base": "public/data",
    "high": "HighSusceptibilityLiquefactionZone.geojson",
    "very-high": "VeryHighSusceptibilityLiquefactionZone.geojson",
}


def fetch(zone_type: str) -> dict:
    """
    Fetch the geojson of this liquefaction zone type from the backend
    Docker container
    """
    try:
        response = requests.get(URLS["base"] + URLS[zone_type])
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data for {zone_type}: {e}")
        return {}


def load(data: dict, zone_type: str) -> None:
    """Save the geojson in the appropriate folder"""
    file_path = Path(FILE_PATHS["base"]) / FILE_PATHS[zone_type]
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("w") as file:
        json.dump(data, file)


if __name__ == "__main__":
    load(fetch("high"), "high")
    load(fetch("very-high"), "very-high")
