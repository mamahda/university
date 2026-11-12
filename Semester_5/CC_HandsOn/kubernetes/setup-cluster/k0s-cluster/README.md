# k0s cluster on one Linux host: node-cp + node-1 + node-2 (GPU)

Prerequisites already on the host: `k0s` and `kubectl` in `$PATH`, and Docker.
GPU nodes also need the NVIDIA driver (`nvidia-smi`) and `nvidia-container-toolkit`.

```
k0s-cluster/
├── variables.sh  lib.sh            cluster-wide settings + helpers
├── up-all.sh  down-all.sh          convenience: ordered start / stop
├── add-node.sh                     create a clean worker folder (scripts only)
├── test-gpu.sh                     CUDA vectoradd pod requesting nvidia.com/gpu
├── images/gpu-node/                Dockerfile + entrypoint (GPU rootfs, built on demand)
├── node-cp/  up.sh down.sh token.sh variables.sh
│             → data/ etc/ logs/ tokens/<node>.token admin.kubeconfig
├── node-1/   up.sh down.sh variables.sh            (GPU_MODE=off; name = folder name)
│             → data/ etc/ logs/
└── node-2/   up.sh down.sh variables.sh            (GPU_MODE=auto)
              → data/ etc/ logs/
```

## Design

Each node is a privileged container whose whole state is bind-mounted from its
own folder (`data/` → `/var/lib/k0s`, `etc/` → `/etc/k0s`, `logs/` →
`/var/log/pods`). The host `k0s` binary is bind-mounted read-only into every
node, so the cluster version is always the version in your `$PATH`. Containers
are the isolation boundary: two kubelets cannot share one host network namespace.

The scripts never touch systemd, `/etc`, sysctl, modules, the Docker daemon
config, or `~/.kube`.
- Control-plane ports are published on `127.0.0.1` and the docker0 gateway only,
  so they are not exposed to the LAN.
- Privileged kubelet/kube-proxy change a few kernel tunables at runtime
  (e.g. `vm.overcommit_memory`, `nf_conntrack_max`). The first `up.sh` snapshots
  them and the last `down.sh` restores them.

## Step 1: Start the control plane

```sh
./node-cp/up.sh
export KUBECONFIG=$PWD/node-cp/admin.kubeconfig
```

This validates `node-cp/etc/k0s.yaml` with the host `k0s`, starts `k0s-node-cp`,
waits for `/readyz`, writes `admin.kubeconfig`, and issues
`node-cp/tokens/node-1.token` and `node-cp/tokens/node-2.token`.

## Step 2: Start node-1 (CPU worker)

```sh
./node-1/up.sh
```

The script refuses to start unless node-cp is running and its API answers
`/readyz`; on failure it reports which condition failed. It copies `../node-cp/tokens/node-1.token`, asking `node-cp/token.sh`
for a fresh token if the copy is missing or near expiry.

## Step 3: Start node-2 (GPU worker, auto-detected)

```sh
./node-2/up.sh
```

With `GPU_MODE=auto`, the script does the following:

1. Detects GPUs with `nvidia-smi`.
2. Claims unclaimed GPUs by UUID in `.gpu-claims/`.
3. Builds `local/k0s-gpu-node` once.
4. Tests passthrough with `docker run --gpus`.

If all of that succeeds, the node starts as a GPU node. It gets:

- the `nvidia.com/gpu.present=true` label
- a containerd drop-in in `node-2/etc/containerd.d/nvidia.toml`, in v3 format
  for k0s >= 1.36 and v2 for older versions
- the NVIDIA device plugin and an `nvidia` RuntimeClass, after which the script
  waits for `nvidia.com/gpu` capacity

If any step fails, node-2 starts as a CPU node with a warning. `GPU_MODE=on`
makes failure fatal instead.

node-1 uses the same logic but defaults to `GPU_MODE=off`, because on a
single-GPU host the GPU is reserved for node-2. The claim files would also
prevent double allocation if both nodes were set to auto.

## Step 4: Verify

```sh
kubectl get nodes -o wide -L nvidia.com/gpu.present
./test-gpu.sh                      # expect "Test PASSED"
```

node-cp does not appear in `kubectl get nodes`: a controller without a kubelet
registers no Node object.

