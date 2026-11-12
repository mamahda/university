# Cloud Dynamics — Monitoring Data Collection

This bundle converts completed Cloud Dynamics workload experiments into research-ready datasets by retrieving system metrics from Prometheus for the **exact measurement interval recorded by each experiment**.

It consumes the output of `cloud-dynamics-experiments` and produces:

```text
experiment directory
├── workload.csv
├── metadata.json
├── measurement-window.env
├── metrics/
│   ├── cpu_usage.csv
│   ├── cpu_throttled.csv
│   ├── memory_working_set.csv
│   ├── network_rx.csv
│   ├── network_tx.csv
│   ├── restarts.csv
│   ├── ready_pods.csv
│   ├── linkerd_request_rate.csv
│   ├── linkerd_success_rate.csv
│   ├── linkerd_latency_p95.csv
│   ├── collection-status.csv
│   └── collection-metadata.json
└── combined.csv
```

The purpose is to keep workload generation and monitoring collection separate while linking them through experiment identity and timestamps.

# 1. Data flow

```text
controlled workload experiment
          |
          +--> workload.csv
          +--> metadata.json
          +--> measurement-window.env
                       |
                       v
                 this bundle
                       |
                       v
                   Prometheus
                       |
        +--------------+---------------+
        |              |               |
        v              v               v
 Kubernetes        Linkerd        application
 metrics           metrics          metrics
        |              |               |
        +--------------+---------------+
                       |
                       v
                  timestamp join
                       |
                       v
                   combined.csv
```

# 2. Prerequisites

Required locally:

```text
Python 3
curl
POSIX /bin/sh
```

Required in the experiment environment:

```text
Prometheus
Kubernetes/container metrics
Linkerd metrics if Linkerd analysis is required
```

The workload experiment must already have completed and contain:

```text
workload.csv
metadata.json
measurement-window.env
```

# 3. Enter the bundle

```sh
cd cloud-dynamics-metrics
```

# 4. Configure the environment

Defaults are stored in:

```sh
config/environment.env
```

with:

```sh
HOST_IP=127.0.0.1
PROMETHEUS_URL=
NAMESPACE=cloud-dynamics
SAMPLE_INTERVAL=1
```

`127.0.0.1` is deliberately the default.

For a remotely reachable cluster, export the address once:

```sh
export HOST_IP=10.28.84.254
```

The default Prometheus URL is then constructed as:

```text
http://prometheus.10.28.84.254.sslip.io
```

If Prometheus uses another endpoint, set it explicitly:

```sh
export PROMETHEUS_URL=http://your-prometheus-address
```

An exported value takes precedence over the configuration file.

# 5. Verify Prometheus

Run:

```sh
./scripts/check-prometheus.sh
```

Expected:

```text
Prometheus: http://prometheus.127.0.0.1.sslip.io
OK: Prometheus is ready.
```

For the remote cluster:

```sh
export HOST_IP=10.28.84.254
./scripts/check-prometheus.sh
```

Do not continue until the Prometheus HTTP API is reachable.

# 6. Identify a completed experiment

Suppose the workload bundle is adjacent:

```text
cloud-dynamics-experiments/
cloud-dynamics-metrics/
```

List completed experiments:

```sh
ls ../cloud-dynamics-experiments/results/
```

Select one, for example:

```sh
EXP=../cloud-dynamics-experiments/results/ramp-20261006T020000Z-r1
```

Verify:

```sh
cat "$EXP/measurement-window.env"
cat "$EXP/metadata.json"
head "$EXP/workload.csv"
```

# 7. Check the application identity

The collector reads the application name from:

```text
metadata.json
```

It should contain an application entry such as:

```json
{
  "application": {
    "name": "stateless-api",
    "architecture": "stateless"
  }
}
```

This name is used to select application pods in Prometheus.

If an older experiment has an incomplete application name, provide it explicitly:

```sh
./scripts/collect-experiment.sh "$EXP" stateless-api
```

# 8. Collect metrics for one experiment

Run:

```sh
./scripts/collect-experiment.sh "$EXP"
```

The collector reads:

```text
MEASUREMENT_START_EPOCH
MEASUREMENT_END_EPOCH
SAMPLE_INTERVAL
```

