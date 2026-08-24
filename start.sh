#!/bin/bash
export PATH="/tmp/pg-install/bin:$PATH"

echo "=== OCP eGuide ==="

# Start PostgreSQL
pg_ctl -D /tmp/pgdata status >/dev/null 2>&1 || {
  echo "Starting PostgreSQL..."
  pg_ctl -D /tmp/pgdata -l /tmp/pg.log start
  sleep 2
}
pg_isready -h /tmp >/dev/null 2>&1 && echo "PostgreSQL: UP" || echo "PostgreSQL: DOWN"

# Start Backend
curl -s http://localhost:5000/api/health >/dev/null 2>&1 || {
  echo "Starting Backend..."
  cd "/mnt/c/Users/unknown/Downloads/project assets/backend"
  screen -dmS backend bash -c 'export PATH="/tmp/pg-install/bin:$PATH" && node dist/server.js > /tmp/backend.log 2>&1'
  sleep 3
}
curl -s http://localhost:5000/api/health >/dev/null 2>&1 && echo "Backend:     UP (http://localhost:5000)" || echo "Backend:     DOWN"

# Start Frontend
curl -s http://localhost:3000 >/dev/null 2>&1 || {
  echo "Starting Frontend..."
  fuser -k 3000/tcp 2>/dev/null
  sleep 1
  screen -dmS frontend bash -c 'cd "/mnt/c/Users/unknown/Downloads/project assets/freebuff-frontend" && npx next start -p 3000 > /tmp/frontend.log 2>&1'
  sleep 15
}
curl -s http://localhost:3000 >/dev/null 2>&1 && echo "Frontend:    UP (http://localhost:3000)" || echo "Frontend:    DOWN"

echo ""
echo "Open: http://localhost:3000"
