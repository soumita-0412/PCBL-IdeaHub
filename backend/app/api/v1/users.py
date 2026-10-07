"""
Users API — Azure AD address-book search and committee status.

GET /api/v1/users/search?q=<query>
  Returns up to 10 matching users (user_id, name, email) from Azure AD.
  Returns an empty list when Graph API is not configured (dev mode).

GET /api/v1/users/me/committee-status
  Returns whether the current user is a committee lead or member in any category.
"""

import structlog
from fastapi import APIRouter, Depends, Query

from app.core.config import settings
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin
from app.integrations.graph_client import graph_client
from app.models.category_committee import CategoryCommittee
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


class UserResult(dict):
    pass


@router.get(
    "/me/committee-status",
    response_model=SuccessResponse[dict],
    summary="Check if the current user is a committee lead or member in any category",
)
async def get_my_committee_status(
    current_user: CurrentUser = Depends(get_current_user),
) -> SuccessResponse[dict]:
    email_lower = current_user.email.lower()
    committees = await CategoryCommittee.find().to_list()

    is_lead = any(
        c.committee_lead and c.committee_lead.email.lower() == email_lower
        for c in committees
    )
    is_member = any(
        any(m.email.lower() == email_lower for m in c.committee_members)
        for c in committees
    )

    return SuccessResponse(data={
        "is_committee_lead": is_lead,
        "is_committee_member": is_member,
        "is_committee": is_lead or is_member,
    })


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
