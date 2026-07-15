---
date: '2026-07-15T12:00:00+09:00'
draft: false
title: '信息几何 G1：Score Function 与 Fisher Information'
summary: "从正则参数化概率模型出发定义 score function，证明 score 零均值、Fisher information 的半正定性及其 score covariance 与 negative expected Hessian 两种等价形式，并建立坐标变换规则。"
description: "信息几何基础笔记：正则参数化分布族、score function、零均值恒等式、Fisher information matrix、正定性与可辨识性、negative expected Hessian identity，以及 Fisher metric 在重参数化下的张量变换。"
tags: ["Information Geometry", "Score Function", "Fisher Information", "Statistical Manifold", "Reparameterization", "Proof"]
categories: ["Crucible"]
---

# 信息几何 G1：Score Function 与 Fisher Information

> [共同基础 Part 3](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/) 把 KL 定义在两个分布之间。本篇把孤立的分布换成一族由参数 $\theta$ 标记的分布，并建立这族分布上的局部二次结构。

本篇的链条是：

$$
p_\theta
\longrightarrow
\ell_\theta(x)=\ln p_\theta(x)
\longrightarrow
s_\theta(x)=\nabla_\theta\ell_\theta(x)
\longrightarrow
\mathbb E_\theta[s_\theta]=0
\longrightarrow
G(\theta)=\mathbb E_\theta[s_\theta s_\theta^\top].
$$

---

## 1. 参数化概率模型与正则条件

设

$$
\mathcal P
=\{p_\theta:\theta\in\Theta\subset\mathbb R^d\}
$$

是一族相对于共同参考测度 $\mu$ 的概率密度：

$$
\int p_\theta(x)\,\mu(dx)=1.
$$

离散模型中，积分换成求和；有限离散字母表是所有推导最直接的情形。为了在一般写法下交换参数微分与积分，本篇假设：

1. $\Theta$ 是开集，所讨论的 $\theta$ 是内点；
2. $p_\theta$ 具有与 $\theta$ 无关的共同支撑，并在该支撑上为正；
3. $p_\theta(x)$ 关于 $\theta$ 至少二阶连续可微；
4. 参数微分可以与积分交换至二阶；
5. score 的二阶矩有限。

前四条保证后面的微分恒等式成立，第五条保证 Fisher information matrix 有限。后文在把正定的 $G(\theta)$ 称为 Riemannian metric 时，还假设这些正则条件足以保证 $G$ 随 $\theta$ 光滑变化；若只知道逐点有限与正定，它暂时只是每个切空间上的正定二次型。

本篇统一使用自然对数

$$
\ln,
$$

因此 KL 的单位是 nats。与共同基础中使用的 bits 之间有

$$
D_{\mathrm{KL}}^{(\mathrm{nats})}
=(\ln2)D_{\mathrm{KL}}^{(\mathrm{bits})}.
$$

---

## 2. Score function

定义 log-likelihood

$$
\ell_\theta(x)=\ln p_\theta(x).
$$

**定义（score function）**：

$$
s_\theta(x)
=\nabla_\theta\ell_\theta(x)
=\nabla_\theta\ln p_\theta(x).
$$

分量写法为

$$
s_i(x;\theta)
=\partial_i\ln p_\theta(x),
\qquad
i=1,\ldots,d.
$$

score 不是一个固定向量，而是依赖观测 $x$ 的随机向量：

$$
s_\theta(X),
\qquad X\sim p_\theta.
$$

它描述的是：在当前参数 $\theta$ 附近，观测 $x$ 的 log-density 对每个参数方向有多敏感。

---

## 3. Score 的期望为零

**定理**：在上述正则条件下，

$$
\mathbb E_\theta[s_\theta(X)]=0.
$$

{{< details summary="证明：Score 的零均值恒等式" >}}

由

$$
\nabla_\theta\ln p_\theta(x)
=\frac{\nabla_\theta p_\theta(x)}{p_\theta(x)},
$$

得到

$$
\begin{aligned}
\mathbb E_\theta[s_\theta(X)]
&=\int p_\theta(x)
\nabla_\theta\ln p_\theta(x)\,\mu(dx)\\
&=\int\nabla_\theta p_\theta(x)\,\mu(dx).
\end{aligned}
$$

由微分与积分可交换，

$$
\int\nabla_\theta p_\theta(x)\,\mu(dx)
\mathrel{=}
\nabla_\theta
\int p_\theta(x)\,\mu(dx).
$$

而归一化条件给出

$$
\int p_\theta(x)\,\mu(dx)=1.
$$

因此

$$
\mathbb E_\theta[s_\theta(X)]
=\nabla_\theta1
=0.
$$

证毕。

{{< /details >}}

这个零均值不是额外假设，而是概率归一化对参数求导后的直接结果。它使 score 的二阶矩与协方差相同。

---

## 4. Fisher information matrix

**定义（Fisher information matrix）**：

$$
G(\theta)
=\mathbb E_\theta
\left[
s_\theta(X)s_\theta(X)^\top
\right].
$$

因为 $\mathbb E_\theta[s_\theta]=0$，也可以写成

$$
G(\theta)
=\operatorname{Cov}_\theta[s_\theta(X)].
$$

分量形式为

$$
g_{ij}(\theta)
=\mathbb E_\theta
\left[
\partial_i\ln p_\theta(X)
\,
\partial_j\ln p_\theta(X)
\right].
$$

