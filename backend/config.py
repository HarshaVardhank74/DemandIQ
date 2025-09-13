# NEW corrected code for config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # This tells pydantic v2 to load the variables from a .env file
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()