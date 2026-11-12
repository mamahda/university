#!/bin/sh

set -eu

. ./variables.sh

# ============================================================
# CONFIGURATION
# ============================================================

HOST_IP="${HOST_IP:-127.0.0.1}"

NETOBSERV_NAMESPACE="${NETOBSERV_NAMESPACE:-netobserv}"
CERT_MANAGER_NAMESPACE="${CERT_MANAGER_NAMESPACE:-cert-manager}"

INGRESS_CLASS="${INGRESS_CLASS:-nginx}"

NETOBSERV_HOST="${NETOBSERV_HOST:-netobserv.${HOST_IP}.sslip.io}"
NETOBSERV_URL="http://${NETOBSERV_HOST}"

# Empty = latest chart; pin for reproducible student environments
NETOBSERV_VERSION="${NETOBSERV_VERSION:-}"
CERT_MANAGER_VERSION="${CERT_MANAGER_VERSION:-}"

# 1 = every packet (accurate, costly); upstream default is 50
SAMPLING="${SAMPLING:-1}"

# false = metrics only (no raw flow table, coarser topology)
INSTALL_LOKI="${INSTALL_LOKI:-true}"

# Let an operator-managed Prometheus select NetObserv ServiceMonitors
PATCH_SM_SELECTOR="${PATCH_SM_SELECTOR:-true}"

# Console backend protocol on the ingress; switch to HTTPS on 502
NETOBSERV_BACKEND_PROTOCOL="${NETOBSERV_BACKEND_PROTOCOL:-HTTP}"

PROM_NAMESPACE="${PROM_NAMESPACE:-monitoring}"

# External Prometheus URL (browser, students, notebooks)
PROM_HOST="${PROM_HOST:-prometheus.${HOST_IP}.sslip.io}"
PROM_URL="${PROM_URL:-http://${PROM_HOST}}"

# In-cluster URLs used by the FlowCollector (auto-detected when empty).
# Pods cannot use PROM_URL when HOST_IP is 127.0.0.1: inside a pod,
# 127.0.0.1 is the pod itself, not the ingress.
PROM_INTERNAL_URL="${PROM_INTERNAL_URL:-}"
AM_URL="${AM_URL:-}"

# Expose Alertmanager through the ingress (basic auth)
EXPOSE_ALERTMANAGER="${EXPOSE_ALERTMANAGER:-true}"
ALERTMANAGER_NAMESPACE="${ALERTMANAGER_NAMESPACE:-${PROM_NAMESPACE}}"
ALERTMANAGER_SERVICE="${ALERTMANAGER_SERVICE:-alertmanager-operated}"

ALERTMANAGER_HOST="${ALERTMANAGER_HOST:-alertmanager.${HOST_IP}.sslip.io}"
ALERTMANAGER_URL="http://${ALERTMANAGER_HOST}"

ALERTMANAGER_USER="${ALERTMANAGER_USER:-admin}"
# Empty = generate a random password and print it at the end
ALERTMANAGER_PASSWORD="${ALERTMANAGER_PASSWORD:-}"

NETOBSERV_URL="http://${NETOBSERV_HOST}:${INGRESS_HTTP_PORT}"
PROM_URL="${PROM_URL:-http://${PROM_HOST}:${INGRESS_HTTP_PORT}}"
ALERTMANAGER_URL="http://${ALERTMANAGER_HOST}:${INGRESS_HTTP_PORT}"

# ============================================================
# PREFLIGHT
# ============================================================

for bin in kubectl helm openssl curl; do
    command -v "$bin" >/dev/null 2>&1 || {
        echo "ERROR: $bin not found"
        exit 1
    }
done

CONTEXT="$(kubectl config current-context)"

case "$CONTEXT" in
    kind-*) ;;
    *)
        echo "WARNING: current context is '$CONTEXT', not kind-*"
        echo "Ctrl-C within 5s to abort"
        sleep 5
        ;;
esac

if [ ! -f /sys/kernel/btf/vmlinux ]; then
    echo "WARNING: host kernel has no BTF, eBPF agent may fail"
fi

echo "Host kernel: $(uname -r)"

# ============================================================
# DETECT PROMETHEUS / ALERTMANAGER
# ============================================================

