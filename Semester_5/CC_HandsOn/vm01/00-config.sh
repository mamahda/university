#!/usr/bin/env bash
# Shared configuration for the Alpine-based workshop.
# Edit this file if your environment uses different paths, names, or addresses.

set -euo pipefail

LAB_ROOT="${LAB_ROOT:-$PWD/lab}"
IMAGES_DIR="${IMAGES_DIR:-$LAB_ROOT/images}"
INSTANCES_DIR="${INSTANCES_DIR:-$LAB_ROOT/instances}"
STORAGE_DIR="${STORAGE_DIR:-$LAB_ROOT/storage}"
SCRIPTS_DIR="${SCRIPTS_DIR:-$LAB_ROOT/scripts}"

BASE_IMAGE="${BASE_IMAGE:-$IMAGES_DIR/alpine-base.qcow2}"
VM1_IMAGE="${VM1_IMAGE:-$INSTANCES_DIR/vm1.qcow2}"
VM2_IMAGE="${VM2_IMAGE:-$INSTANCES_DIR/vm2.qcow2}"
VOLUME1_IMAGE="${VOLUME1_IMAGE:-$STORAGE_DIR/volume1.qcow2}"

VM1_NAME="${VM1_NAME:-vm1}"
VM2_NAME="${VM2_NAME:-vm2}"

VM1_VCPU="${VM1_VCPU:-2}"
VM1_RAM_MB="${VM1_RAM_MB:-2048}"
VM2_VCPU="${VM2_VCPU:-1}"
VM2_RAM_MB="${VM2_RAM_MB:-1024}"

VOLUME1_SIZE="${VOLUME1_SIZE:-2G}"

BRIDGE_NAME="${BRIDGE_NAME:-qemu-br0}"
BRIDGE_CIDR="${BRIDGE_CIDR:-10.10.0.1/24}"
HOST_BRIDGE_IP="${HOST_BRIDGE_IP:-10.10.0.1}"
VM_SUBNET="${VM_SUBNET:-10.10.0.0/24}"

TAP1="${TAP1:-tap1}"
TAP2="${TAP2:-tap2}"

VM1_IP="${VM1_IP:-10.10.0.11/24}"
VM2_IP="${VM2_IP:-10.10.0.12/24}"

QEMU_BIN="${QEMU_BIN:-qemu-system-x86_64}"
QEMU_IMG="${QEMU_IMG:-qemu-img}"
MACHINE_TYPE="${MACHINE_TYPE:-q35}"

# Set FORCE_TCG=1 to disable KVM even when /dev/kvm exists.
FORCE_TCG="${FORCE_TCG:-0}"
