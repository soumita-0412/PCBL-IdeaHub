"""
Authentication endpoints.

POST /api/v1/auth/login              — issue JWT from credentials
POST /api/v1/auth/logout             — stateless; client discards token
GET  /api/v1/auth/me                 — return current user from token
GET  /api/v1/auth/sso/authorize      — kick off Microsoft OAuth dance
GET  /api/v1/auth/microsoft/callback — receive code, issue JWT, redirect to frontend
"""

import secrets
import urllib.parse

import httpx
import structlog
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.core.user_store import user_store
from app.core.jwt_service import create_access_token, decode_microsoft_id_token
from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser, LoginRequest, TokenResponse
from app.schemas.common import SuccessResponse

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

_AZURE_AUTHORIZE_URL = (
    "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"
)
_AZURE_TOKEN_URL = (
    "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
)


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


@router.get("/sso/authorize")
async def sso_authorize() -> RedirectResponse:
    """
    Start the Microsoft OAuth 2.0 Authorization Code flow.

    Generates a random state token (stored in a short-lived cookie for
    CSRF validation in the callback), then redirects the browser to the
    Azure AD authorization endpoint.
    """
    if not settings.AZURE_TENANT_ID or not settings.AZURE_CLIENT_ID:
        raise UnauthorizedException("Microsoft SSO is not configured on the server")

    state = secrets.token_urlsafe(32)

    params = urllib.parse.urlencode({
        "client_id": settings.AZURE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.AZURE_REDIRECT_URI,
        "response_mode": "query",
        "scope": "openid profile email",
        "state": state,
    })
    auth_url = _AZURE_AUTHORIZE_URL.format(tenant=settings.AZURE_TENANT_ID)

    response = RedirectResponse(url=f"{auth_url}?{params}", status_code=302)
    response.set_cookie(
        key="sso_state",
        value=state,
        max_age=300,       # 5-minute window to complete the login
        httponly=True,
        secure=False,      # Set True behind HTTPS in production
        samesite="lax",
    )
    return response


@router.get("/microsoft/callback")
async def microsoft_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    error_description: str | None = None,
) -> RedirectResponse:
    """
    Receive the authorization code from Azure AD.

    1. Validates the state cookie to prevent CSRF.
    2. Exchanges the code for tokens at Azure's token endpoint.
    3. Decodes the ID token to extract user identity.
    4. Issues a backend JWT with ROLE_SUPER_ADMIN (temporary — until
       per-user role mapping via Azure AD group claims is configured).
    5. Redirects the browser to the frontend callback page with the JWT.
    """
    frontend_error_url = f"{settings.FRONTEND_URL}/callback"

    # Azure returned an error (e.g. user cancelled)
    if error:
        desc = urllib.parse.quote(error_description or error)
        return RedirectResponse(
            url=f"{frontend_error_url}?error={desc}",
            status_code=302,
        )

    # Validate CSRF state
    stored_state = request.cookies.get("sso_state")
    if not stored_state or stored_state != state:
        logger.warning("sso.callback.invalid_state")
        return RedirectResponse(
            url=f"{frontend_error_url}?error=Invalid+OAuth+state.+Please+try+again.",
            status_code=302,
        )

    if not code:
        return RedirectResponse(
            url=f"{frontend_error_url}?error=No+authorization+code+received.",
            status_code=302,
        )

    # Exchange authorization code for tokens
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_resp = await client.post(
                _AZURE_TOKEN_URL.format(tenant=settings.AZURE_TENANT_ID),
                data={
                    "client_id": settings.AZURE_CLIENT_ID,
                    "client_secret": settings.AZURE_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.AZURE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
        token_resp.raise_for_status()
    except httpx.HTTPError as exc:
        logger.warning("sso.token_exchange_failed", error=str(exc))
        return RedirectResponse(
            url=f"{frontend_error_url}?error=Token+exchange+with+Microsoft+failed.",
            status_code=302,
        )

    token_json = token_resp.json()
    id_token: str = token_json.get("id_token", "")
    if not id_token:
        return RedirectResponse(
            url=f"{frontend_error_url}?error=No+ID+token+in+Microsoft+response.",
            status_code=302,
        )

    # Extract user identity from the ID token
    try:
        claims = decode_microsoft_id_token(id_token)
    except UnauthorizedException as exc:
        return RedirectResponse(
            url=f"{frontend_error_url}?error={urllib.parse.quote(str(exc))}",
            status_code=302,
        )

    email: str = (
        claims.get("email")
        or claims.get("upn")
        or claims.get("preferred_username")
        or ""
    )
    name: str = claims.get("name") or email
    user_id: str = claims.get("oid") or claims.get("sub") or email

    # Grant full access until Azure AD group-to-role mapping is configured
    access_token = create_access_token({
        "sub": user_id,
        "username": email,
        "name": name,
        "email": email,
        "role": "ROLE_SUPER_ADMIN",
        "department": claims.get("department", ""),
        "function": "",
        "location": "",
        "manager": "",
        "auth_source": "sso",
    })

    logger.info("sso.login.success", email=email, user_id=user_id)

    redirect = RedirectResponse(
        url=f"{settings.FRONTEND_URL}/callback?token={access_token}",
        status_code=302,
    )
    redirect.delete_cookie("sso_state")
    return redirect


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