if ! kubectl get namespace "$PROM_NAMESPACE" >/dev/null 2>&1; then
    echo "ERROR: namespace $PROM_NAMESPACE not found, set PROM_NAMESPACE"
    exit 1
fi

if [ -z "$PROM_INTERNAL_URL" ]; then
    if kubectl -n "$PROM_NAMESPACE" get svc prometheus-operated >/dev/null 2>&1; then
        PROM_INTERNAL_URL="http://prometheus-operated.${PROM_NAMESPACE}.svc.cluster.local.:9090/"
    elif kubectl -n "$PROM_NAMESPACE" get svc prometheus-server >/dev/null 2>&1; then
        PROM_INTERNAL_URL="http://prometheus-server.${PROM_NAMESPACE}.svc.cluster.local.:80/"
    else
        echo "ERROR: no Prometheus service in $PROM_NAMESPACE, set PROM_INTERNAL_URL"
        exit 1
    fi
fi

case "$PROM_INTERNAL_URL" in
    *127.0.0.1*|*localhost*)
        echo "ERROR: PROM_INTERNAL_URL points at loopback, unreachable from pods"
        exit 1
        ;;
esac

if [ -z "$AM_URL" ] && \
   kubectl -n "$ALERTMANAGER_NAMESPACE" get svc "$ALERTMANAGER_SERVICE" >/dev/null 2>&1; then
    AM_URL="http://${ALERTMANAGER_SERVICE}.${ALERTMANAGER_NAMESPACE}.svc.cluster.local.:9093/"
fi

echo "Prometheus (external):   $PROM_URL"
echo "Prometheus (in-cluster): $PROM_INTERNAL_URL"
echo "Alertmanager:            ${AM_URL:-none}"

if ! curl -fsS -o /dev/null --max-time 5 "${PROM_URL%/}/-/ready" 2>/dev/null; then
    echo "WARNING: $PROM_URL not reachable from this host (ingress missing?)"
fi

# ============================================================
# CERT-MANAGER + TRUST-MANAGER
# ============================================================

helm repo add jetstack https://charts.jetstack.io --force-update >/dev/null

if helm status cert-manager -n "$CERT_MANAGER_NAMESPACE" >/dev/null 2>&1; then
    echo "cert-manager already installed, skipping"
else
    CERT_MANAGER_VERSION_ARG=""
    if [ -n "$CERT_MANAGER_VERSION" ]; then
        CERT_MANAGER_VERSION_ARG="--version $CERT_MANAGER_VERSION"
    fi

    # shellcheck disable=SC2086
    helm install cert-manager jetstack/cert-manager \
        -n "$CERT_MANAGER_NAMESPACE" \
        --create-namespace \
        --set crds.enabled=true \
        $CERT_MANAGER_VERSION_ARG \
        --wait
fi

helm upgrade --install trust-manager \
    oci://quay.io/jetstack/charts/trust-manager \
    -n "$CERT_MANAGER_NAMESPACE" \
    --wait

kubectl -n "$CERT_MANAGER_NAMESPACE" rollout status deploy --timeout=180s

# ============================================================
# NETOBSERV OPERATOR
# ============================================================

helm repo add netobserv https://netobserv.io/static/helm/ --force-update >/dev/null
helm repo update >/dev/null

NETOBSERV_VERSION_ARG=""
if [ -n "$NETOBSERV_VERSION" ]; then
    NETOBSERV_VERSION_ARG="--version $NETOBSERV_VERSION"
fi

# shellcheck disable=SC2086
helm upgrade --install netobserv netobserv/netobserv-operator \
    -n "$NETOBSERV_NAMESPACE" \
    --create-namespace \
    --set install.loki="$INSTALL_LOKI" \
    --set install.prom-stack=false \
    --set operator.installNetworkPolicy=false \
    $NETOBSERV_VERSION_ARG \
    --wait \
    --timeout 10m

kubectl wait --for=condition=Established \
    crd/flowcollectors.flows.netobserv.io --timeout=120s

# ============================================================
# PROMETHEUS SERVICEMONITOR SELECTOR
# ============================================================

