#!/bin/sh
# lib.sh -- helper functions, sourced via variables.sh

# === Logging ===
log()  { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '[%s] WARN: %s\n' "$(date +%H:%M:%S)" "$*" >&2; }
die()  { printf '[%s] ERROR: %s\n' "$(date +%H:%M:%S)" "$*" >&2; exit 1; }

# === Prerequisites ===
require_tools() {
    for _t in k0s kubectl docker; do
        command -v "${_t}" >/dev/null 2>&1 || die "${_t} not found in PATH"
    done
    docker info >/dev/null 2>&1 || die "cannot reach the docker daemon (root or docker group needed)"
    K0S_HOST_BIN="$(readlink -f "$(command -v k0s)")"
    K0S_VERSION="$(k0s version)"
    K0S_MINOR="$(printf '%s' "${K0S_VERSION}" | sed -E 's/^v?[0-9]+\.([0-9]+).*/\1/')"
    if [ -z "${K0S_NODE_IMAGE}" ]; then
        # Docker Hub tags use '-' where k0s versions use '+'
        K0S_NODE_IMAGE="${K0S_IMAGE_REPO}:$(printf '%s' "${K0S_VERSION}" | tr '+' '-')"
    fi
}

# === Docker ===
container_exists()  { docker inspect "$1" >/dev/null 2>&1; }
container_running() { [ "$(docker inspect -f '{{.State.Running}}' "$1" 2>/dev/null)" = "true" ]; }
cluster_containers() { docker ps -aq --filter "label=k0s.cluster=${CLUSTER_NAME}"; }

resolve_gateway() {
    if [ -z "${GATEWAY_ADDR}" ]; then
        GATEWAY_ADDR="$(docker network inspect bridge \
            --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}' 2>/dev/null || true)"
    fi
    [ -n "${GATEWAY_ADDR}" ] || die "cannot determine docker0 gateway; set GATEWAY_ADDR"
}

# === Control plane ===
# loopback must bypass any HTTP(S)_PROXY set in the shell (common on campus networks)
kc() {
    NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,${NO_PROXY}}" \
    no_proxy="127.0.0.1,localhost${no_proxy:+,${no_proxy}}" \
        kubectl --kubeconfig "${CP_KUBECONFIG}" "$@"
}

cp_ready() {
    container_running "${CP_CONTAINER}" \
        && [ -s "${CP_KUBECONFIG}" ] \
        && kc get --raw=/readyz >/dev/null 2>&1
}

# Explain which readiness condition fails, then exit.
cp_diagnose_and_die() {
    warn "${CP_NODE} readiness check failed:"
    if ! container_exists "${CP_CONTAINER}"; then
        warn "  container ${CP_CONTAINER} does not exist (node-cp/up.sh never succeeded)"
    elif ! container_running "${CP_CONTAINER}"; then
        warn "  container ${CP_CONTAINER} exited: $(docker inspect -f '{{.State.Status}} code={{.State.ExitCode}} {{.State.Error}}' "${CP_CONTAINER}")"
        warn "  last log lines:"
        docker logs --tail 25 "${CP_CONTAINER}" 2>&1 | sed 's/^/    /' >&2
    elif [ ! -s "${CP_KUBECONFIG}" ]; then
        warn "  ${CP_KUBECONFIG} missing (up.sh stopped before exporting it)"
    else
        warn "  API not answering via ${CP_KUBECONFIG}:"
        kc get --raw=/readyz 2>&1 | tail -n 5 | sed 's/^/    /' >&2
        if docker exec "${CP_CONTAINER}" k0s kubectl get --raw=/readyz >/dev/null 2>&1; then
            warn "  API is healthy inside the container -> host-side path problem (proxy env, port ${API_PORT} publish)"
        fi
    fi
    die "fix the above, then rerun ${CP_DIR}/up.sh"
}

# Warn when node state sits on a filesystem that etcd/containerd handle badly.
check_state_fs() {
    _fs="$(stat -f -c %T "$1" 2>/dev/null || echo unknown)"
    case "${_fs}" in
        nfs*|cifs|smb*|fuse*|ceph|glusterfs|9p|overlayfs|unknown)
            warn "$1 is on '${_fs}': etcd/containerd may fail (root squash, no overlay support)."
            warn "  use a local disk: DATA_DIR=/local/path/${NODE_NAME:-node}/data $0" ;;
    esac
}

