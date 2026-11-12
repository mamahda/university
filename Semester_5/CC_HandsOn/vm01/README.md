# QEMU Workshop Supporting Scripts — Alpine Guest Edition

This bundle supports the self-contained workshop **Building Virtualized Infrastructure with QEMU/KVM** using **Alpine Linux as the explicit guest operating system**.

## Environment model

```text
Linux virtualization host
│
├── QEMU/KVM
│   ├── VM-1
│   │   ├── alpine-base.qcow2 → vm1.qcow2 overlay
│   │   ├── 2 vCPU
│   │   ├── 2 GiB RAM
│   │   └── virtio NIC → tap1
│   │
│   └── VM-2
│       ├── alpine-base.qcow2 → vm2.qcow2 overlay
│       ├── 1 vCPU
│       ├── 1 GiB RAM
│       └── virtio NIC → tap2
│
├── volume1.qcow2
│
└── qemu-br0
    ├── tap1
    └── tap2
```

## Alpine base image assumption

The expected reusable image is:

```text
~/minicloud-lab/images/alpine-base.qcow2
```

The intended build path is HashiCorp Packer + QEMU.

The Alpine image should contain:

```text
bash
ca-certificates
curl
sudo
util-linux
e2fsprogs
iproute2
openssh
```

The workshop bundle includes `guest-check-alpine-packages.sh` to verify these.

## Recommended order

```bash
./01-preflight.sh
./02-setup-workspace.sh
./03-create-vm-overlays.sh
./04-create-volume.sh
./05-create-network.sh
```

Optional external connectivity:

```bash
./061-enable-vm-outside.sh
```

Then start the guests in separate terminals:

```bash
./08-run-vm1-bridge.sh
./09-run-vm2-bridge.sh
```

## Guest networking on Alpine

Find the guest interface:

```bash
ip -brief link
```

For VM-1:

```bash
sudo ./guest-configure-ip.sh eth0 10.10.0.11/24
```

For VM-2:

```bash
sudo ./guest-configure-ip.sh eth0 10.10.0.12/24
```

For outside connectivity through the host:

```bash
sudo ./guest-configure-ip.sh eth0 10.10.0.11/24 10.10.0.1 1.1.1.1
```

or for VM-2:

```bash
sudo ./guest-configure-ip.sh eth0 10.10.0.12/24 10.10.0.1 1.1.1.1
```

The helper writes `/etc/network/interfaces`, so the static configuration survives an Alpine reboot.

## Script map

| Script | Purpose |
|---|---|
| `00-config.sh` | Shared paths, Alpine base-image name, VM sizes, addressing |
| `lib.sh` | Common host-side helpers |
| `01-preflight.sh` | Inspect host QEMU/KVM/CPU/memory/storage/network |
| `02-setup-workspace.sh` | Create workspace and verify `alpine-base.qcow2` |
| `03-create-vm-overlays.sh` | Create VM-1 and VM-2 qcow2 overlays |
| `04-create-volume.sh` | Create persistent qcow2 data volume |
| `05-create-network.sh` | Create `qemu-br0`, `tap1`, and `tap2` |
| `061-enable-vm-outside.sh` | Enable host routing/NAT for the VM subnet |
| `062-disable-vm-outside.sh` | Remove VM outside-access NAT/forwarding |
| `06-run-vm1-usernet.sh` | Start VM-1 using QEMU user-mode networking |
| `07-run-vm1-usernet-with-volume.sh` | Start VM-1 with persistent storage |
| `08-run-vm1-bridge.sh` | Start VM-1 on `tap1` |
| `09-run-vm2-bridge.sh` | Start VM-2 on `tap2` |
| `10-run-vm2-bridge-with-volume.sh` | Optional volume movement experiment |
| `11-network-status.sh` | Inspect bridge and TAP state |
| `12-fail-vm2-network.sh` | Disable `tap2` for controlled failure |
| `13-restore-vm2-network.sh` | Restore `tap2` |
| `14-host-utilization.sh` | Inspect QEMU host resource usage |
| `15-cleanup-network.sh` | Delete bridge and TAP interfaces |
| `18-reset-generated-storage.sh` | Delete generated overlays and data volume |
| `guest-check-alpine-packages.sh` | Verify required Alpine packages |
| `guest-alpine-info.sh` | Collect guest CPU/memory/disk/network observations |
| `guest-configure-ip.sh` | Configure persistent Alpine static networking |
| `guest-prepare-volume.sh` | Format/mount the persistent data disk |
| `guest-mount-volume.sh` | Remount an existing persistent disk |
| `guest-cpu-load.sh` | Generate guest CPU activity |
| `guest-stop-cpu-load.sh` | Stop guest CPU activity |
| `run-all-preparation.sh` | Run host-side preparation sequence |

## Persistent storage

Inside VM-1:

```bash
lsblk
sudo ./guest-prepare-volume.sh /dev/vdb /data
```

After reboot:

```bash
sudo ./guest-mount-volume.sh /dev/vdb /data
```

## Controlled network failure

From VM-1:

```bash
ping 10.10.0.12
```

On the host:

```bash
./12-fail-vm2-network.sh
```

Restore:

```bash
./13-restore-vm2-network.sh
```

## External connectivity

Enable:

```bash
./061-enable-vm-outside.sh
```

Configure the guest with `10.10.0.1` as gateway.

Disable:

```bash
./062-disable-vm-outside.sh
```

VM-to-VM communication on `qemu-br0` remains available.

## Cleanup

```bash
./15-cleanup-network.sh
```

To delete generated overlays and the workshop data volume:

```bash
./18-reset-generated-storage.sh
```

The Alpine base image is not deleted.


## Building alpine-base.qcow2 with Packer

The bundle includes a legacy JSON Packer template:

```text
packer/alpine-qemu.json
```

and the unattended Alpine installer it serves during the ISO boot:

```text
packer/http/install-alpine-packer.sh
```

See:

```text
packer/README.md
```

for validation and build commands.

The expected output is:

```text
output-alpine/alpine-base.qcow2
```

Copy that image to:

```text
~/minicloud-lab/images/alpine-base.qcow2
```

before running `03-create-vm-overlays.sh`.
