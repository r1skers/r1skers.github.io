---
title: "[Artifact-2.3] Ink Diffusion Dual-Track Validation"
date: '2026-02-19T03:20:00+09:00'
draft: false
summary: "The ink_diffusion dual-track engineering record: PDE simulation mainline plus supervised surrogate branch, with the current acceptance results."
description: "Artifact-2.3 page for ink diffusion: simulation pipeline, surrogate dataset building, report plots, and gate-based validation."
tags:
  - "Computational Science"
  - "PDE"
  - "Numerical Methods"
  - "Reliability"
categories:
  - "Artifacts"
series:
  - "ForgeFlow"
weight: 23
---

## Goal

This page records the engineering acceptance of `ink_diffusion`: execution chain, key artifacts, and gate decisions.

## Scope

It has two tracks:

1. simulation mainline (`mode=simulation`)
2. supervised surrogate branch (`mode=supervised`)

Mapped app directory:

`ForgeFlowApps/ink_diffusion/`

## Track A: PDE Simulation

Main config:

`ForgeFlowApps/ink_diffusion/config/run.json`

Recorded result:

| Item | Value |
|---|---:|
| mode | simulation |
| steps_requested | 200 |
| states_recorded | 201 |
| stable_cfl | True |
| mass_delta_abs | 0.000000 |
| status | PASS |

## Track B: Surrogate Branch

The supervised surrogate is built from the simulation trajectory and then trained as a one-step predictor.

Recorded result:

| Item | Value |
|---|---:|
| mode | supervised |
| train_samples | 80000 |
| val_samples | 20000 |
| val_mae | 0.000000 |
| val_rmse | 0.000000 |
| val_maxae | 0.000000 |
| status | PASS |

## Reports

This artifact also carries simulation and surrogate plots:

- [Simulation report](simulation_report.png)
- [Surrogate report](surrogate_report.png)

## Acceptance Logic

The current gate order is:

1. config validity
2. simulation stability
3. conservation check
4. surrogate quality
5. artifact completeness

## Linked Pages

- Previous: [Artifact-2.2](/en/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- Next: [Artifact-2.4](/en/artifacts/02-forgeflow/2-4-heat-periodic-benchmark/)
- Parent: [Artifact-2](/en/artifacts/02-forgeflow/)
