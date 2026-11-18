#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

cat <<EOF
This resets generated workshop storage by deleting:
  $VM1_IMAGE
  $VM2_IMAGE
  $VOLUME1_IMAGE

The reusable base image is NOT deleted:
  $BASE_IMAGE
EOF

read -r -p "Type DELETE to continue: " answer
[[ "$answer" == "DELETE" ]] || die "Cancelled"

rm -f -- "$VM1_IMAGE" "$VM2_IMAGE" "$VOLUME1_IMAGE"
info "Generated VM overlays and data volume removed"
