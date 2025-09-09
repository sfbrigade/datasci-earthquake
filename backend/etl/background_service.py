"""
Background ETL service that runs data loading processes asynchronously.
This allows FastAPI to start immediately while data loads in the background.
"""

import asyncio
import logging
import threading
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

from backend.etl.liquefaction_data_handler import _LiquefactionDataHandler
from backend.etl.soft_story_properties_data_handler import (
    _SoftStoryPropertiesDataHandler,
)
from backend.etl.tsunami_data_handler import TsunamiDataHandler
from backend.etl.database_checker import db_checker
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.export_metadata import ExportMetadata
from backend.database.session import get_db
from sqlalchemy.orm import Session


class ETLStatus(Enum):
    """ETL process status enumeration"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class ETLProcessInfo:
    """Information about an ETL process"""

    name: str
    status: ETLStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    records_processed: int = 0


class BackgroundETLService:
    """
    Background service that manages ETL processes asynchronously.
    Allows FastAPI to start immediately while data loads in the background.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.processes: Dict[str, ETLProcessInfo] = {}
        self._is_running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

        # Initialize process tracking
        self._initialize_processes()

    def _initialize_processes(self):
        """Initialize tracking for all ETL processes"""
        process_names = ["liquefaction_data", "soft_story_properties", "tsunami_data"]

        for name in process_names:
            self.processes[name] = ETLProcessInfo(name=name, status=ETLStatus.PENDING)

    def start(self):
        """Start the background ETL service"""
        if self._is_running:
            self.logger.warning("ETL service is already running")
            return

        self.logger.info("Starting background ETL service")
        self._is_running = True
        self._thread = threading.Thread(target=self._run_etl_processes, daemon=True)
        self._thread.start()

    def stop(self):
        """Stop the background ETL service"""
        self.logger.info("Stopping background ETL service")
        self._is_running = False
        if self._thread:
            self._thread.join(timeout=30)

    def _run_etl_processes(self):
        """Run all ETL processes in sequence"""
        try:
            self.logger.info("Starting ETL processes")

            # Check if ETL is needed
            if not db_checker.needs_etl():
                self.logger.info("Database has data - skipping ETL processes")
                # Mark all processes as skipped
                for process_name in self.processes:
                    with self._lock:
                        self.processes[process_name].status = ETLStatus.SKIPPED
                        self.processes[process_name].completed_at = datetime.now(
                            timezone.utc
                        )
                return

            # Run each ETL process
            self._run_liquefaction_etl()
            self._run_soft_story_etl()
            self._run_tsunami_etl()

            self.logger.info("All ETL processes completed")

        except Exception as e:
            self.logger.error(f"ETL service failed: {e}", exc_info=True)
        finally:
            self._is_running = False

    def _run_liquefaction_etl(self):
        """Run liquefaction data ETL process"""
        process_name = "liquefaction_data"
        api_url = "https://data.sfgov.org/resource/i4t7-35u3.geojson"

        with self._lock:
            self.processes[process_name].status = ETLStatus.RUNNING
            self.processes[process_name].started_at = datetime.now(timezone.utc)

        try:
            self.logger.info("Starting liquefaction data ETL")

            # Run the ETL process
            handler = _LiquefactionDataHandler(
                url="https://data.sfgov.org/resource/i4t7-35u3.geojson",
                table=LiquefactionZone,
            )

            # Process data in chunks to avoid memory issues
            total_records = 0
            for data_chunk in handler._yield_data():
                records = handler.parse_data(data_chunk)[0]
                handler.load_data(records)
                total_records += len(records)

                # Update progress
                with self._lock:
                    self.processes[process_name].records_processed = total_records

            with self._lock:
                self.processes[process_name].status = ETLStatus.COMPLETED
                self.processes[process_name].completed_at = datetime.now(timezone.utc)

            self.logger.info(
                f"Liquefaction ETL completed - {total_records} records processed"
            )

        except Exception as e:
            self.logger.error(f"Liquefaction ETL failed: {e}", exc_info=True)
            with self._lock:
                self.processes[process_name].status = ETLStatus.FAILED
                self.processes[process_name].error_message = str(e)
                self.processes[process_name].completed_at = datetime.now(timezone.utc)

    def _run_soft_story_etl(self):
        """Run soft story properties ETL process"""
        process_name = "soft_story_properties"
        api_url = "https://data.sfgov.org/resource/beah-shgi.geojson"

        with self._lock:
            self.processes[process_name].status = ETLStatus.RUNNING
            self.processes[process_name].started_at = datetime.now(timezone.utc)

        try:
            self.logger.info("Starting soft story properties ETL")

            # Check cache to see if data should be refreshed
            should_refresh, reason = volume_cache.should_refresh_data(process_name)

            if not should_refresh:
                with self._lock:
                    self.processes[process_name].status = ETLStatus.SKIPPED
                    self.processes[process_name].completed_at = datetime.now(
                        timezone.utc
                    )
                self.logger.info(f"Skipping soft story ETL - {reason}")
                return

            # Get Mapbox API key from environment
            import os

            mapbox_api_key = os.getenv("NEXT_PUBLIC_MAPBOX_TOKEN")
            if not mapbox_api_key:
                raise ValueError("Mapbox API key not found")

            handler = _SoftStoryPropertiesDataHandler(
                url="https://data.sfgov.org/resource/beah-shgi.geojson",
                table=SoftStoryProperty,
                mapbox_api_key=mapbox_api_key,
            )

            total_records = 0
            for data_chunk in handler._yield_data():
                records = handler.parse_data(data_chunk)[0]
                handler.load_data(records)
                total_records += len(records)

                with self._lock:
                    self.processes[process_name].records_processed = total_records

            with self._lock:
                self.processes[process_name].status = ETLStatus.COMPLETED
                self.processes[process_name].completed_at = datetime.now(timezone.utc)

            self.logger.info(
                f"Soft story ETL completed - {total_records} records processed"
            )

        except Exception as e:
            self.logger.error(f"Soft story ETL failed: {e}", exc_info=True)
            with self._lock:
                self.processes[process_name].status = ETLStatus.FAILED
                self.processes[process_name].error_message = str(e)
                self.processes[process_name].completed_at = datetime.now(timezone.utc)

    def _run_tsunami_etl(self):
        """Run tsunami data ETL process"""
        process_name = "tsunami_data"
        api_url = "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query"

        with self._lock:
            self.processes[process_name].status = ETLStatus.RUNNING
            self.processes[process_name].started_at = datetime.now(timezone.utc)

        try:
            self.logger.info("Starting tsunami data ETL")

            # Check cache to see if data should be refreshed
            should_refresh, reason = volume_cache.should_refresh_data(process_name)

            if not should_refresh:
                with self._lock:
                    self.processes[process_name].status = ETLStatus.SKIPPED
                    self.processes[process_name].completed_at = datetime.now(
                        timezone.utc
                    )
                self.logger.info(f"Skipping tsunami ETL - {reason}")
                return

            handler = TsunamiDataHandler(
                url="https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query",
                table=TsunamiZone,
            )

            total_records = 0
            for data_chunk in handler._yield_data():
                records = handler.parse_data(data_chunk)[0]
                handler.load_data(records)
                total_records += len(records)

                with self._lock:
                    self.processes[process_name].records_processed = total_records

            with self._lock:
                self.processes[process_name].status = ETLStatus.COMPLETED
                self.processes[process_name].completed_at = datetime.now(timezone.utc)

            self.logger.info(
                f"Tsunami ETL completed - {total_records} records processed"
            )

        except Exception as e:
            self.logger.error(f"Tsunami ETL failed: {e}", exc_info=True)
            with self._lock:
                self.processes[process_name].status = ETLStatus.FAILED
                self.processes[process_name].error_message = str(e)
                self.processes[process_name].completed_at = datetime.now(timezone.utc)

    def get_status(self) -> Dict[str, ETLProcessInfo]:
        """Get current status of all ETL processes"""
        with self._lock:
            return self.processes.copy()

    def is_ready(self) -> bool:
        """Check if all critical ETL processes are completed"""
        with self._lock:
            critical_processes = ["liquefaction_data", "tsunami_data"]
            return all(
                self.processes[process].status == ETLStatus.COMPLETED
                for process in critical_processes
            )

    def is_running(self) -> bool:
        """Check if ETL service is currently running"""
        return self._is_running


# Global ETL service instance
etl_service = BackgroundETLService()
