---
date: '2026-07-15T12:00:00+09:00'
draft: false
title: '优化与变分 Part 0：从局部几何到约束与变分'
summary: "重排优化与变分系列的依赖顺序：先用微分、梯度、Hessian 与凸性描述目标函数，再证明梯度下降、Newton 与拟 Newton 的收敛机制，最后接入现有的拉格朗日乘子与变分入口。"
description: "优化与变分路线图：微分、梯度、Hessian、凸性、梯度下降、Newton、BFGS、约束优化、拉格朗日函数与欧拉–拉格朗日方向的依赖关系和证明边界。"
tags: ["Optimization", "Calculus of Variations", "Gradient", "Hessian", "Convexity", "Gradient Descent", "Newton Method", "BFGS", "Lagrangian", "Roadmap"]
categories: ["Crucible"]
math: true
---

# 优化与变分 Part 0：从局部几何到约束与变分

优化研究的不是某一个算法，而是三层彼此依赖的问题：

$$
\text{目标函数具有什么结构}
\longrightarrow
\text{算法怎样利用这些结构}
\longrightarrow
\text{迭代为什么收敛}.
$$

如果跳过第一层，梯度下降、Newton 与 BFGS 就会变成互不相干的更新公式；如果跳过第三层，“损失下降了”又会被误当成已经证明收敛。

这组笔记因此按以下次序展开：

$$
\begin{aligned}
&\text{微分、梯度、Hessian、Taylor}\\
&\qquad\Downarrow\\
&\text{凸、强凸、光滑}\\
&\qquad\Downarrow\\
&\text{梯度下降及其速率}\\
&\qquad\Downarrow\\
&\text{Newton、阻尼与拟 Newton}\\
&\qquad\Downarrow\\
&\text{拉格朗日约束与变分}.
\end{aligned}
$$

---

## 1. 统一设定

无约束主线研究

$$
\min_{x\in\mathbb R^n} f(x),
$$

其中 $f:\mathbb R^n\to\mathbb R$。除非单篇另行加强，统一约定：

- 向量均为列向量；
- 内积为 $x^\top y$，范数为 Euclidean 范数 $\|x\|_2$；
- 梯度记为 $\nabla f(x)$，Hessian 记为 $\nabla^2f(x)$；
- 对称矩阵的半正定序记为

$$
A\preceq B
\Longleftrightarrow
x^\top Ax\le x^\top Bx
\quad
\text{对所有 }x;
$$

- “局部极小”“全局极小”“驻点”严格区分；
- 每条收敛结论都显式写出光滑性、凸性、强凸性、步长与局部邻域等前提。

有限维实空间的选择不是限制优化思想，而是先把最常用的几何与算法证明闭合。约束优化仍在有限维中；当变量变成函数时，才进入泛函与第一变分。

---

## 2. Part 1：目标函数的局部与全局结构

[优化与变分 Part 1：梯度、Hessian、Taylor 与凸性](/notes/math/optimization-variation/note-opt-1-gradient-hessian-convexity/)

Part 1 回答：

> $f$ 在一点附近怎样变化，局部微分信息在什么条件下能够控制整个空间？

依赖链是

$$
Df(x)[h]
\longrightarrow
\nabla f(x)
\longrightarrow
\nabla^2f(x)
\longrightarrow
\text{Taylor 公式}
\longrightarrow
\text{凸性与曲率界}.
$$

主要结论包括：

$$
f(y)\ge
f(x)+\nabla f(x)^\top(y-x)
$$

对可微凸函数成立；

$$
\mu I\preceq\nabla^2f(x)\preceq LI
$$

把强凸性与光滑性变成统一的谱区间；以及强凸函数驻点的存在与唯一性。

这一篇提供后续所有速率证明使用的基本不等式。

---

## 3. Part 2：一阶方法

[优化与变分 Part 2：梯度下降、收敛率与谱滤波](/notes/math/optimization-variation/note-opt-2-gradient-descent/)

梯度下降为

$$
x_{k+1}=x_k-\eta_k\nabla f(x_k).
$$

Part 2 不把它解释成“朝负梯度走”就停止，而是依次证明：

1. $L$-光滑性如何推出下降引理；
2. 为什么 $0\lt\eta\lt2/L$ 才能由该引理保证单步下降；
3. 一般光滑目标只能先得到梯度范数界；
4. 凸性如何把它升级为

