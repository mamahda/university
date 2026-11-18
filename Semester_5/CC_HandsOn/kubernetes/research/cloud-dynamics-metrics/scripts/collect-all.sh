#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RESULTS=${1:?Usage: collect-all.sh /path/to/cloud-dynamics-experiments/results}
found=0
for exp in "$RESULTS"/*; do
  [ -d "$exp" ] || continue
  [ -f "$exp/measurement-window.env" ] || continue
  found=1
  echo "=== $(basename "$exp") ==="
  "$ROOT/scripts/collect-experiment.sh" "$exp"
done
[ "$found" -eq 1 ] || { echo "No experiment directories found." >&2; exit 1; }
