---
title: "[Artifact-2.0] ForgeFlow 框架本体 / ForgeFlow Framework Core"
date: '2026-02-19T02:30:00+09:00'
draft: false
summary: "定义 ForgeFlow v1 的框架本体：核心职责、运行契约、模式分支与 App 隔离边界。 / Define ForgeFlow v1 core: responsibilities, runtime contracts, mode branches, and app-isolation boundaries."
description: "Framework core document for Artifact-2: architecture, config contract, and run modes."
tags:
  - "Computational Science"
  - "Software Architecture"
  - "Numerical Methods"
categories:
  - "Artifacts"
series:
  - "ForgeFlow"
weight: 20
aliases:
  - /artifacts/forgeflow-core/
---

## 1. 页面定位 / Purpose

这页只回答一个问题：ForgeFlow 本体到底负责什么，不负责什么。  
This page answers one question: what ForgeFlow core owns, and what it does not.

核心定位：`forgeflow/core` 负责通用流程编排；任务细节由 `ForgeFlowApps/*` 承担。  
Core position: `forgeflow/core` orchestrates generic pipeline flow; task specifics live in `ForgeFlowApps/*`.

## 2. 框架结构 / Framework Structure

- 入口 / Entry: `main.py`
- 核心流程 / Core runtime: `forgeflow/core/`
- 接口契约 / Contracts: `forgeflow/interfaces/`
- 插件注册与兼容包装 / Registry and compatibility wrappers: `forgeflow/plugins/`
- App 隔离任务 / App-isolated tasks: `ForgeFlowApps/`
- 兼容层样例 / Legacy compatibility demos: `experiments/`

一句话：`core` 管流程，`apps` 管问题域。  
In one line: `core` owns flow, `apps` own domain logic.

## 3. 运行契约 / Runtime Contract

支持两种配置风格：  
Two config styles are supported:

1. registry-key 风格（兼容）  
1. registry-key style (compatibility)
   - `adapter`
   - `model`
2. class-path 风格（推荐）  
2. class-path style (recommended)
   - `adapter_ref`
   - `model_ref`

当前主线推荐 `adapter_ref/model_ref`，用于 App 隔离和清晰依赖边界。  
Current primary path is `adapter_ref/model_ref` for app isolation and clear dependency boundaries.

## 4. 执行模式 / Execution Modes

- `mode=supervised`: split -> fit/predict -> eval -> infer -> report
- `mode=simulation`: initial state -> time stepping -> trajectory/eval report

这两个模式复用同一套运行框架，只在任务分支处切换。  
Both modes reuse one runtime framework and diverge only at task branches.

## 5. 默认入口与主线配置 / Default Entry and Mainline Config

当前默认入口配置：`main.py` -> `ForgeFlowApps/linear_xy/config/run.json`。  
Current default config: `main.py` -> `ForgeFlowApps/linear_xy/config/run.json`.

最小执行命令：  
Minimal run command:

```bash
python main.py
```

指定配置执行：  
Run with explicit config:

```bash
python main.py --config ForgeFlowApps/linear_xy/config/run.json --log-level INFO
```

## 6. 验收口径 / Acceptance Baseline

框架层验收不看某个单一任务精度，而看三点：  
Framework-level acceptance is not one-task accuracy; it is three checks:

1. 配置可驱动 / config-driven execution works.
2. 任务可插拔 / adapters/models are pluggable.
3. 输出可审计 / reports are reproducible and auditable.

## 7. 关联页面 / Linked Pages

- 下一项 / Next: [Artifact-2.1 Linear Baseline](/artifacts/02-forgeflow/2-1-framework-linear/)
- App 验证 / App validation: [Artifact-2.2 Poly4](/artifacts/02-forgeflow/2-2-poly4-app-validation/)
- 父索引 / Parent: [Artifact-2](/artifacts/02-forgeflow/)
