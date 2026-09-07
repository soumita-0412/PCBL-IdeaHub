"""
Ideas API endpoints.

POST /api/v1/ideas        — submit a new idea (authenticated employees)
GET  /api/v1/ideas/mine   — list the caller's own submissions
GET  /api/v1/ideas/{id}   — fetch a single idea by its MongoDB id
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_employee
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse
from app.schemas.idea import IdeaCreate, IdeaListItem, IdeaResponse
from app.services import idea_service

router = APIRouter(prefix="/ideas", tags=["Ideas"])


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
