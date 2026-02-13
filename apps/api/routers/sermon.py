from fastapi import APIRouter, HTTPException

from schemas.sermon import SermonRequest, SermonResponse
from services.database import SermonCacheService
from services.sermon import SermonService

router = APIRouter()


@router.get("/sermon/{video_id}", response_model=SermonResponse)
async def get_sermon_by_id(video_id: str):
    cached = await SermonCacheService.get_cached_sermon(video_id)
    if not cached:
        raise HTTPException(status_code=404, detail="해당 설교를 찾을 수 없습니다.")

    return SermonResponse(
        video_id=cached["video_id"],
        summary=cached["summary"],
        original_url=cached.get("original_url"),
        created_at=cached["created_at"],
        is_non_sermon=cached.get("is_non_sermon", False),
    )


@router.post("/sermon", response_model=SermonResponse)
async def create_sermon(request: SermonRequest):
    """
    YouTube 영상의 자막을 추출한 뒤, 요약합니다.

    - **url**: YouTube 영상 URL 또는 비디오 ID
    - **languages**: 선호하는 언어 코드 목록 (우선순위 순, 기본값: ["ko", "en"])
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    return await SermonService.create_sermon_response(request)
