#!/bin/sh
# up.sh -- start this worker and join it to node-cp.
# Becomes a GPU node automatically when a GPU is detected (GPU_MODE=auto).
set -eu
cd "$(dirname "$0")"
. ./variables.sh

# === Pre-flight ===
require_tools
validate_node_name "${NODE_NAME}"
check_host
check_state_fs "${NODE_DIR}"

# === Gate: control plane must be up and running ===
cp_ready || cp_diagnose_and_die

if container_running "${CONTAINER_NAME}"; then
    log "${NODE_NAME} already running"
    kc get node "${NODE_NAME}" -o wide
    exit 0
fi

# === Join token (owned by node-cp, copied here) ===
if ! token_fresh "${TOKEN_SRC}"; then
    log "token missing or near expiry; asking ${CP_NODE} for a new one"
    "${CP_DIR}/token.sh" "${NODE_NAME}"
fi
guard_copied_state
cp "${TOKEN_SRC}" "${ETC_DIR}/worker.token"
chmod 600 "${ETC_DIR}/worker.token"

# === GPU detection ===
GPU_NODE="no"
GPU_UUIDS=""
DROPIN="${ETC_DIR}/containerd.d/nvidia.toml"
case "${GPU_MODE}" in
    off)
        log "GPU: disabled for this node"
        ;;
    auto|on)
        if host_has_gpu; then
            claim_gpus "${NODE_NAME}" "${GPU_CANDIDATES}"
            if [ -n "${GPU_UUIDS}" ]; then
                ensure_gpu_image
                if gpu_passthrough_ok "\"device=${GPU_UUIDS}\""; then
                    GPU_NODE="yes"
                else
                    release_gpus "${NODE_NAME}"
                    [ "${GPU_MODE}" = "on" ] && die "GPU passthrough failed (is nvidia-container-toolkit installed?)"
                    warn "GPU passthrough failed; starting as CPU node"
                fi
            else
                [ "${GPU_MODE}" = "on" ] && die "no unclaimed GPU available"
                log "GPU: none unclaimed; starting as CPU node"
            fi
        else
            [ "${GPU_MODE}" = "on" ] && die "GPU_MODE=on but no GPU detected (nvidia-smi)"
            log "GPU: none detected; starting as CPU node"
        fi
        ;;
    *)
        die "GPU_MODE must be auto, on or off"
        ;;
esac

if [ "${GPU_NODE}" = "yes" ]; then
    NODE_IMAGE="${GPU_NODE_IMAGE}"
    NODE_LABELS="nvidia.com/gpu.present=true${WORKER_LABELS:+,${WORKER_LABELS}}"
    write_nvidia_dropin "${DROPIN}"
    log "GPU: provisioning as GPU node with ${GPU_UUIDS}"
else
    NODE_IMAGE="${K0S_NODE_IMAGE}"
    NODE_LABELS="${WORKER_LABELS}"
    rm -f "${DROPIN}"
fi

# === Start worker container ===
snapshot_kernel_tunables
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
set -- run -d \
    --name "${CONTAINER_NAME}" --hostname "${NODE_NAME}" \
    --privileged --cgroupns=host --restart "${RESTART_POLICY}" \
    --label "k0s.cluster=${CLUSTER_NAME}" --label "k0s.role=worker" \
    --label "k0s.gpu=${GPU_NODE}" \
    -v "${K0S_HOST_BIN}:/usr/local/bin/k0s:ro" \
    -v "${DATA_DIR}:/var/lib/k0s" \
    -v "${ETC_DIR}:/etc/k0s" \
    -v "${LOG_DIR}:/var/log/pods" \
    -v /lib/modules:/lib/modules:ro
if [ "${GPU_NODE}" = "yes" ]; then
    set -- "$@" --gpus "\"device=${GPU_UUIDS}\"" \
        -e "GPU_STRICT_ISOLATION=${GPU_STRICT_ISOLATION}" \
        -e "GPU_NO_CGROUPS=${GPU_NO_CGROUPS}"
fi
if [ -n "${NODE_MEMORY}" ]; then set -- "$@" --memory "${NODE_MEMORY}"; fi
if [ -n "${NODE_CPUS}" ]; then set -- "$@" --cpus "${NODE_CPUS}"; fi
set -- "$@" "${NODE_IMAGE}" k0s worker --token-file=/etc/k0s/worker.token --profile=docker
if [ -n "${NODE_LABELS}" ]; then set -- "$@" --labels="${NODE_LABELS}"; fi
docker "$@" >/dev/null
log "${CONTAINER_NAME} started"

# === Wait for registration and readiness ===
wait_for "${NODE_NAME} registered" "${WAIT_TIMEOUT}" kc get node "${NODE_NAME}"
kc wait --for=condition=Ready "node/${NODE_NAME}" --timeout="${WAIT_TIMEOUT}s"

# === GPU stack ===
if [ "${GPU_NODE}" = "yes" ]; then
    deploy_gpu_stack
    wait_for "${NODE_NAME} nvidia.com/gpu capacity" "${WAIT_TIMEOUT}" node_has_gpu_capacity "${NODE_NAME}"
fi

kc get node "${NODE_NAME}" -o wide \
    -L nvidia.com/gpu.present
