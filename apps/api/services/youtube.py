import logging
import os
import re

import yt_dlp
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
    def get_video_upload_date_sync(video_id: str) -> str:
        """
        YouTube 영상의 업로드일(설교일)을 YYYY-MM-DD 형식으로 반환합니다.
        (동기 실행)
        """
        try:
            ydl_opts = {"quiet": True, "no_warnings": True}

            proxy_url = os.getenv("YOUTUBE_PROXY_URL")
            if proxy_url:
                ydl_opts["proxy"] = proxy_url

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(
                    f"https://www.youtube.com/watch?v={video_id}",
                    download=False,
                )
                upload_date = info.get("upload_date")
                if upload_date and len(upload_date) >= 8:
                    return f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}"
        except Exception as e:
            logger.warning("영상 업로드일 조회 실패 (video_id=%s): %s", video_id, e)
        return ""

    @classmethod
    async def get_video_upload_date(cls, video_id: str) -> str:
        """
        YouTube 영상의 업로드일을 비동기로 수행합니다.
        """
        return await run_in_threadpool(cls.get_video_upload_date_sync, video_id)

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
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"자막을 가져오는 중 오류가 발생했습니다: {str(e)}",
            )

    @classmethod
    async def get_transcript_text(
        cls, video_id: str, languages: list[str], preserve_formatting: bool
    ) -> str:
        """
        자막을 가져와서 텍스트로 변환합니다 (비동기).
        """
        return await run_in_threadpool(
            cls.fetch_transcript_sync, video_id, languages, preserve_formatting
        )
