"""
Authentication endpoints.

POST /api/v1/auth/login   — issue JWT from credentials
POST /api/v1/auth/logout  — stateless; client discards token
GET  /api/v1/auth/me      — return current user from token
"""

from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.core.user_store import user_store
from app.core.jwt_service import create_access_token
from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser, LoginRequest, TokenResponse
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    """
    Validate credentials against the user store and issue a JWT.

    Always returns 401 on failure — never distinguishes between
    unknown username and wrong password to prevent user enumeration.
    """
    safe_user = user_store.verify_password(body.username, body.password)
    if safe_user is None:
        raise UnauthorizedException("Invalid credentials")

    token_data = {
        "sub": safe_user["user_id"],
        "username": safe_user["username"],
        "name": safe_user["name"],
        "email": safe_user["email"],
        "role": safe_user["role"],
        "department": safe_user["department"],
        "function": safe_user["function"],
        "location": safe_user["location"],
        "manager": safe_user.get("manager", ""),
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=CurrentUser(**safe_user),
    )


@router.post("/logout", response_model=SuccessResponse[str])
async def logout() -> SuccessResponse[str]:
    """Stateless logout — token is discarded by the client."""
    return SuccessResponse(data="Logged out successfully")


@router.get("/me", response_model=CurrentUser)
async def get_me(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Return the profile of the currently authenticated user."""
    return current_user
