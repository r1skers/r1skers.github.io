---
title: "笔记"
description: "课程笔记与自学记录。"
summary: "课程笔记与自学记录目录。"
aliases:
  - /study-notes/
  - /notebook/
---

<details open>
<summary><strong>数学</strong></summary>

<details class="note-subgroup">
<summary><strong>线性代数</strong></summary>

> 🗺️ [**大一统知识地图**](https://r1skers.github.io/r1skers-knowledge-map/) — 独立知识地图站。支持搜索、拖动缩放、节点卡片与 `?node=` 链接分享。

- [**Part 0** — 矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/) — 系列地基：矩阵作为线性映射的坐标表示

</details>

<details class="note-subgroup">
<summary><strong>实分析与泛函</strong></summary>

- [**实分析 1** — 收敛、唯一性、有界性与柯西列](/notes/math/real-analysis/note-ra-1-convergence-cauchy)
- [**实分析 2** — 确界公理、单调收敛与完备性等价链](/notes/math/real-analysis/note-ra-2-supremum-completeness)
- [**实分析 3** — 度量空间、赋范空间、Hilbert 空间与傅里叶基础](/notes/math/real-analysis/note-ra-3-metric-normed-hilbert-fourier)
- [**实分析 4** — 有界线性算子、对偶空间、谱理论与紧算子](/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact)
- [**实分析 5** — 弱收敛、Hahn-Banach 与 Banach 不动点定理](/notes/math/real-analysis/note-ra-5-weak-convergence-hahn-banach-fixed-point)
- [**实分析 6** — 测度、可测函数与 Lebesgue 积分](/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral)
- [**实分析 7** — MCT、Fatou、DCT 与 L^p 空间](/notes/math/real-analysis/note-ra-7-convergence-theorems-lp)

</details>

<details class="note-subgroup">
<summary><strong>Fourier / Laplace / 线性系统</strong></summary>

这条线作为实分析与泛函的应用分支：从 Hilbert 空间、正交展开和算子语言，落到信号与系统里的变换方法。

- [**第 1 篇** — 傅里叶变换](/notes/math/linear-systems/note-linsys-1-fourier)
- [**第 2 篇** — 拉普拉斯变换](/notes/math/linear-systems/note-linsys-2-laplace)
- [**第 3 篇** — RLC 电路：微分方程与拉普拉斯方法](/notes/math/linear-systems/note-linsys-3-laplace-pde)

</details>

<details class="note-subgroup">
<summary><strong>概率与统计</strong></summary>

- 概率论
- 数理统计
- 随机过程

</details>

<details class="note-subgroup">
<summary><strong>复分析</strong></summary>

- [**复变 1** — 复变函数](/notes/math/complex-analysis/note-math-1-complex-analysis)

</details>

</details>

<details>
<summary><strong>机器学习</strong></summary>

<details class="note-subgroup">
<summary><strong>无监督学习与表征几何</strong></summary>

从 PCA 与 whitening 开始，沿着方向、尺度、邻域图和聚类评估建立分析 embedding 空间的工具箱。

- [**0. 路线图** — 无监督学习的核心问题](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)
- [**1. PCA / Whitening** — 主方向、尺度校正与邻域可视化](/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
- [**2. Spectral 方法** — 图拉普拉斯、结构表示与谱聚类](/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
- [**3. 聚类算法** — KMeans、GMM、层次聚类与 DBSCAN](/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
- [**4. 聚类评估** — 内部指标、外部指标与稳定性](/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)

</details>

<details class="note-subgroup">
<summary><strong>CNN 与视觉表征</strong></summary>

从 LeNet-5 到 ResNet，这一组笔记记录 CNN 从早期手写数字识别，到 ImageNet 大规模分类，再到深层视觉 backbone 的演化。

- [**1. LeNet-5** — 从 LeNet-5 到 Modern CNN](/notes/ml/cnn/note-ml-cnn-1-lenet-to-modern/)
- [**2. AlexNet** — 深度视觉时代的起点](/notes/ml/cnn/note-ml-cnn-2-alexnet/)
- [**3. VGG** — 深度与小卷积核](/notes/ml/cnn/note-ml-cnn-3-vgg/)
- [**4. ResNet** — 残差学习与退化问题](/notes/ml/cnn/note-ml-cnn-4-resnet/)

</details>

<details class="note-subgroup">
<summary><strong>Transformer、ViT 与 CLIP</strong></summary>

从 self-attention 出发复现一个最小 encoder-only Transformer 并验证 PE 必要性，把同一套 encoder 搬到视觉任务上做 ViT，再把两塔拼到同一个共享空间里做 CLIP，完成从单模态到多模态对齐的过渡。

- [**1. Transformer** — 从注意力到编码器](/notes/ml/transformer-vit-clip/note-ml-transformer-1-attention-to-encoder/)
- [**2. ViT** — 从图像分块到注意力分类](/notes/ml/transformer-vit-clip/note-ml-vit-1-patches-to-attention/)
- [**3. CLIP** — 从对比学习到图文共享空间](/notes/ml/transformer-vit-clip/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details class="note-subgroup">
<summary><strong>生成模型</strong></summary>

- [**1. VAE** — 基本思想与 ELBO 推导](/notes/ml/generative-models/note-ml-gen-1-vae-elbo/)
- [**2. VAE** — 最小复现](/notes/ml/generative-models/note-ml-gen-2-vae-minimal/)
- [**3. CNN-VAE** — 从 MLP 到卷积结构](/notes/ml/generative-models/note-ml-gen-3-cnn-vae/)

</details>

</details>

<details>
<summary><strong>系统与计算</strong></summary>

<details class="note-subgroup">
<summary><strong>底层架构 / AI Infra</strong></summary>

从 GPU 内存层次、IO-aware 算法和推理系统出发，记录 AI infra 里那些真正卡住吞吐、延迟和显存的底层机制。

- [**1. FlashAttention v1** — IO 感知注意力与 tiling-softmax](/notes/systems/ai-infra/note-systems-io-attn-1-flashattention/)
- [**2. Online Softmax** — 原始推导与 top-K fusion](/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/)
- [**3. 复现与验证** — 亲手实现 tiled attention 并用 invariant 验证 tiled==naive](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/)

</details>

<details class="note-subgroup">
<summary><strong>计算科学与高可靠系统设计</strong></summary>

- [**第 1 篇** — 问题背景与空间场构造](/notes/systems/computational-science/note-csys-1-problem-spatial-field)
- [**第 2 篇** — 从地形到时间演化](/notes/systems/computational-science/note-csys-2-terrain-to-time)
- [**第 3 篇** — 从完整轨迹到观测数据](/notes/systems/computational-science/note-csys-3-trajectory-to-observation)
- [**第 4 篇** — 从观测数据到参数反演](/notes/systems/computational-science/note-csys-4-observation-to-inversion)
- [**第 5 篇** — 有限差分梯度与梯度下降](/notes/systems/computational-science/note-csys-5-finite-diff-gradient-descent)
- [**第 6 篇** — 反演结果分析与参数可信度](/notes/systems/computational-science/note-csys-6-inversion-credibility)
- [**第 7 篇** — 从有限差分梯度下降到 L-BFGS 与对数参数化](/notes/systems/computational-science/note-csys-7-lbfgs-log-parameterization)
- [**第 8 篇** — 正则化、先验与稳定反演](/notes/systems/computational-science/note-csys-8-regularization-prior)
- [**第 9 篇** — 平滑项、先验项与正则化强度](/notes/systems/computational-science/note-csys-9-smoothness-prior-strength)
- [**第 10 篇** — 从空间场到稳定反演的完整链条总结](/notes/systems/computational-science/note-csys-10-summary)

</details>

</details>

<details>
<summary><strong>物理与工程</strong></summary>

<details class="note-subgroup">
<summary><strong>量子力学</strong></summary>

- [**第 1 篇** — 从薛定谔到波函数](/notes/science/quantum-mechanics/note-qm-1-schrodinger)
- [**第 2 篇** — 电子如何分布](/notes/science/quantum-mechanics/note-qm-2-fermions)

</details>

<details class="note-subgroup">
<summary><strong>岩体力学</strong></summary>

- [**第 1 篇** — 矿物组成、结构特征与结构面基础](/notes/science/rock-mechanics/note-rock-mech-1-basics)

</details>

</details>

<details>
<summary><strong>计划中</strong></summary>

<details class="note-subgroup">
<summary><strong>待展开方向</strong></summary>

- GAN
- Diffusion
- 概率图模型
- 电磁学
- 电路
- 周易

</details>

</details>
