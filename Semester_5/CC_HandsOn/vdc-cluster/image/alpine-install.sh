#!/bin/sh
# alpine-install.sh ROLE HTTP_BASE - runs INSIDE the Alpine live ISO (typed in by Packer).
#   1. setup-disk onto /dev/vda (BIOS, no swap)
#   2. chroot: KIT/<ROLE>/setup.sh with BAKE=1
#   3. serial console on ttyS0, root password, lab PC SSH key
#   4. template cleanup (no host keys, no hub/node identity) -> poweroff
# Every provisioning tool it runs (apk, setup-disk -> sfdisk/mkfs/mount, chroot, ...)
# goes through lab-trace; the records are copied to ttyS0 as "CMD <tool> ..." and
# build.sh files them under logs/build/<role>-commands/.
# On any error it prints "### FAILED" and stops WITHOUT powering off; build.sh sees
# the marker and aborts the Packer run.
set -eu
ROLE=${1:?role hub|spoke}
SRC=${2:?http base url}
# steps go to the screen and to ttyS0, which Packer logs and build.sh follows
say() { echo "### $*"; echo "### $*" >/dev/ttyS0 2>/dev/null || true; LAB_STEP=$*; export LAB_STEP; }
on_exit() { rc=$?; if [ "$rc" != 0 ]; then say "FAILED (exit $rc) - see this console log"; fi; }
trap on_exit EXIT

say "fetch kit"
mkdir -p /tmp/kit
wget -q -O /tmp/kit.tar.gz "$SRC/kit.tar.gz"
tar -xzf /tmp/kit.tar.gz -C /tmp/kit
[ -f "/tmp/kit/$ROLE/setup.sh" ] || { echo "unknown role $ROLE"; exit 1; }
. /tmp/kit/cluster.conf

# command journal for the build: live system now, the chroot below
TR=/tmp/kit/common/rootfs/usr/local/lib/lab/lab-trace
TRACE=${TRACE:-changes} TRACE_OUTPUT=${TRACE_OUTPUT:-no}
LAB_TRACE_DIR=/tmp/trace-log LAB_TRACE_CONSOLE=/dev/ttyS0 LAB_TRACE_HOST=build-$ROLE LAB_TRACE_CTX=installer
export TRACE TRACE_OUTPUT LAB_TRACE_DIR LAB_TRACE_CONSOLE LAB_TRACE_HOST LAB_TRACE_CTX
if [ "$TRACE" != off ]; then sh "$TR" --install /tmp/trace.d >/dev/null; PATH=/tmp/trace.d:$PATH; export PATH; fi

say "repositories"
VER=$(cut -d. -f1,2 /etc/alpine-release)
cat >/etc/apk/repositories <<REPO
https://dl-cdn.alpinelinux.org/alpine/v$VER/main
https://dl-cdn.alpinelinux.org/alpine/v$VER/community
REPO
apk update
setup-keymap us us >/dev/null 2>&1 || true
say "disk tools for setup-disk (installed here so their use is traced)"
apk add e2fsprogs sfdisk syslinux
if [ "$TRACE" != off ]; then sh "$TR" --install /tmp/trace.d >/dev/null; fi

say "install Alpine to /dev/vda"
ERASE_DISKS=/dev/vda BOOTLOADER=syslinux setup-disk -m sys -s 0 /dev/vda

say "mount target"
ROOT="" BOOT=""
for p in /dev/vda1 /dev/vda2 /dev/vda3; do
  [ -b "$p" ] || continue
  mount "$p" /mnt 2>/dev/null || continue
  if [ -f /mnt/etc/alpine-release ]; then ROOT=$p; else BOOT=$p; fi
  umount /mnt
done
[ -n "$ROOT" ] || { echo "root partition not found"; exit 1; }
mount "$ROOT" /mnt
if [ -n "$BOOT" ]; then mount "$BOOT" /mnt/boot; fi
mount -t proc proc /mnt/proc
mount -o bind /dev /mnt/dev
mount -o bind /sys /mnt/sys
cp /etc/resolv.conf /mnt/etc/resolv.conf
cp /etc/apk/repositories /mnt/etc/apk/repositories
rm -rf /mnt/tmp/kit
cp -a /tmp/kit /mnt/tmp/kit

say "bake role: $ROLE"
if [ "$TRACE" != off ]; then chroot /mnt /bin/sh "$TR" --install /tmp/trace.d >/dev/null; fi
chroot /mnt /usr/bin/env BAKE=1 KIT=/tmp/kit LAB_TRACE_CTX="setup $ROLE (chroot)" \
  PATH=/tmp/trace.d:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  /bin/sh "/tmp/kit/$ROLE/setup.sh"

say "serial console"
sed -i -e 's/^default_kernel_opts="\(.*\)"/default_kernel_opts="\1 console=tty0 console=ttyS0,115200"/' \
       -e 's/^serial_port=.*/serial_port=0/' -e 's/^serial_baud=.*/serial_baud=115200/' \
       /mnt/etc/update-extlinux.conf
chroot /mnt update-extlinux >/dev/null 2>&1 || true
if grep -q '^#ttyS0' /mnt/etc/inittab; then
  sed -i 's/^#ttyS0/ttyS0/' /mnt/etc/inittab
elif ! grep -q '^ttyS0' /mnt/etc/inittab; then
  echo 'ttyS0::respawn:/sbin/getty -L 115200 ttyS0 vt100' >>/mnt/etc/inittab
fi
grep -qx ttyS0 /mnt/etc/securetty 2>/dev/null || echo ttyS0 >>/mnt/etc/securetty

say "access: root password (console), lab PC key (ssh)"
echo "root:$ROOT_PASSWORD" | chroot /mnt chpasswd
install -d -m 700 /mnt/root/.ssh
install -m 600 /tmp/kit/authorized_keys /mnt/root/.ssh/authorized_keys

say "template cleanup: every clone must generate its own identity"
rm -f /mnt/etc/ssh/ssh_host_* /mnt/root/.ssh/id_* /mnt/root/.ash_history
rm -f /mnt/etc/machine-id /mnt/var/lib/dbus/machine-id
rm -f /mnt/etc/lab/node.env /mnt/etc/lab/tenants /mnt/etc/lab/join.conf /mnt/etc/lab/no-autojoin
rm -f /mnt/var/lib/lab/token /mnt/var/lib/lab/nodes /mnt/var/lib/lab/tenants \
      /mnt/var/lib/lab/vms /mnt/var/lib/lab/known_hosts
rm -rf /mnt/var/lib/lab/seen /mnt/tmp/kit /mnt/tmp/trace.d /mnt/tmp/trace-log /mnt/var/cache/apk/* /mnt/var/lib/udhcpc/*
# empty the lab logs but keep the files (dnsmasq's log is pre-created with its owner)
find /mnt/var/log/lab -type f -exec sh -c ': >"$1"' _ {} \; 2>/dev/null || true
rm -f /mnt/etc/resolv.conf

umount /mnt/sys /mnt/dev /mnt/proc
if [ -n "$BOOT" ]; then umount /mnt/boot; fi
umount /mnt
sync
say "done: $ROLE"
poweroff
