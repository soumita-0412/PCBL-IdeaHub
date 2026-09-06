"""
Base Service class (Service Layer Pattern).

Services encapsulate all business logic.  They:
  - Accept and return Pydantic schemas (NOT Beanie documents).
  - Depend on one or more Repository instances (injected).
  - Raise domain exceptions (app.core.exceptions) on errors.
  - Never perform direct database operations.

Concrete services inherit BaseService[DocT, CreateSchemaT, UpdateSchemaT].
"""

from typing import Generic, TypeVar

from beanie import Document
from pydantic import BaseModel

from app.core.exceptions import NotFoundException
from app.dependencies.pagination import PaginationParams
from app.repositories.base import BaseRepository

DocT = TypeVar("DocT", bound=Document)
CreateT = TypeVar("CreateT", bound=BaseModel)
UpdateT = TypeVar("UpdateT", bound=BaseModel)
ResponseT = TypeVar("ResponseT", bound=BaseModel)


class BaseService(Generic[DocT, CreateT, UpdateT]):
    """
    Provides CRUD scaffolding.
    Override methods to add business rules.
    """

    def __init__(self, repository: BaseRepository[DocT]) -> None:
        self._repo = repository

    async def get_by_id_or_raise(self, id: str) -> DocT:
        document = await self._repo.get_by_id(id)
        if document is None:
            raise NotFoundException(f"Resource with id '{id}' not found.")
        return document

    async def list(self, params: PaginationParams) -> tuple[list[DocT], int]:
        return await self._repo.get_all(params)

    async def delete(self, id: str) -> None:
        deleted = await self._repo.delete(id)
        if not deleted:
            raise NotFoundException(f"Resource with id '{id}' not found.")
