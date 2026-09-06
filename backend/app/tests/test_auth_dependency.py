"""Unit tests for the get_current_user FastAPI dependency."""

import pytest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

from app.core.jwt_service import create_access_token
from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser

# Minimal app for dependency testing
_app = FastAPI()


@_app.get("/test-me")
async def _test_me(user: CurrentUser = Depends(get_current_user)) -> dict:
    return {"user_id": user.user_id, "role": user.role}


_client = TestClient(_app, raise_server_exceptions=False)


def _token(expires_minutes: int | None = None, **kwargs: str) -> str:
    base: dict = {
        "sub": "EMP001",
        "username": "alice.johnson",
        "name": "Alice Johnson",
        "email": "alice@test.com",
        "role": "ROLE_EMPLOYEE",
        "department": "Operations",
        "function": "Supply Chain",
        "location": "New York",
        "manager": "bob.smith",
    }
    base.update(kwargs)
    return create_access_token(base, expires_minutes=expires_minutes)


@pytest.mark.unit
class TestGetCurrentUser:
    def test_valid_token_returns_current_user(self) -> None:
        token = _token()
        resp = _client.get("/test-me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["user_id"] == "EMP001"

    def test_missing_token_returns_401(self) -> None:
        resp = _client.get("/test-me")
        assert resp.status_code == 401

    def test_malformed_token_returns_401(self) -> None:
        resp = _client.get("/test-me", headers={"Authorization": "Bearer garbage"})
        assert resp.status_code == 401

    def test_expired_token_returns_401(self) -> None:
        token = _token(expires_minutes=-1)  # already expired
        resp = _client.get("/test-me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
