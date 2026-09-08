"""
Request / response schemas for the Ideas API.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.idea import IdeaStatus


class IdeaCreate(BaseModel):
    """Payload sent by the frontend when submitting an idea."""

    category: str
    problem: str = Field(max_length=250)
    idea_description: str = Field(max_length=500)
    patent_search_done: bool = False
    patent_link: Optional[str] = None
    pcbl_function: str
    pcbl_function_other: Optional[str] = None
    annual_estimate: Optional[float] = None
    additional_info: Optional[str] = Field(default=None, max_length=250)


class IdeaResponse(BaseModel):
    """Shape returned to the client after creating or fetching an idea."""

    id: str
    submission_number: str
    status: IdeaStatus
    category: str
    problem: str
    idea_description: str
    patent_search_done: bool
    patent_link: Optional[str]
    pcbl_function: str
    pcbl_function_other: Optional[str]
    annual_estimate: Optional[float]
    additional_info: Optional[str]
    submitter_id: str
    submitter_name: str
    submitter_email: str
    reviewer_comment: Optional[str]
    l2_scores: Optional[dict[str, int]]
    l2_comment: Optional[str]
    l2_weighted_score: Optional[float]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IdeaListItem(BaseModel):
    """Compact shape used in list endpoints."""

    id: str
    submission_number: str
    status: IdeaStatus
    category: str
    pcbl_function: str
    submitter_name: str
    submitter_email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class IdeaStats(BaseModel):
    """Aggregated counts for the current user's ideas."""

    total: int
    in_review: int
    approved: int


class IdeaReviewUpdate(BaseModel):
    """Payload for a reviewer approving or rejecting an idea."""

    status: IdeaStatus
    reviewer_comment: Optional[str] = Field(default=None, max_length=1000)


class IdeaL2ReviewUpdate(BaseModel):
    """Payload for L2 group scoring and decision."""

    status: IdeaStatus
    l2_scores: dict[str, int]
    l2_weighted_score: float
    l2_comment: Optional[str] = Field(default=None, max_length=2000)
