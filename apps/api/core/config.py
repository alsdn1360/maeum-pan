import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "마음판 API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "유튜브 설교 영상의 스크립트를 추출하고, Gemini API를 사용해 요약합니다"
    )

    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings():
    return Settings()