from `measurement-window.env`.

It then sends Prometheus range queries using precisely that interval.

The experiment directory is extended with:

```text
metrics/
combined.csv
```

# 9. Inspect collection status

Run:

```sh
cat "$EXP/metrics/collection-status.csv"
```

The table reports:

```text
metric
status
rows
query
```

A metric can have:

```text
status=ok, rows>0
```

when data were returned.

A metric may also have zero rows when the query is valid but the corresponding exporter or metric is unavailable.

Do not silently interpret an empty metric as zero resource usage.

# 10. Inspect Kubernetes/container metrics

Examples:

```sh
head "$EXP/metrics/cpu_usage.csv"
head "$EXP/metrics/memory_working_set.csv"
head "$EXP/metrics/network_rx.csv"
```

Each raw metric file has:

```text
timestamp_epoch,series,value
```

The `series` field preserves Prometheus labels that distinguish returned time series.

# 11. Inspect Linkerd metrics

When Linkerd proxy metrics are available:

```sh
head "$EXP/metrics/linkerd_request_rate.csv"
head "$EXP/metrics/linkerd_success_rate.csv"
head "$EXP/metrics/linkerd_latency_p95.csv"
```

If these files contain only their header, inspect:

```sh
cat "$EXP/metrics/collection-status.csv"
```

and verify the actual metric labels exposed by your Linkerd/Prometheus installation.

Prometheus metric schemas can differ with component versions and scraping configuration. The supplied queries are therefore an experiment-framework starting point, not a substitute for verifying the local metric schema.

# 12. Inspect the combined dataset

Run:

```sh
head "$EXP/combined.csv"
```

The file begins with workload columns:

```text
timestamp_epoch
elapsed_s
target_rps
sent
success
failed
achieved_rps
mean_latency_ms
p95_latency_ms
```

and adds metric columns such as:

```text
CPU_USAGE
CPU_THROTTLED
MEMORY_WORKING_SET
NETWORK_RX
NETWORK_TX
RESTARTS
READY_PODS
LINKERD_REQUEST_RATE
LINKERD_SUCCESS_RATE
LINKERD_LATENCY_P95
```

This produces a time-aligned table relating workload input to observed system response.

# 13. Understand aggregation

Prometheus may return several time series for a metric, for example one CPU series per pod.

The raw CSV retains those individual series.

For `combined.csv`, the collector currently computes the arithmetic mean of all returned series at each timestamp and aligns the nearest observation to the workload timestamp.

This is intentionally simple and transparent.

For research requiring another aggregation semantics, such as:

```text
sum CPU across replicas
maximum pod CPU
per-pod analysis
frontend versus backend
database versus API
```

use the raw metric CSVs or modify the query/aggregation rule rather than treating the default mean as universally appropriate.

# 14. Collect all experiments

After validating collection on one experiment:

```sh
./scripts/collect-all.sh ../cloud-dynamics-experiments/results
```

The script processes every directory containing:

```text
measurement-window.env
```

Do this only after checking that the PromQL queries return meaningful data for the environment.

# 15. Query definitions

Queries are stored in:

```sh
queries/metrics.env
```

The collector substitutes:

```text
__NAMESPACE__
__APP__
```

with the current experiment values.

For example:

```promql
sum by (pod) (
  rate(
    container_cpu_usage_seconds_total{
      namespace="__NAMESPACE__",
      pod=~"__APP__.*",
      container!="",
      container!="POD"
    }[1m]
  )
)
```

becomes a query for the selected application.

# 16. Validate metric names before a large campaign

Before collecting hundreds of experiments, inspect Prometheus interactively or through its API and confirm that the environment provides the expected metrics.

Important families include:

```text
container_cpu_usage_seconds_total
container_cpu_cfs_throttled_seconds_total
container_memory_working_set_bytes
container_network_receive_bytes_total
container_network_transmit_bytes_total
kube_pod_container_status_restarts_total
kube_pod_status_ready
```

Linkerd metric names and labels should also be verified against the installed version.

A query returning no series is a measurement problem that should be resolved before statistical analysis.

# 17. Example complete procedure

