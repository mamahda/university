#!/usr/bin/env bash
# Run INSIDE a guest VM to generate one CPU-intensive process.
# Stop it with:
#   kill "$(cat /tmp/qemu-workshop-cpu-load.pid)"

set -euo pipefail

PIDFILE="/tmp/qemu-workshop-cpu-load.pid"

if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "CPU load is already running with PID $(cat "$PIDFILE")."
  exit 0
fi

yes > /dev/null &
echo "$!" > "$PIDFILE"

echo "CPU load started with PID $!"
echo "Stop it with:"
echo "  kill \$(cat $PIDFILE)"
