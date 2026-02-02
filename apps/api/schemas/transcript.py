from pydantic import BaseModel, ConfigDict, Field, field_validator


class TranscriptRequest(BaseModel):
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


class TranscriptResponse(BaseModel):
    """자막 요약 응답 스키마 (camelCase)"""

    model_config = ConfigDict(serialize_by_alias=True)
    video_id: str = Field(..., serialization_alias="videoId")
    summary: str
    sermon_date: str = Field(..., serialization_alias="sermonDate")  # YYYY-MM-DD
