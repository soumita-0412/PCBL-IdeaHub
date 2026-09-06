"""
Re-exports the canonical exception handlers from app.core.exception_handlers.

Kept here for import-path backward compatibility.
"""

from app.core.exception_handlers import app_exception_handler, unhandled_exception_handler

__all__ = ["app_exception_handler", "unhandled_exception_handler"]
