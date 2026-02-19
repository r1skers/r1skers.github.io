---
title: "[Artifact-2] ForgeFlow 框架迭代 / ForgeFlow Framework Track"
date: '2026-02-17T18:00:10+09:00'
draft: false
summary: "ForgeFlow 的长期工程记录：框架本体、linear baseline、再到 App 级验证。 / Long-term ForgeFlow engineering log: framework core, linear baseline, then app-level validations."
description: "Artifact 2 groups all ForgeFlow records in one place with ordered sub-items."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Framework"
categories:
  - "Artifacts"
weight: 20
aliases:
  - /artifacts/forgeflow/
---

## Structure

- `2.0` [ForgeFlow 框架本体 / ForgeFlow Framework Core](/artifacts/02-forgeflow/2-0-framework-core/)
- `2.1` [Linear Baseline 跑通 / Linear Baseline Validation](/artifacts/02-forgeflow/2-1-framework-linear/)
- `2.2` [Poly4 App 跑通流程与逻辑顺序 / Poly4 App Pipeline Validation](/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- `2.3` [Ink Diffusion 双轨验证 / Ink Diffusion Dual-Track Validation](/artifacts/02-forgeflow/2-3-ink-diffusion-dual-track/)

## Note

Mainline path is now app-isolated under `ForgeFlowApps/*`.
`experiments/*` is kept only for legacy compatibility checks.

`linear_xy` is the minimal supervised baseline.
`poly4_cubic` is the first real app-level validation case.

当前主线已经切换到 `ForgeFlowApps/*` 的 App 隔离结构。
`experiments/*` 仅保留兼容性验证用途。

`linear_xy` 定位为最小 supervised baseline。
`poly4_cubic` 定位为首个真实 App 级验证样例。
`ink_diffusion` 定位为仿真主线 + surrogate 支线的双轨验证样例。
