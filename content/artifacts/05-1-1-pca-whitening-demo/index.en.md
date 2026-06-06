---
date: '2026-05-26T10:30:00+09:00'
draft: false
title: "[Artifact-5.1.1] How PCA Whitening Repairs Anisotropy-Driven Clustering Failure"
summary: "A methodological footnote to Artifact-5.1 clustering view. A minimal synthetic experiment: when an unrelated high-variance direction dominates the vector space, KMeans cleanly clusters by the wrong axis. PCA whitening rescales directions and lets the true low-energy cluster structure become readable again."
description: "Artifact-5.1.1 is a micro-artifact under the Artifact-5.1 clustering view; it also serves as an experimental footnote to the PCA whitening formula in the unsupervised learning notes. It uses a controlled synthetic dataset to expose the relationship between anisotropy, false stability, PCA whitening, and clustering recovery."
tags:
  - "Artifact"
  - "PCA Whitening"
  - "Clustering"
  - "Representation Geometry"
  - "Unsupervised Learning"
  - "Synthetic Demo"
categories:
  - "Artifacts"
weight: 52
math: true
aliases:
  - /en/artifacts/05-1-pca-whitening-demo/
  - /en/artifacts/pca-whitening-demo/
---

Source project: synthetic whitening demo inside `bert-cluster-stability`.  
Code: `D:\Dev\repos\bert-cluster-stability\experiments\clustering\whitening_demo.py`

This is a micro-artifact — not a full research project, but a **geometric counterexample / sanity check**:
synthetic data used to show why, in high-dimensional embedding analysis, PCA whitening is sometimes not decorative preprocessing but a transformation that changes the structure a clusterer actually sees.

---

## 1. Goal

This page tries to answer:

> If a vector space is dominated by an unrelated high-variance direction, will KMeans cleanly cluster by the wrong axis? Can PCA whitening surface the true low-energy cluster structure again?

The question comes from [Artifact-5.1: BERT Clustering View](/en/artifacts/05-1-clustering-view/).

In the BERT clustering pilot, `PCA whitening + spherical KMeans` recovered the 20 Newsgroups topic-aligned structure more clearly than the baseline. But that raises an interpretive question:

> Is whitening just "tweaking the score", or does it actually fix a geometric bias in distance / direction?

This synthetic demo compresses that question into a small, controllable experiment.

---

## 2. Data construction

The synthetic data has three parts:

1. Three true clusters hidden in two low-energy signal directions;
2. One high-variance nuisance direction unrelated to the true labels;
3. A few extra noise dimensions so the data feels more like a high-D embedding than a pure 2D toy.

Intuition:

```text
true semantic structure:     in the signal plane
dominant geometric structure: in the nuisance direction
```

In other words, the true clusters are there, but the raw distance geometry prefers to see the unrelated high-variance direction first.

---

## 3. Two recipes

The same data is clustered under two minimal recipes:

```text
baseline: L2 normalize + Lloyd KMeans
whitened: PCA whitening + L2 normalize + Lloyd KMeans
```

BERT is deliberately not used here, nor is spherical KMeans. The point is not to replicate the full Artifact-5.1 pipeline, but to isolate the geometric effect of whitening itself.

---

## 4. Results

![synthetic whitening demo](whitening_demo.png)

Left: true labels in the low-energy signal plane.  
Middle: `L2 + Lloyd` predicted labels.  
Right: `PCA whitening + L2 + Lloyd` predicted labels.

Numerical results:

| space | ARI | NMI | anisotropy | participation ratio |
|---|---:|---:|---:|---:|
| `L2` | ~0.001 | ~0.043 | ~0.893 | ~2.6 |
| `whiten + L2` | ~0.983 | ~0.969 | ~-0.002 | ~9.9 |

The baseline recovers essentially none of the true clusters; whitening recovers almost all of them.

---

## 5. Why this happens

PCA whitening does two things:

1. **Rotate the axes**: place the data in the principal-component coordinate system;
2. **Rescale by direction**: divide each direction by its standard deviation.

When one unrelated direction has very large variance, ordinary Euclidean distance and the KMeans objective end up dominated by it. After whitening, that direction no longer automatically owns more weight just because its scale is bigger.

So the true cluster structure living in lower-variance directions has a chance to re-enter the distance computation.

In one line:

> Whitening is a geometric preconditioner: it does not create labels, but it can stop nuisance anisotropy from dominating the clustering objective.

---

## 6. Relation to the BERT artifact

This toy demo gives a cleaner geometric reading of the Artifact-5.1 observations:

- Random-init BERT under baseline can produce high stability with NMI near the floor;
- That kind of stability can come from a trivial partition driven by anisotropy;
- Once whitening removes the dominant direction, if there is no real structure, stability collapses;
- If there is real structure, topic alignment becomes more visible.

So the more careful Artifact-5.1 statement is not:

> Whitening makes all clustering better.

but rather:

> Whitening can stop unrelated dominant directions from controlling the clustering objective, letting lower-energy semantic structure surface — but any structure that surfaces still needs cross-validation by NMI / purity / stability.

---

## 7. Relation to the PCA whitening note

This page is also an experimental footnote to the [PCA, Whitening, and Neighborhood Visualization note](/notes/笔记-机器学习-无监督学习1-pcawhitening与邻域可视化/) (Chinese).

The note explains the formula:

$$
z_i = \Lambda_k^{-1/2} V_k^\top (x_i - \bar{x})
$$

This artifact shows what that same formula does in a clustering task:

```text
high-variance direction dominates distance
↓
whitening rescales directions
↓
low-energy cluster structure becomes readable
```

The formula says **what** whitening does; this demo says **why** it can matter.

---

## 8. Limits

The boundaries of this demo matter as much as the result:

- It is synthetic — not a proof of any mechanism inside BERT;
- It only shows one possible failure mode: nuisance anisotropy dominates clustering;
- On real embeddings, whitening can also amplify noise in small-eigenvalue directions;
- So the whitening dimension needs to be swept, not maximized.

This is also one reason Artifact-5.1 sees the `d≈100` sweet spot:
too few dimensions can drop signal; too many can also whiten noise directions back in.

---

## 9. Reproduce

From the `bert-cluster-stability` repo root:

```powershell
.\.venv\Scripts\python.exe experiments\clustering\whitening_demo.py
```

Outputs:

```text
outputs/tables/whitening_demo.csv
outputs/figures/transforms/whitening_demo.png
```

Current numbers:

```text
        L2: ARI=0.001, NMI=0.043, anisotropy=0.893, PR=2.6
 whiten_l2: ARI=0.983, NMI=0.969, anisotropy=-0.002, PR=9.9
```
