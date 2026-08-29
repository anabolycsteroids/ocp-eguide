#!/usr/bin/env bash
# OCP e-Guide — one-click startup
# Run: bash start-ocp.sh
set -e

PROJECT_DIR="/mnt/c/Users/unknown/Downloads/project assets"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/freebuff-frontend"

cd "$PROJECT_DIR"

echo "=== OCP e-Guide Startup ==="

# 1. Docker (PostgreSQL + Redis)
echo "[1/4] Starting Docker containers..."
cd "$BACKEND_DIR"
docker compose up -d --wait 2>/dev/null || docker compose up -d
sleep 3

# 2. Database migrations
echo "[2/4] Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null

# 3. Backend
echo "[3/4] Starting backend on :5000..."
screen -S ocp-backend -X quit 2>/dev/null || true
screen -dmS ocp-backend npx tsx src/server.ts

# 4. Frontend (production mode)
echo "[4/4] Starting frontend on :3000..."
screen -S ocp-frontend -X quit 2>/dev/null || true
cd "$FRONTEND_DIR"
if [ ! -d ".next" ]; then
  echo "       First run — building..."
  npm run build
fi
HOSTNAME=0.0.0.0 screen -dmS ocp-frontend npx next start -p 3000

echo ""
echo "=== Done! ==="
echo "  Local:    http://localhost:3000"
echo "  LAN:      http://192.168.1.2:3000"
echo ""
echo "  Stop all: screen -S ocp-backend -X quit && screen -S ocp-frontend -X quit"
