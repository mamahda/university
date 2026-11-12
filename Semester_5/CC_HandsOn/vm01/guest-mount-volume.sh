#!/usr/bin/env bash
# Run INSIDE an Alpine guest VM after the data disk has already been formatted.
#
# Usage:
#   sudo ./guest-mount-volume.sh /dev/vdb /data

set -euo pipefail

DEVICE="${1:-/dev/vdb}"
MOUNTPOINT="${2:-/data}"

for cmd in mount mountpoint lsblk; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Missing command '$cmd'. Expected Alpine package: util-linux" >&2
    exit 1
  }
done

[[ -b "$DEVICE" ]] || {
  echo "Block device not found: $DEVICE" >&2
  lsblk
  exit 1
}

mkdir -p "$MOUNTPOINT"

if mountpoint -q "$MOUNTPOINT"; then
  echo "$MOUNTPOINT is already mounted."
else
  mount "$DEVICE" "$MOUNTPOINT"
fi

df -h "$MOUNTPOINT"

if [[ -f "$MOUNTPOINT/test.txt" ]]; then
  echo
  echo "Persistent test data:"
  cat "$MOUNTPOINT/test.txt"
fi
