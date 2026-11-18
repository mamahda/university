#!/usr/bin/env bash
# Enable outbound connectivity for VMs connected to qemu-br0.
#
# This script:
#   1. Enables IPv4 forwarding on the Linux host.
#   2. Detects the host's default outbound interface.
#   3. Adds FORWARD rules for traffic from the VM network.
#   4. Adds a NAT/MASQUERADE rule for 10.10.0.0/24.
#
# It does NOT configure the guest's default route or DNS.
#
# Guest example:
#   sudo ip route replace default via 10.10.0.1
#
# For DNS, configure a resolver appropriate for your environment.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

VM_SUBNET="${VM_SUBNET:-10.10.0.0/24}"
OUT_IFACE="${OUT_IFACE:-}"

need_cmd ip
need_cmd iptables
need_cmd sysctl

bridge_exists "$BRIDGE_NAME" || die "$BRIDGE_NAME does not exist. Run 05-create-network.sh first."

if [[ -z "$OUT_IFACE" ]]; then
  OUT_IFACE="$(
    ip route show default \
      | awk '/^default / {for (i=1; i<=NF; i++) if ($i=="dev") {print $(i+1); exit}}'
  )"
fi

[[ -n "$OUT_IFACE" ]] || die "Could not detect the host's default outbound interface."

ip link show "$OUT_IFACE" >/dev/null 2>&1 \
  || die "Outbound interface does not exist: $OUT_IFACE"

info "VM subnet:          $VM_SUBNET"
info "VM bridge:          $BRIDGE_NAME"
info "Outbound interface: $OUT_IFACE"

info "Enabling IPv4 forwarding"
sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null

add_rule_if_missing() {
  local table="$1"
  shift
  if ! sudo iptables -t "$table" -C "$@" 2>/dev/null; then
    sudo iptables -t "$table" -A "$@"
  fi
}

info "Adding outbound NAT"
add_rule_if_missing nat POSTROUTING \
  -s "$VM_SUBNET" \
  -o "$OUT_IFACE" \
  -j MASQUERADE

info "Allowing VM traffic to leave through $OUT_IFACE"
add_rule_if_missing filter FORWARD \
  -i "$BRIDGE_NAME" \
  -o "$OUT_IFACE" \
  -s "$VM_SUBNET" \
  -j ACCEPT

info "Allowing established return traffic"
add_rule_if_missing filter FORWARD \
  -i "$OUT_IFACE" \
  -o "$BRIDGE_NAME" \
  -d "$VM_SUBNET" \
  -m conntrack \
  --ctstate RELATED,ESTABLISHED \
  -j ACCEPT

echo
info "Outbound VM connectivity is enabled."

cat <<EOF

Inside each VM, make sure the default route points to the host bridge:

  sudo ip route replace default via $HOST_BRIDGE_IP

Then test:

  ping -c 4 $HOST_BRIDGE_IP
  ping -c 4 8.8.8.8

If IP connectivity works but DNS names do not resolve, configure DNS
inside the guest according to the guest operating system.

To disable outbound access again:

  $SCRIPT_DIR/062-disable-vm-outside.sh

EOF
