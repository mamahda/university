# vdc-cluster — expandable hub-and-spoke libvirt cluster (nested, Alpine)

Successor of checkpoint **HUB-SPOKE-INFRA**. Same overlay (Geneve hub-and-spoke over a
Linux-bridge underlay), but the two roles are separate, self-contained images, and
**adding a hypervisor = clone the spoke image and boot it**. The spoke joins the hub by
itself; nothing is edited by hand, no host list exists anywhere. Spokes can run on the
same PC as the hub or on other PCs on the same switch (multi-PC mode).

```
 PC 1 (main)                                         PC 2 (worker)               PC n ...
 br-under 10.20.1.1 ── [UPLINK_NIC] ── switch ── [UPLINK_NIC] ── br-under 10.20.2.1
   ├─ tap-hub   ── hub   10.20.0.2    control plane + compute:     ├─ tap-hv201 ── hv201 10.20.2.101
   │                                  DNS, NAT (eth0=internet),    └─ tap-hv202 ── hv202 10.20.2.102
   │                                  join API :8080, tunnels,
   │                                  libvirtd, hubctl
   ├─ tap-hv101 ── hv101 10.20.1.101  spoke: libvirtd + lab-agent ── CirrOS guests
   └─ tap-hv102 ── hv102 10.20.1.102  (linked clones of images/spoke.qcow2)
```

On a single PC there is no uplink NIC and no host.conf: everything below "Multi-PC" is optional.

## Addressing

Static by default: no DHCP server on the underlay. The address of every machine follows
from its name, on one /16:

| | address | set by |
|---|---|---|
| hub | 10.20.0.2 | hub image |
| PC *ID* (main PC = 1) | 10.20.*ID*.1 | `cluster.sh net-up` (`LABPC_IP` in host.conf) |
| spoke hv*ID**NN* | 10.20.*ID*.*(100+NN)* — hv203 = 10.20.2.103 | `cluster.sh` → SMBIOS `lab.ip` → `lab-net` on the spoke |
| bare-metal spoke | 10.20.0.3 – 10.20.0.99 | `IP=` (and optional `GW=`) in `/etc/lab/join.conf` |
| DHCP pool (only with `IP_MODE=dhcp`) | 10.20.0.100 – 10.20.0.250 | dnsmasq on the hub |

- At boot, the spoke service `lab-net` (before `networking`) writes `/etc/network/interfaces`:
  address, gateway = hub (NAT to the internet), MTU, and `resolv.conf` → hub DNS (`<name>.lab`).
- The hub refuses a join from an address another member already uses
  (`ERROR ip-in-use by hv203`); `hubctl node del hv203` if that machine is really gone.
- **DHCP is opt-in:** `IP_MODE=dhcp` in `cluster.conf` (then rebuild both images) makes the hub
  a DHCP server again and spokes take leases; a single machine can also use `IP=dhcp` in its
  `join.conf`. Static mode needs `UNDERLAY_PREFIX=16`.
- Before using 10.20.0.0/16, run `ip route` on the lab PCs: if 10.20.x is used on campus,
  change `UNDERLAY_NET`, `HUB_IP`, `LABPC_IP` and the pool to another /16 (e.g. 10.77.x).

## Layout

| Path | Where it runs | What |
|---|---|---|
| `cluster.conf` | every PC + baked into both images as `/etc/lab/cluster.env` | addressing, sizes, versions, timeouts |
| `host.conf` | this PC only (written by `host init`) | `HOST_ID`, `HOST_ROLE`, `LABPC_IP`, `UPLINK_NIC` |
| `cluster.sh` | every PC | init, build, up, `spoke add N`, start/stop, rm, list, console, ssh, logs, host, mtu-check |
| `common/` | both images | `setup-base.sh`; `lib.sh` (bridge/tunnel/libvirt helpers), `lab-guest` |
| `hub/` | hub image | `setup.sh`, `hubctl`, services `lab-hub` + `lab-api`, CGI `join/state/leave` |
| `spoke/` | spoke image | `setup.sh`, `lab-net` (underlay address at boot), `lab-agent` + services |
| `image/` | main PC | `alpine-install.sh`, `alpine.pkr.hcl`, `build.sh` → `images/hub.qcow2`, `images/spoke.qcow2` |
| `logs/` | every PC | **all logs** (see Logs) |
| `state/` | every PC | lab SSH key, join token, VM disks (`state/vms/`) |

