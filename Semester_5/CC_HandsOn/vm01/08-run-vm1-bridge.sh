#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

need_cmd "$QEMU_BIN"
need_file "$VM1_IMAGE"
need_file "$VOLUME1_IMAGE"
tap_exists "$TAP1" || die "$TAP1 does not exist. Run 05-create-network.sh first."
bridge_exists "$BRIDGE_NAME" || die "$BRIDGE_NAME does not exist. Run 05-create-network.sh first."

read -r -a ACCEL <<< "$(qemu_accel_args)"

info "Starting VM-1 on $BRIDGE_NAME through $TAP1"
exec "$QEMU_BIN" \
  -name "$VM1_NAME" \
  "${ACCEL[@]}" \
  -machine "$MACHINE_TYPE" \
  -smp "$VM1_VCPU" \
  -m "$VM1_RAM_MB" \
  -drive "file=$VM1_IMAGE,format=qcow2,if=virtio" \
  -drive "file=$VOLUME1_IMAGE,format=qcow2,if=virtio" \
  -netdev "tap,id=net0,ifname=$TAP1,script=no,downscript=no" \
  -device virtio-net-pci,netdev=net0 \
  -nographic
