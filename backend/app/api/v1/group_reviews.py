"""
Group Reviews API endpoints.

GET /api/v1/group-reviews        — list all group review records (L1 reviewer+)
GET /api/v1/group-reviews/{id}   — fetch a single record
"""

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.permissions import require_l1_reviewer
from app.models.group_review import GroupReview
from app.repositories.group_review_repository import GroupReviewRepository
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse
from app.schemas.group_review import GroupReviewResponse

router = APIRouter(prefix="/group-reviews", tags=["Group Reviews"])

_repo = GroupReviewRepository()


def _to_response(doc: GroupReview) -> GroupReviewResponse:
    return GroupReviewResponse(
        id=str(doc.id),
        idea_id=doc.idea_id,
        submission_number=doc.submission_number,
        manager_approval_id=doc.manager_approval_id,
        category=doc.category,
        problem=doc.problem,
        idea_description=doc.idea_description,
        additional_info=doc.additional_info,
        annual_estimate=doc.annual_estimate,
        employee_name=doc.employee_name,
        employee_email=doc.employee_email,
        manager_who_approved_name=doc.manager_who_approved_name,
        manager_who_approved_email=doc.manager_who_approved_email,
        criteria_scores=doc.criteria_scores,
        weighted_score=doc.weighted_score,
        decision=doc.decision,
        qualitative_feedback=doc.qualitative_feedback,
        reviewed_by=doc.reviewed_by,
        reviewed_by_name=doc.reviewed_by_name,
        reviewed_by_email=doc.reviewed_by_email,
        created_at=doc.created_at,
    )


@router.get(
    "",
    response_model=SuccessResponse[list[GroupReviewResponse]],
)
async def list_group_reviews(
    current_user: CurrentUser = Depends(require_l1_reviewer),
) -> SuccessResponse[list[GroupReviewResponse]]:
    docs = await _repo.find_all()
    return SuccessResponse(data=[_to_response(d) for d in docs])


@router.get(
    "/{review_id}",
    response_model=SuccessResponse[GroupReviewResponse],
)
async def get_group_review(
    review_id: str,
    current_user: CurrentUser = Depends(require_l1_reviewer),
) -> SuccessResponse[GroupReviewResponse]:
    doc = await _repo.get_by_id(review_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Group review record not found")
    return SuccessResponse(data=_to_response(doc))
