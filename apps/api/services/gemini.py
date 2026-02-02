import logging

from google import genai
from starlette.concurrency import run_in_threadpool

from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Client 초기화 (API 키가 있을 때만)
client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error("Gemini Client 초기화 실패: %s", e)


class GeminiService:
    @staticmethod
    async def summarize_transcript(transcript_text: str) -> str:
        """
        Gemini API를 사용해 자막 텍스트를 요약합니다.
        """
        if not client:
            logger.warning("Gemini Client가 설정되지 않아 요약을 건너뜁니다.")
            return ""

        if not transcript_text or not transcript_text.strip():
            return ""

        # 토큰 제한 고려해 자막 길이 제한 (약 100k 문자)
        max_chars = 100_000
        text_to_summarize = transcript_text[:max_chars]
        if len(transcript_text) > max_chars:
            text_to_summarize += "\n\n[... 이하 생략 ...]"

        prompt = """
# Role
당신은 설교학적 통찰력과 탁월한 텍스트 분석 능력을 갖춘 '전문 목회 비서'입니다.
제공된 설교 스크립트(구어체, STT 변환본)를 분석하여, 성도들이 주보나 모바일로 묵상하기 좋은 '구조화된 요약본'을 작성하는 것이 당신의 임무입니다.

# Task
1. **Input Processing:** 입력된 스크립트의 STT 오류(동음이의어, 오타)를 문맥에 맞게 내부적으로 보정하여 해석하십시오.
2. **Analysis:** 설교 전체를 관통하는 핵심 주제(One Message)와 논리적 흐름(대지)을 추출하십시오.
3. **Refinement:** 구어체의 비문, 반복, 감탄사, 불필요한 추임새를 제거하고, 문법적으로 완벽한 '정중한 문어체(하십시오체 위주)'로 재구성하십시오.
4. **Safety:** 화자의 신학적 의도를 왜곡하거나 당신의 외부 지식(성경 배경지식 등)을 섞지 마십시오. 오직 텍스트에 근거해서만 요약하십시오.

# Output Format (Markdown)
## (설교 제목)

> **본문 말씀:** 스크립트에 언급된 성경 본문 구절. (없을 경우 생략)

### 마음에 새길 한 문장
(설교자가 청중에게 전하고자 하는 가장 강력한 한 문장 주제)

### 내게 주시는 음성

**1. (첫 번째 대지 또는 논점 제목)**
(본문의 신학적 의미와 배경을 간략히 설명하고, 곧바로 이어 성도들이 삶에서 실천해야 할 적용점을 서술하십시오. '내용', '적용' 같은 단어 없이 하나의 자연스러운 글로 연결하십시오.)

**2. (두 번째 대지 또는 논점 제목)**
(위와 동일한 형식으로, 설명과 권면이 자연스럽게 이어지도록 작성)

**(설교의 논리 구조에 따라 번호를 매기되, 대지가 없는 내러티브 설교일 경우 흐름에 따라 문단을 나누어 작성)**

### 예화 및 묵상 포인트
**(예화 제목)**
(설교의 이해를 돕기 위해 사용된 핵심 예화나 비유. 없다면 이 섹션 전체 생략)

### 결단 기도
"(설교의 핵심 주제와 성도의 다짐을 담은, 은혜롭고 간결한 1~2문장의 기도문)"

# Constraints
1. **No Emojis:** 결과물에 이모지(🙏, ✝️ 등)를 절대 포함하지 마십시오. 깔끔한 텍스트로만 구성하십시오.
2. **Fact-Grounded:** 스크립트에 없는 내용을 '신학적 보완'을 위해 임의로 창작하지 마십시오.
3. **Conciseness:** 불필요한 수식어를 배제하고, 한 눈에 들어오도록 간결하게(Bullet point 활용) 작성하십시오.
4. **Tone:** 설교의 권위를 유지하되, 딱딱하지 않고 성도들을 포용하는 정중한 어조를 유지하십시오.
"""

        try:
            # 비동기 실행을 위해 threadpool 사용
            # google-genai SDK는 models.generate_content 메서드를 사용
            response = await run_in_threadpool(
                client.models.generate_content,
                model="gemini-flash-latest",
                contents=prompt + text_to_summarize,
            )

            if response and response.text:
                return response.text.strip()

            # 응답에 텍스트가 없을 때 (안전 필터 등)
            # 새로운 SDK의 응답 객체 구조에 따라 candidates 접근 방식이 다를 수 있음
            # 하지만 response.text가 None이면 보통 실패나 필터링임.
            # 상세한 안전 필터링 정보는 response.candidates[0].finish_reason 등을 확인해야 함

            logger.warning("Gemini 응답에 텍스트가 없습니다. Response: %s", response)
            return ""

        except Exception as e:
            logger.exception("Gemini 요약 실패: %s", e)
            return ""
