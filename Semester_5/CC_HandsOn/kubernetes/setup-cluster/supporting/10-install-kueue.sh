#!/bin/sh

set -eu

. ./variables.sh

# ============================================================
# CONFIGURATION
# ============================================================

HOST_IP="${HOST_IP:-127.0.0.1}"

KUEUE_NAMESPACE="${KUEUE_NAMESPACE:-kueue-system}"
KUEUE_RELEASE="${KUEUE_RELEASE:-kueue}"

# Must match the kubectl-kueue client in install-kueue-client.sh
KUEUE_VERSION="${KUEUE_VERSION:-v0.20.3}"
KUEUE_CHART="${KUEUE_CHART:-oci://registry.k8s.io/kueue/charts/kueue}"

INGRESS_CLASS="${INGRESS_CLASS:-nginx}"

# KueueViz dashboard (frontend + backend behind one path-routed ingress)
KUEUE_ENABLE_VIZ="${KUEUE_ENABLE_VIZ:-true}"
KUEUEVIZ_HOST="${KUEUEVIZ_HOST:-kueueviz.${HOST_IP}.sslip.io}"
KUEUEVIZ_URL="http://${KUEUEVIZ_HOST}"

# Export per-ClusterQueue quota/usage metrics (kueue_cluster_queue_resource_usage, ...)
KUEUE_CQ_RESOURCE_METRICS="${KUEUE_CQ_RESOURCE_METRICS:-true}"

# Integrations Kueue manages (space-separated). Jobs only queue when labeled
# kueue.x-k8s.io/queue-name, so enabling extra frameworks is harmless.
KUEUE_FRAMEWORKS="${KUEUE_FRAMEWORKS:-batch/job pod deployment statefulset jobset.x-k8s.io/jobset}"

# ------------------------------------------------------------
# Default queue setup (ResourceFlavor -> ClusterQueue -> LocalQueue)
# ------------------------------------------------------------

KUEUE_CREATE_QUEUES="${KUEUE_CREATE_QUEUES:-true}"
KUEUE_FLAVOR="${KUEUE_FLAVOR:-default-flavor}"
KUEUE_CLUSTER_QUEUE="${KUEUE_CLUSTER_QUEUE:-cluster-queue}"
KUEUE_LOCAL_QUEUE="${KUEUE_LOCAL_QUEUE:-user-queue}"
# Namespaces that get a LocalQueue (space-separated; created if missing)
KUEUE_LOCAL_QUEUE_NAMESPACES="${KUEUE_LOCAL_QUEUE_NAMESPACES:-default}"

KUEUE_CPU_QUOTA="${KUEUE_CPU_QUOTA:-8}"
KUEUE_MEMORY_QUOTA="${KUEUE_MEMORY_QUOTA:-16Gi}"
# Empty = no GPU quota (kind has no GPUs); e.g. 4 on a GPU cluster
KUEUE_GPU_QUOTA="${KUEUE_GPU_QUOTA:-}"
KUEUE_GPU_RESOURCE="${KUEUE_GPU_RESOURCE:-nvidia.com/gpu}"

# Submit a small Job through the queue and wait for it to complete
KUEUE_SMOKE_TEST="${KUEUE_SMOKE_TEST:-true}"

# ------------------------------------------------------------
# Prometheus integration (kube-prometheus-stack)
# ------------------------------------------------------------

# Empty = auto-detect the release label from the Prometheus CR
PROM_STACK_RELEASE="${PROM_STACK_RELEASE:-}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://prometheus.${HOST_IP}.sslip.io}"
PROM_VERIFY="${PROM_VERIFY:-true}"
PROM_VERIFY_RETRIES="${PROM_VERIFY_RETRIES:-20}"
PROM_VERIFY_INTERVAL="${PROM_VERIFY_INTERVAL:-15}"

KUEUE_WAIT_TIMEOUT="${KUEUE_WAIT_TIMEOUT:-300s}"

KUEUE_CHART_VERSION="${KUEUE_VERSION#v}"
METRICS_SERVICE="${KUEUE_RELEASE}-controller-manager-metrics-service"
SERVICEMONITOR_NAME="kueue-controller-manager"
SERVICEMONITOR_CREATED="false"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM

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

