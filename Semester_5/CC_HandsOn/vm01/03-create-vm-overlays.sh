#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

ensure_dirs
need_cmd "$QEMU_IMG"
need_file "$BASE_IMAGE"

create_overlay() {
  local target="$1"

  if [[ -e "$target" ]]; then
    info "Overlay already exists; leaving unchanged: $target"
    "$QEMU_IMG" info "$target"
    return
  fi

  info "Creating overlay: $target"
  "$QEMU_IMG" create \
    -f qcow2 \
    -F qcow2 \
    -b "$BASE_IMAGE" \
    "$target"

  "$QEMU_IMG" info "$target"
}

create_overlay "$VM1_IMAGE"
create_overlay "$VM2_IMAGE"

info "VM overlays ready"
