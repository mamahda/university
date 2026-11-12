#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$ROOT_DIR/config/experiment.env"

HOST_IP=${HOST_IP:-127.0.0.1}
TARGET_HOST=${TARGET_HOST:-app.${HOST_IP}.sslip.io}
TARGET_URL=${TARGET_URL:-${TARGET_SCHEME:-http}://${TARGET_HOST}${TARGET_PATH:-/}}
REQUEST_TIMEOUT=${REQUEST_TIMEOUT:-5}

for cmd in python3 curl; do
    command -v "$cmd" >/dev/null 2>&1 || {
        echo "ERROR: required command not found: $cmd" >&2
        exit 1
    }
done

echo "Target: $TARGET_URL"
if curl -fsS --max-time "$REQUEST_TIMEOUT" "$TARGET_URL" >/dev/null; then
    echo "OK: target is reachable."
else
    echo "ERROR: target is not reachable: $TARGET_URL" >&2
    exit 1
fi
