---
date: '2026-07-15T12:30:00+09:00'
draft: false
title: '信息几何 G2：KL 的局部二阶结构与 Natural Gradient'
summary: "把 KL divergence 限制到参数化分布族，证明它在对角线上的一阶导数消失、二阶 Hessian 等于 Fisher information，并从局部 KL trust region 推导 natural gradient，最后以 K-FAC 作为可选应用桥接。"
description: "信息几何进阶笔记：参数化 KL、Fisher metric 的 KL-Hessian 来源、KL 二阶 Taylor 展开、natural gradient 的约束最速下降推导、坐标一致性、奇异 Fisher 与 damping，以及作为可选应用桥接的 K-FAC Kronecker factorization。"
tags: ["Mathematics", "Information Geometry", "KL Divergence"]
categories: ["Notes"]
series: ["Information Geometry"]
note_kind: "foundation"
---

# 信息几何 G2：KL 的局部二阶结构与 Natural Gradient

> [G1](/notes/math/information-geometry/note-ig-1-score-fisher/) 从 score 建立了 Fisher information。本篇从 KL divergence 的局部 Taylor 展开重新得到同一个矩阵，并证明它为什么决定参数化分布空间中的最速下降方向。

本篇继续使用自然对数与 nats。核心链条为

$$
D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
\longrightarrow
\left.\nabla_{\theta'}D\right|_{\theta'=\theta}=0
\longrightarrow
\left.\nabla_{\theta'}^2D\right|_{\theta'=\theta}=G(\theta)
\longrightarrow
\widetilde\nabla L=G^{-1}\nabla L.
$$

沿用 G1 的共同支撑、二阶可微、可交换微分与积分、有限 score 二阶矩等正则条件。此外，对每个固定的 $\theta$，假设

$$
\theta'\longmapsto D(\theta,\theta')
$$

在 $\theta' = \theta$ 的某个邻域内为 $C^2$。一组足够条件是：$\ln p_{\theta'}(x)$ 关于 $\theta'$ 的一、二阶导数在该邻域内连续，并分别受某个关于 $p_\theta\,d\mu$ 可积的函数控制。这样不仅可以把一、二阶微分移入期望，也能保证 KL Hessian 在对角线附近连续，从而支持第 4 节带 $o(\|\Delta\theta\|^2)$ 余项的二阶 Taylor 展开。

---

## 1. 参数空间上的 KL divergence

定义