echo "==> Checking cluster connectivity"
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "ERROR: cannot reach the Kubernetes API (check kubeconfig / kind context)." >&2
    exit 1
fi

# Kueue >= v0.20 serves only kueue.x-k8s.io/v1beta2; old v1beta1 objects block the upgrade
if kubectl get crd clusterqueues.kueue.x-k8s.io >/dev/null 2>&1; then
    STORED="$(kubectl get crd clusterqueues.kueue.x-k8s.io \
        -o jsonpath='{.status.storedVersions}' 2>/dev/null || true)"
    case "$STORED" in
        *v1beta1*)
            echo "WARN: existing Kueue CRDs still store v1beta1 (${STORED})."
            echo "      Run Kueue's hack/migrate-to-v1beta2.sh before upgrading to ${KUEUE_VERSION}."
            ;;
    esac
fi

# ============================================================
# HELM VALUES
# ============================================================

FRAMEWORKS_YAML=""
for fw in $KUEUE_FRAMEWORKS; do
    FRAMEWORKS_YAML="${FRAMEWORKS_YAML}
        - \"${fw}\""
done

if [ "$KUEUE_CQ_RESOURCE_METRICS" = "true" ]; then
    CQ_METRICS_LINE="      enableClusterQueueResources: true"
else
    CQ_METRICS_LINE="      enableClusterQueueResources: false"
fi

if [ "$KUEUE_ENABLE_VIZ" = "true" ]; then
    VIZ_BLOCK="kueueViz:
  ingress:
    enabled: true
    ingressClassName: ${INGRESS_CLASS}
    host: ${KUEUEVIZ_HOST}
    tlsEnabled: false
  backend:
    env:
      - name: KUEUEVIZ_ALLOWED_ORIGINS
        value: \"${KUEUEVIZ_URL}\""
else
    VIZ_BLOCK=""
fi

# The chart's own Prometheus option binds the prometheus-k8s service account
# (kube-prometheus naming). kube-prometheus-stack uses a different account,
# so the ServiceMonitor and RBAC are created by this script instead.
cat > "$WORK_DIR/kueue-values.yaml" <<EOF
enablePrometheus: false
enableKueueViz: ${KUEUE_ENABLE_VIZ}

metricsService:
  labels:
    kueue-metrics: "true"

managerConfig:
  controllerManagerConfigYaml: |-
    apiVersion: config.kueue.x-k8s.io/v1beta2
    kind: Configuration
    health:
      healthProbeBindAddress: :8081
    metrics:
      bindAddress: :8443
${CQ_METRICS_LINE}
    webhook:
      port: 9443
    leaderElection:
      leaderElect: true
      resourceName: c1f6bfd2.kueue.x-k8s.io
    controller:
      groupKindConcurrency:
        Job.batch: 5
        Pod: 5
        Workload.kueue.x-k8s.io: 10
        LocalQueue.kueue.x-k8s.io: 5
        Cohort.kueue.x-k8s.io: 1
        ClusterQueue.kueue.x-k8s.io: 5
        ResourceFlavor.kueue.x-k8s.io: 1
    clientConnection:
      qps: 300
      burst: 500
    managedJobsNamespaceSelector:
      matchExpressions:
        - key: kubernetes.io/metadata.name
          operator: NotIn
          values: [kube-system, ${KUEUE_NAMESPACE}]
    integrations:
      frameworks:${FRAMEWORKS_YAML}

${VIZ_BLOCK}
EOF

# ============================================================
# INSTALL KUEUE
# ============================================================

echo "==> Installing Kueue ${KUEUE_VERSION} (${KUEUE_RELEASE})"
helm upgrade --install "$KUEUE_RELEASE" "$KUEUE_CHART" \
    --version "$KUEUE_CHART_VERSION" \
    --namespace "$KUEUE_NAMESPACE" --create-namespace \
    --values "$WORK_DIR/kueue-values.yaml" \
    --wait --timeout "$KUEUE_WAIT_TIMEOUT"

echo "==> Waiting for the controller manager"
kubectl -n "$KUEUE_NAMESPACE" wait "deploy/${KUEUE_RELEASE}-controller-manager" \
    --for=condition=available --timeout="$KUEUE_WAIT_TIMEOUT"

