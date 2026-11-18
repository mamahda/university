#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

CALLER_HOST_IP=${HOST_IP-}
. "$ROOT/config/environment.env"
[ -n "$CALLER_HOST_IP" ] && HOST_IP=$CALLER_HOST_IP

APP=${1:?Usage: smoke-test.sh APP}
URL="http://$APP.$HOST_IP.sslip.io/"

echo "Testing $URL"
curl -fsS "$URL"
printf '\n'