## Adding a worker node

A worker's node name is its folder name, and workers are discovered from the
`node-*/` folders. To add a node, create a folder and run its `up.sh`.

```sh
./add-node.sh node-3          # CPU worker (GPU_MODE=off)
./add-node.sh node-4 --gpu    # GPU-capable worker (GPU_MODE=auto)
./node-3/up.sh
```

`add-node.sh` copies only the three scripts. A plain `cp -r node-1 node-3` also
works:

- `node-3/up.sh` gets its own token from `node-cp/tokens/node-3.token`, issued
  on demand.
- If the copy carried node-1's state, `up.sh` detects it through the
  `etc/node-name` marker and wipes it before joining.

Still, prefer `add-node.sh`. `data/` contains root-owned files, so `cp -r` of a
node that has already run prints permission errors and copies identity you do
not want.

Rules:

- Folder names must be valid node names: lowercase letters, digits and `-`,
  e.g. `node-3`.
- Copy `node-2` (or use `--gpu`) for a GPU-capable node. GPUs are claimed by
  UUID, so a second GPU worker only gets GPUs that no other node holds. On a
  single-GPU host it starts as a CPU node.
- To remove a node: `./node-3/down.sh && PURGE=yes ./node-3/down.sh`, then
  delete the folder.

## Stop / reset

```sh
./node-2/down.sh                   # drains, deletes Node, releases GPU claims
./node-1/down.sh
./node-cp/down.sh                  # refuses while workers exist (FORCE=yes overrides)
PURGE=yes ./down-all.sh            # full reset: wipes data/ etc/ logs/ tokens/
```

## Key variables

| Variable | Default | Where |
|----------|---------|-------|
| `GPU_MODE` | node-1 `off`, node-2 `auto` | node `variables.sh` |
| `GPU_CANDIDATES` | `all` (or `0`, `0,1`, UUIDs) | node `variables.sh` |
| `GPU_STRICT_ISOLATION` | `no` (`yes` = only pods requesting `nvidia.com/gpu` see the GPU) | `variables.sh` |
| `CNI_PROVIDER` | `calico` (or `kuberouter`); fixed once the cluster exists | `variables.sh` |
| `CALICO_MODE` / `CALICO_OVERLAY` / `CALICO_WIREGUARD` | `vxlan` / `Always` / `false` | `variables.sh` |
| `API_PORT` / `JOIN_PORT` / `KONNECTIVITY_PORT` | 6443 / 9443 / 8132 | `variables.sh` |
| `RESTART_POLICY` | `no` (nodes run only when started by `up.sh`) | `variables.sh` |
| `NODE_MEMORY` / `NODE_CPUS` | unlimited | `variables.sh` |
| `TOKEN_EXPIRY_HOURS` | 24 | `variables.sh` |

## Troubleshooting

| Symptom | Check |
|---------|-------|
| `node-cp readiness check failed` | the message names the failing condition (container missing/exited, kubeconfig missing, API unreachable); rerun `./node-cp/up.sh` |
| node-cp container exits, etcd permission errors | node folder on NFS/CIFS/FUSE (root squash); put state on local disk: `DATA_DIR=/local/k0s/node-cp/data ./node-cp/up.sh` (same for workers) |
| Host `kubectl` times out on 127.0.0.1 | shell has `https_proxy` set; `export NO_PROXY=127.0.0.1,localhost` (the scripts already bypass it) |
| Image pull fails for node-cp/node-1 | the host k0s version must have a `k0sproject/k0s` tag; set `K0S_NODE_IMAGE` otherwise |
| Worker never registers | host firewall must allow docker0 → gateway ports 6443/8132 |
| node-2 starts as CPU node | `docker run --rm --gpus all ubuntu nvidia-smi` must work (nvidia-container-toolkit) |
| `nvidia.com/gpu` missing | `kubectl -n kube-system logs ds/nvidia-device-plugin-daemonset` |
| GPU pod fails with cgroup/device error | `GPU_NO_CGROUPS=yes ./node-2/up.sh` (after `./node-2/down.sh`) |
| Pods stuck, `too many open files` | host `fs.inotify.max_user_instances` too low (not changed by these scripts) |
