#!/bin/bash

API_URL="http://localhost:8000/api/liquefaction-zones/high-susceptibility"
OUTPUT_FILE="public/data/HighSusceptibilityZone.geojson"

curl -s "$API_URL" -o "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo "Saved result to $OUTPUT_FILE"
else
  echo "Failed to fetch data from $API_URL"
fi