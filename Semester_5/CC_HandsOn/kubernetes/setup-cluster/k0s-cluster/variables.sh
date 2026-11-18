#!/bin/sh
# variables.sh -- cluster-wide settings. Every value can be overridden from the environment.


ROOT_DIR="${ROOT_DIR:-$(pwd)}"

# === Topology ===
CLUSTER_NAME="${CLUSTER_NAME:-k0s-lab}"
CONTAINER_PREFIX="${CONTAINER_PREFIX:-k0s-}"
CP_NODE="${CP_NODE:-node-cp}"
# workers = every node-*/ folder with an up.sh, except the control plane (so cp -r adds a node)
WORKER_NODES="${WORKER_NODES:-$(cd "${ROOT_DIR}" && for d in node-*/; do
    d="${d%/}"; if [ "${d}" != "${CP_NODE}" ] && [ -f "${d}/up.sh" ]; then echo "${d}"; fi
done | sort -V | tr '\n' ' ')}"
CP_DIR="${CP_DIR:-${ROOT_DIR}/${CP_NODE}}"
CP_CONTAINER="${CP_CONTAINER:-${CONTAINER_PREFIX}${CP_NODE}}"
CP_KUBECONFIG="${CP_KUBECONFIG:-${CP_DIR}/admin.kubeconfig}"

# === Images (k0s itself always comes from the host PATH, bind-mounted read-only) ===
K0S_IMAGE_REPO="${K0S_IMAGE_REPO:-docker.io/k0sproject/k0s}"   # rootfs for CPU nodes, tag = host k0s version
K0S_NODE_IMAGE="${K0S_NODE_IMAGE:-}"                           # empty = ${K0S_IMAGE_REPO}:<host k0s version>
GPU_NODE_IMAGE="${GPU_NODE_IMAGE:-local/k0s-gpu-node:latest}"  # built from images/gpu-node
GPU_BASE_IMAGE="${GPU_BASE_IMAGE:-ubuntu:24.04}"

# === Control-plane endpoints (published on 127.0.0.1 and the docker0 gateway only) ===
API_PORT="${API_PORT:-6443}"
JOIN_PORT="${JOIN_PORT:-9443}"
KONNECTIVITY_PORT="${KONNECTIVITY_PORT:-8132}"
GATEWAY_ADDR="${GATEWAY_ADDR:-}"                               # empty = docker0 gateway

# === Cluster networking ===
CNI_PROVIDER="${CNI_PROVIDER:-calico}"                # calico | kuberouter (fixed at cluster creation)
CALICO_MODE="${CALICO_MODE:-vxlan}"                     # vxlan | bird
CALICO_OVERLAY="${CALICO_OVERLAY:-Always}"              # Always | CrossSubnet | Never (Never needs vxlan mode)
CALICO_WIREGUARD="${CALICO_WIREGUARD:-false}"           # true needs WireGuard in the host kernel
CALICO_MTU="${CALICO_MTU:-0}"                           # 0 = auto-detect
POD_CIDR="${POD_CIDR:-10.244.0.0/16}"
SERVICE_CIDR="${SERVICE_CIDR:-10.96.0.0/12}"

# === Node runtime ===
RESTART_POLICY="${RESTART_POLICY:-no}"                         # no = nodes only run when you run up.sh
NODE_MEMORY="${NODE_MEMORY:-}"                                 # e.g. 4g; empty = unlimited
NODE_CPUS="${NODE_CPUS:-}"                                     # e.g. 2;  empty = unlimited
TOKEN_EXPIRY_HOURS="${TOKEN_EXPIRY_HOURS:-24}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-300}"                            # seconds

# === GPU ===
GPU_STRICT_ISOLATION="${GPU_STRICT_ISOLATION:-no}"             # yes = GPU only for pods requesting nvidia.com/gpu
GPU_NO_CGROUPS="${GPU_NO_CGROUPS:-no}"                         # yes = nvidia-container-cli skips device cgroups
DEVICE_PLUGIN_VERSION="${DEVICE_PLUGIN_VERSION:-v0.19.2}"
GPU_TEST_IMAGE="${GPU_TEST_IMAGE:-nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda12.5.0}"

INGRESS_HTTP_PORT="${INGRESS_HTTP_PORT:-28080}"
INGRESS_HTTPS_PORT="${INGRESS_HTTPS_PORT:-28443}"

. "${ROOT_DIR}/lib.sh"
