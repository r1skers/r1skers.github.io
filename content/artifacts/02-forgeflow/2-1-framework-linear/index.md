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

## 5. 本次记录结果（2026-02-18） / Recorded Result

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

## 6. 验收标准 / Acceptance Criteria

- 运行不报错 / No runtime error.
- `eval_report.csv` 存在且 `status=PASS` / `eval_report.csv` exists and status is PASS.
- `predictions.csv` 正常生成 / `predictions.csv` is generated correctly.

## 7. 关联页面 / Linked Pages

- 上一项 / Previous: [Artifact-2.0：ForgeFlow 框架本体](/artifacts/02-forgeflow/2-0-framework-core/)
- 下一项 / Next: [Artifact-2.2：Poly4 App 跑通流程与逻辑顺序](/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- 父索引 / Parent: [Artifact-2](/artifacts/02-forgeflow/)