$$
f(x_k)-f^\star=O(k^{-1});
$$

5. 强凸性如何进一步给出几何收敛；
6. 在线性最小二乘中，有限步梯度下降怎样成为奇异值方向上的谱滤波器。

最后一点给 early stopping 一个精确的有限维解释，而不是只把它当成经验性的训练技巧。

---

## 4. Part 3：二阶与曲率近似

[优化与变分 Part 3：Newton、阻尼与拟 Newton](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)

Newton 法用当前 Hessian 解局部二次模型：

$$
\nabla^2f(x_k)p_k=-\nabla f(x_k).
$$

Part 3 分开处理两类问题：

- **局部理论**：Hessian 在最优点附近可逆且 Lipschitz 时，完整 Newton 步为何二次收敛；
- **全局化机制**：远离最优点时，为什么需要阻尼或线搜索；
- **拟 Newton**：不直接计算 Hessian 时，如何用割线方程

$$
B_{k+1}s_k=y_k
$$

逐步重建曲率；
- **BFGS 的代数保证**：在

$$
s_k^\top y_k>0
$$

时，更新如何保持正定。

正定性只是方向仍为下降方向所需的一块结构；它本身不等价于全局收敛或超线性收敛。文章会把已证明结论与需要额外定理的部分明确分开。

---

## 5. 约束优化与变分入口

[优化与变分：拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/)

前三篇处理无约束问题。加入等式约束

$$
g(x)=0
$$

以后，可行方向不再覆盖整个 $\mathbb R^n$，无约束驻点条件

$$
\nabla f(x^\star)=0
$$

被替换为梯度与约束法空间的关系。现有拉格朗日篇从这里引入

$$
\mathcal L(x,\lambda)
\mathrel{=}
f(x)+\lambda^\top g(x),
$$

并将驻点系统连接到 KKT 与欧拉–拉格朗日算子。

阅读顺序上，它位于 Part 3 之后；内容上，它也是一条新分支：

$$
\text{有限维无约束优化}
\longrightarrow
\begin{cases}
\text{约束优化与 KKT},\\
\text{函数空间与变分}.
\end{cases}
$$

现有文章保留原题，不为了编号而改写历史 URL。

---

## 6. 各篇之间的依赖

| 内容 | 直接依赖 | 主要产物 |
|---|---|---|
| Part 1：微分与凸性 | 多元微积分、线性代数 | 一阶支撑不等式、曲率界 |
| Part 2：梯度下降 | Part 1 | 下降引理、次线性与线性速率 |
| Part 3：Newton / BFGS | Part 1，部分使用 Part 2 的线搜索思想 | 局部二次收敛、割线更新 |
| 拉格朗日与变分 | Part 1 的驻点与 Hessian 语言 | 约束驻点系统、变分入口 |

其中线性代数的接口尤其明确：

$$
\begin{aligned}
\text{Hessian 正定性}
&\longleftrightarrow
\text{局部二次模型的曲率},\\
\text{条件数}
&\longleftrightarrow
\text{一阶法的收敛速度},\\
\text{SVD}
&\longleftrightarrow
\text{early stopping 的谱滤波},\\
\text{线性方程求解}
&\longleftrightarrow
\text{Newton 方向}.
\end{aligned}
$$

---

## 7. 本系列的证明边界

这四篇只承诺下列范围内的结论：

- 确定性、有限维、实值目标函数；
- 梯度下降使用精确梯度；
- Newton 的二次收敛是局部结论；
- BFGS 只完整证明割线条件、对称性与曲率条件下的正定保持；
- early stopping 的谱解释限定在线性最小二乘与固定步长；
- 拉格朗日篇给出约束与变分入口，不在本阶段重写完整 KKT 对偶理论。

随机梯度、加速方法、非光滑优化、近端方法、自适应优化器、完整拟 Newton 全局理论与泛函分析版本留给后续分支。

---

## 下一站

第一篇从“导数到底是一个什么对象”开始。梯度不是导数本身，而是线性泛函 $Df(x)$ 在 Euclidean 内积下的表示；Hessian 则是梯度的导数。把这层关系固定以后，凸性与算法证明才不会依赖坐标直觉。

[继续阅读：优化与变分 Part 1——梯度、Hessian、Taylor 与凸性](/notes/math/optimization-variation/note-opt-1-gradient-hessian-convexity/)
