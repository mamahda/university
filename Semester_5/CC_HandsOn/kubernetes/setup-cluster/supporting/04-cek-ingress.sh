#!/bin/sh

. ./variables.sh

set -eu

kubectl wait --namespace ingress-nginx \
	  --for=condition=ready pod \
	    --selector=app.kubernetes.io/component=controller \
	      --timeout=90s

echo "Checking ingress host port..."

HTTP_CODE="$(
    curl --noproxy '*' -sS \
        -o /dev/null \
        -w '%{http_code}' \
        --max-time 10 \
        -H "Host: ingress-test.${HOST_IP}.sslip.io" \
        "http://${HOST_IP}:${INGRESS_HTTP_PORT}/"
)"

case "$HTTP_CODE" in
    200|301|302|308|404)
        echo "Ingress HTTP reachable (status: $HTTP_CODE)"
        ;;
    *)
        echo "Ingress HTTP check failed (status: $HTTP_CODE)"
        exit 1
        ;;
esac

