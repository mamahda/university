#!/bin/sh

set -eu

. ./variables.sh

# ============================================================
# CONFIGURATION
# ============================================================

HOST_IP="${HOST_IP:-127.0.0.1}"

OTEL_NAMESPACE="${OTEL_NAMESPACE:-observability}"

# Two collectors:
#   agent   = DaemonSet, one per node -> kubeletstats, hostmetrics, OTLP, pod logs,
#                                        cAdvisor, node-exporter, Inspektor Gadget
#   cluster = Deployment, 1 replica   -> k8s_cluster, k8s events, kube-state-metrics
OTEL_AGENT_RELEASE="${OTEL_AGENT_RELEASE:-otel-agent}"
OTEL_CLUSTER_RELEASE="${OTEL_CLUSTER_RELEASE:-otel-cluster}"

OTEL_HELM_REPO="${OTEL_HELM_REPO:-https://open-telemetry.github.io/opentelemetry-helm-charts}"
# Empty = latest chart; pin for reproducible lab environments (e.g. 0.156.2)
OTEL_CHART_VERSION="${OTEL_CHART_VERSION:-}"
OTEL_IMAGE_REPO="${OTEL_IMAGE_REPO:-otel/opentelemetry-collector-contrib}"

OTEL_COLLECTION_INTERVAL="${OTEL_COLLECTION_INTERVAL:-15s}"

# Pod log collection (filelog receiver on /var/log/pods); off by default
OTEL_ENABLE_LOGS="${OTEL_ENABLE_LOGS:-false}"

# Optional upstream OTLP gRPC backend (e.g. tempo.observability.svc:4317).
# Empty = metrics exposed for Prometheus only, traces/logs go to debug exporter.
OTEL_OTLP_ENDPOINT="${OTEL_OTLP_ENDPOINT:-}"

# ------------------------------------------------------------
# Prometheus-format sources scraped by the collector
# ------------------------------------------------------------

COLLECT_CADVISOR="${COLLECT_CADVISOR:-true}"
COLLECT_NODE_EXPORTER="${COLLECT_NODE_EXPORTER:-true}"
COLLECT_KUBE_STATE_METRICS="${COLLECT_KUBE_STATE_METRICS:-true}"
# auto = scrape only if the Inspektor Gadget namespace exists
COLLECT_INSPEKTOR_GADGET="${COLLECT_INSPEKTOR_GADGET:-auto}"

# Install standalone node-exporter / kube-state-metrics when none is found
# (kube-prometheus-stack already ships both)
INSTALL_MISSING_EXPORTERS="${INSTALL_MISSING_EXPORTERS:-true}"
PROM_COMMUNITY_REPO="${PROM_COMMUNITY_REPO:-https://prometheus-community.github.io/helm-charts}"
NODE_EXPORTER_RELEASE="${NODE_EXPORTER_RELEASE:-otel-node-exporter}"
KSM_RELEASE="${KSM_RELEASE:-otel-kube-state-metrics}"

# Must match install-inspektor-gadget.sh
IG_NAMESPACE="${IG_NAMESPACE:-gadget}"
IG_METRICS_PORT="${IG_METRICS_PORT:-2224}"

# ------------------------------------------------------------
# Prometheus integration
# ------------------------------------------------------------

# Prometheus scraping via PodMonitor (kube-prometheus-stack).
# Empty = auto-detect the release label from the Prometheus CR.
PROM_STACK_RELEASE="${PROM_STACK_RELEASE:-}"

# Prometheus API, used only for post-install verification (scraping is pull-based)
PROMETHEUS_URL="${PROMETHEUS_URL:-http://prometheus.${HOST_IP}.sslip.io}"
PROM_VERIFY="${PROM_VERIFY:-true}"
PROM_VERIFY_RETRIES="${PROM_VERIFY_RETRIES:-20}"
PROM_VERIFY_INTERVAL="${PROM_VERIFY_INTERVAL:-15}"

PODMONITOR_NAME="otel-collectors"
PODMONITOR_CREATED="false"

# ------------------------------------------------------------
# OTLP/HTTP ingress so workloads outside the cluster can push telemetry
# ------------------------------------------------------------

