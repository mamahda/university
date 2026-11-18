#!/usr/bin/env bash
# Run INSIDE an Alpine guest VM.
#
# Usage:
#   sudo ./guest-configure-ip.sh <interface> <CIDR> [gateway] [dns]
#
# VM-1 example:
#   sudo ./guest-configure-ip.sh eth0 10.10.0.11/24 10.10.0.1 1.1.1.1
#
# VM-2 example:
#   sudo ./guest-configure-ip.sh eth0 10.10.0.12/24 10.10.0.1 1.1.1.1
#
# This script:
#   - configures the address immediately with `ip`
#   - optionally installs a default route
#   - optionally writes /etc/resolv.conf
#   - writes /etc/network/interfaces so the configuration survives reboot
#   - enables Alpine's networking service at boot

set -euo pipefail

IFACE="${1:-}"
CIDR="${2:-}"
GATEWAY="${3:-}"
DNS="${4:-}"

if [[ -z "$IFACE" || -z "$CIDR" ]]; then
  echo "Usage: $0 <interface> <CIDR> [gateway] [dns]" >&2
  exit 1
fi

command -v ip >/dev/null 2>&1 || {
  echo "Missing 'ip'. Install Alpine package: iproute2" >&2
  exit 1
}

ip link show "$IFACE" >/dev/null 2>&1 || {
  echo "Interface does not exist: $IFACE" >&2
  ip -brief link
  exit 1
}

PREFIX="${CIDR#*/}"
ADDR="${CIDR%/*}"

ip addr flush dev "$IFACE"
ip addr add "$CIDR" dev "$IFACE"
ip link set "$IFACE" up

if [[ -n "$GATEWAY" ]]; then
  ip route replace default via "$GATEWAY"
fi

if [[ -n "$DNS" ]]; then
  printf 'nameserver %s\n' "$DNS" > /etc/resolv.conf
fi

cat > /etc/network/interfaces <<EOF
auto lo
iface lo inet loopback

auto $IFACE
iface $IFACE inet static
    address $ADDR/$PREFIX
EOF

if [[ -n "$GATEWAY" ]]; then
  printf '    gateway %s\n' "$GATEWAY" >> /etc/network/interfaces
fi

if command -v rc-update >/dev/null 2>&1; then
  rc-update add networking boot >/dev/null 2>&1 || true
fi

echo
echo "Current interface configuration:"
ip -brief addr show "$IFACE"

echo
echo "Current routes:"
ip route

if [[ -n "$GATEWAY" ]]; then
  echo
  echo "Testing gateway $GATEWAY"
  ping -c 4 "$GATEWAY"
fi
