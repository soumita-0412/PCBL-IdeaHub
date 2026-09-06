#!/usr/bin/env bash
# ============================================================
# IDEAS PORTAL — Developer Setup Script
# Run once after cloning to bootstrap the local environment.
# Usage: bash scripts/setup.sh
# ============================================================

set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

info()    { echo -e "${GREEN}[INFO]${RESET}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }
heading() { echo -e "\n${BOLD}$*${RESET}"; }

heading "=== Ideas Portal — Local Setup ==="

# ── Check prerequisites ────────────────────────────────────
heading "1. Checking prerequisites…"

command -v node  >/dev/null 2>&1 || error "Node.js >= 20 is required"
command -v python3 >/dev/null 2>&1 || error "Python >= 3.12 is required"
command -v docker >/dev/null 2>&1 || error "Docker is required"
command -v git   >/dev/null 2>&1 || error "Git is required"

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
[ "$NODE_VER" -ge 20 ] || error "Node.js >= 20 required (found v${NODE_VER})"
info "Node.js: $(node -v)  Python: $(python3 --version)  Docker: $(docker --version | cut -d' ' -f3)"

# ── Copy environment files ─────────────────────────────────
heading "2. Copying environment templates…"

[ -f .env ]                     || { cp .env.example .env;                       info "Created .env"; }
[ -f frontend/.env.local ]      || { cp frontend/.env.local.example frontend/.env.local; info "Created frontend/.env.local"; }
[ -f backend/.env ]             || { cp backend/.env.example backend/.env;       info "Created backend/.env"; }

# ── Frontend dependencies ──────────────────────────────────
heading "3. Installing frontend dependencies…"
(cd frontend && npm install)
info "Frontend dependencies installed."

# ── Backend virtual environment ────────────────────────────
heading "4. Setting up Python virtual environment…"
(
  cd backend
  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install --upgrade pip setuptools wheel
  pip install -r requirements.txt
)
info "Backend virtual environment ready at backend/.venv"

# ── Done ───────────────────────────────────────────────────
heading "=== Setup complete! ==="
echo ""
echo "  Start everything:   docker compose up --build"
echo "  Frontend only:      cd frontend && npm run dev"
echo "  Backend only:       cd backend && source .venv/bin/activate && uvicorn main:app --reload"
echo ""
warn "Fill in .env, frontend/.env.local, and backend/.env, then run: cd backend && python scripts/seed_users.py"
