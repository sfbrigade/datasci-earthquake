import requests
import json

API_URL = "http://localhost:8000/api/liquefaction-zones/high-susceptibility"
OUTPUT_FILE = "HighSusceptibilityZone.geojson"

def fetch_and_save():
    response = requests.get(API_URL)
    response.raise_for_status()  # Raise error if request failed
    data = response.json()
    with open(f"public/data/{OUTPUT_FILE}", "w") as f:
        json.dump(data, f, indent=2)
    print(f"Saved result to {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_and_save()