# === Node identity (folder name = node name) ===
validate_node_name() {
    printf '%s' "$1" | grep -Eq '^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$' \
        || die "folder name '$1' is not a valid node name (lowercase letters, digits, '-')"
}

# State copied from another node folder (cp -r) carries that node's identity
# (kubelet certs, token, GPU drop-in). Detect it and start clean.
guard_copied_state() {
    _marker="${ETC_DIR}/node-name"
    if [ -s "${_marker}" ] && [ "$(cat "${_marker}")" != "${NODE_NAME}" ]; then
        warn "state in ${NODE_DIR} belongs to '$(cat "${_marker}")' (copied folder); resetting it"
        purge_paths "${DATA_DIR}" "${ETC_DIR}" "${LOG_DIR}"
    fi
    mkdir -p "${DATA_DIR}" "${ETC_DIR}" "${LOG_DIR}"
    printf '%s\n' "${NODE_NAME}" > "${_marker}"
}

# === Polling ===
wait_for() {
    _desc="$1"; _timeout="$2"; shift 2
    _elapsed=0
    until "$@" >/dev/null 2>&1; do
        [ "${_elapsed}" -ge "${_timeout}" ] && die "${_desc}: not ready after ${_timeout}s"
        sleep 5
        _elapsed=$((_elapsed + 5))
    done
    log "${_desc}: ready"
}

# === Host checks (read-only; nothing is changed) ===
check_host() {
    for _m in overlay br_netfilter; do
        [ -d "/sys/module/${_m}" ] || warn "kernel module ${_m} not loaded; pods may load it on demand"
    done
    _inst="$(cat /proc/sys/fs/inotify/max_user_instances 2>/dev/null || echo 0)"
    [ "${_inst}" -ge 512 ] || warn "fs.inotify.max_user_instances=${_inst} is low for 3 nodes; raise it yourself if pods fail"
}

# === Kernel tunables ===
# Privileged kubelet/kube-proxy adjust a few global sysctls at runtime.
# Snapshot them before the first node starts; restore after the last node stops.
KERNEL_TUNABLES="vm/overcommit_memory vm/panic_on_oom kernel/panic kernel/panic_on_oops \
kernel/keys/root_maxkeys kernel/keys/root_maxbytes net/netfilter/nf_conntrack_max"
SNAPSHOT_FILE="${ROOT_DIR}/.host-sysctl.snapshot"

snapshot_kernel_tunables() {
    [ -n "$(cluster_containers)" ] && return 0
    : > "${SNAPSHOT_FILE}"
    for _k in ${KERNEL_TUNABLES}; do
        [ -r "/proc/sys/${_k}" ] && printf '%s %s\n' "${_k}" "$(cat "/proc/sys/${_k}")" >> "${SNAPSHOT_FILE}"
    done
    log "host sysctl snapshot saved (${SNAPSHOT_FILE})"
}

restore_kernel_tunables() {
    [ -n "$(cluster_containers)" ] && return 0
    [ -s "${SNAPSHOT_FILE}" ] || return 0
    _script=""
    while read -r _k _v; do
        _script="${_script}echo '${_v}' > /proc/sys/${_k} 2>/dev/null || true; "
    done < "${SNAPSHOT_FILE}"
    docker run --rm --privileged --entrypoint /bin/sh "${K0S_NODE_IMAGE}" -c "${_script}"
    rm -f "${SNAPSHOT_FILE}"
    log "host sysctls restored to pre-cluster values"
}

# === Token handling (tokens live in node-cp/tokens) ===
token_fresh() {
    [ -s "$1" ] || return 1
    _max=$(( TOKEN_EXPIRY_HOURS * 60 - 30 ))
    [ -z "$(find "$1" -mmin +"${_max}" 2>/dev/null)" ]
}

# === GPU ===
GPU_CLAIM_DIR="${ROOT_DIR}/.gpu-claims"

host_has_gpu() {
    command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi -L >/dev/null 2>&1
}

