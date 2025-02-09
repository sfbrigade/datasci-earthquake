from abc import ABC, abstractmethod
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from sqlalchemy.dialects.postgresql import insert as pg_insert
from backend.database.session import get_db
from backend.api.models.base import ModelType
from shapely.ops import transform
from pyproj import Transformer
from typing import Type, Generator, Optional
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

class DataHandler(ABC):
    def __init__(
        self,
        url: str,
        table: Type[ModelType],
        page_size: int = 1000,
        params: Optional[dict] = None,
        session: Optional[requests.Session] = None,
        logger: Optional[logging.Logger] = None
    ):
        """
        Abstract base class for handling data operations with an external
        API and database.        
        Args:
            url (str): The API endpoint URL.
            table (ModelType): The SQLAlchemy table object.
            page_size (int): Number of records to fetch per page.
            params: Base query parameters for API requests
            session: Optional pre-configured requests session
            logger: Optional logger instance
        """
        self.url = url
        self.table = table
        self.page_size = page_size
        self.params = params or {}
        self.session = session or self._create_session()
        self.logger = logger or logging.getLogger(f"{self.__class__.__name__}")
        
        self.logger.info(
            f"Initialized handler for {table.__name__} "
            f"with URL: {url}, "
            f"page size: {page_size}, "
            f"params: {self.params}"
        )

    def _create_session(self) -> requests.Session:
        """Create a configured requests session with retry logic."""
        retry_strategy = Retry(
            total=5,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session = requests.Session()
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def _make_request(
        self,
        url: str,
        params: dict,
        timeout: int = 60
    ) -> dict:
        """
        Make HTTP request with error handling.
        
        Args:
            url: Request URL
            params: Query parameters
            timeout: Request timeout in seconds
            
        Returns:
            Response data as dictionary containing list of features under 'features' key.
        """
        start_time = time.time()
        try:
            response = self.session.get(url, params=params, timeout=timeout)
            response.raise_for_status()
            data = response.json()
            request_time = time.time() - start_time
            
            self.logger.debug(
                f"Request completed in {request_time:.2f}s: "
                f"URL={url}, "
                f"params={params}"
            )
            
            return data
        except Exception as e:
            self.logger.error(
                f"Request failed: {str(e)}, "
                f"URL={url}, "
                f"params={params}",
                exc_info=True
            )
            raise

    def _yield_data(self) -> Generator:
        """
        Yield paginated data from API.
        
        Yields:
            Feature data from each page
        """
        offset = 0
        page_num = 1
        
        while True:
            paginated_params = self.params.copy()
            paginated_params.update({
                "$offset": offset,
                "$limit": self.page_size
            })
            
            start_time = time.time()
            data = self._make_request(self.url, paginated_params)
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
            time.sleep(1)  # Rate limiting

    def fetch_data(self) -> dict:
        """
        Fetch all data from API using configured parameters.
        
        Returns:
            Dictionary with all features
        """
        self.logger.info(
            f"Starting data fetch for {self.table.__name__} "
            f"with params: {self.params}"
        )
        
        try:
            all_features = []
            for features in self._yield_data():
                all_features.extend(features)
            self.logger.info(
                f"{self.table.__name__}: Successfully fetched {len(all_features)} total features."
            )
                
            return {"features": all_features}
            
        except Exception as e:
            self.logger.error(f"Data fetch failed: {str(e)}", exc_info=True)
            raise
        finally:
            if not self.session:
                self.session.close()
                self.logger.debug("Closed session")

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
    def parse_data(self, data: dict) -> list[dict]:
        """
        Abstract method to parse the fetched data into a list of
        database row dictionaries
        """
        pass

    def bulk_insert_data(self, data_dicts: list[dict], id_field: str):
        """
        Inserts the list of dictionaries into the database table as
        SQLAlchemy objects.

        Rows that cause conflicts based on the `id_field` are skipped
        """
        # TODO: Implement logic to upsert only changed data
        with next(get_db()) as db:
            stmt = pg_insert(self.table).values(data_dicts)
            stmt = stmt.on_conflict_do_nothing(index_elements=[id_field])
            db.execute(stmt)
            db.commit()
            self.logger.info(
                f"{self.table.__name__}: Inserted {len(data_dicts)} rows into {self.table.__name__}."
            )