if [ "$PATCH_SM_SELECTOR" = "true" ] && \
   kubectl get crd prometheuses.monitoring.coreos.com >/dev/null 2>&1; then
    PROM_NAME="$(kubectl get prometheus -n "$PROM_NAMESPACE" \
        -o jsonpath='{.items[0].metadata.name}')"

    # JSON patch "add" REPLACES the field. A merge patch with {} is a
    # no-op: it merges nothing into the existing matchLabels.
    kubectl -n "$PROM_NAMESPACE" patch prometheus "$PROM_NAME" \
        --type json \
        -p '[
          {"op":"add","path":"/spec/serviceMonitorSelector","value":{}},
          {"op":"add","path":"/spec/serviceMonitorNamespaceSelector","value":{}},
          {"op":"add","path":"/spec/podMonitorSelector","value":{}},
          {"op":"add","path":"/spec/podMonitorNamespaceSelector","value":{}},
          {"op":"add","path":"/spec/ruleSelector","value":{}},
          {"op":"add","path":"/spec/ruleNamespaceSelector","value":{}}
        ]'

    echo "serviceMonitorSelector now: $(kubectl -n "$PROM_NAMESPACE" get prometheus "$PROM_NAME" \
        -o jsonpath='{.spec.serviceMonitorSelector}')"

    echo "NOTE: persist with serviceMonitorSelectorNilUsesHelmValues=false"
    echo "      (and pod/rule equivalents) in kube-prometheus-stack values"
fi

# ============================================================
# FLOWCOLLECTOR
# ============================================================

AM_BLOCK=""
if [ -n "$AM_URL" ]; then
    AM_BLOCK="        alertManager:
          url: ${AM_URL}"
fi

kubectl apply -f - <<YAML
apiVersion: flows.netobserv.io/v1beta2
kind: FlowCollector
metadata:
  name: cluster
spec:
  namespace: ${NETOBSERV_NAMESPACE}
  deploymentModel: Service
  networkPolicy:
    enable: false
  agent:
    type: eBPF
    ebpf:
      sampling: ${SAMPLING}
      privileged: true
      features:
        - PacketDrop
        - DNSTracking
        - FlowRTT
  processor:
    service:
      tlsType: Auto-mTLS
  loki:
    enable: ${INSTALL_LOKI}
    mode: Monolithic
    monolithic:
      url: 'http://netobserv-loki.${NETOBSERV_NAMESPACE}.svc.cluster.local.:3100/'
  prometheus:
    querier:
      mode: Manual
      manual:
        url: ${PROM_INTERNAL_URL}
${AM_BLOCK}
YAML

# ============================================================
# WAIT FOR PIPELINE
# ============================================================

# Print diagnostics and stop if the pipeline does not come up
pipeline_failed() {
    echo "ERROR: $1"
    echo
    echo "--- FlowCollector status ---"
    kubectl get flowcollector cluster \
        -o jsonpath='{range .status.conditions[*]}{.type}{"\t"}{.status}{"\t"}{.reason}{"\t"}{.message}{"\n"}{end}' \
        2>/dev/null || true
    echo
    echo "--- Deployments in ${NETOBSERV_NAMESPACE} ---"
    kubectl get deploy -n "$NETOBSERV_NAMESPACE" 2>/dev/null || true
    echo
    echo "--- Operator log (last 30 lines) ---"
    kubectl logs -n "$NETOBSERV_NAMESPACE" \
        deploy/netobserv-controller-manager --tail=30 2>/dev/null || \
        echo "operator deployment not found; check: kubectl get deploy -A | grep netobserv"
    exit 1
}

# kubectl wait fails immediately with NotFound if the object does
# not exist yet, so first poll until the operator has created it.
wait_for_deployment() {
    ns="$1"
    name="$2"
    tries="${3:-60}"
    i=0
    printf 'Waiting for deployment %s/%s to be created' "$ns" "$name"
    while ! kubectl -n "$ns" get deployment "$name" >/dev/null 2>&1; do
        i=$((i + 1))
        if [ "$i" -ge "$tries" ]; then
            echo
            pipeline_failed "deployment $ns/$name was never created"
        fi
        printf '.'
        sleep 5
    done
    echo " ok"

    kubectl -n "$ns" wait \
        --for=condition=Available=True \
        "deployment/$name" \
        --timeout=300s || pipeline_failed "deployment $ns/$name not Available"
}

wait_for_deployment "$NETOBSERV_NAMESPACE" netobserv-plugin

