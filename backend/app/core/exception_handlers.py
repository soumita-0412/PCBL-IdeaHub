"""
Global exception handlers that convert domain exceptions to the
standard error envelope:

  {
    "success": false,
    "error": { "code": "...", "message": "...", "details": null },
    "timestamp": "..."
  }
"""

from datetime import UTC, datetime
from http import HTTPStatus
from typing import Any

import structlog
from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    AppException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)

logger = structlog.get_logger(__name__)

_STATUS_TO_CODE: dict[int, str] = {
    HTTPStatus.UNAUTHORIZED: "UNAUTHORIZED",
    HTTPStatus.FORBIDDEN: "FORBIDDEN",
    HTTPStatus.NOT_FOUND: "NOT_FOUND",
    HTTPStatus.CONFLICT: "CONFLICT",
    HTTPStatus.UNPROCESSABLE_ENTITY: "VALIDATION_ERROR",
    HTTPStatus.SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    HTTPStatus.INTERNAL_SERVER_ERROR: "INTERNAL_ERROR",
}


def _error_body(code: str, message: str, details: Any = None) -> dict:
    return {
        "success": False,
        "error": {"code": code, "message": message, "details": details},
        "timestamp": datetime.now(UTC).isoformat(),
    }


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    code = _STATUS_TO_CODE.get(exc.status_code, "APPLICATION_ERROR")
    details: Any = None

    if isinstance(exc, ValidationException) and exc.field_errors:
        details = exc.field_errors

    logger.warning(
        "exception.handled",
        code=code,
        status_code=exc.status_code,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(code, exc.message, details),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("exception.unhandled", path=request.url.path)
    return JSONResponse(
        status_code=500,
        content=_error_body("INTERNAL_ERROR", "An internal server error occurred."),
    )
