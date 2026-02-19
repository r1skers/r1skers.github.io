---
title: "[Artifact-2.2] Poly4 App 跑通流程与逻辑顺序 / Poly4 App Pipeline Validation"
date: '2026-02-18T00:30:23+09:00'
draft: false
summary: "首个真实 App 级验证文档：记录 poly4_cubic 从配置到产出的完整执行顺序与验收口径。 / First real app-level validation runbook for poly4_cubic."
description: "Engineering runbook for poly4_cubic: setup, pipeline order, outputs, and acceptance criteria."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Poly4"
  - "Validation"
categories:
  - "Artifacts"
weight: 22
aliases:
  - /artifacts/forgeflow-01-poly4-first-app-validation/
---

## 1. 目标 / Goal

在不修改 `forgeflow/core` 主流程的前提下，完成一次 App 隔离任务 `poly4_cubic` 的端到端跑通，并输出可复现结果。
Run an app-isolated `poly4_cubic` task end-to-end without changing `forgeflow/core`, and produce reproducible outputs.

## 2. 输入与配置 / Inputs and Config

配置文件 / Config file: `ForgeFlowApps/poly4_cubic/config/run.json`

关键字段 / Key fields:

- `task = poly4_cubic`
- `adapter_ref = ForgeFlowApps.poly4_cubic.adapters.poly4_cubic_adapter:Poly4CubicAdapter`
- `model_ref = ForgeFlowApps.poly4_cubic.models.polynomial_linear:PolyLinearDeg3Regressor`
- `train_csv = ForgeFlowApps/poly4_cubic/data/processed/train.csv`
- `infer_csv = ForgeFlowApps/poly4_cubic/data/infer/infer.csv`
- `split = { train_ratio: 0.8, shuffle: true, seed: 42 }`
- `eval_policy = { val_mae_max: 0.001, val_rmse_max: 0.001, val_maxae_max: 0.005 }`

## 3. 执行命令 / Run Command

```bash
python main.py --config ForgeFlowApps/poly4_cubic/config/run.json --log-level INFO
```

## 4. 逻辑顺序 / Pipeline Order

1. 加载 runtime config / Load runtime config.
2. 通过 `adapter_ref/model_ref` 解析并加载 App 类 / Resolve and load app classes.
3. 读取 train CSV，完成 `record -> state` / Read train CSV and map `record -> state`.
4. 构建 feature/target matrix / Build feature and target matrices.
5. 执行 split（`shuffle=true`, `seed=42`）/ Execute split.
6. 拟合三阶多项式线性回归模型 / Fit degree-3 polynomial linear regressor.
7. 计算 `MAE/RMSE/MaxAE` 并做 `PASS/FAIL` 判定 / Compute metrics and gate by pass/fail policy.
8. 用验证残差拟合 anomaly 阈值，执行 infer（chunk）/ Fit anomaly threshold and run chunked inference.
9. 写出 `predictions.csv` 与 `eval_report.csv` / Write outputs.

## 5. 中间回归逻辑 / Regression Logic In Between

`poly4_cubic` 的核心不是“换了一个数据集”，而是“从线性特征切换到三阶多项式特征展开”。  
The core change in `poly4_cubic` is not just a new dataset, but switching from raw linear features to degree-3 polynomial feature expansion.

### 5.1 特征展开 / Feature Expansion

设原始特征为 $x\in\mathbb{R}^m$，模型构建 1~3 阶单项式组合：  
Given raw features $x\in\mathbb{R}^m$, the model builds monomial combinations of degrees 1~3:

$$
\phi(x)=\left[x_i,\ x_ix_j,\ x_ix_jx_k\right]
$$

这里使用 `combinations_with_replacement`，保证组合有序且无重复排列。  
This uses `combinations_with_replacement` to keep combinations ordered without permutation duplicates.

### 5.2 拟合与预测 / Fit and Predict

在多项式特征上做线性最小二乘：  
Linear least squares is applied on polynomial features:

$$
\Phi_{\text{design}}=[\Phi,\mathbf{1}],\quad
W=\arg\min_W\|\Phi_{\text{design}}W-Y\|_2^2,\quad
\hat{Y}=\Phi_{\text{design}}W
$$

### 5.3 评估与异常 / Evaluation and Anomaly

