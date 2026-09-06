"""
HS256 JWT service for credential-based authentication.

Replaces Azure AD RS256 validation during Phase 1 (pickle auth).
The abstraction layer means swapping to Entra ID in a later
phase only requires updating this module.
"""

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
