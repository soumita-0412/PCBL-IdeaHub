"""
ManagerApproval MongoDB document model.

One record is created each time a manager approves or rejects an idea,
storing a snapshot of the idea details alongside the decision.
"""

from typing import Annotated, Optional

from beanie import Indexed

from app.models.base import BaseDocument


class ManagerApproval(BaseDocument):
    # ── Idea reference ──────────────────────────────────
    idea_id: Annotated[str, Indexed()]
    submission_number: Annotated[str, Indexed()]

    # ── Idea snapshot ───────────────────────────────────
    category: str
    idea_title: Optional[str] = None
    problem: str
    idea_description: str
    benefit: Optional[str] = None
    additional_info: Optional[str] = None
    annual_estimate: Optional[float] = None

    # ── Employee who raised the idea ────────────────────
    employee_name: str
    employee_email: Annotated[str, Indexed()]

    # ── Decision ────────────────────────────────────────
    decision: str              # "approved" | "rejected"
    reviewer_comment: Optional[str] = None
    reviewed_by: str           # reviewer's user_id
    reviewed_by_name: str      # reviewer's display name
    reviewed_by_email: str     # reviewer's email

    # ── L2 tracking ─────────────────────────────────────
    l2_reviewed: bool = False  # set True once group review is submitted

    class Settings:
        name = "manager_approvals"
        use_state_management = True
        validate_on_save = True
