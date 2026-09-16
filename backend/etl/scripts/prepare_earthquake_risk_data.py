"""
One-time (re-run only when FEMA publishes a new NRI release) preprocessing
script for the FEMA National Risk Index (NRI) "All Census Tracts" shapefile.

The full national shapefile is a ~1.7GB download and is NOT checked into
this repo. Download it yourself from:
    https://www.fema.gov/about/reports-and-data/openfema/nri/v120/NRI_Shapefile_CensusTracts.zip
unzip it, then run this script against the extracted .shp file. It filters
the national dataset down to San Francisco County census tracts, reprojects
to WGS84 (the national shapefile ships in Web Mercator, EPSG:3857), and
writes a small GeoJSON to backend/etl/data/sf_earthquake_risk.geojson. That
small file IS committed to the repo and is what
backend/etl/fema_data_handler.py reads to populate the database - the raw
national shapefile itself never needs to touch the repo, CI, or production.

Usage:
    python backend/etl/scripts/prepare_earthquake_risk_data.py \\
        --input /path/to/NRI_Shapefile_CensusTracts.shp
"""

import argparse
from pathlib import Path

import geopandas as gpd

_SF_STCOFIPS = "06075"
_DEFAULT_OUTPUT = "backend/etl/data/sf_earthquake_risk.geojson"
_SIMPLIFY_TOLERANCE_DEGREES = 0.0001


def prepare(input_path: str, output_path: str) -> None:
    gdf = gpd.read_file(
        input_path,
        columns=["TRACTFIPS", "STCOFIPS", "ERQK_RISKS", "ERQK_RISKR"],
        where=f"STCOFIPS = '{_SF_STCOFIPS}'",
    )

    if gdf.empty:
        raise ValueError(
            f"No tracts found for STCOFIPS={_SF_STCOFIPS!r}. Check the input shapefile."
        )

    gdf = gdf.to_crs(epsg=4326)
    gdf["geometry"] = gdf["geometry"].simplify(
        _SIMPLIFY_TOLERANCE_DEGREES, preserve_topology=True
    )
    gdf = gdf[["TRACTFIPS", "ERQK_RISKS", "ERQK_RISKR", "geometry"]]

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(output_file, driver="GeoJSON")

    print(f"Wrote {len(gdf)} San Francisco tracts to {output_file}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        required=True,
        help="Path to the extracted NRI_Shapefile_CensusTracts.shp",
    )
    parser.add_argument("--output", default=_DEFAULT_OUTPUT)
    args = parser.parse_args()
    prepare(args.input, args.output)


if __name__ == "__main__":
    main()
