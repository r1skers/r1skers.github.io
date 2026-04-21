---
title: "[Artifact-2.1] Linear Baseline Validation"
date: '2026-02-17T18:00:10+09:00'
draft: false
summary: "The minimal app-isolated ForgeFlow baseline around linear_xy: config, run path, regression logic, and acceptance criteria."
description: "Artifact-2.1 page for the linear_xy baseline: config, supervised runbook, metric gates, and recorded validation results."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Baseline"
  - "Linear"
categories:
  - "Artifacts"
weight: 21
---

## Purpose

This page is only about `linear_xy`.  
It does not act as a framework overview anymore.

`linear_xy` is the minimal reproducible check for whether the supervised mainline is stable and usable.

## Mainline Path

- Config: `ForgeFlowApps/linear_xy/config/run.json`
- Train CSV: `ForgeFlowApps/linear_xy/data/processed/train.csv`
- Infer CSV: `ForgeFlowApps/linear_xy/data/infer/infer.csv`
- Output dir: `ForgeFlowApps/linear_xy/output/`

The legacy `experiments/linear_xy/` path still works, but it is not the mainline narrative anymore.

## Core Config

Key settings:

- `mode = supervised`
- `task = linear_xy`
- `adapter_ref = ForgeFlowApps.linear_xy.adapters.linear_xy_adapter:LinearXYAdapter`
- `model_ref = ForgeFlowApps.linear_xy.models.linear_regression:LinearDynamicsRegressor`
- `split.train_ratio = 0.8`
- `split.shuffle = false`
- `split.seed = 42`

## Standard Run

```bash
python main.py --config ForgeFlowApps/linear_xy/config/run.json --log-level INFO
```

Expected artifacts:

- `ForgeFlowApps/linear_xy/output/eval_report.csv`
- `ForgeFlowApps/linear_xy/output/predictions.csv`

## Recorded Result

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

## Acceptance Logic

The validation order is:

1. config loads correctly
2. split counts match policy
3. regression metrics stay below thresholds
4. output artifacts are generated
5. anomaly-flagging path works

## Linked Pages

- Previous: [Artifact-2.0](/en/artifacts/02-forgeflow/2-0-framework-core/)
- Next: [Artifact-2.2](/en/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- Parent: [Artifact-2](/en/artifacts/02-forgeflow/)
