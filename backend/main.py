"""
Ideas Portal — FastAPI Application Entry Point.

This module creates and configures the FastAPI application instance.
Business routers are registered in app/api/v1/router.py and mounted here.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import close_db, get_database, init_db
from app.core.exception_handlers import app_exception_handler, unhandled_exception_handler
from app.core.exceptions import AppException
from app.core.logging import configure_logging
from app.core.user_store import user_store
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.timing import TimingMiddleware

logger = structlog.get_logger(__name__)

_USER_STORE_PATH = Path(__file__).parent / "data" / "users.pkl"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    configure_logging()

    # Load user store from pickle file (Phase 1 auth)
    try:
        user_store.load(_USER_STORE_PATH)
    except FileNotFoundError as exc:
        logger.error("startup.user_store_missing", error=str(exc))
        raise

    await init_db()
    logger.info("startup.complete", env=settings.APP_ENV, version=settings.APP_VERSION)
    yield
    await close_db()
    logger.info("shutdown.complete")


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""
    is_prod = settings.APP_ENV == "production"

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Enterprise Idea Submission & Management API",
        # Disable docs in production
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
        openapi_url=None if is_prod else "/openapi.json",
        lifespan=lifespan,
    )

    # ── Exception handlers ───────────────────────────────────
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # ── Middleware (outermost = last added) ──────────────────
    if is_prod:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware, auth_limit=100, default_limit=300)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(TimingMiddleware)

    # ── API routers ──────────────────────────────────────────
    app.include_router(api_router, prefix="/api/v1")

    # ── Health check ─────────────────────────────────────────
    @app.get("/api/v1/health", tags=["System"], include_in_schema=False)
    async def health() -> JSONResponse:
        db_ok = False
        try:
            await get_database().command("ping")
            db_ok = True
        except Exception:
            pass

        return JSONResponse(
            {
                "status": "ok" if db_ok else "degraded",
                "version": settings.APP_VERSION,
                "environment": settings.APP_ENV,
                "database": "connected" if db_ok else "unavailable",
            }
        )

    return app


app = create_app()
