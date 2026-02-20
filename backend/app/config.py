from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Finance Dashboard API"
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    polygon_api_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
