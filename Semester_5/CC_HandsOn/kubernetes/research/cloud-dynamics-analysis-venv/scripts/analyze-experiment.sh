#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
EXP=${1:?Usage: analyze-experiment.sh EXPERIMENT_DIR}
OUT=${2:-"$ROOT/outputs/$(basename "$EXP")"}
"$ROOT/.venv/bin/python" "$ROOT/analysis/analyze.py" experiment --experiment "$EXP" --output "$OUT"
