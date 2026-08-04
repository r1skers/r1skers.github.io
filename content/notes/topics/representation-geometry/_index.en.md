---
title: "Topic Dossier: Representation Geometry"
description: "Connections among linear algebra, dimensionality reduction, clustering evaluation, and real neural-representation experiments."
summary: "From PCA, whitening, and spectral methods to multi-view BERT probes."
categories: ["Notes"]
tags: ["Machine Learning", "Representation Geometry", "PCA"]
series: ["Representation Geometry"]
note_kind: "topic-index"
---

This dossier asks a question broader than “which clustering algorithm is best?”: **what do direction, scale, neighborhood structure, and label decodability each reveal about a representation space?**

## 1. Mathematical foundation

- [Linear Algebra Part 7: Low-rank approximation, PCA, and structured approximation](/notes/math/linear-algebra/note-la-7-low-rank-pca/) gives the linear-algebraic account of truncated SVD, PCA, and whitening.
- The [Information Geometry roadmap](/notes/math/information-theory/note-it-0-roadmap/) supplies a second family of measurements through Fisher information, KL, and local parameter-space geometry.

## 2. Analysis toolbox

The [Unsupervised Learning roadmap](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/) connects four stages:

1. [PCA, Whitening, and neighborhood visualization](/en/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
2. [Spectral Embedding and Spectral Clustering](/en/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
3. [KMeans, GMM, hierarchical clustering, and DBSCAN](/en/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
4. [Clustering evaluation, external metrics, and stability](/en/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)

## 3. Project evidence

[Artifact 5: BERT Representation Probes](/en/artifacts/05-bert-representation-probes/) applies clustering, linear probes, and Fisher geometry to the same representations. The companion [PCA Whitening micro-artifact](/en/artifacts/05-1-1-pca-whitening-demo/) isolates a minimal mechanism by which anisotropy can break clustering.

The multiple homes are intentional: PCA's canonical derivation belongs to linear algebra, the embedding-analysis workflow belongs to unsupervised learning, and real-model evidence belongs to Artifacts.
