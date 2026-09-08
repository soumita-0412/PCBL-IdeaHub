"""
Category MongoDB document model.

Each category stores its name and an optional scoring matrix —
a list of weighted criteria used to evaluate ideas in that category.
"""

from typing import Annotated

from beanie import Indexed
from pydantic import BaseModel, Field

from app.models.base import BaseDocument


class MatrixOption(BaseModel):
    label: str = Field(min_length=1)
    weight: int = Field(ge=0, le=100)


class Category(BaseDocument):
    name: Annotated[str, Indexed(unique=True)]
    department: str = ""
    matrix: list[MatrixOption] = []

    class Settings:
        name = "categories"
        use_state_management = True
        validate_on_save = True