OTEL_ENABLE_INGRESS="${OTEL_ENABLE_INGRESS:-true}"
INGRESS_CLASS="${INGRESS_CLASS:-nginx}"
OTEL_HOST="${OTEL_HOST:-otel.${HOST_IP}.sslip.io}"
OTEL_URL="http://${OTEL_HOST}"

OTEL_WAIT_TIMEOUT="${OTEL_WAIT_TIMEOUT:-300s}"

PROMETHEUS_URL="${PROMETHEUS_URL:-http://prometheus.${HOST_IP}.sslip.io:${INGRESS_HTTP_PORT}}"
OTEL_URL="http://${OTEL_HOST}:${INGRESS_HTTP_PORT}"

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

kubectl create namespace "$OTEL_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ============================================================
# DISCOVER PROMETHEUS EXPORTERS
# ============================================================

# Prints "<namespace> <name>" of the first matching object, or nothing
first_object() {
    kubectl get "$1" -A -l "$2" \
        -o jsonpath='{range .items[*]}{.metadata.namespace}{" "}{.metadata.name}{"\n"}{end}' \
        2>/dev/null | head -n 1
}

detect_node_exporter() {
    NE_REF="$(first_object daemonset app.kubernetes.io/name=prometheus-node-exporter)"
}

detect_ksm() {
    KSM_REF="$(first_object service app.kubernetes.io/name=kube-state-metrics)"
}

NE_REF=""
KSM_REF=""
[ "$COLLECT_NODE_EXPORTER" = "true" ] && detect_node_exporter
[ "$COLLECT_KUBE_STATE_METRICS" = "true" ] && detect_ksm

if [ "$INSTALL_MISSING_EXPORTERS" = "true" ]; then
    if { [ "$COLLECT_NODE_EXPORTER" = "true" ] && [ -z "$NE_REF" ]; } || \
       { [ "$COLLECT_KUBE_STATE_METRICS" = "true" ] && [ -z "$KSM_REF" ]; }; then
        echo "==> Adding prometheus-community Helm repository"
        helm repo add prometheus-community "$PROM_COMMUNITY_REPO" >/dev/null 2>&1 || true
        helm repo update prometheus-community >/dev/null
    fi

    if [ "$COLLECT_NODE_EXPORTER" = "true" ] && [ -z "$NE_REF" ]; then
        echo "==> No node-exporter found; installing ${NODE_EXPORTER_RELEASE}"
        helm upgrade --install "$NODE_EXPORTER_RELEASE" prometheus-community/prometheus-node-exporter \
            --namespace "$OTEL_NAMESPACE" --wait --timeout "$OTEL_WAIT_TIMEOUT"
        detect_node_exporter
    fi

    if [ "$COLLECT_KUBE_STATE_METRICS" = "true" ] && [ -z "$KSM_REF" ]; then
        echo "==> No kube-state-metrics found; installing ${KSM_RELEASE}"
        helm upgrade --install "$KSM_RELEASE" prometheus-community/kube-state-metrics \
            --namespace "$OTEL_NAMESPACE" --wait --timeout "$OTEL_WAIT_TIMEOUT"
        detect_ksm
    fi
fi

# node-exporter: runs with hostNetwork, scraped on <node-ip>:<port> by each agent
NODE_EXPORTER_PORT="9100"
if [ -n "$NE_REF" ]; then
    NE_NS="${NE_REF% *}"
    NE_NAME="${NE_REF#* }"
    p="$(kubectl -n "$NE_NS" get daemonset "$NE_NAME" \
        -o jsonpath='{.spec.template.spec.containers[0].ports[0].containerPort}' 2>/dev/null || true)"
    [ -n "$p" ] && NODE_EXPORTER_PORT="$p"
    hn="$(kubectl -n "$NE_NS" get daemonset "$NE_NAME" \
        -o jsonpath='{.spec.template.spec.hostNetwork}' 2>/dev/null || true)"
    if [ "$hn" != "true" ]; then
        echo "WARN: node-exporter ${NE_REF} does not use hostNetwork; node-IP scraping may fail"
    fi
    echo "    node-exporter      : ${NE_NS}/${NE_NAME} (port ${NODE_EXPORTER_PORT})"
elif [ "$COLLECT_NODE_EXPORTER" = "true" ]; then
    echo "WARN: node-exporter not found; skipping"
    COLLECT_NODE_EXPORTER="false"
fi

