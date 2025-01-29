from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.api.config import settings

# Set up the database engine using settings
# engine = create_engine(settings.database_url_sqlalchemy, echo=True)
engine = create_engine(settings.database_url_sqlalchemy)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
