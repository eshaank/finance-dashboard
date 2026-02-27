# Finance Dashboard — task runner
# Usage: just <recipe>  (run `just --list` to see all recipes)

set dotenv-load := false

# Install all dependencies
setup:
    cd backend && uv sync --group dev
    cd frontend && npm install --legacy-peer-deps

# Run backend + frontend dev servers concurrently
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    trap 'kill 0' EXIT
    cd backend  && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    cd frontend && npm run dev &
    wait

# Run backend dev server only
dev-backend:
    cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run frontend dev server only
dev-frontend:
    cd frontend && npm run dev

# Run all tests
test: test-backend test-frontend

# Run backend tests
test-backend:
    cd backend && uv run pytest tests/ -v

# Run frontend tests
test-frontend:
    cd frontend && npx vitest run

# Lint + typecheck (mirrors CI)
check: check-backend check-frontend

# Backend lint
check-backend:
    cd backend && uv run ruff check .

# Frontend lint + typecheck
check-frontend:
    cd frontend && npm run lint
    cd frontend && npx tsc -b

# Production frontend build
build:
    cd frontend && npm run build

# Remove generated / cached files
clean:
    rm -rf frontend/node_modules frontend/dist
    rm -rf backend/.venv
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# Open a bash shell inside the running devcontainer (run from host)
shell:
    #!/usr/bin/env bash
    cid=$(docker ps | awk '/vsc-finance-dashboard/{print $1}' | head -1)
    if [ -z "$cid" ]; then
      echo "No running devcontainer found. Run: docker ps" >&2
      exit 1
    fi
    docker exec -it -w /workspaces/finance-dashboard "$cid" bash
