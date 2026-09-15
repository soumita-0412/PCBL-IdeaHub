"""
Users API — Azure AD address-book search for committee assignment.

GET /api/v1/users/search?q=<query>
  Returns up to 10 matching users (user_id, name, email) from Azure AD.
  Returns an empty list when Graph API is not configured (dev mode).
"""

import structlog
from fastapi import APIRouter, Depends, Query

from app.core.config import settings
from app.dependencies.permissions import require_admin
from app.integrations.graph_client import graph_client
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


class UserResult(dict):
    pass


@router.get(
    "/search",
    response_model=SuccessResponse[list[dict]],
    summary="Search organisation users from Azure AD",
)
async def search_users(
    q: str = Query(min_length=1, description="Name or email prefix to search"),
    _: CurrentUser = Depends(require_admin),
) -> SuccessResponse[list[dict]]:
    if not settings.GRAPH_CLIENT_ID:
        logger.warning("users.search.graph_not_configured")
        return SuccessResponse(data=[])
    try:
        results = await graph_client.search_users(q)
    except Exception:
        logger.exception("users.search.graph_error", query=q)
        return SuccessResponse(data=[])
    return SuccessResponse(data=results)
