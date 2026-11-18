#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

info "Checking required commands"
for cmd in "$QEMU_BIN" "$QEMU_IMG" ip bridge lsblk lscpu free nproc; do
  need_cmd "$cmd"
done

echo
info "QEMU"
"$QEMU_BIN" --version | head -n 1
"$QEMU_IMG" --version | head -n 1

echo
info "KVM availability"
if [[ -c /dev/kvm ]]; then
  ls -l /dev/kvm
  if [[ -r /dev/kvm && -w /dev/kvm ]]; then
    echo "KVM acceleration is available to the current user."
  else
    echo "KVM device exists, but the current user does not have read/write access."
    echo "The launch scripts will fall back to TCG software emulation."
  fi
else
  echo "/dev/kvm is not available."
  echo "The launch scripts will use TCG software emulation."
fi

echo
info "Host CPU"
lscpu | sed -n '1,20p'
echo "Visible processing units: $(nproc)"

echo
info "Host memory"
free -h

echo
info "Host block devices"
lsblk

echo
info "Host network interfaces"
ip -brief link

echo
info "Preflight complete"
