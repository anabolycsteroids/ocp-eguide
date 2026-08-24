#!/bin/bash
# =============================================================================
# OCP eGuide — one-command local development
# Starts: PostgreSQL (ephemeral-safe) + Backend API (5000) + Frontend dev (3000)
# Usage:  npm run dev:all     (from repository root)
# Stops:  Ctrl+C (shuts everything it started)
# =============================================================================
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="/tmp/pg-install/bin"
PGDATA="/tmp/pgdata"
CACHE="$ROOT/.local/cache"
mkdir -p "$CACHE" /tmp/opencode

log() { echo "[dev-all] $*"; }
fail() { echo "[dev-all] ERROR: $*" >&2; exit 1; }

command -v curl >/dev/null || fail "curl is required but not installed."
command -v node >/dev/null || fail "Node.js is required but not installed."

# ---------------------------------------------------------------- PostgreSQL
if [ ! -x "$PG_BIN/pg_ctl" ]; then
  log "PostgreSQL binaries missing (WSL /tmp wiped?) — restoring from cached Zonky..."
  JAR="$CACHE/zonky-pg16.jar"
  if [ ! -f "$JAR" ]; then
    log "Downloading Zonky PostgreSQL 16.4 (~35MB, one-time; cached in .local/cache)..."
    curl -fsSL -o "$JAR" \
      "https://repo1.maven.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-linux-amd64/16.4.0/embedded-postgres-binaries-linux-amd64-16.4.0.jar" \
      || fail "Could not download PostgreSQL binaries. Check internet connection."
  fi
  rm -rf /tmp/pg-install && mkdir -p /tmp/pg-install
  cd /tmp/pg-install
  python3 -m zipfile -e "$JAR" . 2>/dev/null || unzip -o -q "$JAR" || fail "Unzip failed (need python3 or unzip)."
  TXZ=$(find . -name "*.txz" | head -1)
  [ -n "$TXZ" ] || fail "Zonky archive did not contain a .txz payload."
  tar -xJf "$TXZ" || fail "Extraction failed (need xz support)."
  chmod +x bin/* 2>/dev/null
  cd "$ROOT"
fi

"$PG_BIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1 || {
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    log "Initializing fresh database cluster..."
    "$PG_BIN/initdb" -D "$PGDATA" -U postgres --auth=trust >/dev/null || fail "initdb failed."
  fi
  log "Starting PostgreSQL..."
  "$PG_BIN/pg_ctl" -D "$PGDATA" -l /tmp/pg.log start >/dev/null || fail "PostgreSQL failed to start (see /tmp/pg.log)."
  sleep 2
}

# Create database if missing (Zonky ships without psql → single-user mode)
DB_EXISTS=$("$PG_BIN/postgres" --single -D "$PGDATA" postgres <<'SQL' 2>/dev/null | grep -c ocp_eguide || true
SELECT datname FROM pg_database WHERE datname='ocp_eguide';
SQL
)
if [ "${DB_EXISTS:-0}" -eq 0 ]; then
  log "Creating database ocp_eguide..."
  "$PG_BIN/pg_ctl" -D "$PGDATA" stop >/dev/null 2>&1
  echo "CREATE DATABASE ocp_eguide;" | "$PG_BIN/postgres" --single -D "$PGDATA" postgres >/dev/null || fail "Database creation failed."
  "$PG_BIN/pg_ctl" -D "$PGDATA" -l /tmp/pg.log start >/dev/null || fail "PostgreSQL restart failed."
  sleep 1
fi
log "PostgreSQL: UP"

# ------------------------------------------------------------------- Backend
cd "$ROOT/backend"
[ -d node_modules ] || { log "Installing backend dependencies..."; npm ci --no-audit --fund=false || npm install --no-audit --fund=false || fail "backend npm install failed."; }
[ -f .env ] || { cp .env.example .env; log "Created backend/.env from example — adjust if needed."; }
[ -d prisma/migrations ] && npx prisma migrate deploy || npx prisma db push --skip-generate
log "Starting backend (dev) on :5000..."
npm run dev > /tmp/backend-dev.log 2>&1 &
BACKEND_PID=$!

# ------------------------------------------------------------------ Frontend
cd "$ROOT/freebuff-frontend"
[ -d node_modules ] || { log "Installing frontend dependencies..."; npm ci --no-audit --fund=false || npm install --no-audit --fund=false || fail "frontend npm install failed."; }
[ -f .env.local ] || { cp .env.example .env.local; log "Created frontend/.env.local from example."; }
log "Starting frontend (dev) on :3000..."
npm run dev > /tmp/frontend-dev.log 2>&1 &
FRONTEND_PID=$!

cleanup() {
  log "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
}
trap cleanup EXIT INT TERM

# -------------------------------------------------------------- Health check
sleep 6
curl -sf http://localhost:5000/api/health >/dev/null && log "Backend:  http://localhost:5000  ✓" \
  || log "Backend still booting — logs: /tmp/backend-dev.log"
log "Frontend: http://localhost:3000   (Next dev cold start ~10-20s)"
log "Map:      http://localhost:3000/map"
log "Press Ctrl+C to stop both servers."

wait
