import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.api.config import get_settings
from functools import lru_cache


def _get_database_url() -> str:
    settings = get_settings()
    match settings.environment:
        case "local" | "ci":
            return settings.localhost_database_url_sqlalchemy
        case "prod":
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


# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False)


# Dependency function to get a database session
def get_db():
    db = SessionLocal(bind=get_engine())
    try:
        yield db
    finally:
        db.close()
