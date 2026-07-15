---
date: '2026-07-15T13:00:00+09:00'
draft: false
title: '信息几何 G3：指数族、Log-partition 与 Expectation Parameter'
summary: "从指数族的归一化结构定义 log-partition function，证明其梯度等于充分统计量的期望、Hessian 等于协方差，并由此得到 Fisher information 等于 log-partition Hessian。"
description: "信息几何进阶笔记：正则指数族、natural parameter、充分统计量、log-partition function、expectation parameter、score、log-partition 的一二阶导数、Fisher information、凸性、minimality 与自然/均值坐标映射。"
tags: ["Information Geometry", "Exponential Family", "Log-Partition Function", "Expectation Parameter", "Fisher Information", "Convexity", "Proof"]
categories: ["Crucible"]
---

# 信息几何 G3：指数族、Log-partition 与 Expectation Parameter

> G1–G2 在一般正则参数化分布族上建立了 score、Fisher metric 与 natural gradient。本篇加入指数族结构。在 natural parameter 中，归一化函数 $A(\theta)$ 同时编码均值、协方差与 Fisher information。

本篇的链条是：

$$
\begin{aligned}
p_\theta(x)
\mathrel{=}
h(x)e^{\theta^\top T(x)-A(\theta)}
&\longrightarrow
\nabla A(\theta)=\mathbb E_\theta[T(X)]\\
&\longrightarrow
\nabla^2A(\theta)=\operatorname{Cov}_\theta[T(X)]\\
&\longrightarrow
G(\theta)=\nabla^2A(\theta).
\end{aligned}
$$

仍统一使用自然对数与 nats。

---

## 1. 指数族

相对于参考测度 $\mu$，考虑密度

$$
p_\theta(x)
\mathrel{=}
h(x)
\exp
\left(
\theta^\top T(x)-A(\theta)
\right).
$$

其中：

- $\theta\in\mathbb R^d$ 是 **natural parameter**；
- $T(x)\in\mathbb R^d$ 是充分统计量向量；
- $h(x)\ge0$ 是 base density；
- $A(\theta)$ 是 log-partition function。

为了使 $p_\theta$ 归一化，必须有

$$
\int
h(x)e^{\theta^\top T(x)-A(\theta)}
\,\mu(dx)
=1.
$$

因此

$$
e^{A(\theta)}
\mathrel{=}
\int h(x)e^{\theta^\top T(x)}\,\mu(dx),
$$

即

$$
\boxed{
A(\theta)
\mathrel{=}
\ln
\int h(x)e^{\theta^\top T(x)}\,\mu(dx)
}.
$$

natural parameter space 定义为

$$
\Theta
\mathrel{=}
\left\{
\theta\in\mathbb R^d:
A(\theta)\lt\infty
\right\}.
$$

natural parameter space 的凸性并不是额外假设，它与 $A$ 的凸性都直接来自 Hölder inequality。

**命题**：$\Theta$ 是凸集，并且 $A$ 在 $\Theta$ 上为凸函数。

{{< details summary="证明：由 Hölder inequality 得到自然参数域与 Log-partition 的凸性" >}}

记

$$
Z(\theta)
\mathrel{=}
\int h(x)e^{\theta^\top T(x)}\,\mu(dx).
$$

任取 $\theta_0,\theta_1\in\Theta$ 与 $t\in(0,1)$。由于

$$
\begin{aligned}
&h(x)e^{((1-t)\theta_0+t\theta_1)^\top T(x)}\\
&\mathrel{=}
\left(
h(x)e^{\theta_0^\top T(x)}
\right)^{1-t}
\left(
h(x)e^{\theta_1^\top T(x)}
\right)^t,
\end{aligned}
$$

对共轭指数

$$
r=\frac1{1-t},
\qquad
s=\frac1t
$$

使用 Hölder inequality，得到

$$
\begin{aligned}
Z((1-t)\theta_0+t\theta_1)
&\le
Z(\theta_0)^{1-t}
Z(\theta_1)^t\\
&\lt\infty.
\end{aligned}
$$

因此

$$
(1-t)\theta_0+t\theta_1\in\Theta,
$$

所以 $\Theta$ 是凸集。再对 Hölder inequality 的结论取自然对数：

$$
A((1-t)\theta_0+t\theta_1)
\le
(1-t)A(\theta_0)+tA(\theta_1),
$$

故 $A$ 在 $\Theta$ 上为凸函数。$t=0,1$ 的情形直接成立。

