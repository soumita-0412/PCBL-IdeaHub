"""
Base Pydantic schemas for request/response serialisation.

All schemas inherit from BaseSchema / BaseResponse.
Mongo ObjectId is serialised as a plain string.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BaseSchema(BaseModel):
    """Base schema for request bodies."""

    model_config = ConfigDict(
        populate_by_name=True,
        str_strip_whitespace=True,
        validate_assignment=True,
    )


class BaseResponse(BaseModel):
    """Base schema for all API responses."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    id: str
    created_at: datetime
    updated_at: datetime


class PaginatedResponse(BaseResponse):
    """Generic paginated list response envelope."""

    model_config = ConfigDict(populate_by_name=True)


class PaginationMeta(BaseModel):
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1)
    has_next: bool
    has_prev: bool


class PaginatedList(BaseModel):
    """Typed paginated list wrapper. Use with Generic[T] in concrete schemas."""

    meta: PaginationMeta
