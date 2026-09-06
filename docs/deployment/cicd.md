# CI/CD Pipeline Strategy — Ideas Portal

## Pipeline Overview

```
 Push / PR
    │
    ├── frontend/**  ──► Frontend CI (.github/workflows/frontend-ci.yml)
    │                       Lint + Type Check
    │                       Unit Tests
    │                       Production Build
    │                       Docker Build
    │
    └── backend/**   ──► Backend CI (.github/workflows/backend-ci.yml)
                            Lint (ruff) + Format Check
                            Type Check (mypy)
                            Unit + Integration Tests (real Mongo)
                            Docker Build
```

## Branch Protection Rules

| Branch | Required checks before merge |
|--------|------------------------------|
| `main` | All CI checks + 1 reviewer approval + deploy gate |
| `develop` | All CI checks + 1 reviewer approval |
| `feature/*` | CI linting pass |

## Environments

| GitHub Environment | Deploys from | Approval required |
|--------------------|-------------|-------------------|
| `development` | `develop` branch | No |
| `uat` | `develop` branch | No |
| `production` | `main` branch | Yes (manual gate) |

## Docker Image Strategy

| Image | Registry | Tag strategy |
|-------|----------|-------------|
| `ideas-portal-frontend` | Azure Container Registry | `<git-sha>`, `latest` (on main) |
| `ideas-portal-backend` | Azure Container Registry | `<git-sha>`, `latest` (on main) |

## Future Phases (Phase 2+)

- [ ] ACR push on merge to `develop` / `main`
- [ ] Deploy to Azure Container Apps (UAT environment)
- [ ] Deploy to Azure Container Apps (Production) with manual gate
- [ ] Smoke tests post-deploy
- [ ] Slack / Teams notifications on deploy success/failure
- [ ] Dependabot for automated dependency updates
