"""
Generic Repository base class (Repository Pattern).

Concrete repositories extend BaseRepository[T] where T is a
Beanie Document subclass.  All MongoDB operations are contained
here — services never call Motor / Beanie directly.

Design decisions:
- Repositories own ALL database I/O (no raw queries outside this layer).
- Services own business logic and orchestration.
- Pagination is handled at the repository layer to avoid loading
  full collections into memory.
"""

from typing import Any, Generic, TypeVar

from beanie import Document
from beanie.odm.operators.find.comparison import In
from pymongo import ASCENDING, DESCENDING

from app.dependencies.pagination import PaginationParams

T = TypeVar("T", bound=Document)


class BaseRepository(Generic[T]):
    def __init__(self, model: type[T]) -> None:
        self._model = model

    async def get_by_id(self, id: str) -> T | None:
        return await self._model.get(id)

    async def get_all(self, params: PaginationParams, extra_filters: dict[str, Any] | None = None) -> tuple[list[T], int]:
        query = self._model.find(extra_filters or {})
        total = await query.count()
        sort_dir = ASCENDING if params.sort_order == "asc" else DESCENDING
        items = (
            await query
            .sort((params.sort_by, sort_dir))
            .skip((params.page - 1) * params.page_size)
            .limit(params.page_size)
            .to_list()
        )
        return items, total

    async def create(self, document: T) -> T:
        await document.insert()
        return document

    async def update(self, document: T) -> T:
        await document.save()
        return document

    async def delete(self, id: str) -> bool:
        document = await self.get_by_id(id)
        if document is None:
            return False
        await document.delete()
        return True

    async def exists(self, id: str) -> bool:
        return await self._model.find({"_id": id}).count() > 0
