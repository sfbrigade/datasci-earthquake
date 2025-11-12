"""
Database Initialization Script

This script provides functions to manage database tables using 
SQLAlchemy. It includes functions to create, drop, and check the 
existence of tables in the database. 

Functions:
    init_db(): Ensures that all tables defined in the SQLAlchemy `Base` 
               metadata exist. Print per-table ETL signals indicating which
               tables need ETL.
    drop_db(): Drops all tables defined in the SQLAlchemy `Base` 
               metadata. Use cautiously because this action is 
               irreversible.
    check_tables_exist(): Checks if all ETL-related tables exist in the database.
    check_tables_empty(): Checks if any main tables are empty. Returns a list 
                          of names of empty tables.

Usage:
    Run this script in docker to initialize the database by creating 
    all necessary tables.  If existing tables are detected but are empty,
    any empty tables will be populated. If all tables exist and are not
    empty, the ETL process will be skipped entirely.

Example:
    $ docker exec -it datasci-earthquake-backend-1 python backend/database/init_db.py
    Database tables created. ETL should run to populate data.

Note:
    The `Base` object should be imported from your SQLAlchemy model 
    definitions.

Caution:
    The `drop_db()` function will irreversibly remove all tables from 
    the database. Ensure you have backups if necessary.
"""

from backend.api.models.base import Base
from sqlalchemy import inspect
from backend.database.session import engine
from sqlalchemy.orm import sessionmaker
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.landslide_zones import LandslideZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    if not check_tables_exist():
        Base.metadata.create_all(bind=engine)
        print("Database tables created.")

    empty_tables = check_tables_empty()
    if empty_tables:
        for table_name in empty_tables:
            print(f"ETL_REQUIRED:{table_name}")
    else:
        print("All required tables exist and are populated.")


def drop_db():
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped.")


table_classes = [TsunamiZone, LiquefactionZone, SoftStoryProperty]


def check_tables_exist():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    for table in table_classes:
        if table.__tablename__ not in tables:
            return False
    return True


# LandslideZone is not being used, and isn't included in this check.
def check_tables_empty():
    empty_tables = []
    with SessionLocal() as session:
        for table in table_classes:
            if session.query(table).first() is None:
                empty_tables.append(table.__tablename__)
    return empty_tables


if __name__ == "__main__":
    # Run this script directly to initialize the database
    init_db()
