#!/usr/bin/env bash
set -euo pipefail

PIDFILE="/tmp/qemu-workshop-cpu-load.pid"

if [[ ! -f "$PIDFILE" ]]; then
  echo "No workshop CPU-load PID file found."
  exit 0
fi

PID="$(cat "$PIDFILE")"

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "Stopped CPU load PID $PID."
else
  echo "Process $PID is no longer running."
fi

rm -f "$PIDFILE"
