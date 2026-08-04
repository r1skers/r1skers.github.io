---
date: '2026-05-26T20:00:00+09:00'
draft: false
title: "[Artifact-5] BERT 表征探针：多视角对照"
summary: "把同一份 BERT 文档片段表征用多种 probe 拆开来看：聚类视角、线性可读视角、Fisher 几何视角。每把尺子看到 BERT 学到了什么的一个不同侧面，没有任何一把单独足够。"
description: "Artifact-5 是一个 umbrella artifact：以 BERT 文档片段表征为对象，按 probing 方法分成多个 child artifact 独立分析，每个视角独立可读，整体形成对照框架。"
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

这是一个 umbrella artifact，对应 child artifacts 见下方。

## 核心问题

BERT 学到的文档级 topic 信息，到底是以什么形式编码进表征空间的？

不同 probing 方法分别能"看见"这个问题的不同侧面 —— **用哪把尺子看，决定你看到什么**。本系列故意把同一份 BERT 表征用多种探针拆开观察，每个视角独立成 child artifact，避免被单一方法的视野所限。

## 视角清单

- **5.1 [聚类视角](/artifacts/05-1-clustering-view/)** —— 用 KMeans 等无监督聚类作为探针：topic-aligned 几何结构如何随层、随 preprocessing 变化？发现 stability 不等于 semantic alignment，anisotropy 是可能的干扰之一、但不是唯一解释。
- **5.1.1 [PCA Whitening 合成 demo](/artifacts/05-1-1-pca-whitening-demo/)** —— 5.1 的方法学边注：用合成 anisotropic mixture 隔离 whitening 的几何机制。
- **5.2 [Linear probe 视角](/artifacts/05-2-linear-probe-view/)** —— 用每层逻辑回归测 topic 的线性可解码度。random-init 的线性探针高于分类 chance，而 clustering alignment 很低（NMI 约 0.06）—— **可线性解码 ≠ 结构自组织**；NMI 与 accuracy 也不能共用一条 `0.05` chance 线。
- **5.3 [Fisher 视角](/artifacts/05-3-fisher-view/)** —— LDA 分类器（与 5.2 互证）+ Fisher 迹比 η² 几何。它最可靠的发现是几何总量与分类器读出可以分歧；这种分歧本身不能唯一定位到 low-variance directions。

## 2026-07 科学收口

> **Closure note（2026-07）：** 后续 direction-level spectrum audit 反驳并收紧了初版“topic signal 主要藏在 low-variance tail”的解释。在 raw centered pretrained L12 embeddings 上，PC1 的 per-PC $\eta^2=0.669$；前 100 个高方差 PCs 包含 **82.4%** 总方差，却包含 **98.7%** observed between-class scatter；PC variance 与 per-PC $\eta^2$ 的 Spearman 为 **+0.718**。这些标签 attribution 使用同一批 `n=2000` 样本，属于 **exploratory / descriptive** 诊断，不是 held-out confirmation。

因此，初版的“低方差方向统一原理”不再作为 finding 保留。数据支持的是更窄的解释：pretrained L12 的 topic-aligned class-mean structure 主要集中在 **leading subspace**；whitening 的收益更像是在这个 leading subspace 内做 **spectral rebalancing**，而不是从完整谱的低方差尾部“捞回”主要信号。这个机制解释仍是描述性的，不是 attention 或 whitening 的因果证明。

## 收口后的统一结论（across probes）

> **Linear decodability、unsupervised cluster alignment、Fisher trace geometry 与 direction-level spectrum attribution 是不同 measurement operators；它们对同一表征给出不同 verdict 并不矛盾，也不能互相替代。**

random-init 上的线性可读性也不再被解释成“低方差 residual 中已经存在同一种 semantic organization”。它仍使用 pretrained tokenizer，mean-pooled random token embeddings 可以保留 lexical / random-feature cues；anisotropy 可能影响 distance-based clustering，但不是经当前实验识别出的唯一原因。需要 TF-IDF、random projection、多 random seeds 与干预实验，才能继续做机制归因。

旧 three-view overlay 仍保留在 child artifacts 中，作为当时的 **legacy exploratory overlay**：它展示不同曲线的形状对照，但归一化后的跨指标叠图不能证明共享机制。

## 这个系列想说什么

> Same representations, three lenses → each lens sees a different facet
> of what BERT learned about topics. None is sufficient alone.

用三把不同的尺子量同一根东西，比单靠任何一把的可信度高得多。这也是本系列**故意不把所有 probe 合成一个大 artifact** 的原因：每个视角的方法学边界、敏感性、失败模式都不一样，分开写才能保留它们各自的诚实尺度。
