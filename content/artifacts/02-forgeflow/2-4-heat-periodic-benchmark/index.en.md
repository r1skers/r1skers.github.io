---
title: "[Artifact-2.4] Heat Periodic Benchmark Validation"
date: '2026-02-19T23:58:00+09:00'
draft: false
summary: "The app-level benchmark record for heat_periodic: long-horizon simulation, exact-solution convergence checks, and surrogate rollout validation."
description: "Artifact-2.4 page for heat_periodic: periodic heat-equation benchmark with exact convergence studies, surrogate fitting, and rollout evaluation."
tags:
  - "Computational Science"
  - "PDE"
  - "Convergence"
  - "Numerical Analysis"
categories:
  - "Artifacts"
series:
  - "ForgeFlow"
weight: 24
---

## Goal

This page records the engineering validation of `heat_periodic`: a 2D heat equation under periodic boundary conditions, with exact-solution convergence checks and surrogate rollout records.

## Scope

It includes three tracks:

1. simulation mainline (`mode=simulation`, long_t)
2. exact-convergence study
3. surrogate training plus rollout

## Track A: Periodic Heat Simulation

Main config:

`ForgeFlowApps/heat_periodic/config/run_long_t.json`

Recorded result:

| Item | Value |
|---|---:|
| mode | simulation |
| steps_requested | 1500 |
| states_recorded | 1501 |
| stable_cfl | True |
| mass_delta_abs | 0.000000 |
| status | PASS |

## Track B: Exact Convergence

The temporal study shows first-order behavior, consistent with forward Euler.  
The spatial study trends toward second order, consistent with the five-point stencil.

This is the part that makes `heat_periodic` a benchmark rather than just another simulation case.

## Track C: Surrogate and Rollout

Recorded supervised result:

| Item | Value |
|---|---:|
| mode | supervised |
| train_samples | 51200 |
| val_samples | 12800 |
| val_mae | 0.000000 |
| val_rmse | 0.000000 |
| val_maxae | 0.000000 |
| status | PASS |

Recorded rollout summary:

| Item | Value |
|---|---:|
| rollout_steps | 50 |
| mean_mae | 0.000000000000 |
| mean_rmse | 0.000000000000 |
| max_maxae | 0.000000000001 |
| last_mass_delta_abs | 0.000000000002 |
| status | PASS |

## Reports

- [Simulation report](simulation_report.png)
- [Surrogate report](surrogate_report.png)
- [Rollout report](rollout_report.png)

## Acceptance Logic

The current gate order is:

1. config validity
2. simulation stability
3. exact-convergence checks
4. surrogate quality
5. rollout stability
6. artifact completeness

## Linked Pages

- Previous: [Artifact-2.3](/en/artifacts/02-forgeflow/2-3-ink-diffusion-dual-track/)
- Next: [Artifact-2.5](/en/artifacts/02-forgeflow/2-5-heat-kappa-inverse/)
- Parent: [Artifact-2](/en/artifacts/02-forgeflow/)
