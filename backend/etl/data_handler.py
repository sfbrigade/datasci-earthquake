from abc import ABC, abstractmethod
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from sqlalchemy.orm import Session, DeclarativeBase
from sqlalchemy.dialects.postgresql import insert as pg_insert
from backend.database.session import get_db
from backend.api.models.base import ModelType
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import transform
from pyproj import CRS, Transformer
from geoalchemy2.shape import from_shape
from typing import Type, Generator
import time
import logging


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class DataHandler(ABC):
    """
    Abstract base class for handling data operations with an external
    API and database.

    Attributes:
        url (str): The API endpoint URL.
        table (ModelType): The SQLAlchemy table object.
    """

    def __init__(self, url: str, table: Type[ModelType]):
        self.url = url
        self.table = table

    def fetch_data(self, params=None) -> dict:
        """
        Fetches data from the API with retry logic.

        Args:
            params (dict, optional): Query parameters for the API request.

        Returns:
            dict: Dictionary containing list of features under 'features' key.

        Raises:
            requests.RequestException: If all retry attempts fail.
        """
        @staticmethod
        def _yield_data(url: str, session: requests.Session, params: dict = None) -> Generator:
            """
            Yields features from the url, paginating if necessary.

            Args:
                url: API endpoint URL
                session: Configured requests session
                params: Base query parameters

            Yields:
                list: Features from current page
            """
            offset = 0
            page_num = 1
            while True:
                paginated_params = params.copy() if params else {}
                paginated_params.update({"$offset": offset})
                
                try:
                    response = session.get(url, params=paginated_params, timeout=60)
                    response.raise_for_status()
                    data = response.json()
                    
                    features = data.get('features', [])
                    if not features:
                        logging.info(f"{self.table.__name__}: Finished retrieving all pages.")
                        break
                        
                    yield features
                    logging.info(f"{self.table.__name__}: Retrieved {len(features)} features on page {page_num}.")
                    
                    offset += len(features)
                    page_num += 1

                    time.sleep(1)
                    
                except requests.RequestException as e:
                    logging.error(f"{self.table.__name__}: Request failed on page {page_num}: {str(e)}. Aborting fetching data.")
                    raise  # Re-raise to trigger retry logic

        retry_strategy = Retry(
            total=5,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],  # status codes to retry
            allowed_methods=["GET"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session = requests.Session()
        session.mount("https://", adapter)
        session.mount("http://", adapter)

        try:
            all_features = []
            for features in _yield_data(self.url, session, params):
                all_features.extend(features)
            logging.info(f"{self.table.__name__}: Successfully fetched {len(all_features)} total features.")
            return {"features": all_features}
        finally:
            session.close()

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
