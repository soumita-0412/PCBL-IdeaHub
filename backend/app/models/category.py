"""
Category MongoDB document model.

Each category stores its name, an optional scoring matrix, and optional
committee assignment (one lead, up to five members) used for idea review.
"""

from typing import Annotated

from beanie import Indexed
from pydantic import BaseModel, Field

from app.models.base import BaseDocument


class MatrixOption(BaseModel):
    label: str = Field(min_length=1)
    weight: int = Field(ge=0, le=100)


class CommitteePerson(BaseModel):
    user_id: str
    name: str
    email: str


class Category(BaseDocument):
    name: Annotated[str, Indexed(unique=True)]
    department: str = ""
    matrix: list[MatrixOption] = []
    committee_lead: CommitteePerson | None = None
    committee_members: list[CommitteePerson] = []

    class Settings:
        name = "categories"
        use_state_management = True
        validate_on_save = True
