#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

CALLER_HOST_IP=${HOST_IP-}
CALLER_NAMESPACE=${NAMESPACE-}
. "$ROOT/config/environment.env"
[ -n "$CALLER_HOST_IP" ] && HOST_IP=$CALLER_HOST_IP
[ -n "$CALLER_NAMESPACE" ] && NAMESPACE=$CALLER_NAMESPACE

APP=${1:?Usage: deploy.sh APP}

case "$APP" in
  stateless-api|cpu-bound|memory-stateful|database-api|cache-api|microservices) ;;
  *) echo "Unknown application: $APP" >&2; exit 1 ;;
esac

kubectl apply -f "$ROOT/k8s/namespace.yaml"
kubectl apply -f "$ROOT/k8s/$APP.yaml"

sed \
  -e "s/APP_NAME/$APP/g" \
  -e "s/HOST_IP/$HOST_IP/g" \
  "$ROOT/k8s/ingress-template.yaml" | kubectl apply -f -

kubectl -n "$NAMESPACE" rollout status deployment/"$APP" --timeout=180s

echo
echo "Application : $APP"
echo "HOST_IP     : $HOST_IP"
echo "URL         : http://$APP.$HOST_IP.sslip.io/"
