#!/bin/sh
# test-gpu.sh -- run a CUDA vectoradd pod that requests one nvidia.com/gpu.
set -eu
cd "$(dirname "$0")"
. ./variables.sh
require_tools
cp_ready || die "${CP_NODE} is not up and running"

# === Pod ===
kc delete pod gpu-smoke --ignore-not-found >/dev/null
cat <<YAML | kc apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-smoke
spec:
  restartPolicy: Never
  containers:
    - name: vectoradd
      image: ${GPU_TEST_IMAGE}
      resources:
        limits:
          nvidia.com/gpu: 1
YAML

# === Result ===
if kc wait --for=jsonpath='{.status.phase}'=Succeeded pod/gpu-smoke --timeout="${WAIT_TIMEOUT}s"; then
    kc logs gpu-smoke
    kc get pod gpu-smoke -o wide
    kc delete pod gpu-smoke >/dev/null
    log "GPU test passed"
else
    kc describe pod gpu-smoke
    kc logs gpu-smoke 2>/dev/null || true
    die "GPU test failed"
fi
