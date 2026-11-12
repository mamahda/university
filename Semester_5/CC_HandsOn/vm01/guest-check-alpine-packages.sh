#!/usr/bin/env bash
# Verify that the Packer-generated Alpine base image contains the packages
# expected by the workshop.

set -euo pipefail

[[ -f /etc/alpine-release ]] || {
  echo "This script expects Alpine Linux." >&2
  exit 1
}

required_packages="
bash
ca-certificates
curl
sudo
util-linux
e2fsprogs
iproute2
openssh
"

missing=0

echo "Alpine $(cat /etc/alpine-release)"
echo

for pkg in $required_packages; do
  if apk info -e "$pkg" >/dev/null 2>&1; then
    printf 'OK      %s\n' "$pkg"
  else
    printf 'MISSING %s\n' "$pkg"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  echo
  echo "Install missing packages with:"
  echo "  apk add --no-cache bash ca-certificates curl sudo util-linux e2fsprogs iproute2 openssh"
  exit 1
fi

echo
echo "All expected workshop packages are installed."
