from sqlalchemy.orm import Session
from sqlalchemy import inspect
from backend.database.session import engine
from backend.api.models.base import Base
from backend.api.models.addresses import Address
from backend.api.models.tsunami import TsunamiZone


# Function to create tables
def init_db():
    if check_tables_exist():
        drop_db()
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


# Optional: function to drop tables (use with caution)
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
