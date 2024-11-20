from sqlalchemy.orm import Session
from backend.database.session import engine
from backend.api.models.base import Base


# Function to create tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


# Optional: function to drop tables (use with caution)
def drop_db():
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped.")


if __name__ == "__main__":
    # Run this script directly to initialize the database
    init_db()
