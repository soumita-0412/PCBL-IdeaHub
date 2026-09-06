"""
Simple per-IP sliding-window rate limiter middleware.

Auth endpoints: 100 req/min
All other endpoints: 300 req/min

Uses an in-process dict so limits reset on restart.
Replace with Redis-backed implementation for multi-worker deployments.
"""

import time
from collections import defaultdict
from threading import Lock

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        auth_limit: int = 100,
        default_limit: int = 300,
        window_seconds: float = 60.0,
    ) -> None:
        super().__init__(app)
        self._auth_limit = auth_limit
        self._default_limit = default_limit
        self._window = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    async def dispatch(self, request: Request, call_next: object) -> Response:  # type: ignore[override]
        client_ip = request.client.host if request.client else "unknown"
        is_auth_path = request.url.path.startswith("/api/v1/auth")
        limit = self._auth_limit if is_auth_path else self._default_limit

        now = time.monotonic()
        with self._lock:
            timestamps = self._requests[client_ip]
            # Evict timestamps outside the window
            cutoff = now - self._window
            self._requests[client_ip] = [t for t in timestamps if t > cutoff]

            if len(self._requests[client_ip]) >= limit:
                return Response(
                    content='{"success":false,"error":{"code":"RATE_LIMITED","message":"Too many requests"}}',
                    status_code=429,
                    media_type="application/json",
                )
            self._requests[client_ip].append(now)

        return await call_next(request)  # type: ignore[arg-type]
