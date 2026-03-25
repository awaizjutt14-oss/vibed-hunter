#!/bin/zsh
set -euo pipefail

ROOT_DIR="/Users/awaizhassanhanjra/Documents/New project/content-hunter-ai"
PID_FILE="$ROOT_DIR/.content-hunter-dev.pid"
WORKER_PID_FILE="$ROOT_DIR/.content-hunter-worker.pid"

cd "$ROOT_DIR"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" || true
    echo "Stopped app process $PID"
  fi
  rm -f "$PID_FILE"
fi

if [ -f "$WORKER_PID_FILE" ]; then
  PID="$(cat "$WORKER_PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" || true
    echo "Stopped worker process $PID"
  fi
  rm -f "$WORKER_PID_FILE"
fi

echo "Done."
echo "Press Enter to close this window."
read
