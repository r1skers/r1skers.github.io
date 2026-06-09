---
date: '2026-05-26T20:00:00+09:00'
draft: false
title: "[Artifact-5] BERT 表征探针：多视角对照"
summary: "把同一份 BERT 文档片段表征用多种 probe 拆开来看：聚类视角、线性可读视角、Fisher 几何视角。每把尺子看到 BERT 学到了什么的一个不同侧面，没有任何一把单独足够。"
description: "Artifact-5 是一个 umbrella artifact：以 BERT 文档片段表征为对象，按 probing 方法分成多个 child artifact 独立分析，每个视角独立可读，整体形成对照框架。"
tags:
  - "Artifact"
  - "BERT"
  - "Representation Analysis"
categories:
  - "Artifacts"
weight: 50
math: true
---

这是一个 umbrella artifact，对应 child artifacts 见下方。

## 核心问题

BERT 学到的文档级 topic 信息，到底是以什么形式编码进表征空间的？

不同 probing 方法分别能"看见"这个问题的不同侧面 —— **用哪把尺子看，决定你看到什么**。本系列故意把同一份 BERT 表征用多种探针拆开观察，每个视角独立成 child artifact，避免被单一方法的视野所限。

## 视角清单

- **5.1 [聚类视角](/artifacts/05-1-clustering-view/)** —— 用 KMeans 等无监督聚类作为探针：topic-aligned 几何结构如何随层、随 preprocessing 变化？发现 stability 单独看会被各向异性误导。
- **5.1.1 [PCA Whitening 合成 demo](/artifacts/05-1-1-pca-whitening-demo/)** —— 5.1 的方法学边注：用合成 anisotropic mixture 隔离 whitening 的几何机制。
- **5.2 [Linear probe 视角](/artifacts/05-2-linear-probe-view/)** —— 用每层逻辑回归测 topic 的线性可解码度。发现：监督线性探针能读出无监督聚类完全读不到的 topic 信息（random-init 上聚类趴地板、探针远超 chance）—— **可线性解码 ≠ 结构自组织**。
- **5.3 [Fisher 视角](/artifacts/05-3-fisher-view/)** —— LDA 分类器（与 5.2 互证）+ Fisher 迹比 η² 几何。发现几何（η²）与分类器（准确率）在 random-init 上分道扬镳，揭示统一原理：**话题信息藏在低方差方向，重加权的方法（whitening / $S_W^{-1}$ / 学权重）才读得到，尊重原始方差的方法（朴素聚类 / η²）看到地板**。

## 统一发现（across probes）

三个视角拼到一起，可以被一句话统起来：

> **话题信息可以藏在低方差方向里。重加权方向的方法（PCA 白化 / LDA 的 $S_W^{-1}$ / 逻辑回归学的权重）能读到它；尊重原始方差的几何探针（朴素聚类 / Fisher 迹比 η²）会漏掉它。**

最强证据是 random-init BERT 的"分裂人格"：**无监督聚类看它趴地板、Fisher η² 也趴地板，但线性探针远高于 chance**——topic 信号一直在，只是埋在低方差方向、被高方差 nuisance 盖住。决定"读不读得到"的不是监督与否，而是**方法重不重加权方向**。

## 这个系列想说什么

> Same representations, three lenses → each lens sees a different facet
> of what BERT learned about topics. None is sufficient alone.

用三把不同的尺子量同一根东西，比单靠任何一把的可信度高得多。这也是本系列**故意不把所有 probe 合成一个大 artifact** 的原因：每个视角的方法学边界、敏感性、失败模式都不一样，分开写才能保留它们各自的诚实尺度。
