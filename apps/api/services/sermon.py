import asyncio
import random
from datetime import UTC, datetime

from core.errors import ApiError
from schemas.sermon import SermonRequest, SermonResponse
from services.database import SermonCacheService
from services.gemini import GeminiOverloadedError, GeminiService, GeminiServiceError
from services.youtube import YouTubeService


class SermonService:
    CACHE_DELAY_MIN = 10
    CACHE_DELAY_MAX = 15

    @staticmethod
    async def create_sermon_response(request: SermonRequest) -> SermonResponse:
        try:
            video_id = YouTubeService.extract_video_id(request.url)
        except ValueError as exc:
            raise ApiError(
                status_code=400,
                code="INVALID_YOUTUBE_URL",
                message="유효한 유튜브 영상 링크를 입력해주세요.",
            ) from exc

        original_url = YouTubeService.build_canonical_url(video_id)
        cached = await SermonCacheService.get_cached_sermon(video_id)
        if cached:
            delay = random.uniform(
                SermonService.CACHE_DELAY_MIN, SermonService.CACHE_DELAY_MAX
            )
            await asyncio.sleep(delay)
            return SermonResponse(
                video_id=cached["video_id"],
                summary=cached["summary"],
                original_url=cached.get("original_url"),
                created_at=cached["created_at"],
                is_non_sermon=cached.get("is_non_sermon", False),
            )

        transcript_text, video_metadata = await asyncio.gather(
            YouTubeService.get_transcript_text(
                video_id, request.languages, request.preserve_formatting
            ),
            YouTubeService.get_video_metadata(video_id),
        )

        try:
            result = await GeminiService.summarize_transcript(
                transcript_text, video_metadata
            )
        except GeminiOverloadedError as exc:
            raise ApiError(
                status_code=503,
                code="SUMMARY_TEMPORARILY_UNAVAILABLE",
                message="요약을 생성하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            ) from exc
        except GeminiServiceError as exc:
            raise ApiError(
                status_code=503,
                code="SUMMARY_GENERATION_FAILED",
                message="요약을 생성하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            ) from exc

        created_at = await SermonCacheService.save_sermon(
            video_id,
            result.summary,
            original_url,
            result.is_non_sermon,
        )

        return SermonResponse(
            video_id=video_id,
            summary=result.summary,
            original_url=original_url,
            created_at=created_at or datetime.now(UTC),
            is_non_sermon=result.is_non_sermon,
        )