# kube-state-metrics: single instance, scraped through its Service by the cluster collector
KSM_TARGET=""
if [ -n "$KSM_REF" ]; then
    KSM_NS="${KSM_REF% *}"
    KSM_NAME="${KSM_REF#* }"
    KSM_PORT="$(kubectl -n "$KSM_NS" get service "$KSM_NAME" \
        -o jsonpath='{.spec.ports[?(@.name=="http")].port}' 2>/dev/null || true)"
    KSM_TARGET="${KSM_NAME}.${KSM_NS}.svc:${KSM_PORT:-8080}"
    echo "    kube-state-metrics : ${KSM_TARGET}"
elif [ "$COLLECT_KUBE_STATE_METRICS" = "true" ]; then
    echo "WARN: kube-state-metrics not found; skipping"
    COLLECT_KUBE_STATE_METRICS="false"
fi

if [ "$COLLECT_INSPEKTOR_GADGET" = "auto" ]; then
    if kubectl get namespace "$IG_NAMESPACE" >/dev/null 2>&1; then
        COLLECT_INSPEKTOR_GADGET="true"
    else
        COLLECT_INSPEKTOR_GADGET="false"
    fi
fi
echo "    inspektor-gadget   : ${COLLECT_INSPEKTOR_GADGET} (${IG_NAMESPACE}, port ${IG_METRICS_PORT})"
echo "    cadvisor           : ${COLLECT_CADVISOR}"

# ============================================================
# PIPELINE / EXPORTER SELECTION
# ============================================================

if [ -n "$OTEL_OTLP_ENDPOINT" ]; then
    OTLP_EXPORTER_BLOCK="    otlp:
      endpoint: ${OTEL_OTLP_ENDPOINT}
      tls:
        insecure: true"
    METRICS_EXPORTERS="[prometheus, otlp]"
    LOGS_EXPORTERS="[otlp]"
    TRACES_EXPORTERS="[otlp]"
else
    OTLP_EXPORTER_BLOCK=""
    METRICS_EXPORTERS="[prometheus]"
    LOGS_EXPORTERS="[debug]"
    TRACES_EXPORTERS="[debug]"
fi

VERSION_ARGS=""
if [ -n "$OTEL_CHART_VERSION" ]; then
    VERSION_ARGS="--version ${OTEL_CHART_VERSION}"
fi

# ------------------------------------------------------------
# Agent scrape jobs (node-local targets).
# \${env:...} is expanded by the collector; \$\$1 is a literal $1 for relabeling.
# ------------------------------------------------------------

AGENT_JOBS=""

if [ "$COLLECT_CADVISOR" = "true" ]; then
    AGENT_JOBS="${AGENT_JOBS}
          - job_name: cadvisor
            scheme: https
            metrics_path: /metrics/cadvisor
            scrape_interval: ${OTEL_COLLECTION_INTERVAL}
            authorization:
              credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token
            tls_config:
              insecure_skip_verify: true
            static_configs:
              - targets: ['\${env:SCRAPE_NODE_IP}:10250']
                labels:
                  node: '\${env:SCRAPE_NODE_NAME}'"
fi

if [ "$COLLECT_NODE_EXPORTER" = "true" ]; then
    AGENT_JOBS="${AGENT_JOBS}
          - job_name: node-exporter
            scrape_interval: ${OTEL_COLLECTION_INTERVAL}
            static_configs:
              - targets: ['\${env:SCRAPE_NODE_IP}:${NODE_EXPORTER_PORT}']
                labels:
                  node: '\${env:SCRAPE_NODE_NAME}'"
fi

if [ "$COLLECT_INSPEKTOR_GADGET" = "true" ]; then
    AGENT_JOBS="${AGENT_JOBS}
          - job_name: inspektor-gadget
            scrape_interval: ${OTEL_COLLECTION_INTERVAL}
            kubernetes_sd_configs:
              - role: pod
                namespaces:
                  names: [${IG_NAMESPACE}]
                selectors:
                  - role: pod
                    field: spec.nodeName=\${env:SCRAPE_NODE_NAME}
            relabel_configs:
              - source_labels: [__meta_kubernetes_pod_phase]
                regex: Running
                action: keep
              - source_labels: [__meta_kubernetes_pod_ip]
                regex: (.+)
                replacement: \$\$1:${IG_METRICS_PORT}
                target_label: __address__
              - source_labels: [__meta_kubernetes_pod_node_name]
                target_label: node"
