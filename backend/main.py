"""
YouTube 자막 추출 API
FastAPI, youtube-transcript-api, Gemini API를 사용하여
YouTube 영상의 자막을 추출하고 요약합니다.
"""

import logging
import os
import re
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

load_dotenv()

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="YouTube Transcript API",
    description="YouTube 영상의 자막을 추출하는 API",
    version="1.0.0",
)

# CORS 설정 (프론트엔드에서 접근 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_video_id(url_or_id: str) -> str:
    """
    YouTube URL 또는 비디오 ID에서 비디오 ID를 추출합니다.
    
    지원하는 URL 형식:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - VIDEO_ID (직접 입력)
    """
    # 이미 비디오 ID 형식인 경우 (11자리 영숫자)
    if re.match(r"^[a-zA-Z0-9_-]{11}$", url_or_id):
        return url_or_id
    
    # youtube.com/watch?v= 형식
    match = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})", url_or_id)
    if match:
        return match.group(1)
    
    raise ValueError(f"유효하지 않은 YouTube URL 또는 비디오 ID입니다: {url_or_id}")


def get_video_upload_date(video_id: str) -> str:
    """
    YouTube 영상의 업로드일(설교일)을 YYYY-MM-DD 형식으로 반환합니다.
    yt-dlp로 메타데이터만 추출합니다.
    """
    try:
        import yt_dlp

        ydl_opts = {"quiet": True, "no_warnings": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}",
                download=False,
            )
            upload_date = info.get("upload_date")  # YYYYMMDD
            if upload_date and len(upload_date) >= 8:
                return f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}"
    except Exception as e:
        logger.warning("영상 업로드일 조회 실패 (video_id=%s): %s", video_id, e)
    return ""


def summarize_transcript(transcript_text: str) -> str:
    """
    Gemini API를 사용해 자막 텍스트를 요약합니다.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY가 설정되지 않아 요약을 건너뜁니다.")
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
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt + text_to_summarize)

        text = getattr(response, "text", None)
        if text and text.strip():
            return text.strip()

        # 응답에 텍스트가 없을 때 (안전 필터 등)
        try:
            candidates = getattr(response, "candidates", []) or []
            if candidates and candidates[0].content.parts:
                part = candidates[0].content.parts[0]
                if getattr(part, "text", None):
                    return part.text.strip()
        except (IndexError, AttributeError):
            pass
        logger.warning(
            "Gemini 응답에 텍스트가 없습니다. prompt_feedback=%s",
            getattr(response, "prompt_feedback", None),
        )
        return ""
    except Exception as e:
        logger.exception("Gemini 요약 실패: %s", e)
        return ""


class TranscriptRequest(BaseModel):
    """자막 요청 스키마"""
    url: str
    languages: list[str] = ["ko", "en"]  # 기본값: 한국어 우선, 영어 대체
    preserve_formatting: bool = False
    
    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("URL은 필수입니다")
        return v.strip()


class TranscriptResponse(BaseModel):
    """자막 요약 응답 스키마 (camelCase)"""
    model_config = ConfigDict(serialize_by_alias=True)
    video_id: str = Field(..., serialization_alias="videoId")
    summary: str
    sermon_date: str = Field(..., serialization_alias="sermonDate")  # YYYY-MM-DD


@app.get("/")
async def root():
    """API 상태 확인"""
    return {"status": "ok", "message": "YouTube Transcript API가 실행 중입니다"}


@app.post("/transcript", response_model=TranscriptResponse)
async def get_transcript(request: TranscriptRequest):
    """
    YouTube 영상의 자막을 추출합니다.
    
    - **url**: YouTube 영상 URL 또는 비디오 ID
    - **languages**: 선호하는 언어 코드 목록 (우선순위 순, 기본값: ["ko", "en"])
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    try:
        # 비디오 ID 추출
        video_id = extract_video_id(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        # YouTubeTranscriptApi 인스턴스 생성 및 자막 가져오기
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(
            video_id,
            languages=request.languages,
            preserve_formatting=request.preserve_formatting,
        )
        
        # 전체 텍스트 생성 (요약용)
        full_text = " ".join(segment.text for segment in transcript)

        # Gemini로 요약 (API 키가 있을 때만)
        summary = summarize_transcript(full_text)

        # 영상 업로드일(설교일) 조회
        sermon_date = get_video_upload_date(video_id)

        return TranscriptResponse(video_id=video_id, summary=summary, sermon_date=sermon_date)
        
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=403,
            detail="이 영상은 자막이 비활성화되어 있습니다",
        )
    except NoTranscriptFound:
        raise HTTPException(
            status_code=404,
            detail=f"요청한 언어({', '.join(request.languages)})의 자막을 찾을 수 없습니다",
        )
    except VideoUnavailable:
        raise HTTPException(
            status_code=404,
            detail="영상을 찾을 수 없거나 비공개 상태입니다",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"자막을 가져오는 중 오류가 발생했습니다: {str(e)}",
        )


@app.get("/transcript/{video_id}")
async def get_transcript_by_id(
    video_id: str,
    languages: Optional[str] = "ko,en",
    preserve_formatting: bool = False,
):
    """
    GET 방식으로 YouTube 영상의 자막을 추출합니다.
    
    - **video_id**: YouTube 비디오 ID (11자리)
    - **languages**: 선호하는 언어 코드 (쉼표로 구분, 기본값: "ko,en")
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    language_list = [lang.strip() for lang in languages.split(",")]
    
    request = TranscriptRequest(
        url=video_id,
        languages=language_list,
        preserve_formatting=preserve_formatting,
    )
    
    return await get_transcript(request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
