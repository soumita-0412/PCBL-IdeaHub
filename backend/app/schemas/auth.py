"""Pydantic schemas for authentication request/response bodies."""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class CurrentUser(BaseModel):
    """User identity extracted from a validated JWT — safe to expose in responses."""

    user_id: str
    username: str
    name: str
    email: str
    department: str
    function: str
    location: str
    manager: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: CurrentUser
