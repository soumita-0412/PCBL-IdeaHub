# Architecture Overview — Ideas Portal

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
│              Next.js 15 + React 19 (TypeScript)                  │
│   MSAL Auth │ TanStack Query │ Zustand │ React Hook Form + Zod   │
└────────────────────────────┬─────────────────────────────────────┘
                             │  HTTPS (Bearer JWT)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API Gateway / Nginx                           │
│           Reverse proxy — TLS termination, routing               │
└──────┬─────────────────────────────────────┬─────────────────────┘
       │  /api/*                             │  /*
       ▼                                     ▼
┌──────────────────┐                ┌───────────────────┐
│  FastAPI Backend │                │  Next.js Frontend  │
│  Python 3.12     │                │  Standalone server │
│                  │                └───────────────────┘
│  ┌────────────┐  │
│  │ API Layer  │  │  ◄── Validates JWT (Azure AD JWKS)
│  │ (v1/)      │  │
│  ├────────────┤  │
│  │ Services   │  │  ◄── Business logic
│  ├────────────┤  │
│  │ Repos      │  │  ◄── Data access (Beanie ODM)
│  ├────────────┤  │
│  │ Models     │  │  ◄── MongoDB Documents
│  └────────────┘  │
└──────┬───────────┘
       │  Motor (async)
       ▼
┌──────────────────┐
│    MongoDB 7.0   │
└──────────────────┘
       │
       ▼ (server-to-server)
┌──────────────────────────────┐
│  Microsoft Entra ID          │
│  Azure AD + Graph API        │
│  JWKS endpoint (JWT verify)  │
└──────────────────────────────┘
```

## Layer Responsibilities

| Layer | Responsibility | May Call |
|-------|---------------|----------|
| API (routers) | HTTP parsing, validation, auth | Services |
| Services | Business rules, orchestration | Repositories, Integrations |
| Repositories | All DB I/O | Beanie/Motor |
| Models | MongoDB document shape | — |
| Schemas | Pydantic request/response serialisation | — |
| Dependencies | FastAPI DI — auth, pagination, DB | Services, Repositories |
| Integrations | External systems (Graph API, Storage) | httpx |
| Middleware | Cross-cutting concerns (logging, timing, CORS) | — |

## Authentication Flow

1. Browser requests MSAL redirect → Azure AD login page.
2. Azure AD returns id_token + access_token.
3. Frontend stores token in sessionStorage (MSAL default).
4. Each API request carries `Authorization: Bearer <access_token>`.
5. FastAPI `get_current_user` dependency fetches JWKS, validates signature, extracts claims.
6. Validated `TokenClaims` (OID, roles, scopes) are injected into every protected endpoint.

## Data Flow (Request lifecycle)

```
Request → Nginx → FastAPI
  → RequestIDMiddleware (attach X-Request-ID)
  → TimingMiddleware (start timer)
  → CORSMiddleware
  → Router (validate Pydantic schema)
  → Dependency injection (auth, pagination)
  → Service (business logic)
  → Repository (DB query)
  → Response serialised to Pydantic schema
  → TimingMiddleware (attach X-Process-Time header)
  → Response returned
```
