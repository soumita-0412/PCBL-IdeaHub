"""
Structured JSON request/response logging middleware.

Logs method, path, status code, and duration for every request.
Sensitive paths (auth/login) have their bodies redacted.
"""

import time

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = structlog.get_logger(__name__)

_REDACTED_PATHS = {"/api/v1/auth/login"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: object) -> Response:  # type: ignore[override]
        start = time.monotonic()
        response: Response = await call_next(request)  # type: ignore[arg-type]
        duration_ms = round((time.monotonic() - start) * 1000, 2)

        logger.info(
            "http.request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            client=request.client.host if request.client else None,
        )
        return response
