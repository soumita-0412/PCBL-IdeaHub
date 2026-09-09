"""
API v1 root router.

Business routers are registered here; mount this router in
main.py with prefix /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ideas import router as ideas_router
from app.api.v1.group_reviews import router as group_reviews_router
from app.api.v1.manager_approvals import router as manager_approvals_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(ideas_router)
api_router.include_router(categories_router)
api_router.include_router(manager_approvals_router)
api_router.include_router(group_reviews_router)
api_router.include_router(dashboard_router)
