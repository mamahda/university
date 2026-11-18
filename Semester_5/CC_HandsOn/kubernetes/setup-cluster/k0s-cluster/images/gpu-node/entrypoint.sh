#!/bin/sh
# entrypoint.sh -- fix-ups inside a nested GPU node container, then exec the command.
set -eu

# === Driver visibility ===
# The host toolkit masks /proc/driver/nvidia in this container; the nested
# toolkit needs the real view (same workaround as NVIDIA's nvkind).
umount -R /proc/driver/nvidia 2>/dev/null || true

# === Low-level runtime ===
# nvidia-container-runtime wraps runc; k0s extracts runc into its data dir.
ln -sf /var/lib/k0s/bin/runc /usr/local/bin/runc

# === Toolkit policy ===
if [ "${GPU_STRICT_ISOLATION:-no}" = "yes" ]; then
    nvidia-ctk config --in-place \
        --set accept-nvidia-visible-devices-as-volume-mounts=true \
        --set accept-nvidia-visible-devices-envvar-when-unprivileged=false
fi
if [ "${GPU_NO_CGROUPS:-no}" = "yes" ]; then
    nvidia-ctk config --in-place --set nvidia-container-cli.no-cgroups=true
fi

exec "$@"
