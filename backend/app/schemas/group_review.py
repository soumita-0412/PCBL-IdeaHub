"""
Request / response schemas for the Group Reviews API.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GroupReviewResponse(BaseModel):
    id: str
    idea_id: str
    submission_number: str
    manager_approval_id: str
    category: str
    problem: str
    idea_description: str
    additional_info: Optional[str]
    annual_estimate: Optional[float]
    employee_name: str
    employee_email: str
    manager_who_approved_name: str
    manager_who_approved_email: str
    criteria_scores: dict[str, int]
    weighted_score: float
    decision: str
    qualitative_feedback: Optional[str]
    reviewed_by: str
    reviewed_by_name: str
    reviewed_by_email: str
    created_at: datetime

    model_config = {"from_attributes": True}
