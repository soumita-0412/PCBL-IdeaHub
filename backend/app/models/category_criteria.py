"""
CategoryCriteria MongoDB document model.

Stores the scoring criteria, their weights, and committee assignment for a
specific category. Maintained automatically by the category service.
"""

from typing import Annotated

from beanie import Indexed
from pydantic import BaseModel, Field

from app.models.base import BaseDocument
from app.models.category import CommitteePerson


class CriteriaItem(BaseModel):
    label: str = Field(min_length=1)
    weight: int = Field(ge=0, le=100)


class CategoryCriteria(BaseDocument):
    category_id: Annotated[str, Indexed(unique=True)]
    category_name: str
    criteria: list[CriteriaItem]
    committee_lead: CommitteePerson | None = None
    committee_members: list[CommitteePerson] = []

    class Settings:
        name = "category_criteria"
        use_state_management = True
        validate_on_save = True
