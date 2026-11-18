#!/bin/sh
set -eu

. ./config/analysis.env

echo $RESULTS_DIR

export RESULTS_DIR HOST_IP
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
VENV="$ROOT/.venv"
[ -x "$VENV/bin/jupyter" ] || { echo "Run ./scripts/create-venv.sh first." >&2; exit 1; }
MODE=${JUPYTER_MODE:-lab}; PORT=${JUPYTER_PORT:-8888}
cd "$ROOT"
case "$MODE" in
 lab) exec "$VENV/bin/jupyter" lab --ip=0.0.0.0 --port="$PORT" --no-browser --ServerApp.root_dir="$ROOT" ;;
 notebook) exec "$VENV/bin/jupyter" notebook --ip=0.0.0.0 --port="$PORT" --no-browser --ServerApp.root_dir="$ROOT" ;;
 *) echo "JUPYTER_MODE must be lab or notebook" >&2; exit 1 ;;
esac
