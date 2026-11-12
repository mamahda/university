# Cloud Dynamics — Applications Under Test

This bundle provides several application architectures that can be used as controlled targets in the **Cloud Dynamics empirical experiment framework**.

The applications are intentionally different in their dominant resource and dependency behavior. They allow the same workload-generation procedure to be applied to multiple application architectures so that workload dynamics, resource utilization, latency, throughput, saturation, and failure behavior can be compared.

The bundle is independent of a particular experiment stage number.

## Included applications

| Application | Architecture / dominant behavior | Typical observations |
|---|---|---|
| `stateless-api` | Simple stateless HTTP API | baseline latency, throughput, networking |
| `cpu-bound` | CPU-intensive processing | CPU saturation, throttling, latency growth |
| `memory-stateful` | Retained in-memory allocation | memory growth and state accumulation |
| `database-api` | HTTP API → PostgreSQL | database dependency and queueing effects |
| `cache-api` | HTTP API → Redis | cache/network dependency |
| `microservices` | frontend → backend | service-chain and Linkerd behavior |

## Directory structure

```text
cloud-dynamics-applications/
├── README.md
├── config/
│   └── environment.env
├── apps/
│   ├── stateless-api/
│   ├── cpu-bound/
│   ├── memory-stateful/
│   ├── database-api/
│   ├── cache-api/
│   └── microservices/
├── k8s/
│   ├── namespace.yaml
│   ├── ingress-template.yaml
│   └── ...
└── scripts/
    ├── build-and-load.sh
    ├── deploy.sh
    ├── smoke-test.sh
    └── remove.sh
```

# 1. Prerequisites

The environment is expected to provide:

```text
Docker
kind
kubectl
nginx Ingress
```

Linkerd is recommended when service-mesh observations are part of the experiment.

Enter the bundle:

```sh
cd cloud-dynamics-applications
```

# 2. Global environment configuration

The common configuration is stored in:

```sh
config/environment.env
```

Its defaults are:

```sh
HOST_IP=127.0.0.1
CLUSTER_NAME=kind
NAMESPACE=cloud-dynamics
```

Therefore, without any additional configuration, applications use:

```text
127.0.0.1
```

The scripts also accept exported environment variables. An exported value takes precedence over the default in `config/environment.env`.

For a cluster reachable at `10.28.84.254`, configure it once:

```sh
export HOST_IP=10.28.84.254
```

Verify:

```sh
echo "$HOST_IP"
```

Expected:

```text
10.28.84.254
```

All subsequent commands inherit this value:

```sh
./scripts/deploy.sh stateless-api
./scripts/smoke-test.sh stateless-api
./scripts/deploy.sh cpu-bound
./scripts/smoke-test.sh cpu-bound
```

There is no need to repeatedly provide the address as a positional parameter.

To return to the default behavior:

```sh
unset HOST_IP
```

The scripts then use:

```text
127.0.0.1
```

You may similarly override the kind cluster name:

```sh
export CLUSTER_NAME=mycluster
```

# 3. Build the first application

Start with the stateless baseline:

```sh
./scripts/build-and-load.sh stateless-api
```

The script builds:

```text
cloud-dynamics/stateless-api:latest
```

and loads the image into the configured kind cluster.

To build every application:

```sh
./scripts/build-and-load.sh all
```

# 4. Deploy the application

With the default environment:

```sh
./scripts/deploy.sh stateless-api
```

the endpoint becomes:

```text
http://stateless-api.127.0.0.1.sslip.io/
```

If you previously ran:

```sh
export HOST_IP=10.28.84.254
```

the exact same deployment command:

```sh
./scripts/deploy.sh stateless-api
```

creates:

```text
http://stateless-api.10.28.84.254.sslip.io/
```

This makes experiment scripts portable between a local cluster and a remotely reachable cluster.

# 5. Verify the deployment

```sh
kubectl -n cloud-dynamics get pods
kubectl -n cloud-dynamics get svc
kubectl -n cloud-dynamics get ingress
```

If Linkerd is installed:

```sh
linkerd -n cloud-dynamics check --proxy
```

# 6. Smoke-test the application

Run:

```sh
./scripts/smoke-test.sh stateless-api
```

The script automatically uses the current `HOST_IP`.

For example, after:

```sh
export HOST_IP=10.28.84.254
```

it tests:

```text
http://stateless-api.10.28.84.254.sslip.io/
```

Do not begin an empirical workload run until the smoke test succeeds.

# 7. Connect the workload experiment

The workload experiment runner can use the same global variable.

Construct the target URL using `HOST_IP`:

```sh
TARGET_URL="http://stateless-api.${HOST_IP:-127.0.0.1}.sslip.io/" ./scripts/run-experiment.sh scenarios/constant.env
```

For a ramp experiment:

```sh
TARGET_URL="http://stateless-api.${HOST_IP:-127.0.0.1}.sslip.io/" ./scripts/run-experiment.sh scenarios/ramp.env
```

The expression:

```sh
${HOST_IP:-127.0.0.1}
```

means that `127.0.0.1` is used when `HOST_IP` has not been exported.

# 8. Stateless API

Build:

```sh
./scripts/build-and-load.sh stateless-api
```

Deploy:

