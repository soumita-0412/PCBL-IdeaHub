"""
Domain exception hierarchy.

Raise domain exceptions in service / repository layers.
The global exception handler in middleware converts them to
the appropriate HTTP responses.
"""

from http import HTTPStatus


class AppException(Exception):
    """Base class for all application exceptions."""

    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR
    default_message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class NotFoundException(AppException):
    status_code = HTTPStatus.NOT_FOUND
    default_message = "The requested resource was not found."


class ConflictException(AppException):
    status_code = HTTPStatus.CONFLICT
    default_message = "A conflict occurred with the current state of the resource."


class ValidationException(AppException):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    default_message = "Validation failed."

    def __init__(self, message: str | None = None, field_errors: dict[str, list[str]] | None = None) -> None:
        super().__init__(message)
        self.field_errors = field_errors or {}


class UnauthorizedException(AppException):
    status_code = HTTPStatus.UNAUTHORIZED
    default_message = "Authentication is required."


class ForbiddenException(AppException):
    status_code = HTTPStatus.FORBIDDEN
    default_message = "You do not have permission to perform this action."


class ServiceUnavailableException(AppException):
    status_code = HTTPStatus.SERVICE_UNAVAILABLE
    default_message = "A downstream service is currently unavailable."
