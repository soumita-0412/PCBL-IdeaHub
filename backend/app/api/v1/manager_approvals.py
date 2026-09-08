"""
Manager Approvals API endpoints.

GET /api/v1/manager-approvals          — list all approval/rejection records (L1 reviewer+)
GET /api/v1/manager-approvals/{id}     — fetch a single record
"""

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.permissions import require_l1_reviewer
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
        problem=doc.problem,
        idea_description=doc.idea_description,
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
    current_user: CurrentUser = Depends(require_l1_reviewer),
) -> SuccessResponse[list[ManagerApprovalResponse]]:
    docs = await _repo.find_all()
    return SuccessResponse(data=[_to_response(d) for d in docs])


@router.get(
    "/{approval_id}",
    response_model=SuccessResponse[ManagerApprovalResponse],
)
async def get_approval(
    approval_id: str,
    current_user: CurrentUser = Depends(require_l1_reviewer),
) -> SuccessResponse[ManagerApprovalResponse]:
    doc = await _repo.get_by_id(approval_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Approval record not found")
    return SuccessResponse(data=_to_response(doc))
