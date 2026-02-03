import asyncio
import random

from fastapi import APIRouter, HTTPException

from schemas.sermon import SermonRequest, SermonResponse
from services.database import SermonCacheService
from services.gemini import GeminiService
from services.youtube import YouTubeService

router = APIRouter()

CACHE_DELAY_MIN = 10
CACHE_DELAY_MAX = 15


@router.post("/sermon", response_model=SermonResponse)
async def get_sermon(request: SermonRequest):
    """
    YouTube 영상의 자막을 추출한 뒤, 요약합니다.

    - **url**: YouTube 영상 URL 또는 비디오 ID
    - **languages**: 선호하는 언어 코드 목록 (우선순위 순, 기본값: ["ko", "en"])
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    try:
        video_id = YouTubeService.extract_video_id(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    cached = await SermonCacheService.get_cached_sermon(video_id)
    if cached:
        delay = random.uniform(CACHE_DELAY_MIN, CACHE_DELAY_MAX)
        await asyncio.sleep(delay)
        return SermonResponse(
            video_id=cached["video_id"],
            summary=cached["summary"],
            sermon_date=cached["sermon_date"],
            is_non_sermon=cached.get("is_non_sermon", False),
        )

    transcript_text = await YouTubeService.get_transcript_text(
        video_id, request.languages, request.preserve_formatting
    )

    result = await GeminiService.summarize_transcript(transcript_text)

    sermon_date = await YouTubeService.get_video_upload_date(video_id)

    await SermonCacheService.save_sermon(
        video_id, result.summary, sermon_date, result.is_non_sermon
    )

    return SermonResponse(
        video_id=video_id,
        summary=result.summary,
        sermon_date=sermon_date,
        is_non_sermon=result.is_non_sermon,
    )
