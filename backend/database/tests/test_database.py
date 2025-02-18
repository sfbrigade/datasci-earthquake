import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.api.config import settings


@pytest.fixture(scope="module")
def test_db():
    # Create a session using the existing database
    engine = create_engine(settings.database_url_sqlalchemy_test)
    connection = engine.connect()

    # Begin a transaction
    transaction = connection.begin()

    Session = scoped_session(sessionmaker(bind=connection))
    session = Session()
    # Start a transaction
    session.begin_nested()

    yield session  # This will be the session we use in tests

    session.rollback()
    session.close()  # Clean up after tests
    connection.close()
