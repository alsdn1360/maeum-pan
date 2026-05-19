from fastapi import APIRouter
from pydantic import ValidationError

from ..core.errors import ApiError
from ..schemas.sermon import SermonRequest
from ..services.sermon import SermonService

router = APIRouter()


@router.get("/transcript/{video_id}")
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

    try:
        request = SermonRequest(
            url=video_id,
            languages=language_list,
            preserve_formatting=preserve_formatting,
        )
    except ValidationError as exc:
        raise ApiError(
            status_code=422,
            code="INVALID_REQUEST",
            message="요청값이 올바르지 않습니다.",
            details=exc.errors(),
        ) from exc

    return await SermonService.create_sermon_response(request)
