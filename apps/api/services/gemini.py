import asyncio
import logging

from google import genai
from google.genai.errors import ServerError
from starlette.concurrency import run_in_threadpool

from ..constants.prompts import SERMON_SUMMARY_SYSTEM_INSTRUCTION
from ..core.config import get_settings
from .youtube import YouTubeVideoMetadata

logger = logging.getLogger(__name__)
settings = get_settings()


class GeminiServiceError(Exception):
    """Gemini 처리 실패 시 발생하는 기본 예외"""

    pass


class GeminiOverloadedError(GeminiServiceError):
    """Gemini API가 과부하 상태일 때 발생하는 예외"""

    pass


client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error("Gemini Client 초기화 실패: %s", e)


NON_SERMON_MARKER = "TYPE: NON_SERMON"

GEMINI_MODEL = "gemini-3-flash-preview"
GEMINI_TIMEOUT_SECONDS = 120
GEMINI_MAX_RETRIES = 3
GEMINI_RETRY_BASE_DELAY_SECONDS = 1.0
GEMINI_MAX_TRANSCRIPT_CHARS = 100_000
GEMINI_MAX_DESCRIPTION_CHARS = 4_000


class SummarizeResult:
    def __init__(self, summary: str, is_non_sermon: bool = False):
        self.summary = summary
        self.is_non_sermon = is_non_sermon


class GeminiService:
    @staticmethod
    def _truncate_text(text: str, max_chars: int, truncated_suffix: str) -> str:
        normalized_text = text.strip()
        if len(normalized_text) <= max_chars:
            return normalized_text
        return normalized_text[:max_chars] + truncated_suffix

    @staticmethod
    def _build_summary_input(
        transcript_text: str, metadata: YouTubeVideoMetadata | None
    ) -> str:
        safe_metadata = metadata or YouTubeVideoMetadata()
        truncated_description = GeminiService._truncate_text(
            safe_metadata.description,
            GEMINI_MAX_DESCRIPTION_CHARS,
            "\n\n[... 이하 설명 생략 ...]",
        )
        truncated_transcript = GeminiService._truncate_text(
            transcript_text,
            GEMINI_MAX_TRANSCRIPT_CHARS,
            "\n\n[... 이하 생략 ...]",
        )

        return "\n".join(
            [
                "[YouTube Metadata]",
                f"YouTube Title: {safe_metadata.title or '(none)'}",
                "YouTube Description:",
                truncated_description or "(none)",
                "",
                "[Transcript]",
                truncated_transcript,
            ]
        )

    @staticmethod
    def _parse_response(response) -> SummarizeResult:
        if not response or not response.text:
            logger.warning("Gemini 응답에 텍스트가 없습니다. Response: %s", response)
            raise GeminiServiceError("Gemini 응답 텍스트 없음")

        result_text = response.text.strip()
        if not result_text:
            logger.warning("Gemini 응답 텍스트가 비어 있습니다. Response: %s", response)
            raise GeminiServiceError("Gemini 응답 텍스트 없음")

        normalized_lines = [
            line.strip() for line in result_text.splitlines() if line.strip()
        ]
        if len(normalized_lines) == 1 and normalized_lines[0] == NON_SERMON_MARKER:
            logger.info("비설교 콘텐츠가 감지되었습니다.")
            return SummarizeResult("", is_non_sermon=True)

        return SummarizeResult(result_text)

    @staticmethod
    async def summarize_transcript(
        transcript_text: str, metadata: YouTubeVideoMetadata | None = None
    ) -> SummarizeResult:
        if not client:
            logger.error("Gemini Client가 설정되지 않았습니다.")
            raise GeminiServiceError("Gemini Client 미설정")

        if not transcript_text or not transcript_text.strip():
            raise GeminiServiceError("요약할 자막이 없습니다")

        text_to_summarize = GeminiService._build_summary_input(
            transcript_text, metadata
        )

        for attempt in range(1, GEMINI_MAX_RETRIES + 1):
            try:
                response = await asyncio.wait_for(
                    run_in_threadpool(
                        client.models.generate_content,
                        model=GEMINI_MODEL,
                        contents=text_to_summarize,
                        config=genai.types.GenerateContentConfig(
                            system_instruction=SERMON_SUMMARY_SYSTEM_INSTRUCTION,
                            temperature=0.1,
                        ),
                    ),
                    timeout=GEMINI_TIMEOUT_SECONDS,
                )
                return GeminiService._parse_response(response)
            except TimeoutError as exc:
                if attempt == GEMINI_MAX_RETRIES:
                    logger.error("Gemini 응답 시간 초과 (%ss)", GEMINI_TIMEOUT_SECONDS)
                    raise GeminiServiceError("Gemini 응답 시간 초과") from exc
                logger.warning(
                    "Gemini 시간 초과, 재시도 (%s/%s)", attempt, GEMINI_MAX_RETRIES
                )
            except ServerError as exc:
                if exc.code == 503:
                    if attempt == GEMINI_MAX_RETRIES:
                        logger.error("Gemini 서버 과부하: %s", exc)
                        raise GeminiOverloadedError("Gemini 과부하 상태") from exc
                    logger.warning(
                        "Gemini 과부하, 재시도 (%s/%s)", attempt, GEMINI_MAX_RETRIES
                    )
                else:
                    logger.exception("Gemini 서버 오류: %s", exc)
                    raise GeminiServiceError("Gemini 서버 오류") from exc
            except GeminiServiceError:
                raise
            except Exception as exc:
                logger.exception("Gemini 요약 실패: %s", exc)
                raise GeminiServiceError("Gemini 요약 실패") from exc

            backoff = GEMINI_RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1))
            await asyncio.sleep(backoff)

        raise GeminiServiceError("Gemini 요약 실패")
