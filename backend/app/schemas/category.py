"""
Request / response schemas for the Categories API.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class MatrixOptionIn(BaseModel):
    label: str = Field(min_length=1)
    weight: int = Field(ge=0, le=100)


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1)
    department: str = ""
    matrix: list[MatrixOptionIn] = []


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    department: str | None = None
    matrix: list[MatrixOptionIn] | None = None


class MatrixOptionOut(BaseModel):
    label: str
    weight: int


class CategoryResponse(BaseModel):
    id: str
    name: str
    department: str
    matrix: list[MatrixOptionOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
