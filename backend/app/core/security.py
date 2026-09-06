"""
JWT token validation for Microsoft Entra ID (Azure AD).

Validates Bearer tokens issued by Azure AD using the tenant's
JWKS endpoint.  Token claims are returned as a typed Pydantic
model so the rest of the app never handles raw dicts.
"""

from typing import Any

import httpx
import structlog
from jose import JWTError, jwk, jwt
from jose.utils import base64url_decode
from pydantic import BaseModel

from app.core.config import settings

logger = structlog.get_logger(__name__)

_jwks_cache: dict[str, Any] = {}


class TokenClaims(BaseModel):
    """Validated claims extracted from a verified Azure AD access token."""

    oid: str
    upn: str | None = None
    email: str | None = None
    name: str | None = None
    roles: list[str] = []
    scp: str | None = None
    tid: str
    aud: str | list[str]

    @property
    def user_id(self) -> str:
        return self.oid

    @property
    def display_email(self) -> str:
        return self.upn or self.email or self.oid


async def _fetch_jwks() -> dict[str, Any]:
    """Fetch and cache the Azure AD JWKS signing keys."""
    if _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(settings.jwks_uri)
        response.raise_for_status()
        keys = response.json()
        _jwks_cache.update(keys)
        logger.info("security.jwks_fetched", key_count=len(keys.get("keys", [])))
        return _jwks_cache


async def validate_token(token: str) -> TokenClaims:
    """
    Validate a Bearer token against Azure AD JWKS.

    Raises ValueError with a safe message on any validation failure.
    """
    try:
        jwks = await _fetch_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        rsa_key: dict[str, Any] = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                rsa_key = key
                break

        if not rsa_key:
            raise ValueError("Signing key not found in JWKS")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            options={"leeway": settings.JWT_LEEWAY},
        )
        return TokenClaims(**payload)

    except JWTError as exc:
        logger.warning("security.token_invalid", error=str(exc))
        raise ValueError("Invalid or expired token") from exc
