#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

need_cmd "$QEMU_BIN"
need_file "$VM1_IMAGE"

read -r -a ACCEL <<< "$(qemu_accel_args)"

info "Starting VM-1 with QEMU user-mode networking"
info "Exit the serial console with Ctrl+A then X, or shut down the guest normally."

exec "$QEMU_BIN" \
  -name "$VM1_NAME" \
  "${ACCEL[@]}" \
  -machine "$MACHINE_TYPE" \
  -smp "$VM1_VCPU" \
  -m "$VM1_RAM_MB" \
  -drive "file=$VM1_IMAGE,format=qcow2,if=virtio" \
  -nic user,model=virtio-net-pci \
  -nographic
