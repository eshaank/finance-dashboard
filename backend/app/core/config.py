from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Finance Dashboard API"
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    # Shared API key used for both Polygon.io and Massive API
    massive_api_key: str = ""
    massive_base_url: str = "https://api.massive.com"
    supabase_url: str = ""
    rate_limit: str = "60/minute"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
