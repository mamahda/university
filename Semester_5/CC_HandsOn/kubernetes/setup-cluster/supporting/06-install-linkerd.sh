#!/bin/sh

set -eu

. ./variables.sh

# ============================================================
# CONFIGURATION
# ============================================================

HOST_IP="${HOST_IP:-127.0.0.1}"

LINKERD_NAMESPACE="${LINKERD_NAMESPACE:-linkerd}"
VIZ_NAMESPACE="${VIZ_NAMESPACE:-linkerd-viz}"

INGRESS_CLASS="${INGRESS_CLASS:-nginx}"

LINKERD_HOST="${LINKERD_HOST:-linkerd.${HOST_IP}.sslip.io}"
LINKERD_URL="http://${LINKERD_HOST}"
LINKERD_URL="http://${LINKERD_HOST}:${INGRESS_HTTP_PORT}"

LINKERD2_VERSION="${LINKERD2_VERSION:-edge-26.9.3}"

PATH="$HOME/.linkerd2/bin:$PATH"
export PATH


# ============================================================
# HELPER FUNCTIONS
# ============================================================

section()
{
    echo
    echo "============================================================"
    echo "$1"
    echo "============================================================"
}


need()
{
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "ERROR: required command '$1' was not found."
        exit 1
    fi
}


# ============================================================
# 1. CHECK REQUIREMENTS
# ============================================================

section "1. Check requirements"

need kubectl
need curl

echo "Current Kubernetes context:"
kubectl config current-context

echo
echo "Cluster information:"
kubectl cluster-info

echo
echo "Nodes:"
kubectl get nodes


# ============================================================
# 2. CHECK NGINX INGRESS
# ============================================================

section "2. Check nginx ingress"

echo "Ingress classes:"
kubectl get ingressclass

if ! kubectl get ingressclass "${INGRESS_CLASS}" >/dev/null 2>&1; then
    echo
    echo "ERROR:"
    echo "IngressClass '${INGRESS_CLASS}' was not found."
    exit 1
fi


# ============================================================
# 3. INSTALL LINKERD CLI
# ============================================================

section "3. Install Linkerd CLI"

if command -v linkerd >/dev/null 2>&1; then
    echo "Linkerd CLI already installed."
else
    echo "Installing Linkerd CLI:"
    echo "  ${LINKERD2_VERSION}"

    export LINKERD2_VERSION

    curl \
        --proto '=https' \
        --tlsv1.2 \
        -sSfL \
        https://run.linkerd.io/install-edge \
        | sh

    PATH="$HOME/.linkerd2/bin:$PATH"
    export PATH
fi

echo
linkerd version || true


# ============================================================
# 4. CHECK LINKERD PREREQUISITES
# ============================================================

section "4. Check Linkerd prerequisites"

echo "Gateway API CRDs:"
kubectl get crd \
    | grep gateway.networking.k8s.io \
    || true

echo
echo "Running pre-install validation..."

if ! linkerd check --pre; then
    echo
    echo "ERROR:"
    echo "Linkerd prerequisite validation failed."
    echo
    echo "Check:"
    echo "  - Kubernetes version"
    echo "  - Gateway API CRDs"
    echo "  - permissions"
    exit 1
fi


# ============================================================
# 5. INSTALL LINKERD CRDS
# ============================================================

section "5. Install Linkerd CRDs"

linkerd install --crds \
    | kubectl apply -f -


# ============================================================
# 6. INSTALL LINKERD CONTROL PLANE
# ============================================================

section "6. Install Linkerd control plane"

if kubectl get deployment \
    linkerd-destination \
    -n "${LINKERD_NAMESPACE}" \
    >/dev/null 2>&1; then

    echo "Existing Linkerd control plane detected."
    echo "Skipping control-plane installation."

else

    linkerd install \
        | kubectl apply -f -

fi


# ============================================================
# 7. VERIFY LINKERD CONTROL PLANE
# ============================================================

section "7. Verify Linkerd"

linkerd check

echo
echo "Linkerd pods:"
kubectl get pods \
    -n "${LINKERD_NAMESPACE}"


# ============================================================
# 8. INSTALL LINKERD VIZ
# ============================================================

section "8. Install Linkerd Viz"

if kubectl get deployment \
    web \
    -n "${VIZ_NAMESPACE}" \
    >/dev/null 2>&1; then

    echo "Existing Linkerd Viz detected."
    echo "Skipping Viz installation."

else

    echo "Installing Linkerd Viz..."

    linkerd viz install \
        | kubectl apply -f -

fi


# ============================================================
# 9. WAIT FOR VIZ
# ============================================================

section "9. Wait for Linkerd Viz"

kubectl rollout status \
    deployment/web \
    -n "${VIZ_NAMESPACE}" \
    --timeout=180s

kubectl rollout status \
    deployment/metrics-api \
    -n "${VIZ_NAMESPACE}" \
    --timeout=180s

echo
echo "Viz pods:"
kubectl get pods \
    -n "${VIZ_NAMESPACE}"

echo
echo "Viz services:"
kubectl get svc \
    -n "${VIZ_NAMESPACE}"


# ============================================================
# 10. DISCOVER VIZ WEB SERVICE PORT
# ============================================================

section "10. Discover Linkerd Viz web service"

