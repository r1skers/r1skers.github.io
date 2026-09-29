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
- **M2 · 一维离散结构：** 已完成中心差分、边界组装、对称正定性与离散能量的引导推导，并发布中英文阶段文章：[一维泊松方程：从中心差分到离散能量](/notes/systems/poisson-equation/centered-difference-discrete-energy/)。
- **实验检查点 · 正弦模态：** 已从方程的算子侧与源项侧梳理正弦模态，并用三档网格验证固定模态的二阶幅度偏差；中文文章：[一维泊松方程的两边：正弦模态与差分误差](/notes/systems/poisson-equation/sine-mode-convergence/)。
- **附录 A1 · 严谨性补遗：** 回看函数空间、测试函数稠密性、界面条件、存在性边界与有限差分/有限元的受限对应；中文初稿正在审计。
- **M3 · 二维与 CPU：** 五点格式、Jacobi 收敛分析、CPU 双缓冲与独立离散参考解校验已经完成；阶段文章待整理。
- **M4–M5 · CUDA 与最终验证：** 尚未开始。

这是一条学习与复现路线，阶段性内容只报告已经推导或实际检查过的结果。误差分析仍是末尾验证的重要部分，但不是整条主线的名称。

此前的 [误差分析：从近似到可靠计算](/notes/systems/error-analysis/) 专题及其 Taylor、Softmax 材料继续保留。
