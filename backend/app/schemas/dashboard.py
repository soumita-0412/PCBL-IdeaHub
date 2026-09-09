from datetime import datetime

from pydantic import BaseModel


class MonthlyCount(BaseModel):
    month: str
    year: int
    count: int


class FunnelItem(BaseModel):
    category: str
    submitted: int
    l1_approved: int
    l2_approved: int


class DashboardStats(BaseModel):
    total_submitted: int
    manager_approved: int
    group_approved: int
    implemented: int
    monthly_submissions: list[MonthlyCount]
    by_function_funnel: list[FunnelItem]


class RecentIdeaItem(BaseModel):
    id: str
    submission_number: str
    idea_title: str | None
    category: str
    submitter_name: str
    status: str
    l1_decision: str | None
    l2_score: float | None
    created_at: datetime


class PaginatedIdeas(BaseModel):
    items: list[RecentIdeaItem]
    total: int
    page: int
    pages: int
