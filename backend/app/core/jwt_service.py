"""
HS256 JWT service for credential-based authentication (Phase 1).
Also provides a helper to extract claims from a Microsoft ID token
received via the backend OAuth callback (the token came directly
from Azure's token endpoint over TLS, so signature re-verification
is not required here).
"""

import base64
import json
from datetime import UTC, datetime, timedelta
from typing import Any

import structlog
from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import UnauthorizedException

logger = structlog.get_logger(__name__)


def create_access_token(
    data: dict[str, Any],
    expires_minutes: int | None = None,
) -> str:
    """Sign a JWT with HS256.  `data` is merged with standard claims."""
    expire_minutes = expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.now(UTC) + timedelta(minutes=expire_minutes)
    payload = {**data, "exp": expire, "iat": datetime.now(UTC)}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT.

    Raises UnauthorizedException on any validation failure so callers
    never see raw jose errors.
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as exc:
        logger.warning("jwt.invalid", error=str(exc))
        raise UnauthorizedException("Invalid or expired token") from exc


def decode_microsoft_id_token(id_token: str) -> dict[str, Any]:
    """
    Extract claims from a Microsoft ID token that was obtained via the
    backend Authorization Code exchange (server-to-Azure over TLS).

    Signature verification is skipped because:
    - The token came directly from Azure's /token endpoint, not from the browser.
    - We are the only party that received it.
    Raises UnauthorizedException if the token is malformed.
    """
    parts = id_token.split(".")
    if len(parts) < 2:
        raise UnauthorizedException("Malformed Microsoft ID token")
    try:
        # Base64url → standard base64 with padding
        segment = parts[1].replace("-", "+").replace("_", "/")
        segment += "=" * (4 - len(segment) % 4)
        claims: dict[str, Any] = json.loads(base64.b64decode(segment))
        return claims
    except Exception as exc:
        logger.warning("sso.id_token_decode_failed", error=str(exc))
        raise UnauthorizedException("Could not decode Microsoft ID token") from exc
