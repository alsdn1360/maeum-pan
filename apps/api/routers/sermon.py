from fastapi import APIRouter

from ..core.errors import ApiError
from ..schemas.sermon import SermonRequest, SermonResponse
from ..services.database import SermonCacheService
from ..services.sermon import SermonService
from ..services.youtube import YouTubeService

router = APIRouter()


@router.get("/sermon/{video_id}", response_model=SermonResponse)
async def get_sermon_by_id(video_id: str):
    try:
        normalized_video_id = YouTubeService.extract_video_id(video_id)
    except ValueError as exc:
        raise ApiError(
            status_code=400,
            code="INVALID_YOUTUBE_URL",
            message="유효한 유튜브 영상 링크를 입력해주세요.",
        ) from exc

    cached = await SermonCacheService.get_cached_sermon(normalized_video_id)
    if not cached:
        raise ApiError(
            status_code=404,
            code="SERMON_NOT_FOUND",
            message="요청한 설교를 찾을 수 없습니다.",
        )

    return SermonResponse.from_cache(cached)


@router.post("/sermon", response_model=SermonResponse)
async def create_sermon(request: SermonRequest):
    """
    YouTube 영상의 자막을 추출한 뒤, 요약합니다.

    - **url**: YouTube 영상 URL 또는 비디오 ID
    - **languages**: 선호하는 언어 코드 목록 (우선순위 순, 기본값: ["ko", "en"])
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    return await SermonService.create_sermon_response(request)
