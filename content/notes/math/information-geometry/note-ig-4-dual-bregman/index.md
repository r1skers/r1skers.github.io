---
date: '2026-07-15T09:45:00+09:00'
draft: false
title: '信息几何 G4：Legendre 对偶、Bregman 散度与 KL'
summary: "从指数族的 log-partition function 出发，构造其 Legendre 对偶，证明自然参数与期望参数互为对偶坐标、两套 Hessian 互逆，并严格推出 KL 等于方向反转的 Bregman 散度。"
description: "信息几何进阶笔记：指数族的 Legendre–Fenchel 共轭、natural/expectation dual coordinates、对偶 Hessian、负熵与 base measure 修正、Bregman divergence、KL-Bregman 对应及 dually flat geometry。"
tags: ["Information Geometry", "Legendre Duality", "Bregman Divergence", "KL Divergence", "Exponential Family", "Dual Coordinates", "Proof"]
categories: ["Crucible"]
---

# 信息几何 G4：Legendre 对偶、Bregman 散度与 KL

> G3 已经证明，在正则指数族的 natural parameter 中，log-partition function 满足 $\eta=\nabla A(\theta)$ 与 $G(\theta)=\nabla^2A(\theta)$。本篇把这两个式子提升为一套对偶结构：$A$ 生成自然参数侧的几何，$A^*$ 生成期望参数侧的几何，而 KL divergence 正是这套凸几何中的 Bregman divergence。

本篇仍使用自然对数，KL 的单位为 nats。假设所讨论的指数族正则且 minimal，并沿用 G3 定义的可达 expectation-parameter region

$$
\mathcal E=\nabla A(\Theta).
$$

以下始终取 $\theta\in\Theta$ 与 $\eta\in\mathcal E$。于是 $A$ 严格凸、二阶可微，且

$$
\eta=\nabla A(\theta),
\qquad
G(\theta)=\nabla^2A(\theta)\succ0.
$$

---

## 1. 从参数变换到 Legendre 对偶

G3 中的映射

$$
\theta\longmapsto\eta=\nabla A(\theta)
$$

不是任意的坐标替换。它来自凸函数 $A$ 的 **Legendre–Fenchel 共轭**：

$$
\boxed{
A^*(\eta)
\mathrel{=}
\sup_{v\in\Theta}
\left\{
v^\top\eta-A(v)
\right\}
}.
$$

对固定的 $\eta$，上式寻找斜率为 $\eta$ 的支撑超平面与 $A$ 之间的截距。严格凸性只保证最优点至多唯一，并不单独保证 supremum 一定取得；当 $\eta=\nabla A(\theta)$ 时，$v=\theta$ 满足一阶条件，supremum 才确定在该点取得。

**定理**：若 $\eta=\nabla A(\theta)$，则

$$
\boxed{
A^*(\eta)
\mathrel{=}
\theta^\top\eta-A(\theta)
},
$$

并且

$$
\boxed{
\nabla_\eta A^*(\eta)=\theta
}.
$$

{{< details summary="证明：自然参数与期望参数互为对偶坐标" >}}

令

$$
F_\eta(v)
\mathrel{=}
v^\top\eta-A(v).
$$

最优点满足一阶条件

$$
\nabla_vF_\eta(v)
\mathrel{=}
\eta-\nabla A(v)
=0.
$$

因为 $\eta=\nabla A(\theta)$，且 $A$ 严格凸，所以唯一最优点为 $v=\theta$。因此

$$
A^*(\eta)
\mathrel{=}
\theta^\top\eta-A(\theta).
$$

现在把 $\theta$ 看成 $\eta$ 的函数。对上式取微分：

$$
\begin{aligned}
dA^*(\eta)
&=
d\theta^\top\eta
\mathbin{+}
\theta^\top d\eta
\mathbin{-}
\nabla A(\theta)^\top d\theta\\
&=
\theta^\top d\eta,
\end{aligned}
$$

其中使用了 $\nabla A(\theta)=\eta$。故

$$
\nabla_\eta A^*(\eta)=\theta.
$$

证毕。

{{< /details >}}

于是两套坐标由互逆梯度映射连接：

$$
\eta=\nabla A(\theta),
\qquad
\theta=\nabla A^*(\eta).
$$

---

## 2. 两套 Hessian 互逆

由 G3，

