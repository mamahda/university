#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CALLER_HOST_IP=${HOST_IP-}; CALLER_PROM=${PROMETHEUS_URL-}
. "$ROOT/config/environment.env"
[ -n "$CALLER_HOST_IP" ] && HOST_IP=$CALLER_HOST_IP
[ -n "$CALLER_PROM" ] && PROMETHEUS_URL=$CALLER_PROM
PROMETHEUS_URL=${PROMETHEUS_URL:-http://prometheus.${HOST_IP}.sslip.io}
echo "Prometheus: $PROMETHEUS_URL"
curl -fsS "$PROMETHEUS_URL/-/ready" >/dev/null
echo "OK: Prometheus is ready."
