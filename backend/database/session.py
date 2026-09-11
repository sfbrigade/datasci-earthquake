import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from backend.api.config import get_settings
from functools import lru_cache


def _get_database_url() -> str:
    settings = get_settings()
    match settings.environment:
        case "local" | "ci":
            # ci uses localhost so that pytest can run against a local test DB
            return settings.localhost_database_url_sqlalchemy
        case "prod" | "preview":
            return settings.database_url_sqlalchemy
        case "dev_docker":
            return settings.database_url_sqlalchemy
        case _:
            raise ValueError(f"Unknown environment: {settings.environment}")


# Set up the database engine using settings
@lru_cache(maxsize=1)
def get_engine():
    engine = create_engine(
        _get_database_url(),
        pool_size=10,
        pool_timeout=30,
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=3600,
    )
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
    return engine


# Dependency function to get a database session
def get_db():
    with Session(get_engine()) as db:
        yield db
