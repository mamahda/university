#!/bin/sh
# spoke/setup.sh - SPOKE role: Alpine + libvirtd + lab-agent.
#
# A spoke has no identity of its own in the image. At boot lab-net sets the
# underlay address (SMBIOS lab.ip from cluster.sh, IP= in join.conf, or DHCP if
# IP_MODE=dhcp). Then lab-agent
# joins the hub (token from SMBIOS / /etc/lab/join.conf), gets its node name,
# and from then on keeps one Geneve tunnel per tenant (gnv<VNI> -> hub) plus
# bridge br-t<VNI> and libvirt network tenant-<name>. Clone = new spoke.
#
#   BAKE=1 KIT=/tmp/kit sh spoke/setup.sh     (image build, Packer chroot)
#   KIT=/root/vdc-cluster sh spoke/setup.sh   (existing Alpine VM, then reboot)
set -eu
KIT=${KIT:-$(cd "$(dirname "$0")/.." && pwd)}
. "$KIT/common/setup-base.sh"

base_install
role_files spoke

say "spoke: underlay $SPOKE_UNDERLAY_IF ($IP_MODE), written by lab-net at every boot"
cat >/etc/network/interfaces <<NET
auto lo
iface lo inet loopback

# replaced by lab-net at boot
auto $SPOKE_UNDERLAY_IF
iface $SPOKE_UNDERLAY_IF
    mtu $UNDERLAY_MTU
NET
wrote /etc/network/interfaces "placeholder, lab-net rewrites it at every boot"
echo spoke >/etc/hostname
svc lab-net boot
svc lab-agent default

finish spoke
