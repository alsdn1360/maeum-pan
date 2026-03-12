import logging
from typing import Any

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from schemas.error import ApiErrorResponse, normalize_error_details

logger = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: Any = None,
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = normalize_error_details(details)
        super().__init__(message)


def create_error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    details: Any = None,
) -> JSONResponse:
    payload = ApiErrorResponse.create(
        code=code,
        message=message,
        details=normalize_error_details(details),
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump())


async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
    return create_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
    )


async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    message = (
        exc.detail if isinstance(exc.detail, str) else "요청을 처리하지 못했습니다."
    )

    return create_error_response(
        status_code=exc.status_code,
        code="HTTP_ERROR",
        message=message,
        details=None if isinstance(exc.detail, str) else exc.detail,
    )


async def validation_exception_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    return create_error_response(
        status_code=422,
        code="INVALID_REQUEST",
        message="요청값이 올바르지 않습니다.",
        details=exc.errors(),
    )


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("처리되지 않은 서버 오류", exc_info=exc)
    return create_error_response(
        status_code=500,
        code="INTERNAL_SERVER_ERROR",
        message="서버에서 요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    )
