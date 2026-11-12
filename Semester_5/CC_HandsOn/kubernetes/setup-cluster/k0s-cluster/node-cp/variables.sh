#!/bin/sh
# variables.sh -- control-plane node (node-cp)

ROOT_DIR="${ROOT_DIR:-$(cd .. && pwd)}"
. "${ROOT_DIR}/variables.sh"

# === Node ===
NODE_NAME="${NODE_NAME:-${CP_NODE}}"
NODE_DIR="${NODE_DIR:-$(pwd)}"
CONTAINER_NAME="${CONTAINER_NAME:-${CP_CONTAINER}}"

# === State kept in this folder ===
DATA_DIR="${DATA_DIR:-${NODE_DIR}/data}"     # -> /var/lib/k0s
ETC_DIR="${ETC_DIR:-${NODE_DIR}/etc}"        # -> /etc/k0s (k0s.yaml)
LOG_DIR="${LOG_DIR:-${NODE_DIR}/logs}"       # -> /var/log/pods
TOKEN_DIR="${TOKEN_DIR:-${NODE_DIR}/tokens}" # worker join tokens, read by ../node-*/up.sh
