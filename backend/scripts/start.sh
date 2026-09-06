#!/usr/bin/env bash
# Backend entrypoint used by Docker production image.
set -euo pipefail
exec gunicorn main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WORKERS:-2}" \
  --access-logfile - \
  --error-logfile -
