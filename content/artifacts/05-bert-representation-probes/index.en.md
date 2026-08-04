---
date: '2026-05-26T20:00:00+09:00'
draft: false
title: "[Artifact-5] BERT Representation Probes: A Multi-View Comparison"
summary: "Same BERT document-segment representations, viewed through multiple probes: clustering, linear separability, Fisher-style geometric compactness. Each lens reveals a different facet of what BERT learned; none is sufficient alone."
description: "Artifact-5 is an umbrella for a multi-view analysis of BERT document-segment representations. Each child artifact applies a distinct probing method independently, together forming a comparative framework."
tags:
  - "BERT"
  - "Representation Geometry"
  - "Machine Learning"
categories:
  - "Artifacts"
series:
  - "Representation Geometry"
weight: 50
math: true
---

This is an umbrella artifact. See child artifacts below.

## Core question

In what form does BERT encode document-level topic information into its representation space?

Different probing methods reveal different facets of this question — **which ruler you use determines what you see**. This series deliberately probes the same BERT representations through multiple lenses, with each viewpoint living in its own child artifact, to avoid being trapped by the blind spots of any single method.

## Lenses

- **5.1 [Clustering view](/en/artifacts/05-1-clustering-view/)** — Use KMeans-style unsupervised clustering as a probe: how does topic-aligned geometric structure shift with layer and preprocessing? Finding: stability is not semantic alignment; anisotropy is one possible confound, not the only explanation.
- **5.1.1 [PCA Whitening synthetic demo](/en/artifacts/05-1-1-pca-whitening-demo/)** — A methodological footnote to 5.1: isolate the geometric mechanism of whitening with a controlled synthetic anisotropic mixture.
- **5.2 [Linear probe view](/en/artifacts/05-2-linear-probe-view/)** — Per-layer logistic regression measuring topic *linear decodability*. The random-init probe is above classification chance while clustering alignment is low (NMI about 0.06). **Linear decodability ≠ cluster self-organization**; NMI and accuracy also do not share a `0.05` chance line.
- **5.3 [Fisher view](/en/artifacts/05-3-fisher-view/)** — LDA classifier (cross-checks 5.2) plus the Fisher trace-ratio η². Its durable finding is that aggregate geometry and classifier readout can disagree; that disagreement alone does not localize signal to low-variance directions.

## 2026-07 scientific closure

> **Closure note (2026-07):** A later direction-level spectrum audit contradicted and narrowed the initial “topic signal mainly lives in the low-variance tail” account. On raw centered pretrained-L12 embeddings, PC1 has per-PC $\eta^2=0.669$; the first 100 high-variance PCs contain **82.4%** of total variance but **98.7%** of observed between-class scatter; the Spearman correlation between PC variance and per-PC $\eta^2$ is **+0.718**. These label attributions use the same `n=2000` sample and are **exploratory/descriptive**, not held-out confirmation.

The initial “low-variance-directions unifying principle” is therefore retired as a finding. The data support a narrower account: pretrained L12's topic-aligned class-mean structure is concentrated in the **leading subspace**; whitening is more consistent with **spectral rebalancing within that leading subspace** than with recovering the main signal from the full spectrum's low-variance tail. This remains a descriptive mechanism account, not a causal result about attention or whitening.

## Revised finding (across probes)

> **Linear decodability, unsupervised cluster alignment, Fisher trace geometry, and direction-level spectrum attribution are different measurement operators. Different verdicts on the same representation are not contradictions, and the measurements are not interchangeable.**

Random-init linear readability is also no longer interpreted as evidence for the same semantic organization already hiding in a low-variance residual. The model still uses the pretrained tokenizer, and mean-pooled random token embeddings can preserve lexical / random-feature cues. Anisotropy may affect distance-based clustering, but this experiment does not identify it as the unique cause. TF-IDF, random-projection, multiple-random-seed, and intervention controls would be needed for a stronger mechanism claim.

The old three-view overlay remains in the child artifacts as a **legacy exploratory overlay**: it compares curve shapes, but a normalized cross-metric overlay cannot establish a shared mechanism.

## What this series argues

> Same representations, three lenses → each lens sees a different facet
> of what BERT learned about topics. None is sufficient alone.

Three different rulers measuring the same object is more credible than one. This is also why the series **deliberately does not collapse all probes into a single artifact**: each lens has its own methodological boundary, sensitivity profile, and failure mode. Keeping them separate preserves their honest scale.