# Kueue CRs are validated by its webhook; retry until the webhook serves
apply_with_retry() {
    n=0
    until kubectl apply -f "$1" >/dev/null 2>"$WORK_DIR/apply.err"; do
        n=$((n + 1))
        if [ "$n" -ge 24 ]; then
            cat "$WORK_DIR/apply.err" >&2
            return 1
        fi
        sleep 5
    done
    kubectl apply -f "$1"
}

# ============================================================
# DEFAULT QUEUES
# ============================================================

if [ "$KUEUE_CREATE_QUEUES" = "true" ]; then
    echo "==> Creating ResourceFlavor, ClusterQueue and LocalQueues"

    if [ -n "$KUEUE_GPU_QUOTA" ]; then
        COVERED="[cpu, memory, ${KUEUE_GPU_RESOURCE}]"
        GPU_LINES="
            - name: ${KUEUE_GPU_RESOURCE}
              nominalQuota: ${KUEUE_GPU_QUOTA}"
    else
        COVERED="[cpu, memory]"
        GPU_LINES=""
    fi

    cat > "$WORK_DIR/queues.yaml" <<EOF
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: ${KUEUE_FLAVOR}
---
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: ${KUEUE_CLUSTER_QUEUE}
spec:
  namespaceSelector: {}
  queueingStrategy: BestEffortFIFO
  resourceGroups:
    - coveredResources: ${COVERED}
      flavors:
        - name: ${KUEUE_FLAVOR}
          resources:
            - name: cpu
              nominalQuota: ${KUEUE_CPU_QUOTA}
            - name: memory
              nominalQuota: ${KUEUE_MEMORY_QUOTA}${GPU_LINES}
EOF

    for ns in $KUEUE_LOCAL_QUEUE_NAMESPACES; do
        kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f - >/dev/null
        cat >> "$WORK_DIR/queues.yaml" <<EOF
---
apiVersion: kueue.x-k8s.io/v1beta2
kind: LocalQueue
metadata:
  name: ${KUEUE_LOCAL_QUEUE}
  namespace: ${ns}
spec:
  clusterQueue: ${KUEUE_CLUSTER_QUEUE}
EOF
    done

    apply_with_retry "$WORK_DIR/queues.yaml"

    kubectl wait "clusterqueue/${KUEUE_CLUSTER_QUEUE}" --for=condition=Active --timeout=60s \
        || echo "WARN: ClusterQueue ${KUEUE_CLUSTER_QUEUE} is not Active yet"
fi

# ============================================================
# SMOKE TEST
# ============================================================

SMOKE_RESULT="skipped"

if [ "$KUEUE_SMOKE_TEST" = "true" ] && [ "$KUEUE_CREATE_QUEUES" = "true" ]; then
    SMOKE_NS="${KUEUE_LOCAL_QUEUE_NAMESPACES%% *}"
    SMOKE_JOB="kueue-smoke-test"
    echo "==> Smoke test: submitting ${SMOKE_NS}/${SMOKE_JOB} to ${KUEUE_LOCAL_QUEUE}"

    kubectl -n "$SMOKE_NS" delete job "$SMOKE_JOB" --ignore-not-found >/dev/null
    cat > "$WORK_DIR/smoke.yaml" <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: ${SMOKE_JOB}
  namespace: ${SMOKE_NS}
  labels:
    kueue.x-k8s.io/queue-name: ${KUEUE_LOCAL_QUEUE}
spec:
  suspend: true
  parallelism: 2
  completions: 2
  ttlSecondsAfterFinished: 300
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: sleep
          image: busybox:1.36
          command: [sh, -c, "sleep 5"]
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
EOF
    apply_with_retry "$WORK_DIR/smoke.yaml"

    if kubectl -n "$SMOKE_NS" wait "job/${SMOKE_JOB}" --for=condition=complete --timeout=180s; then
        SMOKE_RESULT="ok (admitted by Kueue and completed)"
    else
        SMOKE_RESULT="failed"
        echo "WARN: smoke test did not complete; inspect with:"
        echo "      kubectl -n ${SMOKE_NS} get workloads"
        echo "      kubectl -n ${SMOKE_NS} describe job ${SMOKE_JOB}"
    fi
fi

