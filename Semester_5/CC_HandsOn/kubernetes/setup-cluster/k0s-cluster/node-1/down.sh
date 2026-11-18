#!/bin/sh
# down.sh -- drain and remove this worker, release its GPUs.
# PURGE=yes also deletes data/, etc/, logs/.
set -eu
cd "$(dirname "$0")"
. ./variables.sh
require_tools

# === Drain and delete Node object (if control plane is reachable) ===
if cp_ready && kc get node "${NODE_NAME}" >/dev/null 2>&1; then
    kc drain "${NODE_NAME}" --ignore-daemonsets --delete-emptydir-data --force \
        --timeout=60s >/dev/null 2>&1 || warn "drain incomplete"
    kc delete node "${NODE_NAME}" >/dev/null
    log "node object ${NODE_NAME} deleted"
fi

# === Remove container and GPU claims ===
if container_exists "${CONTAINER_NAME}"; then
    docker rm -f "${CONTAINER_NAME}" >/dev/null
    log "${CONTAINER_NAME} removed"
fi
release_gpus "${NODE_NAME}"

# === Purge state ===
if [ "${PURGE:-no}" = "yes" ]; then
    purge_paths "${DATA_DIR}" "${ETC_DIR}" "${LOG_DIR}"
    log "${NODE_NAME} state purged"
fi

restore_kernel_tunables
