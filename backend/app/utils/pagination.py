"""
Utility helpers for building paginated API responses.
"""

from typing import TypeVar

from pydantic import BaseModel

from app.dependencies.pagination import PaginationParams
from app.schemas.base import PaginationMeta

T = TypeVar("T", bound=BaseModel)


def build_pagination_meta(total: int, params: PaginationParams) -> PaginationMeta:
    total_pages = max(1, -(-total // params.page_size))
    return PaginationMeta(
        total=total,
        page=params.page,
        page_size=params.page_size,
        has_next=params.page < total_pages,
        has_prev=params.page > 1,
    )