fi

if [ -n "$AGENT_JOBS" ]; then
    AGENT_PROM_BLOCK="    prometheus:
      config:
        scrape_configs:${AGENT_JOBS}"
    AGENT_METRICS_RECEIVERS="[otlp, prometheus]"
else
    AGENT_PROM_BLOCK=""
    AGENT_METRICS_RECEIVERS="[otlp]"
fi

# ------------------------------------------------------------
# Cluster scrape jobs (cluster-wide singletons)
# ------------------------------------------------------------

if [ "$COLLECT_KUBE_STATE_METRICS" = "true" ]; then
    CLUSTER_PROM_BLOCK="    prometheus:
      config:
        scrape_configs:
          - job_name: kube-state-metrics
            scrape_interval: ${OTEL_COLLECTION_INTERVAL}
            honor_labels: true
            static_configs:
              - targets: ['${KSM_TARGET}']"
    CLUSTER_METRICS_RECEIVERS="[otlp, prometheus]"
else
    CLUSTER_PROM_BLOCK=""
    CLUSTER_METRICS_RECEIVERS="[otlp]"
fi

# ============================================================
# HELM REPOSITORY
# ============================================================

echo "==> Adding OpenTelemetry Helm repository"
helm repo add open-telemetry "$OTEL_HELM_REPO" >/dev/null 2>&1 || true
helm repo update open-telemetry >/dev/null

# ============================================================
# AGENT COLLECTOR (DaemonSet)
# ============================================================

cat > "$WORK_DIR/agent-values.yaml" <<EOF
mode: daemonset
fullnameOverride: ${OTEL_AGENT_RELEASE}

image:
  repository: ${OTEL_IMAGE_REPO}

presets:
  kubeletMetrics:
    enabled: true
  hostMetrics:
    enabled: true
  kubernetesAttributes:
    enabled: true
    extractAllPodLabels: true
  logsCollection:
    enabled: ${OTEL_ENABLE_LOGS}
    includeCollectorLogs: false

# Node identity for node-local scrape targets
extraEnvs:
  - name: SCRAPE_NODE_NAME
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: SCRAPE_NODE_IP
    valueFrom:
      fieldRef:
        fieldPath: status.hostIP

clusterRole:
  create: true
  rules:
    # kubelet /metrics/cadvisor
    - apiGroups: [""]
      resources: [nodes/metrics, nodes/stats, nodes/proxy]
      verbs: [get]
    # Inspektor Gadget pod discovery
    - apiGroups: [""]
      resources: [pods]
      verbs: [get, list, watch]

# kind control-plane node carries a NoSchedule taint
tolerations:
  - key: node-role.kubernetes.io/control-plane
    operator: Exists
    effect: NoSchedule

service:
  enabled: true

ports:
  prom-exporter:
    enabled: true
    containerPort: 8889
    servicePort: 8889
    protocol: TCP

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    memory: 1Gi

config:
  receivers:
    kubeletstats:
      collection_interval: ${OTEL_COLLECTION_INTERVAL}
      # kind kubelet serving certificates are self-signed
      insecure_skip_verify: true
      metric_groups: [node, pod, container, volume]
      metrics:
        k8s.pod.cpu_limit_utilization:
          enabled: true
        k8s.pod.cpu_request_utilization:
          enabled: true
        k8s.pod.memory_limit_utilization:
          enabled: true
        k8s.pod.memory_request_utilization:
          enabled: true
        k8s.container.cpu_limit_utilization:
          enabled: true
        k8s.container.memory_limit_utilization:
          enabled: true
    hostmetrics:
      collection_interval: ${OTEL_COLLECTION_INTERVAL}
${AGENT_PROM_BLOCK}
  exporters:
    prometheus:
      endpoint: 0.0.0.0:8889
      resource_to_telemetry_conversion:
        enabled: true
${OTLP_EXPORTER_BLOCK}
  service:
    pipelines:
      metrics:
        receivers: ${AGENT_METRICS_RECEIVERS}
        exporters: ${METRICS_EXPORTERS}
      logs:
        exporters: ${LOGS_EXPORTERS}
      traces:
        exporters: ${TRACES_EXPORTERS}
