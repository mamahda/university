#!/bin/sh
# down.sh -- stop node-cp. Refuses while workers exist unless FORCE=yes.
# PURGE=yes also deletes data/, etc/, logs/, tokens/, admin.kubeconfig.
set -eu
cd "$(dirname "$0")"
. ./variables.sh
require_tools

# === Guard ===
running_workers="$(docker ps -q --filter "label=k0s.cluster=${CLUSTER_NAME}" --filter "label=k0s.role=worker")"
if [ -n "${running_workers}" ] && [ "${FORCE:-no}" != "yes" ]; then
    die "workers still running; stop them first (../node-*/down.sh) or set FORCE=yes"
fi

# === Remove container ===
if container_exists "${CONTAINER_NAME}"; then
    docker rm -f "${CONTAINER_NAME}" >/dev/null
    log "${CONTAINER_NAME} removed"
fi

# === Purge state ===
if [ "${PURGE:-no}" = "yes" ]; then
    purge_paths "${DATA_DIR}" "${ETC_DIR}" "${LOG_DIR}" "${TOKEN_DIR}"
    rm -f "${CP_KUBECONFIG}"
    log "${NODE_NAME} state purged"
fi

restore_kernel_tunables
