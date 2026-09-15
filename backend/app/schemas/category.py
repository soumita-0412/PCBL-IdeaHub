"""
Request / response schemas for the Categories API.
"""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class MatrixOptionIn(BaseModel):
    label: str = Field(min_length=1)
    weight: int = Field(ge=0, le=100)


class CommitteePersonIn(BaseModel):
    user_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    email: str = Field(min_length=1)


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1)
    department: str = ""
    matrix: list[MatrixOptionIn] = []
    committee_lead: CommitteePersonIn | None = None
    committee_members: list[CommitteePersonIn] = []

    @field_validator("committee_members")
    @classmethod
    def validate_committee_members(cls, v: list[CommitteePersonIn]) -> list[CommitteePersonIn]:
        if len(v) > 5:
            raise ValueError("Maximum 5 committee members allowed")
        user_ids = [m.user_id for m in v]
        if len(user_ids) != len(set(user_ids)):
            raise ValueError("Duplicate users in committee members are not allowed")
        return v


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    department: str | None = None
    matrix: list[MatrixOptionIn] | None = None
    committee_lead: CommitteePersonIn | None = None
    committee_members: list[CommitteePersonIn] | None = None

    @field_validator("committee_members")
    @classmethod
    def validate_committee_members(cls, v: list[CommitteePersonIn] | None) -> list[CommitteePersonIn] | None:
        if v is None:
            return v
        if len(v) > 5:
            raise ValueError("Maximum 5 committee members allowed")
        user_ids = [m.user_id for m in v]
        if len(user_ids) != len(set(user_ids)):
            raise ValueError("Duplicate users in committee members are not allowed")
        return v


class MatrixOptionOut(BaseModel):
    label: str
    weight: int


class CommitteePersonOut(BaseModel):
    user_id: str
    name: str
    email: str


class CategoryResponse(BaseModel):
    id: str
    name: str
    department: str
    matrix: list[MatrixOptionOut]
    committee_lead: CommitteePersonOut | None = None
    committee_members: list[CommitteePersonOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
