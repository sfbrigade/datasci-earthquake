from abc import ABC, abstractmethod
import requests
import os
from pathlib import Path
import json
from shapely.geometry import shape
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.postgresql import Insert
from backend.database.session import get_db
from backend.api.models.base import ModelType
from shapely.ops import transform
from pyproj import Transformer
from typing import Type, Generator, Optional
import time
import logging
from backend.etl.session_manager import SessionManager
from backend.etl.request_handler import RequestHandler
from sqlalchemy.exc import SQLAlchemyError, ProgrammingError, IntegrityError

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

_PREFIX_DATA_GEOJSON_PATH = os.getenv("DATA_GEOJSON_PATH", "public/data/")
_SF_BOUNDARY_PATH = "backend/etl/data/sf_boundary.geojson"


class DataHandler(ABC):
    """
    Abstract base class for handling data operations with an external
    API and database.
    Args:
        url (str): The API endpoint URL.
        table (ModelType): The SQLAlchemy table object.
        page_size (int): Number of records to fetch per page.
        session: Optional pre-configured requests session
        logger: Optional logger instance
    """

    def __init__(
        self,
        url: str,
        table: Type[ModelType],
        page_size: int = 1000,
        session: Optional[requests.Session] = None,
        logger: Optional[logging.Logger] = None,
    ):
        self.url = url
        self.table = table
        self.db_getter = get_db
        self.page_size = page_size
        self.logger = logger or logging.getLogger(f"{self.__class__.__name__}")
        self.session = session or SessionManager.create_session(self.logger)
        self.request_handler = RequestHandler(self.session, self.logger)
        try:
            with open(_SF_BOUNDARY_PATH) as f:
                boundary_geojson = json.load(f)
            if not boundary_geojson["features"]:
                raise ValueError("No features found in boundary geojson")
            self.boundary = shape(boundary_geojson["features"][0]["geometry"])
        except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
            self.logger.error(f"Failed to load boundary geojson: {e}")
            raise

        self.logger.info(
            f"Initialized handler for {table.__name__} "
            f"with URL: {url}, "
            f"page size: {page_size}, "
            f"session: {session}"
        )

    def _yield_data(self, params: Optional[dict] = None) -> Generator:
        """
        Yield paginated data from API.
        Yields:
            Feature data from each page
        """
        offset = 0
        page_num = 1

        while True:
            paginated_params = params.copy() if params else {}
            paginated_params.update({"$offset": offset, "$limit": self.page_size})

            start_time = time.time()
            data = self.request_handler.make_request(self.url, paginated_params)
            features = data.get("features", [])
            request_time = time.time() - start_time

            if not features:
                self.logger.info(
                    f"{self.table.__name__}: Completed pagination. "
                    f"Final stats: Pages={page_num-1}, "
                    f"Total Features={offset}, "
                    f"Last Offset={offset}, "
                    f"Request time: {request_time:.2f}s"
                )
                break

            if len(features) < self.page_size:
                self.logger.info(
                    f"{self.table.__name__}: Received fewer records ({len(features)}) than page size ({self.page_size}). "
                    f"Assuming final page and stopping fetch. "
                    f"Request time: {request_time:.2f}s"
                )
                yield features
                break

            yield features
            self.logger.info(
                f"{self.table.__name__}: Retrieved {len(features)} features on page {page_num}. "
                f"Offset: {offset}, "
                f"Request time: {request_time:.2f}s"
            )

            offset += len(features)
            page_num += 1
            time.sleep(1)

    def fetch_data(self, params: Optional[dict] = None) -> dict:
        """
        Fetch all data from API using configured parameters.
        Returns:
            Dictionary with all features
        """
        self.logger.info(
            f"Starting data fetch for {self.table.__name__} " f"with params: {params}"
        )

        try:
            all_features = []
            for features in self._yield_data(params):
                all_features.extend(features)
            self.logger.info(
                f"{self.table.__name__}: Successfully fetched {len(all_features)} total features."
            )

            return {"features": all_features}

        except Exception as e:
            self.logger.error(f"Data fetch failed: {str(e)}", exc_info=True)
            raise
        finally:
            self.session.close()
            self.logger.info("Closed session")

    def transform_geometry(self, geometry, source_srid, target_srid=4326):
        """
        Transforms geometry from source_srid to target_srid using
        pyproj

        Args:
            geometry: The geometry object (Point, Polygon or MultiPolygon)
            source_srid: The original SRID of the geometry
            target_srid: The target SRID for the transformation,
                         default is 4326

        Returns:
            The transformed geometry.
        """
        # Set up the transformer using pyproj
        transformer = Transformer.from_crs(
            f"EPSG:{source_srid}", f"EPSG:{target_srid}", always_xy=True
        )

        # Transform the geometry
        return transform(transformer.transform, geometry)

    @abstractmethod
    def parse_data(self, data: dict) -> tuple[list[dict], dict]:
        """
        Abstract method to parse and transform the fetched data

        Returns:
            A tuple containing:
                - A list of dictionaries (each representing a row for the database).
                - A dictionary representing the same data in GeoJSON format.
        """
        pass

    def bulk_insert_data(self, data_dicts: list[dict], id_field: str):
        if not data_dicts:
            self.logger.warning(f"{self.table.__name__}: No data to insert")
            return

        update_fields = self.insert_policy()
        if update_fields:
            seen = {}
            for item in data_dicts:
                seen[item[id_field]] = item
            data_dicts = list(seen.values())

        try:
            with next(self.db_getter()) as db:
                stmt = pg_insert(self.table).values(data_dicts)

                if update_fields:
                    stmt = stmt.on_conflict_do_update(
                        index_elements=[id_field], set_=update_fields
                    )
                else:
                    stmt = stmt.on_conflict_do_nothing(index_elements=[id_field])

                db.execute(stmt)
                db.commit()
                self.logger.info(
                    f"{self.table.__name__}: Inserted {len(data_dicts)} rows with "
                    f"{'update' if update_fields else 'do nothing'} conflict policy."
                )

        except ProgrammingError as e:
            self.logger.error(f"Schema error in {self.table.__name__}: {str(e)}")
            raise
        except IntegrityError as e:
            self.logger.error(
                f"Data integrity error in {self.table.__name__}: {str(e)}"
            )
            raise
        except SQLAlchemyError as e:
            self.logger.error(f"Database error in {self.table.__name__}: {str(e)}")
            raise

    def insert_policy(self) -> dict:
        """

        Defines conflict handling for bulk_insert_data() method.

        Returns a dictionary containing SQL SET clauses for ON CONFLICT DO UPDATE.
        SQLAlchemy validates clause syntax before execution, however business logic must be validated through testing.

        Returns:
            dict:
              - Empty: ON CONFLICT DO NOTHING, and is default behavior
              - Non empty: Used as SET clause for ON CONFLICT DO UPDATE
              - Keys: Strings matching model column names
              - Values: Any valid SQLAlchemy expression or Python literal (eg text(), func.*())

        Example:
        Given a table defined as:
        class DummyModel(Base):
            __tablename__ = "test_table"
            id = Column(Integer, primary_key=True)
            name = Column(String)
            value = Column(Integer)
            data_changed_at = Column(DateTime)

        An update policy that only updates if new data is newer:
        def insert_policy(self):
            return {
                "name": text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                           "THEN EXCLUDED.name ELSE test_table.name END"),
                "value": text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                            "THEN EXCLUDED.value ELSE test_table.value END"),
                "data_changed_at": text("CASE WHEN test_table.data_changed_at < EXCLUDED.data_changed_at "
                            "THEN EXCLUDED.data_changed_at ELSE test_table.data_changed_at END")
            }
        """

        """Default behavior: Do nothing on conflict. Override in subclasses."""
        return {}

    def save_geojson(self, features) -> None:
        """
        Write the geojson file to the public/data folder
        """
        geojson_path = Path(f"{_PREFIX_DATA_GEOJSON_PATH}{self.table.__name__}.geojson")
        try:
            with open(geojson_path, "wt") as f:
                json.dump(features, f)

            self.logger.info(
                f"Generated {_PREFIX_DATA_GEOJSON_PATH}{self.table.__name__}.geojson"
            )
        except Exception as e:
            self.logger.error(f"Failed to write GeoJSON: {e}")
            raise