证毕。

{{< /details >}}

本篇讨论 **regular exponential family**：$\Theta$ 是非空开集，并且在 $\Theta$ 上允许交换参数微分与积分。上面的命题已经说明，自然参数域还自动是凸集。

---

## 2. Log-partition 的一阶导数

**定理**：

$$
\boxed{
\nabla_\theta A(\theta)
\mathrel{=}
\mathbb E_\theta[T(X)]
}.
$$

定义 **expectation parameter** 或 **mean parameter**

$$
\eta
\mathrel{=}
\mathbb E_\theta[T(X)].
$$

于是

$$
\eta=\nabla A(\theta).
$$

{{< details summary="证明：Log-partition 的梯度等于充分统计量期望" >}}

记

$$
Z(\theta)
\mathrel{=}
\int h(x)e^{\theta^\top T(x)}\,\mu(dx),
$$

所以

$$
A(\theta)=\ln Z(\theta).
$$

对第 $i$ 个参数求导：

$$
\partial_iA(\theta)
\mathrel{=}
\frac{\partial_iZ(\theta)}{Z(\theta)}.
$$

由微分与积分可交换，

$$
\partial_iZ(\theta)
\mathrel{=}
\int
T_i(x)
h(x)e^{\theta^\top T(x)}
\,\mu(dx).
$$

又因为

$$
p_\theta(x)
\mathrel{=}
\frac{
h(x)e^{\theta^\top T(x)}
}{
Z(\theta)
},
$$

所以

$$
\begin{aligned}
\partial_iA(\theta)
&=
\int
T_i(x)
\frac{
h(x)e^{\theta^\top T(x)}
}{
Z(\theta)
}
\,\mu(dx)\\
&=
\int T_i(x)p_\theta(x)\,\mu(dx)\\
&=
\mathbb E_\theta[T_i(X)].
\end{aligned}
$$

逐分量合并得到

$$
\nabla A(\theta)
\mathrel{=}
\mathbb E_\theta[T(X)].
$$

证毕。

{{< /details >}}

---

## 3. 指数族的 score

指数族的 log-density 为

$$
\ln p_\theta(x)
\mathrel{=}
\ln h(x)
\mathbin{+}
\theta^\top T(x)
\mathbin{-}
A(\theta).
$$

对 $\theta$ 求梯度：

$$
\begin{aligned}
s_\theta(x)
&=
\nabla_\theta\ln p_\theta(x)\\
&=
T(x)-\nabla A(\theta)\\
&=
T(x)-\eta.
\end{aligned}
$$

因此 score 正是充分统计量相对于其均值的中心化：

$$
\boxed{
s_\theta(X)
\mathrel{=}
T(X)-\mathbb E_\theta[T(X)]
}.
$$

立即得到

$$
\mathbb E_\theta[s_\theta(X)]=0,
$$

与 G1 的一般恒等式一致。

---

## 4. Log-partition 的二阶导数

**定理**：

$$
\boxed{
\nabla_\theta^2A(\theta)
\mathrel{=}
\operatorname{Cov}_\theta[T(X)]
}.
$$

分量形式为

$$
\partial_j\partial_iA(\theta)
\mathrel{=}
\operatorname{Cov}_\theta
\left(
T_i(X),T_j(X)
\right).
$$

{{< details summary="证明：Log-partition Hessian 等于充分统计量协方差" >}}

由上一节，

$$
\partial_iA(\theta)
\mathrel{=}
\mathbb E_\theta[T_i(X)]
\mathrel{=}
\int T_i(x)p_\theta(x)\,\mu(dx).
$$

对 $\theta_j$ 求导：

$$
\partial_j\partial_iA(\theta)
\mathrel{=}
\int
T_i(x)
\partial_jp_\theta(x)
\,\mu(dx).
$$

由 score 恒等式，

$$
\partial_jp_\theta(x)
\mathrel{=}
p_\theta(x)
\partial_j\ln p_\theta(x).
$$

而指数族 score 为

$$
\partial_j\ln p_\theta(x)
\mathrel{=}
T_j(x)-\mathbb E_\theta[T_j(X)].
$$

因此

$$
\begin{aligned}
\partial_j\partial_iA(\theta)
&=
\int
T_i(x)p_\theta(x)
\left(
T_j(x)-\mathbb E_\theta[T_j]
\right)
\mu(dx)\\
&=
\mathbb E_\theta[T_iT_j]
\mathbin{-}
\mathbb E_\theta[T_i]
\mathbb E_\theta[T_j]\\
&=
\operatorname{Cov}_\theta(T_i,T_j).
\end{aligned}
$$

