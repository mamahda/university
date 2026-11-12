# Cloud Dynamics — Empirical Analysis

This is the stage-neutral analysis bundle. It uses Python `venv` and Jupyter; Docker is not required.

## Layout

```text
research/
├── cloud-dynamics-experiments/
│   └── results/
└── cloud-dynamics-analysis/
    ├── requirements.txt
    ├── scripts/
    ├── analysis/
    ├── notebooks/
    └── outputs/
```

The default result path is `../cloud-dynamics-experiments/results`. No experiment data need to be copied.

## 1. Prerequisite

Ubuntu/Debian:

```sh
sudo apt install python3 python3-venv
```

## 2. Create the virtual environment

```sh
cd cloud-dynamics-analysis
./scripts/create-venv.sh
```

This creates `.venv` and installs JupyterLab, Jupyter Notebook, ipykernel, pandas, NumPy, SciPy, and Matplotlib. `.venv` is excluded by `.gitignore`.

## 3. Start Jupyter

```sh
./scripts/start-jupyter.sh
```

Open `http://127.0.0.1:8888` and then `notebooks/empirical-analysis.ipynb`. JupyterLab is the default.

For classic Notebook:

```sh
export JUPYTER_MODE=notebook
./scripts/start-jupyter.sh
```

For another port:

```sh
export JUPYTER_PORT=8890
./scripts/start-jupyter.sh
```

## 4. Use another result directory

For the standard sibling layout, no variable is required. For another location:

```sh
export RESULTS_DIR=/storage3/home/royyana/Project/cloud2023/kubernetes/research/results
./scripts/start-jupyter.sh
```

The notebook reads `RESULTS_DIR` when defined and otherwise uses `../cloud-dynamics-experiments/results`. Machine-specific paths are therefore not hard-coded.

## 5. Notebook workflow

The notebook automatically discovers all experiment directories containing `combined.csv`, displays their indices, and loads the selected experiment:

```python
experiments = sorted(
    p for p in RESULTS.iterdir()
    if p.is_dir() and (p / "combined.csv").exists()
)

EXPERIMENT_INDEX = 0
EXPERIMENT = experiments[EXPERIMENT_INDEX]
df = pd.read_csv(EXPERIMENT / "combined.csv")
```

It includes descriptive statistics, workload/request-rate visualization, latency visualization, and correlation analysis. Extend this notebook for CPU/memory dynamics, cross-correlation, saturation, repeated-run comparison, confidence intervals, and architecture comparisons.

## 6. Output separation

Experiment data remain in `cloud-dynamics-experiments/results`. Analysis artifacts go into `cloud-dynamics-analysis/outputs`. This prevents derived files from becoming mixed with collected measurements.

## 7. Command-line analysis

The same `.venv` supports reproducible non-notebook analysis. One experiment:

```sh
EXP=../cloud-dynamics-experiments/results/ramp-<experiment-id>
./scripts/analyze-experiment.sh "$EXP"
```

All experiments:

```sh
./scripts/analyze-all.sh ../cloud-dynamics-experiments/results
```

Campaign output is written under `outputs/campaign/`.

## 8. Research workflow

```text
controlled workload
       ↓
Prometheus/Linkerd collection
       ↓
combined.csv
       ↓
Jupyter / CLI analysis
       ├── descriptive statistics
       ├── workload dynamics
       ├── latency dynamics
       ├── resource relationships
       ├── repeated-run comparison
       └── architecture comparison
       ↓
outputs/
```

Treat each repeated run as an experimental unit rather than treating every time sample from all runs as an independent repetition. Correlation does not establish causality, and time lag between workload and resource response should be considered.

## 9. Recreate the environment

The environment is disposable:

```sh
rm -rf .venv
./scripts/create-venv.sh
```

Preserve `requirements.txt`, source code, notebooks, raw experiment data, and generated research outputs rather than committing `.venv`.

## 10. Normal daily use

After initial setup, the normal entry point is simply:

```sh
cd cloud-dynamics-analysis
./scripts/start-jupyter.sh
```
