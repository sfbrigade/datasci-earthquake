from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    domain: str 
    postgres_user: str
    postgres_password: str
    postgres_db: str
    database_url: str
    host_database_url: str
    environment: str
    environment: str
    secret_key: str
    next_public_api_url: str


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Cache the settings to avoid multiple calls to load the same settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()