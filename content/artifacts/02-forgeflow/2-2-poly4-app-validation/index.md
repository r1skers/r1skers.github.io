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

## 5. 本次运行结果（2026-02-18） / Recorded Result

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

## 6. 输出产物 / Outputs

- `ForgeFlowApps/poly4_cubic/output/eval_report.csv`
- `ForgeFlowApps/poly4_cubic/output/predictions.csv`

`eval_report.csv` 用于质量门控；`predictions.csv` 用于推理结果与异常标记检查。
`eval_report.csv` is for quality gating; `predictions.csv` is for inference and anomaly checks.

## 7. 验收标准 / Acceptance Criteria

- 日志中出现 `[eval] status=PASS` / `[eval] status=PASS` appears in logs.
- `eval_report.csv` 指标低于阈值 / Metrics are below configured thresholds.
- `predictions.csv` 行数与 infer 输入匹配 / Output rows match infer input rows.

## 8. 已知边界 / Known Limits

- 当前验证基于可控数据分布，未覆盖明显 distribution shift。
- Current validation is on controlled data and does not cover strong distribution shift.
- 当前仅验证单 App 路径，未做多 App 回归矩阵。
- Only one app path is validated; no multi-app regression matrix yet.

## 9. 关联页面 / Linked Pages

- 上一项 / Previous: [Artifact-2.1](/artifacts/02-forgeflow/2-1-framework-linear/)
- 父索引 / Parent: [Artifact-2](/artifacts/02-forgeflow/)
