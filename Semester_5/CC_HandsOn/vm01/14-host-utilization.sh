#!/usr/bin/env bash
set -euo pipefail

echo "=== QEMU processes ==="
pgrep -a qemu-system || true

echo
echo "=== Per-QEMU CPU and memory usage ==="
ps -o pid,%cpu,%mem,etime,cmd -C qemu-system-x86_64 2>/dev/null || true

echo
echo "For a live view, run:"
echo "  top"
echo "or:"
echo "  watch -n 1 'ps -o pid,%cpu,%mem,etime,cmd -C qemu-system-x86_64'"
