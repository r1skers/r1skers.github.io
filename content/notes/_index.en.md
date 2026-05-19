---
title: "Notes"
description: "Course notes and self-study records."
summary: "An index of course notes and self-study records."
---

<details open>
<summary><strong>Machine Learning</strong></summary>

### Generative Models
- [**1. VAE** — The Basic Idea and the ELBO](/notes/笔记-机器学习-生成模型1-VAE基本思想与ELBO推导/)
- [**2. VAE** — A Minimal Reproduction](/notes/笔记-机器学习-生成模型2-VAE最小复现/)
- [**3. CNN-VAE** — From MLPs to Convolutional Structure](/notes/笔记-机器学习-生成模型3-CNNVAE从MLP到卷积结构/)

### CNN and Visual Representation
This series follows CNNs from early handwritten digit recognition to large-scale ImageNet classification and then to deep visual backbones.

- [**1. LeNet-5** — From LeNet-5 to Modern CNN](/notes/笔记-机器学习-CNN与视觉表征1-从LeNet5到ModernCNN/)
- [**2. AlexNet** — The Starting Point of Deep Visual Learning](/notes/笔记-机器学习-CNN与视觉表征2-AlexNet深度视觉时代的起点/)
- [**3. VGG** — Depth and Small Convolution Filters](/notes/笔记-机器学习-CNN与视觉表征3-VGG深度与小卷积核/)
- [**4. ResNet** — Residual Learning and the Degradation Problem](/notes/笔记-机器学习-CNN与视觉表征4-ResNet残差学习与退化问题/)

### Transformer, ViT, and CLIP
Reproduce a minimal encoder-only Transformer from self-attention and validate PE necessity, carry the same encoder over to vision tasks as ViT, then stitch the two towers into a shared space for CLIP — completing the path from unimodal to multimodal alignment.

- [**1. Transformer** — From Attention to the Encoder](/notes/笔记-机器学习-Transformer与序列建模1-从注意力到编码器/)
- [**2. ViT** — From Patches to Attention-Based Classification](/notes/笔记-机器学习-ViT与视觉Transformer1-从图像分块到注意力分类/)
- [**3. CLIP** — From Contrastive Learning to a Shared Image-Text Space](/notes/笔记-机器学习-CLIP与多模态对齐1-从对比学习到图文共享空间/)

</details>

<details>
<summary><strong>AI Infrastructure</strong></summary>

Starting from GPU memory hierarchy, IO-aware algorithms, and inference systems, this section tracks the low-level mechanisms that actually shape throughput, latency, and memory usage in AI infrastructure.

- [**1. FlashAttention v1** — IO-Aware Attention and Tiling Softmax](/notes/笔记-底层架构-io感知注意力1-flashattention-v1与tiling-softmax/)

</details>

<details>
<summary><strong>Mathematics</strong></summary>

- [**Complex Analysis 1** — Complex Analysis](/notes/笔记-数学1-复变函数)
- [**Real Analysis 1** — Convergence, Uniqueness, Boundedness, and Cauchy Sequences](/notes/笔记-实分析1-收敛、唯一性、有界性与柯西列)
- [**Real Analysis 2** — The Supremum Axiom, Monotone Convergence, and the Equivalence Chain of Completeness](/notes/笔记-实分析2-确界公理、单调收敛与完备性等价链)

</details>

<details>
<summary><strong>Linear Algebra</strong></summary>

- [**Part 0** — Intuition for Rank, Null Space, and SVD](/notes/笔记-线性代数0-秩、零空间与SVD)
- [**Part 1** — Singular Matrices and Parameter Identifiability](/notes/笔记-线性代数1-奇异矩阵与参数辨识性)
- [**Part 2** — Regularization and Stable Inversion](/notes/笔记-线性代数2-正则化与稳定反演)

</details>

<details>
<summary><strong>Linear Systems</strong></summary>

- [**Part 1** — Fourier Transform](/notes/笔记-线性系统1-傅里叶变换)
- [**Part 2** — Laplace Transform](/notes/笔记-线性系统2-拉普拉斯变换及其应用)
- [**Part 3** — RLC Circuit Analysis: Differential Equations vs. Laplace Transform](/notes/笔记-线性系统3-拉普拉斯变换在二阶偏微分方程的应用)

</details>

<details>
<summary><strong>Quantum Mechanics</strong></summary>

- [**Part 1** — From Schrödinger to Wave Functions](/notes/笔记-量子力学1-薛定谔公式)
- [**Part 2** — How Electrons Are Distributed](/notes/笔记-量子力学2-费米子)

</details>

<details>
<summary><strong>Computational Science and High-Reliability Systems Design</strong></summary>

- [**Part 1** — Problem Setup and Spatial Field Construction](/notes/笔记-计算科学与高可靠系统设计1-问题背景与空间场构造)
- [**Part 2** — From Terrain to Temporal Evolution](/notes/笔记-计算科学与高可靠系统设计2-从地形到时间演化)
- [**Part 3** — From Full Trajectories to Observations](/notes/笔记-计算科学与高可靠系统设计3-从完整轨迹到观测数据)
- [**Part 4** — From Observations to Parameter Inversion](/notes/笔记-计算科学与高可靠系统设计4-从观测数据到参数反演)
- [**Part 5** — Parameter Inversion I: Finite-Difference Gradient and Gradient Descent](/notes/笔记-计算科学与高可靠系统设计5-有限差分与梯度下降)
- [**Part 6** — Inversion Result Analysis and Parameter Credibility](/notes/笔记-计算科学与高可靠系统设计6-反演结果分析与参数可信度)
- [**Part 7** — From Finite-Difference Gradient Descent to L-BFGS and Log-Parameterization](/notes/笔记-计算科学与高可靠系统设计7-从有限差分梯度下降到L-BFGS与对数参数化)
- [**Part 8** — Regularization, Priors, and Stable Inversion](/notes/笔记-计算科学与高可靠系统设计8-正则化、先验与稳定反演)
- [**Part 9** — Smoothness Terms, Prior Terms, and Regularization Strength](/notes/笔记-计算科学与高可靠系统设计9-平滑项、先验项与正则化强度)
- [**Part 10** — A Full-Chain Summary from Spatial Fields to Stable Inversion](/notes/笔记-计算科学与高可靠系统设计10-从空间场到稳定反演的完整链条总结)

</details>

<details>
<summary><strong>Rock Mechanics</strong></summary>

- [**Part 1** — Mineral Composition, Structural Features, and Discontinuity Basics](/notes/笔记-岩体力学1-基础知识)

</details>

<details>
<summary><strong>Planned</strong></summary>

- GAN
- Diffusion
- Electromagnetism
- Electric Circuits

</details>
