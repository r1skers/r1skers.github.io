---
date: '2026-02-18T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 1: Continuous-to-Discrete Modeling (Discrete Laplacian and Matrix Form)'
summary: "Focus on turning a continuous diffusion model into computable form: gridding, five-point discretization, and matrix assembly."
description: "Part 1 note on spatial discretization and discrete Laplacian matrix form."
tags: ["PDE", "Spatial Discretization", "Discrete Laplacian", "Matrix Form", "Numerical Methods", "Physics Modeling"]
categories: ["Crucible"]
---

# Part 1：连续模型到离散算子
# Part 1: From Continuous Model to Discrete Operator

这篇只做一件事：把连续扩散方程中的空间项写成机器可计算的离散算子。  
This note does one thing: rewrite the spatial term in a continuous diffusion equation into a machine-computable discrete operator.

主线是：连续 PDE -> 空间网格化 -> 五点离散拉普拉斯 -> 矩阵表示。  
The chain is: continuous PDE -> spatial gridding -> five-point discrete Laplacian -> matrix form.

为避免混淆，以下内容不在本篇展开：  
To avoid overlap, the following are out of scope here:

- 显式时间推进与 CFL 稳定性（放在 Part 2）；  
- explicit time stepping and CFL stability (Part 2);
- 收敛阶与理查德森外推（放在后续误差与可靠性章节）。  
- convergence order and Richardson extrapolation (moved to later reliability/error chapters).

从扩散型 PDE 出发：
Start from the diffusion-type PDE:

$$
\frac{\partial h}{\partial t}=\kappa\nabla^2 h
$$

其中 $h$ 是场变量，$\kappa$ 是扩散系数。Part 1 关注的是空间算子 $\nabla^2$ 的离散化。  
Here $h$ is the field variable and $\kappa$ the diffusion coefficient. Part 1 focuses on discretizing the spatial operator $\nabla^2$.

---

## 1. 连续视角与计算机视角
## 1. Continuous View vs. Computational View

连续数学里，$\nabla^2 h$ 表示局部曲率；曲率大，扩散驱动力就大。  
In continuous math, $\nabla^2 h$ represents local curvature; larger curvature means stronger diffusion drive.

但计算机里没有“无限小邻域”，只有网格点和有限邻居。  
But on a computer, there is no infinitesimal neighborhood, only grid nodes and finite neighbors.

对应的可计算直觉是：
The computable intuition is:

- 如果某点高于邻居平均，它会向周围扩散；  
- if a node is above neighbor average, it diffuses outward;
- 如果某点低于邻居平均，它会被周围抬升。  
- if a node is below neighbor average, it is pulled upward by neighbors.

这就是“连续曲率”到“离散局部偏差”的映射。  
This is the mapping from continuous curvature to discrete local deviation.

![Rough slope in reality vs smooth slope in coarse grid](continuous-vs-grid.svg)
![Continuous curvature vs piecewise local approximation](curvature-vs-piecewise-flat.svg)

---

## 2. 一维二阶差分到二维五点拉普拉斯
## 2. From 1D Second Difference to 2D Five-Point Laplacian

先看 1D 二阶导数中心差分：
Start with 1D central difference of the second derivative:

$$
\frac{\partial^2 h}{\partial x^2}
\approx
\frac{h(x+\Delta x)-2h(x)+h(x-\Delta x)}{\Delta x^2}
$$

在 2D 下，若允许 $\Delta x\neq\Delta y$，离散拉普拉斯可写为：
In 2D, allowing $\Delta x\neq\Delta y$, the discrete Laplacian is:

$$
\nabla_h^2 h_{i,j}=\frac{h_{i+1,j}-2h_{i,j}+h_{i-1,j}}{\Delta x^2}+\frac{h_{i,j+1}-2h_{i,j}+h_{i,j-1}}{\Delta y^2}
$$

当 $\Delta x=\Delta y$ 时，退化为经典五点格式：
When $\Delta x=\Delta y$, this reduces to the classic five-point stencil:

$$
\nabla_h^2 h_{i,j}
\approx
\frac{h_{i+1,j}+h_{i-1,j}+h_{i,j+1}+h_{i,j-1}-4h_{i,j}}{\Delta x^2}
$$

它的结构可以读成“邻点和减中心加权”，本质是局部离散曲率。  
Its structure is “neighbor sum minus weighted center,” i.e., local discrete curvature.

---

## 3. 离散拉普拉斯的矩阵表示
## 3. Matrix Form of the Discrete Laplacian

把二维网格按列或按行拉直为向量 $u\in\mathbb{R}^{N_xN_y}$，可写成：
Flatten the 2D grid into a vector $u\in\mathbb{R}^{N_xN_y}$, then:

$$
\frac{d u}{d t}=\kappa L_h u
$$

