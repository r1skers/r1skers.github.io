---
date: '2026-02-21T20:00:00+09:00'
draft: false
title: "[Artifact-3] Orogeny Sandbox 全链验证 / Orogeny Sandbox End-to-End Validation"
summary: "从高斯地形生成、PDE 扩散仿真、稳定域数据集构建到 stencil 学习与 rollout 对照的完整链路记录。 / End-to-end record from Gaussian terrain generation and PDE diffusion to stable-domain dataset building, stencil learning, and rollout comparison."
description: "Artifact 3 tracks the full PDE-to-ML pipeline in orogeny-sandbox."
tags:
  - "Artifact"
  - "Orogeny Sandbox"
  - "PDE"
  - "Stencil Learning"
  - "Rollout"
  - "Reliability"
categories:
  - "Artifacts"
weight: 30
aliases:
  - /artifacts/orogeny-sandbox/
---

## 1. 目标 / Goal

本页按“一条链路跑到底”的方式记录 `orogeny-sandbox`：  
This page documents `orogeny-sandbox` as one full chain:

`地形生成 -> PDE 扩散 -> 稳定域数据工程 -> stencil 学习 -> 全网格 rollout 验证`  
`terrain generation -> PDE diffusion -> stable-domain data engineering -> stencil learning -> full-grid rollout validation`

项目路径 / Project path: `D:\Github_Repos\orogeny-sandbox`

---

## 2. 全链流程图 / End-to-End Flowchart

[![Artifact-3 flowchart (SVG)](orogeny-sandbox-flow.svg)](orogeny-sandbox-flow.svg)

点击可查看原图 / Click to open full-size SVG.

---

## 3. 链路拆解（Phase 1 -> 4） / Chain Breakdown (Phase 1 -> 4)

### Phase 1: 地形 + PDE
- 输入 / Input: `data/terrain/peak50.npz`
- 核心脚本 / Core scripts:
  - `scripts/sandbox_diffusion.py`
  - `scripts/simulate_diffusion.py`
  - `scripts/sweep_dt.py`
  - `scripts/sweep_dxdy.py`
- 产物 / Outputs:
  - `data/trajectory/*`
  - `outputs/metrics/dt_sweep_summary.csv`
  - `outputs/metrics/dxdy_sweep_summary.csv`
- 结论 / Takeaway:
  - 在 canonical 设置（`kappa=1`, `dx=dy=1`）下，`dt_max=0.25`。
  - `dt=0.24` 可稳定，`dt=0.30/0.35` 明显发散。

### Phase 2: 稳定域数据工程
- 输入 / Input: Phase 1 轨迹数据。
- 核心脚本 / Core script: `scripts/build_stencil_dataset.py`
- 规则 / Rule: 仅保留 `cfl_ratio <= 0.95` 样本。
- 输出 / Output: `outputs/datasets/stencil_dataset_v1.csv`

### Phase 3: Stencil 学习
- Baseline 分支 / Baseline branch:
  - `scripts/train_stencil_baseline.py`
- Torch 分支 / Torch branch:
  - `scripts/train_stencil_torch.py`
- 关键产物 / Key artifacts:
  - `outputs/models/stencil_torch_v1_next.pt`
  - `outputs/reports/stencil_torch_v1_next_report.csv`

### Phase 4: 连续 rollout 对照
- 核心脚本 / Core scripts:
  - `scripts/rollout_stencil_linear.py`
  - `scripts/rollout_stencil_torch.py`
- 对照方式 / Validation mode:
  - 每步将 learned rollout 与 PDE ground truth 对比。
- 关键产物 / Key outputs:
  - `outputs/rollout/*/rollout_metrics.csv`
  - `outputs/rollout/*/summary.json`

---

## 4. 当前关键指标 / Current Key Metrics

来自 `README.md` v0.1 口径：  
From `README.md` v0.1 snapshot:

| Item | Value |
|---|---:|
| One-step test R² (Torch stencil v1) | 0.9996875303 |
| 60-step rollout final MAE | 0.0788041425 |
| 120-step rollout final MAE | 0.5343517538 |
| 120-step blow-up status | No blow-up |

---

## 5. 复现实验主链 / Reproduce Mainline

```powershell
python scripts/sandbox_diffusion.py --size 50 --sigma 7 --out data/terrain/peak50.npz
python scripts/simulate_diffusion.py --data data/terrain/peak50.npz --out-dir data/trajectory/run_stable --steps 120 --save-every 30 --dt 0.1 --kappa 1.0 --dx 1.0 --dy 1.0 --boundary neumann
python scripts/build_stencil_dataset.py --out-csv outputs/datasets/stencil_dataset_v1.csv --summary-csv outputs/datasets/stencil_trajectory_summary_v1.csv --meta-json outputs/datasets/stencil_dataset_v1_meta.json --num-trajectories 200 --steps 40 --samples-per-step 128 --size 50 --seed 42 --boundaries neumann --cfl-ratio-max 0.95
python scripts/train_stencil_torch.py --data-csv outputs/datasets/stencil_dataset_v1.csv --target-col next_center --epochs 6 --batch-size 4096 --lr 0.001 --weight-decay 0.000001 --hidden-dims 64,64 --dropout 0.0 --model-pt outputs/models/stencil_torch_v1_next.pt --model-json outputs/models/stencil_torch_v1_next_meta.json --report-csv outputs/reports/stencil_torch_v1_next_report.csv --pred-csv outputs/reports/stencil_torch_v1_next_predictions.csv --skip-predictions --test-ratio 0.2 --seed 42
python scripts/rollout_stencil_torch.py --model-pt outputs/models/stencil_torch_v1_next.pt --data data/terrain/peak50.npz --out-dir outputs/rollout/stencil_torch_v1_next_peak50_120 --steps 120 --kappa 1.0 --dx 1.0 --dy 1.0 --dt 0.1 --boundary neumann --save-every 20
```

---

## 6. 验收门槛 / Acceptance Gates

1. PDE 稳定门 / PDE stability gate: CFL 条件满足且不爆炸；CFL-compliant and non-explosive simulation.
2. 数据质量门 / Dataset gate: `cfl_ratio <= 0.95` 的稳定域过滤生效；stable-domain filtering (`cfl_ratio <= 0.95`) is enforced.
3. 一步精度门 / One-step gate: report 指标达到高精度拟合；one-step fitting metrics reach high accuracy.
4. 连续推演门 / Rollout gate: 120-step 不 blow-up 并记录误差漂移；120-step rollout stays bounded with tracked drift.

---

## 7. 当前边界 / Current Limits

- 当前 rollout 在长时域仍有误差累积与质量漂移。  
- Rollout still accumulates error and mass drift on long horizons.
- 目前以单峰高斯初值为主，场景多样性可继续扩展。  
- Current setup is mainly single-peak Gaussian initialization; scenario diversity can be expanded.
- 后续可加入更强的时空模型与 feature-space OOD 检测。  
- Next step can include stronger spatiotemporal models and feature-space OOD detection.

---

## 8. 关联入口 / Linked Entry

- 父索引 / Parent: [Artifacts](/artifacts/)
- 前一条 / Previous: [Artifact-2](/artifacts/02-forgeflow/)