EOF

echo "==> Installing agent collector (${OTEL_AGENT_RELEASE})"
# shellcheck disable=SC2086
helm upgrade --install "$OTEL_AGENT_RELEASE" open-telemetry/opentelemetry-collector \
    --namespace "$OTEL_NAMESPACE" \
    $VERSION_ARGS \
    --values "$WORK_DIR/agent-values.yaml"

# ============================================================
# CLUSTER COLLECTOR (Deployment)
# ============================================================

cat > "$WORK_DIR/cluster-values.yaml" <<EOF
mode: deployment
replicaCount: 1
fullnameOverride: ${OTEL_CLUSTER_RELEASE}

image:
  repository: ${OTEL_IMAGE_REPO}

presets:
  clusterMetrics:
    enabled: true
  kubernetesEvents:
    enabled: true
  kubernetesAttributes:
    enabled: true

ports:
  prom-exporter:
    enabled: true
    containerPort: 8889
    servicePort: 8889
    protocol: TCP

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    memory: 1Gi

config:
  receivers:
    k8s_cluster:
      collection_interval: ${OTEL_COLLECTION_INTERVAL}
      node_conditions_to_report: [Ready, MemoryPressure, DiskPressure, PIDPressure]
      allocatable_types_to_report: [cpu, memory, ephemeral-storage, pods]
${CLUSTER_PROM_BLOCK}
  exporters:
    prometheus:
      endpoint: 0.0.0.0:8889
      resource_to_telemetry_conversion:
        enabled: true
${OTLP_EXPORTER_BLOCK}
  service:
    pipelines:
      metrics:
        receivers: ${CLUSTER_METRICS_RECEIVERS}
        exporters: ${METRICS_EXPORTERS}
      logs:
        exporters: ${LOGS_EXPORTERS}
      traces:
        exporters: ${TRACES_EXPORTERS}
EOF

echo "==> Installing cluster collector (${OTEL_CLUSTER_RELEASE})"
# shellcheck disable=SC2086
helm upgrade --install "$OTEL_CLUSTER_RELEASE" open-telemetry/opentelemetry-collector \
    --namespace "$OTEL_NAMESPACE" \
    $VERSION_ARGS \
    --values "$WORK_DIR/cluster-values.yaml"

# ============================================================
# WAIT FOR ROLLOUT
# ============================================================

# Chart versions differ in naming (e.g. newer charts suffix the DaemonSet with
# "-agent"), so resolve real object names from the release label.

# name_of <kind> <release>
name_of() {
    kubectl -n "$OTEL_NAMESPACE" get "$1" -l "app.kubernetes.io/instance=$2" \
        -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true
}

# Non-headless Service of a release
service_of() {
    kubectl -n "$OTEL_NAMESPACE" get service -l "app.kubernetes.io/instance=$1" \
        -o jsonpath='{range .items[?(@.spec.clusterIP!="None")]}{.metadata.name}{"\n"}{end}' \
        2>/dev/null | head -n 1
}

AGENT_DS="$(name_of daemonset "$OTEL_AGENT_RELEASE")"
CLUSTER_DEPLOY="$(name_of deployment "$OTEL_CLUSTER_RELEASE")"
AGENT_SVC="$(service_of "$OTEL_AGENT_RELEASE")"
CLUSTER_SVC="$(service_of "$OTEL_CLUSTER_RELEASE")"

if [ -z "$AGENT_DS" ] || [ -z "$CLUSTER_DEPLOY" ]; then
    echo "ERROR: collector workloads not found in ${OTEL_NAMESPACE}" >&2
    exit 1
fi

echo "==> Waiting for collectors to become ready (${AGENT_DS}, ${CLUSTER_DEPLOY})"
kubectl -n "$OTEL_NAMESPACE" rollout status "daemonset/${AGENT_DS}" --timeout="$OTEL_WAIT_TIMEOUT"
kubectl -n "$OTEL_NAMESPACE" rollout status "deployment/${CLUSTER_DEPLOY}" --timeout="$OTEL_WAIT_TIMEOUT"

# ============================================================
# PROMETHEUS PODMONITOR (kube-prometheus-stack)
# ============================================================
#
# honorLabels keeps job="cadvisor" / "node-exporter" / "kube-state-metrics" /
# "inspektor-gadget" from the collector; pipeline="otel" separates these series
# from the ones kube-prometheus-stack scrapes directly.

