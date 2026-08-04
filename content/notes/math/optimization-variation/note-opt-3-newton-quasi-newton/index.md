---
date: '2026-07-15T12:30:00+09:00'
draft: false
title: '优化与变分 Part 3：Newton、阻尼与拟 Newton'
summary: "从二阶 Taylor 模型推出 Newton 方程，证明正定 Hessian 下 Newton 方向为下降方向，并在 Hessian 局部 Lipschitz 时证明二次收敛；随后由梯度差构造割线方程，证明 BFGS 更新满足割线条件并在曲率条件下保持正定。"
description: "二阶优化证明型笔记：Newton 法、局部二次收敛、阻尼与 Armijo 线搜索、拟 Newton 割线方程、BFGS Hessian 与逆 Hessian 更新、曲率条件和正定保持的证明边界。"
tags: ["Mathematics", "Optimization", "Numerical Methods"]
categories: ["Notes"]
series: ["Optimization and Variational Methods"]
note_kind: "foundation"
math: true
---

# 优化与变分 Part 3：Newton、阻尼与拟 Newton

梯度下降只使用局部线性信息：

$$
f(x+p)
\approx
f(x)+\nabla f(x)^\top p.
$$

Newton 法再加入二次曲率：

$$
f(x+p)
\approx
f(x)
+\nabla f(x)^\top p
+\frac12p^\top\nabla^2f(x)p.
$$

如果 Hessian 能被可靠计算和求解，这个模型会给出局部二次收敛；如果 Hessian 太昂贵，拟 Newton 法尝试仅从相邻迭代的位移和梯度差恢复曲率。

本篇的链条是：

$$
\text{二次模型}
\longrightarrow
\text{Newton 方程}
\longrightarrow
\text{阻尼与线搜索}
\longrightarrow
\text{局部二次收敛}
\longrightarrow
\text{割线方程}
\longrightarrow
\text{BFGS}.
$$

全文设 $f:\mathbb R^n\to\mathbb R$ 至少二次可微。记

$$
g_k=\nabla f(x_k),
\qquad
H_k=\nabla^2f(x_k).
$$

---

## 1. Newton 方向来自二次模型

在当前点 $x_k$，考虑二次模型

$$
m_k(p)
\mathrel{=}
f(x_k)+g_k^\top p+\frac12p^\top H_kp.
$$

若 $H_k\succ0$，则 $m_k$ 严格凸。它的唯一极小点满足

$$
\nabla_pm_k(p)
\mathrel{=}
g_k+H_kp
=0.
$$

因此 Newton 方向 $p_k^{\mathrm N}$ 由线性方程

$$
H_kp_k^{\mathrm N}=-g_k
$$

定义，也就是

$$
p_k^{\mathrm N}=-H_k^{-1}g_k.
$$

更新为

$$
x_{k+1}=x_k+p_k^{\mathrm N}.
$$

同一个方程也可从求根角度得到。目标是求

$$
\nabla f(x)=0.
$$

对梯度作一阶近似：

$$
\nabla f(x_k+p)
\approx
g_k+H_kp.
$$

令近似梯度为零，再次得到 Newton 方程。

### 1.1 不显式求逆

公式 $p=-H^{-1}g$ 只表示数学关系。计算中应解

$$
Hp=-g,
$$

而不是先形成 $H^{-1}$。Newton 步的核心代价是 Hessian 线性系统的构造与求解。

---

## 2. 正定 Hessian 保证下降方向

**定理**：若

$$
H_k\succ0
$$

且 $g_k\ne0$，则 Newton 方向是严格下降方向：

$$
g_k^\top p_k^{\mathrm N}\lt0.
$$

**证明**：

由 $p_k^{\mathrm N}=-H_k^{-1}g_k$，

$$
g_k^\top p_k^{\mathrm N}
\mathrel{=}
-g_k^\top H_k^{-1}g_k.
$$

$H_k\succ0$ 推出 $H_k^{-1}\succ0$，所以对 $g_k\ne0$，