# claim_gpus <node> <candidates: all | comma list of indices/UUIDs> -> sets GPU_UUIDS
claim_gpus() {
    GPU_UUIDS=""
    mkdir -p "${GPU_CLAIM_DIR}"
    for _row in $(nvidia-smi --query-gpu=index,uuid --format=csv,noheader | tr -d ' '); do
        _idx="${_row%%,*}"; _uuid="${_row#*,}"
        if [ "$2" != "all" ]; then
            case ",$2," in *",${_idx},"*|*",${_uuid},"*) ;; *) continue ;; esac
        fi
        _claim="${GPU_CLAIM_DIR}/${_uuid}"
        if [ -s "${_claim}" ]; then
            _owner="$(cat "${_claim}")"
            if [ "${_owner}" != "$1" ] && container_exists "${CONTAINER_PREFIX}${_owner}"; then
                log "GPU ${_idx} (${_uuid}) already claimed by ${_owner}"
                continue
            fi
        fi
        echo "$1" > "${_claim}"
        GPU_UUIDS="${GPU_UUIDS:+${GPU_UUIDS},}${_uuid}"
    done
}

release_gpus() {
    [ -d "${GPU_CLAIM_DIR}" ] || return 0
    for _claim in "${GPU_CLAIM_DIR}"/*; do
        [ -f "${_claim}" ] && [ "$(cat "${_claim}")" = "$1" ] && rm -f "${_claim}"
    done
    return 0
}

ensure_gpu_image() {
    if [ "${REBUILD_GPU_IMAGE:-no}" = "yes" ] || ! docker image inspect "${GPU_NODE_IMAGE}" >/dev/null 2>&1; then
        log "building ${GPU_NODE_IMAGE}"
        docker build --build-arg BASE_IMAGE="${GPU_BASE_IMAGE}" \
            -t "${GPU_NODE_IMAGE}" "${ROOT_DIR}/images/gpu-node"
    fi
}

# gpu_passthrough_ok <docker --gpus value>
gpu_passthrough_ok() {
    docker run --rm --gpus "$1" --entrypoint nvidia-smi "${GPU_NODE_IMAGE}" -L
}

# containerd drop-in: nvidia-container-runtime as default runtime on this node.
# k0s >= 1.36 ships containerd 2 (config v3); older k0s uses config v2.
write_nvidia_dropin() {
    mkdir -p "$(dirname "$1")"
    if [ "${K0S_MINOR}" -ge 36 ]; then
        _plugin='io.containerd.cri.v1.runtime'; _ver=3
    else
        _plugin='io.containerd.grpc.v1.cri'; _ver=2
    fi
    cat > "$1" <<TOML
version = ${_ver}

[plugins."${_plugin}".containerd]
  default_runtime_name = "nvidia"

[plugins."${_plugin}".containerd.runtimes.nvidia]
  runtime_type = "io.containerd.runc.v2"

[plugins."${_plugin}".containerd.runtimes.nvidia.options]
  BinaryName = "/usr/bin/nvidia-container-runtime"
TOML
}

# RuntimeClass + NVIDIA device plugin, restricted to GPU-labelled nodes. Idempotent.
deploy_gpu_stack() {
    _ds="nvidia-device-plugin-daemonset"
    cat <<'YAML' | kc apply -f -
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: nvidia
handler: nvidia
scheduling:
  nodeSelector:
    nvidia.com/gpu.present: "true"
YAML
    kc apply -f "https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/${DEVICE_PLUGIN_VERSION}/deployments/static/nvidia-device-plugin.yml"
    kc -n kube-system patch daemonset "${_ds}" --type=merge \
        -p '{"spec":{"template":{"spec":{"nodeSelector":{"nvidia.com/gpu.present":"true"}}}}}'
    if [ "${GPU_STRICT_ISOLATION}" = "yes" ]; then
        kc -n kube-system set env "daemonset/${_ds}" DEVICE_LIST_STRATEGY=volume-mounts
        kc -n kube-system patch daemonset "${_ds}" --type=json \
            -p '[{"op":"add","path":"/spec/template/spec/containers/0/securityContext","value":{"privileged":true}}]'
    fi
    kc -n kube-system rollout status "daemonset/${_ds}" --timeout="${WAIT_TIMEOUT}s"
}

node_has_gpu_capacity() {
    kc get node "$1" -o jsonpath='{.status.allocatable.nvidia\.com/gpu}' | grep -Eq '^[1-9]'
}

# === Purge a node folder's state (files are root-owned inside the container) ===
purge_paths() {
    for _p in "$@"; do
        [ -e "${_p}" ] || continue
        docker run --rm --entrypoint /bin/sh -v "$(dirname "${_p}")":/w "${K0S_NODE_IMAGE}" \
            -c "rm -rf '/w/$(basename "${_p}")'"
    done
}
