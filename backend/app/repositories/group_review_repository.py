"""
Repository for GroupReview documents.
"""

from app.models.group_review import GroupReview
from app.repositories.base import BaseRepository


class GroupReviewRepository(BaseRepository[GroupReview]):
    def __init__(self) -> None:
        super().__init__(GroupReview)

    async def find_all(self) -> list[GroupReview]:
        return await GroupReview.find_all().sort("-created_at").to_list()

    async def find_by_idea(self, idea_id: str) -> list[GroupReview]:
        return (
            await GroupReview.find(GroupReview.idea_id == idea_id)
            .sort("-created_at")
            .to_list()
        )
