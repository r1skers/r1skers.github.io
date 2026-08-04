---
title: "[Artifact-2] ForgeFlow 框架迭代 / ForgeFlow Framework Track"
date: '2026-02-17T18:00:10+09:00'
draft: false
summary: "ForgeFlow 的长期工程记录：框架本体、linear baseline，以及一系列 App 级验证。"
description: "Artifact-2 索引页：按顺序收纳 ForgeFlow 框架本体、baseline 与各个 App 验证页面。"
tags:
  - "Computational Science"
  - "Inverse Problem"
  - "Reliability"
categories:
  - "Artifacts"
series:
  - "ForgeFlow"
weight: 20
aliases:
  - /artifacts/forgeflow/
---

## Structure

- `2.0` [ForgeFlow 框架本体](/artifacts/02-forgeflow/2-0-framework-core/)
- `2.1` [Linear Baseline 跑通](/artifacts/02-forgeflow/2-1-framework-linear/)
- `2.2` [Poly4 App 跑通流程与逻辑顺序](/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- `2.3` [Ink Diffusion 双轨验证](/artifacts/02-forgeflow/2-3-ink-diffusion-dual-track/)
- `2.4` [Heat Periodic 基准验证](/artifacts/02-forgeflow/2-4-heat-periodic-benchmark/)
- `2.5` [Heat Kappa Inverse 参数反演验证](/artifacts/02-forgeflow/2-5-heat-kappa-inverse/)

## Note

- 当前主线已经切换到 `ForgeFlowApps/*` 的 App 隔离结构。
- `experiments/*` 仅保留兼容性验证用途。
- `linear_xy` 定位为最小 supervised baseline。
- `poly4_cubic` 定位为首个真实 App 级验证样例。
- `ink_diffusion` 定位为“仿真主线 + surrogate 支线”的双轨验证样例。
- `heat_periodic` 定位为“可与解析解对照”的周期热方程基准样例。
- `heat_kappa_inverse` 定位为“观测特征 -> 参数”的反演样例（含 ID/OOD/噪声鲁棒性）。
