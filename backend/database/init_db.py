"""
Database Initialization Script

This script provides functions to manage database tables using 
SQLAlchemy. It includes functions to create, drop, and check the 
existence of tables in the database. 

Functions:
    init_db(): Creates all tables defined in the SQLAlchemy `Base` 
               metadata.  Drops existing tables if they already exist.
    drop_db(): Drops all tables defined in the SQLAlchemy `Base` 
               metadata. Use cautiously because this action is 
               irreversible.
    check_tables_exist(): Checks if all ETL-related tables exist in the database.
    check_tables_empty(): Checks if any main tables are empty.

Usage:
    Run this script in docker to initialize the database by creating 
    all necessary tables.  If existing tables are detected but are empty,
    they will be populated.  If tables exist and are not empty, the ETL
    process will be skipped.

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
        print("Database tables created. ETL should run to populate data.")
    elif check_tables_empty():
        print(
            "Tables exist but at least one is empty. ETL should run to populate data."
        )
    else:
        print("Tables exist and are populated.")
        print("SKIP_ETL")


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
    with SessionLocal() as session:
        for table in table_classes:
            if session.query(table).first() is None:
                return True
    return False


if __name__ == "__main__":
    # Run this script directly to initialize the database
    init_db()
