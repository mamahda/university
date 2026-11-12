# vdc-cluster — A Beginner's Guide (assume you know nothing)

This document explains the project from the ground up: what problem it solves, what every
piece of jargon means, how the pieces fit together, and what you can actually type to make
things happen. No prior knowledge of virtualization, networking, or cloud infrastructure is
assumed.

---

## 1. What problem is this solving?

Real cloud providers (AWS, GCP, Azure) run thousands of physical servers. Customers ("tenants")
rent virtual machines (VMs) from that pool. The provider's software decides:

- which physical server a VM runs on,
- what private network that VM belongs to (so Tenant A's VMs never see Tenant B's VMs),
- what IP address it gets,
- how a new physical server joins the pool of available capacity.

**vdc-cluster is a tiny, from-scratch model of that system**, built to run on a laptop/PC using
nested virtualization (VMs inside a VM). It is a teaching tool: by building the control plane
yourself, you see exactly what a cloud provider's infrastructure has to do, instead of it being
hidden behind an AWS console.

"VDC" = **Virtual Data Center**.

---

## 2. Background concepts (the jargon, explained)

| Term | Plain-English meaning |
|---|---|
| **VM (virtual machine)** | A simulated computer running inside your real computer. QEMU is the program that simulates it; KVM is the Linux feature that makes this fast by using the CPU's virtualization support. |
| **Nested virtualization** | Running a VM *inside* a VM. Your PC runs a "spoke" VM, and that spoke VM runs further VMs (the actual tenant guests) inside itself. Needs a CPU/BIOS setting called "nested KVM" turned on. |
| **libvirt / libvirtd** | A standard daemon + API for managing VMs (start/stop/define disks/networks) so you don't have to hand-write raw QEMU command lines every time. `virsh` is its CLI. |
| **Alpine Linux** | A very small, fast Linux distribution. Used here because the VM images need to boot and configure themselves in seconds, not minutes. |
| **Packer** | A tool that automates "install an OS into a disk image." Used here to bake the `hub.qcow2` and `spoke.qcow2` images once, so booting a new node is instant instead of re-installing an OS every time. |
| **qcow2** | A VM disk image file format that supports copy-on-write — i.e., you can make a "linked clone" that only stores the *differences* from a base image, instead of copying the whole disk. This is why cloning a spoke is fast and cheap. |
| **Bridge (Linux bridge)** | A virtual network switch inside Linux. VMs' virtual network cards (`tap` devices) plug into a bridge the same way real cables plug into a real switch. |
| **Underlay network** | The "real" network connecting the hub and spoke VMs to each other (and across PCs, to a physical switch). Think of it as the data center's physical cabling. |
| **Overlay network** | A virtual network built *on top of* the underlay, using tunnels, so that tenant traffic is logically separate even though it physically travels over the same wires. |
| **Geneve tunnel** | A way to encapsulate one tenant's network traffic inside UDP packets so it can cross the underlay without mixing with other tenants' traffic or the underlay itself. (Similar in purpose to VXLAN.) |
| **VNI** | "Virtual Network Identifier" — a number that tags which tenant's overlay a packet belongs to. |
| **IPAM** | "IP Address Management" — the system that hands out IP addresses to guest VMs automatically so no human has to track which addresses are taken. |
| **cloud-init** | A standard mechanism baked into most cloud OS images (Ubuntu, Debian, etc.) that configures a fresh VM on first boot — hostname, password, network settings — by reading a small "seed" disk image. |
| **Control plane** | The "brain": the component that makes decisions (where to place a VM, who's allowed to join, what addresses are free). Here, that's the **hub**. |
| **Compute node** | A machine that actually runs the tenant's workloads once told to. Here, that's a **spoke**. |
| **Hub-and-spoke topology** | One central node (hub) that every other node (spoke) connects to directly, rather than spokes talking to each other point-to-point. |

---

## 3. The big picture

```
PC 1 (main)                                         PC 2 (worker)               PC n ...
 br-under 10.20.1.1 ── [uplink NIC] ── switch ── [uplink NIC] ── br-under 10.20.2.1
   ├─ hub   10.20.0.2   <- control plane + compute       ├─ hv201 10.20.2.101
   ├─ hv101 10.20.1.101 <- hypervisor spoke               └─ hv202 10.20.2.102
   └─ hv102 10.20.1.102 <- hypervisor spoke
```

- Everything can run on **one PC** (simplest case — no uplink NIC, no switch needed).
- Or it can span **multiple physical PCs** on the same switch, which is closer to how a real
  data center scales: you add a new physical machine, and it just becomes more capacity.

There are exactly two *kinds* of VM in this system (built from two separate pre-baked images):

### The hub (one per cluster — the brain)
Runs on the main PC. Responsibilities:
- **DNS** (`dnsmasq`) — so nodes can be addressed by name (`hv101.lab`) instead of raw IPs.
- **Join API** (`lab-api`) — a small HTTP service new spokes call to request membership.
- **Overlay management** (`lab-hub`) — creates a Geneve tunnel + bridge for every
  tenant-to-spoke pairing.
- **Admin CLI** (`hubctl`) — the tool *you* use to create tenants, upload images, launch guest
  VMs, inspect nodes, etc.
- **NAT** — gives the whole underlay internet access through the hub's uplink.
- Optionally it can *also* run tenant guest VMs itself, like any other spoke.

### The spoke (as many as you want — the muscle)
A hypervisor node. Responsibilities:
- **Self-configuration at boot** (`lab-net`) — picks its own underlay IP address with zero
  manual setup.
- **Joins the hub** (`lab-agent`) — sends a one-time secret token, receives a permanent node
  identity back (similar to how a Kubernetes kubelet certificate works).
- **Stays in sync** — polls the hub every 10 seconds, builds/tears-down tunnels and bridges as
  tenants come and go.
- **Runs the actual tenant guest VMs** via `libvirtd` — this is where CirrOS, Ubuntu, etc.
  guests physically live.

**Important idea: the spoke image has no identity baked in.** The `.qcow2` file you boot from
is completely generic — no hostname, no SSH keys, no node name. Every time you clone it and
boot it, it generates a fresh identity and registers itself with the hub. This is exactly how
"add a server to the pool" should work in a real cloud: you don't hand-configure each new
machine, you just boot it and it finds its place.

---

## 4. How a brand-new spoke joins (step by step)

1. You run `cluster.sh spoke add 1`. This clones the spoke image into a new disk and boots it
   with a unique MAC address and an SMBIOS value saying "your underlay IP is X, the hub is at Y,
   here's a join token."
2. On boot, `lab-net` writes the network config and brings up that IP.
3. `lab-agent` starts. It calls the hub's join API with: the token, its MAC, its proposed name,
   and its SSH host key.
4. The hub checks the token, picks a free node name (`hv101` etc.), makes sure no one else is
   using that IP, registers DNS for it, and trusts its SSH key.
5. The hub replies with: the assigned node name, its confirmed IP, a **permanent secret** (the
   token is now useless — this secret is what the node uses from here on), and the hub's own
   SSH public key.
6. From now on the spoke polls the hub every 10 seconds using that permanent secret, and the
   hub marks it "Ready."
7. Each poll response includes the tenant list, so the spoke builds whatever Geneve tunnels +
   bridges + libvirt networks are needed to serve those tenants.

This whole sequence prints live progress lines to the console, and `cluster.sh` follows them so
you can literally watch a server join the pool in ~10-15 seconds.

---

## 5. Tenants, images, and guest VMs — what you actually operate

Once the hub and at least one spoke are up, you (the operator) interact almost entirely through
`hubctl`. Three nested concepts:

```
Tenant (acme)                      <- an isolated customer / virtual network
 └── subnet 192.168.100.0/24       <- private address space, no two tenants can see each other
      └── guest VM (web1)          <- an actual running VM, scheduled onto some spoke
           ├── image: ubuntu       <- what OS it boots from
           ├── IP: 192.168.100.10  <- auto-assigned by IPAM
           └── node: hv102         <- auto-chosen by the scheduler (most free RAM)
```

### Create a tenant (an isolated virtual network)
```bash
sudo ./cluster.sh hubctl tenant add acme 100      # VNI 100 -> subnet 192.168.100.0/24
```

### Add a base image for guests to boot from
```bash
sudo ./cluster.sh image add ubuntu ~/Downloads/noble-server-cloudimg-amd64.img
```
CirrOS (a tiny test-only Linux) is already baked into the hub, so you can create guest VMs
without downloading anything first.

### Launch a guest VM
```bash
sudo ./cluster.sh hubctl vm add acme r1              # hub picks the best node + next free IP
sudo ./cluster.sh hubctl vm add acme r2 hv103         # or force a specific node
sudo ./cluster.sh hubctl vms                          # see: r1 = 192.168.100.10, r2 = 192.168.100.11
```

### Use the guest VM
```bash
sudo ./cluster.sh hubctl vm console r1    # login: cirros / vdclab (or the image's user/password)
# from inside: ping 192.168.100.11        # reaches r2, even if it's on a different physical PC
```

### Clean up
```bash
sudo ./cluster.sh hubctl vm del r1        # deletes the guest, its IP goes back into the pool
```

### Scale the cluster itself
```bash
sudo ./cluster.sh spoke add 2             # two more hypervisor nodes, auto-joined, auto-wired
sudo ./cluster.sh rm hv105                # remove a node once its guests are gone
```

---

## 6. Inspecting what's actually happening

Because this is a *teaching* tool, every infrastructure action — every `ip`, `virsh`,
`qemu-img`, `wget` call — is logged with what ran, why, and the result:

```bash
sudo ./cluster.sh logs collect               # pull logs from every node back to this PC
sudo ./cluster.sh logs tail hv101            # live console of a node (works while it's booting)
sudo ./cluster.sh logs commands qemu         # every VM start command, across the whole cluster
less logs/nodes/hv101/lab/commands/all.log   # everything hv101 has ever done, in order
```

This means you can always answer "what did the system actually do, and why?" instead of
treating it as a black box.

---

## 7. Putting it all together — a full session

```bash
sudo ./cluster.sh init                            # SSH key, join token, network bridges
sudo ./cluster.sh build                           # bake hub.qcow2 + spoke.qcow2 (~10 min)
sudo ./cluster.sh up                              # boot the hub, wait until it's ready
sudo ./cluster.sh spoke add 3                     # clone+boot 3 hypervisor nodes (hv101-103)

sudo ./cluster.sh hubctl tenant add acme 100      # new isolated tenant network
sudo ./cluster.sh hubctl vm add acme r1           # launch a guest VM in it
sudo ./cluster.sh hubctl vm add acme r2 hv103     # launch another, pinned to hv103
sudo ./cluster.sh hubctl vms                      # see where everything landed
sudo ./cluster.sh hubctl vm console r1            # log in and ping r2
```

That's the entire mental model: **build two images once, boot a hub, boot as many spokes as
you want, then use `hubctl` to carve out tenants and launch guest VMs inside them** — while
every step along the way is visible and logged.

---

## 8. Things worth experimenting with (also in the project README as exercises)

- **Watch a join happen on the wire.** Capture traffic on the hub while adding a spoke — find
  the one secret value in the join request, and see what replaces it afterward.
- **Watch the scheduler.** Create several guest VMs without pinning a node, predict which spoke
  each lands on based on free RAM, then stop a spoke and see where the *next* guest goes.
- **Scale under load.** Ping between two guest VMs on different physical hosts while adding
  more spokes — confirm existing traffic isn't disrupted.
- **Break the control plane's memory.** Wipe the hub's node registry and watch the spokes
  self-heal and re-register under their original names — this demonstrates that the *agents*
  are the real source of truth, not the hub's local state.

---

## 9. `cluster.sh` — every command and parameter explained

`cluster.sh` is the single entry point you run on each PC (always with `sudo`, since it manages
network bridges and QEMU processes). Below is every subcommand and what each parameter means.

### Setup & lifecycle

```bash
./cluster.sh init
```
First-time setup on the **main PC only**. No parameters. Generates the lab SSH key
(`state/id_lab`) and the join token (`state/token`) if they don't exist yet, then brings up the
underlay bridge and the `tap-hub` interface. You run this exactly once per PC (main PC) before
anything else.

```bash
./cluster.sh build [hub|spoke]
```
- **Parameter**: which image to build. Omit it (or pass nothing) → builds **both** `hub` and
  `spoke`. Pass `hub` or `spoke` → builds only that one.
- Runs Packer, which boots a temporary VM, installs Alpine, and runs that role's `setup.sh`
  inside it, producing `images/hub.qcow2` or `images/spoke.qcow2`. Takes a few minutes; only
  needs to be re-run when you change `cluster.conf`, the role scripts, or want a fresh image.

```bash
./cluster.sh up
```
No parameters. **Main PC only.** Brings up the underlay bridge, creates and boots the **hub**
VM (if it isn't already running), and follows its console until `hubctl` answers over SSH.
If the hub is already running, it just prints `hubctl nodes`.

```bash
./cluster.sh spoke add [COUNT]
```
- **Parameter `COUNT`**: how many new spoke VMs to clone and boot in parallel. Defaults to `1`
  if omitted. Must be a positive integer.
- Internally: picks the next free spoke number on this host (`hv101`, `hv102`, ...), clones
  `images/spoke.qcow2`, assigns it a MAC/IP derived from that number, boots it, and follows all
  of them joining the hub at once. First checks the hub is actually reachable
  (`preflight_hub`).

```bash
./cluster.sh start NAME|all
./cluster.sh stop  NAME|all
```
- **Parameter `NAME`**: an existing VM's name (e.g. `hub`, `hv101`) — or the literal word `all`
  to act on every VM on this PC.
- `start` boots it and (if the hub is reachable) follows its boot/join progress, same as `up`
  or `spoke add` do.
- `stop` sends an ACPI power-off via the QEMU monitor, waits up to 60s, then force-kills if
  needed, and removes its tap interface. `stop all` stops spokes first, then the hub last (so
  spokes can cleanly disconnect before the control plane disappears).

```bash
./cluster.sh rm NAME
```
- **Parameter `NAME`**: the VM to permanently delete.
- Refuses if the node still has guest VMs running on it (check with `hubctl vms` first).
  Stops the VM, evicts it from the hub's registry (`hubctl node del`), and deletes its disk —
  but **keeps its logs** under `logs/vm/`.

### Inspecting / connecting to VMs

```bash
./cluster.sh list
```
No parameters. Shows every VM on *this* PC (name, role, MAC, IP, running/stopped), then also
prints the cluster-wide view from the hub (`hubctl nodes`) if reachable.

```bash
./cluster.sh console NAME
```
- **Parameter `NAME`**: the VM whose serial console (text boot screen) you want to attach to
  live, as if you had a monitor plugged into it. Press **Ctrl-]** to detach without stopping
  the VM.

```bash
./cluster.sh ssh NAME [CMD...]
```
- **Parameter `NAME`**: any node — on this PC or, in a multi-PC setup, any node anywhere in the
  cluster (it looks up the IP via the hub's registry first, then falls back to local records).
- **Optional `CMD...`**: a command to run non-interactively; omit it to get an interactive
  shell.

```bash
./cluster.sh hubctl ARGS...
```
- **Parameter `ARGS...`**: anything you'd type after `hubctl` if you were logged into the hub
  directly (e.g. `tenant add acme 100`, `vms`, `node del hv102`). This is just a convenience
  wrapper that SSHes into the hub and runs `hubctl` with those arguments for you — see the
  `hubctl` table in the main README for the full list of its own sub-commands.

```bash
./cluster.sh capture NAME [FILTER]
```
- **Parameter `NAME`**: a VM on this PC whose underlay tap interface (`tap-NAME`) to sniff.
- **Optional `FILTER`**: any `tcpdump` filter expression (e.g. `'tcp port 8080'`). Useful for
  exercises like watching the join handshake happen on the wire.

### Image catalog

```bash
./cluster.sh image add NAME FILE|URL [--type cloud-init|cirros|none] [--mem MB] [--disk SIZE] [--user LOGIN]
./cluster.sh images
```
- **`NAME`**: the short name you'll refer to the image by later (e.g. `ubuntu`).
- **`FILE|URL`**: either a local path on *this* PC (gets uploaded to the hub) or an `http(s)://`
  URL (the hub downloads it directly).
- **`--type`**: how to configure the guest on first boot —
  `cloud-init` (default, for Ubuntu/Debian/etc.), `cirros` (CirrOS's own tiny seed script), or
  `none` (no seed at all — the IP is reserved but never actually applied inside the guest).
- **`--mem MB`** / **`--disk SIZE`**: the *default* RAM and virtual disk size that guests
  created from this image get, unless overridden per-guest.
- **`--user LOGIN`**: the login username the image's cloud-init creates (`ubuntu`, `debian`,
  `fedora`, ...) — just informational, shown by `hubctl vm info`.
- `images` (no args) lists the catalog with sizes and checksums.

### Logs

```bash
./cluster.sh logs
./cluster.sh logs tail NAME
./cluster.sh logs collect [NAME|all]
./cluster.sh logs commands [TOOL]
```
- Plain `logs` → lists every log file under `logs/` with size and timestamp.
- `logs tail NAME` → **parameter `NAME`**: follow (like `tail -f`) that VM's live serial
  console log — works even while it's still booting.
- `logs collect [NAME|all]` → **parameter**: a specific node name, or `all` (default) to pull
  `/var/log/lab`, `messages`, and `libvirt` logs from every cluster member back onto this PC,
  under `logs/nodes/<name>/`.
- `logs commands [TOOL]` → with no parameter, prints a summary table of how many commands each
  provisioning tool ran, per source (this PC / image builds / each collected node). **Parameter
  `TOOL`**: narrow it to one tool's full journal (e.g. `logs commands qemu`, `logs commands
  mkfs`) across every source, in time order.

### Multi-PC

```bash
./cluster.sh host init ID [NIC]
```
- **Parameter `ID`**: this PC's host number, `1`–`254`. `1` is always the main PC (runs the
  hub); any other number makes it a worker.
- **Optional `NIC`**: the network interface (or VLAN sub-interface like `enp1s0.20`) that
  physically connects this PC to the other PCs' underlay switch. Required on worker PCs if they
  need to reach the hub; the main PC usually doesn't need it on a single-PC setup.
- Writes `host.conf` — a **per-PC file, never copied between machines**.

```bash
./cluster.sh host show
```
No parameters — prints this PC's current identity (host ID, role, underlay IP, uplink NIC,
spoke naming/address range, hub IP).

```bash
./cluster.sh host export [FILE]
```
- **Optional `FILE`**: output path for the bundle tarball (default `vdc-host-bundle.tar`).
- **Main PC only.** Packages everything a new worker PC needs — the kit itself, the spoke
  image, the join token, and the SSH key — into one file you `scp` to the other machine. Keep
  it private: it contains real secrets (token + key).

```bash
./cluster.sh mtu-check [IP]
```
- **Optional parameter `IP`**: which address to test; defaults to the hub's IP. Sends a
  non-fragmenting ping sized to `UNDERLAY_MTU` to confirm the physical switch actually passes
  large-enough frames for the Geneve overlay to work. Run this on a new worker PC before
  `spoke add`.

```bash
./cluster.sh net-up
./cluster.sh net-down
```
No parameters. Brings the underlay bridge (and uplink NIC, if configured) up or down on this
PC only — without touching any VM. Useful for troubleshooting networking independently of the
VMs themselves.

### A note on parameters that come from `cluster.conf`, not the command line

Several values that *shape* what these commands do are **not** passed as arguments — they live
in `cluster.conf` (shared, baked into every image) or `host.conf` (per-PC). For example
`HUB_MEM`/`SPOKE_MEM`, `HUB_CPUS`/`SPOKE_CPUS`, `UNDERLAY_MTU`, `UNDERLAY_NET`, `IP_MODE`
(`static` or `dhcp`), `DISK_SIZE`, `GUEST_HOST_RESERVE`, and `JOIN_TIMEOUT`. If you want to
change how much RAM a spoke gets, or switch to DHCP addressing, you edit `cluster.conf` (and
usually rebuild the images) rather than passing a flag to `cluster.sh` itself.

---

## 10. One-paragraph summary

vdc-cluster lets you build, on a single laptop, a toy version of what a real cloud provider's
infrastructure does: a control-plane VM (**hub**) that new hypervisor VMs (**spokes**) can
join automatically just by booting, forming isolated per-tenant virtual networks over a shared
physical underlay, onto which you can then launch and manage actual guest VMs (CirrOS, Ubuntu,
etc.) — with every underlying command fully logged so you can see exactly how "click a button
to get a VM" is actually implemented under the hood.
