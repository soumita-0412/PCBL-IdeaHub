"""
API v1 root router.

Business routers are registered here; mount this router in
main.py with prefix /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(auth_router)

# Phase 2+: include domain routers here
# from app.api.v1 import ideas, users, comments
# api_router.include_router(ideas.router, prefix="/ideas", tags=["Ideas"])