其中 $L_h$ 是离散拉普拉斯矩阵。对规则网格可写为 Kronecker 和：
where $L_h$ is the discrete Laplacian matrix. On a regular grid it is a Kronecker sum:

$$
L_h = I_{y}\otimes T_x + T_y\otimes I_x
$$

$$
T_x=\frac{1}{\Delta x^2}\operatorname{tridiag}(1,-2,1),\qquad
T_y=\frac{1}{\Delta y^2}\operatorname{tridiag}(1,-2,1)
$$

### 3.1 一个可直接用的具体例子（3x3）
### 3.1 A Concrete Example You Can Use Directly (3x3)

如果先看 1D 且只有 3 个内点（Dirichlet 边界），离散拉普拉斯就是一个 $3\times3$ 三对角矩阵：  
For 1D with 3 interior nodes (Dirichlet boundary), the discrete Laplacian is a $3\times3$ tridiagonal matrix:

$$
L_{1D}=\frac{1}{h^2}
\begin{bmatrix}
-2 & 1 & 0\\
1 & -2 & 1\\
0 & 1 & -2
\end{bmatrix}
$$

若看 2D 的 $3\times3$ 内点网格（共 9 个未知量），按“先 x 后 y”拉直：
For a 2D $3\times3$ interior grid (9 unknowns), flatten with x-fast ordering:

$$
u=\big[u_{1,1},u_{2,1},u_{3,1},u_{1,2},u_{2,2},u_{3,2},u_{1,3},u_{2,3},u_{3,3}\big]^\top
$$

对应索引关系可写成 $k=i+(j-1)N_x$（这里 $N_x=3$）。  
The index map can be written as $k=i+(j-1)N_x$ (here $N_x=3$).

在 $\Delta x=\Delta y=h$ 下，对应矩阵为：
With $\Delta x=\Delta y=h$, the matrix is:

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
One reading rule is enough: diagonal entries are center weights, and nonzero ones indicate up/down/left/right adjacency.

边界条件会改变矩阵首尾行（或对应块）的系数结构。  
Boundary conditions modify coefficient rows at matrix edges (or boundary blocks).

### 3.2 边界条件的实际意义：沙地模型中的三类边界
### 3.2 Practical Meaning: Three Boundary Types in a Sand Model

把 $h(x,y,t)$ 看作沙层厚度，可以用一个沙地输运场景来区分三类常见边界：  
Treat $h(x,y,t)$ as sand-layer thickness. A sand-transport setup helps distinguish three common boundary types:

- Dirichlet（固定值边界）：例如左侧给料器维持固定沙层高度。  
- Dirichlet (fixed-value boundary): e.g., a feeder keeps fixed sand height at the left boundary.

$$
h|_{\Gamma_{\text{in}}}=h_{\text{feed}}(t)
$$

- Neumann（固定通量边界）：例如右侧按指定速率出沙，或墙面零通量。  
- Neumann (fixed-flux boundary): e.g., prescribed outflow rate on the right, or zero flux on walls.

$$
\frac{\partial h}{\partial n}\Big|_{\Gamma_{\text{out}}}=q_{\text{out}}(t),\qquad
\frac{\partial h}{\partial n}\Big|_{\Gamma_{\text{wall}}}=0
$$

- Periodic（周期边界）：例如把左右边界接成“环形沙带”，左端流出的沙从右端回到系统。  
- Periodic boundary: e.g., connect left/right edges into a ring, so outflow re-enters from the opposite side.

$$
h(0,y,t)=h(L_x,y,t),\qquad
\frac{\partial h}{\partial x}(0,y,t)=\frac{\partial h}{\partial x}(L_x,y,t)
$$

本质上，边界条件就是“系统与外界交换规则”的数学表达。  
In essence, boundary conditions are mathematical forms of exchange rules between the system and its surroundings.

---

## 4. 小结
## 4. Summary

- Part 1 的核心是空间离散：连续曲率 -> 五点拉普拉斯 -> 矩阵算子。  
- Part 1 focuses on spatial discretization: continuous curvature -> five-point Laplacian -> matrix operator.
- 本篇先停在“矩阵表示”这一层，特征值与模态放到你后续学习时再补。  
- This note stops at matrix form for now; eigenvalue/mode analysis will be added later.
- 边界条件在工程上对应“与外界交换规则”，常见是 Dirichlet（固定值）、Neumann（固定通量）和 Periodic（周期拼接）。  
- In engineering terms, boundary conditions are exchange rules with the environment: Dirichlet (fixed value), Neumann (fixed flux), and Periodic (periodic stitching).
- 本篇不处理 CFL 与收敛阶：前者放到 Part 2，后者放到后续误差与可靠性章节。  
- This note does not cover CFL or convergence order: the former goes to Part 2, and the latter to later reliability/error chapters.
