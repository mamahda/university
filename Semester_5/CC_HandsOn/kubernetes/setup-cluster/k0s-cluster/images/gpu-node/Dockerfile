# Rootfs for GPU worker nodes: glibc base + NVIDIA Container Toolkit.
# The k0s binary is NOT baked in; the host's k0s is bind-mounted at runtime.
ARG BASE_IMAGE=ubuntu:24.04
FROM ${BASE_IMAGE}
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg iptables ipset kmod mount util-linux \
 && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
        | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
 && curl -fsSL https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
        | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
        > /etc/apt/sources.list.d/nvidia-container-toolkit.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends nvidia-container-toolkit \
 && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /usr/local/bin/k0s-gpu-entrypoint
RUN chmod 0755 /usr/local/bin/k0s-gpu-entrypoint
ENTRYPOINT ["/usr/local/bin/k0s-gpu-entrypoint"]
