from abc import ABC, abstractmethod
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from backend.database.session import get_db
from sqlalchemy.ext.declarative import DeclarativeMeta
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import transform
from pyproj import CRS, Transformer
from geoalchemy2.shape import from_shape


class DataHandler(ABC):
    """
    Abstract base class for handling data operations with an external
    API and database.

    Attributes:
        url (str): The API endpoint URL.
        table (DeclarativeMeta): The SQLAlchemy table object.
    """

    def __init__(self, url: str, table: DeclarativeMeta):
        self.url = url
        self.table = table

    def fetch_data(self, params=None) -> dict:
        """
        Fetch data from the API with retry logic.

        Retries the request up to 5 times if necessary.
        Returns the response data as a dictionary.
        """
        retry = Retry(total=5, backoff_factor=1)
        adapter = HTTPAdapter(max_retries=retry)
        session = requests.Session()
        session.mount("https://", adapter)
        response = session.get(self.url, params=params, timeout=60)
        response.raise_for_status()
        return response.json()

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

    def bulk_insert_data_autoincremented(self, data_dicts: list[dict]):
        """
        Inserts the list of dictionaries with SQLAlchemy-generated IDs into the database table as
        SQLAlchemy objects
        """
        # TODO: Implement logic to upsert only changed data
        with next(get_db()) as db:
            stmt = pg_insert(self.table).values(data_dicts)
            stmt = stmt.on_conflict_do_nothing()
            db.execute(stmt)
            db.commit()
