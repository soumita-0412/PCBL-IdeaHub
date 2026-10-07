from app.models.category import CommitteePerson
from app.models.category_committee import CategoryCommittee
from app.repositories.base import BaseRepository


class CategoryCommitteeRepository(BaseRepository[CategoryCommittee]):
    def __init__(self) -> None:
        super().__init__(CategoryCommittee)

    async def find_by_category_name(self, category_name: str) -> CategoryCommittee | None:
        return await CategoryCommittee.find_one(
            CategoryCommittee.category_name == category_name
        )

    async def upsert(
        self,
        category_name: str,
        committee_lead: CommitteePerson | None,
        committee_members: list[CommitteePerson],
    ) -> CategoryCommittee:
        existing = await self.find_by_category_name(category_name)
        if existing:
            existing.committee_lead = committee_lead
            existing.committee_members = committee_members
            await existing.save()
            return existing
        doc = CategoryCommittee(
            category_name=category_name,
            committee_lead=committee_lead,
            committee_members=committee_members,
        )
        await doc.insert()
        return doc

    async def delete_by_category_name(self, category_name: str) -> None:
        existing = await self.find_by_category_name(category_name)
        if existing:
            await existing.delete()
