---
title: "[Artifact-2.1] Linear Baseline 跑通 / Linear Baseline Validation"
date: '2026-02-17T18:00:10+09:00'
draft: false
summary: "聚焦 linear_xy 的 App 隔离 baseline：从配置、执行到验收口径的完整记录。 / Focus on app-isolated linear_xy baseline: config, execution, and acceptance."
description: "Linear baseline page for Artifact-2, aligned to ForgeFlowApps mainline path."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Baseline"
  - "Linear"
categories:
  - "Artifacts"
weight: 21
aliases:
  - /artifacts/forgeflow-framework/
  - /artifacts/forgeflow-linear-baseline/
---

## 1. 页面定位 / Purpose

本页只做 `linear_xy` 一件事，不再承担框架总览。  
This page is only about `linear_xy`, not framework overview.

定位：`linear_xy` 是 ForgeFlow 的最小可复现实验，用于验证 supervised 主流程是否稳定可用。  
Positioning: `linear_xy` is the minimal reproducible check for supervised pipeline stability.

它不是复杂任务 benchmark，而是回归测试基准样例。  
It is not a complex-task benchmark; it is a regression baseline sample.

## 2. 当前主路径 / Mainline Path

- 配置文件 / Config file: `ForgeFlowApps/linear_xy/config/run.json`
- 训练数据 / Train CSV: `ForgeFlowApps/linear_xy/data/processed/train.csv`
- 推理数据 / Infer CSV: `ForgeFlowApps/linear_xy/data/infer/infer.csv`
- 输出目录 / Output dir: `ForgeFlowApps/linear_xy/output/`

说明：`experiments/linear_xy/` 仍可运行，但属于兼容层路径，不是主叙事。  
Note: `experiments/linear_xy/` still works for compatibility, but it is not the mainline path.

## 3. 关键配置 / Key Config

配置文件 / Config file: `ForgeFlowApps/linear_xy/config/run.json`

- `mode = supervised`
- `task = linear_xy`
- `adapter_ref = ForgeFlowApps.linear_xy.adapters.linear_xy_adapter:LinearXYAdapter`
- `model_ref = ForgeFlowApps.linear_xy.models.linear_regression:LinearDynamicsRegressor`
- `split.train_ratio = 0.8`
- `split.shuffle = false`
- `split.seed = 42`
- `eval_policy = { val_mae_max: 0.01, val_rmse_max: 0.01, val_maxae_max: 0.02 }`

## 4. Linear 跑通流程 / Standard Runbook

1. 执行命令 / Run

```bash
python main.py --config ForgeFlowApps/linear_xy/config/run.json --log-level INFO
```

2. 检查日志关键行 / Check critical log lines

- `[config] adapter=linear_xy`
- `[config] model=linear_dynamics`
- `[split] train_samples=8`
- `[split] val_samples=2`
- `[eval] status=PASS`

3. 检查输出文件 / Check output files

- `ForgeFlowApps/linear_xy/output/eval_report.csv`
- `ForgeFlowApps/linear_xy/output/predictions.csv`

## 5. 中间回归逻辑 / Regression Logic In Between

这一步是 `linear_xy` 的核心：从样本映射到最小二乘拟合，再到指标门禁。  
This is the core of `linear_xy`: sample mapping -> least-squares fitting -> metric gates.

### 5.1 数据到特征 / Data to Features

- adapter 将记录映射为监督样本（`x -> y`）。  
- Adapter maps records into supervised samples (`x -> y`).
- 使用 `split.train_ratio=0.8`、`shuffle=false`、`seed=42` 做可复现切分。  
- Use reproducible split with `train_ratio=0.8`, `shuffle=false`, `seed=42`.

### 5.2 拟合到预测 / Fit to Predict

`LinearDynamicsRegressor` 采用最小二乘线性回归，设计矩阵写法是：
`LinearDynamicsRegressor` uses least-squares linear regression with design matrix:

$$
X_{\text{design}}=[X,\mathbf{1}],\quad
W=\arg\min_W\|X_{\text{design}}W-Y\|_2^2
$$

预测时：
At prediction time:

$$
\hat{Y}=X_{\text{design}}W
$$

### 5.3 评估与异常 / Evaluation and Anomaly

- 验证集计算 `MAE / RMSE / MaxAE`。  
- Validation uses `MAE / RMSE / MaxAE`.
- 与 `eval_policy` 阈值比较，得到 `PASS/FAIL`。  
- Compare against `eval_policy` thresholds for `PASS/FAIL`.
- 对推理集中带标签样本计算残差，并按 `sigma_k=3.0` 做异常标记。  
- For labeled infer rows, residuals are flagged with `sigma_k=3.0`.

## 6. 本次记录结果（2026-02-18） / Recorded Result

| Metric | Value |
|---|---:|
| train_samples | 8 |
| val_samples | 2 |
| val_mae | 0.000000 |
| val_rmse | 0.000000 |
| val_maxae | 0.000000 |
| infer_rows | 5 |
| infer_anomaly_rows | 2 |
| status | PASS |

## 7. 验收逻辑（门禁顺序） / Acceptance Logic (Gate Order)

按以下顺序做门禁，不只看一个 `status` 字段：  
Gates are evaluated in order, not by a single `status` field:

1. 配置门 / Config gate  
   - `run.json` 可加载，`adapter_ref/model_ref/paths` 完整。  
   - `run.json` is loadable with complete `adapter_ref/model_ref/paths`.
2. 数据切分门 / Split gate  
   - 样本切分与配置一致（当前记录 `train=8`, `val=2`）。  
   - Split counts match config (`train=8`, `val=2` in current record).
3. 回归质量门 / Regression quality gate  
   - `val_mae/val_rmse/val_maxae` 全部低于阈值。  
   - All validation metrics are below thresholds.
4. 产物门 / Artifact gate  
   - `eval_report.csv` 与 `predictions.csv` 存在且可读取。  
   - `eval_report.csv` and `predictions.csv` both exist and are readable.
5. 异常门（软检查）/ Anomaly gate (soft check)  
   - 异常标记流程可工作（当前记录 `infer_anomaly_rows=2`）。  
   - Anomaly flagging path works (`infer_anomaly_rows=2` in current run).

### 7.1 门禁表 / Gate Table

| Gate | Rule | Source | Fail Action |
|---|---|---|---|
| Config | config loadable + required keys | `config/run.json` | 回退上一个可用配置并重跑 |
| Split | split counts match policy | logs / `eval_report.csv` | 检查 `split.*` 与输入数据 |
| Regression | metrics <= thresholds | `output/eval_report.csv` | 检查数据、模型、阈值设置 |
| Artifacts | required files exist | `output/*` | 补跑并记录缺失步骤 |
| Anomaly (soft) | anomaly path produces flags | `output/predictions.csv` | 检查 infer 标签与 sigma 配置 |

## 8. 关联页面 / Linked Pages

- 上一项 / Previous: [Artifact-2.0：ForgeFlow 框架本体](/artifacts/02-forgeflow/2-0-framework-core/)
- 下一项 / Next: [Artifact-2.2：Poly4 App 跑通流程与逻辑顺序](/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- 父索引 / Parent: [Artifact-2](/artifacts/02-forgeflow/)
