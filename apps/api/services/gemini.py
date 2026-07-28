import asyncio
import logging

from google import genai
from google.genai.errors import ClientError, ServerError

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

GEMINI_MODEL = "gemini-3.5-flash-lite"
GEMINI_TIMEOUT_SECONDS = 120
GEMINI_MAX_RETRIES = 3
GEMINI_RETRY_BASE_DELAY_SECONDS = 1.0
GEMINI_MAX_TRANSCRIPT_CHARS = 100_000
GEMINI_MAX_DESCRIPTION_CHARS = 4_000

# flash-lite의 thinking_level 기본값은 minimal이라 분류/추출용에 맞춰져 있다.
# 이 프롬프트는 설교 판별 + 성경 고유명사 교차 검증 + 대지 추출을 한 번에 요구하므로
# 한 단계 올린다. temperature/top_p는 Gemini 3 계열 권장대로 기본값을 그대로 둔다
# (1.0 미만으로 낮추면 루핑이나 성능 저하가 발생할 수 있다).
GEMINI_GENERATE_CONFIG = genai.types.GenerateContentConfig(
    system_instruction=SERMON_SUMMARY_SYSTEM_INSTRUCTION,
    thinking_config=genai.types.ThinkingConfig(
        thinking_level=genai.types.ThinkingLevel.LOW,
    ),
)


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

        # 마커가 코드펜스나 백틱, 짧은 부연과 함께 와도 비설교로 인식한다.
        # 정상 요약(제목/본문/대지 포함)에 마커 단독 라인이 섞일 가능성은 사실상 없다.
        normalized_lines = [
            line.strip().strip("`") for line in result_text.splitlines() if line.strip()
        ]
        if any(line == NON_SERMON_MARKER for line in normalized_lines):
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
                    client.aio.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=text_to_summarize,
                        config=GEMINI_GENERATE_CONFIG,
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
            except ClientError as exc:
                if exc.code == 429:
                    if attempt == GEMINI_MAX_RETRIES:
                        logger.error("Gemini 요청 한도 초과: %s", exc)
                        raise GeminiOverloadedError("Gemini 요청 한도 초과") from exc
                    logger.warning(
                        "Gemini 요청 한도 초과, 재시도 (%s/%s)",
                        attempt,
                        GEMINI_MAX_RETRIES,
                    )
                else:
                    logger.exception("Gemini 요청 오류: %s", exc)
                    raise GeminiServiceError("Gemini 요청 오류") from exc
            except GeminiServiceError:
                raise
            except Exception as exc:
                logger.exception("Gemini 요약 실패: %s", exc)
                raise GeminiServiceError("Gemini 요약 실패") from exc

            backoff = GEMINI_RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1))
            await asyncio.sleep(backoff)

        raise GeminiServiceError("Gemini 요약 실패")
