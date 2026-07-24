# SBA Clustering Artifacts — Usage Guide

**From:** Jason (Phase 0 + Phase 1)
**For:** Thariq (LogReg), Mahda (LightGBM), Axel (TabPFN-3)
**Date:** 15 Juni 2026

---

## What's in the ZIP

| File | Description |
|------|-------------|
| `X_train_encoded.parquet` | Encoded + scaled training features (174,993 rows × 46 cols) |
| `X_val_encoded.parquet` | Encoded + scaled validation features (37,507 rows × 46 cols) |
| `X_test_encoded.parquet` | Encoded + scaled test features (37,500 rows × 46 cols) |
| `y_train.parquet` | Training labels — column `Default` (0 or 1) |
| `y_val.parquet` | Validation labels |
| `y_test.parquet` | Test labels |
| `cluster_features_train.parquet` | Cluster features for training (174,993 rows × 9 cols) |
| `cluster_features_val.parquet` | Cluster features for validation (37,507 rows × 9 cols) |
| `cluster_features_test.parquet` | Cluster features for test (37,500 rows × 9 cols) |
| `clustering_model.pkl` | Fitted MiniBatchKMeans model (k=8) |
| `clustering_scaler.pkl` | StandardScaler used for clustering features |
| `encoder_state.pkl` | Target encoder for State & BankState |
| `scaler.pkl` | StandardScaler for main feature pipeline |
| `cluster_profile.csv` | Cluster interpretation table (original scale) |
| `k_sweep_results.csv` | k=3 to 12 sweep results (inertia, silhouette, DB) |
| `sba_250k.parquet` | Full 250k subsample (pre-encoding, for reference) |
| `train_idx.npy` / `val_idx.npy` / `test_idx.npy` | Row indices for reproducibility |

---

## Quick Start — Copy-Paste This

```python
import pandas as pd
import numpy as np

# ============================================================
# STEP 1: Load encoded features + labels
# ============================================================
X_train = pd.read_parquet('X_train_encoded.parquet')
X_val   = pd.read_parquet('X_val_encoded.parquet')
X_test  = pd.read_parquet('X_test_encoded.parquet')

y_train = pd.read_parquet('y_train.parquet')['Default']
y_val   = pd.read_parquet('y_val.parquet')['Default']
y_test  = pd.read_parquet('y_test.parquet')['Default']

# ============================================================
# STEP 2: Load cluster features
# ============================================================
clust_train = pd.read_parquet('cluster_features_train.parquet')
clust_val   = pd.read_parquet('cluster_features_val.parquet')
clust_test  = pd.read_parquet('cluster_features_test.parquet')

# ============================================================
# STEP 3: Build baseline & enhanced datasets
# ============================================================

# --- Skenario 1a: BASELINE (tanpa cluster features) ---
# Langsung pakai X_train, X_val, X_test apa adanya.

# --- Skenario 1b: ENHANCED (dengan cluster features) ---
X_train_enh = pd.concat([X_train.reset_index(drop=True),
                          clust_train.reset_index(drop=True)], axis=1)
X_val_enh   = pd.concat([X_val.reset_index(drop=True),
                          clust_val.reset_index(drop=True)], axis=1)
X_test_enh  = pd.concat([X_test.reset_index(drop=True),
                          clust_test.reset_index(drop=True)], axis=1)

print(f"Baseline features:  {X_train.shape[1]} columns")
print(f"Enhanced features:  {X_train_enh.shape[1]} columns (+9 cluster)")
```

---

## What Are the 9 Cluster Columns?

| Column | Type | Description |
|--------|------|-------------|
| `cluster_id` | int (0–7) | Hard cluster assignment dari K-Means |
| `cluster_dist_0` | float | Jarak ke centroid cluster 0 |
| `cluster_dist_1` | float | Jarak ke centroid cluster 1 |
| `cluster_dist_2` | float | Jarak ke centroid cluster 2 |
| `cluster_dist_3` | float | Jarak ke centroid cluster 3 |
| `cluster_dist_4` | float | Jarak ke centroid cluster 4 |
| `cluster_dist_5` | float | Jarak ke centroid cluster 5 |
| `cluster_dist_6` | float | Jarak ke centroid cluster 6 |
| `cluster_dist_7` | float | Jarak ke centroid cluster 7 |

`cluster_id` = kategori mana cluster borrower ini masuk.
`cluster_dist_*` = seberapa jauh borrower dari setiap centroid (makin kecil = makin mirip).

---

## 3 Skenario Uji Coba — Recap

### Skenario 1: Ablation Cluster Features
- **1a (Baseline):** Train model pakai `X_train`, eval pakai `X_val` / `X_test`
- **1b (Enhanced):** Train model pakai `X_train_enh`, eval pakai `X_val_enh` / `X_test_enh`
- **Bandingkan** F1, ROC-AUC, PR-AUC antara 1a vs 1b

### Skenario 2: Hyperparameter Tuning
- **2a (Default params):** Pakai parameter default dari library
- **2b (Tuned params):** Pakai Optuna 50 trials, optimize F1 di validation set
- Gunakan dataset **enhanced** (dengan cluster features) untuk kedua sub-skenario

