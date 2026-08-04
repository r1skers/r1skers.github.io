---
title: "主题档案：IO-Aware Attention"
description: "把 Softmax 的数学结构、IO-aware 算法、分块复现和近似误差放进同一条阅读路径。"
summary: "从 Online Softmax 到 FlashAttention，再到数值误差与 sparse-attention 误差的主题档案。"
categories: ["Notes"]
tags: ["AI Infra", "Attention", "Softmax"]
series: ["IO-Aware Attention"]
note_kind: "topic-index"
---

这个档案围绕一个核心问题组织：**怎样在不物化完整 attention matrix 的情况下，高效且可信地计算注意力？**

## 1. 系统问题

[FlashAttention v1 与 tiling-softmax](/notes/systems/ai-infra/note-systems-io-attn-1-flashattention/) 从 GPU 内存层次出发，把 attention 的主要瓶颈重新表述为 HBM 数据搬运，并说明 tiling、online normalization 与 recompute 怎样组成完整算法。

## 2. 算法来源

[Online Softmax 原始推导](/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/) 比较 naive、safe 与 online 三种计算顺序，推导 running max 与 normalizer 的递推关系。

## 3. 复现与验证

[复现并验证 online softmax 与 tiled attention](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/) 用 naive 结果作为 reference，通过 block-size invariance 和分量 invariant 验证实现。这一页是本主题的实验章节，而不是一条独立研究主线。

## 4. 两条误差分支

- [误差分析主线](/notes/systems/error-analysis/) 的 Softmax Topic 研究 exp、累加、除法、cast 和计算顺序造成的 operation-level 数值误差。
- [Artifact 6：Value-Aware Sparse Attention](/artifacts/06-value-aware-sparse-attention/) 研究稀疏剪枝造成的 attention output approximation error。

二者需要严格区分：前者问“同一个数学 Softmax 被浮点实现后偏了多少”，后者问“主动删掉一部分 attention 后，输出改变了多少”。
