import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ...api.models.base import Base
from backend.api.config import settings
from fastapi.testclient import TestClient
from ..main import app
from backend.database.session import get_db


# Set up a test database engine
@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(settings.localhost_database_url_sqlalchemy)
    yield engine


# Set up a test session
@pytest.fixture
def test_session(test_engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.rollback()  # Roll back to clean up after each test
        db.close()


# Override the get_db dependency for tests
@pytest.fixture
def client(test_session):
    def override_get_db():
        try:
            yield test_session
        finally:
            test_session.close()

    app.dependency_overrides[get_db] = override_get_db  # Override dependency
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()  # Clear overrides after tests