$$
g_k^\top H_k^{-1}g_k>0.
$$

因此 $g_k^\top p_k^{\mathrm N}\lt0$。证毕。

如果 $H_k$ 不定，Newton 方程的解可能不是二次模型的极小点，也不一定是下降方向。因此“解出 Newton 方程”与“得到可靠更新”是两个不同问题。

---

## 3. 阻尼与 Armijo 线搜索

完整 Newton 步在最优点附近很快，但远离最优点时二次模型未必覆盖长度为 $1$ 的整步。阻尼 Newton 改为

$$
x_{k+1}=x_k+\alpha_kp_k,
\qquad
0\lt\alpha_k\le1.
$$

只要 $p_k$ 是下降方向，就可以用 Armijo 条件选择步长。给定

$$
0\lt c\lt1,
\qquad
0\lt\beta\lt1,
$$

从候选集合

$$
\{1,\beta,\beta^2,\ldots\}
$$

中选择第一个满足

$$
f(x_k+\alpha p_k)
\le
f(x_k)+c\alpha g_k^\top p_k
$$

的 $\alpha$。

### 3.1 回溯为什么会终止

**定理**：若 $f$ 在 $x_k$ 可微且

$$
g_k^\top p_k\lt0,
$$

则充分小的正步长 $\alpha$ 满足 Armijo 条件。因此回溯线搜索在有限次缩短后终止。

**证明**：

由可微性，

$$
f(x_k+\alpha p_k)
\mathrel{=}
f(x_k)+\alpha g_k^\top p_k+o(\alpha).
$$

所以

$$
\frac{
f(x_k+\alpha p_k)-f(x_k)
}{\alpha}
\longrightarrow
g_k^\top p_k
$$

当 $\alpha\downarrow0$。

因为 $g_k^\top p_k\lt0$ 且 $0\lt c\lt1$，

$$
g_k^\top p_k
\lt
c\,g_k^\top p_k.
$$

因此对充分小的 $\alpha>0$，

$$
\frac{
f(x_k+\alpha p_k)-f(x_k)
}{\alpha}
\le
c\,g_k^\top p_k.
$$

乘以 $\alpha$ 即为 Armijo 条件。几何序列 $\beta^j$ 趋于零，所以某个有限 $j$ 必然进入这个充分小的区间。证毕。

### 3.2 Hessian 正则化

若 $H_k$ 不正定，还可以先改造曲率矩阵：

$$
\widetilde H_k=H_k+\lambda_kI.
$$

取 $\lambda_k\ge0$。当

$$
\lambda_k>-\lambda_{\min}(H_k)
$$

时 $\widetilde H_k\succ0$，方向

$$
\widetilde H_kp_k=-g_k
$$

成为下降方向，再配合线搜索选择步长。

步长阻尼控制“沿当前方向走多远”，Hessian 正则化控制“当前方向是否来自正定模型”。它们处理的是不同层次的问题。

---

## 4. Newton 法的局部二次收敛

二次收敛不是 Newton 更新式自动附带的性质。它依赖最优点附近 Hessian 的可逆性与变化速度。

**定理**：设 $x^\star$ 满足

$$
\nabla f(x^\star)=0.
$$

假设在 $x^\star$ 的一个凸邻域 $\mathcal U$ 中：

1. Hessian 一致正定：

$$
\nabla^2f(x)\succeq mI
\qquad
(m>0);
$$

2. Hessian 为 $M$-Lipschitz：

$$
\|\nabla^2f(x)-\nabla^2f(y)\|_2
\le
M\|x-y\|.
$$

则只要 $x_k$ 充分接近 $x^\star$，完整 Newton 步

$$
x_{k+1}
\mathrel{=}
x_k-\nabla^2f(x_k)^{-1}\nabla f(x_k)
$$

留在 $\mathcal U$ 中，并满足

$$
\|x_{k+1}-x^\star\|
\le
\frac{M}{2m}
\|x_k-x^\star\|^2.
$$

**证明**：

记

