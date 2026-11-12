#!/bin/sh
# add-node.sh <name> [--gpu|--cpu] -- create a clean worker folder from node-1's scripts.
# Equivalent to `cp -r node-X node-N`, but copies only scripts (no state).
set -eu
cd "$(dirname "$0")"
. ./variables.sh

# === Arguments ===
[ $# -ge 1 ] || die "usage: $0 <name> [--gpu|--cpu]"
NAME="$1"
MODE="off"
case "${2:---cpu}" in
    --gpu) MODE="auto" ;;
    --cpu) MODE="off" ;;
    *)     die "second argument must be --gpu or --cpu" ;;
esac
validate_node_name "${NAME}"
[ "${NAME}" != "${CP_NODE}" ] || die "${NAME} is the control plane"
[ ! -e "${ROOT_DIR}/${NAME}" ] || die "${NAME} already exists"

# === Template: first existing worker folder ===
TEMPLATE=""
for w in ${WORKER_NODES}; do TEMPLATE="${w}"; break; done
[ -n "${TEMPLATE}" ] || die "no worker folder to copy from"

# === Create folder (scripts only) ===
mkdir "${ROOT_DIR}/${NAME}"
cp "${ROOT_DIR}/${TEMPLATE}/up.sh" "${ROOT_DIR}/${TEMPLATE}/down.sh" \
   "${ROOT_DIR}/${TEMPLATE}/variables.sh" "${ROOT_DIR}/${NAME}/"
sed -i -E "s/^GPU_MODE=.*/GPU_MODE=\"\\\${GPU_MODE:-${MODE}}\"/" "${ROOT_DIR}/${NAME}/variables.sh"
chmod +x "${ROOT_DIR}/${NAME}"/*.sh
log "created ${NAME}/ from ${TEMPLATE}/ (GPU_MODE=${MODE})"
log "start it with: ./${NAME}/up.sh"
