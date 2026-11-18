#!/bin/sh
# variables.sh -- worker node (name taken from this folder)

ROOT_DIR="${ROOT_DIR:-$(cd .. && pwd)}"
. "${ROOT_DIR}/variables.sh"

# === Node ===
NODE_DIR="${NODE_DIR:-$(pwd)}"
NODE_NAME="${NODE_NAME:-$(basename "${NODE_DIR}")}"   # node name = folder name
CONTAINER_NAME="${CONTAINER_NAME:-${CONTAINER_PREFIX}${NODE_NAME}}"
WORKER_LABELS="${WORKER_LABELS:-}"                # e.g. lab/tier=general

# === GPU ===
GPU_MODE="${GPU_MODE:-auto}"                # auto: GPU node if a GPU is detected and passthrough works
                                                   # on:   require GPU (fail if unavailable)
GPU_CANDIDATES="${GPU_CANDIDATES:-all}"           # all | comma list of indices/UUIDs, e.g. 0 or 0,1

# === State kept in this folder ===
DATA_DIR="${DATA_DIR:-${NODE_DIR}/data}"           # -> /var/lib/k0s
ETC_DIR="${ETC_DIR:-${NODE_DIR}/etc}"              # -> /etc/k0s (worker.token, containerd.d/)
LOG_DIR="${LOG_DIR:-${NODE_DIR}/logs}"             # -> /var/log/pods
TOKEN_SRC="${TOKEN_SRC:-${CP_DIR}/tokens/${NODE_NAME}.token}"