# ============================================================
# PROMETHEUS SERVICEMONITOR + RBAC
# ============================================================
#
# Kueue serves /metrics on HTTPS :8443 behind Kubernetes authn/authz, so the
# Prometheus service account needs "get" on the /metrics non-resource URL.

if kubectl get crd servicemonitors.monitoring.coreos.com >/dev/null 2>&1; then
    PROM_NS="$(kubectl get prometheus -A -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || true)"
    PROM_SA="$(kubectl get prometheus -A -o jsonpath='{.items[0].spec.serviceAccountName}' 2>/dev/null || true)"
    if [ -z "$PROM_STACK_RELEASE" ]; then
        PROM_STACK_RELEASE="$(kubectl get prometheus -A \
            -o jsonpath='{.items[0].metadata.labels.release}' 2>/dev/null || true)"
    fi

    if [ -n "$PROM_NS" ] && [ -n "$PROM_SA" ] && [ -n "$PROM_STACK_RELEASE" ]; then
        echo "==> Creating ServiceMonitor and metrics RBAC (Prometheus SA ${PROM_NS}/${PROM_SA})"
        cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kueue-metrics-scraper
rules:
  - nonResourceURLs: ["/metrics"]
    verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kueue-metrics-scraper
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kueue-metrics-scraper
subjects:
  - kind: ServiceAccount
    name: ${PROM_SA}
    namespace: ${PROM_NS}
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ${SERVICEMONITOR_NAME}
  namespace: ${KUEUE_NAMESPACE}
  labels:
    release: ${PROM_STACK_RELEASE}
spec:
  selector:
    matchLabels:
      kueue-metrics: "true"
  endpoints:
    - port: https
      scheme: https
      path: /metrics
      interval: 30s
      bearerTokenFile: /var/run/secrets/kubernetes.io/serviceaccount/token
      tlsConfig:
        insecureSkipVerify: true
EOF
        SERVICEMONITOR_CREATED="true"
    else
        echo "WARN: Prometheus CR not found or incomplete; skipping ServiceMonitor"
    fi
else
    echo "==> ServiceMonitor CRD not found; skipping Prometheus integration"
fi

# ============================================================
# PROMETHEUS VERIFICATION
# ============================================================

prom_query() {
    curl -fsS --max-time 10 "${PROMETHEUS_URL}/api/v1/query" \
        --data-urlencode "query=$1" 2>/dev/null \
        | sed -n 's/.*"value":\[[^,]*,"\([^"]*\)"\].*/\1/p'
}

VERIFY_RESULT="skipped"

