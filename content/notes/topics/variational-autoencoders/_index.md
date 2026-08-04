---
title: "主题档案：Variational Autoencoder"
description: "把 VAE 的概率建模、ELBO 推导、最小复现和卷积扩展组织成一个闭环。"
summary: "从隐变量模型与变分下界到 MLP-VAE、CNN-VAE 的主题阅读路径。"
categories: ["Notes"]
tags: ["Machine Learning", "Generative Models", "VAE"]
series: ["Variational Autoencoders"]
note_kind: "topic-index"
---

VAE 现有三篇内容不是三条平行主题，而是同一个问题的三个阶段：先建立目标函数，再把公式变成代码，最后改变图像建模结构。

## 1. 原理

[VAE 的基本思想与 ELBO 推导](/notes/ml/generative-models/note-ml-gen-1-vae-elbo/) 从不可直接计算的边缘似然出发，引入近似后验、ELBO 与 reparameterization trick。

概率论侧的补充入口是 [Likelihood、MLE、MAP、区间、检验与 EM](/notes/math/probability/note-prob-5-statistical-inference-em/)，其中给出隐变量模型、ELBO 恒等式和 EM 的共同接口。

## 2. 最小闭环

[VAE 的最小复现](/notes/ml/generative-models/note-ml-gen-2-vae-minimal/) 把 encoder、重参数化、decoder 和负 ELBO 逐项映射到 PyTorch，并通过 latent dimension 与二维隐空间实验检查模型行为。

## 3. 结构扩展

[CNN-VAE：从 MLP 到卷积结构](/notes/ml/generative-models/note-ml-gen-3-cnn-vae/) 保持概率目标不变，只替换 encoder/decoder 的归纳偏置，观察图像结构如何改变生成结果。

后续重写时，原理与最小复现适合合并为一个完整章节；CNN-VAE 保留为独立扩展。当前先用本页把三篇收束起来，不改变旧 URL。
