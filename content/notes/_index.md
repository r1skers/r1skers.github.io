---
title: "笔记"
description: "课程笔记与自学记录。"
summary: "课程笔记与自学记录目录。"
aliases:
  - /study-notes/
  - /notebook/
---

<details open>
<summary><strong>机器学习</strong></summary>

### 生成模型
- [**1. VAE** — 基本思想与 ELBO 推导](/notes/笔记-机器学习-生成模型1-vae基本思想与elbo推导/)
- [**2. VAE** — 最小复现](/notes/笔记-机器学习-生成模型2-vae最小复现/)
- [**3. CNN-VAE** — 从 MLP 到卷积结构](/notes/笔记-机器学习-生成模型3-cnnvae从mlp到卷积结构/)

### CNN 与视觉表征
从 LeNet-5 到 ResNet，这一组笔记记录 CNN 从早期手写数字识别，到 ImageNet 大规模分类，再到深层视觉 backbone 的演化。

- [**1. LeNet-5** — 从 LeNet-5 到 Modern CNN](/notes/笔记-机器学习-cnn与视觉表征1-从lenet5到moderncnn/)
- [**2. AlexNet** — 深度视觉时代的起点](/notes/笔记-机器学习-cnn与视觉表征2-alexnet深度视觉时代的起点/)
- [**3. VGG** — 深度与小卷积核](/notes/笔记-机器学习-cnn与视觉表征3-vgg深度与小卷积核/)
- [**4. ResNet** — 残差学习与退化问题](/notes/笔记-机器学习-cnn与视觉表征4-resnet残差学习与退化问题/)

### Transformer、ViT 与 CLIP
从 self-attention 出发复现一个最小 encoder-only Transformer 并验证 PE 必要性，把同一套 encoder 搬到视觉任务上做 ViT，再把两塔拼到同一个共享空间里做 CLIP，完成从单模态到多模态对齐的过渡。

- [**1. Transformer** — 从注意力到编码器](/notes/笔记-机器学习-transformer与序列建模1-从注意力到编码器/)
- [**2. ViT** — 从图像分块到注意力分类](/notes/笔记-机器学习-vit与视觉transformer1-从图像分块到注意力分类/)
- [**3. CLIP** — 从对比学习到图文共享空间](/notes/笔记-机器学习-clip与多模态对齐1-从对比学习到图文共享空间/)

</details>

<details>
<summary><strong>底层架构 / AI Infra</strong></summary>

从 GPU 内存层次、IO-aware 算法和推理系统出发，记录 AI infra 里那些真正卡住吞吐、延迟和显存的底层机制。

- [**1. FlashAttention v1** — IO 感知注意力与 tiling-softmax](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/)
- [**2. Online Softmax** — 原始推导与 top-K fusion](/notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/)

</details>

<details>
<summary><strong>数学</strong></summary>

- [**复变 1** — 复变函数](/notes/笔记-数学1-复变函数)
- [**实分析 1** — 收敛、唯一性、有界性与柯西列](/notes/笔记-实分析1-收敛、唯一性、有界性与柯西列)
- [**实分析 2** — 确界公理、单调收敛与完备性等价链](/notes/笔记-实分析2-确界公理、单调收敛与完备性等价链)
- [**实分析 3** — 度量空间、赋范空间、Hilbert 空间与傅里叶基础](/notes/笔记-实分析3-度量赋范hilbert与傅里叶)

</details>

<details>
<summary><strong>线性代数</strong></summary>

- [**Part 0** — 秩、零空间与 SVD 的直觉](/notes/笔记-线性代数0-秩、零空间与svd)
- [**Part 1** — 奇异矩阵与参数辨识性](/notes/笔记-线性代数1-奇异矩阵与参数辨识性)
- [**Part 2** — 正则化与稳定反演](/notes/笔记-线性代数2-正则化与稳定反演)

</details>

<details>
<summary><strong>线性系统</strong></summary>

- [**第 1 篇** — 傅里叶变换](/notes/笔记-线性系统1-傅里叶变换)
- [**第 2 篇** — 拉普拉斯变换](/notes/笔记-线性系统2-拉普拉斯变换及其应用)
- [**第 3 篇** — RLC 电路：微分方程与拉普拉斯方法](/notes/笔记-线性系统3-拉普拉斯变换在二阶偏微分方程的应用)

</details>

<details>
<summary><strong>量子力学</strong></summary>

- [**第 1 篇** — 从薛定谔到波函数](/notes/笔记-量子力学1-薛定谔公式)
- [**第 2 篇** — 电子如何分布](/notes/笔记-量子力学2-费米子)

</details>

<details>
<summary><strong>计算科学与高可靠系统设计</strong></summary>

- [**第 1 篇** — 问题背景与空间场构造](/notes/笔记-计算科学与高可靠系统设计1-问题背景与空间场构造)
- [**第 2 篇** — 从地形到时间演化](/notes/笔记-计算科学与高可靠系统设计2-从地形到时间演化)
- [**第 3 篇** — 从完整轨迹到观测数据](/notes/笔记-计算科学与高可靠系统设计3-从完整轨迹到观测数据)
- [**第 4 篇** — 从观测数据到参数反演](/notes/笔记-计算科学与高可靠系统设计4-从观测数据到参数反演)
- [**第 5 篇** — 有限差分梯度与梯度下降](/notes/笔记-计算科学与高可靠系统设计5-有限差分与梯度下降)
- [**第 6 篇** — 反演结果分析与参数可信度](/notes/笔记-计算科学与高可靠系统设计6-反演结果分析与参数可信度)
- [**第 7 篇** — 从有限差分梯度下降到 L-BFGS 与对数参数化](/notes/笔记-计算科学与高可靠系统设计7-从有限差分梯度下降到l-bfgs与对数参数化)
- [**第 8 篇** — 正则化、先验与稳定反演](/notes/笔记-计算科学与高可靠系统设计8-正则化、先验与稳定反演)
- [**第 9 篇** — 平滑项、先验项与正则化强度](/notes/笔记-计算科学与高可靠系统设计9-平滑项、先验项与正则化强度)
- [**第 10 篇** — 从空间场到稳定反演的完整链条总结](/notes/笔记-计算科学与高可靠系统设计10-从空间场到稳定反演的完整链条总结)

</details>

<details>
<summary><strong>岩体力学</strong></summary>

- [**第 1 篇** — 矿物组成、结构特征与结构面基础](/notes/笔记-岩体力学1-基础知识)

</details>

<details>
<summary><strong>计划中</strong></summary>

- GAN
- Diffusion
- 周易

</details>
