---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: '误差分析：从近似到可靠计算'
summary: "一条按研究对象组织的长期主线：追踪误差的定义、来源、传播、估计、控制与成本权衡。"
description: "以具体数学对象和计算系统为入口，建立可推导、可实验、可复现的误差分析方法。"
tags: ["Error Analysis", "Numerical Analysis", "Reliability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 1
---

误差不只是“答案差了多少”。一个完整的误差问题需要问到：

\[
\text{误差怎样定义}
\rightarrow
\text{从哪里产生}
\rightarrow
\text{如何传播}
\rightarrow
\text{怎样估计}
\rightarrow
\text{如何控制}
\rightarrow
\text{精度与成本怎样权衡}.
\]

这个系列从一个个具体 topic 进入。每个 topic 都重复同一套研究循环：

1. 确定 reference、approximation 与 metric；
2. 分离 truncation、input、roundoff、measurement 等误差源；
3. 推导表示、渐近阶或有效上界；
4. 检查误差经过计算链后怎样被放大、压缩或抵消；
5. 找到可调参数，并建立精度—成本模型；
6. 用可复现实验检验推导，同时记录理论没有覆盖的残余。

## Topic 地图

### Topic 1：Taylor 展开

[Taylor 展开：从余项到误差控制](/notes/systems/error-analysis/taylor-expansion/) 已完成第一轮。从一个可以精确定义的余项函数出发，依次经过：

\[
\text{余项}
\rightarrow
\text{表示}
\rightarrow
\text{阶与界}
\rightarrow
\text{界的质量}
\rightarrow
\text{误差传播}
\rightarrow
\text{控制与最优步长}.
\]

这是整条主线的基础样例：公式足够清楚，又能自然进入 floating-point、cancellation、finite difference、MSE 和 Monte Carlo。

### Topic 2：Softmax

Softmax 第一轮已归档为 [Softmax：从方向性误差到有限精度](/notes/systems/error-analysis/softmax/)。这一轮从二维线性映射的方向性误差进入 Jacobian、singular values 与概率单纯形，再沿实际浮点计算图追踪 subtract-max、exp、normalizer 求和、除法和输入量化。GPU reduction、mixed precision 与 blockwise 实现留到后续系统阶段；相关算法与复现也汇入 [IO-Aware Attention 主题档案](/notes/topics/io-aware-attention/)。

## 项目与证据

推导、源码、测试、CSV、metadata 和实验图保存在 [Error Atlas](https://github.com/r1skers/error-atlas)。博客负责把一轮研究压缩成可阅读的论证链；仓库负责保留可以重新运行和审查的证据。

---

**进入第一个 Topic：** [Taylor 展开：从余项到误差控制](/notes/systems/error-analysis/taylor-expansion/)
