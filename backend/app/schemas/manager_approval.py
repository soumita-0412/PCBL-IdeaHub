"""
Request / response schemas for the Manager Approvals API.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ManagerApprovalResponse(BaseModel):
    id: str
    idea_id: str
    submission_number: str
    category: str
    problem: str
    idea_description: str
    additional_info: Optional[str]
    annual_estimate: Optional[float]
    employee_name: str
    employee_email: str
    decision: str
    reviewer_comment: Optional[str]
    reviewed_by: str
    reviewed_by_name: str
    reviewed_by_email: str
    created_at: datetime

    model_config = {"from_attributes": True}