$$
d\eta
\mathrel{=}
\nabla^2A(\theta)d\theta
\mathrel{=}
G(\theta)d\theta.
$$

由于 $G(\theta)\succ0$，可以反解为

$$
d\theta
\mathrel{=}
G(\theta)^{-1}d\eta.
$$

另一方面，由 $\theta=\nabla A^*(\eta)$，

$$
d\theta
\mathrel{=}
\nabla^2A^*(\eta)d\eta.
$$

比较两个式子得到

$$
\boxed{
\nabla^2A^*(\eta)
\mathrel{=}
\left(\nabla^2A(\theta)\right)^{-1}
\mathrel{=}
G(\theta)^{-1}
}.
$$

这解释了 natural gradient 中 $G^{-1}$ 的另一个来源：它既是 Fisher metric 的逆，也是在 expectation coordinate 中由对偶势函数 $A^*$ 生成的 Hessian。

---

## 3. $A^*$ 与负熵之间的关系

指数族密度为

$$
p_\theta(x)
\mathrel{=}
h(x)
\exp\left(
\theta^\top T(x)-A(\theta)
\right).
$$

相对于参考测度 $\mu$，定义

$$
H_\mu(P_\theta)
\mathrel{=}
-\mathbb E_\theta[\ln p_\theta(X)].
$$

代入 log-density：

$$
\begin{aligned}
-H_\mu(P_\theta)
&=
\mathbb E_\theta[\ln p_\theta(X)]\\
&=
\mathbb E_\theta[\ln h(X)]
\mathbin{+}
\theta^\top\mathbb E_\theta[T(X)]
\mathbin{-}
A(\theta)\\
&=
\mathbb E_\theta[\ln h(X)]
\mathbin{+}
A^*(\eta).
\end{aligned}
$$

所以一般公式是

$$
\boxed{
A^*(\eta)
\mathrel{=}
-H_\mu(P_\theta)
\mathbin{-}
\mathbb E_\theta[\ln h(X)]
}.
$$

若 $h\equiv1$，上式直接化为 $A^*(\eta)=-H_\mu(P_\theta)$。更一般地，可以在 carrier 上定义新的参考测度

$$
\nu(dx)=h(x)\mu(dx).
$$

此时 $P_\theta$ 相对于 $\nu$ 的密度是

$$
q_\theta(x)
\mathrel{=}
\frac{dP_\theta}{d\nu}(x)
\mathrel{=}
e^{\theta^\top T(x)-A(\theta)}.
$$

若明确把熵记为相对于 $\nu$ 的

$$
H_\nu(P_\theta)
\mathrel{=}
-\mathbb E_\theta[\ln q_\theta(X)],
$$

则

$$
\begin{aligned}
-H_\nu(P_\theta)
&=
\theta^\top\eta-A(\theta)\\
&=
A^*(\eta).
\end{aligned}
$$

因此“对偶势函数是负熵”必须连同参考测度一起理解。吸收 $h$ 之后准确的简写是

$$
\boxed{
A^*(\eta)=-H_\nu(P_\theta)
},
$$

而不是一个省略参考测度后仍然不变的绝对熵等式。

---

## 4. Bregman divergence

设 $F$ 是定义在凸域上的可微严格凸函数。由 $F$ 生成的 **Bregman divergence** 定义为

$$
\boxed{
B_F(u\|v)
\mathrel{=}
F(u)-F(v)-\nabla F(v)^\top(u-v)
}.
$$

凸函数位于任一点的支撑超平面之上：

$$
F(u)
\ge
F(v)+\nabla F(v)^\top(u-v).
$$

移项便得

$$
B_F(u\|v)\ge0.
$$

当 $F$ 严格凸时，等号成立当且仅当 $u=v$。Bregman divergence 通常不对称，也不满足三角不等式；这里的 “divergence” 表示由凸势函数生成的有向差异，而不是距离度量。

---

## 5. 指数族中的 KL 等于 Bregman divergence

