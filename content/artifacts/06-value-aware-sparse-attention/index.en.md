---
date: '2026-07-02T13:00:00+09:00'
draft: false
title: "[Artifact-6] Value-Aware Sparse Attention: From Entropy Pruning to Error-Aware Pruning"
summary: "An umbrella artifact for a research-style implementation project on sparse-attention pruning error. Starting from the exact identity ‖o−õ‖=δ‖μ_R−μ_S‖, the series maps when dropped mass is sufficient, when value geometry matters, how cheap value-aware proxies behave, and where local error stops being a behavioral oracle."
description: "Artifact-6 studies sparse attention approximation through an exact output-error decomposition, synthetic regimes, cheap value-aware proxies, real BERT/GPT-2 attention maps, and metric-boundary tests through W_O and next-token KL."
tags:
  - "Attention"
  - "Sparse Attention"
  - "Error Analysis"
  - "Reliability"
categories:
  - "Artifacts"
series:
  - "Value-Aware Sparse Attention"
weight: 60
math: true
---

This is an umbrella artifact. The project repository is
[value-aware-sparse-attention](https://github.com/r1skers/value-aware-sparse-attention).

## Core Question

If the real goal of sparse attention pruning is to control **output error**,
what signal should decide what to keep?

For a single attention row, let `S` be the retained set, `R` the dropped set,
and

$$
\delta=\sum_{i\in R}p_i.
$$

After top-k pruning and renormalization, the output error satisfies the exact
identity

$$
\|o-\tilde o\|=\delta\,\|\mu_R-\mu_S\|.
$$

So pruning error is the product of two factors:

- dropped probability mass $\delta$, available from Q,K/P only;
- value-centroid displacement $\|\mu_R-\mu_S\|$, which depends on V.

Entropy only indirectly affects the first term. It says nothing about value
geometry.

That gives the whole series its shape:

```text
How much probability mass is dropped?
How far apart are the retained and dropped value centroids?
Can that value-side term be estimated cheaply?
Where does local sparse-attention error stop predicting model behavior?
```

Positioning note: this is a **research-style implementation artifact**, not a
novel theory claim or a deployable sparse-attention system. Value-aware
attention, top-k error decompositions, entropy pruning, and adaptive-budget
ideas all have related literature. The value here is independent derivation,
implementation, ablation, measurement, and honest boundary-setting.

## Child Artifacts

- **6.1 [Formulas and Phenomenon Observation](/en/artifacts/06-1-formulas-and-phenomenon-observation/)**  
  Derives the decomposition, verifies it to floating-point precision, maps the
  entropy / q_scale regimes, and compares fixed-k, dropped mass, and a
  restricted value-aware oracle.

- **6.2 [Cheap Value Proxies](/en/artifacts/06-2-cheap-value-proxies/)**  
  Designs UTC (Uniform-Tail Centroid) as a cheap value-side proxy, separates
  predictor correlation from allocation quality, and shows that budget
  delegation beats naive entropy routing on mixed-regime synthetic data.

- **6.3 [Real Attention: From BERT to GPT-2](/en/artifacts/06-3-real-attention-cross-model/)**  
  Moves the scorer stack to real BERT and GPT-2 attention maps, fixes objective
  and protocol issues, and validates UTC-rel-hat under exact-budget evaluation.

- **6.4 [Metric Boundary: Local Error Is Not a Behavioral Oracle](/en/artifacts/06-4-metric-boundary/)**  
  Pushes the metric through $W_O$, single-head GPT-2 KL, and whole-layer GPT-2
  KL. The local value-aware story survives $W_O$ with attenuation, but local
  restricted oracles are not behavioral oracles under next-token KL.

## Main Findings

The project establishes a signal hierarchy:

| Method | Information used | Behavior |
|---|---|---|
| fixed top-k | none | baseline |
| entropy-adaptive | Q,K distribution shape | weak as an error scorer |
| dropped-mass adaptive | Q,K/P, directly controls $\delta$ | strong in sharp regimes, weak or harmful in diffuse regimes |
| restricted value-aware oracle | Q,K,V, true local error | top-k-by-probability reference |

The central empirical statement is:

> Value information is not uniformly useful. Its marginal value concentrates in
> high-entropy / diffuse attention regimes.

When attention is sharp, $\delta$ almost determines the error. When attention is
diffuse, dropped mass loses resolution and value geometry takes over.

The final boundary statement is equally important:

> Cheap value-aware local error control transfers across BERT/GPT-2 and through
> $W_O$ with attenuation, but next-token KL requires a different behavioral
> reference axis.

Throughout the series, "oracle" means **restricted oracle**: it chooses the best
row-wise `k` only within the top-k-by-probability family. It is not a global
subset-selection oracle.
