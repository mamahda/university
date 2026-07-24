# SBA FP — Phase 0 Artifacts Guide
**Untuk Thariq, Mahda, dan Axel**

Dataset sudah siap. Ikuti langkah-langkah di bawah ini sebelum mulai modeling.

---

## Step 1 — Add Dataset ke Notebook Kalian

1. Buka Kaggle Notebook kalian
2. Klik **"+ Add Data"** di panel kanan atas
3. Pilih tab **"Your Datasets"** atau **"Shared With You"**
4. Search: `sba-fp-phase0-artifacts`
5. Klik **Add** — dataset akan mount otomatis di `/kaggle/input/sba-fp-phase0-artifacts/`

---

## Step 2 — Load Data di Notebook

Copy paste cell ini di awal notebook kalian:

```python
import pandas as pd
import numpy as np

# ── Load feature matrices ──────────────────────────────────────────
X_train = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/X_train_encoded.parquet')
X_val   = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/X_val_encoded.parquet')
X_test  = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/X_test_encoded.parquet')

# ── Load target labels ─────────────────────────────────────────────
y_train = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/y_train.parquet')['Default']
y_val   = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/y_val.parquet')['Default']
y_test  = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/y_test.parquet')['Default']

# ── Verify ─────────────────────────────────────────────────────────
print("=== DATA LOADED ===")
print(f"X_train : {X_train.shape}  | Default rate: {y_train.mean():.4f}")
print(f"X_val   : {X_val.shape}   | Default rate: {y_val.mean():.4f}")
print(f"X_test  : {X_test.shape}   | Default rate: {y_test.mean():.4f}")
print(f"\nFeatures ({X_train.shape[1]}):")
print(X_train.columns.tolist())
```

**Expected output:**
```
=== DATA LOADED ===
X_train : (174993, 46)  | Default rate: 0.1756
X_val   : (37507, 46)   | Default rate: 0.1756
X_test  : (37500, 46)   | Default rate: 0.1756
```

---

## Step 3 — Tunggu Cluster Features dari Jason (Phase 1)

Setelah Jason selesai Phase 1 (K-Means), dia akan upload tambahan file:
- `cluster_features_train.parquet`
- `cluster_features_val.parquet`
- `cluster_features_test.parquet`

Untuk **Skenario 1 (Ablation)** kalian butuh dua versi X:

```python
# ── Skenario 1a: TANPA cluster features (baseline) ─────────────────
# Langsung pakai X_train, X_val, X_test yang sudah di-load di atas

# ── Skenario 1b: DENGAN cluster features (enhanced) ────────────────
# Load cluster features setelah Jason upload
clust_train = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/cluster_features_train.parquet')
clust_val   = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/cluster_features_val.parquet')
clust_test  = pd.read_parquet('/kaggle/input/sba-fp-phase0-artifacts/cluster_features_test.parquet')

X_train_enhanced = pd.concat([X_train.reset_index(drop=True), 
                               clust_train.reset_index(drop=True)], axis=1)
X_val_enhanced   = pd.concat([X_val.reset_index(drop=True), 
                               clust_val.reset_index(drop=True)], axis=1)
X_test_enhanced  = pd.concat([X_test.reset_index(drop=True), 
                               clust_test.reset_index(drop=True)], axis=1)

print(f"X_train_enhanced: {X_train_enhanced.shape}")
```

---

## Step 4 — Aturan Penting (WAJIB DIIKUTI)

| Aturan | Detail |
|---|---|
| **Test set JANGAN disentuh** | Hanya boleh dipakai SEKALI untuk final evaluation di Hari 8 |
| **Semua tuning pakai X_val** | Optuna, threshold tuning — semuanya di validation set |
| **Jangan refit encoder/scaler** | Data sudah encoded dan scaled, jangan transform ulang |
| **Random seed = 42** | Semua model, Optuna, numpy — pakai seed 42 |
| **class_weight = 'balanced'** | Wajib untuk semua model karena class imbalance 17.56% |

---

## Step 5 — File Reference

| File | Deskripsi | Ukuran |
|---|---|---|
| `X_train_encoded.parquet` | Feature matrix training (174,993 × 46) | 3.04 MB |
| `X_val_encoded.parquet` | Feature matrix validation (37,507 × 46) | 0.70 MB |
| `X_test_encoded.parquet` | Feature matrix test (37,500 × 46) | 0.70 MB |
| `y_train.parquet` | Target training | 0.03 MB |
| `y_val.parquet` | Target validation | 0.01 MB |
| `y_test.parquet` | Target test | 0.01 MB |
| `encoder_state.pkl` | Fitted target encoder (State, BankState) | 0.01 MB |
| `scaler.pkl` | Fitted StandardScaler | 0.00 MB |
| `sba_250k.parquet` | Full processed subsample (250k × 33) | 7.82 MB |
| `train_idx.npy` | Train split indices | 1.34 MB |
| `val_idx.npy` | Val split indices | 0.29 MB |
| `test_idx.npy` | Test split indices | 0.29 MB |

---

## Feature List (46 Features)

| Feature | Type | Deskripsi |
|---|---|---|
| `State` | float | Target encoded default rate per state |
| `Bank` | float | Frequency encoded bank |
| `BankState` | float | Target encoded default rate per bank state |
| `Term` | float | Loan term in months (scaled) |
| `NoEmp` | float | log1p(number of employees) (scaled) |
| `CreateJob` | float | log1p(jobs created) (scaled) |
| `RetainedJob` | float | log1p(jobs retained) (scaled) |
| `RevLineCr` | int | Revolving line of credit: 1=Y, 0=N/0, -1=unknown |
| `LowDoc` | int | LowDoc program: 1=Y, 0=N, -1=unknown |
| `New` | int | New business: 1=new, 0=existing |
| `RealEstate` | int | Real estate backed: 1=yes (Term≥240), 0=no |
| `IsFranchise` | int | Franchise: 1=yes, 0=no |
| `Recession` | int | Disbursed during recession: 1=yes, 0=no |
| `Portion` | float | SBA guarantee ratio (scaled) |
| `SameBankState` | int | Bank in same state as borrower: 1=yes, 0=no |
| `LoanSize_log` | float | log1p(DisbursementGross) (scaled) |
| `ApprovalYear` | float | Year of approval (scaled) |
| `JobsPerLoan` | float | (CreateJob+RetainedJob)/log1p(loan size) (scaled) |
| `Industry_0` ... `Industry_92` | int | One-hot encoded NAICS 2-digit industry (25 cols) |
| `UrbanRural_0/1/2` | int | One-hot encoded urban/rural status (3 cols) |

---

## Ada Pertanyaan?

Hubungi Jason via WhatsApp/Discord group.