$$
e_k=x_k-x^\star,
\qquad
H(x)=\nabla^2f(x).
$$

由 Hessian 下界，

$$
\|H(x_k)^{-1}\|_2\le\frac1m.
$$

又因为 $\nabla f(x^\star)=0$，沿线段积分：

$$
\nabla f(x_k)
\mathrel{=}
\int_0^1
H(x^\star+te_k)e_k\,dt.
$$

Newton 误差可写成

$$
\begin{aligned}
e_{k+1}
&=
e_k-H(x_k)^{-1}\nabla f(x_k)\\
&=
H(x_k)^{-1}
\left[
H(x_k)e_k-\nabla f(x_k)
\right]\\
&=
H(x_k)^{-1}
\int_0^1
\left[
H(x_k)-H(x^\star+te_k)
\right]
e_k\,dt.
\end{aligned}
$$

由 Hessian Lipschitz，

$$
\begin{aligned}
\|H(x_k)-H(x^\star+te_k)\|_2
&\le
M\|x_k-(x^\star+te_k)\|\\
&=
M(1-t)\|e_k\|.
\end{aligned}
$$

所以

$$
\begin{aligned}
\|e_{k+1}\|
&\le
\frac1m
\int_0^1
M(1-t)\|e_k\|^2\,dt\\
&=
\frac{M}{2m}\|e_k\|^2.
\end{aligned}
$$

若初始误差足够小，使闭球包含于 $\mathcal U$ 且

$$
\frac{M}{2m}\|e_0\|\lt1,
$$

上述界还给出 $\|e_{k+1}\|\lt\|e_k\|$，从而迭代始终留在该球中。证毕。

误差下一步与当前误差平方成正比，这才是“局部二次收敛”的准确含义。

---

## 5. 从真实 Hessian 到割线方程

Newton 每步需要新的 Hessian。拟 Newton 法改为维护对称矩阵 $B_k$，希望

$$
B_k\approx\nabla^2f(x_k),
$$

并取方向

$$
B_kp_k=-g_k.
$$

定义相邻迭代的位移与梯度差：

$$
s_k=x_{k+1}-x_k,
$$

$$
y_k=g_{k+1}-g_k.
$$

由梯度的积分公式，

$$
y_k
\mathrel{=}
\int_0^1
\nabla^2f(x_k+ts_k)s_k\,dt.
$$

如果 Hessian 在这一步内变化不大，就有

$$
y_k\approx\nabla^2f(x_{k+1})s_k.
$$

因此要求下一步近似满足**割线方程**

$$
B_{k+1}s_k=y_k.
$$

一维割线法用一个斜率差商替代导数；多维割线方程正是同一思想的矩阵版本。

### 5.1 割线方程不能唯一决定矩阵

对称 $n\times n$ 矩阵有

$$
\frac{n(n+1)}2
$$

个自由参数，而 $B_{k+1}s_k=y_k$ 只有 $n$ 个标量约束。因此必须再规定：

- $B_{k+1}$ 保持对称；
- 尽量少地偏离 $B_k$；
- 在适当曲率条件下保持正定。

BFGS 是满足这些目标的一种秩二更新。

---

## 6. BFGS Hessian 更新

省略下标 $k$，记

$$
B=B_k,
\qquad
s=s_k,
\qquad
y=y_k.
$$

假设

$$
B\succ0,
\qquad
y^\top s>0.
$$

BFGS 更新定义为

$$
B_+
\mathrel{=}
B
\mathbin{-}
\frac{Bss^\top B}{s^\top Bs}
+
\frac{yy^\top}{y^\top s}.
$$

分母均为正：$s^\top Bs>0$ 来自 $B\succ0$ 与 $s\ne0$，$y^\top s>0$ 是曲率条件。

### 6.1 对称性与秩

$B$、$Bss^\top B$ 与 $yy^\top$ 都对称，所以 $B_+$ 对称。并且

$$
B_+-B
$$

是两个秩一矩阵之和，因此更新秩至多为二。

### 6.2 割线方程

