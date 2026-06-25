import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.api.config import settings


def _get_database_url() -> str:
    match settings.environment:
        case "local" | "ci":
            # "local": developer running the backend directly (outside Docker).
            # "ci": the nextjs_build_check job in ci.yml sets ENVIRONMENT=ci, but that job
            # only runs `npm run build` — it never imports backend Python or connects to a DB.
            # The Docker-based CI tests (docker_build_test) use ENVIRONMENT=dev_docker instead.
            # This "ci" branch is kept as a safe fallback in case backend code is ever run
            # outside Docker in a CI context, but it is not reached by any current workflow.
            return settings.localhost_database_url_sqlalchemy
        case "prod":
            return settings.neon_url
        case "dev_docker":
            # Used by compose.yaml for both local Docker development and Docker-based CI tests.
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