if kubectl get crd podmonitors.monitoring.coreos.com >/dev/null 2>&1; then
    if [ -z "$PROM_STACK_RELEASE" ]; then
        PROM_STACK_RELEASE="$(kubectl get prometheus -A \
            -o jsonpath='{.items[0].metadata.labels.release}' 2>/dev/null || true)"
    fi

    if [ -n "$PROM_STACK_RELEASE" ]; then
        echo "==> Creating PodMonitor (release label: ${PROM_STACK_RELEASE})"
        cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: ${PODMONITOR_NAME}
  namespace: ${OTEL_NAMESPACE}
  labels:
    release: ${PROM_STACK_RELEASE}
spec:
  selector:
    matchExpressions:
      - key: app.kubernetes.io/instance
        operator: In
        values: [${OTEL_AGENT_RELEASE}, ${OTEL_CLUSTER_RELEASE}]
  podMetricsEndpoints:
    - port: prom-exporter
      interval: ${OTEL_COLLECTION_INTERVAL}
      honorLabels: true
      metricRelabelings:
        - action: replace
          targetLabel: pipeline
          replacement: otel
    - port: metrics
      interval: 30s
EOF
        PODMONITOR_CREATED="true"
    else
        echo "WARN: PodMonitor CRD found but no Prometheus release label detected;"
        echo "      set PROM_STACK_RELEASE and re-run to enable scraping."
    fi
else
    echo "==> PodMonitor CRD not found; skipping Prometheus integration"
fi

# ============================================================
# OTLP/HTTP INGRESS
# ============================================================

if [ "$OTEL_ENABLE_INGRESS" = "true" ] && [ -z "$CLUSTER_SVC" ]; then
    echo "WARN: no Service found for ${OTEL_CLUSTER_RELEASE}; skipping ingress"
    OTEL_ENABLE_INGRESS="false"
fi

if [ "$OTEL_ENABLE_INGRESS" = "true" ]; then
    echo "==> Creating OTLP/HTTP ingress (${OTEL_HOST} -> ${CLUSTER_SVC})"
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: otel-otlp-http
  namespace: ${OTEL_NAMESPACE}
spec:
  ingressClassName: ${INGRESS_CLASS}
  rules:
    - host: ${OTEL_HOST}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${CLUSTER_SVC}
                port:
                  number: 4318
EOF
fi

# ============================================================
# PROMETHEUS VERIFICATION
# ============================================================

# Returns the scalar value of a single-sample instant query, or empty
prom_query() {
    curl -fsS --max-time 10 "${PROMETHEUS_URL}/api/v1/query" \
        --data-urlencode "query=$1" 2>/dev/null \
        | sed -n 's/.*"value":\[[^,]*,"\([^"]*\)"\].*/\1/p'
}

# check_source <enabled> <label> <promql-selector>
check_source() {
    [ "$1" = "true" ] || return 0
    n="$(prom_query "count($3)")"
    if [ -n "$n" ]; then
        printf '    %-20s %s series\n' "$2" "$n"
    else
        printf '    %-20s MISSING\n' "$2"
        VERIFY_RESULT="partial"
    fi
}

VERIFY_RESULT="skipped"