The `*/setup.sh` scripts also work on an already-installed Alpine machine
(`KIT=/root/vdc-cluster sh spoke/setup.sh`, then reboot) — e.g. a bare-metal spoke.

## Quick start (one PC)

Needs: `qemu-system-x86_64`, `qemu-img`, `packer`, `socat`, `iproute2`, `tcpdump`, and
nested KVM (`cat /sys/module/kvm_intel/parameters/nested` → `Y`). Everything runs as root.

```bash
sudo ./cluster.sh init            # state/id_lab (SSH key) + state/token; (re)creates br-under, tap-hub
sudo ./cluster.sh build           # ~10 min: images/hub.qcow2 + images/spoke.qcow2, with progress
sudo ./cluster.sh up              # br-under + hub, follows its boot until hubctl answers
sudo ./cluster.sh spoke add 3     # hv101..hv103: clone, boot in parallel, follow each join

sudo ./cluster.sh hubctl tenant add acme 100      # subnet 192.168.100.0/24
sudo ./cluster.sh hubctl vm add acme r1           # CirrOS; node + address chosen by the hub
sudo ./cluster.sh hubctl vm add acme r2 hv103     # or pin the node
sudo ./cluster.sh hubctl vms                      # r1 192.168.100.10, r2 192.168.100.11
sudo ./cluster.sh hubctl vm console r1            # cirros / vdclab; ping 192.168.100.11

# other tenant images, e.g. an Ubuntu cloud image you downloaded
sudo ./cluster.sh image add ubuntu ~/Downloads/noble-server-cloudimg-amd64.img
sudo ./cluster.sh hubctl vm add acme web1 --image ubuntu
```

Grow later: `sudo ./cluster.sh spoke add 2` → hv104, hv105; every tenant gets two more hub
tunnels automatically. Shrink: `hubctl vm del ...` for its guests, then `sudo ./cluster.sh rm hv105`.

Spoke names are `hv<HOST_ID><NN>`: hv101 is spoke 1 on PC 1 (10.20.1.101), hv201 spoke 1 on PC 2 (10.20.2.101).

## Progress

`build`, `up`, `spoke add` and `start` show what is happening instead of waiting silently.

**Creating and joining spokes** — every VM prints `LAB: ...` lines on its serial console
(lab-agent, hubctl, lab-api); `cluster.sh` follows the console logs of all new VMs at once
and confirms the last step with the hub:

```
== creating 2 spoke(s) on host 1
  hv101  disk   linked clone of images/spoke.qcow2
  hv101  start  QEMU pid 4711, tap-hv101, 52:54:00:21:01:01, 10.20.1.101
  hv102  disk   linked clone of images/spoke.qcow2
  hv102  start  QEMU pid 4725, tap-hv102, 52:54:00:21:01:02, 10.20.1.102
== boot + join
   0:02  hv101   [#......] 1/7  booting (OpenRC)
   0:02  hv101   [##.....] 2/7  underlay 10.20.1.101/16 on eth0 (static, gateway 10.20.0.2)
   0:03  hv101   [###....] 3/7  agent started
   0:03  hv101   [####...] 4/7  join request -> hub 10.20.0.2
   0:03  hv102    !  join failed: hub 10.20.0.2:8080 unreachable, retrying every 2s
   0:04  hv101   [#####..] 5/7  joined as hv101 (10.20.1.101)
   0:05  hv101   [######.] 6/7  tunnels + libvirt networks up: hv101 (10.20.1.101), 2 tenant(s)
   0:06  hv101   [#######] 7/7  Ready in hubctl nodes
   ...
  VM       NODE     RESULT   TIME
  hv101    hv101    ok       0:06
  hv102    hv102    ok       0:07
```

Problems the VM reports (no address configured, hub unreachable, bad token, address in use)
appear as `!` lines.
After `JOIN_TIMEOUT` (300 s) a stuck VM is reported with its last console lines.
Ctrl-C only stops watching; the VMs keep booting.

**Hub** (`up`): booting → hub state ready (members, tenants) → join API listening → hubctl answers.

