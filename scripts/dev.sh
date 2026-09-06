#!/usr/bin/env bash
# ============================================================
# IDEAS PORTAL — Quick Dev Launcher
# Starts MongoDB + backend + frontend with a single command.
# Usage: bash scripts/dev.sh
# ============================================================

set -euo pipefail

echo "[dev] Starting Ideas Portal (Docker Compose dev mode)…"
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build "$@"
