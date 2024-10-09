'''
from sqlalchemy import create_engine, Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import psycopg2
from psycopg2 import pool
from sqlalchemy.sql import text


# Mock PostgreSQL connection details
DB_NAME = "test_db"
DB_USER = "test_user"
DB_PASSWORD = "test_password"
DB_HOST = "localhost"

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    email = Column(Text)

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    price = Column(Float)

def create_mock_database():
    # Create a new PostgreSQL instance
    shell_command = f"psql -c 'CREATE DATABASE {DB_NAME};'"
    os.system(shell_command)

    # Create a new PostgreSQL user
    shell_command = f"psql -c 'CREATE USER {DB_USER} WITH PASSWORD \'{DB_PASSWORD}\';'"
    os.system(shell_command)

    # Connect to the newly created database
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

    # Create tables
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            email VARCHAR(100)
        )
    """)
    cur.execute("""
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            price DECIMAL(10, 2)
        )
    """)
    conn.commit()

    # Insert sample data
    cur.execute("INSERT INTO users (name, email) VALUES (%s, %s)", ("John Doe", "john@example.com"))
    cur.execute("INSERT INTO users (name, email) VALUES (%s, %s)", ("Jane Smith", "jane@example.com"))
    cur.execute("INSERT INTO products (name, price) VALUES (%s, %s)", ("Laptop", 999.99))
    cur.execute("INSERT INTO products (name, price) VALUES (%s, %s)", ("Smartphone", 499.99))
    conn.commit()

    cur.close()
    conn.close()

def connect_to_mock_db():
    engine = create_engine(f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")
    Session = sessionmaker(bind=engine)
    return Session()

def execute_raw_sql(session, sql, params=None):
    with session.begin():
        session.execute(text(sql), params or ())

def drop_database():
    # Drop the database
    shell_command = f"psql -c 'DROP DATABASE {DB_NAME};'"
    os.system(shell_command)

    # Remove the user
    shell_command = f"psql -c 'DROP USER {DB_USER};'"
    os.system(shell_command)

def main():
    create_mock_database()
    yield
    drop_database()

if __name__ == "__main__":
    main()
'''