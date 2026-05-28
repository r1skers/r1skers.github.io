---
title: "CV"
url: "/cv/"
summary: "面向研究申请的简版 CV 草稿。"
description: "r1skers 的研究向 CV 草稿：研究兴趣、教育背景、研究经历、技术栈与站点内可参考材料。"
aliases:
  - /resume/
---

# CV

## 研究陈述

什么都研究研究（待定）

## 研究兴趣

- 视觉–语言与多模态表征学习（CLIP 系模型）
- 习得嵌入的几何性质：各向异性、whitening，及其对下游聚类行为的影响
- 方法学即发现：把表征预处理与评估协议作为实验变量来分析
- 高维嵌入空间中的无监督结构发现与稳定性评估

## 教育背景

工学学士，[TBD：电气电子工学 / 正式专业名]，山形大学（日本）— 2024 年 4 月 – 2028 年 3 月（预计）  
主修课程：实分析 · 机器学习 · 线性代数 · 概率与统计 · 信号与系统

## 研究经历

### BERT 表征聚类几何探针 — *独立研究，2026*

链接：[Artifact-5 系列](/artifacts/05-bert-representation-probes/) · [5.1 聚类视角](/artifacts/05-1-clustering-view/) · [5.1.1 Whitening demo](/artifacts/05-1-1-pca-whitening-demo/) · [GitHub](https://github.com/r1skers/bert-cluster-stability)

自主设计的无监督探针流水线，分析 BERT 在文档级表征上是否在各层中携带与主题对齐的几何结构，并显式引入 random-init 对照作为几何零模型。

- 在 20 Newsgroups 上抽取 `bert-base-uncased` 的 13 层表征，与同架构 random-init BERT 配对作为零模型基线。
- 系统扫描 **12 种表征预处理**（含 PCA whitening）、**6 种聚类器**（Lloyd / spherical KMeans / GMM / 凝聚层次等）、不同的 *K*，以及 Lange / Ben-Hur 风格的 subset-resampling stability ARI。
- **核心发现**：PCA whitening + spherical KMeans 将 L12 的 topic NMI 从 0.36 抬升至 0.45；random-init 对照同时揭示，看上去很强的 baseline stability（ARI ≈ 0.64）其实是**各向异性产生的伪信号**——即 *stability ≠ clustering quality*。这一结果对一种常用的评估协议提出了重新审视的依据。
- 配套 micro-artifact（5.1）在合成的 anisotropic mixture 上隔离该机制，复现同一失败模式（whitening 后 ARI 0.001 → 0.98），是一个对该效应"几何性而非数据依赖"的最小可复现演示。

## 公开写作

按主题整理的学习笔记，覆盖近期工作过的内容。完整索引见 [r1skers.github.io](https://r1skers.github.io)。

- *实分析*：度量空间、完备性、Hilbert 空间、傅里叶
- *无监督学习*：PCA / whitening、谱方法、KMeans / GMM / 层次 / DBSCAN、聚类评估与稳定性
- *Transformer 与序列建模*：注意力机制、encoder–decoder
- *Vision Transformer*：patch embedding、基于注意力的分类
- *CLIP 与多模态对齐*：对比学习、图文共享空间

## 技术栈

- *方法*：embedding 分析、聚类评估、PCA / whitening、controlled ablation、stability resampling
- *编程语言*：Python、C/C++
- *库*：PyTorch、HuggingFace Transformers、scikit-learn、NumPy、SciPy
- *工具*：Git、LaTeX、pytest

## 荣誉与奖项

[TBD — 有内容则列；为空则整段删除]

## 语言

中文（母语）· 日语（学术工作语言；JLPT [TBD]）· 英语（学术；TOEFL / IELTS [TBD]）

## 联系方式

Email：<t243057@st.yamagata-u.ac.jp> · GitHub：[r1skers](https://github.com/r1skers) · 个人站：[r1skers.github.io](https://r1skers.github.io)
