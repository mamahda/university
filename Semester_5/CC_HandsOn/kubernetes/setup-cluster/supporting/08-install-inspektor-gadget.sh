#!/bin/sh

set -eu

. ./variables.sh

# ============================================================
# CONFIGURATION
# ============================================================

IG_NAMESPACE="${IG_NAMESPACE:-gadget}"
IG_RELEASE="${IG_RELEASE:-gadget}"

# Server (DaemonSet) and kubectl-gadget client must be the exact same version
IG_VERSION="${IG_VERSION:-v0.56.0}"
IG_HELM_REPO="${IG_HELM_REPO:-https://inspektor-gadget.github.io/charts}"
IG_GADGET_REGISTRY="${IG_GADGET_REGISTRY:-ghcr.io/inspektor-gadget/gadget}"

# Prometheus endpoint served by every gadget pod (scraped by the OTel agent)
IG_METRICS_PORT="${IG_METRICS_PORT:-2224}"

# Gadgets started headless with metrics export, space-separated
#   <instance-name>:<gadget-image>:<datasource>
# Only gadgets whose docs list an "Exporting metrics" section produce metrics.
IG_METRIC_GADGETS="${IG_METRIC_GADGETS:-profileblockio:profile_blockio:blockio}"

# How to start the metric gadgets:
#   helm = gadgetConfigMaps in the chart (no client binary needed)
#   cli  = kubectl gadget run --detach (needs kubectl-gadget, same version)
#   none = only deploy the DaemonSet
IG_GADGET_START_MODE="${IG_GADGET_START_MODE:-helm}"

IG_WAIT_TIMEOUT="${IG_WAIT_TIMEOUT:-300s}"

IG_CHART_VERSION="${IG_VERSION#v}"

WORK_DIR="$(mktemp -d)"
PF_PID=""
cleanup() {
    [ -n "$PF_PID" ] && kill "$PF_PID" 2>/dev/null || true
    rm -rf "$WORK_DIR"
}
trap cleanup EXIT INT TERM

# ============================================================
# PRE-FLIGHT CHECKS
# ============================================================

echo "==> Checking required client tools"
for bin in kubectl helm; do
    if ! command -v "$bin" >/dev/null 2>&1; then
        echo "ERROR: '$bin' not found in PATH. Run the client install script first." >&2
        exit 1
    fi
done

if [ "$IG_GADGET_START_MODE" = "cli" ]; then
    if ! command -v kubectl-gadget >/dev/null 2>&1; then
        echo "ERROR: IG_GADGET_START_MODE=cli needs kubectl-gadget." >&2
        echo "       Run install-inspektor-gadget-client.sh first." >&2
        exit 1
    fi
    if ! kubectl-gadget version 2>/dev/null | grep -q "Client version: ${IG_VERSION}"; then
        echo "WARN: kubectl-gadget client is not ${IG_VERSION}; IG requires matching versions"
    fi
fi

echo "==> Checking cluster connectivity"
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "ERROR: cannot reach the Kubernetes API (check kubeconfig / kind context)." >&2
    exit 1
fi

# ============================================================
# HELM VALUES
# ============================================================

GADGET_CM_BLOCK=""
if [ "$IG_GADGET_START_MODE" = "helm" ] && [ -n "$IG_METRIC_GADGETS" ]; then
    GADGET_CM_BLOCK="  gadgetConfigMaps:"
    for entry in $IG_METRIC_GADGETS; do
        name="${entry%%:*}"
        rest="${entry#*:}"
        image="${rest%%:*}"
        ds="${rest#*:}"
        GADGET_CM_BLOCK="${GADGET_CM_BLOCK}
    - name: ${name}
      imageName: ${IG_GADGET_REGISTRY}/${image}:${IG_VERSION}
      tags: [metrics]
      paramValues:
        operator.oci.annotate: \"${ds}:metrics.collect=true\"
        operator.otel-metrics.otel-metrics-name: \"${ds}:${name}-metrics\""
    done
fi

cat > "$WORK_DIR/gadget-values.yaml" <<EOF
config:
  operator:
    otel-metrics:
      otel-metrics-listen: true
      otel-metrics-listen-address: 0.0.0.0:${IG_METRICS_PORT}
