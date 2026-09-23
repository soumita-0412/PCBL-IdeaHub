"""
Resolves the portal role for a user logging in via Microsoft SSO.

Priority order:
  1. admin_roles.json  — ROLE_SUPER_ADMIN or ROLE_ADMIN (explicit list)
  2. Graph API directReports — ROLE_L1_REVIEWER (auto: is this user anyone's manager?)
  3. Default — ROLE_EMPLOYEE

Adding/removing an admin: edit backend/data/admin_roles.json and redeploy.
L1 manager detection is fully automatic — it stays in sync with Azure AD.
"""

import json
import structlog
from pathlib import Path

from app.core.constants import Roles

logger = structlog.get_logger(__name__)

_ADMIN_ROLES_PATH = Path(__file__).parent.parent.parent / "data" / "admin_roles.json"


def _load_admin_roles() -> dict:
    try:
        with open(_ADMIN_ROLES_PATH) as fh:
            return json.load(fh)
    except FileNotFoundError:
        logger.warning("role_resolver.admin_roles_not_found", path=str(_ADMIN_ROLES_PATH))
        return {"super_admins": [], "admins": []}


async def resolve_role(email: str, azure_object_id: str) -> str:
    """
    Return the appropriate portal role for an SSO-authenticated user.

    Falls back to ROLE_EMPLOYEE if Graph credentials are not configured
    or the API call fails, so login never breaks due to a Graph outage.
    """
    admin_roles = _load_admin_roles()
    email_lower = email.lower()

    if email_lower in [e.lower() for e in admin_roles.get("super_admins", [])]:
        logger.info("role_resolver.assigned", email=email, role="SUPER_ADMIN")
        return Roles.SUPER_ADMIN

    if email_lower in [e.lower() for e in admin_roles.get("admins", [])]:
        logger.info("role_resolver.assigned", email=email, role="ADMIN")
        return Roles.ADMIN

    # Auto-detect L1 manager: does anyone in Azure AD report to this user?
    try:
        from app.core.config import settings
        from app.integrations.graph_client import graph_client

        if settings.GRAPH_CLIENT_ID and settings.GRAPH_CLIENT_SECRET:
            result = await graph_client.get(
                f"/users/{azure_object_id}/directReports",
                params={"$top": "1", "$select": "id"},
            )
            if result.get("value"):
                logger.info("role_resolver.assigned", email=email, role="L1_REVIEWER")
                return Roles.L1_REVIEWER
        else:
            logger.debug("role_resolver.graph_skipped", reason="credentials not configured")
    except Exception as exc:
        logger.warning("role_resolver.graph_check_failed", email=email, error=str(exc))

    logger.info("role_resolver.assigned", email=email, role="EMPLOYEE")
    return Roles.EMPLOYEE
