# shellcheck shell=sh
# common/setup-base.sh - pieces shared by hub/setup.sh and spoke/setup.sh (sourced).
#
# Runs on Alpine as root: inside the Packer chroot (BAKE=1) or on an already
# installed Alpine VM (BAKE=0, then reboot). Needs KIT = the kit directory
# (containing cluster.conf, common/, hub/, spoke/).

BAKE=${BAKE:-0}
[ -f "$KIT/cluster.conf" ] || { echo "error: $KIT/cluster.conf missing" >&2; exit 1; }
. "$KIT/cluster.conf"

# progress goes to stdout and the serial console (the image build follows ttyS0);
# it is also the "why" (LAB_STEP) of the commands that follow, in the command journal
say() { echo "### $*"; echo "### $*" >/dev/ttyS0 2>/dev/null || true; LAB_STEP=$*; export LAB_STEP; }

# record a config file we wrote in the command journal (files.log)
wrote() { if [ -x /usr/local/lib/lab/lab-trace ]; then /usr/local/lib/lab/lab-trace --file "$@" || true; fi; }

# rc-update only; nothing is started here (reboot or the image's first boot does that)
svc() { rc-update add "$1" "${2:-default}" >/dev/null 2>&1 || true; }

base_install() {
  say "packages: libvirt + qemu + networking tools"
  apk add --no-cache \
    openssh doas iproute2 bridge-utils nftables tcpdump ethtool dmidecode flock \
    dbus libvirt-daemon libvirt-client qemu-system-x86_64 qemu-img xorriso
  # QEMU driver is a subpackage on some Alpine releases, built in on others
  apk add --no-cache libvirt-qemu >/dev/null 2>&1 || true

  say "shared files"
  cp -a "$KIT/common/rootfs/." /
  chmod 755 /usr/local/sbin/lab-guest /usr/local/lib/lab/lab-trace
  install -d -m 755 /etc/lab /var/lib/lab /var/log/lab /var/log/lab/commands
  install -m 600 "$KIT/cluster.conf" /etc/lab/cluster.env

  say "command journal: tools run through lab-trace (/var/log/lab/commands/)"
  /usr/local/lib/lab/lab-trace --install /usr/local/lib/lab/trace.d
  PATH=/usr/local/lib/lab/trace.d:$PATH; export PATH

  # kernel modules: overlay + nested KVM (whichever CPU vendor applies)
  cat >/etc/modules-load.d/lab.conf <<MOD
tun
bridge
geneve
kvm_intel
kvm_amd
MOD
  wrote /etc/modules-load.d/lab.conf "kernel modules loaded at boot"
  cat >/etc/sysctl.d/lab.conf <<SYS
net.ipv4.ip_forward = 1
net.ipv6.conf.all.disable_ipv6 = 1
SYS
  wrote /etc/sysctl.d/lab.conf "routing on, IPv6 off"

  # sshd: keys only, root allowed with key
  mkdir -p /etc/ssh/sshd_config.d
  grep -q '^Include /etc/ssh/sshd_config.d' /etc/ssh/sshd_config ||
    sed -i '1i Include /etc/ssh/sshd_config.d/*.conf' /etc/ssh/sshd_config
  cat >/etc/ssh/sshd_config.d/lab.conf <<SSH
PermitRootLogin prohibit-password
PasswordAuthentication no
UseDNS no
HostKey /etc/ssh/ssh_host_ed25519_key
SSH
  wrote /etc/ssh/sshd_config.d/lab.conf "sshd: keys only"
  # first boot of a clone: generate only the Ed25519 host key (RSA takes long, esp. nested)
  touch /etc/conf.d/sshd
  if grep -q 'key_types_to_generate' /etc/conf.d/sshd; then
    sed -i 's/^#*[[:space:]]*key_types_to_generate=.*/key_types_to_generate="ed25519"/' /etc/conf.d/sshd
  else
    echo 'key_types_to_generate="ed25519"' >>/etc/conf.d/sshd
  fi
  wrote /etc/conf.d/sshd "first boot generates only an Ed25519 host key"

  # no NAT'd "default" libvirt network in this lab
  rm -f /etc/libvirt/qemu/networks/autostart/default.xml /etc/libvirt/qemu/networks/default.xml

  say "OpenRC services"
  for s in devfs dmesg mdev hwdrivers; do svc "$s" sysinit; done
  for s in modules sysctl hostname bootmisc syslog networking cgroups; do svc "$s" boot; done
  for s in mount-ro killprocs savecache; do svc "$s" shutdown; done
  for s in acpid crond sshd dbus virtlogd libvirtd; do svc "$s" default; done
}

role_files() {   # ROLE
  cp -a "$KIT/$1/rootfs/." /
  chmod 755 /usr/local/sbin/* /etc/init.d/lab-* 2>/dev/null || true
}

finish() {   # ROLE
  if [ "$BAKE" = 1 ]; then
    say "$1 role baked"
  else
    say "$1 role installed - reboot to bring it up"
  fi
}