if ! kubectl get svc web \
    -n "${VIZ_NAMESPACE}" \
    >/dev/null 2>&1; then

    echo "ERROR:"
    echo "Linkerd Viz web service does not exist."
    exit 1
fi


LINKERD_WEB_PORT=$(
    kubectl get svc web \
        -n "${VIZ_NAMESPACE}" \
        -o jsonpath='{.spec.ports[0].port}'
)


echo "Linkerd Viz service port:"
echo "  ${LINKERD_WEB_PORT}"


# ============================================================
# 11. CREATE VIZ INGRESS
# ============================================================

section "11. Configure Linkerd Viz ingress"

#
# IMPORTANT:
#
# Linkerd Viz rejects arbitrary Host headers by default for
# DNS-rebinding protection.
#
# nginx therefore rewrites the upstream Host header to:
#
#   web.linkerd-viz.svc.cluster.local:8084
#
# which is accepted by the default Linkerd Viz configuration.
#

UPSTREAM_HOST="web.${VIZ_NAMESPACE}.svc.cluster.local:${LINKERD_WEB_PORT}"


echo "External hostname:"
echo "  ${LINKERD_HOST}"

echo
echo "Upstream Host header:"
echo "  ${UPSTREAM_HOST}"


cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: linkerd-viz
  namespace: ${VIZ_NAMESPACE}

  annotations:
    nginx.ingress.kubernetes.io/upstream-vhost: "${UPSTREAM_HOST}"

spec:

  ingressClassName: ${INGRESS_CLASS}

  rules:

  - host: ${LINKERD_HOST}

    http:

      paths:

      - path: /
        pathType: Prefix

        backend:

          service:
            name: web

            port:
              number: ${LINKERD_WEB_PORT}
EOF


# ============================================================
# 12. VERIFY INGRESS CONFIGURATION
# ============================================================

section "12. Verify Linkerd Viz ingress"

kubectl get ingress \
    linkerd-viz \
    -n "${VIZ_NAMESPACE}" \
    -o wide


echo
echo "Ingress annotation:"

kubectl get ingress \
    linkerd-viz \
    -n "${VIZ_NAMESPACE}" \
    -o jsonpath='{.metadata.annotations.nginx\.ingress\.kubernetes\.io/upstream-vhost}'

echo


# ============================================================
# 13. VERIFY DNS
# ============================================================

section "13. Verify sslip.io DNS"

echo "Hostname:"
echo "  ${LINKERD_HOST}"

echo
echo "DNS result:"

getent hosts "${LINKERD_HOST}" \
    || true


# ============================================================
# 14. TEST LINKERD VIZ WEB ENDPOINT
# ============================================================

section "14. Test Linkerd Viz web endpoint"

echo "Testing:"
echo "  ${LINKERD_URL}"

echo

if curl \
    --silent \
    --fail \
    --max-time 10 \
    "${LINKERD_URL}" \
    >/dev/null; then

    echo "Linkerd Viz is reachable."

else

    echo "WARNING:"
    echo "Linkerd Viz is not yet reachable."
    echo
    echo "Check:"
    echo
    echo "  kubectl get ingress -n ${VIZ_NAMESPACE}"
    echo "  kubectl get svc -n ${VIZ_NAMESPACE}"
    echo "  kubectl get pods -n ${VIZ_NAMESPACE}"
    echo

fi


# ============================================================
# 15. VERIFY LINKERD VIZ
# ============================================================

section "15. Verify Linkerd Viz"

linkerd viz check \
    || true


# ============================================================
# 16. FINAL STATUS
# ============================================================

section "16. Linkerd installation status"

echo "Control plane:"
kubectl get pods \
    -n "${LINKERD_NAMESPACE}"

echo
echo "Viz:"
kubectl get pods \
    -n "${VIZ_NAMESPACE}"

echo
echo "Viz ingress:"
kubectl get ingress \
    -n "${VIZ_NAMESPACE}"


# ============================================================
# 17. FINAL INFORMATION
# ============================================================

section "Linkerd + Viz installation completed"

cat <<EOF

Linkerd control plane:

  namespace:
    ${LINKERD_NAMESPACE}


Linkerd Viz:

  namespace:
    ${VIZ_NAMESPACE}


Web dashboard:

  ${LINKERD_URL}


Ingress route:

  Browser

      Host:
      ${LINKERD_HOST}

          |
          v

  nginx ingress

      rewrites Host to:

      ${UPSTREAM_HOST}

          |
          v

  web.${VIZ_NAMESPACE}.svc

          |
          v

  Linkerd Viz


Useful verification commands:

  linkerd check

  linkerd viz check

  kubectl get pods -n ${LINKERD_NAMESPACE}

  kubectl get pods -n ${VIZ_NAMESPACE}

  kubectl get svc -n ${VIZ_NAMESPACE}

  kubectl get ingress -n ${VIZ_NAMESPACE}


Verify nginx upstream host:

  kubectl get ingress linkerd-viz \\
    -n ${VIZ_NAMESPACE} \\
    -o jsonpath='{.metadata.annotations.nginx\\.ingress\\.kubernetes\\.io/upstream-vhost}'


Expected value:

  ${UPSTREAM_HOST}


Open dashboard:

  ${LINKERD_URL}



EOF
