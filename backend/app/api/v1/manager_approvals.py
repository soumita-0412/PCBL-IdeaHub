"""
Manager Approvals API endpoints.

GET /api/v1/manager-approvals          — list all approval/rejection records (L1 reviewer+)
GET /api/v1/manager-approvals/{id}     — fetch a single record
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.constants import ROLE_HIERARCHY, Roles
from app.dependencies.permissions import require_committee_or_l1_reviewer
from app.models.manager_approval import ManagerApproval
from app.repositories.manager_approval_repository import ManagerApprovalRepository
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse
from app.schemas.manager_approval import ManagerApprovalResponse

router = APIRouter(prefix="/manager-approvals", tags=["Manager Approvals"])

_repo = ManagerApprovalRepository()


def _to_response(doc: ManagerApproval) -> ManagerApprovalResponse:
    return ManagerApprovalResponse(
        id=str(doc.id),
        idea_id=doc.idea_id,
        submission_number=doc.submission_number,
        category=doc.category,
        idea_title=doc.idea_title,
        problem=doc.problem,
        idea_description=doc.idea_description,
        benefit=doc.benefit,
        additional_info=doc.additional_info,
        annual_estimate=doc.annual_estimate,
        employee_name=doc.employee_name,
        employee_email=doc.employee_email,
        decision=doc.decision,
        reviewer_comment=doc.reviewer_comment,
        reviewed_by=doc.reviewed_by,
        reviewed_by_name=doc.reviewed_by_name,
        reviewed_by_email=doc.reviewed_by_email,
        created_at=doc.created_at,
    )


@router.get(
    "",
    response_model=SuccessResponse[list[ManagerApprovalResponse]],
)
async def list_approvals(
    decision: Optional[str] = Query(default=None, description="Filter by decision: approved | rejected"),
    current_user: CurrentUser = Depends(require_committee_or_l1_reviewer),
) -> SuccessResponse[list[ManagerApprovalResponse]]:
    docs = await (_repo.find_by_decision(decision) if decision else _repo.find_all())

    # L1 reviewer and above (incl. super admin) see all
    try:
        if ROLE_HIERARCHY.index(current_user.role) >= ROLE_HIERARCHY.index(Roles.L1_REVIEWER):
            return SuccessResponse(data=[_to_response(d) for d in docs])
    except ValueError:
        pass

    # Committee-only user: restrict to their assigned categories
    from app.models.category_committee import CategoryCommittee
    email_lower = current_user.email.lower()
    committees = await CategoryCommittee.find().to_list()
    allowed = {
        c.category_name for c in committees
        if (c.committee_lead and c.committee_lead.email.lower() == email_lower)
        or any(m.email.lower() == email_lower for m in c.committee_members)
    }
    return SuccessResponse(data=[_to_response(d) for d in docs if d.category in allowed])


@router.get(
    "/{approval_id}",
    response_model=SuccessResponse[ManagerApprovalResponse],
)
async def get_approval(
    approval_id: str,
    current_user: CurrentUser = Depends(require_committee_or_l1_reviewer),
) -> SuccessResponse[ManagerApprovalResponse]:
    doc = await _repo.get_by_id(approval_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Approval record not found")
    return SuccessResponse(data=_to_response(doc))
