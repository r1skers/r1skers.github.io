---
date: '2026-05-26T20:00:00+09:00'
draft: false
title: "[Artifact-5] BERT Representation Probes: A Multi-View Comparison"
summary: "Same BERT document-segment representations, viewed through multiple probes: clustering, linear separability, Fisher-style geometric compactness. Each lens reveals a different facet of what BERT learned; none is sufficient alone."
description: "Artifact-5 is an umbrella for a multi-view analysis of BERT document-segment representations. Each child artifact applies a distinct probing method independently, together forming a comparative framework."
tags:
  - "Artifact"
  - "BERT"
  - "Representation Analysis"
categories:
  - "Artifacts"
weight: 50
math: true
---

This is an umbrella artifact. See child artifacts below.

## Core question

In what form does BERT encode document-level topic information into its representation space?

Different probing methods reveal different facets of this question — **which ruler you use determines what you see**. This series deliberately probes the same BERT representations through multiple lenses, with each viewpoint living in its own child artifact, to avoid being trapped by the blind spots of any single method.

## Lenses

- **5.1 [Clustering view](/en/artifacts/05-1-clustering-view/)** — Use KMeans-style unsupervised clustering as a probe: how does topic-aligned geometric structure shift with layer and preprocessing? Finding: stability alone can be misled by anisotropy.
- **5.1.1 [PCA Whitening synthetic demo](/en/artifacts/05-1-1-pca-whitening-demo/)** — A methodological footnote to 5.1: isolate the geometric mechanism of whitening with a controlled synthetic anisotropic mixture.
- **5.2 [Linear probe view](/en/artifacts/05-2-linear-probe/)** — *In progress*. Can topic information be read out per-layer by a linear classifier?
- **5.3 [Fisher view](/en/artifacts/05-3-fisher-discriminant/)** — *In progress*. Are within-class points closer and between-class points farther? Based on the within / between class distance ratio.

## What this series argues

> Same representations, three lenses → each lens sees a different facet
> of what BERT learned about topics. None is sufficient alone.

Three different rulers measuring the same object is more credible than one. This is also why the series **deliberately does not collapse all probes into a single artifact**: each lens has its own methodological boundary, sensitivity profile, and failure mode. Keeping them separate preserves their honest scale.