Assume the application and workload experiment have already been run.

Set the remote cluster once if necessary:

```sh
export HOST_IP=10.28.84.254
```

Verify Prometheus:

```sh
./scripts/check-prometheus.sh
```

Select the experiment:

```sh
EXP=../cloud-dynamics-experiments/results/ramp-20261006T020000Z-r1
```

Inspect its measurement window:

```sh
cat "$EXP/measurement-window.env"
```

Collect:

```sh
./scripts/collect-experiment.sh "$EXP"
```

Validate:

```sh
cat "$EXP/metrics/collection-status.csv"
head "$EXP/metrics/cpu_usage.csv"
head "$EXP/metrics/memory_working_set.csv"
head "$EXP/combined.csv"
```

Only after validating one experiment should you run:

```sh
./scripts/collect-all.sh ../cloud-dynamics-experiments/results
```

# 18. Experimental interpretation

The combined dataset permits relationships such as:

```text
target_rps
    |
    v
achieved_rps
    |
    +------> CPU_USAGE
    |
    +------> MEMORY_WORKING_SET
    |
    +------> p95_latency_ms
    |
    +------> LINKERD_REQUEST_RATE
    |
    +------> LINKERD_LATENCY_P95
```

A ramp experiment may reveal a region in which:

```text
workload increases
       |
       v
CPU increases
       |
       v
CPU approaches saturation
       |
       +----> latency increases sharply
       |
       +----> throughput stops scaling proportionally
       |
       +----> failures may appear
```

The purpose of the dataset is to test such relationships empirically rather than assume them.

# 19. Application architecture matters

For a stateless application, application pod metrics may be sufficient.

For `database-api`, relevant analysis may need both:

```text
database-api pods
PostgreSQL pod
```

For `cache-api`:

```text
cache-api pods
Redis pod
```

For `microservices`:

```text
frontend pods
backend pods
frontend → backend Linkerd traffic
```

The default query set focuses on the application name recorded by the workload experiment.

For architecture-level studies, add dependency-specific queries to `queries/metrics.env` or collect dependencies as separate datasets.

# 20. Data quality checks

Before accepting a combined dataset, verify:

```text
[ ] workload.csv contains the intended interval
[ ] Prometheus was available
[ ] CPU data exist
[ ] memory data exist
[ ] network data exist if required
[ ] Linkerd data exist if required
[ ] timestamps overlap
[ ] sample interval is appropriate
[ ] application selector identifies the intended pods
[ ] no unexpected monitoring gap exists
```

Missing observations should remain missing. Do not automatically replace missing metrics with zero.

# 21. Reproducibility

Preserve:

```text
experiment ID
measurement-window.env
workload.csv
metadata.json
PromQL query definitions
Prometheus endpoint/configuration
collection-status.csv
raw metric CSVs
combined.csv
```

If PromQL definitions change, record that change. A dataset collected with a different query definition is a different measurement procedure even when the workload experiment is identical.

# 22. Result structure after collection

A complete experiment becomes:

```text
results/<experiment-id>/
├── experiment.env
├── scenario.env
├── metadata.json
├── workload.csv
├── measurement-window.env
├── metrics/
│   ├── collection-metadata.json
│   ├── collection-status.csv
│   ├── cpu_usage.csv
│   ├── cpu_throttled.csv
│   ├── memory_working_set.csv
│   ├── network_rx.csv
│   ├── network_tx.csv
│   ├── restarts.csv
│   ├── ready_pods.csv
│   ├── linkerd_request_rate.csv
│   ├── linkerd_success_rate.csv
│   └── linkerd_latency_p95.csv
└── combined.csv
```

`combined.csv` is the principal handoff to empirical analysis, while the raw metric files remain the authoritative material for alternative aggregation and deeper analysis.

# 23. Next analytical step

Once several experiments have valid `combined.csv` files, analysis can examine:

```text
descriptive statistics
workload variability
coefficient of variation
correlation
latency-throughput curves
resource-demand relationships
saturation points
run-to-run variability
confidence intervals
autocorrelation
cross-correlation and lag
architecture comparison
```

The same datasets can later support workload prediction, autoscaling, scheduling, and resource-allocation research.
