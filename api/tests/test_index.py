"""
Test the API of index.py.
"""
import pytest
from fastapi.testclient import TestClient
# Will the .. be stable?
from ..index import app
from ..schemas import Polygon


@pytest.fixture
def client():
    return TestClient(app)