```sh
./scripts/deploy.sh stateless-api
```

Test:

```sh
./scripts/smoke-test.sh stateless-api
```

This is the reference application because it has no database or downstream service.

A recommended first experiment is:

```text
constant baseline
        ↓
repeat baseline
        ↓
ramp workload
        ↓
identify saturation region
```

# 9. CPU-bound API

Build and deploy:

```sh
./scripts/build-and-load.sh cpu-bound
./scripts/deploy.sh cpu-bound
```

Test:

```sh
curl "http://cpu-bound.${HOST_IP:-127.0.0.1}.sslip.io/?work=15000"
```

The `work` parameter controls computational intensity.

Example experiment:

```sh
TARGET_URL="http://cpu-bound.${HOST_IP:-127.0.0.1}.sslip.io/?work=15000" ./scripts/run-experiment.sh scenarios/ramp.env
```

Keep `work` constant when comparing other experimental factors.

# 10. Memory-stateful API

Build and deploy:

```sh
./scripts/build-and-load.sh memory-stateful
./scripts/deploy.sh memory-stateful
```

Test:

```sh
curl "http://memory-stateful.${HOST_IP:-127.0.0.1}.sslip.io/?kb=4"
```

Each request retains allocated memory.

For controlled repeated experiments, reset the application state by restarting the deployment:

```sh
kubectl -n cloud-dynamics rollout restart deployment/memory-stateful
kubectl -n cloud-dynamics rollout status deployment/memory-stateful
```

# 11. Database-backed API

Build and deploy:

```sh
./scripts/build-and-load.sh database-api
./scripts/deploy.sh database-api
```

The request path is:

```text
workload
   ↓
Ingress
   ↓
database-api
   ↓
PostgreSQL
```

Test:

```sh
./scripts/smoke-test.sh database-api
```

This application can reveal dependency bottlenecks that are absent from the stateless baseline.

# 12. Cache-backed API

Build and deploy:

```sh
./scripts/build-and-load.sh cache-api
./scripts/deploy.sh cache-api
```

Architecture:

```text
workload
   ↓
Ingress
   ↓
cache-api
   ↓
Redis
```

Test:

```sh
./scripts/smoke-test.sh cache-api
```

This provides a comparatively lightweight networked dependency.

# 13. Microservice application

Build and deploy:

```sh
./scripts/build-and-load.sh microservices
./scripts/deploy.sh microservices
```

Architecture:

```text
workload
   ↓
Ingress
   ↓
frontend
   ↓
backend
```

Test:

```sh
./scripts/smoke-test.sh microservices
```

This application is particularly useful when Linkerd is enabled because internal frontend-to-backend traffic can be observed separately from external requests.

# 14. Recommended comparative experiment

Apply an identical workload to several architectures:

```text
                  identical workload
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
    stateless-api    cpu-bound     database-api
          |              |              |
          v              v              v
       metrics         metrics         metrics
          |              |              |
          +--------------+--------------+
                         |
                         v
                 comparative dataset
```

Keep the following controlled where meaningful:

```text
workload profile
workload duration
sampling interval
replica count
CPU/memory limits
cluster topology
number of repetitions
measurement procedure
```

The application architecture can then be treated as an independent variable.

# 15. Suggested initial experiment matrix

| Experiment | Application | Workload | Replicates |
|---|---|---|---:|
| E1 | stateless-api | constant | 5 |
| E2 | stateless-api | ramp | 5 |
| E3 | cpu-bound | constant | 5 |
| E4 | cpu-bound | ramp | 5 |
| E5 | database-api | constant | 5 |
| E6 | database-api | ramp | 5 |

After validating these experiments, extend the matrix with memory-stateful, cache-api, microservices, burst, periodic, and variable workloads.

# 16. Switching applications

Remove an application:

```sh
./scripts/remove.sh stateless-api
```

Deploy another:

```sh
./scripts/deploy.sh cpu-bound
```

The global `HOST_IP` remains unchanged.

# 17. Typical remote-cluster session

For a cluster reachable at `10.28.84.254`, a complete shell session becomes:

```sh
cd cloud-dynamics-applications

export HOST_IP=10.28.84.254

./scripts/build-and-load.sh stateless-api
./scripts/deploy.sh stateless-api
./scripts/smoke-test.sh stateless-api
```

Then run the workload experiment:

```sh
TARGET_URL="http://stateless-api.${HOST_IP}.sslip.io/" ./scripts/run-experiment.sh scenarios/ramp.env
```

Switch target:

```sh
./scripts/build-and-load.sh cpu-bound
./scripts/deploy.sh cpu-bound
./scripts/smoke-test.sh cpu-bound
```

The IP address does not need to be supplied again.

# 18. Reproducibility

For every experiment preserve:

```text
application name
application architecture
application source/image version
resource requests and limits
replica count
HOST_IP/environment
workload profile
workload parameters
experiment ID
replicate number
measurement interval
```

The complete Cloud Dynamics flow is:

```text
Applications Under Test
          |
          v
Controlled workload experiment
          |
          +---- workload observations
          +---- experiment metadata
          +---- measurement window
                        |
                        v
               Prometheus export
                        |
                        v
                  combined dataset
                        |
                        v
                 empirical analysis
```
