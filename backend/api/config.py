"""
Provides the environment variables that are read by the application
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from functools import lru_cache


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
        if (parent / "compose.yaml").is_file():
            break
    return None


BACKEND_DIR = Path(__file__).parent
ENV_FILE = find_env_file(BACKEND_DIR) or find_env_file(BACKEND_DIR, ".env.example")


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
