---
title: "[Artifact-2] ForgeFlow Framework Track"
date: '2026-02-17T18:00:10+09:00'
draft: false
summary: "Long-running ForgeFlow engineering records: framework core, linear baseline, and a sequence of app-level validations."
description: "Artifact-2 index page: an ordered track of the ForgeFlow framework core, baseline runs, and app-level validation pages."
tags:
  - "Computational Science"
  - "Inverse Problem"
  - "Reliability"
categories:
  - "Artifacts"
series:
  - "ForgeFlow"
weight: 20
---

## Structure

- `2.0` [ForgeFlow Framework Core](/en/artifacts/02-forgeflow/2-0-framework-core/)
- `2.1` [Linear Baseline Validation](/en/artifacts/02-forgeflow/2-1-framework-linear/)
- `2.2` [Poly4 App Pipeline Validation](/en/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- `2.3` [Ink Diffusion Dual-Track Validation](/en/artifacts/02-forgeflow/2-3-ink-diffusion-dual-track/)
- `2.4` [Heat Periodic Benchmark Validation](/en/artifacts/02-forgeflow/2-4-heat-periodic-benchmark/)
- `2.5` [Heat Kappa Inverse Parameter Inversion](/en/artifacts/02-forgeflow/2-5-heat-kappa-inverse/)

## Notes

- The current mainline has moved to the app-isolated `ForgeFlowApps/*` structure.
- `experiments/*` is kept only for legacy compatibility checks.
- `linear_xy` is the minimal supervised baseline.
- `poly4_cubic` is the first real app-level validation case.
- `ink_diffusion` is the dual-track validation case with simulation and surrogate branches.
- `heat_periodic` is the periodic heat-equation benchmark with exact-solution comparison.
- `heat_kappa_inverse` is the inversion example from observation features to parameters, including ID/OOD and noisy robustness checks.
