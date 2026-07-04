---
date: '2026-07-02T13:00:00+09:00'
draft: false
title: "[Artifact-6] Value-Aware Sparse Attention：从熵剪枝到误差感知剪枝"
summary: "以 top-k 稀疏注意力的输出误差为目标，从精确分解 ‖o−õ‖=δ‖μ_R−μ_S‖ 出发，系统对照 entropy / dropped-mass / value-geometry 三类剪枝信号。发现误差的主导因子随注意力尖锐程度发生 regime 切换，而 value 信息的增量价值恰好集中在高熵 regime。"
description: "Artifact-6 是一个 umbrella artifact：以稀疏注意力剪枝误差分析为对象，从误差分解恒等式出发建立信号层级（fixed-k → entropy → dropped-mass → restricted value-aware oracle），每个阶段独立成 child artifact。"
tags:
  - "Artifact"
  - "Sparse Attention"
  - "Efficient Attention"
  - "Error Analysis"
categories:
  - "Artifacts"
weight: 60
math: true
---

这是一个 umbrella artifact，对应 child artifacts 见下方。项目本体在 GitHub 仓库 [value-aware-sparse-attention](https://github.com/r1skers/value-aware-sparse-attention)。

## 核心问题

如果剪枝的真正目标是**控制输出误差**，那么应该用什么信号来指导 sparse attention 的剪枝决策？

出发点是一个精确恒等式：对单个 attention 行，保留集 $S$、剪掉集 $R$、被剪概率质量 $\delta=\sum_{i\in R}p_i$，重归一化后的剪枝输出满足

$$
\|o-\tilde o\| = \delta\,\|\mu_R-\mu_S\|
$$

误差恰好等于**被剪概率质量 × 保留/剪掉两部分的 value 质心距离**。这不是近似或上界，是逐行到浮点精度成立的等式。它立刻给出一个结构性论断：误差有两个旋钮——$\delta$ 只需要 Q, K 就能算，$\|\mu_R-\mu_S\|$ 必须摸 V；而常被用作剪枝信号的 entropy 只间接影响 $\delta$，对 value 几何一无所知。

所以核心问题可以拆成三问：

- 剪掉了多少概率质量 $\delta$？
- 剪掉部分和保留部分的 value 质心差多远？
- 有没有**便宜的**办法估计这个质心位移？

**定位声明**：这是一个 research-style implementation 项目，不是原创理论。value-aware attention、top-k 误差分解、entropy pruning、adaptive budget 均有已有文献（*Value-aware Approximate Attention*；*A Mathematical Theory of Top-k Sparse Attention via Total Variation Distance*, 2025；Rényi entropy patch pruning, 2026；Twilight / SSA, 2026）。本系列的价值在于独立推导、系统对照和诚实的信号层级测量，已有工作作为引用而非对手。

## 内容目录

- **6.1 [公式推导与现象观察](/artifacts/06-1-formulas-and-phenomenon-observation/)** —— 分解恒等式的推导与浮点级验证；entropy 基线为何弱；误差主导因子随 q_scale 的 regime 切换；等预算三方对比（fixed / dropped-mass / restricted oracle）；top-k-by-p 不是集合最优的 one-swap 观察。
- **6.2 [Cheap Value Proxies：在切进 BERT 前](/artifacts/06-2-cheap-value-proxies/)** —— 从 restricted oracle 的成本问题出发，设计 UTC（Uniform-Tail Centroid）作为便宜 value proxy；区分 predictor correlation 与 allocation quality；在 mixed-regime 合成台架上比较 mass、UTC、routing-only hybrid 与 budget-delegated hybrid。
- **6.3 [真实 Attention：从 BERT 打脸到 GPT-2 迁移](/artifacts/06-3-real-attention-cross-model/)** —— 把 cheap value-aware scorer 切入真实 attention：BERT 暴露 objective / denominator / protocol 问题，推动 UTC-rel-hat 与 exact-budget 协议；GPT-2 causal attention 零修改迁移，检验 rel-hat 是否只是 BERT-only trick。
- **6.4 [Metric Boundary：局部误差不是行为 Oracle](/artifacts/06-4-metric-boundary/)** —— 把局部 sparse-attention error 继续推过 $W_O$、GPT-2 next-token KL 与 whole-layer intervention；确认 rel-hat 的局部优势能迁移到 $W_O$ 投影层面，但 local restricted oracle 不是 behavioral oracle，边界随深度靠近读出端而加深。

## 发现

目前实验建立起一个清晰的信号层级：

| 方法 | 用到的信息 | 表现 |
|---|---|---|
| fixed top-k | 无 | 基线 |
| entropy-adaptive | Q, K（分布形状） | 弱，等预算下与 fixed 无异 |
| dropped-mass adaptive | Q, K（直接控制 $\delta$） | **regime 依赖**：尖锐区接近 oracle，高熵区无效甚至有害 |
| restricted value-aware oracle | Q, K, V（真实误差选 k） | 层级上界（仅限 top-k-by-p 家族内） |

统一发现可以压成一句话：

> **Value 信息的增量价值不是常数，它精确地集中在高熵 regime。** attention 越尖锐，$\delta$ 越接近误差本身，Q,K-only 信号越够用；attention 越接近均匀，被剪区域质量越大，它的 value 质心在哪就越是唯一有用的信号。

这句话有两组方法独立的实验共同支撑（相关性分析 + 等预算分配对比），并且可以从恒等式本身读出直觉：$\delta\cdot\|\mu_R-\mu_S\|$ 是把 value 位移按被剪区域的概率质量**加权**——质量趋零时，多大的位移都搬不动输出。

语言纪律（贯穿全系列）：这里的 oracle 是 **restricted oracle**——只在"按 p 排序取前 k"的家族内对每行的 k 最优，不是全局最优剪枝集合；one-swap 实验已经证明后者更强。当前目标是逼近 value-aware oracle，而不是声称找到全局最优。
