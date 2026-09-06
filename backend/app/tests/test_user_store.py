"""Unit tests for app.core.user_store."""

import pickle
import tempfile
from pathlib import Path

import bcrypt
import pytest

from app.core.user_store import UserStore


def _make_store(users: list[dict]) -> UserStore:
    """Create a fresh (unloaded) UserStore instance for testing."""
    # Reset singleton state for test isolation
    store = UserStore.__new__(UserStore)
    store._users = []
    store._loaded = False
    import threading
    store._lock = threading.RLock()

    with tempfile.NamedTemporaryFile(suffix=".pkl", delete=False) as fh:
        pickle.dump(users, fh, protocol=pickle.HIGHEST_PROTOCOL)
        path = Path(fh.name)

    store.load(path)
    path.unlink(missing_ok=True)
    return store


_SAMPLE_USERS = [
    {
        "user_id": "EMP001",
        "username": "alice.johnson",
        "password_hash": bcrypt.hashpw(b"Password@123", bcrypt.gensalt()),
        "name": "Alice Johnson",
        "email": "alice@test.com",
        "department": "Operations",
        "function": "Supply Chain",
        "location": "New York",
        "manager": "bob.smith",
        "role": "ROLE_EMPLOYEE",
    }
]


@pytest.mark.unit
class TestUserStoreFindByUsername:
    def test_known_username_returns_dict(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        user = store.find_by_username("alice.johnson")
        assert user is not None
        assert user["user_id"] == "EMP001"

    def test_unknown_username_returns_none(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        assert store.find_by_username("nobody") is None

    def test_password_hash_not_exposed(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        user = store.find_by_username("alice.johnson")
        assert user is not None
        assert "password_hash" not in user


@pytest.mark.unit
class TestUserStoreFindByUserId:
    def test_known_id_returns_dict(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        user = store.find_by_user_id("EMP001")
        assert user is not None
        assert user["username"] == "alice.johnson"

    def test_unknown_id_returns_none(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        assert store.find_by_user_id("NOBODY") is None


@pytest.mark.unit
class TestUserStoreVerifyPassword:
    def test_correct_password_returns_user(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        user = store.verify_password("alice.johnson", "Password@123")
        assert user is not None
        assert user["user_id"] == "EMP001"
        assert "password_hash" not in user

    def test_wrong_password_returns_none(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        assert store.verify_password("alice.johnson", "WrongPassword") is None

    def test_unknown_user_returns_none(self) -> None:
        store = _make_store(_SAMPLE_USERS)
        assert store.verify_password("ghost", "Password@123") is None
