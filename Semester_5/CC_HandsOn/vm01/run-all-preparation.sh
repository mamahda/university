#!/usr/bin/env bash
# Non-destructive Alpine workshop preparation.
# Does not start VMs and does not format guest filesystems.

set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/01-preflight.sh"
"$SCRIPT_DIR/02-setup-workspace.sh"
"$SCRIPT_DIR/03-create-vm-overlays.sh"
"$SCRIPT_DIR/04-create-volume.sh"
"$SCRIPT_DIR/05-create-network.sh"

echo "Optional outside connectivity:"
echo "  $SCRIPT_DIR/061-enable-vm-outside.sh"
echo
echo "Start Alpine guests:"
echo "  VM-1: $SCRIPT_DIR/08-run-vm1-bridge.sh"
echo "  VM-2: $SCRIPT_DIR/09-run-vm2-bridge.sh"
