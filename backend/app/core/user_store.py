"""
Pickle-based user store — development-phase user database.

Loaded once at startup; all reads are thread-safe.
Password hashes are kept in memory but never returned
outside this module.  Swap this class for an Entra ID /
SuccessFactors adapter in a later phase with no changes
to callers.
"""

import pickle
import threading
from pathlib import Path
from typing import Optional

import bcrypt
import structlog

logger = structlog.get_logger(__name__)

_SENTINEL = object()


class UserStore:
    """Thread-safe singleton that wraps the pickle user file."""

    _instance: Optional["UserStore"] = None
    _class_lock: threading.Lock = threading.Lock()

    def __new__(cls) -> "UserStore":
        with cls._class_lock:
            if cls._instance is None:
                inst = super().__new__(cls)
                inst._users: list[dict] = []
                inst._lock = threading.RLock()
                inst._loaded = False
                cls._instance = inst
        return cls._instance  # type: ignore[return-value]

    # ── Lifecycle ────────────────────────────────────────────

    def load(self, path: Path) -> None:
        """Load users from the pickle file.  No-op if already loaded."""
        with self._lock:
            if self._loaded:
                return
            if not path.exists():
                raise FileNotFoundError(
                    f"User store not found at {path}. "
                    "Run backend/scripts/seed_users.py first."
                )
            with open(path, "rb") as fh:
                raw: list[dict] = pickle.load(fh)  # noqa: S301
            self._users = raw
            self._loaded = True
            logger.info("user_store.loaded", count=len(self._users))

    # ── Queries ──────────────────────────────────────────────

    def find_by_username(self, username: str) -> Optional[dict]:
        """Return user dict without password_hash, or None if not found."""
        with self._lock:
            for user in self._users:
                if user.get("username") == username:
                    return self._safe(user)
        return None

    def find_by_user_id(self, user_id: str) -> Optional[dict]:
        """Return user dict without password_hash, or None if not found."""
        with self._lock:
            for user in self._users:
                if user.get("user_id") == user_id:
                    return self._safe(user)
        return None

    def verify_password(self, username: str, password: str) -> Optional[dict]:
        """
        Validate credentials.

        Returns safe user dict on success, None on any failure.
        Constant-time comparison prevents timing attacks.
        """
        with self._lock:
            raw_user: Optional[dict] = None
            for user in self._users:
                if user.get("username") == username:
                    raw_user = user
                    break

        if raw_user is None:
            # Run a dummy check to avoid timing side-channels
            bcrypt.checkpw(b"dummy", bcrypt.hashpw(b"dummy", bcrypt.gensalt()))
            return None

        stored: bytes = raw_user["password_hash"]
        if bcrypt.checkpw(password.encode("utf-8"), stored):
            return self._safe(raw_user)
        return None

    # ── Internal ─────────────────────────────────────────────

    @staticmethod
    def _safe(user: dict) -> dict:
        """Strip password_hash before returning to callers."""
        return {k: v for k, v in user.items() if k != "password_hash"}


# Module-level singleton — import and use directly
user_store = UserStore()
