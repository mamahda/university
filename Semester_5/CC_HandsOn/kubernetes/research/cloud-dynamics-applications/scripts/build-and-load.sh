#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

CALLER_CLUSTER_NAME=${CLUSTER_NAME-}
CALLER_NAMESPACE=${NAMESPACE-}
. "$ROOT/config/environment.env"
[ -n "$CALLER_CLUSTER_NAME" ] && CLUSTER_NAME=$CALLER_CLUSTER_NAME
[ -n "$CALLER_NAMESPACE" ] && NAMESPACE=$CALLER_NAMESPACE

APP=${1:-all}

build_one() {
  n=$1
  echo "Building cloud-dynamics/$n:latest"
  docker build -t "cloud-dynamics/$n:latest" "$ROOT/apps/$n"
  echo "Loading image into kind cluster: $CLUSTER_NAME"
  kind load docker-image "cloud-dynamics/$n:latest" --name "$CLUSTER_NAME"
}

if [ "$APP" = all ]; then
  for n in stateless-api cpu-bound memory-stateful database-api cache-api microservices; do
    build_one "$n"
  done
else
  [ -d "$ROOT/apps/$APP" ] || {
    echo "Unknown application: $APP" >&2
    exit 1
  }
  build_one "$APP"
fi
