from abc import ABC, abstractmethod
from typing import Generator
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
from typing import Type, TypeVar
import time


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
        Fetches data from the API with retry logic

        Retries the request up to 5 times if necessary.
        Returns the response data as a dictionary.
        """
        # ####### ######## ######## ######## ####### ######## ##########
        ## ####### ######## ########TODO##### ####### ######## #########
        ## FIX THIS CODE BECAUSE IT RETURNS NOTHING FOR SOFT STORIES ###
        #### ### AND POSSIBLY OTHER DATA SETS; I HAVEN'T CHECKED. ######
        ## IT RETURNS ALL THE SOFT STORY DATA WHEN RUN IN A NOTEBOOK. ##
        # SEE ALSO parse_data in soft_story_properties_data_handler.py #
        ####### ####### ######## ######## ######## ####### ######## ####
        @staticmethod
        def _yield_data(url) -> Generator:
            # Start with an initial offset or page number if needed (depends on API)
            offset = 0
            while True:
                # Adjust the params to include pagination (if applicable)
                paginated_params = params.copy() if params else {}
                paginated_params.update({"$offset": offset})
                try:
                    response = session.get(url, params=paginated_params, timeout=60)
                    response.raise_for_status()
                    # Assuming the response is paginated and contains a 'features' key
                    data = response.json()
                    # Yield only the 'features' part of the response
                    features = data.get('features', [])
                    if features:
                        yield features
                        time.sleep(1)
                    # Check if there are more pages (assuming an empty 'features' list means we're done)
                    if not data.get('features'):  # If 'features' is empty, end the loop
                        break
                    # Update the offset for the next page (pagination logic)
                    offset += len(data.get('features', []))
                except requests.RequestException as e:
                    # Handle any HTTP request exceptions (e.g., network error)
                    print(f"Request failed: {e}")
                    break

        retry = Retry(total=5, backoff_factor=1)
        adapter = HTTPAdapter(max_retries=retry)
        session = requests.Session()
        session.mount("https://", adapter)
        all_features = []
        for features in _yield_data(self.url):
            all_features.extend(features)
        return {"features": all_features}
        

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
