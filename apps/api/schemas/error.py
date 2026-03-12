from typing import Any

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ApiErrorBody(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] | None = None


class ApiErrorResponse(BaseModel):
    error: ApiErrorBody

    @classmethod
    def create(
        cls,
        *,
        code: str,
        message: str,
        details: list[ErrorDetail] | None = None,
    ) -> "ApiErrorResponse":
        return cls(error=ApiErrorBody(code=code, message=message, details=details))


def normalize_error_details(details: Any) -> list[ErrorDetail] | None:
    if not details:
        return None

    normalized: list[ErrorDetail] = []

    if isinstance(details, list):
        for item in details:
            if isinstance(item, ErrorDetail):
                normalized.append(item)
                continue

            if isinstance(item, dict):
                field = item.get("field")
                message = item.get("message") or item.get("msg")
                loc = item.get("loc")
                if not field and isinstance(loc, (list, tuple)):
                    filtered_loc = [str(part) for part in loc if part != "body"]
                    field = ".".join(filtered_loc) if filtered_loc else None

                if message:
                    normalized.append(ErrorDetail(field=field, message=str(message)))

    return normalized or None
