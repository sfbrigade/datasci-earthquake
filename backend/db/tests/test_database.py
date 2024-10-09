import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from ...api.models.comined_risk import Base, CombinedRisk

DATABASE_URL = "postgresql://user:password@localhost:5432/qsdatabase"

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


'''
@pytest.fixture(scope='session')
def db_connection():
    connection = connect_to_mock_db()
    yield connection
    connection.close()
    drop_database()

def test_database_connection(db_connection):
    count_users = execute_raw_sql(db_connection, "SELECT COUNT(*) FROM users")[0][0]
    count_products = execute_raw_sql(db_connection, "SELECT COUNT(*) FROM products")[0][0]
    assert count_users == 2
    assert count_products == 2

def test_user_name(db_connection):
    result = execute_raw_sql(db_connection, "SELECT name FROM users WHERE id = 1")[0][0]
    assert result == "John Doe"

def test_product_price(db_connection):
    result = execute_raw_sql(db_connection, "SELECT price FROM products WHERE name = 'Laptop'")[0][0]
    assert result == 999.99

def test_transaction(db_connection):
    with db_connection.begin():
        execute_raw_sql(db_connection, "INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com')")
    
    count_users = execute_raw_sql(db_connection, "SELECT COUNT(*) FROM users")[0][0]
    assert count_users == 3

def test_rollback(db_connection):
    try:
        with db_connection.begin():
            execute_raw_sql(db_connection, "INSERT INTO users (name, email) VALUES ('Rollback User', 'rollback@example.com')")
            raise Exception("Test rollback")
    except:
        pass
    
    count_users = execute_raw_sql(db_connection, "SELECT COUNT(*) FROM users")[0][0]
    assert count_users == 2
'''