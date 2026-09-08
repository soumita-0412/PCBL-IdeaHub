"""
Repository for Idea documents — all MongoDB I/O for ideas lives here.
"""

from app.models.idea import Idea, IdeaStatus
from app.repositories.base import BaseRepository


class IdeaRepository(BaseRepository[Idea]):
    def __init__(self) -> None:
        super().__init__(Idea)

    async def find_by_submitter(self, submitter_id: str) -> list[Idea]:
        return await Idea.find(Idea.submitter_id == submitter_id).sort("-created_at").to_list()

    async def find_by_status(self, status: IdeaStatus) -> list[Idea]:
        return await Idea.find(Idea.status == status).sort("-created_at").to_list()

    async def find_by_function(self, pcbl_function: str) -> list[Idea]:
        return await Idea.find(Idea.pcbl_function == pcbl_function).sort("-created_at").to_list()

    async def find_all(self) -> list[Idea]:
        return await Idea.find_all().sort("-created_at").to_list()

    async def next_submission_number(self) -> str:
        count = await Idea.count()
        return f"IDEA-{count + 1:05d}"
