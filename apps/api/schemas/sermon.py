from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SermonRequest(BaseModel):
    """자막 요청 스키마"""

    url: str
    languages: list[str] = Field(
        default_factory=lambda: ["ko", "en"]
    )  # 기본값: 한국어 우선, 영어 대체
    preserve_formatting: bool = False

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("URL은 필수입니다")
        return v.strip()

    @field_validator("languages")
    @classmethod
    def validate_languages(cls, v: list[str]) -> list[str]:
        normalized = [language.strip() for language in v if language.strip()]
        if not normalized:
            raise ValueError("languages는 최소 1개 이상 필요합니다")
        return normalized


class SermonResponse(BaseModel):
    """자막 요약 응답 스키마 (camelCase)"""

    model_config = ConfigDict(serialize_by_alias=True)
    video_id: str = Field(..., serialization_alias="videoId")
    summary: str
    original_url: str = Field(..., serialization_alias="originalUrl")
    created_at: datetime = Field(..., serialization_alias="createdAt")
    is_non_sermon: bool = Field(False, serialization_alias="isNonSermon")

    @classmethod
    def from_cache(cls, cached: dict) -> "SermonResponse":
        return cls(
            video_id=cached["video_id"],
            summary=cached["summary"],
            original_url=cached.get("original_url"),
            created_at=cached["created_at"],
            is_non_sermon=cached.get("is_non_sermon", False),
        )


class TranscriptResponse(BaseModel):
    """자막 추출 응답 스키마 (camelCase)"""

    model_config = ConfigDict(serialize_by_alias=True)
    video_id: str = Field(..., serialization_alias="videoId")
    transcript: str
