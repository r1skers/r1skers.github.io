---
title: "CV"
url: "/cv/"
summary: "面向研究申请的简版 CV 草稿。"
description: "r1skers 的研究向 CV 草稿：教育背景、研究兴趣、项目、技术栈与站点内可参考材料。"
aliases:
  - /resume/
---

# CV

研究向 CV 草稿，用来整理申请材料中的项目、技术栈和学习路径。正式申请时会按目标 program 方向裁剪。

## 个人简介 / About

日本山形大学 (Yamagata University) ECE 本科生，研究兴趣聚焦表征几何、无监督学习与 Transformer 表征分析。  
目前在自定义的 ML 学习 roadmap 上做系统性 paper reforge 与方法学探针实验。

## 教育 / Education

**Yamagata University (山形大学)**, Japan &nbsp;&nbsp; *Expected Mar 2028*  

Selected coursework: Real Analysis · Machine Learning · Linear Algebra · Probability & Statistics · Signals & Systems

## 研究兴趣 / Research Interests

- Representation geometry & embedding analysis
- Unsupervised learning, clustering, and stability evaluation
- Transformer / multimodal representation analysis (BERT, CLIP)
- Methodology-as-finding: representation preprocessing as an experimental variable

## Selected Projects / 项目

### BERT Cluster Geometry Probe &nbsp;&nbsp; *2026 — W1 pilot complete*

链接：[Artifact-5](/artifacts/05-bert-cluster-stability/) · [Artifact-5.1](/artifacts/05-1-pca-whitening-demo/) · [GitHub](https://github.com/r1skers/bert-cluster-stability)

- 自主设计的无监督聚类 probe pipeline，分析 BERT 文档片段表征在层间是否包含与 topic 对齐的几何结构。  
- 在 20 Newsgroups 上抽取 `bert-base-uncased` 13 层表示，与同架构 random-init BERT 做对照。  
- 系统比较 12 种 representation 处理（含 PCA whitening）、6 种 clusterer（Lloyd / spherical KMeans / GMM / agglomerative）、K 扫描，以及 Lange/Ben-Hur 风格的 subset-resampling stability ARI。  
- **核心发现**：PCA whitening + spherical KMeans 把 L12 topic NMI 从 0.36 抬到 0.45；同时通过 random-init 对照揭示 baseline stability 0.64 是各向异性产生的伪信号 ——**stability ≠ clustering quality**。  
- 配套 micro-artifact（5.1）用合成 anisotropic mixture 复现该几何机制，ARI 0.001 → 0.98。

### paper-reforge — Transformer / ViT / CLIP from scratch &nbsp;&nbsp; *2026*

链接：[GitHub](https://github.com/r1skers/paper-reforge)（如已建仓）

- 用 PyTorch 从零实现 multi-head self-attention，与 numpy gold-standard 校验到 float64 精度 (1e-15)。  
- 完整复现 ViT 在 CIFAR-10 的训练 + attention rollout 可视化。  
- CLIP 双塔：自实现 text tokenizer + causal-attention text encoder + image encoder + contrastive loss + dual-tower assembly。  
- 22+ 单元测试，涵盖 attention / PE / FFN / EncoderBlock / model / data 各模块。

### paper-reforge — CNN sequence (LeNet / AlexNet / ResNet) &nbsp;&nbsp; *2026*

- LeNet5 paper-faithful + modern variants；AlexNet 形状表 + pretrained inference demo。  
- ResNet 复现 degradation-vs-residual 故事：plain20 / plain56 / resnet20 / resnet56 训练曲线 + 汇总 CSV 对照。

### Orogeny Sandbox &nbsp;&nbsp; *计算建模 / PDE-to-ML pipeline*

链接：[Artifact-3](/artifacts/03-orogeny-sandbox/)

- 端到端实验链：地形生成 → 扩散仿真 → 数据集构建 → rollout 验证。  
- 练习数值稳定性检查、结构化数据生成与 ML surrogate modeling。

## Selected Notes & Writing / 笔记

公开学习记录见 [r1skers.github.io](https://r1skers.github.io)。系列概览：

- **实分析系列**（4 篇）：[收敛/有界/柯西列起手](/notes/笔记-数学-实分析1-收敛性有界性与柯西列/) → 度量空间 / 完备性 / Hilbert / 傅里叶
- **无监督学习系列**（5 篇）：[路线图与核心问题](/notes/笔记-机器学习-无监督学习0-路线图与核心问题/) → PCA whitening · spectral · KMeans/GMM/层次/DBSCAN · 聚类评估与稳定性
- **Transformer 系列**：[从注意力到编码器](/notes/笔记-机器学习-Transformer与序列建模1-从注意力到编码器/)
- **ViT 系列**：[从图像分块到注意力分类](/notes/笔记-机器学习-ViT与视觉Transformer1-从图像分块到注意力分类/)
- **CLIP 系列**：[从对比学习到图文共享空间](/notes/笔记-机器学习-CLIP与多模态对齐1-从对比学习到图文共享空间/)

## 技术栈 / Technical Skills

- **Programming**: Python, C/C++ (AVX2 intrinsics, learning), MATLAB basics
- **ML / Data**: PyTorch, HuggingFace Transformers, scikit-learn, NumPy, SciPy, pandas, Matplotlib
- **Tooling**: Git, GitHub, Hugo, LaTeX, pytest, Markdown
- **Focus areas**: embedding analysis, clustering evaluation, PCA / whitening, numerical experiments, methodological sensitivity

## 语言 / Languages

- Chinese (native)
- Japanese (study language; daily academic use)
- English (academic / professional)

## 联系方式 / Contact

- GitHub: [github.com/r1skers](https://github.com/r1skers)
- Website: [r1skers.github.io](https://r1skers.github.io)
- Email: <t243057@st.yamagata-u.ac.jp>
