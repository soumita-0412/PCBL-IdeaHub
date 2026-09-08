"""
Business logic for category management.

Default categories are seeded once on first startup if the collection is empty.
"""

from app.core.exceptions import ConflictException, NotFoundException, ValidationException
from app.models.category import Category, MatrixOption
from app.repositories.category_repository import CategoryRepository
from app.schemas.auth import CurrentUser
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate, MatrixOptionOut

_DEFAULT_NAMES = [
    "Cost Optimization",
    "Cyber Security",
    "Employee Experience",
    "Operations",
    "HR",
    "Finance",
    "IT",
    "Specialty Business",
    "Rubber Business",
    "Battery Business",
]

_repo = CategoryRepository()


async def seed_defaults() -> None:
    """Insert the default categories if the collection is empty."""
    if await _repo.total_count() == 0:
        for name in _DEFAULT_NAMES:
            await Category(name=name).insert()


async def list_categories() -> list[CategoryResponse]:
    cats = await _repo.find_all_sorted()
    return [_to_response(c) for c in cats]


async def create_category(payload: CategoryCreate, actor: CurrentUser) -> CategoryResponse:
    _validate_matrix(payload.matrix)
    if await _repo.find_by_name(payload.name):
        raise ConflictException(f"Category '{payload.name}' already exists")
    cat = Category(
        name=payload.name,
        matrix=[MatrixOption(label=o.label, weight=o.weight) for o in payload.matrix],
    )
    await cat.save_with_actor(actor.user_id)
    return _to_response(cat)


async def update_category(
    category_id: str, payload: CategoryUpdate, actor: CurrentUser
) -> CategoryResponse:
    cat = await _repo.get_by_id(category_id)
    if cat is None:
        raise NotFoundException(f"Category '{category_id}' not found")
    if payload.name is not None:
        existing = await _repo.find_by_name(payload.name)
        if existing and str(existing.id) != category_id:
            raise ConflictException(f"Category '{payload.name}' already exists")
        cat.name = payload.name
    if payload.matrix is not None:
        _validate_matrix(payload.matrix)
        cat.matrix = [MatrixOption(label=o.label, weight=o.weight) for o in payload.matrix]
    await cat.save_with_actor(actor.user_id)
    return _to_response(cat)


async def delete_category(category_id: str) -> None:
    if not await _repo.delete(category_id):
        raise NotFoundException(f"Category '{category_id}' not found")


def _validate_matrix(matrix: list) -> None:
    if matrix:
        total = sum(o.weight for o in matrix)
        if total != 100:
            raise ValidationException(
                f"Scoring matrix weights must total 100 (got {total})"
            )


def _to_response(cat: Category) -> CategoryResponse:
    return CategoryResponse(
        id=str(cat.id),
        name=cat.name,
        matrix=[MatrixOptionOut(label=o.label, weight=o.weight) for o in cat.matrix],
        created_at=cat.created_at,
        updated_at=cat.updated_at,
    )
