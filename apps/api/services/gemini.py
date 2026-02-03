import logging

from google import genai
from starlette.concurrency import run_in_threadpool

from constants.prompts import SERMON_SUMMARY_PROMPT
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

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
            logger.warning("Gemini Client가 설정되지 않아 요약을 건너뜁니다.")
            return SummarizeResult("")

        if not transcript_text or not transcript_text.strip():
            return SummarizeResult("")

        max_chars = 100_000
        text_to_summarize = transcript_text[:max_chars]
        if len(transcript_text) > max_chars:
            text_to_summarize += "\n\n[... 이하 생략 ...]"

        try:
            response = await run_in_threadpool(
                client.models.generate_content,
                model="gemini-flash-latest",
                contents=SERMON_SUMMARY_PROMPT + text_to_summarize,
                config=genai.types.GenerateContentConfig(
                    temperature=0.2,
                ),
            )

            if response and response.text:
                result_text = response.text.strip()

                if NON_SERMON_MARKER in result_text:
                    logger.info("비설교 콘텐츠 감지됐습니다.")
                    return SummarizeResult("", is_non_sermon=True)

                return SummarizeResult(result_text)

            logger.warning("Gemini 응답에 텍스트가 없습니다. Response: %s", response)
            return SummarizeResult("")

        except Exception as e:
            logger.exception("Gemini 요약 실패: %s", e)
            return SummarizeResult("")
