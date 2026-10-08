"""
Role-based access control FastAPI dependencies.

Usage:
    @router.get("/admin-only")
    async def endpoint(user: CurrentUser = Depends(require_admin)):
        ...

"And above" means the user's role index in ROLE_HIERARCHY >= the
minimum required role index.
"""

from collections.abc import Callable

from fastapi import Depends

from app.core.constants import ROLE_HIERARCHY, Roles
from app.core.exceptions import ForbiddenException
from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser


def _require_role(min_role: str) -> Callable:
    """Factory that returns a FastAPI dependency enforcing a minimum role."""
    min_index = ROLE_HIERARCHY.index(min_role)

    async def dependency(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        try:
            user_index = ROLE_HIERARCHY.index(current_user.role)
        except ValueError as exc:
            raise ForbiddenException(f"Unknown role: {current_user.role}") from exc
        if user_index < min_index:
            raise ForbiddenException("Insufficient permissions for this action")
        return current_user

    return dependency


# Reusable dependencies — inject directly into endpoint signatures
require_employee = _require_role(Roles.EMPLOYEE)
require_l1_reviewer = _require_role(Roles.L1_REVIEWER)
require_functional_reviewer = _require_role(Roles.FUNCTIONAL_REVIEWER)
require_functional_head = _require_role(Roles.FUNCTIONAL_HEAD)
require_admin = _require_role(Roles.ADMIN)


async def require_super_admin(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Exact-match guard — ROLE_SUPER_ADMIN only."""
    if current_user.role != Roles.SUPER_ADMIN:
        raise ForbiddenException("Super admin access required")
    return current_user


async def require_committee_lead(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Pass only if the user is a committee lead in at least one category.
    Super admin is explicitly blocked — admins have read-only access to reviews."""
    if current_user.role == Roles.SUPER_ADMIN:
        raise ForbiddenException("Super admins have read-only access to the review dashboard")

    from app.models.category_committee import CategoryCommittee

    email_lower = current_user.email.lower()
    committees = await CategoryCommittee.find().to_list()
    is_lead = any(
        c.committee_lead and c.committee_lead.email.lower() == email_lower
        for c in committees
    )
    if is_lead:
        return current_user
    raise ForbiddenException("Committee lead access required")


async def require_committee_or_l1_reviewer(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Pass if the user has ROLE_L1_REVIEWER+ OR is a committee lead/member in any category."""
    try:
        user_index = ROLE_HIERARCHY.index(current_user.role)
        l1_index = ROLE_HIERARCHY.index(Roles.L1_REVIEWER)
        if user_index >= l1_index:
            return current_user
    except ValueError:
        pass

    # Fall through to DB committee check for ROLE_EMPLOYEE-level users
    from app.models.category_committee import CategoryCommittee  # avoid circular import at module load

    email_lower = current_user.email.lower()
    committees = await CategoryCommittee.find().to_list()
    is_committee = any(
        (c.committee_lead and c.committee_lead.email.lower() == email_lower)
        or any(m.email.lower() == email_lower for m in c.committee_members)
        for c in committees
    )
    if is_committee:
        return current_user

    raise ForbiddenException("Insufficient permissions for this action")
