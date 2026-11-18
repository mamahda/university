#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

ensure_dirs

info "Workspace created or verified at: $LAB_ROOT"
find "$LAB_ROOT" -maxdepth 1 -type d -print

echo
if [[ -f "$BASE_IMAGE" ]]; then
  info "Alpine base image found"
  "$QEMU_IMG" info "$BASE_IMAGE"
else
  echo "Alpine base image is not present yet:"
  echo "  $BASE_IMAGE"
  echo
  echo "Create it with HashiCorp Packer or copy the prepared image into:"
  echo "  $IMAGES_DIR/"
  echo
  echo "Expected filename:"
  echo "  alpine-base.qcow2"
fi
