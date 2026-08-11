---
date: '2026-08-04T00:10:00+09:00'
draft: false
title: 'Softmax：从方向性误差到有限精度'
summary: "从 Jacobian 的方向性传播出发，走到稳定求值、浮点误差预算、求和停滞机制与首个 consumer-specific 故障处置案例。"
description: "用 Softmax 连接问题条件性、算法稳定性、输入表示误差、求和停滞和 consumer-specific 处置。"
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
- 发现一个求和故障后，为什么不能直接宣布 tree、Kahan 或更高精度更好？

这一轮不是从 Softmax 公式直接开始，而是先回到最小的二维线性映射，建立
“误差有方向”这一事实，再逐步进入 Jacobian、singular values、概率单纯形、
有限精度计算图、求和停滞与 consumer-specific 处置。

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

### 5. 求和顺序怎样吞掉尾部小量

[求和顺序怎样吞掉尾部小量](/notes/systems/error-analysis/softmax/note-error-softmax-5-summation-stagnation/)
冻结 Sum stage 实际收到的 FP32 numerators，先用 $q=(1,u,u)$ 定位半 ULP
停滞，再把尾项扩展为可测的 stress case。stored-input reference 是 $17/16$，
head-first sequential FP32 却返回 $1$；fixed pairwise、Kahan 与 FP64
accumulator 在这个注册案例上恢复 reference。随后用 midpoint 两侧的 binary 与
decimal controls 验证 ties-to-even，分开 input quantization 与 reduction error，
并给出 fixed pairwise 不能 correctly round 的受控反例。

### 6. 从观测走到 consumer-specific 处置

[从观测到 consumer-specific 处置](/notes/systems/error-analysis/softmax/note-error-softmax-6-consumer-specific-mitigation/)
把 raw observation、summary、consumer policy 和 assessment 分开，避免把
repeatability 当作 accuracy，也避免从一个 failure 名称直接跳到固定处置。
同一个 policy-free summary 分别接受 consumer tolerance 与 correct-rounding
policy，展示 tolerance pass 不代表 correctly rounded。最后按 input、exp、sum
和 division stage 建立
failure—consumer—metric—tolerance—mitigation 决策链。

## 边界

这六篇会反复区分三类问题：

- **问题条件性**：精确 Softmax 怎样响应输入扰动，由 Jacobian 和它的谱描述；
- **求值算法稳定性**：具体浮点路径额外引入多少误差，由 exp、求和和除法的
  误差模型描述；
- **输入表示误差**：logits 在进入 Softmax 前是否已经被低精度量化改变。

三者可以出现在同一条计算链里，却不能用同一句“Softmax 数值不稳定”概括。

本轮已有一个可复现的 FP32 输入量化实验、首个版本化求和 stress artifact、
midpoint boundary controls，以及第一条 consumer-specific 故障处置链。目标硬件
上的 GPU reduction graph 与 accuracy-cost frontier 尚未测量。

推导、源码、测试、CSV 与 metadata 保存在
[Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax)。

---

**开始阅读：** [Softmax 1：误差为什么有方向](/notes/systems/error-analysis/softmax/note-error-softmax-1-directional-jacobian/)
