#!/bin/zsh
set -euo pipefail

ROOT_DIR="/Users/awaizhassanhanjra/Documents/New project/content-hunter-ai"
APP_HOST="0.0.0.0"
APP_PORT=""
APP_URL=""
PID_FILE="$ROOT_DIR/.content-hunter-dev.pid"
WORKER_PID_FILE="$ROOT_DIR/.content-hunter-worker.pid"
DEV_SCHEMA="prisma/schema.dev.prisma"

cd "$ROOT_DIR"

cleanup_stale_app_port() {
  local running_pid=""
  if [ -f "$PID_FILE" ]; then
    running_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  fi

  local port_pids
  port_pids="$(lsof -tiTCP:$APP_PORT -sTCP:LISTEN 2>/dev/null || true)"

  if [ -z "$port_pids" ]; then
    return
  fi

  for pid in ${(f)port_pids}; do
    if [ -n "$running_pid" ] && [ "$pid" = "$running_pid" ] && kill -0 "$pid" 2>/dev/null; then
      continue
    fi

    echo "Stopping stale app process on port $APP_PORT (PID $pid)..."
    kill "$pid" 2>/dev/null || true
  done

  sleep 1
}

find_free_port() {
  for port in 50000 50010 50020 50030 50040 50050 50060 50070 50080 50090 50100 50200 50300 50400 50500 50600 50700 50800 50900 51000; do
    if ! lsof -tiTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
  done
  # last resort random high port
  python3 - <<'PY'
import socket
s=socket.socket()
s.bind(("",0))
print(s.getsockname()[1])
PY
}

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

USE_DOCKER="false"
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    USE_DOCKER="true"
  fi
fi

if [ "$USE_DOCKER" = "true" ]; then
  export DEV_NO_DOCKER="false"
  echo "Docker detected. Starting Postgres and Redis..."
  docker compose up -d postgres redis
  PRISMA_GENERATE_CMD="npm run prisma:generate"
  PRISMA_MIGRATE_CMD="npm run prisma:migrate"
  PRISMA_SEED_CMD="npm run prisma:seed"
else
  export DEV_NO_DOCKER="true"
  export DATABASE_URL="file:./dev.db"
  echo "Docker not found. Using no-Docker dev mode with SQLite."
  PRISMA_GENERATE_CMD="npm run prisma:generate:dev"
  PRISMA_MIGRATE_CMD=npx\ prisma\ db\ push\ --schema\ $DEV_SCHEMA
  PRISMA_SEED_CMD="npm run prisma:seed:dev"
fi

echo "Generating Prisma client..."
eval "$PRISMA_GENERATE_CMD"

echo "Preparing database..."
eval "$PRISMA_MIGRATE_CMD"

echo "Seeding demo data..."
eval "$PRISMA_SEED_CMD"

cleanup_stale_app_port

APP_PORT="$(find_free_port)"
APP_URL="http://127.0.0.1:${APP_PORT}"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "App already running at $APP_URL"
else
  echo "Starting Next.js app..."
  nohup npm run dev -- --hostname "$APP_HOST" --port "$APP_PORT" > "$ROOT_DIR/.content-hunter-dev.log" 2>&1 &
  echo $! > "$PID_FILE"
fi

if [ "$USE_DOCKER" = "true" ]; then
  if [ -f "$WORKER_PID_FILE" ] && kill -0 "$(cat "$WORKER_PID_FILE")" 2>/dev/null; then
    echo "Worker already running."
  else
    echo "Starting worker..."
    nohup npm run jobs:worker > "$ROOT_DIR/.content-hunter-worker.log" 2>&1 &
    echo $! > "$WORKER_PID_FILE"
  fi
else
  echo "Skipping worker startup in no-Docker dev mode."
fi

sleep 4
open "$APP_URL" || true

echo ""
echo "Content Hunter AI is starting."
echo "App URL: $APP_URL"
echo "Mode: $( [ "$USE_DOCKER" = "true" ] && echo "Docker/Postgres/Redis" || echo "No-Docker SQLite dev mode" )"
echo "Log files:"
echo "  $ROOT_DIR/.content-hunter-dev.log"
echo "  $ROOT_DIR/.content-hunter-worker.log"
echo ""
echo "Use stop.command to stop the app and worker."
echo "Press Enter to close this window."
read