**Images** (`build`): Packer's stages (`packer: Starting VM ...`) interleaved with the
installer's numbered steps (`[ 5] bake role: hub`). If the installer fails, the build
stops at once and shows the failing lines instead of waiting for Packer's timeout.

**Join speed:** the address is static (no DHCP round trip), the agent retries every 2 s until
joined (not every `POLL`), and a fresh clone generates only an Ed25519 host key.
With nested KVM a clone goes from power-on to Ready in roughly 10–15 s.

## Logs

Every log of the lab ends up in `logs/` on the PC that ran the command:

```
logs/
  cluster.log                 every cluster.sh run: command, timestamped output (incl. progress)
  commands/<tool>.log         command journal of this PC: qemu, qemu-img, ip, packer, socat, ping...
  build/<role>.packer.log     full Packer output
  build/<role>.console.log    the installer's serial console (### steps, apk output, errors)
  build/<role>-commands/      command journal of the image build: apk, setup-disk, sfdisk, mkfs,
                              mount, chroot, rc-update ... + files.log (config files written)
  vm/<name>.console.log       each VM's serial console, all boots appended (LAB: progress lines,
                              OpenRC, kernel) - also what ./cluster.sh console shows
  vm/<name>.qemu.log          QEMU start errors
  nodes/<name>/               copied from inside a VM by "logs collect":
     lab/net.log                spoke: underlay address chosen at boot     (/var/log/lab/)
     lab/agent.log              spoke: join, sync, tenant changes
     lab/hub.log                hub: joins, leaves, tenants, evictions
     lab/api.log                hub: every API request (busybox httpd)
     lab/dnsmasq.log            hub: DNS (and DHCP leases with IP_MODE=dhcp)
     lab/guest.log              any node: guests created/removed
     lab/commands/<tool>.log    command journal of that VM: ip, virsh, qemu-img, wget, ...
     messages, libvirt/         syslog and libvirtd logs
```

```bash
sudo ./cluster.sh logs                    # list all files
sudo ./cluster.sh logs tail hv101         # follow a VM's console log (works while it boots)
sudo ./cluster.sh logs collect            # pull /var/log/lab etc. from the hub and every member
sudo ./cluster.sh logs collect hv201      # one node - also one on another PC
```

`rm` deletes a VM's disk but keeps its logs.

## Tenant images and addresses

**Images.** The hub keeps a catalog of tenant base images and serves them to the nodes;
each node downloads an image once, checks its SHA-256 and caches it under that checksum
(`/var/lib/libvirt/images/base/<image>-<sha>.qcow2`), so replacing an image never breaks
existing guests. Every guest is a copy-on-write overlay on its base.

```bash
sudo ./cluster.sh image add ubuntu ~/Downloads/noble-server-cloudimg-amd64.img   # upload from this PC
sudo ./cluster.sh image add debian https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2 --user debian
sudo ./cluster.sh images
IMAGE          TYPE       RAM      DISK   LOGIN    FILE      SHA256
cirros         cirros     192MB    1G     cirros   21MB      ...
ubuntu         cloud-init 1024MB   10G    ubuntu   583MB     ...
```

| `--type` | what the guest gets | for |
|---|---|---|
| `cloud-init` (default) | seed ISO with `#cloud-config` user-data (hostname, password) + `network-config` v2 (static address, matched by MAC) | Ubuntu, Debian, Fedora, Rocky, Alpine *cloud* images — anything with cloud-init |
| `cirros` | seed ISO with a user-data script that sets the address | CirrOS (baked into the hub, always in the catalog) |
| `none` | no seed: the address is reserved in the IPAM but not applied | images without cloud-init |

`--mem` / `--disk` set the default RAM and (virtual, sparse) disk size of guests from that
image, `--user` the login the image's cloud-init creates (`ubuntu`, `debian`, `fedora`, ...).
Raw images are converted to qcow2 on the hub. `hubctl image del NAME` refuses while guests use it.

**Addresses (IPAM).** Every tenant has a subnet; the hub hands out every guest's address —
nobody types one, and there is no DHCP on tenant networks:

```bash
hubctl tenant add acme 100                      # 192.168.100.0/24 (default for VNI 1-254)
hubctl tenant add beta 2000 10.88.0.0/24        # any subnet (/16-/29); tenants may overlap
hubctl vm add acme web1 --image ubuntu          # -> 192.168.100.10
hubctl vm add acme web2 --image ubuntu          # -> 192.168.100.11
hubctl vm add acme db1 --ip 192.168.100.50      # a chosen one: checked against the subnet and in-use
hubctl ips acme                                 # allocations + next free
```

