#!/bin/sh
set -eu
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

for s in constant ramp burst periodic variable; do
    echo "=== Running $s ==="
    "$ROOT_DIR/scripts/run-experiment.sh" "scenarios/$s.env"
done
