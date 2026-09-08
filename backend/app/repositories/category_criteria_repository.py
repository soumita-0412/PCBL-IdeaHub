"""
Repository for CategoryCriteria documents.
"""

from app.models.category_criteria import CategoryCriteria, CriteriaItem
from app.repositories.base import BaseRepository


class CategoryCriteriaRepository(BaseRepository[CategoryCriteria]):
    def __init__(self) -> None:
        super().__init__(CategoryCriteria)

    async def find_by_category_id(self, category_id: str) -> CategoryCriteria | None:
        return await CategoryCriteria.find_one(
            CategoryCriteria.category_id == category_id
        )

    async def find_all_sorted(self) -> list[CategoryCriteria]:
        return await CategoryCriteria.find().sort("+category_name").to_list()

    async def upsert(
        self,
        category_id: str,
        category_name: str,
        criteria: list[CriteriaItem],
    ) -> CategoryCriteria:
        existing = await self.find_by_category_id(category_id)
        if existing:
            existing.category_name = category_name
            existing.criteria = criteria
            await existing.save()
            return existing
        doc = CategoryCriteria(
            category_id=category_id,
            category_name=category_name,
            criteria=criteria,
        )
        await doc.insert()
        return doc

    async def delete_by_category_id(self, category_id: str) -> None:
        existing = await self.find_by_category_id(category_id)
        if existing:
            await existing.delete()
