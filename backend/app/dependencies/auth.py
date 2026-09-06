"""
FastAPI dependency for authenticating incoming requests (Phase 1 — HS256 JWT).

Phase 2: swap validate_token import to the Entra ID validator in
app.core.security — no changes needed anywhere else in the codebase.

Usage:
    @router.get("/resource")
    async def endpoint(user: CurrentUser = Depends(get_current_user)):
        ...
"""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import UnauthorizedException
from app.core.jwt_service import decode_access_token
from app.schemas.auth import CurrentUser

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    """Extract and validate Bearer token; return typed CurrentUser."""
    if credentials is None:
        raise UnauthorizedException("Authorization token is required")
    payload = decode_access_token(credentials.credentials)
    return CurrentUser(
        user_id=payload.get("sub", ""),
        username=payload.get("username", ""),
        name=payload.get("name", ""),
        email=payload.get("email", ""),
        department=payload.get("department", ""),
        function=payload.get("function", ""),
        location=payload.get("location", ""),
        manager=payload.get("manager", ""),
        role=payload.get("role", ""),
    )
