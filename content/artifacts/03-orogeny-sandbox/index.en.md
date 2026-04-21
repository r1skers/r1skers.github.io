---
date: '2026-02-22T05:30:00+09:00'
draft: false
title: "[Artifact-3] Orogeny Sandbox End-to-End Validation"
summary: "An end-to-end record from Gaussian terrain generation and PDE diffusion to stable-domain dataset construction, multistep/CNN rollout validation, and OOD plus 3-sigma runtime gates."
description: "Artifact-3 tracks the full PDE-to-ML pipeline in orogeny-sandbox, including the frozen best multistep run, CNN proof-of-concept, and OOD runtime gating."
tags:
  - "Artifact"
  - "Orogeny Sandbox"
  - "PDE"
  - "Stencil Learning"
  - "CNN"
  - "OOD"
  - "Reliability"
categories:
  - "Artifacts"
weight: 30
---

## 1. Goal

This page records the v0.1 milestone of `orogeny-sandbox` as one full end-to-end chain:

`terrain generation -> PDE diffusion -> stable-domain data engineering -> stencil learning -> rollout validation -> OOD + 3-sigma runtime gate`

Project path: `D:\Github_Repos\orogeny-sandbox`

---

## 2. End-to-End Flowchart

[![Artifact-3 flowchart (SVG)](orogeny-sandbox-flow.svg)](orogeny-sandbox-flow.svg)

---

## 3. Chain Breakdown (Phase 1 -> 6)

### Phase 1: Terrain + PDE
- Input: `data/terrain/peak50.npz`
- Core scripts:
  - `scripts/sandbox_diffusion.py`
  - `scripts/simulate_diffusion.py`
  - `scripts/sweep_dt.py`
  - `scripts/sweep_dxdy.py`
- Outputs:
  - `data/trajectory/*`
  - `outputs/metrics/dt_sweep_summary.csv`
  - `outputs/metrics/dxdy_sweep_summary.csv`
- Takeaway:
  - Under the canonical setup (`kappa=1`, `dx=dy=1`), `dt_max=0.25`.
  - `dt=0.24` remains stable, while `dt=0.30/0.35` clearly diverges.

### Phase 2: Stable-Domain Data Engineering
- Input: trajectory data from Phase 1.
- Core script: `scripts/build_stencil_dataset.py`
- Rule: keep only samples with `cfl_ratio <= 0.95`.
- Output: `outputs/datasets/stencil_dataset_v1.csv`

### Phase 3: Stencil Learning (v1 and multistep)
- Baseline branch:
  - `scripts/train_stencil_baseline.py`
  - `scripts/rollout_stencil_linear.py`
- Torch one-step branch:
  - `scripts/train_stencil_torch.py`
  - `scripts/rollout_stencil_torch.py`
- Torch multistep branch:
  - `scripts/train_stencil_torch_multistep.py`
  - `configs/stencil_multistep_best_neumann_h5_m1e4.json`

### Phase 4: Continuous Rollout Validation
- Core scripts:
  - `scripts/rollout_stencil_torch.py`
  - `scripts/rollout_cnn_torch.py`
- Validation mode:
  - compare learned rollout with PDE ground truth at every step.
- Key outputs:
  - `outputs/rollout/*/rollout_metrics.csv`
  - `outputs/rollout/*/summary.json`

### Phase 5: Frozen Best Reproducible Run
- One-command entry:
  - `scripts/run_frozen_best_multistep.py`
- Config:
  - `configs/stencil_multistep_best_neumann_h5_m1e4.json`
- Frozen setup:
  - `horizon=5`, `lambda_mass=1e-4`, `epochs=10`, `batches_per_epoch=96`, `batch_trajectories=4`

### Phase 6: CNN POC + OOD Runtime Gate
- POC runner:
  - `scripts/run_cnn_poc_standard.py`
  - `configs/cnn_poc_neumann_standard.json`
- OOD profile + runtime gate:
  - `scripts/build_ood_sigma_profile.py`
  - `scripts/ood_sigma.py`
  - `configs/ood_sigma_profile_neumann_default.json`
- Outputs:
  - `outputs/metrics/generalization_min_summary_cnn_poc_neumann_standard_cnn_poc_v1.csv`
  - `outputs/rollout/ood_smoke_*/summary.json`

---

## 4. Current Key Metrics

Current snapshot from `README.md` and `outputs/*`:

