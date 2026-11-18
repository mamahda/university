#!/usr/bin/env bash
# Run inside an Alpine guest to collect the key observations used in the workshop.

set -euo pipefail

echo "=== Alpine release ==="
cat /etc/alpine-release 2>/dev/null || true

echo
echo "=== Hostname ==="
hostname

echo
echo "=== CPU ==="
lscpu

echo
echo "=== Memory ==="
free -h

echo
echo "=== Block devices ==="
lsblk

echo
echo "=== Network ==="
ip -brief addr

echo
echo "=== Routes ==="
ip route

echo
echo "=== OpenRC services ==="
rc-status 2>/dev/null || true