### Skenario 3: Threshold Optimization
- **3a (Threshold 0.5):** Pakai default threshold 0.5
- **3b (Optimal threshold):** Cari threshold terbaik dari precision-recall curve di validation set, lalu apply ke test set
- Gunakan model terbaik dari Skenario 2

---

## Template Code per Model

### Thariq — Logistic Regression

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, roc_auc_score, classification_report

# Skenario 1a: Baseline
lr_base = LogisticRegression(solver='saga', class_weight='balanced',
                              max_iter=2000, random_state=42)
lr_base.fit(X_train, y_train)
y_pred_base = lr_base.predict(X_test)
print("Skenario 1a (Baseline):")
print(f"F1: {f1_score(y_test, y_pred_base):.4f}")

# Skenario 1b: Enhanced
lr_enh = LogisticRegression(solver='saga', class_weight='balanced',
                             max_iter=2000, random_state=42)
lr_enh.fit(X_train_enh, y_train)
y_pred_enh = lr_enh.predict(X_test_enh)
print("Skenario 1b (Enhanced):")
print(f"F1: {f1_score(y_test, y_pred_enh):.4f}")
```

### Mahda — LightGBM

```python
import lightgbm as lgb

# Skenario 1a: Baseline
lgb_base = lgb.LGBMClassifier(
    n_estimators=100, learning_rate=0.1,
    scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
    random_state=42, verbose=-1
)
lgb_base.fit(X_train, y_train)

# Skenario 1b: Enhanced
lgb_enh = lgb.LGBMClassifier(
    n_estimators=100, learning_rate=0.1,
    scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
    random_state=42, verbose=-1
)
lgb_enh.fit(X_train_enh, y_train)
```

### Axel — TabPFN-3

```python
from tabpfn import TabPFNClassifier

# Skenario 1a: Baseline
tabpfn_base = TabPFNClassifier(device='cuda', n_estimators=4, random_state=42)
tabpfn_base.fit(X_train, y_train)

# Skenario 1b: Enhanced
tabpfn_enh = TabPFNClassifier(device='cuda', n_estimators=4, random_state=42)
tabpfn_enh.fit(X_train_enh, y_train)
```

---

## Threshold Optimization (Skenario 3) — Semua Model Sama

```python
from sklearn.metrics import precision_recall_curve, f1_score

# Pakai model terbaik dari Skenario 2
y_val_proba = best_model.predict_proba(X_val_enh)[:, 1]

# Cari threshold optimal
prec, rec, thresholds = precision_recall_curve(y_val, y_val_proba)
f1_scores = 2 * prec * rec / (prec + rec + 1e-10)
best_threshold = thresholds[f1_scores.argmax()]

print(f"Optimal threshold: {best_threshold:.4f}")

# Apply ke test set
y_test_proba = best_model.predict_proba(X_test_enh)[:, 1]

# 3a: default threshold
y_pred_default = (y_test_proba >= 0.5).astype(int)
print(f"F1 @ 0.5:              {f1_score(y_test, y_pred_default):.4f}")

# 3b: optimal threshold
y_pred_optimal = (y_test_proba >= best_threshold).astype(int)
print(f"F1 @ {best_threshold:.3f}:  {f1_score(y_test, y_pred_optimal):.4f}")
```

---

## Important Notes

1. **Jangan re-fit atau re-scale data** — semua sudah di-encode dan di-scale. Langsung pakai.
2. **Jangan shuffle ulang** — urutan baris sudah aligned antara X, y, dan cluster features.
3. **`reset_index(drop=True)` wajib** saat concat, karena index X dan cluster features beda.
4. **Test set = sekali pakai** — semua tuning dan threshold optimization di validation set dulu.
5. **Random seed = 42** — pakai konsisten di semua model untuk reproducibility.
6. **Primary metric = F1** — karena class imbalance ~18% default.

---

## Dataset Stats (Quick Reference)

| Split | Rows | Features (base) | Features (enhanced) | Default Rate |
|-------|------|-----------------|--------------------:|--------------|
| Train | 174,993 | 46 | 55 | 17.56% |
| Val | 37,507 | 46 | 55 | 17.56% |
| Test | 37,500 | 46 | 55 | 17.56% |

---

## Cluster Summary (for your report sections)

| Cluster | Label | Default Rate | Avg Loan ($) | Risk Tier |
|---------|-------|-------------|-------------|-----------|
| C0 | Small admin/support services | 23.8% | $53,797 | Medium |
| C1 | Established mid-size businesses | 6.7% | $251,701 | Low |
| C2 | New retail trade ventures | 23.3% | $88,964 | Medium |
| C3 | High-risk unsecured small services | 28.7% | $58,395 | High |
| C4 | Recession-hit construction | 25.0% | $55,491 | High |
| C5 | New businesses with strong SBA backing | 8.8% | $60,657 | Low |
| C6 | Franchise restaurants/hospitality | 22.2% | $118,183 | Medium |
| C7 | Large real-estate-backed loans | 1.7% | $396,725 | Low |

---

Ada pertanyaan? Chat di grup ya. — Jason
