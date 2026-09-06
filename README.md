# Ideas Portal

> Enterprise Idea Submission & Management Platform — RP-Sanjiv Goenka Group

---

## Overview

Ideas Portal is a full-stack enterprise-grade application that enables employees to submit, collaborate on, and track ideas across the organisation. It is built on a modern, scalable monorepo architecture.

---

## Technology Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Frontend       | Next.js 15, React 19, TypeScript, Tailwind CSS  |
| UI Components  | ShadCN UI                                       |
| State / Forms  | TanStack Query, React Hook Form, Zod            |
| Authentication | Microsoft Entra ID (Azure AD) via MSAL          |
| Backend        | Python 3.12, FastAPI, Pydantic V2               |
| ODM            | Beanie (Motor / MongoDB)                        |
| Database       | MongoDB                                         |
| Containerisation | Docker, Docker Compose                        |
| CI/CD          | GitHub Actions                                  |

---

## Monorepo Structure

```
Ideas_Portal/
├── frontend/          Next.js 15 application
├── backend/           FastAPI application
├── docs/              Architecture, API, and deployment documentation
├── infrastructure/    Docker, Nginx, and IaC configuration
├── scripts/           Developer utility scripts
├── .github/           GitHub Actions CI/CD workflows
├── docker-compose.yml Orchestration for all services
├── .env.example       Root environment variable template
├── .editorconfig      Consistent editor formatting rules
└── README.md          This file
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 20 LTS
- Python ≥ 3.12
- Docker Desktop (with Compose v2)
- Git

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd Ideas_Portal

cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

Fill in the required values in each `.env` file.

### 2. Start with Docker Compose (recommended)

```bash
docker compose up --build
```

| Service   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:8000  |
| API Docs  | http://localhost:8000/docs |
| MongoDB   | mongodb://localhost:27017 |

### 3. Start services individually (manual)

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Development Environments

| Environment | Purpose                        | Config File            |
|-------------|--------------------------------|------------------------|
| development | Local developer machines       | `.env` + overrides     |
| uat         | User Acceptance Testing        | `.env.uat`             |
| production  | Live enterprise deployment     | Managed via CI/CD      |

---

## Branch Strategy

| Branch         | Purpose                           |
|----------------|-----------------------------------|
| `main`         | Production-ready code             |
| `develop`      | Integration branch                |
| `feature/*`    | Feature development               |
| `fix/*`        | Bug fixes                         |
| `release/*`    | Release preparation               |

---

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Frontend Standards](docs/standards/frontend.md)
- [Backend Standards](docs/standards/backend.md)
- [Environment Configuration](docs/deployment/environment-strategy.md)
- [CI/CD Pipeline](docs/deployment/cicd.md)

---

## Contributing

1. Create a feature branch from `develop`.
2. Follow the coding standards in `docs/standards/`.
3. Ensure all tests pass locally before raising a PR.
4. PRs require at least one approval before merging.

---

## License

Internal use only — RP-Sanjiv Goenka Group. All rights reserved.
