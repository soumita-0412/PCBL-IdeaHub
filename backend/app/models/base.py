"""
Base Beanie Document that all domain models inherit from.

Provides:
  - auto-generated MongoDB ObjectId as `id`
  - `created_at` / `updated_at` timestamps (UTC)
  - `created_by` / `updated_by` tracking (Entra OID)
"""

from datetime import UTC, datetime

from beanie import Document
from pydantic import Field


class BaseDocument(Document):
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    created_by: str = ""
    updated_by: str = ""

    class Settings:
        use_state_management = True
        validate_on_save = True

    async def save_with_actor(self, actor_oid: str) -> "BaseDocument":
        """Save the document, stamping the actor's OID onto audit fields."""
        now = datetime.now(UTC)
        if not self.created_by:
            self.created_by = actor_oid
        self.updated_by = actor_oid
        self.updated_at = now
        await self.save()
        return self
