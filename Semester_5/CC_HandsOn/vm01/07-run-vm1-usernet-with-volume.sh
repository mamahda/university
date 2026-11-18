#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

need_cmd "$QEMU_BIN"
need_file "$VM1_IMAGE"
need_file "$VOLUME1_IMAGE"

read -r -a ACCEL <<< "$(qemu_accel_args)"

info "Starting VM-1 with the persistent volume attached"
exec "$QEMU_BIN" \
  -name "$VM1_NAME" \
  "${ACCEL[@]}" \
  -machine "$MACHINE_TYPE" \
  -smp "$VM1_VCPU" \
  -m "$VM1_RAM_MB" \
  -drive "file=$VM1_IMAGE,format=qcow2,if=virtio" \
  -drive "file=$VOLUME1_IMAGE,format=qcow2,if=virtio" \
  -nic user,model=virtio-net-pci \
  -nographic