**定理**：BFGS 更新满足

$$
B_+s=y.
$$

**证明**：

直接右乘 $s$：

$$
\begin{aligned}
B_+s
&=
Bs
\mathbin{-}
\frac{Bss^\top Bs}{s^\top Bs}
+
\frac{yy^\top s}{y^\top s}\\
&=
Bs-Bs+y\\
&=
y.
\end{aligned}
$$

证毕。

### 6.3 正定保持

**定理**：若

$$
B\succ0
\quad\text{且}\quad
y^\top s>0,
$$

则

$$
B_+\succ0.
$$

**证明**：

任取非零向量 $z$。有

$$
z^\top B_+z
\mathrel{=}
z^\top Bz
\mathbin{-}
\frac{(z^\top Bs)^2}{s^\top Bs}
+
\frac{(z^\top y)^2}{y^\top s}.
$$

用 $B$ 定义内积

$$
\langle u,v\rangle_B=u^\top Bv.
$$

由 Cauchy–Schwarz，

$$
(z^\top Bs)^2
\le
(z^\top Bz)(s^\top Bs).
$$

所以前两项之和非负。

若前两项之和严格为正，则整个表达式为正。若前两项之和等于零，Cauchy–Schwarz 取等，故 $z$ 与 $s$ 线性相关。写成

$$
z=cs.
$$

因为 $z\ne0$，所以 $c\ne0$。第三项此时为

$$
\frac{(z^\top y)^2}{y^\top s}
\mathrel{=}
c^2y^\top s
\mathrel{>}0.
$$

因此对每个 $z\ne0$ 都有

$$
z^\top B_+z>0.
$$

所以 $B_+\succ0$。证毕。

由归纳可知：若 $B_0\succ0$ 且每一步都满足 $y_k^\top s_k>0$，则所有 BFGS 矩阵均正定。于是

$$
p_k=-B_k^{-1}g_k
$$

在 $g_k\ne0$ 时始终是下降方向。

---

## 7. 曲率条件从哪里来

BFGS 正定性证明依赖

$$
y_k^\top s_k>0.
$$

这不是自动成立的代数事实，需要目标结构或线搜索保证。

### 7.1 强凸性

若 $f$ 为 $\mu$-强凸，Part 1 的梯度强单调性给出

$$
\bigl(\nabla f(x_{k+1})-\nabla f(x_k)\bigr)^\top
(x_{k+1}-x_k)
\ge
\mu\|x_{k+1}-x_k\|^2.
$$

也就是

$$
y_k^\top s_k
\ge
\mu\|s_k\|^2
\mathrel{>}0
$$

只要 $s_k\ne0$。

### 7.2 Wolfe 曲率条件

设 $p_k$ 是下降方向，$s_k=\alpha_kp_k$。Wolfe 曲率条件要求某个 $c_2\in(0,1)$ 使

$$
\nabla f(x_k+\alpha_kp_k)^\top p_k
\ge
c_2\nabla f(x_k)^\top p_k.
$$

于是

$$
\begin{aligned}
y_k^\top s_k
&=
\alpha_k
\bigl(
\nabla f(x_{k+1})-\nabla f(x_k)
\bigr)^\top p_k\\
&\ge
\alpha_k(c_2-1)
\nabla f(x_k)^\top p_k.
\end{aligned}
$$

因为

$$
c_2-1\lt0,
\qquad
\nabla f(x_k)^\top p_k\lt0,
$$

右侧严格为正。因此 Wolfe 条件可以在非全局强凸的情形下为已接受的步提供 BFGS 曲率条件。

---

## 8. 逆 Hessian 形式

若直接维护

$$
G_k=B_k^{-1},
$$

方向可以写成

$$
p_k=-G_kg_k,
$$

不必每步解新的线性系统。令

$$
\rho_k=\frac1{y_k^\top s_k}.
$$

常用的逆 BFGS 更新定义为

$$
G_{k+1}
\mathrel{=}
\bigl(I-\rho_ks_ky_k^\top\bigr)
G_k
\bigl(I-\rho_ky_ks_k^\top\bigr)
+
\rho_ks_ks_k^\top.
$$

