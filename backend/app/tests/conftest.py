"""
pytest configuration and shared fixtures.

Database fixtures use an in-memory Mongomock or a real test
MongoDB instance controlled by the MONGODB_URL env var.
"""

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(scope="session")
def test_client() -> TestClient:
    from main import app
    return TestClient(app, raise_server_exceptions=True)


@pytest.fixture(scope="session")
async def async_client() -> AsyncClient:
    from main import app
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        yield client
