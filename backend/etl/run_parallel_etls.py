"""
Parallel ETL runner for production use.

This script orchestrates the execution of all ETL processes in parallel,
integrating with the existing ETL handler implementations.

Usage:
    python backend/etl/run_parallel_etls.py table1 table2 table3

Example:
    python backend/etl/run_parallel_etls.py tsunami_zones liquefaction_zones soft_story_properties
"""

import sys
import logging
import os
from typing import Dict
from http.client import HTTPException

from backend.etl.parallel_etl import run_parallel_etls
from backend.etl.parallel_etl_types import ETLCallable, ParallelETLResult

# Import individual ETL handlers
from backend.etl.tsunami_data_handler import TsunamiDataHandler, TSUNAMI_URL
from backend.etl.liquefaction_data_handler import (
    _LiquefactionDataHandler,
    _LIQUEFACTION_URL,
)
from backend.etl.soft_story_properties_data_handler import (
    _SoftStoryPropertiesDataHandler,
    _SOFT_STORY_PROPERTIES_URL,
)
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    force=True,
)
logger = logging.getLogger(__name__)


def run_tsunami_etl():
    """Execute tsunami ETL process"""
    handler = TsunamiDataHandler(TSUNAMI_URL, TsunamiZone)
    try:
        params = {
            "where": "County='San Francisco' AND Evacuate='Yes, Tsunami Hazard Area'",
            "outFields": "*",
            "f": "json",
        }
        data = handler.fetch_data(params)
        parsed, geojson = handler.parse_data(data)
        handler.export_geojson_if_changed(geojson)
        handler.bulk_insert_data(parsed, "identifier")
        logger.info(f"Tsunami ETL completed: {len(parsed)} records")
    except HTTPException as e:
        logger.error(f"Tsunami ETL failed: {e}")
        raise


def run_liquefaction_etl():
    """Execute liquefaction ETL process"""
    handler = _LiquefactionDataHandler(_LIQUEFACTION_URL, LiquefactionZone)
    try:
        data = handler.fetch_data()
        parsed, geojson = handler.parse_data(data)
        handler.export_geojson_if_changed(geojson)
        handler.bulk_insert_data(parsed, "identifier")
        logger.info(f"Liquefaction ETL completed: {len(parsed)} records")
    except HTTPException as e:
        logger.error(f"Liquefaction ETL failed: {e}")
        raise


def run_soft_story_etl():
    """Execute soft story properties ETL process"""
    mapbox_api_key = os.environ.get("NEXT_PUBLIC_MAPBOX_TOKEN", "")
    handler = _SoftStoryPropertiesDataHandler(
        _SOFT_STORY_PROPERTIES_URL, SoftStoryProperty, mapbox_api_key
    )
    try:
        data = handler.fetch_data()
        parsed, geojson = handler.parse_data(data)
        handler.export_geojson_if_changed(geojson)
        handler.bulk_insert_data(parsed, "address")
        logger.info(f"Soft Story ETL completed: {len(parsed)} records")
    except HTTPException as e:
        logger.error(f"Soft Story ETL failed: {e}")
        raise


# Map table names to ETL functions
ETL_REGISTRY: Dict[str, ETLCallable] = {
    "tsunami_zones": run_tsunami_etl,
    "liquefaction_zones": run_liquefaction_etl,
    "soft_story_properties": run_soft_story_etl,
}


def main(table_names: list[str]) -> int:
    """
    Main entry point for parallel ETL execution.

    Args:
        table_names: List of table names requiring ETL

    Returns:
        0 if all ETLs succeeded, 1 if any failed
    """
    if not table_names:
        logger.info("No ETL processes needed")
        return 0

    # Filter to only requested tables
    etls_to_run = {
        name: func for name, func in ETL_REGISTRY.items() if name in table_names
    }

    if not etls_to_run:
        logger.warning(f"No matching ETLs found for tables: {table_names}")
        return 0

    logger.info(f"=" * 80)
    logger.info(f"Running {len(etls_to_run)} ETL processes in parallel")
    logger.info(f"Tables: {', '.join(etls_to_run.keys())}")
    logger.info(f"=" * 80)

    try:
        # Run ETLs in parallel
        result: ParallelETLResult = run_parallel_etls(etls_to_run)

        # Log summary
        logger.info(f"=" * 80)
        logger.info(f"PARALLEL ETL SUMMARY")
        logger.info(f"=" * 80)
        logger.info(f"Total time: {result.total_duration_seconds:.2f}s")
        logger.info(f"Success: {result.success_count}/{len(result.results)}")

        # Log individual results
        for etl_result in result.results:
            status_symbol = "✓" if etl_result.is_successful else "✗"
            logger.info(
                f"  {status_symbol} {etl_result.name}: "
                f"{etl_result.status.value} in {etl_result.duration_seconds:.2f}s"
            )

        logger.info(f"=" * 80)

        # Exit with appropriate code
        if result.all_successful:
            logger.info("All ETL processes completed successfully")
            return 0
        else:
            logger.error("Some ETL processes failed")
            # Log failure details
            for failed in result.failed_etls:
                logger.error(f"  {failed.name}: {failed.error}")
            return 1

    except Exception as e:
        logger.error(f"Fatal error in parallel ETL execution: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    # Get table names from command line arguments
    tables = sys.argv[1:] if len(sys.argv) > 1 else []
    exit_code = main(tables)
    sys.exit(exit_code)
