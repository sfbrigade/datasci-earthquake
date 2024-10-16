from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from geoalchemy2 import Geometry
from datetime import DateTime, datetime 
import pytest
from sqlalchemy.orm import sessionmaker, scoped_session
from ...api.models.combined_risk import CombinedRisk
from ...api.models.landslide_zones import LandslideZones
from ...api.models.liquefaction_zones import LiquefactionZones
from ...api.models.landslide_zones import MAPPED_COLUMN_STRING_LENGTH, Neighborhoods
from ...api.models.seismic_hazard_zones import SeismicHazardZones
from ...api.models.soft_story_properties import SoftStoryProperties
from ...api.models.tsunami import TsunamiZones
from ...api.main import app


DATABASE_URL = "postgresql://user:password@localhost:5432/qsdatabase"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# TODO: add tables to database using SQLAlchemy
# TODO: need sample data to add and commit to this test database
#where do we want this seed test database functionality to live? this feels like a weird spot for it 


@pytest.fixture(scope='module')
def test_db():
    # Create a session using the existing database
    engine = create_engine(DATABASE_URL)
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
        address='124 Test St, San Francisco, CA',
        soft_story_risk=True,
        seismic_hazard_risk=False,
        landslide_risk=False,
        liquefaction_risk=False
    )
    
    # Act
    test_db.add(new_risk)
    test_db.commit()

    # Assert
    result = test_db.query(CombinedRisk).filter_by(address='124 Test St, San Francisco, CA').first()
    assert result is not None
    assert result.soft_story_risk is True
    assert result.seismic_hazard_risk is False


def test_query_combined_risk(test_db):
    # Act
    results = test_db.query(CombinedRisk).all()

    # Assert
    assert len(results) > 0  # Check if there are records
    assert all(isinstance(r, CombinedRisk) for r in results)  # Ensure all records are CombinedRisk instances    
