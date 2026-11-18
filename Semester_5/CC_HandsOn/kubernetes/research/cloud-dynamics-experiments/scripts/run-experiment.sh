#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CONFIG="$ROOT_DIR/config/experiment.env"

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 scenarios/<scenario>.env" >&2
    exit 2
fi

SCENARIO=$1
case "$SCENARIO" in
    /*) ;;
    *) SCENARIO="$ROOT_DIR/$SCENARIO" ;;
esac

[ -f "$CONFIG" ] || { echo "Missing $CONFIG" >&2; exit 1; }
[ -f "$SCENARIO" ] || { echo "Missing scenario: $SCENARIO" >&2; exit 1; }

# Preserve caller overrides for the most commonly overridden values.
CALLER_HOST_IP=${HOST_IP-}
CALLER_TARGET_URL=${TARGET_URL-}
CALLER_TARGET_HOST=${TARGET_HOST-}
CALLER_REPLICATE=${REPLICATE-}

. "$CONFIG"
. "$SCENARIO"

[ -n "$CALLER_HOST_IP" ] && HOST_IP=$CALLER_HOST_IP
[ -n "$CALLER_TARGET_URL" ] && TARGET_URL=$CALLER_TARGET_URL
[ -n "$CALLER_TARGET_HOST" ] && TARGET_HOST=$CALLER_TARGET_HOST
[ -n "$CALLER_REPLICATE" ] && REPLICATE=$CALLER_REPLICATE

HOST_IP=${HOST_IP:-127.0.0.1}
TARGET_HOST=${TARGET_HOST:-app.${HOST_IP}.sslip.io}
TARGET_URL=${TARGET_URL:-${TARGET_SCHEME:-http}://${TARGET_HOST}${TARGET_PATH:-/}}

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
EXPERIMENT_ID=${PROFILE}-${STAMP}-r${REPLICATE:-1}
OUT="$ROOT_DIR/results/$EXPERIMENT_ID"
mkdir -p "$OUT"

cp "$CONFIG" "$OUT/experiment.env"
cp "$SCENARIO" "$OUT/scenario.env"

LOG="$OUT/run.log"
# The runner writes major events to stdout; detailed workload data are in workload.csv.
# A simple run header is preserved without requiring non-POSIX process substitution.
{
  echo "started_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "experiment_id=$EXPERIMENT_ID"
  echo "profile=$PROFILE"
  echo "target_url=$TARGET_URL"
} > "$LOG"

echo "Experiment ID : $EXPERIMENT_ID"
echo "Profile       : $PROFILE"
echo "Target        : $TARGET_URL"
echo "Result        : $OUT"

"$ROOT_DIR/scripts/check-environment.sh"

echo "Warm-up: ${WARMUP_SECONDS}s at ${WARMUP_RPS} RPS"
python3 "$ROOT_DIR/loadgen/loadgen.py" \
    --url "$TARGET_URL" \
    --profile constant \
    --duration "$WARMUP_SECONDS" \
    --rps "$WARMUP_RPS" \
    --timeout "$REQUEST_TIMEOUT" \
    --sample-interval "$SAMPLE_INTERVAL" \
    --discard-output

MEASUREMENT_START_EPOCH=$(date +%s)
echo "Measurement starts: $MEASUREMENT_START_EPOCH"

ARGS="--url $TARGET_URL --profile $PROFILE --duration $DURATION --timeout $REQUEST_TIMEOUT --sample-interval $SAMPLE_INTERVAL --output $OUT/workload.csv"

case "$PROFILE" in
  constant)
    set -- --rps "$RPS"
    ;;
  ramp)
    set -- --start-rps "$START_RPS" --end-rps "$END_RPS"
    ;;
  burst)
    set -- --base-rps "$BASE_RPS" --burst-rps "$BURST_RPS" --burst-start "$BURST_START" --burst-duration "$BURST_DURATION"
    ;;
  periodic)
    set -- --min-rps "$MIN_RPS" --max-rps "$MAX_RPS" --period-seconds "$PERIOD_SECONDS"
    ;;
  variable)
    set -- --min-rps "$MIN_RPS" --max-rps "$MAX_RPS" --change-interval "$CHANGE_INTERVAL" --seed "$SEED"
    ;;
  *)
    echo "ERROR: unsupported PROFILE=$PROFILE" >&2
    exit 1
    ;;
esac

# shellcheck disable=SC2086
python3 "$ROOT_DIR/loadgen/loadgen.py" $ARGS "$@"

MEASUREMENT_END_EPOCH=$(date +%s)
echo "Measurement ends: $MEASUREMENT_END_EPOCH"

cat > "$OUT/measurement-window.env" <<EOF
EXPERIMENT_ID=$EXPERIMENT_ID
MEASUREMENT_START_EPOCH=$MEASUREMENT_START_EPOCH
MEASUREMENT_END_EPOCH=$MEASUREMENT_END_EPOCH
SAMPLE_INTERVAL=$SAMPLE_INTERVAL
EOF

python3 - "$OUT/metadata.json" <<PY
import json, platform
meta = {
  "experiment_id": "$EXPERIMENT_ID",
  "profile": "$PROFILE",
  "target_url": "$TARGET_URL",
  "host_ip": "$HOST_IP",
  "measurement_start_epoch": int("$MEASUREMENT_START_EPOCH"),
  "measurement_end_epoch": int("$MEASUREMENT_END_EPOCH"),
  "sample_interval_seconds": float("$SAMPLE_INTERVAL"),
  "warmup_seconds": int("$WARMUP_SECONDS"),
  "cooldown_seconds": int("$COOLDOWN_SECONDS"),
  "replicate": int("${REPLICATE:-1}"),
  "application": {
    "name": "${APPLICATION_NAME:-unspecified}",
    "architecture": "${APPLICATION_ARCHITECTURE:-unspecified}",
    "replicas": "${REPLICAS:-unspecified}",
    "cpu_request": "${CPU_REQUEST:-unspecified}",
    "cpu_limit": "${CPU_LIMIT:-unspecified}",
    "memory_request": "${MEMORY_REQUEST:-unspecified}",
    "memory_limit": "${MEMORY_LIMIT:-unspecified}"
  },
  "runtime": {"python": platform.python_version(), "platform": platform.platform()}
}
with open("$OUT/metadata.json", "w") as f:
    json.dump(meta, f, indent=2)
PY

echo "Cool-down: ${COOLDOWN_SECONDS}s"
sleep "$COOLDOWN_SECONDS"

echo "Completed: $EXPERIMENT_ID"
echo "Measurement window: $OUT/measurement-window.env"