取同一指数族中的两个分布 $p_\theta$ 与 $p_{\theta'}$。它们共享 $h(x)$ 与 $T(x)$，所以

$$
\ln\frac{p_\theta(x)}{p_{\theta'}(x)}
\mathrel{=}
(\theta-\theta')^\top T(x)
-A(\theta)+A(\theta').
$$

在 $p_\theta$ 下取期望：

$$
\begin{aligned}
D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
&=
(\theta-\theta')^\top\eta
-A(\theta)+A(\theta')\\
&=
A(\theta')-A(\theta)
-\nabla A(\theta)^\top(\theta'-\theta).
\end{aligned}
$$

与 Bregman divergence 的定义比较，得到

$$
\boxed{
D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
\mathrel{=}
B_A(\theta'\|\theta)
}.
$$

注意两边的参数顺序反转：KL 的期望取在 $p_\theta$ 下，因此切平面也取在 $A$ 的 $\theta$ 点；按照 $B_A(u\|v)$ 的定义，这对应 $u=\theta'$、$v=\theta$。

---

## 6. 对偶坐标中的同一个 KL

令

$$
\eta=\nabla A(\theta),
\qquad
\eta'=\nabla A(\theta').
$$

由

$$
A^*(\eta)=\theta^\top\eta-A(\theta),
\qquad
\nabla A^*(\eta')=\theta',
$$

可得

$$
\begin{aligned}
B_{A^*}(\eta\|\eta')
&=
A^*(\eta)-A^*(\eta')
-\theta'^\top(\eta-\eta')\\
&=
A(\theta')-A(\theta)
-\eta^\top(\theta'-\theta)\\
&=
B_A(\theta'\|\theta).
\end{aligned}
$$

因此

$$
\boxed{
D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
\mathrel{=}
B_A(\theta'\|\theta)
\mathrel{=}
B_{A^*}(\eta\|\eta')
}.
$$

同一个 KL 在 natural coordinate 与 expectation coordinate 中各有一个 Bregman 表达，而且两边的方向恰好对偶。

---

## 7. Dually flat geometry 的入口

现在已有两套互为对偶的坐标和势函数：

$$
\theta
\xrightarrow{\nabla A}
\eta,
\qquad
\eta
\xrightarrow{\nabla A^*}
\theta,
$$

$$
\nabla^2A(\theta)=G(\theta),
\qquad
\nabla^2A^*(\eta)=G(\theta)^{-1}.
$$

到目前为止，本篇已经证明的是 gradient-dual coordinates、Hessian 互逆与 KL--Bregman 对应；这些等式是 dually flat geometry 的势函数结构，但仅凭这些计算还没有在本文内部定义或证明两套 affine connection。

信息几何中的标准定理进一步说明：对正则 minimal 指数族，可以定义彼此关于 Fisher metric 对偶的 exponential connection 与 mixture connection；前者在 $\theta$ 坐标中平坦，后者在 $\eta$ 坐标中平坦。于是 $\theta$ 坐标中的直线具有 exponential-affine 意义，$\eta$ 坐标中的直线具有 mixture-affine 意义，这才构成完整的 **dually flat geometry**。

本节只把这个标准定理作为后续结构的入口：这里尚未定义 connection、Christoffel symbols 与 curvature，也尚未证明两套 connection 的 metric duality 或 flatness。因此不能把上一段的完整 dually flat 结论视为仅由本篇现有等式已经证明。

到这里，手写笔记中的链条已经闭合：

$$
A
\xrightarrow{\nabla}
\eta,
\qquad
A
\xrightarrow{\nabla^2}
G,
\qquad
A
\xrightarrow{\text{Legendre}}
A^*,
\qquad
A
\xrightarrow{\text{Bregman}}
D_{\mathrm{KL}}.
$$

这条线继续深入时，下一层自然是 $e$-connection、$m$-connection、投影定理与 Pythagorean relation，而不是信道模型。

---

## 总结

本篇的核心等式是

$$
\eta=\nabla A(\theta),
\qquad
\theta=\nabla A^*(\eta),
$$

$$
\nabla^2A^*(\eta)
\mathrel{=}
\left(\nabla^2A(\theta)\right)^{-1}
\mathrel{=}
G(\theta)^{-1},
$$

以及

$$
D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
\mathrel{=}
B_A(\theta'\|\theta)
\mathrel{=}
B_{A^*}(\eta\|\eta').
$$

[返回：信息论与信息几何路线图](/notes/math/information-theory/note-it-0-roadmap/)

### 参考对接

- Shun-ichi Amari, *Information Geometry and Its Applications*.
- Martin J. Wainwright and Michael I. Jordan, *Graphical Models, Exponential Families, and Variational Inference*.
- Arindam Banerjee et al., *Clustering with Bregman Divergences*.
