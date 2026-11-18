#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

echo "=== Bridge ==="
ip -brief addr show "$BRIDGE_NAME" 2>/dev/null || true

echo
echo "=== TAP interfaces ==="
ip -brief link show "$TAP1" 2>/dev/null || true
ip -brief link show "$TAP2" 2>/dev/null || true

echo
echo "=== Bridge ports ==="
bridge link 2>/dev/null || true

echo
echo "=== Forwarding database ==="
bridge fdb show br "$BRIDGE_NAME" 2>/dev/null || true
