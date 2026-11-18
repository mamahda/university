#!/usr/bin/env bash
# Run INSIDE an Alpine guest VM.
#
# SAFETY: this formats the device supplied as the first argument.
#
# Usage:
#   sudo ./guest-prepare-volume.sh /dev/vdb /data

set -euo pipefail

DEVICE="${1:-/dev/vdb}"
MOUNTPOINT="${2:-/data}"

for cmd in lsblk mkfs.ext4 mount mountpoint; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Missing command '$cmd'." >&2
    echo "Expected Alpine packages include: util-linux e2fsprogs" >&2
    exit 1
  }
done

[[ -b "$DEVICE" ]] || {
  echo "Block device not found: $DEVICE" >&2
  lsblk
  exit 1
}

echo "Selected device:"
lsblk "$DEVICE"

if lsblk -nr -o MOUNTPOINT "$DEVICE" | grep -qE '.+'; then
  echo "Refusing to format: $DEVICE or one of its children is mounted." >&2
  exit 1
fi

echo
echo "WARNING: this will create a new ext4 filesystem on $DEVICE."
read -r -p "Type FORMAT to continue: " answer
[[ "$answer" == "FORMAT" ]] || {
  echo "Cancelled."
  exit 1
}

mkfs.ext4 "$DEVICE"
mkdir -p "$MOUNTPOINT"
mount "$DEVICE" "$MOUNTPOINT"

echo "Cloud Computing Lab - persistent Alpine volume" > "$MOUNTPOINT/test.txt"

echo
df -h "$MOUNTPOINT"
echo
cat "$MOUNTPOINT/test.txt"
