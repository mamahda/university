#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

need_cmd ip
need_cmd bridge

info "Creating or verifying Linux bridge: $BRIDGE_NAME"
if ! bridge_exists "$BRIDGE_NAME"; then
  sudo ip link add "$BRIDGE_NAME" type bridge
fi

if ! ip -4 addr show dev "$BRIDGE_NAME" | grep -Fq "${BRIDGE_CIDR%/*}"; then
  sudo ip addr add "$BRIDGE_CIDR" dev "$BRIDGE_NAME"
fi
sudo ip link set "$BRIDGE_NAME" up

create_tap() {
  local tap="$1"

  if ! tap_exists "$tap"; then
    info "Creating TAP interface: $tap"
    sudo ip tuntap add dev "$tap" mode tap user "$USER"
  fi

  sudo ip link set "$tap" up
  sudo ip link set "$tap" master "$BRIDGE_NAME"
}

create_tap "$TAP1"
create_tap "$TAP2"

echo
info "Bridge status"
ip -brief addr show "$BRIDGE_NAME"
bridge link
