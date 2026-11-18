#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
EXP=${1:?Usage: collect-experiment.sh /path/to/results/experiment-id [APP_NAME]}
APP=${2-}

CALLER_HOST_IP=${HOST_IP-}; CALLER_PROM=${PROMETHEUS_URL-}; CALLER_NS=${NAMESPACE-}
. "$ROOT/config/environment.env"
[ -n "$CALLER_HOST_IP" ] && HOST_IP=$CALLER_HOST_IP
[ -n "$CALLER_PROM" ] && PROMETHEUS_URL=$CALLER_PROM
[ -n "$CALLER_NS" ] && NAMESPACE=$CALLER_NS
PROMETHEUS_URL=${PROMETHEUS_URL:-http://prometheus.${HOST_IP}.sslip.io}

[ -f "$EXP/measurement-window.env" ] || { echo "Missing measurement-window.env" >&2; exit 1; }
[ -f "$EXP/workload.csv" ] || { echo "Missing workload.csv" >&2; exit 1; }
[ -f "$EXP/metadata.json" ] || { echo "Missing metadata.json" >&2; exit 1; }

set -- python3 "$ROOT/collector/collect.py" \
  --experiment "$EXP" \
  --prometheus-url "$PROMETHEUS_URL" \
  --namespace "$NAMESPACE" \
  --queries "$ROOT/queries/metrics.env"
[ -n "$APP" ] && set -- "$@" --app "$APP"
"$@"
