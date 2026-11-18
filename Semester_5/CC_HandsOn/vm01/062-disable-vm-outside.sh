#!/usr/bin/env bash
# Disable outbound connectivity for VMs connected to qemu-br0.
#
# This removes only the NAT and FORWARD rules installed by
# 061-enable-vm-outside.sh.
#
# By default, IPv4 forwarding is left enabled because the Linux host might
# be using it for another purpose. Set DISABLE_IP_FORWARD=1 if you explicitly
# want this script to set net.ipv4.ip_forward=0.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

VM_SUBNET="${VM_SUBNET:-10.10.0.0/24}"
OUT_IFACE="${OUT_IFACE:-}"
DISABLE_IP_FORWARD="${DISABLE_IP_FORWARD:-0}"

need_cmd ip
need_cmd iptables
need_cmd sysctl

if [[ -z "$OUT_IFACE" ]]; then
  OUT_IFACE="$(
    ip route show default \
      | awk '/^default / {for (i=1; i<=NF; i++) if ($i=="dev") {print $(i+1); exit}}'
  )"
fi

[[ -n "$OUT_IFACE" ]] || die "Could not detect the host's default outbound interface."

delete_rule_if_present() {
  local table="$1"
  shift

  # Delete all exact duplicates if present.
  while sudo iptables -t "$table" -C "$@" 2>/dev/null; do
    sudo iptables -t "$table" -D "$@"
  done
}

info "VM subnet:          $VM_SUBNET"
info "VM bridge:          $BRIDGE_NAME"
info "Outbound interface: $OUT_IFACE"

info "Removing outbound NAT rule"
delete_rule_if_present nat POSTROUTING \
  -s "$VM_SUBNET" \
  -o "$OUT_IFACE" \
  -j MASQUERADE

info "Removing VM outbound FORWARD rule"
delete_rule_if_present filter FORWARD \
  -i "$BRIDGE_NAME" \
  -o "$OUT_IFACE" \
  -s "$VM_SUBNET" \
  -j ACCEPT

info "Removing return-traffic FORWARD rule"
delete_rule_if_present filter FORWARD \
  -i "$OUT_IFACE" \
  -o "$BRIDGE_NAME" \
  -d "$VM_SUBNET" \
  -m conntrack \
  --ctstate RELATED,ESTABLISHED \
  -j ACCEPT

if [[ "$DISABLE_IP_FORWARD" == "1" ]]; then
  info "Disabling IPv4 forwarding"
  sudo sysctl -w net.ipv4.ip_forward=0 >/dev/null
else
  info "Leaving global IPv4 forwarding unchanged"
fi

echo
info "Outbound VM connectivity is disabled."

cat <<EOF

VM-to-VM and VM-to-host bridge communication are unchanged.
Only forwarding/NAT from $VM_SUBNET toward $OUT_IFACE was removed.

EOF
