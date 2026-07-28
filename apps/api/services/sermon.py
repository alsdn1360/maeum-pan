import asyncio
import random
from datetime import UTC, datetime

from ..core.errors import ApiError
from ..schemas.sermon import SermonRequest, SermonResponse
from .database import SermonCacheService
from .gemini import GeminiOverloadedError, GeminiService, GeminiServiceError
from .youtube import YouTubeService

# 동일 영상에 대한 동시 요청을 하나의 생성 작업으로 합류시킨다 (프로세스 내 한정).
_inflight_tasks: dict[str, asyncio.Task] = {}


class SermonService:
    CACHE_DELAY_MIN = 10
    CACHE_DELAY_MAX = 15
    METADATA_GRACE_SECONDS = 3

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

        cached = await SermonCacheService.get_cached_sermon(video_id)
        if cached:
            delay = random.uniform(
                SermonService.CACHE_DELAY_MIN, SermonService.CACHE_DELAY_MAX
            )
            await asyncio.sleep(delay)
            return SermonResponse.from_cache(cached)

        task = _inflight_tasks.get(video_id)
        if task is None:
            task = asyncio.create_task(
                SermonService._generate_sermon_response(video_id, request)
            )
            _inflight_tasks[video_id] = task
            task.add_done_callback(lambda _: _inflight_tasks.pop(video_id, None))

        # shield: 한 클라이언트가 연결을 끊어도 다른 대기자를 위해 생성은 계속한다.
        return await asyncio.shield(task)

    @staticmethod
    async def _generate_sermon_response(
        video_id: str, request: SermonRequest
    ) -> SermonResponse:
        original_url = YouTubeService.build_canonical_url(video_id)
        metadata_task = asyncio.create_task(YouTubeService.get_video_metadata(video_id))
        try:
            transcript_text = await YouTubeService.get_transcript_text(
                video_id, request.languages, request.preserve_formatting
            )

            # 메타데이터는 설교 판별 신호로 쓰이므로 짧게라도 기다려
            # 요청마다 프롬프트 입력이 달라지지 않게 한다.
            try:
                video_metadata = await asyncio.wait_for(
                    asyncio.shield(metadata_task),
                    timeout=SermonService.METADATA_GRACE_SECONDS,
                )
            except Exception:
                video_metadata = None

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
        finally:
            if not metadata_task.done():
                metadata_task.cancel()

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
