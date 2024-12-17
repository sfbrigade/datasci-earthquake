import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.api.models.combined_risk import Base, CombinedRisk
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


def test_insert_combined_risk(test_db):
    # Arrange
    new_risk = CombinedRisk(
        address="124 Test St, San Francisco, CA",
        soft_story_risk=True,
        seismic_hazard_risk=False,
        landslide_risk=False,
        liquefaction_risk=False,
    )

    # Act
    test_db.add(new_risk)
    test_db.commit()

    # Assert
    result = (
        test_db.query(CombinedRisk)
        .filter_by(address="124 Test St, San Francisco, CA")
        .first()
    )
    assert result is not None
    assert result.soft_story_risk is True
    assert result.seismic_hazard_risk is False


def test_query_combined_risk(test_db):
    # Act
    results = test_db.query(CombinedRisk).all()

    # Assert
    assert len(results) > 0  # Check if there are records
    assert all(
        isinstance(r, CombinedRisk) for r in results
    )  # Ensure all records are CombinedRisk instances
