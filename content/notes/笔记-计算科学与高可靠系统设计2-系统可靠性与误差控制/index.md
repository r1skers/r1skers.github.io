---
date: '2026-02-19T00:00:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第2部分：系统可靠性与误差控制（一致性、收敛阶与理查德森外推） / Computational Science & High-Reliability Systems Design Part 2: Reliability and Error Control (Consistency, Convergence Order, and Richardson Extrapolation)'
summary: "整理数值误差分析主线：一致性、离散化误差、收敛阶估计与理查德森外推。 / Organize the numerical-error analysis pipeline: consistency, discretization error, convergence-order estimation, and Richardson extrapolation."
description: "Part 2 note on reliability-oriented error analysis and Richardson extrapolation."
tags: ["PDE", "Error Analysis", "Consistency", "Order of Accuracy", "Richardson Extrapolation", "Numerical Methods", "Reliability", "UQ"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学2-误差分析与理查德森外推/
---

# 误差分析：从一致性到理查德森外推
# Error Analysis: From Consistency to Richardson Extrapolation

这篇是“计算科学与高可靠系统设计”Part 2，聚焦三件事：离散误差从哪里来、收敛阶怎么测、如何用 Richardson 在不大幅加算力的前提下提升结果质量。  
This is Part 2 of “Computational Science & High-Reliability Systems Design,” focused on three questions: where discretization error comes from, how to measure convergence order, and how Richardson extrapolation improves accuracy without brute-force refinement.

---

## 1. 泰勒展开与二阶差分主导误差
## 1. Taylor Expansion and Leading Error of Central Difference

在网格点 $x_i$ 附近：
Around grid point $x_i$:

$$
h(x_i+\Delta x)=h(x_i)+h'(x_i)\Delta x+\frac{h''(x_i)}{2}\Delta x^2+\frac{h^{(3)}(x_i)}{6}\Delta x^3+\cdots
$$

$$
h(x_i-\Delta x)=h(x_i)-h'(x_i)\Delta x+\frac{h''(x_i)}{2}\Delta x^2-\frac{h^{(3)}(x_i)}{6}\Delta x^3+\cdots
$$

两式相加后，一阶项抵消：  
Adding the two expansions cancels first-order terms:

$$
h(x_i+\Delta x)+h(x_i-\Delta x)=2h(x_i)+h''(x_i)\Delta x^2+\frac{h^{(4)}(x_i)}{12}\Delta x^4+\cdots
$$

整理得经典中心差分：  
Rearranging gives the classical central difference:

$$
\frac{h_{i+1}-2h_i+h_{i-1}}{\Delta x^2}
=h''(x_i)+\frac{h^{(4)}(x_i)}{12}\Delta x^2+\mathcal{O}(\Delta x^4)
$$

所以主导截断误差是 $\mathcal{O}(\Delta x^2)$。  
So the leading truncation error is $\mathcal{O}(\Delta x^2)$, which is the local basis of second-order accuracy.

---

## 2. 五点差分空间离散误差
## 2. Five-Point Spatial Discretization Error

二维五点拉普拉斯格式（$\Delta x=\Delta y$）是：  
The 2D five-point Laplacian stencil (with $\Delta x=\Delta y$) is:

$$
\nabla_h^2 h_{i,j}
=\frac{h_{i+1,j}+h_{i-1,j}+h_{i,j+1}+h_{i,j-1}-4h_{i,j}}{\Delta x^2}
$$

对平滑函数做泰勒展开可得其空间离散误差同样是二阶：  
Taylor expansion on smooth functions shows its spatial discretization error is also second-order:

$$
\nabla_h^2 h=\nabla^2 h+\mathcal{O}(\Delta x^2)
$$

也就是“空间离散误差 $\mathcal{O}(\Delta^2)$”。  
That is the standard statement: spatial discretization error is $\mathcal{O}(\Delta^2)$.

---

## 3. 一致性、收敛与收敛阶
## 3. Consistency, Convergence, and Order

一致性的定义可以写成：  
Consistency can be written as:

$$
D_{\Delta x}h-h''=e(\Delta x)\to 0\quad(\Delta x\to 0)
$$

这表示离散算子在网格细化时逼近连续算子。  
It states that the discrete operator approaches the continuous operator as the mesh is refined.

若全局误差满足  
If the global error satisfies

$$
\|e_h\|\le C h^p
$$

则称方法具有 $p$ 阶收敛。  
the method is said to be $p$-th order convergent.

对二阶格式（$p=2$），网格步长减半时误差近似降为原来的 $1/4$：  
For a second-order method ($p=2$), halving mesh size reduces error to about one quarter:

$$
e_{h/2}\approx \frac{1}{4}e_h\quad (p=2)
$$

更一般地，如果有参考真解 $u^\ast$，可用两层网格估计观测收敛阶：  
More generally, if a reference truth $u^\ast$ is available, observed order from two grids is:

$$
p_{\mathrm{obs}}
\approx
\log_2\!\left(
\frac{\|u_h-u^\ast\|}{\|u_{h/2}-u^\ast\|}
\right)
$$

若真解未知，工程上常用三层网格差值近似：  
If exact truth is unavailable, engineering practice uses three-grid differences:

$$
p_{\mathrm{obs}}
\approx
\log_2\!\left(
\frac{\|u_{2h}-u_h\|}{\|u_h-u_{h/2}\|}
\right)
$$

其中范数可选 $L_1/L_2/L_\infty$，但同一组对比必须保持一致。  
The norm can be $L_1/L_2/L_\infty$, but it must stay consistent across comparisons.

---

## 4. 理查德森外推
## 4. Richardson Extrapolation

设某个标量结果满足：  
Suppose a scalar result satisfies:

$$
S(h)=S^\ast+C h^p+\mathcal{O}(h^{p+1})
$$

消去主误差项后可得 Richardson 外推：  
Canceling the leading error term gives Richardson extrapolation:

$$
S^\ast
\approx
\frac{2^p S(h/2)-S(h)}{2^p-1}
$$

二阶情形（$p=2$）可写成：  
For second-order schemes ($p=2$), this becomes:

$$
S^\ast\approx \frac{4S(h/2)-S(h)}{3}
$$

对应逻辑链是“步长减半 -> 主误差按 $2^p$ 缩小 -> 组合两层结果抵消主误差”。  
The logic chain is: halve mesh size -> leading error shrinks by $2^p$ -> combine two levels to cancel the leading error.

---

## 5. 小结
## 5. Summary

- 一致性回答“离散算子是否逼近连续算子”。  
- Consistency answers whether the discrete operator approaches the continuous operator.
- 收敛阶回答“网格加密后误差下降有多快”。  
- Convergence order quantifies how fast error decays under refinement.
- 二阶方法通常满足“步长减半，误差约四分之一”。  
- Second-order methods typically follow “halve mesh, quarter error”.
- Richardson 通过组合两层网格结果，抵消主导误差项并提高精度。  
- Richardson improves accuracy by canceling the leading error term with two-grid combinations.
