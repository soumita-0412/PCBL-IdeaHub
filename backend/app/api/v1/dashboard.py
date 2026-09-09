"""
Dashboard API endpoints.

GET /api/v1/dashboard/stats  — portal-wide aggregate statistics
GET /api/v1/dashboard/ideas  — paginated recent ideas (newest first)
"""

from fastapi import APIRouter, Depends, Query

from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.common import SuccessResponse
from app.schemas.dashboard import DashboardStats, PaginatedIdeas
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=SuccessResponse[DashboardStats])
async def dashboard_stats(
    _: CurrentUser = Depends(get_current_user),
) -> SuccessResponse[DashboardStats]:
    stats = await dashboard_service.get_dashboard_stats()
    return SuccessResponse(data=stats)


@router.get("/ideas", response_model=SuccessResponse[PaginatedIdeas])
async def recent_ideas(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=20),
    _: CurrentUser = Depends(get_current_user),
) -> SuccessResponse[PaginatedIdeas]:
    result = await dashboard_service.get_recent_ideas(page=page, limit=limit)
    return SuccessResponse(data=result)
