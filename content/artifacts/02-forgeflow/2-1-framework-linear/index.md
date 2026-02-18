---
title: "[Artifact-2.1] ForgeFlow 框架与 Linear 跑通 / Framework and Linear Baseline Run"
date: '2026-02-17T18:00:10+09:00'
draft: false
summary: "定义 ForgeFlow 框架边界，并固化 linear_xy baseline 的标准跑通流程。 / Define framework boundaries and standardize the linear_xy baseline runbook."
description: "This page focuses on framework scope and linear baseline verification."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Framework"
  - "Baseline"
categories:
  - "Artifacts"
weight: 21
aliases:
  - /artifacts/forgeflow-framework/
---

## 1. 页面定位 / Purpose

本页只做两件事：
This page does only two things:

1. 说明 ForgeFlow 框架边界和目录职责。
1. Define framework boundaries and directory responsibilities.
2. 固化 `linear_xy` 的 baseline 跑通流程（sanity check）。
2. Freeze the baseline runbook for `linear_xy` (sanity check).

`linear_xy` 的角色是“框架自检”，不是首个真实 App 任务验证。
`linear_xy` is a framework sanity check, not the first real app-level validation.

## 2. 框架边界与目录职责 / Scope and Ownership

- 入口 / Entry: `main.py`
- 核心流程 / Core flow: `forgeflow/core/`（config, split, evaluation, runner）
- 协议层 / Interface contracts: `forgeflow/interfaces/`
- 内置插件 / Built-in plugins: `forgeflow/plugins/`
- baseline 实验 / Baseline experiment: `experiments/linear_xy/`
- App 级任务 / App-level tasks: `ForgeFlowApps/`（例如 `poly4_cubic`）

## 3. Linear Baseline 配置 / Config

配置文件 / Config file: `experiments/linear_xy/config.json`

关键参数 / Key parameters:

- `adapter = linear_xy`
- `model = linear_dynamics`
- `split.train_ratio = 0.8`
- `split.shuffle = false`
- `split.seed = 42`
- `eval_policy = { val_mae_max: 0.01, val_rmse_max: 0.01, val_maxae_max: 0.02 }`

## 4. Linear 跑通流程 / Standard Runbook

1. 执行命令 / Run

```bash
python main.py --config experiments/linear_xy/config.json --log-level INFO
```

2. 检查日志关键行 / Check critical log lines

- `[config] adapter=linear_xy`
- `[config] model=linear_dynamics`
- `[split] train_samples=8`
- `[split] val_samples=2`
- `[eval] status=PASS`

3. 检查输出文件 / Check output files

- `experiments/linear_xy/output/eval_report.csv`
- `experiments/linear_xy/output/predictions.csv`

## 5. 本次记录结果（2026-02-18） / Recorded Result

| Metric | Value |
|---|---:|
| train_samples | 8 |
| val_samples | 2 |
| val_mae | 0.000000 |
| val_rmse | 0.000000 |
| val_maxae | 0.000000 |
| status | PASS |

## 6. 验收标准 / Acceptance Criteria

- 运行不报错 / No runtime error.
- `eval_report.csv` 存在且 `status=PASS` / `eval_report.csv` exists and status is PASS.
- `predictions.csv` 正常生成 / `predictions.csv` is generated correctly.

## 7. 下一项 / Next Item

- [Artifact-2.2：Poly4 App 跑通流程与逻辑顺序](/artifacts/02-forgeflow/2-2-poly4-app-validation/)