**命题（半正定性）**：对任意 $v\in\mathbb R^d$，

$$
v^\top G(\theta)v\ge0.
$$

{{< details summary="证明：Fisher information 的半正定性" >}}

直接展开：

$$
\begin{aligned}
v^\top G(\theta)v
&=
v^\top
\mathbb E_\theta[s_\theta s_\theta^\top]
v\\
&=
\mathbb E_\theta
\left[
v^\top s_\theta s_\theta^\top v
\right]\\
&=
\mathbb E_\theta
\left[
(v^\top s_\theta)^2
\right]\\
&\ge0.
\end{aligned}
$$

证毕。

{{< /details >}}

若存在非零 $v$ 使

$$
v^\top s_\theta(X)=0
\qquad p_\theta\text{-a.s.},
$$

则 $G(\theta)$ 在该方向上退化。只有在局部 regular、无冗余参数方向时，$G(\theta)$ 才正定并真正给出 Riemannian metric。分布族可辨识

$$
p_\theta=p_{\theta'}
\qquad \mu\text{-a.e.}
\Longrightarrow
\theta=\theta'
$$

是排除全局重复表示的条件；局部正定还要求参数切向量在当前点上线性独立。

---

## 5. Negative expected Hessian identity

Fisher information 还有一个等价形式。

**定理**：在正则条件下，

$$
G(\theta)
\mathrel{=}
-\mathbb E_\theta
\left[
\nabla_\theta^2\ln p_\theta(X)
\right].
$$

分量形式为

$$
g_{ij}(\theta)
\mathrel{=}
-\mathbb E_\theta
\left[
\partial_i\partial_j\ln p_\theta(X)
\right].
$$

{{< details summary="证明：Fisher information 的 negative expected Hessian 形式" >}}

从 score 零均值出发：

$$
\mathbb E_\theta[s_i(X;\theta)]=0.
$$

对 $\theta_j$ 求导。参数依赖同时出现在密度和 score 中：

$$
\begin{aligned}
0
&=\partial_j
\int p_\theta(x)s_i(x;\theta)\,\mu(dx)\\
&=
\int
\left[
\partial_jp_\theta(x)\,s_i(x;\theta)
\mathbin{+}
p_\theta(x)\,\partial_js_i(x;\theta)
\right]
\mu(dx).
\end{aligned}
$$

利用

$$
\partial_jp_\theta(x)
=p_\theta(x)s_j(x;\theta),
$$

得到

$$
0
\mathrel{=}
\mathbb E_\theta[s_i(X;\theta)s_j(X;\theta)]
\mathbin{+}
\mathbb E_\theta[\partial_j s_i(X;\theta)].
$$

而

$$
\partial_js_i(x;\theta)
=\partial_j\partial_i\ln p_\theta(x).
$$

因此

$$
\mathbb E_\theta[s_is_j]
\mathrel{=}
-\mathbb E_\theta
\left[
\partial_i\partial_j\ln p_\theta(X)
\right].
$$

逐分量合并即得矩阵恒等式。

证毕。

{{< /details >}}

这两个表达式分别强调：

$$
G
\mathrel{=}
\text{score 的二阶矩}
\mathrel{=}
\text{log-density 的平均负曲率}.
$$

---

## 6. 重参数化与 metric tensor

设同一分布族改用坐标 $\phi$，并且

$$
\theta=\theta(\phi)
$$

是局部可逆的光滑变换。记 Jacobian

$$
J=\frac{\partial\theta}{\partial\phi}.
$$

由链式法则，

$$
s_\phi(x)
=\nabla_\phi\ln p_{\theta(\phi)}(x)
=J^\top s_\theta(x).
$$

因此

$$
\begin{aligned}
G_\phi
&=\mathbb E[s_\phi s_\phi^\top]\\
&=\mathbb E[J^\top s_\theta s_\theta^\top J]\\
&=J^\top G_\theta J.
\end{aligned}
$$

这正是一个 $(0,2)$ metric tensor 的坐标变换规则。$G$ 的矩阵元素会随参数坐标改变，但二次型

$$
d\theta^\top G_\theta d\theta
$$

保持同一个几何量，因为 $d\theta=J\,d\phi$：

$$
d\phi^\top G_\phi d\phi
\mathrel{=}
d\theta^\top G_\theta d\theta.
$$

Fisher information 因而不是参数空间中预先给定的 Euclidean matrix，而是由概率模型本身诱导的局部度量。

---

## 总结与下一站

本篇建立了 Fisher information 的三层结构：

$$
\mathbb E_\theta[s_\theta]=0,
$$

$$
G(\theta)
=\mathbb E_\theta[s_\theta s_\theta^\top]
=-\mathbb E_\theta[\nabla_\theta^2\ln p_\theta],
$$

以及

$$
G_\phi=J^\top G_\theta J.
$$

下一篇将证明：Fisher information 正是 KL divergence 在

$$
\theta'=\theta
$$

附近的二阶 Hessian，由此得到 KL trust region 中的 natural gradient，并把同一结构连接到 K-FAC。

[继续阅读：信息几何 G2——KL 的局部二阶结构、Natural Gradient 与 K-FAC](/notes/math/information-geometry/note-ig-2-kl-natural-gradient/)
