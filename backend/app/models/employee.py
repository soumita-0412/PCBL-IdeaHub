"""
Employee MongoDB document model.

Mirrors the user profile loaded from the pickle store.
Populated/upserted on first successful login so there's
a persistent record in the database for reporting and audit.
"""

from datetime import UTC, datetime
from typing import Annotated, Optional

from beanie import Indexed
from pydantic import EmailStr, Field

from app.models.base import BaseDocument


class Employee(BaseDocument):
    employee_id: Annotated[str, Indexed(unique=True)]
    name: str
    email: Annotated[str, Indexed(unique=True)]
    department: str = ""
    function: str = ""
    location: str = ""
    manager: str = ""
    role: str
    is_active: bool = True
    last_login: Optional[datetime] = None

    class Settings:
        name = "employees"
        use_state_management = True
        validate_on_save = True
