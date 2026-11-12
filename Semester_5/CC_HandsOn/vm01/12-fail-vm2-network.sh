#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

tap_exists "$TAP2" || die "$TAP2 does not exist"

info "Disabling VM-2 host-side network attachment: $TAP2"
sudo ip link set "$TAP2" down
ip -brief link show "$TAP2"
