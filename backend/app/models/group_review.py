"""
GroupReview MongoDB document model.

One record is created each time the management panel submits a group review
on a manager-approved idea, capturing all scoring criteria, the decision,
and a reference back to the manager who originally approved the idea.
"""

from typing import Annotated, Optional

from beanie import Indexed

from app.models.base import BaseDocument


class GroupReview(BaseDocument):
    # ── Idea reference ──────────────────────────────────
    idea_id: Annotated[str, Indexed()]
    submission_number: str
    manager_approval_id: Annotated[str, Indexed()]

    # ── Idea snapshot ───────────────────────────────────
    category: str
    problem: str
    idea_description: str
    additional_info: Optional[str] = None
    annual_estimate: Optional[float] = None

    # ── Employee who raised the idea ────────────────────
    employee_name: str
    employee_email: Annotated[str, Indexed()]

    # ── Manager who approved at L1 ──────────────────────
    manager_who_approved_name: str
    manager_who_approved_email: str

    # ── Scoring ─────────────────────────────────────────
    criteria_scores: dict[str, int]
    weighted_score: float

    # ── Decision ────────────────────────────────────────
    decision: str                   # "approved" | "held" | "declined"
    qualitative_feedback: Optional[str] = None

    # ── L2 reviewer identity ────────────────────────────
    reviewed_by: str
    reviewed_by_name: str
    reviewed_by_email: str

    class Settings:
        name = "group_reviews"
        use_state_management = True
        validate_on_save = True
