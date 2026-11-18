#!/bin/sh
# hub/setup.sh - HUB role: Alpine + libvirtd + the cluster control plane.
#
#   eth0 (uplink, DHCP)  -- NAT --  eth1 (underlay, static HUB_IP)
#   logs: /var/log/lab/{hub,api,dnsmasq,guest}.log
#   dnsmasq    DNS for the underlay (NAME.lab); DHCP too if IP_MODE=dhcp
#   lab-hub    br-t<VNI> per tenant + g<VNI>-<node> Geneve tunnel per spoke
#   lab-api    busybox httpd: /cgi-bin/join|state|leave, /images/cirros.qcow2
#   libvirtd   the hub is also a compute node (HUB_SCHEDULABLE)
#   hubctl     CLI for nodes, tenants, guests
#
#   BAKE=1 KIT=/tmp/kit sh hub/setup.sh      (image build, Packer chroot)
#   KIT=/root/vdc-cluster sh hub/setup.sh    (existing Alpine VM, then reboot)
set -eu
KIT=${KIT:-$(cd "$(dirname "$0")/.." && pwd)}
. "$KIT/common/setup-base.sh"

prefix_mask() {   # 16 -> 255.255.0.0
  m=$(( (0xffffffff << (32 - $1)) & 0xffffffff ))
  echo "$((m >> 24 & 255)).$((m >> 16 & 255)).$((m >> 8 & 255)).$((m & 255))"
}

base_install
say "hub packages"
apk add --no-cache dnsmasq busybox-extras
role_files hub
chmod 755 /usr/local/lib/lab/cgi.sh /var/lib/lab/www/cgi-bin/*
chmod 755 /var/lib/lab /var/lib/lab/www /var/lib/lab/www/cgi-bin

say "API user + the one privileged call it may make"
id labweb >/dev/null 2>&1 || adduser -S -D -H -h /var/lib/lab/www -s /sbin/nologin labweb
mkdir -p /etc/doas.d
echo "permit nopass labweb as root cmd /usr/local/sbin/hubctl" >/etc/doas.d/lab.conf
chmod 600 /etc/doas.d/lab.conf
wrote /etc/doas.d/lab.conf "the API user may run hubctl as root, nothing else"

say "hub: uplink $HUB_UPLINK_IF (DHCP), underlay $HUB_UNDERLAY_IF = $HUB_IP/$UNDERLAY_PREFIX"
cat >/etc/network/interfaces <<NET
auto lo
iface lo inet loopback

auto $HUB_UPLINK_IF
iface $HUB_UPLINK_IF inet dhcp

auto $HUB_UNDERLAY_IF
iface $HUB_UNDERLAY_IF inet static
    address $HUB_IP/$UNDERLAY_PREFIX
    mtu $UNDERLAY_MTU
NET
wrote /etc/network/interfaces "hub: uplink (DHCP) + underlay (static)"
echo hub >/etc/hostname

cat >/etc/dnsmasq.conf <<DNS
# vdc-cluster hub: DNS for the underlay only (members resolve as NAME.lab)
interface=$HUB_UNDERLAY_IF
bind-interfaces
domain=lab
local=/lab/
expand-hosts
addn-hosts=/var/lib/lab/hosts
log-facility=/var/log/lab/dnsmasq.log
DNS
if [ "$IP_MODE" = dhcp ]; then
  say "hub: DHCP server on the underlay ($DHCP_START - $DHCP_END)"
  cat >>/etc/dnsmasq.conf <<DHCP
# IP_MODE=dhcp: leases for spokes, pinned per member on join
dhcp-authoritative
dhcp-range=$DHCP_START,$DHCP_END,$(prefix_mask "$UNDERLAY_PREFIX"),12h
dhcp-option=option:router,$HUB_IP
dhcp-option=option:dns-server,$HUB_IP
dhcp-option=26,$UNDERLAY_MTU
dhcp-hostsfile=/var/lib/lab/dhcp-hosts
log-dhcp
DHCP
else
  say "hub: static addressing, no DHCP server on the underlay"
fi
wrote /etc/dnsmasq.conf "hub DNS${IP_MODE:+ ($IP_MODE addressing)}"
install -d -m 755 /var/log/lab
touch /var/log/lab/dnsmasq.log /var/log/lab/api.log
chown dnsmasq /var/log/lab/dnsmasq.log 2>/dev/null || chmod 666 /var/log/lab/dnsmasq.log

cat >/etc/nftables.nft <<NFT
#!/usr/sbin/nft -f
# vdc-cluster hub: underlay -> internet via the uplink (no filtering: it's a lab)
flush ruleset
table ip lab_nat {
  chain postrouting {
    type nat hook postrouting priority srcnat; policy accept;
    ip saddr $UNDERLAY_NET/$UNDERLAY_PREFIX oifname "$HUB_UPLINK_IF" masquerade
  }
}
NFT
wrote /etc/nftables.nft "NAT: underlay -> internet via the hub's uplink"

say "CirrOS base image, served to every node"
install -d -m 755 /var/lib/lab/www/images
if [ ! -s /var/lib/lab/www/images/cirros.qcow2 ]; then
  if wget -q -O /var/lib/lab/www/images/cirros.qcow2.part "$CIRROS_URL"; then
    mv /var/lib/lab/www/images/cirros.qcow2.part /var/lib/lab/www/images/cirros.qcow2
    chmod 644 /var/lib/lab/www/images/cirros.qcow2
  else
    rm -f /var/lib/lab/www/images/cirros.qcow2.part
    echo "warning: CirrOS download failed; run 'hubctl image' later" >&2
  fi
fi

say "hub services"
svc nftables boot
svc lab-hub default
svc dnsmasq default
svc lab-api default

finish hub
