#!/bin/sh


. ./variables.sh

set -eu

NAMESPACE="monitoring"
RELEASE="monitoring"

HOST_IP="${HOST_IP:-127.0.0.1}"
INGRESS_CLASS="nginx"

PROM_HOST="prometheus.${HOST_IP}.sslip.io"
GRAFANA_HOST="grafana.${HOST_IP}.sslip.io"

PROM_URL="http://${PROM_HOST}:${INGRESS_HTTP_PORT}"
GRAFANA_URL="http://${GRAFANA_HOST}:${INGRESS_HTTP_PORT}"

echo "======================================"
echo "Prometheus installation"
echo "======================================"
echo
echo "Host IP        : ${HOST_IP}"
echo "Prometheus URL : http://${PROM_URL}"
echo "Grafana URL    : http://${GRAFANA_URL}"
echo


echo "=== Add Prometheus Helm repository ==="

if ! helm repo add prometheus-community \
    https://prometheus-community.github.io/helm-charts
then
    echo "Prometheus Helm repository may already exist."
fi

helm repo update


echo
echo "=== Create monitoring namespace ==="

kubectl create namespace "${NAMESPACE}" \
    --dry-run=client \
    -o yaml \
    | kubectl apply -f -


echo
echo "=== Check ingress controller ==="

kubectl get ingressclass

if ! kubectl get ingressclass "${INGRESS_CLASS}" >/dev/null 2>&1
then
    echo
    echo "ERROR: IngressClass '${INGRESS_CLASS}' not found."
    echo "Verify that the ingress controller is installed."
    exit 1
fi


echo
echo "=== Install kube-prometheus-stack ==="

helm upgrade --install "${RELEASE}" \
    prometheus-community/kube-prometheus-stack \
    --namespace "${NAMESPACE}"


echo
echo "=== Wait for Prometheus Operator ==="

kubectl rollout status \
    "deployment/${RELEASE}-kube-prometheus-operator" \
    -n "${NAMESPACE}" \
    --timeout=180s || true


echo
echo "=== Monitoring pods ==="

kubectl get pods -n "${NAMESPACE}"


echo
echo "=== Monitoring services ==="

kubectl get svc -n "${NAMESPACE}"


echo
echo "=== Create Prometheus ingress ==="

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prometheus
  namespace: ${NAMESPACE}
spec:
  ingressClassName: ${INGRESS_CLASS}
  rules:
    - host: ${PROM_HOST}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${RELEASE}-kube-prometheus-prometheus
                port:
                  number: 9090
EOF


echo
echo "=== Create Grafana ingress ==="

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana
  namespace: ${NAMESPACE}
spec:
  ingressClassName: ${INGRESS_CLASS}
  rules:
    - host: ${GRAFANA_HOST}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${RELEASE}-grafana
                port:
                  number: 80
EOF


echo
echo "=== Ingress configuration ==="

kubectl get ingress -n "${NAMESPACE}"
#kubectl apply -f prometheus-servicemonitor.yml 
cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ingress-nginx
  namespace: monitoring
  labels:
    release: monitoring
spec:
  namespaceSelector:
    matchNames:
    - ingress-nginx

  selector:
    matchLabels:
      app.kubernetes.io/name: ingress-nginx
      app.kubernetes.io/component: controller

  endpoints:
  - port: metrics
    path: /metrics
    interval: 5s

EOF






echo
echo "=== DNS verification ==="

echo
echo "Prometheus:"
getent hosts "${PROM_HOST}" || true

echo
echo "Grafana:"
getent hosts "${GRAFANA_HOST}" || true


echo
echo "======================================"
echo "Installation completed"
echo "======================================"
echo
echo "Prometheus:"
echo "  http://${PROM_HOST}"
echo
echo "Grafana:"
echo "  http://${GRAFANA_HOST}"

echo
echo "DNS tests:"
echo "  getent hosts ${PROM_HOST}"
echo "  getent hosts ${GRAFANA_HOST}"

echo
echo "Prometheus health test:"
echo "  curl http://${PROM_HOST}/-/healthy"

echo
echo "Prometheus readiness test:"
echo "  curl http://${PROM_HOST}/-/ready"

echo
echo "Prometheus API test:"
echo "  curl -sG 'http://${PROM_HOST}/api/v1/query' --data-urlencode 'query=up' | jq '.data.result | length'"

echo
echo "Grafana admin password:"
echo "  kubectl get secret ${RELEASE}-grafana \\"
echo "    -n ${NAMESPACE} \\"
echo "    -o jsonpath='{.data.admin-password}' | base64 -d"
echo

#to see grafana password, user= admin
# kubectl -n monitoring get secret monitoring-grafana -o 'jsonpath={.data.admin-password}' | base64 -d 
