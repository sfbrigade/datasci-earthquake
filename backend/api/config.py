from pydantic_settings import BaseSettings
from functools import lru_cache


"""
Provides the environment variables that are read by the application.
"""
class Settings(BaseSettings): 
    postgres_user: str
    postgres_password: str
    postgres_db: str
    frontend_host: str
    database_url: str
    localhost_database_url: str
    environment: str
    secret_key: str
    next_public_api_url: str
    node_env: str


    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"


# Cache the settings to avoid multiple calls to load the same settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()