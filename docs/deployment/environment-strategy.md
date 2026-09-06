# Environment Configuration Strategy — Ideas Portal

## Environments

| Environment | Purpose | Trigger |
|-------------|---------|---------|
| `development` | Local developer machines | Manual / `docker compose up` |
| `uat` | User acceptance testing, stakeholder sign-off | Merge to `develop` branch |
| `production` | Live enterprise deployment | Merge to `main` + manual approval |

## Variable Strategy

### Separation of Concerns

| Type | Where stored | Example |
|------|-------------|---------|
| Non-sensitive config | `.env.example` committed to repo | `LOG_LEVEL`, `API_VERSION` |
| Secrets | CI/CD secrets, Azure Key Vault | `CLIENT_SECRET`, `MONGO_PASSWORD` |
| Per-environment values | CI/CD environment variables | `API_URL`, `TENANT_ID` |

### Frontend Variables

All browser-exposed variables are prefixed `NEXT_PUBLIC_`.

| Variable | dev | uat | prod |
|----------|-----|-----|------|
| `NEXT_PUBLIC_APP_ENV` | development | uat | production |
| `NEXT_PUBLIC_API_URL` | http://localhost:8000 | https://api-uat.ideas.internal | https://api.ideas.internal |
| `NEXT_PUBLIC_AZURE_CLIENT_ID` | dev-app-reg-client-id | uat-app-reg-client-id | prod-app-reg-client-id |
| `NEXT_PUBLIC_AZURE_TENANT_ID` | shared across envs | shared across envs | shared across envs |
| `NEXT_PUBLIC_AZURE_REDIRECT_URI` | http://localhost:3000 | https://ideas-uat.internal | https://ideas.internal |
| `NEXT_PUBLIC_ENABLE_DEVTOOLS` | true | false | false |
| `NEXT_PUBLIC_LOG_LEVEL` | debug | info | warn |

### Backend Variables

| Variable | dev | uat | prod |
|----------|-----|-----|------|
| `APP_ENV` | development | uat | production |
| `DEBUG` | true | false | false |
| `MONGODB_URL` | mongodb://localhost:27017/... | Atlas UAT connection | Atlas Prod connection |
| `AZURE_TENANT_ID` | shared | shared | shared |
| `AZURE_CLIENT_ID` | dev backend app reg | uat backend app reg | prod backend app reg |
| `JWT_AUDIENCE` | api://dev-backend-id | api://uat-backend-id | api://prod-backend-id |
| `LOG_LEVEL` | DEBUG | INFO | WARNING |
| `LOG_FORMAT` | console | json | json |
| `CORS_ORIGINS` | http://localhost:3000 | https://ideas-uat.internal | https://ideas.internal |
| `WORKERS` | 1 | 2 | 4 |

## Secret Management

### Local Development
Secrets live in `.env` / `.env.local` files (git-ignored). Developers copy from `*.example` files.

### CI/CD (GitHub Actions)
Secrets stored in GitHub repository/environment secrets:
- Per-environment secrets under **Environments** (dev, uat, production).
- Production environment requires manual approval gate before deploy.

### Production
Secrets injected at runtime from **Azure Key Vault** via managed identity.  
No secrets in Docker images or git history.

## .env File Hierarchy

```
project root
├── .env.example          ← committed — template for root/docker vars
├── frontend/
│   └── .env.local.example ← committed — template for Next.js vars
└── backend/
    └── .env.example      ← committed — template for FastAPI vars
```

Actual `.env` files are git-ignored and populated:
- **Locally**: copied from `*.example` and filled manually.
- **CI/CD**: written to disk from GitHub Actions secrets before build.
- **Production**: injected via Azure Key Vault or container environment variables.