- Allocation: lowest free address from **.10**; `.1` stays free for a future tenant gateway,
  `.2-.9` for future services (subnets of 32 addresses or fewer only keep `.1`).
- The address is stored with the guest in the hub's registry (with a generated MAC
  `52:54:01:xx:xx:xx`), written into the guest's seed, and released when the guest is deleted.
- Tenant networks are isolated L2 segments with no router: guests reach each other, not the
  internet or the underlay.

**Seed.** `lab-guest` on the chosen node builds `<guest>-seed.iso` (label `cidata`, the NoCloud
datasource) with `xorriso` and attaches it as a CD-ROM. All three seed files are in the
command journal (`files.log`, password masked), next to the `qemu-img` and `virsh define` calls.

**Login.** Console (`hubctl vm console NAME`) and SSH between guests of a tenant: the image's
user (`hubctl vm info NAME`) with `GUEST_PASSWORD` (cluster.conf, default `vdclab`).

**Sizing.** The scheduler places a guest on the Ready node with the most free RAM that fits it
(node RAM as reported by its agent, minus `GUEST_HOST_RESERVE` = 512 MB, minus its guests;
`hubctl nodes` shows free/total). A 2 GB spoke fits one 1 GB Ubuntu guest; for several,
raise `SPOKE_MEM` (e.g. 4096). Ubuntu guests are the second level of nesting — without nested
KVM on the lab PC they boot in minutes instead of seconds. `DISK_SIZE` is 20G (sparse) to
hold base images and guest overlays.

## Command journal

Every provisioning tool the lab runs is journaled — in its own file per tool, plus one
`all.log` in order — so students can see exactly which commands build a virtual data
centre, who ran them, why, and with what result:

```
2026-10-28 08:29:55 hv101 [lab-agent] $ ip link add gnv100 type geneve id 100 remote 10.20.0.2  # Geneve tunnel gnv100: VNI 100 to 10.20.0.2, port of br-t100
2026-10-28 08:29:55 hv101 [lab-agent] = rc=0 0.01s ip
2026-10-28 08:29:55 hv101 [lab-agent] $ ip link set gnv100 master br-t100  # Geneve tunnel gnv100: ...
2026-10-28 09:00:02 build-hub [installer] $ setup-disk -m sys -s 0 /dev/vda  # install Alpine to /dev/vda
2026-10-28 09:00:02 build-hub [installer]   $ sfdisk --quiet --label dos /dev/vda      <- run by setup-disk
2026-10-28 09:00:02 build-hub [installer]   $ mkfs.ext4 -q /dev/vda1
```

`$` = the command exactly as run (shell-quoted, secrets like the join token shown as `***`),
`# ...` = why, `[...]` = which script, `=` = exit code and duration, indentation = called by
the command above it. Config files handed to `virsh` / `nft`, and the ones the scripts write
(`interfaces`, `dnsmasq.conf`, `nftables.nft`, libvirt XML, ...) are logged with their content.

| Where | Journal | Typical tools |
|---|---|---|
| lab PC | `logs/commands/` | `qemu-system-x86_64` (full command line of every VM), `qemu-img`, `ip` (bridge, taps, VLAN), `socat`, `ping`, `packer`, `ssh-keygen` |
| image build | `logs/build/<role>-commands/` | `apk`, `setup-disk` → `sfdisk`, `mkfs.ext4`, `mount`; `chroot`, `rc-update`, `adduser`, `update-extlinux`, `files.log` |
| hub VM | `/var/log/lab/commands/` | `ip` (tenant bridges, Geneve tunnels per spoke), `virsh`, `ssh-keygen`, `wget` |
| spoke VM | `/var/log/lab/commands/` | `ip` (bridge + tunnel per tenant), `virsh` (networks, guests incl. domain XML), `qemu-img` (guest disks), `wget` (join), `modprobe`, `hostname`, `files.log` (`interfaces`, `resolv.conf`) |

