#!/bin/sh
# down-all.sh -- workers (reverse order), then node-cp. Honors PURGE=yes.
set -eu
cd "$(dirname "$0")"
. ./variables.sh

rev=""
for w in ${WORKER_NODES}; do rev="${w} ${rev}"; done
for w in ${rev}; do
    "${ROOT_DIR}/${w}/down.sh"
done
"${CP_DIR}/down.sh"