${GADGET_CM_BLOCK}
EOF

# ============================================================
# INSTALL INSPEKTOR GADGET (DaemonSet)
# ============================================================

echo "==> Adding Inspektor Gadget Helm repository"
helm repo add gadget "$IG_HELM_REPO" >/dev/null 2>&1 || true
helm repo update gadget >/dev/null

echo "==> Installing Inspektor Gadget ${IG_VERSION} (${IG_RELEASE})"
helm upgrade --install "$IG_RELEASE" gadget/gadget \
    --namespace "$IG_NAMESPACE" --create-namespace \
    --version "$IG_CHART_VERSION" \
    --values "$WORK_DIR/gadget-values.yaml"

echo "==> Waiting for gadget pods to become ready"
kubectl -n "$IG_NAMESPACE" wait --for=condition=Ready pod --all --timeout="$IG_WAIT_TIMEOUT"

# ============================================================
# START METRIC GADGETS (CLI MODE)
# ============================================================

if [ "$IG_GADGET_START_MODE" = "cli" ] && [ -n "$IG_METRIC_GADGETS" ]; then
    for entry in $IG_METRIC_GADGETS; do
        name="${entry%%:*}"
        rest="${entry#*:}"
        image="${rest%%:*}"
        ds="${rest#*:}"
        echo "==> Starting gadget ${name} (${image}, datasource ${ds})"
        kubectl gadget delete "$name" >/dev/null 2>&1 || true
        kubectl gadget run "${IG_GADGET_REGISTRY}/${image}:${IG_VERSION}" \
            --name "$name" \
            --annotate="${ds}:metrics.collect=true" \
            --otel-metrics-name="${ds}:${name}-metrics" \
            --detach
    done
fi

# ============================================================
# VERIFY METRICS ENDPOINT
# ============================================================

METRICS_RESULT="skipped"
if command -v curl >/dev/null 2>&1; then
    POD="$(kubectl -n "$IG_NAMESPACE" get pods -o jsonpath='{.items[0].metadata.name}')"
    LOCAL_PORT="1${IG_METRICS_PORT}"

    echo "==> Checking metrics endpoint on ${POD}"
    kubectl -n "$IG_NAMESPACE" port-forward "pod/${POD}" "${LOCAL_PORT}:${IG_METRICS_PORT}" >/dev/null 2>&1 &
    PF_PID=$!

    METRICS_RESULT="unreachable"
    i=0
    while [ "$i" -lt 12 ]; do
        sleep 5
        BODY="$(curl -fsS --max-time 5 "http://127.0.0.1:${LOCAL_PORT}/metrics" 2>/dev/null || true)"
        if [ -n "$BODY" ]; then
            SCOPES="$(printf '%s\n' "$BODY" \
                | sed -n 's/.*otel_scope_name="\([^"]*\)".*/\1/p' | sort -u | tr '\n' ' ')"
            if [ -n "$SCOPES" ]; then
                METRICS_RESULT="ok (${SCOPES% })"
                break
            fi
            METRICS_RESULT="listening, no gadget metrics yet"
        fi
        i=$((i + 1))
    done

    kill "$PF_PID" 2>/dev/null || true
    PF_PID=""
fi

# ============================================================
# SUMMARY
# ============================================================

echo
echo "============================================================"
echo " Inspektor Gadget installed"
echo "============================================================"
echo " Namespace        : ${IG_NAMESPACE}"
echo " Version          : ${IG_VERSION}"
echo " Metrics endpoint : <gadget-pod-ip>:${IG_METRICS_PORT}/metrics"
echo " Metric gadgets   : ${IG_METRIC_GADGETS:-none} (mode: ${IG_GADGET_START_MODE})"
echo " Endpoint check   : ${METRICS_RESULT}"
echo
echo " Next: run install-otel-collector.sh so the OTel agent scrapes"
echo "       these endpoints (job=\"inspektor-gadget\")."
echo
echo " With kubectl-gadget installed:"
echo "   kubectl gadget list"
echo "   kubectl gadget run trace_exec:${IG_VERSION} -A"
echo "============================================================"
