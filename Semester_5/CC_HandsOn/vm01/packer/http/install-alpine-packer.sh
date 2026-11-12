#!/bin/sh
#
# install-alpine-packer.sh
#
# Unattended Alpine Linux installation script intended to be invoked from
# a HashiCorp Packer QEMU build while booted from the Alpine installation ISO.
#
# Typical Packer boot flow:
#   1. Boot Alpine ISO.
#   2. Log in as root (the Alpine installer ISO normally has no root password).
#   3. Acquire DHCP.
#   4. Download this script from Packer's HTTP server.
#   5. Run it.
#   6. The script installs Alpine to disk and reboots.
#   7. Packer reconnects to the installed system over SSH.
#
# Example boot command fragment:
#
#   root<enter><wait>
#   udhcpc -i eth0<enter><wait5>
#   wget -O /tmp/install.sh http://{{ .HTTPIP }}:{{ .HTTPPort }}/install-alpine-packer.sh<enter>
#   chmod +x /tmp/install.sh<enter>
#   PACKER_PASSWORD='packer' /tmp/install.sh<enter>
#
# WARNING:
#   This script DESTROYS all data on TARGET_DISK.
#

set -eu

###############################################################################
# Configuration
###############################################################################

TARGET_DISK="${TARGET_DISK:-/dev/vda}"
HOSTNAME="${HOSTNAME:-alpine-base}"
TIMEZONE="${TIMEZONE:-UTC}"
KEYMAP="${KEYMAP:-us us}"
NETWORK_IFACE="${NETWORK_IFACE:-eth0}"

# Credentials used only so Packer can reconnect after installation.
# Override these from the Packer boot command.
PACKER_USER="${PACKER_USER:-root}"
PACKER_PASSWORD="${PACKER_PASSWORD:-packer}"

# Alpine repository selection:
# -1 chooses the first usable mirror.
# -c enables the community repository.
APKREPOSOPTS="${APKREPOSOPTS:--1 -c}"

# Packages to ensure are available in the resulting workshop image.
# openssh is installed by setup-alpine when SSHDOPTS=openssh.
EXTRA_PACKAGES="${EXTRA_PACKAGES:-bash ca-certificates curl sudo util-linux e2fsprogs iproute2}"

ANSWER_FILE="/tmp/packer-alpine-answerfile"
TARGET_MOUNT="/mnt"

###############################################################################
# Helpers
###############################################################################

log() {
    printf '\n==> %s\n' "$*"
}

die() {
    printf '\nERROR: %s\n' "$*" >&2
    exit 1
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

###############################################################################
# Safety and environment checks
###############################################################################

[ "$(id -u)" -eq 0 ] || die "This installer must run as root."

require_cmd setup-alpine
require_cmd apk
require_cmd ip
require_cmd chpasswd
require_cmd mount
require_cmd umount

[ -b "$TARGET_DISK" ] || die "Target disk does not exist: $TARGET_DISK"

case "$TARGET_DISK" in
    /dev/vd*|/dev/sd*|/dev/nvme*)
        ;;
    *)
        die "Refusing unexpected target disk name: $TARGET_DISK"
        ;;
esac

log "Target disk: $TARGET_DISK"
log "Hostname:    $HOSTNAME"
log "Interface:   $NETWORK_IFACE"

###############################################################################
# Bring up networking on the live installer
###############################################################################

log "Ensuring network connectivity"

ip link set "$NETWORK_IFACE" up 2>/dev/null || true

if ! ip -4 addr show dev "$NETWORK_IFACE" | grep -q 'inet '; then
    if command -v udhcpc >/dev/null 2>&1; then
        udhcpc -i "$NETWORK_IFACE" -q -n || die "DHCP failed on $NETWORK_IFACE"
    else
        die "No IPv4 address and udhcpc is unavailable"
    fi
fi

###############################################################################
# Create setup-alpine answer file
###############################################################################

log "Creating setup-alpine answer file"

cat > "$ANSWER_FILE" <<EOF
KEYMAPOPTS="$KEYMAP"
HOSTNAMEOPTS="$HOSTNAME"
DEVDOPTS="mdev"

INTERFACESOPTS="auto lo
iface lo inet loopback

auto $NETWORK_IFACE
iface $NETWORK_IFACE inet dhcp
    hostname $HOSTNAME
"

DNSOPTS="none"
TIMEZONEOPTS="$TIMEZONE"
PROXYOPTS="none"
APKREPOSOPTS="$APKREPOSOPTS"

# Do not create a separate administrative user during installation.
USEROPTS="none"

# Install OpenSSH so Packer can reconnect after reboot.
SSHDOPTS="openssh"

# NTP is intentionally omitted from the minimal image.
NTPOPTS="none"

# Traditional system-disk installation.
# Disable swap to keep the image layout compact and predictable.
DISKOPTS="-m sys -s 0 $TARGET_DISK"

LBUOPTS="none"
APKCACHEOPTS="none"
EOF

cat "$ANSWER_FILE"

###############################################################################
# Install Alpine
###############################################################################

log "Installing Alpine Linux"

