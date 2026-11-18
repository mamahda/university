#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RESULTS=${1:-${RESULTS_DIR:-../cloud-dynamics-experiments/results}}
OUT=${2:-"$ROOT/outputs/campaign"}
"$ROOT/.venv/bin/python" "$ROOT/analysis/analyze.py" campaign --results "$RESULTS" --output "$OUT"
