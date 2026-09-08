"""
Categories API endpoints.

GET    /api/v1/categories        — list all categories (any authenticated user)
POST   /api/v1/categories        — create a category (admin only)
PUT    /api/v1/categories/{id}   — update a category (admin only)
DELETE /api/v1/categories/{id}   — delete a category (admin only)
"""

from fastapi import APIRouter, status

from app.dependencies.permissions import require_admin, require_employee
from app.schemas.auth import CurrentUser
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import SuccessResponse
from app.services import category_service
from fastapi import Depends

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=SuccessResponse[list[CategoryResponse]],
)
async def list_categories(
    _: CurrentUser = Depends(require_employee),
) -> SuccessResponse[list[CategoryResponse]]:
    categories = await category_service.list_categories()
    return SuccessResponse(data=categories)


@router.post(
    "",
    response_model=SuccessResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_category(
    body: CategoryCreate,
    current_user: CurrentUser = Depends(require_admin),
) -> SuccessResponse[CategoryResponse]:
    category = await category_service.create_category(body, current_user)
    return SuccessResponse(data=category)


@router.put(
    "/{category_id}",
    response_model=SuccessResponse[CategoryResponse],
)
async def update_category(
    category_id: str,
    body: CategoryUpdate,
    current_user: CurrentUser = Depends(require_admin),
) -> SuccessResponse[CategoryResponse]:
    category = await category_service.update_category(category_id, body, current_user)
    return SuccessResponse(data=category)


@router.delete(
    "/{category_id}",
    response_model=SuccessResponse[None],
)
async def delete_category(
    category_id: str,
    _: CurrentUser = Depends(require_admin),
) -> SuccessResponse[None]:
    await category_service.delete_category(category_id)
    return SuccessResponse(data=None)
