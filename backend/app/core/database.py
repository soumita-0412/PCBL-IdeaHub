"""
MongoDB connection management via Motor + Beanie ODM.

`init_db()` is called in the FastAPI lifespan handler.
All document models are registered here once Business modules
are added in Phase 1+.
"""

import structlog
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = structlog.get_logger(__name__)

_client: AsyncIOMotorClient | None = None  # type: ignore[type-arg]


def get_client() -> AsyncIOMotorClient:  # type: ignore[type-arg]
    if _client is None:
        raise RuntimeError("Database not initialised. Call init_db() first.")
    return _client


def get_database() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    return get_client()[settings.MONGODB_DATABASE]


async def init_db() -> None:
    global _client
    _client = AsyncIOMotorClient(
        str(settings.MONGODB_URL),
        minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
        maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
        serverSelectionTimeoutMS=settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    )
    await init_beanie(
        database=_client[settings.MONGODB_DATABASE],
        document_models=[
            # Phase 1+: register Beanie Document models here
            # e.g. Idea, User, Comment
        ],
    )
    logger.info("database.connected", database=settings.MONGODB_DATABASE)


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("database.disconnected")