kubectl get flowcollector cluster
kubectl get pods -n "$NETOBSERV_NAMESPACE"
kubectl get pods -n "${NETOBSERV_NAMESPACE}-privileged" -o wide

# ============================================================
# INGRESS
# ============================================================

kubectl apply -f - <<YAML
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: netobserv
  namespace: ${NETOBSERV_NAMESPACE}
  annotations:
    nginx.ingress.kubernetes.io/backend-protocol: "${NETOBSERV_BACKEND_PROTOCOL}"
spec:
  ingressClassName: ${INGRESS_CLASS}
  rules:
    - host: ${NETOBSERV_HOST}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: netobserv-plugin
                port:
                  number: 9001
YAML

# ============================================================
# ALERTMANAGER
# ============================================================

AM_EXPOSED="false"

if [ "$EXPOSE_ALERTMANAGER" = "true" ] && [ -n "$AM_URL" ]; then

    if [ -z "$ALERTMANAGER_PASSWORD" ]; then
        ALERTMANAGER_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=')"
        AM_PASSWORD_GENERATED="true"
    else
        AM_PASSWORD_GENERATED="false"
    fi

    HTPASSWD="${ALERTMANAGER_USER}:$(openssl passwd -apr1 "$ALERTMANAGER_PASSWORD")"

    kubectl -n "$ALERTMANAGER_NAMESPACE" create secret generic alertmanager-basic-auth \
        --from-literal=auth="$HTPASSWD" \
        --dry-run=client -o yaml | kubectl apply -f -

    kubectl apply -f - <<YAML
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alertmanager
  namespace: ${ALERTMANAGER_NAMESPACE}
  annotations:
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: alertmanager-basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Alertmanager"
spec:
  ingressClassName: ${INGRESS_CLASS}
  rules:
    - host: ${ALERTMANAGER_HOST}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${ALERTMANAGER_SERVICE}
                port:
                  number: 9093
YAML

    # Make links in alerts and the UI point at the ingress, not pod IPs
    if kubectl get crd alertmanagers.monitoring.coreos.com >/dev/null 2>&1; then
        AM_NAME="$(kubectl get alertmanager -n "$ALERTMANAGER_NAMESPACE" \
            -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"
        if [ -n "$AM_NAME" ]; then
            kubectl -n "$ALERTMANAGER_NAMESPACE" patch alertmanager "$AM_NAME" \
                --type merge \
                -p "{\"spec\":{\"externalUrl\":\"${ALERTMANAGER_URL}\"}}"
            echo "NOTE: persist with alertmanager.alertmanagerSpec.externalUrl=${ALERTMANAGER_URL}"
        fi
    fi

    AM_EXPOSED="true"
fi

# ============================================================
# NETOBSERV ALERT RULES
# ============================================================

# NetObserv ships PrometheusRules; the selector patch above lets
# Prometheus load them, and Prometheus routes firing alerts to
# Alertmanager, which the console reads via the FlowCollector URL.
kubectl get prometheusrule -n "$NETOBSERV_NAMESPACE" 2>/dev/null || \
    echo "WARNING: no PrometheusRules in ${NETOBSERV_NAMESPACE} yet"

# ============================================================
# DONE
# ============================================================

echo
echo "NetObserv console: ${NETOBSERV_URL}"
echo "Prometheus:        ${PROM_URL}"

if [ "$AM_EXPOSED" = "true" ]; then
    echo "Alertmanager:      ${ALERTMANAGER_URL}"
    echo "  user:     ${ALERTMANAGER_USER}"
    if [ "$AM_PASSWORD_GENERATED" = "true" ]; then
        echo "  password: ${ALERTMANAGER_PASSWORD}  (generated, save it)"
    fi
fi

echo
echo "Verify NetObserv rule groups appear in Prometheus UI > Alerts."
echo "Currently firing/pending NetObserv alerts (PromQL):"
echo '  ALERTS{namespace="'"${NETOBSERV_NAMESPACE}"'"}'
echo
echo "Verify metrics in Prometheus (after 1-2 min):"
echo '  count by (__name__) ({__name__=~"netobserv_.*"})'
echo
echo "Agent logs if no flows appear:"
echo "  kubectl logs -n ${NETOBSERV_NAMESPACE}-privileged ds/netobserv-ebpf-agent --tail=50"