- 验证集计算 `MAE / RMSE / MaxAE` 并与阈值比较。  
- Validation computes `MAE / RMSE / MaxAE` against thresholds.
- 推理阶段对残差做 `sigma_k=3.0` 异常标记。  
- Inference applies `sigma_k=3.0` residual anomaly flagging.
- 当前记录下模型摘要是：`degree=3`, `raw_features=4`, `poly_terms=34`。  
- Current model summary: `degree=3`, `raw_features=4`, `poly_terms=34`.

## 6. 本次运行结果（2026-02-18） / Recorded Result

| Item | Value |
|---|---:|
| total samples | 1000 |
| train samples | 800 |
| val samples | 200 |
| degree | 3 |
| raw features | 4 |
| poly terms | 34 |
| val_mae | 0.000001 |
| val_rmse | 0.000001 |
| val_maxae | 0.000003 |
| status | PASS |
| infer input_rows | 200 |
| infer anomaly_rows | 1 |

## 7. 输出产物 / Outputs

- `ForgeFlowApps/poly4_cubic/output/eval_report.csv`
- `ForgeFlowApps/poly4_cubic/output/predictions.csv`

`eval_report.csv` 用于质量门控；`predictions.csv` 用于推理结果与异常标记检查。  
`eval_report.csv` is for quality gating; `predictions.csv` is for inference and anomaly checks.

## 8. 验收逻辑（门禁顺序） / Acceptance Logic (Gate Order)

按顺序执行门禁，而不是只看最终 `PASS`：  
Evaluate gates in order instead of checking only final `PASS`:

1. 配置门 / Config gate  
   - `run.json` 可加载，`adapter_ref/model_ref/paths` 完整。  
   - `run.json` is loadable with complete `adapter_ref/model_ref/paths`.
2. 数据门 / Data gate  
   - 训练/推理输入存在且行数符合预期。  
   - Train/infer inputs exist with expected row counts.
3. 回归质量门 / Regression quality gate  
   - `val_mae/val_rmse/val_maxae` 均低于阈值。  
   - All validation metrics are below thresholds.
4. 产物门 / Artifact gate  
   - `eval_report.csv` 和 `predictions.csv` 均生成且可读取。  
   - `eval_report.csv` and `predictions.csv` are generated and readable.
5. 异常门（软检查）/ Anomaly gate (soft check)  
   - 异常标记链路可工作（当前 `infer_anomaly_rows=1`）。  
   - Anomaly flagging path works (current `infer_anomaly_rows=1`).

### 8.1 门禁表 / Gate Table

| Gate | Rule | Source | Fail Action |
|---|---|---|---|
| Config | config loadable + required keys | `config/run.json` | 回退上一个可用配置并重跑 |
| Data | train/infer input valid | `data/processed`, `data/infer` | 检查数据生成流程与路径 |
| Regression | metrics <= thresholds | `output/eval_report.csv` | 检查特征展开、模型和阈值 |
| Artifacts | required files exist | `output/*` | 补跑缺失步骤并记录原因 |
| Anomaly (soft) | anomaly flag path works | `output/predictions.csv` | 检查 infer 标签与 sigma 配置 |

### 8.2 失败归因优先级 / Failure Triage Priority

1. 先排配置与路径问题。  
1. Check config and path issues first.
2. 再排数据问题（输入缺失、分布异常、行数不匹配）。  
2. Then check data issues (missing inputs, distribution problems, row mismatch).
3. 最后定位模型与特征展开问题。  
3. Finally diagnose model and feature-expansion issues.

## 9. 已知边界 / Known Limits

- 当前验证基于可控数据分布，未覆盖明显 distribution shift。  
- Current validation is on controlled data and does not cover strong distribution shift.
- 当前仅验证单 App 路径，未做多 App 回归矩阵。  
- Only one app path is validated; no multi-app regression matrix yet.

## 10. 关联页面 / Linked Pages

- 框架本体 / Framework core: [Artifact-2.0](/artifacts/02-forgeflow/2-0-framework-core/)
- 上一项 / Previous: [Artifact-2.1](/artifacts/02-forgeflow/2-1-framework-linear/)
- 下一项 / Next: [Artifact-2.3](/artifacts/02-forgeflow/2-3-ink-diffusion-dual-track/)
- 父索引 / Parent: [Artifact-2](/artifacts/02-forgeflow/)
