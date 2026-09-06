# ============================================================
# IDEAS PORTAL — Backend Dockerfile (Multi-stage)
# Stage 1: base        — Python runtime + system deps
# Stage 2: development — hot-reload dev server
# Stage 3: production  — gunicorn + uvicorn workers
# ============================================================

ARG PYTHON_VERSION=3.12-slim

# ─── Stage 1: Base ─────────────────────────────────────────
FROM python:${PYTHON_VERSION} AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ─── Stage 2: Development ──────────────────────────────────
FROM base AS development

COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ─── Stage 3: Production ───────────────────────────────────
FROM base AS production

# Create non-root user
RUN groupadd --gid 1001 appgroup \
 && useradd --uid 1001 --gid appgroup --no-create-home appuser

COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 8000

# Use gunicorn + uvicorn workers in production
CMD ["gunicorn", "main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
