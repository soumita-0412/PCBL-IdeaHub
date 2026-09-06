"""
Repository for the Employee collection.

Extends BaseRepository with employee-specific queries.
"""

from datetime import UTC, datetime
from typing import Optional

from app.models.employee import Employee
from app.repositories.base import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self) -> None:
        super().__init__(Employee)

    async def find_by_email(self, email: str) -> Optional[Employee]:
        return await Employee.find_one(Employee.email == email)

    async def find_by_employee_id(self, employee_id: str) -> Optional[Employee]:
        return await Employee.find_one(Employee.employee_id == employee_id)

    async def update_last_login(self, employee_id: str) -> None:
        employee = await self.find_by_employee_id(employee_id)
        if employee:
            employee.last_login = datetime.now(UTC)
            await employee.save()

    async def upsert_on_login(self, user_data: dict) -> Employee:
        """
        Create or refresh the employee record on successful login.

        Keeps MongoDB in sync with the pickle store without
        requiring a separate sync job.
        """
        existing = await self.find_by_employee_id(user_data["user_id"])
        now = datetime.now(UTC)

        if existing:
            existing.name = user_data["name"]
            existing.email = user_data["email"]
            existing.department = user_data.get("department", "")
            existing.function = user_data.get("function", "")
            existing.location = user_data.get("location", "")
            existing.manager = user_data.get("manager", "")
            existing.role = user_data["role"]
            existing.last_login = now
            await existing.save()
            return existing

        employee = Employee(
            employee_id=user_data["user_id"],
            name=user_data["name"],
            email=user_data["email"],
            department=user_data.get("department", ""),
            function=user_data.get("function", ""),
            location=user_data.get("location", ""),
            manager=user_data.get("manager", ""),
            role=user_data["role"],
            last_login=now,
        )
        await employee.insert()
        return employee
