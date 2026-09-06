"""
Microsoft Graph API client for server-to-server calls.

Uses client credentials flow (app-level token, not delegated).
Used for: fetching user profiles, org hierarchy, group memberships.
"""

from typing import Any

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

_TOKEN_ENDPOINT = (
    f"https://login.microsoftonline.com/{settings.GRAPH_TENANT_ID}/oauth2/v2.0/token"
)


class GraphClient:
    """Thin async wrapper around the Microsoft Graph REST API."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=str(settings.GRAPH_BASE_URL),
            timeout=15,
        )
        self._access_token: str | None = None

    async def _get_token(self) -> str:
        if self._access_token:
            return self._access_token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                _TOKEN_ENDPOINT,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.GRAPH_CLIENT_ID,
                    "client_secret": settings.GRAPH_CLIENT_SECRET,
                    "scope": "https://graph.microsoft.com/.default",
                },
            )
            response.raise_for_status()
            self._access_token = response.json()["access_token"]
        return self._access_token  # type: ignore[return-value]

    async def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        token = await self._get_token()
        response = await self._client.get(
            path,
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )
        response.raise_for_status()
        result: dict[str, Any] = response.json()
        return result

    async def close(self) -> None:
        await self._client.aclose()


graph_client = GraphClient()
