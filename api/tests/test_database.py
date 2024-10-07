import pytest
from ..database import connect_to_mock_db, drop_database, execute_raw_sql

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
