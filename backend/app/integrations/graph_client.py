"""
Microsoft Graph API client for server-to-server calls.

Uses client credentials flow (app-level token, not delegated).
Used for: fetching user profiles, org hierarchy, group memberships, sending mail.

Required Graph app permissions:
  User.Read.All          — directReports, manager look-up, user search
  Mail.Send              — sendMail on behalf of GRAPH_MAIL_SENDER mailbox
"""

import time
from typing import Any

import httpx

from app.core.config import settings

_TOKEN_ENDPOINT = (
    f"https://login.microsoftonline.com/{settings.GRAPH_TENANT_ID}/oauth2/v2.0/token"
)

_TOKEN_REFRESH_BUFFER = 60  # seconds before expiry to refresh


class GraphClient:
    """Thin async wrapper around the Microsoft Graph REST API."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=str(settings.GRAPH_BASE_URL),
            timeout=15,
        )
        self._access_token: str | None = None
        self._token_expires_at: float = 0.0

    async def _get_token(self) -> str:
        if self._access_token and time.time() < self._token_expires_at - _TOKEN_REFRESH_BUFFER:
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
            token_data = response.json()
            self._access_token = token_data["access_token"]
            self._token_expires_at = time.time() + token_data.get("expires_in", 3600)
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

    async def search_users(self, query: str, top: int = 10) -> list[dict]:
        """Search Azure AD users by display name or email prefix."""
        safe = query.replace("'", "''")
        filter_expr = (
            f"startswith(displayName,'{safe}') or startswith(mail,'{safe}')"
        )
        token = await self._get_token()
        response = await self._client.get(
            "/users",
            headers={
                "Authorization": f"Bearer {token}",
                "ConsistencyLevel": "eventual",
            },
            params={
                "$filter": filter_expr,
                "$select": "id,displayName,mail",
                "$top": top,
                "$orderby": "displayName",
                "$count": "true",
            },
        )
        response.raise_for_status()
        result: dict[str, Any] = response.json()
        users = []
        for u in result.get("value", []):
            if u.get("mail"):
                users.append(
                    {
                        "user_id": u["id"],
                        "name": u.get("displayName") or u["mail"],
                        "email": u["mail"],
                    }
                )
        return users

    async def get_user_manager(self, user_id_or_email: str) -> dict[str, str] | None:
        """Return the manager's display name and mail, or None if not found."""
        try:
            data = await self.get(
                f"/users/{user_id_or_email}/manager",
                params={"$select": "displayName,mail"},
            )
            mail = data.get("mail") or data.get("userPrincipalName", "")
            name = data.get("displayName", mail)
            return {"email": mail, "name": name} if mail else None
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                return None
            raise

    async def send_mail(
        self,
        sender: str,
        to_email: str,
        to_name: str,
        subject: str,
        html_body: str,
    ) -> None:
        """Send an email from `sender` mailbox via Graph Mail.Send."""
        token = await self._get_token()
        payload = {
            "message": {
                "subject": subject,
                "body": {"contentType": "HTML", "content": html_body},
                "toRecipients": [
                    {"emailAddress": {"address": to_email, "name": to_name}}
                ],
            },
            "saveToSentItems": False,
        }
        response = await self._client.post(
            f"/users/{sender}/sendMail",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    async def close(self) -> None:
        await self._client.aclose()


graph_client = GraphClient()
