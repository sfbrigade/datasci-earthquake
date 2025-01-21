"""
Provides the environment variables that are read by the application
"""

from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from functools import lru_cache


class Settings(BaseSettings):
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgis_version: str
    frontend_host: str
    neon_url: str
    database_url: str
    localhost_database_url: str
    database_url_sqlalchemy: str
    database_url_sqlalchemy_test: str
    localhost_database_url_sqlalchemy: str
    environment: str
    secret_key: str
    next_public_api_url: str
    next_public_mapbox_token: str
    node_env: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()


# Cache the settings to avoid multiple calls to load the same settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()
