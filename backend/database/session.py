import logging
from sqlalchemy import create_engine  
from sqlalchemy.orm import sessionmaker
from backend.api.config import settings
from backend.api.config_v2 import settingsV2
from backend.api.models.base import Base


def _get_database_url() -> str:
    match settings.environment:
        case "local" | "ci":
            print(f'using LOCAL DB STRING..')
            url = settings.localhost_database_url_sqlalchemy.lower()
            print('found localhost' if url.find('@localhost:') != -1 else 'nope') 
            print('found lab' if url.find('5432') != -1 else 'nope numbers') 
            print('found labby' if url.find('5433') != -1 else 'nope numbers again') 

            return settings.localhost_database_url_sqlalchemy
            # return settings.localhost_database_url_sqlalchemy.replace('5432', '5433')

        case "prod":
            print(f'using PROD DB STRING..')
            return '' 
        case "dev_docker":
            print(f'using DEV_DOCKER DB STRING..')
            return settings.database_url_sqlalchemy
        case _:
            raise ValueError(f"Unknown environment: {settings.environment}")



def _get_database_url_v2() -> str:
    return settings.database_url


# Set up the database engine using settings
engine = create_engine(
    _get_database_url(),
    pool_size=10,
    pool_timeout=30,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=3600,
)


engineV2 = create_engine(
    _get_database_url_v2(),
    pool_size=10,
    pool_timeout=30,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=3600,
)


logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SessionLocalV2 = sessionmaker(autocommit=False, autoflush=False, bind=engineV2)


# Dependency function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_v2():
    db = SessionLocalV2()
    try:
        yield db
    finally:
        db.close()
