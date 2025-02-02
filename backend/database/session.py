from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.api.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_database_url() -> str:
    match settings.environment:
        case "local":
            logger.info("LOCAL ENV")
            return settings.database_url_sqlalchemy
        case "ci" | "prod":
            logger.info("CI ENV")
            return settings.neon_url
        case _:
            raise ValueError(f"Unknown environment: {settings.environment}")


# Set up the database engine using settings
engine = create_engine(_get_database_url(), echo=True)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
