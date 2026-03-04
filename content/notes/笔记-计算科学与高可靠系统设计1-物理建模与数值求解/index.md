---
date: '2026-02-18T00:00:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第1部分：连续到离散的建模基础（离散拉普拉斯与矩阵表示）'
summary: "聚焦把连续扩散模型转成机器可计算形式：网格化、五点差分与矩阵化。"
description: "Part 1 note on spatial discretization and discrete Laplacian matrix form."
tags: ["PDE", "Spatial Discretization", "Discrete Laplacian", "Matrix Form", "Numerical Methods", "Physics Modeling"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学1-偏微分方程/
---

# Part 1：连续模型到离散算子

这篇只做一件事：把连续扩散方程中的空间项写成机器可计算的离散算子。  

主线是：连续 PDE -> 空间网格化 -> 五点离散拉普拉斯 -> 矩阵表示。  

为避免混淆，以下内容不在本篇展开：  

- 显式时间推进与 CFL 稳定性（放在 Part 2）；  
- 收敛阶与理查德森外推（放在后续误差与可靠性章节）。  

从扩散型 PDE 出发：

$$
\frac{\partial h}{\partial t}=\kappa\nabla^2 h
$$

其中 $h$ 是场变量，$\kappa$ 是扩散系数。Part 1 关注的是空间算子 $\nabla^2$ 的离散化。  

---

## 1. 连续视角与计算机视角

连续数学里，$\nabla^2 h$ 表示局部曲率；曲率大，扩散驱动力就大。  

但计算机里没有“无限小邻域”，只有网格点和有限邻居。  

对应的可计算直觉是：

- 如果某点高于邻居平均，它会向周围扩散；  
- 如果某点低于邻居平均，它会被周围抬升。  

这就是“连续曲率”到“离散局部偏差”的映射。  

![Rough slope in reality vs smooth slope in coarse grid](continuous-vs-grid.svg)
![Continuous curvature vs piecewise local approximation](curvature-vs-piecewise-flat.svg)

---

## 2. 一维二阶差分到二维五点拉普拉斯

先看 1D 二阶导数中心差分：

$$
\frac{\partial^2 h}{\partial x^2}
\approx
\frac{h(x+\Delta x)-2h(x)+h(x-\Delta x)}{\Delta x^2}
$$

在 2D 下，若允许 $\Delta x\neq\Delta y$，离散拉普拉斯可写为：

$$
\nabla_h^2 h_{i,j}=\frac{h_{i+1,j}-2h_{i,j}+h_{i-1,j}}{\Delta x^2}+\frac{h_{i,j+1}-2h_{i,j}+h_{i,j-1}}{\Delta y^2}
$$

当 $\Delta x=\Delta y$ 时，退化为经典五点格式：

$$
\nabla_h^2 h_{i,j}
\approx
\frac{h_{i+1,j}+h_{i-1,j}+h_{i,j+1}+h_{i,j-1}-4h_{i,j}}{\Delta x^2}
$$

它的结构可以读成“邻点和减中心加权”，本质是局部离散曲率。  

---

## 3. 离散拉普拉斯的矩阵表示

把二维网格按列或按行拉直为向量 $u\in\mathbb{R}^{N_xN_y}$，可写成：

$$
\frac{d u}{d t}=\kappa L_h u
$$

其中 $L_h$ 是离散拉普拉斯矩阵。对规则网格可写为 Kronecker 和：

$$
L_h = I_{y}\otimes T_x + T_y\otimes I_x
$$

$$
T_x=\frac{1}{\Delta x^2}\operatorname{tridiag}(1,-2,1),\qquad
T_y=\frac{1}{\Delta y^2}\operatorname{tridiag}(1,-2,1)
$$

### 3.1 一个可直接用的具体例子（3x3）

如果先看 1D 且只有 3 个内点（Dirichlet 边界），离散拉普拉斯就是一个 $3\times3$ 三对角矩阵：  

$$
L_{1D}=\frac{1}{h^2}
\begin{bmatrix}
-2 & 1 & 0\\
1 & -2 & 1\\
0 & 1 & -2
\end{bmatrix}
$$

若看 2D 的 $3\times3$ 内点网格（共 9 个未知量），按“先 x 后 y”拉直：

$$
u=\big[u_{1,1},u_{2,1},u_{3,1},u_{1,2},u_{2,2},u_{3,2},u_{1,3},u_{2,3},u_{3,3}\big]^\top
$$

对应索引关系可写成 $k=i+(j-1)N_x$（这里 $N_x=3$）。  

在 $\Delta x=\Delta y=h$ 下，对应矩阵为：

$$
L_{2D}=\frac{1}{h^2}
\begin{bmatrix}
-4 & 1 & 0 & 1 & 0 & 0 & 0 & 0 & 0\\
1 & -4 & 1 & 0 & 1 & 0 & 0 & 0 & 0\\
0 & 1 & -4 & 0 & 0 & 1 & 0 & 0 & 0\\
1 & 0 & 0 & -4 & 1 & 0 & 1 & 0 & 0\\
0 & 1 & 0 & 1 & -4 & 1 & 0 & 1 & 0\\
0 & 0 & 1 & 0 & 1 & -4 & 0 & 0 & 1\\
0 & 0 & 0 & 1 & 0 & 0 & -4 & 1 & 0\\
0 & 0 & 0 & 0 & 1 & 0 & 1 & -4 & 1\\
0 & 0 & 0 & 0 & 0 & 1 & 0 & 1 & -4
\end{bmatrix}
$$

读这个矩阵只记一条：对角线是中心系数，非零的 1 表示上下左右邻接。  

边界条件会改变矩阵首尾行（或对应块）的系数结构。  

### 3.2 边界条件的实际意义：沙地模型中的三类边界

把 $h(x,y,t)$ 看作沙层厚度，可以用一个沙地输运场景来区分三类常见边界：  

- Dirichlet（固定值边界）：例如左侧给料器维持固定沙层高度。  

$$
h|_{\Gamma_{\text{in}}}=h_{\text{feed}}(t)
$$

- Neumann（固定通量边界）：例如右侧按指定速率出沙，或墙面零通量。  

$$
\frac{\partial h}{\partial n}\Big|_{\Gamma_{\text{out}}}=q_{\text{out}}(t),\qquad
\frac{\partial h}{\partial n}\Big|_{\Gamma_{\text{wall}}}=0
$$

- Periodic（周期边界）：例如把左右边界接成“环形沙带”，左端流出的沙从右端回到系统。  

$$
h(0,y,t)=h(L_x,y,t),\qquad
\frac{\partial h}{\partial x}(0,y,t)=\frac{\partial h}{\partial x}(L_x,y,t)
$$

本质上，边界条件就是“系统与外界交换规则”的数学表达。  

---

## 4. 小结

- Part 1 的核心是空间离散：连续曲率 -> 五点拉普拉斯 -> 矩阵算子。  
- 本篇先停在“矩阵表示”这一层，特征值与模态放到你后续学习时再补。  
- 边界条件在工程上对应“与外界交换规则”，常见是 Dirichlet（固定值）、Neumann（固定通量）和 Periodic（周期拼接）。  
- 本篇不处理 CFL 与收敛阶：前者放到 Part 2，后者放到后续误差与可靠性章节。  
