#!/bin/sh
# up.sh -- start the control plane (node-cp), export admin.kubeconfig,
# and issue one join token per worker into ./tokens/.
set -eu
cd "$(dirname "$0")"
. ./variables.sh


sudo sysctl -w fs.inotify.max_user_instances=512
sudo sysctl -w fs.inotify.max_user_watches=524288

# === Pre-flight ===
require_tools
resolve_gateway
check_host
check_state_fs "${NODE_DIR}"
log "node=${NODE_NAME} k0s=${K0S_VERSION} image=${K0S_NODE_IMAGE} gateway=${GATEWAY_ADDR}"

if cp_ready; then
    log "${NODE_NAME} already up and running"
else
    # === Cluster configuration ===
    mkdir -p "${DATA_DIR}" "${ETC_DIR}" "${LOG_DIR}" "${TOKEN_DIR}"
    chmod 700 "${TOKEN_DIR}"
    NETWORK_EXTRA=""
    if [ "${CNI_PROVIDER}" = "calico" ]; then
        # eth0 = the node container's interface on the docker bridge
        NETWORK_EXTRA="    calico:
      mode: ${CALICO_MODE}
      overlay: ${CALICO_OVERLAY}
      wireguard: ${CALICO_WIREGUARD}
      mtu: ${CALICO_MTU}
      envVars:
        IP_AUTODETECTION_METHOD: interface=eth0"
    fi
    cat > "${ETC_DIR}/k0s.yaml" <<YAML
apiVersion: k0s.k0sproject.io/v1beta1
kind: ClusterConfig
metadata:
  name: ${CLUSTER_NAME}
spec:
  api:
    externalAddress: ${GATEWAY_ADDR}
    port: ${API_PORT}
    k0sApiPort: ${JOIN_PORT}
    sans:
      - ${GATEWAY_ADDR}
      - 127.0.0.1
      - localhost
      - ${NODE_NAME}
  konnectivity:
    agentPort: ${KONNECTIVITY_PORT}
  network:
    provider: ${CNI_PROVIDER}
    podCIDR: ${POD_CIDR}
    serviceCIDR: ${SERVICE_CIDR}
${NETWORK_EXTRA}
  workerProfiles:
    - name: docker
      values:
        failSwapOn: false
YAML
    k0s config validate --config "${ETC_DIR}/k0s.yaml"
    log "config: ${ETC_DIR}/k0s.yaml"

    # === Start controller container ===
    snapshot_kernel_tunables
    docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    set -- run -d \
        --name "${CONTAINER_NAME}" --hostname "${NODE_NAME}" \
        --privileged --cgroupns=host --restart "${RESTART_POLICY}" \
        --label "k0s.cluster=${CLUSTER_NAME}" --label "k0s.role=controller" \
        -v "${K0S_HOST_BIN}:/usr/local/bin/k0s:ro" \
        -v "${DATA_DIR}:/var/lib/k0s" \
        -v "${ETC_DIR}:/etc/k0s" \
        -v "${LOG_DIR}:/var/log/pods" \
        -v /lib/modules:/lib/modules:ro \
        -p "127.0.0.1:${API_PORT}:${API_PORT}" \
        -p "${GATEWAY_ADDR}:${API_PORT}:${API_PORT}" \
        -p "${GATEWAY_ADDR}:${JOIN_PORT}:${JOIN_PORT}" \
        -p "${GATEWAY_ADDR}:${KONNECTIVITY_PORT}:${KONNECTIVITY_PORT}" \
	-p "0.0.0.0:${INGRESS_HTTP_PORT}:80/tcp" \
        -p "0.0.0.0:${INGRESS_HTTPS_PORT}:443/tcp"

    if [ -n "${NODE_MEMORY}" ]; then set -- "$@" --memory "${NODE_MEMORY}"; fi
    if [ -n "${NODE_CPUS}" ]; then set -- "$@" --cpus "${NODE_CPUS}"; fi
    set -- "$@" "${K0S_NODE_IMAGE}" k0s controller --config=/etc/k0s/k0s.yaml --enable-worker --no-taints --profile=docker
    docker "$@" >/dev/null
    log "${CONTAINER_NAME} started"

    # === Wait for API server ===
    wait_for "API server" "${WAIT_TIMEOUT}" \
        docker exec "${CONTAINER_NAME}" k0s kubectl get --raw=/readyz

    # === Admin kubeconfig (host kubectl via 127.0.0.1) ===
    docker exec "${CONTAINER_NAME}" cat /var/lib/k0s/pki/admin.conf \
        | sed -E "s#(server: https://)[^\"[:space:]]+#\\1127.0.0.1:${API_PORT}#" > "${CP_KUBECONFIG}"
    chmod 600 "${CP_KUBECONFIG}"
    wait_for "host kubectl" 60 kc get --raw=/readyz
fi

# === Worker join tokens -> ./tokens/<node>.token ===
for w in ${WORKER_NODES}; do
    "${NODE_DIR}/token.sh" "${w}"
done

log "export KUBECONFIG=${CP_KUBECONFIG}"
kc get --raw='/version' | sed -n 's/.*"gitVersion": *"\([^"]*\)".*/kubernetes \1/p'
wait_for "labeled" "${WAIT_TIMEOUT}" \
   kc label node ${NODE_NAME} ingress-ready=true --overwrite