| Item | Value |
|---|---:|
| One-step test R² (Torch stencil v1) | 0.9996875303 |
| Frozen multistep 60-step final MAE | 0.0270107879 |
| Frozen multistep 120-step final MAE | 0.0528981476 |
| Frozen multistep 120-step final mass abs error | 124.5418858851 |
| CNN POC 120-step final MAE | 0.0569392458 |
| CNN POC 120-step final mass abs error | 130.6776753687 |
| Minimal benchmark mean final MAE (CNN) | 0.0557232487 |
| Minimal benchmark mean final MAE (frozen multistep) | 0.0560578554 |
| OOD smoke (ID Neumann): `ood_is_ood` | false |
| OOD smoke (Periodic): `ood_is_ood`, violations | true, 2 |

---

## 5. Reproduce the Mainline

### 5.1 Core Path (v1)

```powershell
python scripts/sandbox_diffusion.py --size 50 --sigma 7 --out data/terrain/peak50.npz
python scripts/simulate_diffusion.py --data data/terrain/peak50.npz --out-dir data/trajectory/run_stable --steps 120 --save-every 30 --dt 0.1 --kappa 1.0 --dx 1.0 --dy 1.0 --boundary neumann
python scripts/build_stencil_dataset.py --out-csv outputs/datasets/stencil_dataset_v1.csv --summary-csv outputs/datasets/stencil_trajectory_summary_v1.csv --meta-json outputs/datasets/stencil_dataset_v1_meta.json --num-trajectories 200 --steps 40 --samples-per-step 128 --size 50 --seed 42 --boundaries neumann --cfl-ratio-max 0.95
python scripts/train_stencil_torch.py --data-csv outputs/datasets/stencil_dataset_v1.csv --target-col next_center --epochs 6 --batch-size 4096 --lr 0.001 --weight-decay 0.000001 --hidden-dims 64,64 --dropout 0.0 --model-pt outputs/models/stencil_torch_v1_next.pt --model-json outputs/models/stencil_torch_v1_next_meta.json --report-csv outputs/reports/stencil_torch_v1_next_report.csv --pred-csv outputs/reports/stencil_torch_v1_next_predictions.csv --skip-predictions --test-ratio 0.2 --seed 42
python scripts/rollout_stencil_torch.py --model-pt outputs/models/stencil_torch_v1_next.pt --data data/terrain/peak50.npz --out-dir outputs/rollout/stencil_torch_v1_next_peak50_120 --steps 120 --kappa 1.0 --dx 1.0 --dy 1.0 --dt 0.1 --boundary neumann --save-every 20
```

### 5.2 Frozen Best (multistep)

```powershell
python scripts/run_frozen_best_multistep.py
```

### 5.3 CNN POC + OOD Smoke

```powershell
python scripts/run_cnn_poc_standard.py --run-name cnn_poc_v1 --device auto
python scripts/build_ood_sigma_profile.py --samples 3000 --seed 42 --out-json configs/ood_sigma_profile_neumann_default.json
python scripts/rollout_stencil_torch.py --model-pt outputs/models/stencil_torch_neumann_multistep_h5_m1e4_ep10b96.pt --data data/terrain/peak50.npz --out-dir outputs/rollout/ood_smoke_stencil_id --steps 20 --kappa 1.0 --dx 1.0 --dy 1.0 --dt 0.1 --boundary neumann --save-every 20 --ood-profile configs/ood_sigma_profile_neumann_default.json --ood-sigma 3.0
python scripts/rollout_cnn_torch.py --model-pt outputs/models/cnn_poc_neumann_standard_cnn_poc_v1.pt --data data/terrain/peak50.npz --out-dir outputs/rollout/ood_smoke_cnn_id --steps 20 --kappa 1.0 --dx 1.0 --dy 1.0 --dt 0.1 --boundary neumann --save-every 20 --ood-profile configs/ood_sigma_profile_neumann_default.json --ood-sigma 3.0
```

---

## 6. Acceptance Gates

1. PDE stability gate: CFL condition is satisfied and the simulation does not explode.
2. Dataset gate: stable-domain filtering with `cfl_ratio <= 0.95` is enforced.
3. One-step gate: report metrics reach high-accuracy fitting.
4. Long-horizon rollout gate: 120-step rollout stays bounded and records drift.
5. Frozen config gate: `configs/stencil_multistep_best_neumann_h5_m1e4.json` reproduces the reference metrics in one command.
6. Reliability gate: the OOD + 3-sigma runtime alert distinguishes ID runs from clearly OOD runs such as periodic cases.

---

## 7. Current Limits

- Long-horizon rollout still accumulates error and mass drift.
- The OOD profile is currently centered on the Neumann-distribution family, so cross-boundary generalization still needs more coverage.
- The current benchmark is still minimal (12 cases); broader amplitude/sigma/dt sweeps and richer terrain families are still needed.

---

## 8. Linked Entry

- Parent: [Artifacts](/en/artifacts/)
- Previous: [Artifact-2](/en/artifacts/02-forgeflow/)
