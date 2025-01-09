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
    check_tables_exist(): Checks if any tables exist in the database.

Usage:
    Run this script in docker to initialize the database by creating 
    all necessary tables.  If existing tables are detected, they will 
    be dropped and recreated.

Example:
    $ docker exec -it datasci-earthquake-backend-1 python backend/database/init_db.py
    Database tables created.

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
from backend.api.models.addresses import Address
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.landslide_zones import LandslideZone
from backend.api.models.seismic_hazard_zones import SeismicHazardZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty


def init_db():
    if check_tables_exist():
        drop_db()
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


def drop_db():
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped.")


def check_tables_exist():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return len(tables) > 0


if __name__ == "__main__":
    # Run this script directly to initialize the database
    init_db()
