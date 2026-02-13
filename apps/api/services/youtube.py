import asyncio
import logging
import os
import re

from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)
from youtube_transcript_api.proxies import WebshareProxyConfig

logger = logging.getLogger(__name__)

TRANSCRIPT_TIMEOUT_SECONDS = 60
TRANSCRIPT_MAX_RETRIES = 3
TRANSCRIPT_RETRY_BASE_DELAY_SECONDS = 0.5


class YouTubeService:
    @staticmethod
    def extract_video_id(url_or_id: str) -> str:
        """
        YouTube URL 또는 비디오 ID에서 비디오 ID를 추출합니다.
        """
        # 이미 비디오 ID 형식인 경우 (11자리 영숫자)
        if re.match(r"^[a-zA-Z0-9_-]{11}$", url_or_id):
            return url_or_id

        # youtube.com/watch?v= 형식
        match = re.search(
            r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})",
            url_or_id,
        )
        if match:
            return match.group(1)

        raise ValueError(f"유효하지 않은 YouTube URL 또는 비디오 ID입니다: {url_or_id}")

    @staticmethod
    def build_canonical_url(video_id: str) -> str:
        return f"https://www.youtube.com/watch?v={video_id}"

    @staticmethod
    def fetch_transcript_sync(
        video_id: str, languages: list[str], preserve_formatting: bool
    ) -> str:
        proxy_username = os.getenv("WEBSHARE_PROXY_USERNAME")
        proxy_password = os.getenv("WEBSHARE_PROXY_PASSWORD")
        proxy_config = None
        if proxy_username and proxy_password:
            proxy_config = WebshareProxyConfig(
                proxy_username=proxy_username,
                proxy_password=proxy_password,
            )

        try:
            ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
            transcript = ytt_api.fetch(
                video_id,
                languages=languages,
                preserve_formatting=preserve_formatting,
            )
            return " ".join(segment.text for segment in transcript)

        except TranscriptsDisabled:
            raise HTTPException(
                status_code=403,
                detail="이 영상은 자막이 비활성화되어 있습니다",
            )
        except NoTranscriptFound:
            raise HTTPException(
                status_code=404,
                detail=f"요청한 언어({', '.join(languages)})의 자막을 찾을 수 없습니다",
            )
        except VideoUnavailable:
            raise HTTPException(
                status_code=404,
                detail="영상을 찾을 수 없거나 비공개 상태입니다",
            )
        except HTTPException:
            raise
        except Exception:
            logger.exception("자막 조회 실패 (video_id=%s)", video_id)
            raise HTTPException(
                status_code=500,
                detail="자막을 가져오는 중 오류가 발생했습니다",
            )

    @classmethod
    async def get_transcript_text(
        cls, video_id: str, languages: list[str], preserve_formatting: bool
    ) -> str:
        """
        자막을 가져와서 텍스트로 변환합니다 (비동기).
        """
        for attempt in range(1, TRANSCRIPT_MAX_RETRIES + 1):
            try:
                return await asyncio.wait_for(
                    run_in_threadpool(
                        cls.fetch_transcript_sync,
                        video_id,
                        languages,
                        preserve_formatting,
                    ),
                    timeout=TRANSCRIPT_TIMEOUT_SECONDS,
                )
            except TimeoutError as exc:
                if attempt == TRANSCRIPT_MAX_RETRIES:
                    raise HTTPException(
                        status_code=504,
                        detail="자막 조회 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
                    ) from exc
                logger.warning("자막 조회 시간 초과, 재시도 (%s/%s)", attempt, TRANSCRIPT_MAX_RETRIES)
            except HTTPException as exc:
                retryable = exc.status_code >= 500
                if not retryable or attempt == TRANSCRIPT_MAX_RETRIES:
                    raise
                logger.warning(
                    "자막 조회 실패(%s), 재시도 (%s/%s)",
                    exc.status_code,
                    attempt,
                    TRANSCRIPT_MAX_RETRIES,
                )

            backoff = TRANSCRIPT_RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1))
            await asyncio.sleep(backoff)

        raise HTTPException(
            status_code=500,
            detail="자막을 가져오는 중 오류가 발생했습니다",
        )
