#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=00-config.sh
source "$SCRIPT_DIR/00-config.sh"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

info() {
  echo "==> $*"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

need_file() {
  [[ -f "$1" ]] || die "Required file not found: $1"
}

qemu_accel_args() {
  if [[ "$FORCE_TCG" == "1" ]]; then
    echo "-accel tcg"
  elif [[ -c /dev/kvm && -r /dev/kvm && -w /dev/kvm ]]; then
    echo "-enable-kvm -cpu host"
  else
    echo "-accel tcg"
  fi
}

ensure_dirs() {
  mkdir -p "$IMAGES_DIR" "$INSTANCES_DIR" "$STORAGE_DIR" "$SCRIPTS_DIR"
}

tap_exists() {
  ip link show "$1" >/dev/null 2>&1
}

bridge_exists() {
  ip link show "$1" >/dev/null 2>&1
}
