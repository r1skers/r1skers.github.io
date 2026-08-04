---
title: "主题档案：表征几何"
description: "连接线性代数、降维、聚类评估与真实神经网络表征实验。"
summary: "从 PCA、whitening 和 spectral methods 到 BERT 多视角 probe 的主题档案。"
categories: ["Notes"]
tags: ["Machine Learning", "Representation Geometry", "PCA"]
series: ["Representation Geometry"]
note_kind: "topic-index"
---

这个主题关心的不是“用哪个聚类算法最好”，而是：**一个表示空间里的方向、尺度、邻域与标签可读性分别说明什么？**

## 1. 数学底板

- [线性代数 Part 7：低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/) 给出截断 SVD、PCA 与 whitening 的线性代数解释。
- [信息几何主线](/notes/math/information-theory/note-it-0-roadmap/) 提供 Fisher、KL 与参数空间局部几何的另一套量尺。

## 2. 分析工具箱

[无监督学习路线图](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/) 串起四个阶段：

1. [PCA、Whitening 与邻域可视化](/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
2. [Spectral Embedding 与 Spectral Clustering](/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
3. [KMeans、GMM、层次聚类与 DBSCAN](/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
4. [聚类评估、外部指标与稳定性](/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)

## 3. 项目证据

[Artifact 5：BERT 表征探针](/artifacts/05-bert-representation-probes/) 把同一份表征交给聚类、线性探针与 Fisher 几何三把不同的尺子。配套的 [PCA Whitening micro-artifact](/artifacts/05-1-1-pca-whitening-demo/) 隔离了各向异性导致聚类失败的最小机制。

这里刻意保留多个入口：PCA 的 canonical 数学推导属于线性代数；embedding 分析流程属于无监督学习；真实模型证据属于 Artifacts。