$$
\begin{aligned}
D(\theta,\theta')
&=
D_{\mathrm{KL}}(p_\theta\|p_{\theta'})\\
&=
\mathbb E_\theta
\left[
\ln\frac{p_\theta(X)}{p_{\theta'}(X)}
\right].
\end{aligned}
$$

第一参数 $\theta$ 决定取期望的真实分布，第二参数 $\theta'$ 决定被比较的分布。下面固定 $\theta$，只对 $\theta'$ 求导。

由 Gibbs inequality，

$$
D(\theta,\theta')\ge0
$$

且

$$
D(\theta,\theta')=0
\Longleftrightarrow
p_\theta=p_{\theta'}
\qquad \mu\text{-a.e.}
$$

只有再加上 identifiable parameterization，才能从分布相等推出 $\theta=\theta'$。因此“KL 在参数空间中唯一最小于 $\theta'=\theta$”需要可辨识性；后面的局部微分恒等式本身不需要全局唯一性。

---

## 2. KL 在对角线上的一阶导数消失

**命题**：

$$
\nabla_{\theta'}D(\theta,\theta')
\mathrel{=}
-\mathbb E_\theta[s_{\theta'}(X)].
$$

因此

$$
\left.
\nabla_{\theta'}D(\theta,\theta')
\right|_{\theta'=\theta}
=0.
$$

{{< details summary="证明：KL 在对角线上的一阶消失" >}}

写成 log-density：

$$
D(\theta,\theta')
\mathrel{=}
\mathbb E_\theta
\left[
\ell_\theta(X)-\ell_{\theta'}(X)
\right].
$$

由于取期望的分布 $p_\theta$ 与 $\theta'$ 无关，

$$
\begin{aligned}
\nabla_{\theta'}D(\theta,\theta')
&=
-\mathbb E_\theta
\left[
\nabla_{\theta'}\ell_{\theta'}(X)
\right]\\
&=
-\mathbb E_\theta[s_{\theta'}(X)].
\end{aligned}
$$

令 $\theta'=\theta$，由 G1 的 score 零均值恒等式，

$$
\mathbb E_\theta[s_\theta(X)]=0.
$$

所以

$$
\left.
\nabla_{\theta'}D(\theta,\theta')
\right|_{\theta'=\theta}
=0.
$$

证毕。

{{< /details >}}

一阶项消失意味着：KL 在相同分布的对角线上没有线性变化。二阶项由 Fisher information 给出；若位移方向不在 $G(\theta)$ 的零空间中，它就是 leading term。若 Fisher 在该方向退化，二阶项也可能为零，首个非零项可能出现在更高阶。

---

## 3. KL Hessian 等于 Fisher information

**定理**：

$$
\left.
\nabla_{\theta'}^2D(\theta,\theta')
\right|_{\theta'=\theta}
=G(\theta).
$$

{{< details summary="证明：KL Hessian 与 Fisher information" >}}

由上一节，

$$
\nabla_{\theta'}D(\theta,\theta')
\mathrel{=}
-\mathbb E_\theta[s_{\theta'}(X)].
$$

再次对 $\theta'$ 求导：

$$
\nabla_{\theta'}^2D(\theta,\theta')
\mathrel{=}
-\mathbb E_\theta
\left[
\nabla_{\theta'}^2\ln p_{\theta'}(X)
\right].
$$

令 $\theta'=\theta$，再使用 G1 的 negative expected Hessian identity：

$$
-\mathbb E_\theta
\left[
\nabla_\theta^2\ln p_\theta(X)
\right]
=G(\theta).
$$

因此

$$
\left.
\nabla_{\theta'}^2D(\theta,\theta')
\right|_{\theta'=\theta}
=G(\theta).
$$

证毕。

{{< /details >}}

这里的 Hessian 等式只在

$$
\theta'=\theta
$$

的对角线上成立。KL 本身不对称，也不满足三角不等式；它不是全局 metric。Fisher information 来自 KL 在对角线附近的二阶项。

---

## 4. KL 的局部二阶展开

令

$$
\theta'=\theta+\Delta\theta.
$$

由 Taylor 展开、一阶项消失以及 Hessian 等于 Fisher，

$$
\boxed{
D_{\mathrm{KL}}
\left(
p_\theta\|p_{\theta+\Delta\theta}
\right)
\mathrel{=}
\frac12
\Delta\theta^\top
G(\theta)
\Delta\theta
\mathbin{+}
o(\|\Delta\theta\|^2)
}.
$$

若 $G(\theta)\succ0$，则在足够小的邻域中，KL 球近似为椭球：

$$
\frac12
\Delta\theta^\top
G(\theta)
\Delta\theta
\le\epsilon.
$$

若 $G(\theta)$ 只有半正定且存在非平凡零空间，上式是退化的二次 sublevel set，并沿 $\ker G(\theta)$ 中的方向无界，不能称为椭球。

若某个方向具有较大的 Fisher curvature，那么相同的参数位移会造成更大的分布变化；若某个方向接近 Fisher 的零空间，那么参数变化可能几乎不改变模型分布。

---

## 5. KL trust region 中的最速下降

设 $L(\theta)$ 是需要最小化的光滑目标。对小位移 $\Delta\theta$，

$$
L(\theta+\Delta\theta)
\mathrel{=}
L(\theta)
\mathbin{+}
\nabla L(\theta)^\top\Delta\theta
\mathbin{+}
o(\|\Delta\theta\|).
$$

记

$$
g=\nabla_\theta L(\theta).
$$

若用 KL 的局部二次型限制“这一步不能让模型分布移动太远”，得到

$$
\min_{\Delta\theta}
\quad
g^\top\Delta\theta
\qquad
\text{s.t.}
\qquad
\frac12
\Delta\theta^\top G(\theta)\Delta\theta
\le\epsilon.
$$

**定理**：若 $G(\theta)\succ0$ 且 $g\ne0$，最优位移为

$$
\boxed{
\Delta\theta^\star
\mathrel{=}
\mathbin{-}
\sqrt{
\frac{2\epsilon}
{g^\top G(\theta)^{-1}g}
}
G(\theta)^{-1}g
}.
$$

{{< details summary="证明：KL trust region 的最速下降方向" >}}

最优点位于约束边界。取 Lagrangian

$$
\mathcal L(\Delta\theta,\lambda)
\mathrel{=}
g^\top\Delta\theta
\mathbin{+}
\lambda
\left(
\frac12\Delta\theta^\top G\Delta\theta-\epsilon
\right),
\qquad
\lambda\ge0.
$$

对 $\Delta\theta$ 求导：

$$
\nabla_{\Delta\theta}\mathcal L
=g+\lambda G\Delta\theta.
$$

stationarity 给出

$$
g+\lambda G\Delta\theta=0,
$$

因此

$$
\Delta\theta
=-\frac1\lambda G^{-1}g.
$$

代入 active constraint：

$$
\frac1{2\lambda^2}
g^\top G^{-1}g
=\epsilon.
$$

所以

$$
\frac1\lambda
\mathrel{=}
\sqrt{
\frac{2\epsilon}
{g^\top G^{-1}g}
}.
$$

最终得到

$$
\Delta\theta^\star
\mathrel{=}
\mathbin{-}
\sqrt{
\frac{2\epsilon}
{g^\top G^{-1}g}
}
G^{-1}g.
$$

证毕。

{{< /details >}}

因此定义 **natural gradient**

$$
\widetilde\nabla_\theta L
\mathrel{=}
G(\theta)^{-1}
\nabla_\theta L.
$$

natural gradient 本身没有负号；用于最小化时，下降更新为

$$
\theta_{t+1}
\mathrel{=}
\theta_t
\mathbin{-}
\alpha
\widetilde\nabla_\theta L(\theta_t).
$$

---

## 6. Natural gradient 的坐标一致性

设 $\theta=\theta(\phi)$ 是局部可逆重参数化，记

$$
J=\frac{\partial\theta}{\partial\phi}.
$$

普通梯度作为 covector 变换：

$$
\nabla_\phi L
=J^\top\nabla_\theta L.
$$

Fisher metric 由 G1 得到

$$
G_\phi
=J^\top G_\theta J.
$$

因此

$$
\begin{aligned}
G_\phi^{-1}\nabla_\phi L
&=
(J^\top G_\theta J)^{-1}
J^\top\nabla_\theta L\\
&=
J^{-1}G_\theta^{-1}\nabla_\theta L.
\end{aligned}
$$

这正是切向量从 $\theta$ 坐标转换到 $\phi$ 坐标的规则。natural-gradient 向量描述的是同一个分布空间方向；参数矩阵的数值表示会变，但方向的几何含义不依赖坐标选择。

这里的坐标一致性严格针对切向量，也就是无穷小方向。若直接在两个非线性坐标系中分别做有限步长的 Euler 更新，则一般只能保证一阶一致。事实上，记

$$
v_\phi\mathrel{=}G_\phi^{-1}\nabla_\phi L,
\qquad
v_\theta\mathrel{=}G_\theta^{-1}\nabla_\theta L
\mathrel{=}Jv_\phi,
$$

则

$$
\theta(\phi-\alpha v_\phi)
\mathrel{=}
\theta(\phi)-\alpha v_\theta+O(\alpha^2).
$$

因此有限 Euler step 本身并不在任意非线性重参数化下精确相同；精确陈述是 natural-gradient direction 的坐标无关性。

---

## 7. 奇异 Fisher 与 damping

若模型含有冗余参数、对称性或局部不可辨识方向，$G$ 可能只有半正定。此时不能直接使用普通逆矩阵。

先回到第 5 节的退化二次 trust-region 问题。由于 $G$ 对称，

$$
\operatorname{Range}(G)
\mathrel{=}
\ker(G)^\perp.
$$

若

$$
g\notin\operatorname{Range}(G),
$$

则存在 $z\in\ker(G)$ 使 $g^\top z\lt0$。任取可行的 $\Delta\theta$，沿 $\Delta\theta+t z$ 移动都不增加二次约束，而目标

$$
g^\top(\Delta\theta+t z)
\longrightarrow -\infty
$$

当 $t\to\infty$。因此此时退化的局部 trust-region 问题无下界，不能把 $G^+g$ 解释为该问题的最优解。

若 $g\in\operatorname{Range}(G)$ 且 $g\ne0$，目标对所有 Fisher-null directions 都不变，最优解族为

$$
\Delta\theta^\star
\mathrel{=}
\mathbin{-}
\sqrt{
\frac{2\epsilon}
{g^\top G^+g}
}
G^+g+z,
\qquad
z\in\ker(G).
$$

其中 $z=0$ 给出当前参数坐标的 Euclidean minimum-norm representative；若 $g=0$，则每个可行点都是最优解。因此在 $g\in\operatorname{Range}(G)$ 的情形，可以把伪逆方向记为

$$
\widetilde\nabla L
\mathrel{=}
G^+\nabla L,
$$

其中 $G^+$ 是 Moore–Penrose pseudoinverse。数值计算中也常使用 damping：

$$
\widetilde\nabla_\lambda L
\mathrel{=}
(G+\lambda I)^{-1}\nabla L,
\qquad
\lambda>0.
$$

Moore–Penrose inverse 依赖所选参数坐标中的 Euclidean inner product；对一般重参数化，它不满足普通逆矩阵的 tensor 变换规则。因此 $G^+\nabla L$ 不能无条件继承上一节的完整坐标一致性。若退化来自冗余参数，内在做法是先对 Fisher-null directions 取商；伪逆给出的是该等价类在当前坐标中的一个代表。

damping 同时改变了原始 Fisher 几何，因此它是数值稳定与几何精确性之间的折中，不应与精确 natural gradient 混为一谈。

---

## 8. 可选应用桥接：K-FAC 的 Kronecker 近似

本节把前面的几何推导连接到神经网络近似优化，不是 G3 与 G4 的逻辑前置。natural gradient 的主要计算障碍是 Fisher matrix 的规模。考虑一层线性映射

$$
u=Wa,
\qquad
W\in\mathbb R^{m\times n},
$$

其中 $a\in\mathbb R^n$ 是输入 activation。令

$$
\delta
\mathrel{=}
\nabla_u\ln p_\theta(y\mid x).
$$

该层权重对应的 score 为

$$
S_W
\mathrel{=}
\nabla_W\ln p_\theta(y\mid x)
\mathrel{=}
\delta a^\top.
$$

采用 column-major vectorization，

$$
\operatorname{vec}(\delta a^\top)
\mathrel{=}
a\otimes\delta.
$$

对 conditional model，固定输入分布 $q(x)$。若这里讨论 true Fisher，以下期望均关于

$$
x\sim q(x),
\qquad
\widetilde y\sim p_\theta(\cdot\mid x)
$$

联合取值，且 score 中的 $y$ 应理解为模型生成的 $\widetilde y$。所以该层的精确 Fisher block 为

$$
\begin{aligned}
F_W
&=
\mathbb E_{x,\widetilde y}
\left[
\operatorname{vec}(S_W)
\operatorname{vec}(S_W)^\top
\right]\\
&=
\mathbb E_{x,\widetilde y}
\left[
(aa^\top)\otimes(\delta\delta^\top)
\right].
\end{aligned}
$$

K-FAC 使用 moment-factorization approximation：

$$
\mathbb E_{x,\widetilde y}
\left[
(aa^\top)\otimes(\delta\delta^\top)
\right]
\approx
\mathbb E_{x,\widetilde y}[aa^\top]
\otimes
\mathbb E_{x,\widetilde y}[\delta\delta^\top].
$$

记

$$
A\mathrel{=}\mathbb E_{x,\widetilde y}[aa^\top],
\qquad
S\mathrel{=}\mathbb E_{x,\widetilde y}[\delta\delta^\top],
$$

则

$$
F_W\approx A\otimes S.
$$

这两个因子通常是 uncentered second-moment matrices，而不一定是 covariance matrices。普通的

$$
\operatorname{Cov}(a,\delta)=0
$$

不足以推出上述分解，因为被近似的是四阶矩。$a$ 与 $\delta$ 独立是充分条件，但真实网络中通常只把它作为近似。

由于 $A$ 与 $S$ 都是半正定矩阵，它们未必可逆。只有在

$$
A\succ0,
\qquad
S\succ0
$$

时，才能利用

$$
(A\otimes S)^{-1}
=A^{-1}\otimes S^{-1},
$$

从而把近似 natural-gradient block 写成

$$
\operatorname{mat}
\left(
F_W^{-1}
\operatorname{vec}(\nabla_WL)
\right)
\approx
S^{-1}
(\nabla_WL)
A^{-1}.
$$

若因子奇异，则 Moore–Penrose inverse 满足

$$
(A\otimes S)^+
\mathrel{=}
A^+\otimes S^+,
$$

但它继承第 7 节所述的坐标与可解性边界。另一种做法是对近似 Fisher block 使用 damping。需要注意，一般并没有

$$
(A\otimes S+\lambda I)^{-1}
\mathrel{=}
(A+\lambda_A I)^{-1}
\otimes
(S+\lambda_S I)^{-1}.
$$

因此 factorwise damping 是为了计算可行而引入的又一层近似，不是 exact damped Fisher block 的 Kronecker 分解。

对 $W\in\mathbb R^{m\times n}$，直接求逆 $mn\times mn$ 的 Fisher block 需要

$$
O((mn)^3),
$$

而两个因子分别求逆的代价为

$$
O(m^3+n^3).
$$

若把上面 true Fisher 期望中的模型生成标签替换为训练标签，形成的是 empirical Fisher，两者一般不同。完整 K-FAC 还会近似 cross-layer blocks。

因此 K-FAC 的身份是：

$$
\text{Natural Gradient}
\quad
\xrightarrow{\text{layer/block + moment approximation}}
\quad
\text{可计算的 Kronecker 预条件更新}.
$$

---

## 总结与下一站

本篇建立了

$$
\left.
\nabla_{\theta'}D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
\right|_{\theta'=\theta}
=0,
$$

$$
\left.
\nabla_{\theta'}^2D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
\right|_{\theta'=\theta}
=G(\theta),
$$

以及

$$
\Delta\theta_{\mathrm{descent}}
\propto
-G(\theta)^{-1}\nabla_\theta L.
$$

这些 KL 局部恒等式适用于满足篇首条件的一般正则参数化分布族；逆矩阵形式的 natural gradient 还要求 $G\succ0$，退化情形则服从第 7 节的额外边界。下一篇进入一个结构更强的子类：指数族。在 natural parameter 中，Fisher metric 会直接成为 log-partition function 的 Hessian。

[继续阅读：信息几何 G3——指数族、Log-partition 与 Expectation Parameter](/notes/math/information-geometry/note-ig-3-exponential-family/)

### 参考对接

- Shun-ichi Amari, *Natural Gradient Works Efficiently in Learning*.
- James Martens and Roger Grosse, *Optimizing Neural Networks with Kronecker-factored Approximate Curvature*.
