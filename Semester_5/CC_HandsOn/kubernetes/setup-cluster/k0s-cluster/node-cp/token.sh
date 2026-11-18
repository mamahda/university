#!/bin/sh
# token.sh <worker-name> -- issue a fresh worker join token into ./tokens/<worker-name>.token
set -eu
cd "$(dirname "$0")"
. ./variables.sh

[ $# -eq 1 ] || die "usage: $0 <worker-name>"
require_tools
cp_ready || die "${NODE_NAME} is not up and running; run ./up.sh first"

# === Issue token ===
mkdir -p "${TOKEN_DIR}"
chmod 700 "${TOKEN_DIR}"
TMP="${TOKEN_DIR}/.$1.token.tmp"
docker exec "${CONTAINER_NAME}" k0s token create --role=worker \
    --expiry="${TOKEN_EXPIRY_HOURS}h" > "${TMP}"
chmod 600 "${TMP}"
mv -f "${TMP}" "${TOKEN_DIR}/$1.token"
log "token: ${TOKEN_DIR}/$1.token (valid ${TOKEN_EXPIRY_HOURS}h)"
