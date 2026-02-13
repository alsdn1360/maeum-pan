from fastapi import APIRouter

from schemas.sermon import SermonRequest
from services.sermon import SermonService

router = APIRouter()


@router.get("/transcript/{video_id}")
async def get_transcript_by_id(
    video_id: str,
    languages: str | None = "ko,en",
    preserve_formatting: bool = False,
):
    """
    GET 방식으로 YouTube 영상의 자막을 추출합니다.

    - **video_id**: YouTube 비디오 ID (11자리)
    - **languages**: 선호하는 언어 코드 (쉼표로 구분, 기본값: "ko,en")
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    normalized_languages = languages or "ko,en"
    language_list = [
        lang.strip() for lang in normalized_languages.split(",") if lang.strip()
    ]

    request = SermonRequest(
        url=video_id,
        languages=language_list,
        preserve_formatting=preserve_formatting,
    )

    return await SermonService.create_sermon_response(request)
