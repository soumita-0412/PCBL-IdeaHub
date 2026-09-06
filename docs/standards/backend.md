# Backend Coding Standards — Ideas Portal

## Naming Conventions

| Artefact | Convention | Example |
|----------|-----------|---------|
| Modules | snake_case | `idea_repository.py` |
| Classes | PascalCase | `class IdeaService` |
| Functions / methods | snake_case | `def get_by_id` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TITLE_LENGTH = 200` |
| Pydantic schemas | PascalCase + Create/Update/Response suffix | `IdeaCreateSchema` |
| Beanie documents | PascalCase, no suffix | `class Idea(BaseDocument)` |
| Dependencies | snake_case verbs | `get_current_user`, `get_db` |

## Layer Rules

### API Layer (`app/api/v1/endpoints/`)
- Routers **only** handle HTTP: parse body, validate with Pydantic, call a service, return a response schema.
- No business logic. No direct DB calls.
- Inject dependencies via `Depends()`.

```python
@router.post("/", response_model=IdeaResponse, status_code=201)
async def create_idea(
    body: IdeaCreateSchema,
    claims: TokenClaims = Depends(get_current_user),
    service: IdeaService = Depends(get_idea_service),
) -> IdeaResponse:
    return await service.create(body, actor=claims.user_id)
```

### Service Layer (`app/services/`)
- Owns all business rules, validations, and orchestration.
- Accepts and returns **Pydantic schemas** (never Beanie documents to callers).
- Raises `AppException` subclasses on errors.
- Never imports from `app/api/`.

```python
class IdeaService(BaseService[Idea, IdeaCreateSchema, IdeaUpdateSchema]):
    async def create(self, data: IdeaCreateSchema, actor: str) -> IdeaResponse:
        idea = Idea(**data.model_dump(), created_by=actor)
        created = await self._repo.create(idea)
        return IdeaResponse.model_validate(created)
```

### Repository Layer (`app/repositories/`)
- Owns all MongoDB queries via Beanie/Motor.
- Returns Beanie Document instances (never raw dicts).
- No business logic.

### Schema Layer (`app/schemas/`)
- `XxxCreateSchema` — request body for POST.
- `XxxUpdateSchema` — request body for PUT/PATCH.
- `XxxResponse` — response model (inherits `BaseResponse`).

## Dependency Injection Pattern

```python
# app/dependencies/ideas.py
def get_idea_repository() -> IdeaRepository:
    return IdeaRepository()

def get_idea_service(
    repo: IdeaRepository = Depends(get_idea_repository),
) -> IdeaService:
    return IdeaService(repo)
```

Always inject services into routers — never instantiate them directly.

## Type Annotations

All public functions must be fully typed. Run `mypy` in strict mode.

```python
async def get_by_id(self, id: str) -> Idea | None:  # ✓
async def get_by_id(self, id):                       # ✗
```

## Error Handling

Raise domain exceptions in services; let the global handler convert them:

```python
raise NotFoundException(f"Idea '{id}' not found.")   # ✓
raise HTTPException(404, "not found")                 # ✗ (only in routers if unavoidable)
```

## Logging

Use `structlog` everywhere. Never use `print()`.

```python
logger = structlog.get_logger(__name__)
logger.info("idea.created", idea_id=str(idea.id), actor=actor)
```
