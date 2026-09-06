"""
CORS configuration helper.

CORSMiddleware is registered in main.py; this module exposes
the kwargs dict so the config stays in one place.
"""

from app.core.config import settings


def cors_kwargs() -> dict:
    return {
        "allow_origins": settings.cors_origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
