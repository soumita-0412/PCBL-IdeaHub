"""
Ideas API endpoints.

POST /api/v1/ideas        — submit a new idea (authenticated employees)
GET  /api/v1/ideas/mine   — list the caller's own submissions
GET  /api/v1/ideas/{id}   — fetch a single idea by its MongoDB id
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_committee_or_l1_reviewer, require_employee, require_l1_reviewer
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse
from app.schemas.idea import IdeaCreate, IdeaL2ReviewUpdate, IdeaListItem, IdeaResponse, IdeaReviewUpdate, IdeaStats
from app.services import idea_service

router = APIRouter(prefix="/ideas", tags=["Ideas"])


@router.get(
    "",
    response_model=SuccessResponse[list[IdeaResponse]],
)
async def list_all_ideas(
    current_user: CurrentUser = Depends(require_l1_reviewer),
) -> SuccessResponse[list[IdeaResponse]]:
    ideas = await idea_service.get_all_ideas()
    return SuccessResponse(data=ideas)


@router.patch(
    "/{idea_id}/review",
    response_model=SuccessResponse[IdeaResponse],
)
async def review_idea(
    idea_id: str,
    body: IdeaReviewUpdate,
    current_user: CurrentUser = Depends(require_l1_reviewer),
) -> SuccessResponse[IdeaResponse]:
    idea = await idea_service.review_idea(idea_id, body, current_user)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    return SuccessResponse(data=idea)


@router.patch(
    "/{idea_id}/l2-review",
    response_model=SuccessResponse[IdeaResponse],
)
async def l2_review_idea(
    idea_id: str,
    body: IdeaL2ReviewUpdate,
    current_user: CurrentUser = Depends(require_committee_or_l1_reviewer),
) -> SuccessResponse[IdeaResponse]:
    idea = await idea_service.l2_review_idea(idea_id, body, current_user)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    return SuccessResponse(data=idea)


@router.post(
    "",
    response_model=SuccessResponse[IdeaResponse],
    status_code=status.HTTP_201_CREATED,
)
async def submit_idea(
    body: IdeaCreate,
    current_user: CurrentUser = Depends(require_employee),
) -> SuccessResponse[IdeaResponse]:
    idea = await idea_service.submit_idea(body, current_user)
    return SuccessResponse(data=idea)


@router.get(
    "/mine",
    response_model=SuccessResponse[list[IdeaListItem]],
)
async def my_ideas(
    current_user: CurrentUser = Depends(get_current_user),
) -> SuccessResponse[list[IdeaListItem]]:
    ideas = await idea_service.get_my_ideas(current_user)
    return SuccessResponse(data=ideas)


@router.get(
    "/stats",
    response_model=SuccessResponse[IdeaStats],
)
async def my_stats(
    current_user: CurrentUser = Depends(get_current_user),
) -> SuccessResponse[IdeaStats]:
    stats = await idea_service.get_my_stats(current_user)
    return SuccessResponse(data=stats)


@router.get(
    "/{idea_id}",
    response_model=SuccessResponse[IdeaResponse],
)
async def get_idea(
    idea_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> SuccessResponse[IdeaResponse]:
    idea = await idea_service.get_idea_by_id(idea_id, current_user)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    return SuccessResponse(data=idea)
