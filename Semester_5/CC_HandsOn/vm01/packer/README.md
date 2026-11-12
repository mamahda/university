# Alpine QEMU Base Image with HashiCorp Packer

This directory builds the workshop base image:

```text
alpine-base.qcow2
```

## Files

```text
packer/
├── alpine-qemu.json
├── alpine-qemu-vars.example.json
└── http/
    └── install-alpine-packer.sh
```

## Prerequisites

Install:

- HashiCorp Packer
- QEMU
- KVM access if using `"accelerator": "kvm"`

Place an Alpine Standard x86_64 ISO at:

```text
iso/alpine-standard-x86_64.iso
```

The default JSON template uses `"alpine_iso_checksum": "none"` only so the
template can be inspected and adapted without a version-specific checksum.
For an actual build, use the official SHA-256 checksum.

Copy the example variable file:

```bash
cp packer/alpine-qemu-vars.example.json packer/alpine-qemu-vars.json
```

Replace:

```text
sha256:REPLACE_WITH_OFFICIAL_ALPINE_ISO_SHA256
```

with the checksum for the exact Alpine ISO being used.

## Validate

From the root of this bundle:

```bash
packer validate \
  -var-file=packer/alpine-qemu-vars.json \
  packer/alpine-qemu.json
```

## Build

```bash
packer build \
  -var-file=packer/alpine-qemu-vars.json \
  packer/alpine-qemu.json
```

The resulting image is normally:

```text
output-alpine/alpine-base.qcow2
```

Copy it into the workshop image directory:

```bash
cp output-alpine/alpine-base.qcow2 \
  ~/minicloud-lab/images/alpine-base.qcow2
```

## Without KVM

If `/dev/kvm` is unavailable on the Packer host, use:

```json
{
  "accelerator": "tcg"
}
```

in the variable file. The build will be significantly slower.

## Build sequence

Packer:

1. boots the Alpine ISO;
2. logs into the live installer as `root`;
3. obtains DHCP on `eth0`;
4. downloads `install-alpine-packer.sh` from Packer's temporary HTTP server;
5. installs Alpine to `/dev/vda`;
6. reboots;
7. reconnects to the installed system over SSH;
8. verifies the expected workshop packages;
9. shuts down the VM and emits the qcow2 image.

The generated image is intended to be a reusable backing image. Workshop VM
disks should be qcow2 overlays rather than direct modifications of this file.
