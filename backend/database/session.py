import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.api.config import settings

myLog = logging.getLogger('DummyDataHandler')
def _get_database_url() -> str:
    match settings.environment:
        case "local" | "ci":
            myLog.warning(f'oh high!.....settings env = {settings.environment}')
            return settings.localhost_database_url_sqlalchemy
        case "prod":
            return settings.neon_url
        case "dev_docker":
            myLog.warning(f'oh hi!.....settings env = {settings.environment}')
            if (settings.database_url_sqlalchemy.index('@db_test')):
              print('has it!!!!!')
            return settings.database_url_sqlalchemy
        case _:
            raise ValueError(f"Unknown environment: {settings.environment}")


# Set up the database engine using settings
engine = create_engine(
    _get_database_url(),
    pool_size=10,
    pool_timeout=30,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=3600,
)

logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
