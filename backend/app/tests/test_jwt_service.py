"""Unit tests for app.core.jwt_service."""

import pytest
from jose import jwt

from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.core.jwt_service import create_access_token, decode_access_token


@pytest.mark.unit
class TestCreateAccessToken:
    def test_returns_valid_jwt_string(self) -> None:
        token = create_access_token({"sub": "EMP001", "role": "ROLE_EMPLOYEE"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_payload_claims_present(self) -> None:
        data = {"sub": "EMP001", "name": "Alice", "role": "ROLE_EMPLOYEE"}
        token = create_access_token(data)
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        assert payload["sub"] == "EMP001"
        assert payload["name"] == "Alice"
        assert payload["role"] == "ROLE_EMPLOYEE"
        assert "exp" in payload
        assert "iat" in payload

    def test_custom_expiry(self) -> None:
        import time
        token = create_access_token({"sub": "EMP001"}, expires_minutes=1)
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        # Should expire ~60 s from now
        assert payload["exp"] - time.time() < 120


@pytest.mark.unit
class TestDecodeAccessToken:
    def test_round_trip(self) -> None:
        token = create_access_token({"sub": "EMP001", "role": "ROLE_ADMIN"})
        payload = decode_access_token(token)
        assert payload["sub"] == "EMP001"
        assert payload["role"] == "ROLE_ADMIN"

    def test_invalid_token_raises_unauthorized(self) -> None:
        with pytest.raises(UnauthorizedException):
            decode_access_token("not.a.real.token")

    def test_tampered_token_raises_unauthorized(self) -> None:
        token = create_access_token({"sub": "EMP001"})
        tampered = token[:-5] + "AAAAA"
        with pytest.raises(UnauthorizedException):
            decode_access_token(tampered)

    def test_expired_token_raises_unauthorized(self) -> None:
        # expires_minutes=0 creates a token that expires immediately
        token = create_access_token({"sub": "EMP001"}, expires_minutes=-1)
        with pytest.raises(UnauthorizedException):
            decode_access_token(token)