if [ "$PROM_VERIFY" = "true" ] && [ "$PODMONITOR_CREATED" = "true" ]; then
    if ! command -v curl >/dev/null 2>&1; then
        echo "WARN: curl not found; skipping Prometheus verification"
    elif ! curl -fsS --max-time 10 "${PROMETHEUS_URL}/-/ready" >/dev/null 2>&1; then
        echo "WARN: Prometheus not reachable at ${PROMETHEUS_URL}; skipping verification"
        VERIFY_RESULT="unreachable"
    else
        # Prometheus Operator sets job="<namespace>/<podmonitor>" on the synthetic up series
        JOB="${OTEL_NAMESPACE}/${PODMONITOR_NAME}"

        echo "==> Waiting for Prometheus to scrape the collectors (${PROMETHEUS_URL})"
        i=0
        VERIFY_RESULT="targets-down"
        while [ "$i" -lt "$PROM_VERIFY_RETRIES" ]; do
            TOTAL="$(prom_query "count(up{job=\"${JOB}\"})")"
            UP="$(prom_query "count(up{job=\"${JOB}\"} == 1)")"
            echo "    targets up: ${UP:-0}/${TOTAL:-0}"
            if [ -n "$TOTAL" ] && [ "$TOTAL" = "${UP:-0}" ]; then
                VERIFY_RESULT="ok"
                break
            fi
            i=$((i + 1))
            sleep "$PROM_VERIFY_INTERVAL"
        done

        if [ "$VERIFY_RESULT" = "ok" ]; then
            # Give the collectors' own scrape jobs one more cycle
            sleep "$PROM_VERIFY_INTERVAL"
            echo "==> Checking sources (pipeline=\"otel\")"
            # Regex names tolerate unit suffixes added by the exporter
            check_source true "kubeletstats" \
                '{__name__=~"k8s_pod_cpu.*|k8s_pod_memory.*",pipeline="otel"}'
            check_source true "hostmetrics" \
                '{__name__=~"system_cpu.*|system_memory.*",pipeline="otel"}'
            check_source true "k8s_cluster" \
                '{__name__=~"k8s_pod_phase|k8s_namespace_phase",pipeline="otel"}'
            check_source "$COLLECT_CADVISOR" "cadvisor" \
                '{__name__=~"container_cpu_usage_seconds.*",job="cadvisor",pipeline="otel"}'
            check_source "$COLLECT_NODE_EXPORTER" "node-exporter" \
                '{__name__=~"node_cpu_seconds.*",job="node-exporter",pipeline="otel"}'
            check_source "$COLLECT_KUBE_STATE_METRICS" "kube-state-metrics" \
                '{__name__="kube_pod_status_phase",job="kube-state-metrics",pipeline="otel"}'
            check_source "$COLLECT_INSPEKTOR_GADGET" "inspektor-gadget" \
                '{job="inspektor-gadget",pipeline="otel",__name__!~"up|scrape_.*|target_info|otel_scope_info"}'
        else
            echo "WARN: not all collector targets are up after $((PROM_VERIFY_RETRIES * PROM_VERIFY_INTERVAL))s"
            echo "      check: ${PROMETHEUS_URL}/targets"
        fi
    fi
fi

# ============================================================
# SUMMARY
# ============================================================

echo
echo "============================================================"
echo " OpenTelemetry Collector installed"
echo "============================================================"
echo " Namespace        : ${OTEL_NAMESPACE}"
echo " Agent (DS)       : ${AGENT_DS}"
echo " Cluster (Deploy) : ${CLUSTER_DEPLOY}"
echo
echo " Scraped sources  : cadvisor=${COLLECT_CADVISOR} node-exporter=${COLLECT_NODE_EXPORTER}"
echo "                    kube-state-metrics=${COLLECT_KUBE_STATE_METRICS} inspektor-gadget=${COLLECT_INSPEKTOR_GADGET}"
echo
echo " In-cluster OTLP  : ${AGENT_SVC}.${OTEL_NAMESPACE}.svc:4317 (gRPC)"
echo "                    ${AGENT_SVC}.${OTEL_NAMESPACE}.svc:4318 (HTTP)"
if [ "$OTEL_ENABLE_INGRESS" = "true" ]; then
    echo " External OTLP    : ${OTEL_URL}/v1/{traces,metrics,logs}"
fi
if [ -n "$OTEL_OTLP_ENDPOINT" ]; then
    echo " Upstream OTLP    : ${OTEL_OTLP_ENDPOINT}"
fi
echo " Prometheus       : ${PROMETHEUS_URL} (verification: ${VERIFY_RESULT})"
echo
echo " Example queries (collector pipeline only):"
echo "   sum by (namespace) (rate(container_cpu_usage_seconds_total{job=\"cadvisor\",pipeline=\"otel\",container!=\"\"}[2m]))"
echo "   sum by (namespace, phase) (kube_pod_status_phase{pipeline=\"otel\"})"
echo
echo " Verify manually:"
echo "   kubectl -n ${OTEL_NAMESPACE} get pods -l app.kubernetes.io/name=opentelemetry-collector"
echo "   ${PROMETHEUS_URL}/targets  (look for podMonitor/${OTEL_NAMESPACE}/${PODMONITOR_NAME})"
echo "============================================================"
