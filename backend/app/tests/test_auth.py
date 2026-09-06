"""
Unit tests for POST /api/v1/auth/login, /logout, GET /api/v1/auth/me.

Uses TestClient with a mocked user_store so no pickle file is needed.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app

client = TestClient(app, raise_server_exceptions=False)

_SAFE_USER = {
    "user_id": "EMP001",
    "username": "alice.johnson",
    "name": "Alice Johnson",
    "email": "alice@test.com",
    "department": "Operations",
    "function": "Supply Chain",
    "location": "New York",
    "manager": "bob.smith",
    "role": "ROLE_EMPLOYEE",
}


@pytest.mark.unit
class TestLoginEndpoint:
    def test_valid_credentials_return_token(self) -> None:
        with patch("app.api.v1.auth.user_store") as mock_store:
            mock_store.verify_password.return_value = _SAFE_USER
            resp = client.post(
                "/api/v1/auth/login",
                json={"username": "alice.johnson", "password": "Password@123"},
            )
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert "user" in body
        assert body["user"]["user_id"] == "EMP001"

    def test_wrong_password_returns_401(self) -> None:
        with patch("app.api.v1.auth.user_store") as mock_store:
            mock_store.verify_password.return_value = None
            resp = client.post(
                "/api/v1/auth/login",
                json={"username": "alice.johnson", "password": "WrongPass"},
            )
        assert resp.status_code == 401

    def test_unknown_user_returns_401(self) -> None:
        with patch("app.api.v1.auth.user_store") as mock_store:
            mock_store.verify_password.return_value = None
            resp = client.post(
                "/api/v1/auth/login",
                json={"username": "ghost", "password": "Password@123"},
            )
        assert resp.status_code == 401

    def test_error_body_format(self) -> None:
        with patch("app.api.v1.auth.user_store") as mock_store:
            mock_store.verify_password.return_value = None
            resp = client.post(
                "/api/v1/auth/login",
                json={"username": "ghost", "password": "pass"},
            )
        body = resp.json()
        assert body["success"] is False
        assert "error" in body
        assert body["error"]["code"] == "UNAUTHORIZED"

    def test_missing_fields_returns_422(self) -> None:
        resp = client.post("/api/v1/auth/login", json={"username": "alice"})
        assert resp.status_code == 422


@pytest.mark.unit
class TestLogoutEndpoint:
    def test_logout_returns_200(self) -> None:
        resp = client.post("/api/v1/auth/logout")
        assert resp.status_code == 200


@pytest.mark.unit
class TestMeEndpoint:
    def _get_token(self) -> str:
        with patch("app.api.v1.auth.user_store") as mock_store:
            mock_store.verify_password.return_value = _SAFE_USER
            resp = client.post(
                "/api/v1/auth/login",
                json={"username": "alice.johnson", "password": "Password@123"},
            )
        return resp.json()["access_token"]

    def test_me_with_valid_token(self) -> None:
        token = self._get_token()
        resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["user_id"] == "EMP001"

    def test_me_without_token_returns_401(self) -> None:
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401
