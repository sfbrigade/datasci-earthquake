from abc import ABC, abstractmethod
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from backend.database.session import get_db
from sqlalchemy.ext.declarative import DeclarativeMeta


class DataHandler(ABC):
    def __init__(self, url: str, table: DeclarativeMeta):
        self.url = url
        self.table = table

    def fetch_data(self, params=None) -> dict:
        retry = Retry(total=5, backoff_factor=1)
        adapter = HTTPAdapter(max_retries=retry)
        session = requests.Session()
        session.mount("https://", adapter)
        response = session.get(self.url, params=params, timeout=60)
        response.raise_for_status()
        return response.json()

    @abstractmethod
    def parse_data(self, data: dict) -> list[dict]:
        pass

    def bulk_insert_data(self, data_dicts: list[dict], id_field: str):
        # TODO: Implement logic to upsert only changed data
        with next(get_db()) as db:
            stmt = pg_insert(self.table).values(data_dicts)
            stmt = stmt.on_conflict_do_nothing(index_elements=[id_field])
            db.execute(stmt)
            db.commit()
