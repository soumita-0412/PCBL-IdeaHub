"""
Repository for Category documents — all MongoDB I/O for categories lives here.
"""

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self) -> None:
        super().__init__(Category)

    async def find_all_sorted(self) -> list[Category]:
        return await Category.find().sort("+name").to_list()

    async def find_by_name(self, name: str) -> Category | None:
        return await Category.find_one(Category.name == name)

    async def total_count(self) -> int:
        return await Category.count()