# -e avoids an interactive root-password prompt during installation.
# ERASE_DISKS suppresses the target-disk erase confirmation.
#
# The root account is secured immediately after setup-alpine completes.
ERASE_DISKS="$TARGET_DISK" setup-alpine -e -f "$ANSWER_FILE"

###############################################################################
# Find and mount the installed root filesystem
###############################################################################

log "Locating installed root filesystem"

# setup-alpine normally leaves the installed root mounted at /mnt. If it did
# not, find a Linux filesystem partition on the target disk that contains
# /etc/alpine-release.
find_installed_root() {
    if [ -f "$TARGET_MOUNT/etc/alpine-release" ]; then
        return 0
    fi

    mkdir -p "$TARGET_MOUNT"

    # Common Alpine setup-disk layouts typically put root on partition 3,
    # but probe all partitions instead of depending on a fixed partition number.
    for part in "${TARGET_DISK}"*; do
        [ "$part" = "$TARGET_DISK" ] && continue
        [ -b "$part" ] || continue

        umount "$TARGET_MOUNT" 2>/dev/null || true

        if mount "$part" "$TARGET_MOUNT" 2>/dev/null; then
            if [ -f "$TARGET_MOUNT/etc/alpine-release" ]; then
                ROOT_PARTITION="$part"
                export ROOT_PARTITION
                return 0
            fi
            umount "$TARGET_MOUNT" 2>/dev/null || true
        fi
    done

    return 1
}

find_installed_root || die "Could not locate the installed Alpine root filesystem"

log "Installed root filesystem: ${ROOT_PARTITION:-already mounted at $TARGET_MOUNT}"

###############################################################################
# Configure the installed system for Packer
###############################################################################

log "Configuring installed system for Packer"

# Set the temporary Packer SSH credential inside the installed system.
printf '%s:%s\n' "$PACKER_USER" "$PACKER_PASSWORD" | chroot "$TARGET_MOUNT" chpasswd

# Ensure root password authentication works when PACKER_USER=root.
# These settings are intentionally explicit for the image-build phase.
SSHD_CONFIG="$TARGET_MOUNT/etc/ssh/sshd_config"

if [ "$PACKER_USER" = "root" ]; then
    if grep -qE '^[#[:space:]]*PermitRootLogin' "$SSHD_CONFIG"; then
        sed -i 's/^[#[:space:]]*PermitRootLogin.*/PermitRootLogin yes/' "$SSHD_CONFIG"
    else
        printf '\nPermitRootLogin yes\n' >> "$SSHD_CONFIG"
    fi
fi

if grep -qE '^[#[:space:]]*PasswordAuthentication' "$SSHD_CONFIG"; then
    sed -i 's/^[#[:space:]]*PasswordAuthentication.*/PasswordAuthentication yes/' "$SSHD_CONFIG"
else
    printf 'PasswordAuthentication yes\n' >> "$SSHD_CONFIG"
fi

# Make sure sshd starts on boot.
chroot "$TARGET_MOUNT" rc-update add sshd default >/dev/null 2>&1 || true

###############################################################################
# Install useful base packages
###############################################################################

log "Installing workshop base packages"

# The installed system inherits repository configuration from setup-alpine.
# Use chroot so packages are installed into the target image, not the live ISO.
chroot "$TARGET_MOUNT" apk update

# shellcheck disable=SC2086
chroot "$TARGET_MOUNT" apk add --no-cache $EXTRA_PACKAGES

###############################################################################
# Basic image configuration
###############################################################################

log "Applying base image configuration"

# Enable useful core services.
chroot "$TARGET_MOUNT" rc-update add networking boot >/dev/null 2>&1 || true
chroot "$TARGET_MOUNT" rc-update add acpid default >/dev/null 2>&1 || true

# Ensure hostname is explicit.
printf '%s\n' "$HOSTNAME" > "$TARGET_MOUNT/etc/hostname"

# Make the image friendlier for serial-console QEMU use.
if [ -f "$TARGET_MOUNT/etc/inittab" ]; then
    if ! grep -q '^ttyS0::' "$TARGET_MOUNT/etc/inittab"; then
        cat >> "$TARGET_MOUNT/etc/inittab" <<'EOF'

# Serial console for QEMU workshop images.
ttyS0::respawn:/sbin/getty -L 115200 ttyS0 vt100
EOF
    fi
fi

###############################################################################
# Clean build-specific state
###############################################################################

log "Cleaning image"

rm -f "$TARGET_MOUNT/etc/ssh/ssh_host_"* 2>/dev/null || true
rm -rf "$TARGET_MOUNT/var/cache/apk/"* 2>/dev/null || true
rm -rf "$TARGET_MOUNT/tmp/"* 2>/dev/null || true

# Recreate SSH host keys on first boot if Alpine's sshd service does not do it.
# OpenRC's sshd init script normally handles missing keys, but this explicitly
# leaves the image free of builder-specific host identities.

sync

###############################################################################
# Finish
###############################################################################

log "Installation complete"
log "The system will reboot into the installed Alpine image."

sleep 2

# setup-alpine may leave target filesystems mounted. Reboot is safe after sync;
# avoid aggressively unmounting nested filesystems here because the exact
# setup-disk layout can vary between Alpine releases.
reboot
