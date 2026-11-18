#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

CALLER_NAMESPACE=${NAMESPACE-}
. "$ROOT/config/environment.env"
[ -n "$CALLER_NAMESPACE" ] && NAMESPACE=$CALLER_NAMESPACE

APP=${1:?Usage: remove.sh APP}

kubectl -n "$NAMESPACE" delete ingress "$APP" --ignore-not-found
kubectl delete -f "$ROOT/k8s/$APP.yaml" --ignore-not-found