逐分量合并得到

$$
\nabla^2A(\theta)
\mathrel{=}
\operatorname{Cov}_\theta[T(X)].
$$

证毕。

{{< /details >}}

---

## 5. Fisher information 是 $A$ 的 Hessian

由指数族 score

$$
s_\theta(X)=T(X)-\eta
$$

以及 Fisher information 定义，

$$
\begin{aligned}
G(\theta)
&=
\mathbb E_\theta
\left[
s_\theta(X)s_\theta(X)^\top
\right]\\
&=
\mathbb E_\theta
\left[
(T(X)-\eta)(T(X)-\eta)^\top
\right]\\
&=
\operatorname{Cov}_\theta[T(X)].
\end{aligned}
$$

结合上一节：

$$
\boxed{
G(\theta)
\mathrel{=}
\operatorname{Cov}_\theta[T(X)]
\mathrel{=}
\nabla_\theta^2A(\theta)
}.
$$

这条等式只在 natural parameter $\theta$ 中直接成立。若进行非线性重参数化，Fisher metric 仍按

$$
G_\phi=J^\top G_\theta J
$$

变换，但不能把重写后的 $A$ 的普通 Hessian 不加修正地当成新坐标中的 Fisher matrix，因为 Hessian 在一般非线性坐标变换下不是 tensor。

---

## 6. 凸性、Minimality 与坐标映射

第 1 节已经由 Hölder inequality 证明 $A$ 在整个 $\Theta$ 上为凸函数。这里的一阶、二阶导数公式进一步给出其局部曲率：因为协方差矩阵半正定，

$$
\nabla^2A(\theta)\succeq0.
$$

这与 Hölder inequality 得到的全局凸性一致。

若指数族是 **minimal**，即不存在非零 $c\in\mathbb R^d$ 与常数 $b$，使

$$
c^\top T(x)=b
$$

在 carrier measure 下几乎处处成立，则没有充分统计量的冗余线性方向。此时在正则区域内，

$$
\operatorname{Cov}_\theta[T(X)]\succ0,
$$

因此

$$
\nabla^2A(\theta)\succ0.
$$

{{< details summary="证明：Minimality 推出协方差矩阵正定" >}}

记 carrier measure 为

$$
\nu(dx)=h(x)\mu(dx).
$$

任取非零 $c\in\mathbb R^d$。由协方差二次型，

$$
\begin{aligned}
c^\top
\operatorname{Cov}_\theta[T(X)]c
&=
\operatorname{Var}_\theta
\left(c^\top T(X)\right)\\
&\ge0.
\end{aligned}
$$

若该值等于零，则存在常数 $b$，使

$$
c^\top T(X)=b
\qquad
P_\theta\text{-a.s.}
$$

而在 carrier 上，

$$
\frac{dP_\theta}{d\nu}(x)
\mathrel{=}
e^{\theta^\top T(x)-A(\theta)}
\gt0
\qquad
\nu\text{-a.e.}
$$

所以 $P_\theta$ 与 $\nu$ 在 carrier 上具有相同的零测集。于是

$$
c^\top T(x)=b
\qquad
\nu\text{-a.e.},
$$

这与 minimality 矛盾。因此每个非零 $c$ 都满足

$$
c^\top
\operatorname{Cov}_\theta[T(X)]c
\gt0,
$$

故协方差矩阵正定。

证毕。

{{< /details >}}

因此 $A$ 在凸域 $\Theta$ 上严格凸。定义这族模型实际到达的 expectation-parameter region

$$
\mathcal E
\mathrel{=}
\nabla A(\Theta).
$$

由于 $\nabla^2A(\theta)\succ0$，inverse function theorem 保证 $\nabla A$ 在每一点附近都是 local diffeomorphism；因此它是开映射，$\mathcal E$ 是开集。另一方面，对任意不同的 $\theta_0,\theta_1\in\Theta$，令 $v=\theta_1-\theta_0$。因为 $\Theta$ 凸，整条线段都位于 $\Theta$，并且

$$
\begin{aligned}
v^\top
\left(
\nabla A(\theta_1)-\nabla A(\theta_0)
\right)
&=
\int_0^1
v^\top
\nabla^2A(\theta_0+tv)
v\,dt\\
&\gt0.
\end{aligned}
$$

