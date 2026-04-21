---
title: "[Artifact-2.0] ForgeFlow Framework Core"
date: '2026-02-19T02:30:00+09:00'
draft: false
summary: "Defines the ForgeFlow v1 framework core: responsibilities, runtime contract, execution modes, and app-isolation boundaries."
description: "Framework core page for Artifact-2: architecture, config contract, execution modes, and the boundary between core flow and app logic."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Framework"
  - "Architecture"
categories:
  - "Artifacts"
weight: 20
---

## Purpose

This page answers one question: what ForgeFlow core owns, and what it does not.

The main position is simple:

- `forgeflow/core` owns generic pipeline orchestration
- `ForgeFlowApps/*` owns domain-specific logic

## Framework Structure

- Entry: `main.py`
- Core runtime: `forgeflow/core/`
- Contracts: `forgeflow/interfaces/`
- Registry and compatibility wrappers: `forgeflow/plugins/`
- App-isolated tasks: `ForgeFlowApps/`
- Legacy compatibility demos: `experiments/`

In one line: `core` owns flow, `apps` own domain logic.

## Runtime Contract

Two config styles are currently supported:

1. registry-key style for compatibility
2. class-path style with `adapter_ref` and `model_ref`

The current mainline prefers `adapter_ref/model_ref`, because it keeps app isolation clearer.

## Execution Modes

- `mode=supervised`: split -> fit/predict -> eval -> infer -> report
- `mode=simulation`: initial state -> time stepping -> trajectory/eval report

The same runtime skeleton is reused across both modes.  
Only the task branch changes.

## Default Entry

The current default config path is:

`main.py` -> `ForgeFlowApps/linear_xy/config/run.json`

Minimal run:

```bash
python main.py
```

Explicit run:

```bash
python main.py --config ForgeFlowApps/linear_xy/config/run.json --log-level INFO
```

## Acceptance Baseline

Framework-level acceptance is not about one task score. It checks three things:

1. config-driven execution works
2. adapters and models are pluggable
3. reports are reproducible and auditable

## Linked Pages

- Next: [Artifact-2.1 Linear Baseline](/en/artifacts/02-forgeflow/2-1-framework-linear/)
- Parent: [Artifact-2](/en/artifacts/02-forgeflow/)
