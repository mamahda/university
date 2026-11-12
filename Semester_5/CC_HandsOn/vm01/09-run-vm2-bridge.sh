#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

need_cmd "$QEMU_BIN"
need_file "$VM2_IMAGE"
tap_exists "$TAP2" || die "$TAP2 does not exist. Run 05-create-network.sh first."
bridge_exists "$BRIDGE_NAME" || die "$BRIDGE_NAME does not exist. Run 05-create-network.sh first."

read -r -a ACCEL <<< "$(qemu_accel_args)"

info "Starting VM-2 on $BRIDGE_NAME through $TAP2"
exec "$QEMU_BIN" \
  -name "$VM2_NAME" \
  "${ACCEL[@]}" \
  -machine "$MACHINE_TYPE" \
  -smp "$VM2_VCPU" \
  -m "$VM2_RAM_MB" \
  -drive "file=$VM2_IMAGE,format=qcow2,if=virtio" \
  -netdev "tap,id=net0,ifname=$TAP2,script=no,downscript=no" \
  -device virtio-net-pci,netdev=net0 \
  -nographic