它与上一节 Hessian 形式之间的代数等价可由 Sherman–Morrison–Woodbury 公式验证；本文不重做这段矩阵求逆推导，而是直接验证这里所需的逆割线条件与正定保持。

它满足逆割线方程

$$
G_{k+1}y_k=s_k.
$$

**验证**：

因为 $\rho_ky_k^\top s_k=1$，右侧因子作用在 $y_k$ 上给出

$$
\bigl(I-\rho_ky_ks_k^\top\bigr)y_k
\mathrel{=}
y_k-\rho_ky_k(s_k^\top y_k)
=0.
$$

所以乘积的第一大项作用在 $y_k$ 上为零，而

$$
\rho_ks_ks_k^\top y_k=s_k.
$$

故 $G_{k+1}y_k=s_k$。

若 $G_k\succ0$ 且 $y_k^\top s_k>0$，该更新同样保持正定。令

$$
w=
\bigl(I-\rho_ky_ks_k^\top\bigr)z,
$$

则对 $z\ne0$，

$$
z^\top G_{k+1}z
\mathrel{=}
w^\top G_kw
+
\rho_k(s_k^\top z)^2.
$$

若两项同时为零，则 $s_k^\top z=0$ 且 $w=z=0$，与 $z\ne0$ 矛盾。因此二次型严格为正。

---

## 9. 已证明结论与尚需额外条件的结论

本篇已经完整证明：

1. $H_k\succ0$ 时 Newton 方向为下降方向；
2. 下降方向下 Armijo 回溯有限终止；
3. Hessian 一致正定且局部 Lipschitz 时，完整 Newton 步局部二次收敛；
4. BFGS 更新对称并满足割线方程；
5. $B_0\succ0$ 且每步 $y_k^\top s_k>0$ 时，BFGS 保持正定；
6. 强凸性或 Wolfe 曲率条件如何推出 $y_k^\top s_k>0$。

这些结论尚不自动推出：

- Newton 从任意初值全局收敛；
- BFGS 的矩阵近似一定趋于真实 Hessian；
- 只要保持正定就一定全局收敛；
- BFGS 无条件具有超线性收敛率。

完整的 BFGS 全局与超线性理论还需要目标函数水平集、线搜索、Hessian 正则性、迭代点收敛以及 Dennis–Moré 型条件。正定保持证明解决的是“更新没有破坏下降几何”，不是整个收敛理论。

---

## 10. 通向约束优化

无约束 Newton 法求解

$$
\nabla f(x)=0.
$$

加入等式约束以后，未知量扩展为 $(x,\lambda)$，需要求解拉格朗日驻点系统

$$
\begin{pmatrix}
\nabla_x\mathcal L(x,\lambda)\\
g(x)
\end{pmatrix}
=0.
$$

对这个系统做 Newton 线性化会产生由 Hessian 与约束 Jacobian 组成的鞍点线性系统。所以下一篇的拉格朗日算子并不是另一套孤立方法，而是把本篇的“求梯度零点”扩展成“求约束驻点算子零点”。

---

## 总结与下一站

Newton 法的局部速度来自 Hessian Lipschitz 余项：

$$
\|x_{k+1}-x^\star\|
\le
\frac{M}{2m}
\|x_k-x^\star\|^2.
$$

拟 Newton 法不直接使用真实 Hessian，而要求近似曲率满足

$$
B_{k+1}s_k=y_k.
$$

BFGS 的核心代数保证是：

$$
B_k\succ0,\quad
y_k^\top s_k>0
\Longrightarrow
B_{k+1}\succ0.
$$

下一站进入约束优化：可行方向不再覆盖整个空间，驻点条件必须加入约束法向与乘子。

[上一篇：优化与变分 Part 2——梯度下降、收敛率与谱滤波](/notes/math/optimization-variation/note-opt-2-gradient-descent/)

[继续阅读：优化与变分——拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/)
