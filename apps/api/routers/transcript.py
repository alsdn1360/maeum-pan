from fastapi import APIRouter

from ..core.errors import ApiError
from ..schemas.sermon import TranscriptResponse
from ..services.youtube import YouTubeService

router = APIRouter()


@router.get("/transcript/{video_id}", response_model=TranscriptResponse)
async def get_transcript_by_id(
    video_id: str,
    languages: str | None = None,
    preserve_formatting: bool = False,
):
    """
    GET 방식으로 YouTube 영상의 자막을 추출합니다.

    - **video_id**: YouTube 비디오 ID (11자리)
    - **languages**: 선호하는 언어 코드 (쉼표로 구분, 기본값: "ko,en")
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    try:
        normalized_video_id = YouTubeService.extract_video_id(video_id)
    except ValueError as exc:
        raise ApiError(
            status_code=400,
            code="INVALID_YOUTUBE_URL",
            message="유효한 유튜브 영상 링크를 입력해주세요.",
        ) from exc

    normalized_languages = "ko,en" if languages is None else languages
    language_list = [
        lang.strip() for lang in normalized_languages.split(",") if lang.strip()
    ]

    if not language_list:
        raise ApiError(
            status_code=422,
            code="INVALID_REQUEST",
            message="요청값이 올바르지 않습니다.",
            details=[
                {
                    "field": "languages",
                    "message": "languages는 최소 1개 이상 필요합니다.",
                }
            ],
        )

    transcript_text = await YouTubeService.get_transcript_text(
        normalized_video_id, language_list, preserve_formatting
    )

    return TranscriptResponse(
        video_id=normalized_video_id,
        transcript=transcript_text,
    )
