import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.api.config import settings


def _get_database_url() -> str:
    match settings.environment:
        case "local" | "ci":
            print(f'using LOCAL DB STRING..')
            url = settings.localhost_database_url_sqlalchemy.lower()
            print('found localhost' if url.find('@localhost:') != -1 else 'nope') 
            print('found db_test' if url.find('@db_test:') != -1 else 'nopenope') 
            print('found db' if url.find('@db:') != -1 else 'nopenopenope') 

            #return settings.localhost_database_url_sqlalchemy
            return settings.database_url_sqlalchemy_test 
        case "prod":
            print(f'using PROD DB STRING..')
            return '' 
        case "dev_docker":
            print(f'using DEV_DOCKER DB STRING..')
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
