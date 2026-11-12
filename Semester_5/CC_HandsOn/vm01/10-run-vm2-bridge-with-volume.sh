#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

need_cmd "$QEMU_BIN"
need_file "$VM2_IMAGE"
need_file "$VOLUME1_IMAGE"
tap_exists "$TAP2" || die "$TAP2 does not exist. Run 05-create-network.sh first."

cat <<EOF
This script attaches the persistent volume to VM-2.

IMPORTANT:
  Ensure VM-1 is stopped before using this script.
  Do not attach the same writable qcow2 volume to two running VMs.
EOF

read -r -p "Type YES to continue: " answer
[[ "$answer" == "YES" ]] || die "Cancelled"

read -r -a ACCEL <<< "$(qemu_accel_args)"

exec "$QEMU_BIN" \
  -name "$VM2_NAME" \
  "${ACCEL[@]}" \
  -machine "$MACHINE_TYPE" \
  -smp "$VM2_VCPU" \
  -m "$VM2_RAM_MB" \
  -drive "file=$VM2_IMAGE,format=qcow2,if=virtio" \
  -drive "file=$VOLUME1_IMAGE,format=qcow2,if=virtio" \
  -netdev "tap,id=net0,ifname=$TAP2,script=no,downscript=no" \
  -device virtio-net-pci,netdev=net0 \
  -nographic
