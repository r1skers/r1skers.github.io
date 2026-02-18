---
date: '2026-02-18T00:00:00+09:00'
draft: false
title: '应用数学：PDE笔记1——五点差分、CFL约束与高斯公式 / Applied Mathematics: PDE Note 1 - Five-Point Stencil, CFL Constraint, and Gauss Formula'
summary: "今天的PDE学习记录：五点差分公式、CFL稳定性约束与高斯公式在离散中的意义。 / Study log for PDE topics: five-point stencil, CFL stability constraint, and the role of Gauss formula in discretization."
description: "A compact study note for PDE discretization fundamentals."
tags: ["PDE", "Five-Point Stencil", "CFL", "Gauss Formula", "Numerical Methods"]
---

## 学习范围 / Scope

- 五点差分公式（二维离散拉普拉斯算子）
- CFL 约束（显式格式稳定性条件）
- 高斯公式（守恒型离散与通量表达）

## 1. 五点差分公式 / Five-Point Stencil

以二维网格上的拉普拉斯算子为例：

$$
\nabla^2 u \approx \frac{u_{i+1,j} + u_{i-1,j} + u_{i,j+1} + u_{i,j-1} - 4u_{i,j}}{h^2}
$$

它是从二阶中心差分在两个方向叠加得到的标准离散形式。

## 2. CFL 约束 / CFL Constraint

对显式时间推进格式，时间步长必须满足稳定性条件。  
核心直觉：一个时间步内，数值信息传播不能跨越过多网格单元。

一般写成：

$$
\Delta t \le C \cdot \frac{h}{\text{wave speed}}
$$

不同方程和差分格式下，常数形式会变化，但思想一致。

## 3. 高斯公式与守恒离散 / Gauss Formula and Conservative Discretization

高斯公式把体积分转换为边界通量积分：

$$
\int_{\Omega} \nabla \cdot \mathbf{F}\,d\Omega
=
\int_{\partial\Omega} \mathbf{F}\cdot\mathbf{n}\,dS
$$

在数值离散中，这为“按控制体积做通量守恒”提供了直接路径，是有限体积法和守恒型格式的重要基础。

## 4. 小结 / Summary

- 五点差分给出了空间二阶导数的基础离散结构。
- CFL 约束控制显式格式的稳定时间步长。
- 高斯公式把守恒律和通量离散连接起来。

下一步可继续写：

- 热方程/波动方程的具体离散格式
- 稳定性与误差阶的简单对比