所以 $\nabla A(\theta_1)\ne\nabla A(\theta_0)$，即 $\nabla A$ 是单射。按 $\mathcal E=\nabla A(\Theta)$ 的定义，它又满射到 $\mathcal E$；各个局部光滑逆映射因单射性彼此相容。因此

$$
\nabla A:
\Theta
\longrightarrow
\mathcal E
$$

是从 $\Theta$ 到 $\mathcal E$ 的 global diffeomorphism。这里把结论限制在可达区域 $\mathcal E$，不额外声称它等于某个更大可实现均值集合的全部内部。

若指数族非 minimal，则存在冗余方向，Fisher matrix 可能奇异，多个 natural parameter 可能表示同一分布。

---

## 7. Natural coordinate 与 Expectation coordinate

指数族同时给出两套坐标：

$$
\theta
\mathrel{=}
\text{natural parameter},
$$

$$
\eta
\mathrel{=}
\mathbb E_\theta[T(X)]
\mathrel{=}
\nabla A(\theta)
\in\mathcal E.
$$

$\eta$ 称为 **expectation parameter** 或 **mean parameter**。

它们之间的 Jacobian 正是 Fisher metric：

$$
\frac{\partial\eta}{\partial\theta}
\mathrel{=}
\nabla^2A(\theta)
\mathrel{=}
G(\theta).
$$

因此坐标函数的微分满足

$$
d\eta
\mathrel{=}
G(\theta)d\theta.
$$

等价地，对任意经过当前点的光滑曲线 $t\mapsto\theta(t)$，其切向量的两套坐标分量满足

$$
\dot\eta
\mathrel{=}
G(\theta)\dot\theta,
\qquad
\dot\theta
\mathrel{=}
G(\theta)^{-1}\dot\eta.
$$

这里的 $G^{-1}$ 首先是坐标变换 Jacobian 的逆，它把同一个切向量的 $\eta$-分量转换成 $\theta$-分量。另一方面，设 $L$ 是标量函数，并记其 differential 在两套坐标下的 covector 分量为

$$
g_\theta=\nabla_\theta L,
\qquad
g_\eta=\nabla_\eta L.
$$

由

$$
dL
\mathrel{=}
g_\theta^\top d\theta
\mathrel{=}
g_\eta^\top d\eta
$$

和 $d\eta=Gd\theta$，得到

$$
g_\eta
\mathrel{=}
G(\theta)^{-1}g_\theta.
$$

Fisher metric 将 covector $dL$ 升指标为 natural-gradient 切向量；该切向量的 $\theta$-坐标分量为

$$
\left(
\operatorname{grad}^{G}L
\right)^\theta
\mathrel{=}
G(\theta)^{-1}g_\theta
\mathrel{=}
g_\eta.
$$

其 $\eta$-坐标分量则为

$$
\left(
\operatorname{grad}^{G}L
\right)^\eta
\mathrel{=}
G(\theta)
\left(
\operatorname{grad}^{G}L
\right)^\theta
\mathrel{=}
g_\theta.
$$

所以“逆 Jacobian 在 $\eta$、$\theta$ 坐标之间转换切向量分量”与“逆 metric 把 covector 转成 tangent vector”是两个相关但不同的陈述；它们在 natural coordinate 中由 $G=\nabla^2A$ 使用同一个矩阵表示。

---

## 总结与下一站

本篇把指数族的核心结构压成三条等式：

$$
\eta
\mathrel{=}
\nabla A(\theta)
\mathrel{=}
\mathbb E_\theta[T(X)],
$$

$$
s_\theta(X)
\mathrel{=}
T(X)-\eta,
$$

$$
G(\theta)
\mathrel{=}
\nabla^2A(\theta)
\mathrel{=}
\operatorname{Cov}_\theta[T(X)].
$$

下一篇将对 $A$ 做 Legendre transform，证明

$$
\nabla A^*(\eta)=\theta,
\qquad
\nabla^2A^*(\eta)=G(\theta)^{-1},
$$

并把同一指数族内的 KL divergence 写成由 $A$ 生成的 Bregman divergence。

[继续阅读：信息几何 G4——Legendre 对偶、Bregman 散度与 KL](/notes/math/information-geometry/note-ig-4-dual-bregman/)

### 参考对接

- Martin J. Wainwright and Michael I. Jordan, *Graphical Models, Exponential Families, and Variational Inference*.
