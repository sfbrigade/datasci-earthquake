from pydantic_settings import BaseSettings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from functools import lru_cache
from typing import Generator

"""
Provides the environment variables that are read by the application.
"""


class Settings(BaseSettings):
    postgres_password: str
    postgres_db: str
    frontend_host: str
    database_url: str
    localhost_database_url: str
    database_url_sqlalchemy: str
    environment: str
    secret_key: str
    next_public_api_url: str
    node_env: str

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"


# Create engine and session local
settings = Settings()
engine = create_async_engine(settings.database_url_sqlalchemy, echo=True)
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)


# Database dependency
async def get_db() -> Generator[AsyncSession, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Cache the settings to avoid multiple calls to load the same settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()