```bash
sudo ./cluster.sh logs collect            # bring the VMs' journals to this PC first
sudo ./cluster.sh logs commands           # table: calls per tool x source (pc1, build:hub, hv101, ...)
sudo ./cluster.sh logs commands qemu      # every QEMU start, all sources, in time order
sudo ./cluster.sh logs commands mkfs      # how the disks were formatted (image build)
less logs/nodes/hv101/lab/commands/all.log  # everything one spoke did, in order
```

**How it works.** `lab-trace` (in `common/rootfs/usr/local/lib/lab/`) is installed as
symlinks named after the tools (`ip`, `virsh`, `mkfs.ext4`, ...) in a directory the lab
scripts put first in `PATH` (`/usr/local/lib/lab/trace.d` on the VMs, `state/trace.d` on the
lab PC). Each call is logged, then the real tool runs with the same arguments, input, output
and exit code. Tools started by those tools are caught too — that is how `setup-disk`'s
`sfdisk`/`mkfs`/`mount` appear. In the image build the records also go to the serial port,
and `build.sh` files them on the lab PC.

**What is left out (on purpose).** With `TRACE=changes` (default) calls that only read state
are skipped (`ip ... show`, `virsh list/net-info`, the agent's 10 s state poll), and the
`ensure_*` helpers only run a command when something differs — so a reconcile pass that finds
everything in place adds nothing, and the journal shows changes only. Set `TRACE=all` in
`cluster.conf` to see the read-only calls too, `TRACE_OUTPUT=yes` to also log each command's
output, `TRACE=off` to disable (VMs: rebuild the images after changing these). Not journaled:
`ssh` (the remote side journals what it runs), coreutils (`cp`, `cat`, ...), daemons started by
OpenRC itself (`dnsmasq`, `httpd`, `udhcpc` from `networking`).

## How a clone joins

```
 spoke (fresh clone)                               hub
 ───────────────────                               ───
 boot: lab-net: 10.20.<ID>.1<NN>/16 from SMBIOS lab.ip (static; DHCP only if IP_MODE=dhcp)
 lab-agent boot: hostname spoke-<mac>, cached tunnels (none yet)
 POST /cgi-bin/join  token, mac, name, ssh hostkey ──▶  check token
                                                     name = requested (lab.name) if free, else hvN
                                                     address in use by another member? refuse
                                                     DNS <name>.lab (+ DHCP pin in dhcp mode)
                                                     trust its SSH host key
                                                     g<VNI>-<name> for every tenant
 ◀── OK  NODE_NAME, NODE_IP, NODE_SECRET, hub SSH pubkey
 /etc/lab/node.env, hostname, authorize hub key
 every POLL (10 s; every 2 s until the first sync):
 POST /cgi-bin/state  name + secret ───────────────▶  must come from its own IP; marks it Ready
 ◀── TENANT acme 100 / TENANT beta 200 ...
 reconcile: br-t<VNI> + gnv<VNI> → hub, libvirt net tenant-<name>, prune removed tenants
```

- **Clone = stateless.** The image has no host keys, machine-id, name or node state; every
  clone generates its own. `cluster.sh` gives each clone its own MAC, UUID and SMBIOS OEM
  strings `lab.hub`, `lab.token`, `lab.name` — so the image itself carries no secret.
- **Where the token comes from**, first match wins: `lab-agent join HUB TOKEN [NAME]`,
  `/etc/lab/join.conf` (`HUB= TOKEN= NAME=`), SMBIOS. On bare metal, write `join.conf`.
- **Only the join uses the token.** Afterwards each node has its own secret (like a kubelet
  certificate). `hubctl token rotate` stops new joins with the old token without touching
  members (copy the new token into `state/token` on every PC, or the next clones are refused).
- **The hub talks back over SSH** (`hubctl vm add/del/console`, `hubctl exec`), with strict
  host-key checking against keys collected at join time.
- **Self-healing:** if the hub forgets a node (`hubctl node del`, lost state), the agent
  re-joins under its old name on the next poll. A spoke that ran `lab-agent leave` stays out
  until `lab-agent join`. If the hub is down, spokes keep their tunnels and rebuild them from
  the cache at boot; same-host guest traffic keeps working.

## Multi-PC

All PCs share one underlay: each PC bridges a NIC (or a VLAN on a NIC) into its `br-under`,
and all those NICs sit on the same switch/VLAN. The hub runs on the main PC only; every PC
can run spokes. The protocol is plain IP (HTTP :8080, Geneve UDP 6081, SSH), so nothing
else changes.

**Requirements**
- A **dedicated** network for the underlay: a separate switch, or a VLAN. With the default
  static addressing nothing hands out addresses there, but the underlay still carries
  unencrypted lab traffic and the join token — and with `IP_MODE=dhcp` the hub runs an
  authoritative DHCP server on it. Never bridge the campus/office LAN.
- The uplink NIC must have **no IP address** (use a second NIC or a VLAN like `enp1s0.20`).
- The switch must pass **1600-byte frames** (`UNDERLAY_MTU`). If it doesn't, set
  `UNDERLAY_MTU=1500` and `TENANT_MTU=1450` in `cluster.conf` on every PC and rebuild the images.
- Nested KVM on every PC that runs spokes.

**Main PC (host 1)**
```bash
sudo ./cluster.sh host init 1 enp2s0       # host.conf: host 1, main, uplink enp2s0
sudo ./cluster.sh init && sudo ./cluster.sh build
sudo ./cluster.sh up                        # br-under (+ enp2s0) and the hub
sudo ./cluster.sh host export               # vdc-host-bundle.tar: kit + spoke image + token + key
scp vdc-host-bundle.tar roy@pc2:            # keep it private: it contains the join token and SSH key
```

**Every other PC (host 2, 3, ...)**
```bash
mkdir vdc-cluster && tar xf vdc-host-bundle.tar -C vdc-cluster && cd vdc-cluster
sudo ./cluster.sh host init 2 enp2s0       # host 2, worker, 10.20.2.1, uplink enp2s0
sudo ./cluster.sh net-up                    # br-under + uplink
sudo ./cluster.sh mtu-check                 # 1600-byte frames reach the hub?
sudo ./cluster.sh spoke add 4               # hv201..hv204 = 10.20.2.101..104, joined to the hub on PC 1
```

| | main PC | worker PC |
|---|---|---|
| `host init` | `host init 1 [NIC]` | `host init <2..254> NIC` |
| PC address | 10.20.1.1 | 10.20.*ID*.1 |
| spoke names / addresses | hv101.. / 10.20.1.101.. | hv*ID*01.. / 10.20.*ID*.101.. |
| spoke MACs | 52:54:00:21:01:NN | 52:54:00:21:*ID hex*:NN |
| `init`, `up`, `host export`, `build` | yes | refused (`init`, `up`, `export`); build not needed |
| `spoke add`, `start`, `stop`, `rm`, `list`, `logs` | yes | yes — checks the hub is reachable and the MTU first |
| `hubctl`, `ssh NAME`, `logs collect` | any node | any node (through the underlay) |

Tenants, guests and the scheduler are cluster-wide: `hubctl vm add acme r7` may place r7
on hv203 in the next room.

## Commands

**hubctl** (on the hub, or `./cluster.sh hubctl ...` from any PC):

| Command | What it does |
|---|---|
| `nodes` | members, IP, MAC, Ready/NotReady (3 missed polls), guest count |
| `node del NAME` / `node ip NAME` | evict (refused while it has guests) / address |
| `token [rotate]` | join token |
| `tenant del NAME` / `tenants` | tenant = VNI + bridge everywhere + subnet |
| `tenant add NAME VNI [SUBNET]` | tenant subnet for the IPAM (default 192.168.<VNI>.0/24) |
| `ips [TENANT]` | address allocations and the next free one |
| `image add NAME URL\|--file PATH [--type] [--mem] [--disk] [--user]` / `image del` / `images` | tenant image catalog (`./cluster.sh image add` uploads from the lab PC) |
| `vm add TENANT NAME [NODE] [--image] [--ip] [--mem] [--disk] [--cpus]` | guest; address from the IPAM, node = most free RAM (hub included if `HUB_SCHEDULABLE=yes`) |
| `vm info NAME` / `vm del` / `vm console` / `vms` | image, address, MAC, node, login / remove (address released) |
| `exec NODE CMD...` | run on any node |
| `apply` | rebuild the hub side of the overlay |

**lab-agent** (on a spoke): `status`, `sync`, `join [HUB [TOKEN [NAME]]]`, `leave`.
**lab-guest** (any node): `add`, `del`, `list`.

## Exercises

**E1 — Watch a node join.** `./cluster.sh capture hub 'tcp port 8080'` in one terminal,
`./cluster.sh spoke add` in another. Match the packets to the progress lines. What is the
only secret in the join request, and what replaces it afterwards?

**E2 — The scheduler.** Create 6 guests without a node. Predict where each lands
(`hubctl vms`). Then stop a spoke (`./cluster.sh stop hv102`); how long until `hubctl nodes`
shows NotReady, and where does the next guest go?

**E3 — Scale out under traffic.** Ping r1 → r2 (different hosts) while running
`./cluster.sh spoke add 2`. Does the ping notice? Count `hubctl tenants` tunnels before/after.

**E4 — Lose the control plane's memory.** On the hub: `cp /var/lib/lab/nodes /root/; : > /var/lib/lab/nodes; hubctl apply`.
Watch `hubctl nodes` for 20 s, then `logs collect` and read the agents' `agent.log`.
Who rebuilt the registry, and why did every node keep its name?

**E5 — Hub as single point of failure.** `./cluster.sh stop hub` while guests ping each
other on the same host and across hosts. Which traffic survives? Reboot a spoke while the
hub is down and follow it (`./cluster.sh start hv101`) — which progress steps appear, which
don't, and does it still have its `gnv*` tunnels?

**E6 — Join security.** Boot a spoke with the wrong token (edit `/etc/lab/join.conf`,
`lab-agent join`) and find the refusal in three logs: the console, `agent.log`, `hub.log`.
Then, from a joined spoke, call `/cgi-bin/state` with another node's name. Which checks stop
you? What could an attacker on the underlay still do?

**E7 — Two rooms, one cluster (multi-PC).** Add spokes from a second PC. Capture on its
`UPLINK_NIC`: which traffic crosses the switch when a guest on hv201 pings one on hv101?
Then shrink `UNDERLAY_MTU` to 1500 on one side only (without rebuilding) and explain what
`mtu-check` and a large `ping -s 1472` between guests show.

**E8 — Read the build.** Without opening any script: from `logs/build/spoke-commands/all.log`
and `files.log`, write down the steps that turn an empty disk into a spoke image (partition,
filesystem, packages, services, config files). Then from `logs/commands/qemu.log` explain every
option of one spoke's QEMU command line, and from that spoke's journal, the order in which its
tenant bridge, tunnel and libvirt network were created — and why that order.

**E9 — Same image, two guests, two addresses.** `image add` an Ubuntu cloud image, create
two guests from it in one tenant, and find in the journals: the base download (once per node),
the two `qemu-img create -b` overlays, the two seeds (`files.log`: which lines differ?), and
the `virsh define` with the CD-ROM. Inside a guest: `cloud-init status --long`,
`cat /etc/netplan/*.yaml` — where did the address come from? Then `hubctl vm del` one guest and
create a third: which address does it get, and why?

## Troubleshooting

| Symptom | Check |
|---|---|
| progress stops at "booting" | `./cluster.sh logs tail NAME`; no nested KVM → very slow (`warning: no KVM` at start) |
| `! underlay address not configured` | static mode: VM not started by `cluster.sh` (no SMBIOS `lab.ip`) or bare metal without `IP=` in `join.conf`; `net.log` |
| `! waiting for a DHCP lease` | `IP_MODE=dhcp` only: hub's `dnsmasq.log`; worker: `mtu-check`, cabling, VLAN |
| `! join refused: ERROR ip-in-use by X` | two machines on one address: fix `IP=` / `HOST_ID`, or `hubctl node del X` if X is gone |
| `! join failed: hub ... unreachable` | hub API: `api.log`; worker: `./cluster.sh mtu-check` |
| lab PC reaches hub and spokes, but a spoke cannot ping the hub | the lab PC's firewall drops bridged frames (Docker/ufw + `br_netfilter`): `sysctl net.bridge.bridge-nf-call-iptables`, `iptables -S FORWARD`; `cluster.sh` adds `iptables -I FORWARD -i br-under -o br-under -j ACCEPT` |
| `ssh NAME` says unknown node | the node has not joined; `ssh` falls back to the VM's own IP on its PC |
| `! join refused: ERROR bad-token` | `hubctl token` vs `state/token` on this PC; the hub takes SMBIOS `lab.token` at boot |
| node NotReady | `lab-agent status` on it, `agent.log`; hub reachable? |
| `vm add` fails on a spoke | `hubctl exec NODE lab-guest list`, `guest.log`, that node's `commands/all.log`; `hubctl images` |
| `no Ready node has N MB RAM free` | `hubctl nodes` (free/total); smaller `--mem`, more spokes, or bigger `SPOKE_MEM` |
| guest has no address | `hubctl vm info NAME` (type `none` gets no seed); inside: `cloud-init status --long`; the seed in that node's `files.log` |
| `checksum mismatch` on vm add | the hub's image file changed outside `image add`; re-run `image add` |
| guests on different hosts can't talk | `hubctl tenants` shows a tunnel per node? `bridge fdb show br br-t<VNI>` on the hub; MTU on br-under, taps, uplink, switch |
| worker: `cannot reach the hub` | main PC up, `UPLINK_NIC` set (`host show`), same switch/VLAN, `net-up` done |
| image build fails | the failing step is shown; full detail in `logs/build/<role>.console.log` |
| `build` refuses | linked clones depend on the base image: `./cluster.sh rm` them, or `FORCE=1` and accept breakage |

## Differences from HUB-SPOKE-INFRA

| HUB-SPOKE-INFRA | vdc-cluster |
|---|---|
| roles `mgmt` / `hv`, one kit dir | `hub/` and `spoke/` folders, shared `common/` |
| fixed `HOSTS`/`SPOKES` list, `hvN = .1N`, /24 | join registry on the hub; static /16 plan `10.20.<PC>.<100+N>`, DHCP opt-in |
| adding a host: edit config, `init`, `sync` | `./cluster.sh spoke add` (clone + boot, with progress) |
| `tenant.sh` on the lab PC pushes state | hub is the source of truth, spokes pull |
| guests created by the lab PC | `hubctl vm add` with placement, hub also schedulable |
| one PC | any number of PCs on one switch (`host init`, `host export`) |
| logs scattered | everything in `logs/`, in-VM logs in `/var/log/lab/` + `logs collect` |

## Status

Tested in a sandbox: real `hubctl` and `lab-agent`, with `ip`, `virsh`, `ssh` and the HTTP
transport stubbed (the spoke's requests go straight into `hubctl _api`). Covered: join and
token checks, name assignment and collisions, hub/spoke tunnels, DHCP/DNS/known_hosts
registry, scheduler, rollback of failed guest creation, refusals while guests exist,
tenant images (catalog, upload/convert, checksum-keyed node cache, mismatch refusal, overlay
sizing), the IPAM (allocation order, explicit `--ip` checks, release and reuse, /29 exhaustion,
rollback on failed creation), memory-aware placement, seed files (cloud-init user-data and
network-config parsed as YAML, CirrOS script syntax), domain XML, password masking in the
journal, registry loss and re-join under the old name, duplicate-address refusal (static) vs lease
reuse (dhcp), `lab-net` for clone / bare-metal / forced-DHCP / dhcp-mode / missing / bad
address, the SMBIOS `lab.ip` passed to QEMU, tenant add/delete propagation, eviction and
auto re-join, clean leave, NotReady detection, boot with the hub down, API input validation;
the agent's console progress for no-address / hub-down / bad-token / re-join cases; the
`cluster.sh` progress watcher on replayed serial logs (incl. timeout); `build.sh` progress
and early abort with a fake Packer; `host init/show/export`, worker restrictions; the command
journal: wrapper (exit codes, stdin, nesting, PID kept for `packer`, read-only filter,
`TRACE=off/all`, output capture, token masking, no loop with two wrapper dirs), journals of a
real agent/hub join, zero new entries in steady state, lab PC journal of a VM's create/start/
stop, the build's journal carried over the console, and the merged `logs commands` view.
All scripts pass shellcheck.

**Not yet run on real VMs or real NICs** (Packer build, OpenRC ordering, busybox httpd +
doas CGI path, nested libvirt, uplink/VLAN bridging, multi-PC over a real switch, Ubuntu and
CirrOS actually reading the seed ISO — CirrOS's NoCloud support is the one to check first).
Storage is still to be designed.
