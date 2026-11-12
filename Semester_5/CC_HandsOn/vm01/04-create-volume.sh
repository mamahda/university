#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

ensure_dirs
need_cmd "$QEMU_IMG"

if [[ -e "$VOLUME1_IMAGE" ]]; then
  info "Volume already exists; leaving unchanged: $VOLUME1_IMAGE"
else
  info "Creating persistent virtual volume: $VOLUME1_IMAGE ($VOLUME1_SIZE)"
  "$QEMU_IMG" create -f qcow2 "$VOLUME1_IMAGE" "$VOLUME1_SIZE"
fi

echo
"$QEMU_IMG" info "$VOLUME1_IMAGE"

echo
info "Host-side allocation"
ls -lh "$VOLUME1_IMAGE"
du -h "$VOLUME1_IMAGE"
