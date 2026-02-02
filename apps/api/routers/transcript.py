from fastapi import APIRouter, HTTPException

from schemas.transcript import TranscriptRequest, TranscriptResponse
from services.gemini import GeminiService
from services.youtube import YouTubeService

router = APIRouter()


@router.post("/transcript", response_model=TranscriptResponse)
async def get_transcript(request: TranscriptRequest):
    """
    YouTube 영상의 자막을 추출합니다.

    - **url**: YouTube 영상 URL 또는 비디오 ID
    - **languages**: 선호하는 언어 코드 목록 (우선순위 순, 기본값: ["ko", "en"])
    - **preserve_formatting**: HTML 포맷 유지 여부 (기본값: false)
    """
    try:
        # 비디오 ID 추출
        video_id = YouTubeService.extract_video_id(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 자막 텍스트 가져오기 (비동기)
    transcript_text = await YouTubeService.get_transcript_text(
        video_id, request.languages, request.preserve_formatting
    )

    # Gemini로 요약 (비동기)
    summary = await GeminiService.summarize_transcript(transcript_text)

    # 영상 업로드일(설교일) 조회 (비동기)
    sermon_date = await YouTubeService.get_video_upload_date(video_id)

    return TranscriptResponse(
        video_id=video_id, summary=summary, sermon_date=sermon_date
    )


@router.get("/transcript/{video_id}")
async def get_transcript_by_id(
    video_id: str,
    languages: str | None = "ko,en",
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
