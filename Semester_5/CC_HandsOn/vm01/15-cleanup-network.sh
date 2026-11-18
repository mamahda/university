#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

info "Removing workshop TAP interfaces and bridge"

for tap in "$TAP1" "$TAP2"; do
  if tap_exists "$tap"; then
    sudo ip link set "$tap" down || true
    sudo ip link del "$tap" || true
  fi
done

if bridge_exists "$BRIDGE_NAME"; then
  sudo ip link set "$BRIDGE_NAME" down || true
  sudo ip link del "$BRIDGE_NAME" type bridge || true
fi

info "Network cleanup complete"
