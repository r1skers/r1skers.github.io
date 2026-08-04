---
date: '2026-08-04T00:10:00+09:00'
draft: false
title: 'Softmax：从方向性误差到有限精度'
summary: "从 Jacobian 的方向性传播出发，走到概率单纯形、稳定求值、输入量化和逐操作浮点误差预算。"
description: "用 Softmax 完成一次从问题条件性到算法稳定性的误差分析，并追踪 exp、求和与除法怎样改变概率。"
tags: ["Error Analysis", "Numerical Analysis", "Softmax", "Floating Point"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "topic-index"
weight: 2
---

Softmax 常被压缩成一个公式：

\[
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
\]

但如果从误差分析进入，这个公式会迅速分裂成几类不同的问题：

- 同样大小的 logits 扰动，为什么沿不同方向产生不同影响？
- 为什么所有 logits 一起平移时，概率完全不变？
- subtract-max 为什么能避免 overflow，却救不回已经丢失的输入差值？
- exp、normalizer 求和和最终除法，各自怎样进入概率误差？
- 为什么概率和恰好为 $1$，仍不能证明每个分量都算对了？

这一轮不是从 Softmax 公式直接开始，而是先回到最小的二维线性映射，建立
“误差有方向”这一事实，再逐步进入 Jacobian、singular values、概率单纯形
和有限精度计算图。

## 本轮路线

### 1. 误差为什么有方向

[从二维线性映射到 Jacobian 与 singular values](/notes/systems/error-analysis/softmax/note-error-softmax-1-directional-jacobian/)
从 $A=\operatorname{diag}(3,0.5)$ 出发，区分 operator norm、完整奇异值信息
和奇异方向，再用一个带 $h^2$ remainder 的非线性例子说明 Jacobian 只是
位置相关的局部传播器。

### 2. Softmax 在哪些方向上敏感

[Softmax Jacobian：概率单纯形上的方向与谱](/notes/systems/error-analysis/softmax/note-error-softmax-2-geometry-spectrum/)
推导

\[
J_s=\operatorname{diag}(p)-pp^T,
\]

并把矩阵乘法解释为“减去概率加权平均，再按各分量概率缩放”。三分类例子
展示均匀点的各向同性、非均匀点的方向分裂，以及局部 $3/8$ 与全局
$1/2$ 上界的区别。

### 3. 数学等价为什么不等于数值稳定

[从 subtract-max 到 FP32 输入量化](/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/)
比较 naive Softmax、subtract-max、log-sum-exp 与 fused cross-entropy，随后
用 $2^{24}$ 附近的 FP32 实验分离“Softmax 算错了”和“算法收到的输入已经
变了”这两种完全不同的误差来源。

### 4. 把每一步舍入写进预算

[exp、求和与除法怎样进入最终概率](/notes/systems/error-analysis/softmax/note-error-softmax-4-floating-point-budget/)
从

\[
\widehat q_i=q_i(1+\epsilon_i)
\]

开始，得到 exp、求和与除法的一阶误差预算，解释共同误差为什么会被
normalization 消掉、哪些误差会使结果离开概率单纯形，以及为什么下溢会让
小相对误差模型突然失效。

## 这一轮真正建立的边界

这四篇会反复区分三类问题：

- **问题条件性**：精确 Softmax 怎样响应输入扰动，由 Jacobian 和它的谱描述；
- **求值算法稳定性**：具体浮点路径额外引入多少误差，由 exp、求和和除法的
  误差模型描述；
- **输入表示误差**：logits 在进入 Softmax 前是否已经被低精度量化改变。

三者可以出现在同一条计算链里，却不能用同一句“Softmax 数值不稳定”概括。

本轮已经有一个可复现的 FP32 输入量化实验。顺序求和与树形求和的误差差异
目前只有理论预测，尚未注册为实验事实；GPU reduction、mixed precision、
fast exp 与 kernel fusion 也留到后续实现阶段。

推导、源码、测试、CSV 与 metadata 保存在
[Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax)。

---

**开始阅读：** [Softmax 1：误差为什么有方向](/notes/systems/error-analysis/softmax/note-error-softmax-1-directional-jacobian/)
