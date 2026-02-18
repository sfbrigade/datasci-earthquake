"""
Provides the environment variables that are read by the application
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class SettingsV2(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:password@localhost:5432/qsdatabase"
    favorite_animal: str = 'wombat'
    favorite_pw: str = 'password'
    database_url_haha: str = "postgresql+psycopg2://oh:no@localhost:5432/qsdatabase"

    # postgres_user: str
    # postgres_password: str
    # postgres_db: str

    postgis_version: str

    # frontend_host: str
    # neon_url: str
    # database_url_sqlalchemy: str
    # database_url_sqlalchemy_test: str
    # localhost_database_url_sqlalchemy: str
    # next_public_api_url: str
    # next_public_mapbox_token: str

    node_env: str
    environment: str = "local"

    # next_public_cdn_url: str
    # sentry_dsn: str
    # next_public_posthog_host: str
    # next_public_posthog_key: str

    #model_config = SettingsConfigDict(
    #    env_file=ENV_FILE,
    #    env_file_encoding="utf-8",
    #)


settingsV2 = SettingsV2()
print('----- my settings ------')
print(settingsV2.model_dump())
print('----- end settings ------')
