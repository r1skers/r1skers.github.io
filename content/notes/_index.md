---
title: "笔记"
description: "课程笔记与自学记录。"
summary: "课程笔记与自学记录目录。"
aliases:
  - /study-notes/
  - /notebook/
---

<details open>
<summary><strong>线性代数</strong></summary>

> 🗺️ [**大一统知识地图**](https://r1skers.github.io/r1skers-knowledge-map/) — 独立部署的交互式概念地图。支持搜索、悬停看卡片、`?node=` 链接分享。整支系列的入口与导览。

**基础与分支笔记**

- [**Part 0** — 矩阵、线性映射与坐标语言](/notes/note-la-0-foundation/) — 系列地基：矩阵作为线性映射的坐标表示

</details>

<details>
<summary><strong>机器学习</strong></summary>

### 无监督学习与表征几何
从 PCA 与 whitening 开始，沿着方向、尺度、邻域图和聚类评估建立分析 embedding 空间的工具箱。

- [**1. PCA / Whitening** — 主方向、尺度校正与邻域可视化](/notes/note-ml-unsup-1-pca-whitening/)
- [**2. Spectral 方法** — 图拉普拉斯、结构表示与谱聚类](/notes/note-ml-unsup-2-spectral/)
- [**3. 聚类算法** — KMeans、GMM、层次聚类与 DBSCAN](/notes/note-ml-unsup-3-clustering-algorithms/)
- [**4. 聚类评估** — 内部指标、外部指标与稳定性](/notes/note-ml-unsup-4-cluster-evaluation/)

### 生成模型
- [**1. VAE** — 基本思想与 ELBO 推导](/notes/note-ml-gen-1-vae-elbo/)
- [**2. VAE** — 最小复现](/notes/note-ml-gen-2-vae-minimal/)
- [**3. CNN-VAE** — 从 MLP 到卷积结构](/notes/note-ml-gen-3-cnn-vae/)

### CNN 与视觉表征
从 LeNet-5 到 ResNet，这一组笔记记录 CNN 从早期手写数字识别，到 ImageNet 大规模分类，再到深层视觉 backbone 的演化。

- [**1. LeNet-5** — 从 LeNet-5 到 Modern CNN](/notes/note-ml-cnn-1-lenet-to-modern/)
- [**2. AlexNet** — 深度视觉时代的起点](/notes/note-ml-cnn-2-alexnet/)
- [**3. VGG** — 深度与小卷积核](/notes/note-ml-cnn-3-vgg/)
- [**4. ResNet** — 残差学习与退化问题](/notes/note-ml-cnn-4-resnet/)

### Transformer、ViT 与 CLIP
从 self-attention 出发复现一个最小 encoder-only Transformer 并验证 PE 必要性，把同一套 encoder 搬到视觉任务上做 ViT，再把两塔拼到同一个共享空间里做 CLIP，完成从单模态到多模态对齐的过渡。

- [**1. Transformer** — 从注意力到编码器](/notes/note-ml-transformer-1-attention-to-encoder/)
- [**2. ViT** — 从图像分块到注意力分类](/notes/note-ml-vit-1-patches-to-attention/)
- [**3. CLIP** — 从对比学习到图文共享空间](/notes/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details>
<summary><strong>底层架构 / AI Infra</strong></summary>

从 GPU 内存层次、IO-aware 算法和推理系统出发，记录 AI infra 里那些真正卡住吞吐、延迟和显存的底层机制。

- [**1. FlashAttention v1** — IO 感知注意力与 tiling-softmax](/notes/note-systems-io-attn-1-flashattention/)
- [**2. Online Softmax** — 原始推导与 top-K fusion](/notes/note-systems-io-attn-2-online-softmax/)

</details>

<details>
<summary><strong>数学</strong></summary>

- [**复变 1** — 复变函数](/notes/note-math-1-complex-analysis)
- [**实分析 1** — 收敛、唯一性、有界性与柯西列](/notes/note-ra-1-convergence-cauchy)
- [**实分析 2** — 确界公理、单调收敛与完备性等价链](/notes/note-ra-2-supremum-completeness)
- [**实分析 3** — 度量空间、赋范空间、Hilbert 空间与傅里叶基础](/notes/note-ra-3-metric-normed-hilbert-fourier)
- [**实分析 4** — 有界线性算子、对偶空间、谱理论与紧算子](/notes/note-ra-4-operators-dual-spectrum-compact)

</details>

<details>
<summary><strong>线性系统</strong></summary>

- [**第 1 篇** — 傅里叶变换](/notes/note-linsys-1-fourier)
- [**第 2 篇** — 拉普拉斯变换](/notes/note-linsys-2-laplace)
- [**第 3 篇** — RLC 电路：微分方程与拉普拉斯方法](/notes/note-linsys-3-laplace-pde)

</details>

<details>
<summary><strong>量子力学</strong></summary>

- [**第 1 篇** — 从薛定谔到波函数](/notes/note-qm-1-schrodinger)
- [**第 2 篇** — 电子如何分布](/notes/note-qm-2-fermions)

</details>

<details>
<summary><strong>计算科学与高可靠系统设计</strong></summary>

- [**第 1 篇** — 问题背景与空间场构造](/notes/note-csys-1-problem-spatial-field)
- [**第 2 篇** — 从地形到时间演化](/notes/note-csys-2-terrain-to-time)
- [**第 3 篇** — 从完整轨迹到观测数据](/notes/note-csys-3-trajectory-to-observation)
- [**第 4 篇** — 从观测数据到参数反演](/notes/note-csys-4-observation-to-inversion)
- [**第 5 篇** — 有限差分梯度与梯度下降](/notes/note-csys-5-finite-diff-gradient-descent)
- [**第 6 篇** — 反演结果分析与参数可信度](/notes/note-csys-6-inversion-credibility)
- [**第 7 篇** — 从有限差分梯度下降到 L-BFGS 与对数参数化](/notes/note-csys-7-lbfgs-log-parameterization)
- [**第 8 篇** — 正则化、先验与稳定反演](/notes/note-csys-8-regularization-prior)
- [**第 9 篇** — 平滑项、先验项与正则化强度](/notes/note-csys-9-smoothness-prior-strength)
- [**第 10 篇** — 从空间场到稳定反演的完整链条总结](/notes/note-csys-10-summary)

</details>

<details>
<summary><strong>岩体力学</strong></summary>

- [**第 1 篇** — 矿物组成、结构特征与结构面基础](/notes/note-rock-mech-1-basics)

</details>

<details>
<summary><strong>计划中</strong></summary>

- GAN
- Diffusion
- 周易

</details>
