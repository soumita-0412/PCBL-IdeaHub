#!/usr/bin/env bash
# ============================================================
# IDEAS PORTAL — Lint All Services
# Run from the repo root: bash scripts/lint.sh
# ============================================================

set -euo pipefail

BOLD="\033[1m"
RESET="\033[0m"

heading() { echo -e "\n${BOLD}$*${RESET}"; }

heading "=== Linting Frontend ==="
(cd frontend && npm run lint && npm run type-check)

heading "=== Linting Backend ==="
(cd backend && .venv/bin/ruff check . && .venv/bin/mypy app --ignore-missing-imports)

echo -e "\n✓ All lint checks passed."
