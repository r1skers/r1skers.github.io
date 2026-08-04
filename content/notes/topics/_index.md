---
title: "主题档案"
description: "按研究对象组织的跨学科阅读入口：同一篇基础笔记可以被多个主题复用。"
summary: "连接基础知识、复现、实验与研究结论的主题目录。"
categories: ["Notes"]
tags: []
note_kind: "topic-index"
---

主题档案不改变文章原本的学科归属，而是围绕一个对象重新编排阅读顺序。基础知识仍然只有一个 canonical home；主题页通过链接把理论、实现、实验和 Artifact 组织成完整问题链。

## 当前档案

- [**IO-Aware Attention**](/notes/topics/io-aware-attention/) — 从 Softmax、Online Softmax 到 FlashAttention、分块复现与稀疏近似误差。
- [**Variational Autoencoder**](/notes/topics/variational-autoencoders/) — 把 ELBO、重参数化、最小复现和 CNN-VAE 放回同一个生成模型闭环。
- [**表征几何**](/notes/topics/representation-geometry/) — 从 PCA、whitening、聚类与评估走到 BERT 多视角表征探针。
- [**反问题与可靠计算**](/notes/topics/inverse-modeling/) — 从 forward model、观测与参数反演走到正则化、可信度和工程验证。

## 与研究主线的区别

主题档案回答“围绕这个对象需要读什么”；[误差分析主线](/notes/systems/error-analysis/)回答“用什么统一问题意识研究不同对象”。因此 Softmax 可以同时属于 IO-Aware Attention 档案，也成为误差分析的 Topic 2。
