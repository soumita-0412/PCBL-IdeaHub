"""
Centralised application configuration via Pydantic Settings.

Settings are read from environment variables (and .env file).
All other modules import `settings` from here — never read
`os.environ` directly outside this file.
"""

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, MongoDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Application ─────────────────────────────────────────
    APP_ENV: Literal["development", "uat", "production", "testing"] = "development"
    APP_NAME: str = "Ideas Portal API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── Server ──────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # ── CORS ────────────────────────────────────────────────
    # Stored as a plain str so pydantic-settings never tries to json.loads() it.
    # Use the `cors_origins` property everywhere instead of this field directly.
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── MongoDB ─────────────────────────────────────────────
    MONGODB_URL: MongoDsn
    MONGODB_DATABASE: str = "ideas_portal"
    MONGODB_MIN_POOL_SIZE: int = 5
    MONGODB_MAX_POOL_SIZE: int = 50
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 5000

    # ── JWT (HS256 — Phase 1 pickle auth) ───────────────────
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes

    # ── Azure AD (Phase 2+ SSO — optional in Phase 1) ───────
    AZURE_TENANT_ID: str = ""
    AZURE_CLIENT_ID: str = ""
    JWT_AUDIENCE: str = ""
    JWT_LEEWAY: int = 30

    # ── Graph API ───────────────────────────────────────────
    GRAPH_CLIENT_ID: str = ""
    GRAPH_CLIENT_SECRET: str = ""
    GRAPH_TENANT_ID: str = ""
    GRAPH_BASE_URL: AnyHttpUrl = "https://graph.microsoft.com/v1.0"  # type: ignore[assignment]

    # ── Logging ─────────────────────────────────────────────
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    LOG_FORMAT: Literal["json", "console"] = "console"

    # ── Storage ─────────────────────────────────────────────
    AZURE_STORAGE_ACCOUNT_NAME: str = ""
    AZURE_STORAGE_ACCOUNT_KEY: str = ""
    AZURE_STORAGE_CONTAINER_NAME: str = "ideas-attachments"

    # ── Rate Limiting ────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 100

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def jwks_uri(self) -> str:
        # Phase 2+: used when Entra ID SSO is active
        return (
            f"https://login.microsoftonline.com/{self.AZURE_TENANT_ID}"
            "/discovery/v2.0/keys"
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
