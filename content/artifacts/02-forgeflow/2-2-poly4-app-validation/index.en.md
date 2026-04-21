---
title: "[Artifact-2.2] Poly4 App Pipeline Validation"
date: '2026-02-18T00:30:23+09:00'
draft: false
summary: "The first real app-level validation case for poly4_cubic: inputs, pipeline order, outputs, and acceptance criteria."
description: "Artifact-2.2 page for poly4_cubic: the first real app-level ForgeFlow validation with polynomial feature expansion and supervised evaluation."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Poly4"
  - "Validation"
categories:
  - "Artifacts"
weight: 22
---

## Goal

Run the app-isolated `poly4_cubic` task end-to-end without modifying `forgeflow/core`, and produce reproducible outputs.

## Inputs and Config

Config:

`ForgeFlowApps/poly4_cubic/config/run.json`

Key fields:

- `task = poly4_cubic`
- `adapter_ref = ForgeFlowApps.poly4_cubic.adapters.poly4_cubic_adapter:Poly4CubicAdapter`
- `model_ref = ForgeFlowApps.poly4_cubic.models.polynomial_linear:PolyLinearDeg3Regressor`
- `split = { train_ratio: 0.8, shuffle: true, seed: 42 }`

## Run Command

```bash
python main.py --config ForgeFlowApps/poly4_cubic/config/run.json --log-level INFO
```

## What Changes Here

The main difference in `poly4_cubic` is not just the dataset.  
It is the shift from raw linear features to polynomial feature expansion up to degree 3.

Conceptually:

$$
\phi(x)=\left[x_i,\ x_ix_j,\ x_ix_jx_k\right]
$$

The model then applies linear least squares on the expanded feature space.

## Recorded Result

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

## Acceptance Logic

The validation order is:

1. config and path validity
2. input data validity
3. regression quality
4. output artifact completeness
5. anomaly-flagging path

## Linked Pages

- Previous: [Artifact-2.1](/en/artifacts/02-forgeflow/2-1-framework-linear/)
- Next: [Artifact-2.3](/en/artifacts/02-forgeflow/2-3-ink-diffusion-dual-track/)
- Parent: [Artifact-2](/en/artifacts/02-forgeflow/)
