#!/bin/sh
# up-all.sh -- node-cp, then each worker, in order.
set -eu
cd "$(dirname "$0")"
. ./variables.sh

"${CP_DIR}/up.sh"
for w in ${WORKER_NODES}; do
    "${ROOT_DIR}/${w}/up.sh"
done
kc get nodes -o wide -L nvidia.com/gpu.present
