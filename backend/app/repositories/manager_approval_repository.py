"""
Repository for ManagerApproval documents.
"""

from app.models.manager_approval import ManagerApproval
from app.repositories.base import BaseRepository


class ManagerApprovalRepository(BaseRepository[ManagerApproval]):
    def __init__(self) -> None:
        super().__init__(ManagerApproval)

    async def find_all(self) -> list[ManagerApproval]:
        return await ManagerApproval.find_all().sort("-created_at").to_list()

    async def find_by_employee_email(self, email: str) -> list[ManagerApproval]:
        return (
            await ManagerApproval.find(ManagerApproval.employee_email == email)
            .sort("-created_at")
            .to_list()
        )

    async def find_by_decision(self, decision: str) -> list[ManagerApproval]:
        return (
            await ManagerApproval.find(ManagerApproval.decision == decision)
            .sort("-created_at")
            .to_list()
        )

    async def find_by_idea(self, idea_id: str) -> list[ManagerApproval]:
        return (
            await ManagerApproval.find(ManagerApproval.idea_id == idea_id)
            .sort("-created_at")
            .to_list()
        )
