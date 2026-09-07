"""
Idea MongoDB document model.

Stores every submitted idea along with the submitter's identity
(taken from the JWT at submission time, not from the form body).
"""

from enum import Enum
from typing import Annotated, Optional

from beanie import Indexed
from pydantic import Field

from app.models.base import BaseDocument


class IdeaStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW_L1 = "under_review_l1"
    APPROVED_L1 = "approved_l1"
    REJECTED_L1 = "rejected_l1"
    UNDER_REVIEW_L2 = "under_review_l2"
    APPROVED_L2 = "approved_l2"
    REJECTED_L2 = "rejected_l2"
    IMPLEMENTED = "implemented"


class Idea(BaseDocument):
    # ── Submission identity ─────────────────────────────────
    submission_number: Annotated[str, Indexed(unique=True)]
    submitter_id: Annotated[str, Indexed()]
    submitter_name: str
    submitter_email: Annotated[str, Indexed()]

    # ── Step 1: Category ────────────────────────────────────
    category: str

    # ── Step 2: Describe ────────────────────────────────────
    problem: str = Field(max_length=250)
    idea_description: str = Field(max_length=500)
    patent_search_done: bool = False
    patent_link: Optional[str] = None
    pcbl_function: str
    pcbl_function_other: Optional[str] = None
    annual_estimate: Optional[float] = None
    additional_info: Optional[str] = Field(default=None, max_length=250)

    # ── Workflow state ──────────────────────────────────────
    status: IdeaStatus = IdeaStatus.SUBMITTED

    class Settings:
        name = "ideas"
        use_state_management = True
        validate_on_save = True
