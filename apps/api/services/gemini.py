import logging

from google import genai
from google.genai.errors import ServerError
from starlette.concurrency import run_in_threadpool

from constants.prompts import SERMON_SUMMARY_SYSTEM_INSTRUCTION
from core.config import get_settings

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


class SummarizeResult:
    def __init__(self, summary: str, is_non_sermon: bool = False):
        self.summary = summary
        self.is_non_sermon = is_non_sermon


class GeminiService:
    @staticmethod
    async def summarize_transcript(transcript_text: str) -> SummarizeResult:
        if not client:
            logger.error("Gemini Client가 설정되지 않았습니다.")
            raise GeminiServiceError("Gemini Client 미설정")

        if not transcript_text or not transcript_text.strip():
            raise GeminiServiceError("요약할 자막이 비어 있습니다")

        max_chars = 100_000
        text_to_summarize = transcript_text[:max_chars]
        if len(transcript_text) > max_chars:
            text_to_summarize += "\n\n[... 이하 생략 ...]"

        try:
            response = await run_in_threadpool(
                client.models.generate_content,
                model="gemini-flash-latest",
                contents=text_to_summarize,
                config=genai.types.GenerateContentConfig(
                    system_instruction=SERMON_SUMMARY_SYSTEM_INSTRUCTION,
                    temperature=0.1,
                ),
            )

            if response and response.text:
                result_text = response.text.strip()
                if not result_text:
                    logger.warning(
                        "Gemini 응답 텍스트가 비어 있습니다. Response: %s", response
                    )
                    raise GeminiServiceError("Gemini 응답 텍스트 없음")

                if NON_SERMON_MARKER in result_text:
                    logger.info("비설교 콘텐츠 감지됐습니다.")
                    return SummarizeResult("", is_non_sermon=True)

                return SummarizeResult(result_text)

            logger.warning("Gemini 응답에 텍스트가 없습니다. Response: %s", response)
            raise GeminiServiceError("Gemini 응답 텍스트 없음")

        except ServerError as e:
            if e.code == 503:
                logger.error("Gemini 서버 과부하: %s", e)
                raise GeminiOverloadedError("Gemini 과부하 상태")
            logger.exception("Gemini 서버 오류: %s", e)
            raise GeminiServiceError("Gemini 서버 오류")
        except Exception as e:
            logger.exception("Gemini 요약 실패: %s", e)
            raise GeminiServiceError("Gemini 요약 실패")