if [ "$PROM_VERIFY" = "true" ] && [ "$SERVICEMONITOR_CREATED" = "true" ]; then
    if ! command -v curl >/dev/null 2>&1; then
        echo "WARN: curl not found; skipping Prometheus verification"
    elif ! curl -fsS --max-time 10 "${PROMETHEUS_URL}/-/ready" >/dev/null 2>&1; then
        echo "WARN: Prometheus not reachable at ${PROMETHEUS_URL}; skipping verification"
        VERIFY_RESULT="unreachable"
    else
        echo "==> Waiting for Prometheus to scrape Kueue (${PROMETHEUS_URL})"
        VERIFY_RESULT="target-down"
        i=0
        while [ "$i" -lt "$PROM_VERIFY_RETRIES" ]; do
            UP="$(prom_query "max(up{service=\"${METRICS_SERVICE}\"})")"
            echo "    up: ${UP:-no target}"
            if [ "$UP" = "1" ]; then
                VERIFY_RESULT="ok"
                break
            fi
            i=$((i + 1))
            sleep "$PROM_VERIFY_INTERVAL"
        done

        if [ "$VERIFY_RESULT" = "ok" ]; then
            for m in kueue_cluster_queue_status kueue_pending_workloads kueue_admitted_workloads_total \
                     kueue_cluster_queue_nominal_quota kueue_cluster_queue_resource_usage; do
                N="$(prom_query "count(${m})")"
                printf '    %-36s %s\n' "$m" "${N:-MISSING}"
            done
        else
            echo "WARN: Kueue target not up; check ${PROMETHEUS_URL}/targets"
            echo "      (401/403 means the RBAC binding did not match the Prometheus SA)"
        fi
    fi
fi

# ============================================================
# SUMMARY
# ============================================================

echo
echo "============================================================"
echo " Kueue installed"
echo "============================================================"
echo " Namespace        : ${KUEUE_NAMESPACE}"
echo " Version          : ${KUEUE_VERSION}"
echo " Frameworks       : ${KUEUE_FRAMEWORKS}"
if [ "$KUEUE_CREATE_QUEUES" = "true" ]; then
    echo " ClusterQueue     : ${KUEUE_CLUSTER_QUEUE} (cpu=${KUEUE_CPU_QUOTA}, memory=${KUEUE_MEMORY_QUOTA}${KUEUE_GPU_QUOTA:+, ${KUEUE_GPU_RESOURCE}=${KUEUE_GPU_QUOTA}})"
    echo " LocalQueue       : ${KUEUE_LOCAL_QUEUE} in ${KUEUE_LOCAL_QUEUE_NAMESPACES}"
fi
echo " Smoke test       : ${SMOKE_RESULT}"
if [ "$KUEUE_ENABLE_VIZ" = "true" ]; then
    echo " KueueViz         : ${KUEUEVIZ_URL}"
fi
echo " Prometheus       : ${PROMETHEUS_URL} (verification: ${VERIFY_RESULT})"
echo
echo " Submit a job to the queue by labeling it:"
echo "   metadata.labels.kueue.x-k8s.io/queue-name: ${KUEUE_LOCAL_QUEUE}"
echo
echo " Inspect:"
echo "   kubectl get clusterqueues,resourceflavors"
echo "   kubectl get localqueues,workloads -A"
echo "============================================================"


#!/bin/sh

set -eu

. ./variables.sh

# ============================================================
# CONFIGURATION
# ============================================================

# Must match the controller version in install-kueue.sh
KUEUE_VERSION="${KUEUE_VERSION:-v0.20.3}"
KUEUE_RELEASE_URL="${KUEUE_RELEASE_URL:-https://github.com/kubernetes-sigs/kueue/releases/download}"

INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"

PATH="$INSTALL_DIR:$PATH"
export PATH

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM

# ============================================================
# PLATFORM DETECTION
# ============================================================

case "$(uname -s)" in
    Linux)  KUEUE_OS="linux" ;;
    Darwin) KUEUE_OS="darwin" ;;
    *) echo "ERROR: unsupported OS $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
    x86_64|amd64)  KUEUE_ARCH="amd64" ;;
    aarch64|arm64) KUEUE_ARCH="arm64" ;;
    *) echo "ERROR: unsupported architecture $(uname -m)" >&2; exit 1 ;;
esac

# ============================================================
# INSTALL kubectl-kueue
# ============================================================

if command -v kubectl-kueue >/dev/null 2>&1 && \
   kubectl-kueue version 2>/dev/null | grep -q "${KUEUE_VERSION}"; then
    echo "==> kubectl-kueue ${KUEUE_VERSION} already installed: $(command -v kubectl-kueue)"
    exit 0
fi

for bin in curl tar; do
    if ! command -v "$bin" >/dev/null 2>&1; then
        echo "ERROR: '$bin' not found in PATH." >&2
        exit 1
    fi
done

ASSET="kubectl-kueue-${KUEUE_OS}-${KUEUE_ARCH}.tar.gz"

echo "==> Downloading ${ASSET} (${KUEUE_VERSION})"
curl -fsSL "${KUEUE_RELEASE_URL}/${KUEUE_VERSION}/${ASSET}" -o "$WORK_DIR/$ASSET"
tar -C "$WORK_DIR" -xzf "$WORK_DIR/$ASSET" ./kubectl-kueue

mkdir -p "$INSTALL_DIR"
install -m 0755 "$WORK_DIR/kubectl-kueue" "$INSTALL_DIR/kubectl-kueue"

# ============================================================
# SUMMARY
# ============================================================

echo
echo "============================================================"
echo " kubectl-kueue installed"
echo "============================================================"
echo " Binary  : ${INSTALL_DIR}/kubectl-kueue"
echo " Version : ${KUEUE_VERSION}"
echo
echo " Add to your shell profile if not already present:"
echo "   export PATH=\"${INSTALL_DIR}:\$PATH\""
echo
echo " Examples:"
echo "   kubectl kueue list clusterqueue"
echo "   kubectl kueue list workload -A"
echo "============================================================"

