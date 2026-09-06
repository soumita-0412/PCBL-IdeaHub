"""
FastAPI dependencies for database access.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database


async def get_db() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    """Yield the shared Motor database instance."""
    return get_database()
