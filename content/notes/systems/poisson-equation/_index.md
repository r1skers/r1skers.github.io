---
date: '2026-09-18T12:00:00+09:00'
draft: false
title: '泊松方程：从变分结构到 CUDA'
summary: '从一维能量泛函走向离散方程、迭代求解与 CPU/CUDA 实现，再回到原方程检查计算结果。'
description: '泊松方程学习主线：连续变分、离散能量、差分与迭代、CPU/CUDA 实现，以及误差和性能验证。'
tags: ["Optimization", "Numerical Methods"]
categories: ["Notes"]
series: ["Poisson Equation"]
note_kind: "research"
weight: 1
---

这个项目围绕同一个泊松方程问题，追问连续方程怎样成为可以检查的计算结果。先用一维问题理解变分结构，再进入离散矩阵、二维网格和 CPU/CUDA 实现，最后分别检查离散、迭代与浮点计算带来的影响。

$$
\text{能量与弱形式}
\longrightarrow
\text{离散能量与差分}
\longrightarrow
\text{迭代及 CPU/CUDA}
\longrightarrow
\text{误差与性能验证}.
$$

## 当前进度

- **M1 · 一维变分：** 已在提示与纠错下完成光滑版本的关键推导，并发布中英文阶段文章：[一维泊松方程：从能量泛函到唯一最小点](/notes/systems/poisson-equation/variation-unique-minimum/)。
- **M2 · 一维离散结构：** 尚未开始。下一步要连接连续能量、离散能量与差分矩阵。
- **M3–M5 · 二维、CPU/CUDA 与验证：** 尚未开始；目前没有实现或实验数据。

这是一条学习与复现路线，阶段性内容只报告已经推导或实际检查过的结果。误差分析仍是末尾验证的重要部分，但不是整条主线的名称。

此前的 [误差分析：从近似到可靠计算](/notes/systems/error-analysis/) 专题及其 Taylor、Softmax 材料继续保留。
