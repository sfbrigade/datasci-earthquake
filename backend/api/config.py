"""
Provides the environment variables that are read by the application
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from sys import path
from functools import lru_cache

ROOT_DIR = Path(path[0])


def find_env_file(start: Path, filename: str = ".env") -> Path | None:
    """
    Walk upwards from `start` until `filename` is found or the root directory is reached.
    Returns the Path if found, otherwise None.
    """
    current = start.resolve()
    for parent in [current, *current.parents]:
        candidate = parent / filename
        if candidate.is_file():
            return candidate
        if parent == ROOT_DIR:
            break
    return None


ENV_FILE = find_env_file(Path(__file__))


class Settings(BaseSettings):
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgis_version: str
    frontend_host: str
    neon_url: str
    database_url_sqlalchemy: str
    database_url_sqlalchemy_test: str
    localhost_database_url_sqlalchemy: str
    next_public_api_url: str
    next_public_mapbox_token: str
    node_env: str
    environment: str = "local"
    next_public_cdn_url: str
    sentry_dsn: str
    next_public_posthog_host: str
    next_public_posthog_key: str

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
    )


settings = Settings()


# Cache the settings to avoid multiple calls to load the same settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()
