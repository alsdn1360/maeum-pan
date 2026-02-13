from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SermonRequest(BaseModel):
    """자막 요청 스키마"""

    url: str
    languages: list[str] = ["ko", "en"]  # 기본값: 한국어 우선, 영어 대체
    preserve_formatting: bool = False

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("URL은 필수입니다")
        return v.strip()


class SermonResponse(BaseModel):
    """자막 요약 응답 스키마 (camelCase)"""

    model_config = ConfigDict(serialize_by_alias=True)
    video_id: str = Field(..., serialization_alias="videoId")
    summary: str
    original_url: str = Field(..., serialization_alias="originalUrl")
    created_at: datetime = Field(..., serialization_alias="createdAt")
    is_non_sermon: bool = Field(False, serialization_alias="isNonSermon")
