---
date: '2026-07-15T10:00:00+09:00'
draft: false
title: '信息论 Part 1：自信息、熵与平均不确定性'
summary: "从独立事件的信息可加性出发推出对数形式的自信息，再把熵定义为平均自信息，并证明熵的非负性、最大值与凹性。"
description: "信息论基础笔记：有限离散字母表上的自信息与 Shannon 熵，自信息对数形式的刻画，熵的非负性、零点、最大熵上界及凹性证明。"
tags: ["Mathematics", "Information Theory", "Entropy"]
categories: ["Notes"]
series: ["Information Theory"]
note_kind: "foundation"
---

# 信息论 Part 1：自信息、熵与平均不确定性

> 这一组笔记只讨论**有限离散字母表**。目标不是先罗列公式，而是从“单次结果的信息量应满足什么结构”开始，一步一步推出熵，再证明熵为什么能够刻画平均不确定性。

本篇的链条是：

$$
\text{独立事件的信息可加}
\longrightarrow
\text{自信息 }-\log p
\longrightarrow
\text{熵 }H(X)
\longrightarrow
\text{非负性、最大值与凹性}.
$$

全文约定：

- 随机变量 $X$ 取值于有限字母表 $\mathcal X$；
- $p_X(x)=P(X=x)$，有效支持集记为 $S_X=\{x\in\mathcal X:p_X(x)>0\}$；
- $\log$ 均指 $\log_2$，因此信息单位是 bit；
- 约定 $0\log 0=0$。

---

## 1. 自信息：为什么必然出现对数

概率越小的结果，一旦发生，携带的信息应当越多。若两个独立结果同时发生，它们的联合概率相乘；与之对应的信息量应当相加。

设 $J:(0,1]\to[0,\infty)$ 表示概率为 $p$ 的事件发生时获得的信息量。要求：

1. $J$ 连续；
2. $J(1)=0$；
3. $J$ 随 $p$ 严格递减；
4. 对独立事件，信息可加：

$$
J(pq)=J(p)+J(q).
$$

**定理（自信息的对数刻画）**：满足以上条件的 $J$ 必有形式

$$
J(p)=-c\log_2 p,\qquad c>0.
$$

若再规定概率 $1/2$ 的事件携带 $1$ bit，即 $J(1/2)=1$，则 $c=1$。

{{< details summary="证明：自信息的对数刻画" >}}

令

$$
g(t)=J(2^{-t}),\qquad t\ge 0.
$$

因为 $2^{-(s+t)}=2^{-s}2^{-t}$，信息可加性给出

$$
g(s+t)=J(2^{-(s+t)})=J(2^{-s})+J(2^{-t})=g(s)+g(t).
$$

所以 $g$ 是 $[0,\infty)$ 上的连续加法函数。先对正整数 $n$，有

$$
g(n)=ng(1).
$$

再对正有理数 $m/n$，由

$$
ng(m/n)=g(m)=mg(1)
$$

得到

$$
g(m/n)=\frac mn g(1).
$$

利用有理数在 $[0,\infty)$ 中稠密以及 $g$ 的连续性，可得对任意 $t\ge0$，

$$
g(t)=ct,\qquad c=g(1)=J(1/2).
$$

$J$ 严格递减，而 $2^{-t}$ 随 $t$ 严格递减，因此 $g$ 严格递增，故 $c>0$。

最后取 $t=-\log_2p$：

$$
J(p)=g(-\log_2p)=-c\log_2p.
$$

证毕。

{{< /details >}}

下文采用 bit 归一化 $J(1/2)=1$，因此固定 $c=1$。

因此，对随机变量 $X$ 的一次实现 $x\in S_X$，定义**自信息**

$$
\imath_X(x)=-\log p_X(x).
$$

自信息仍是一个依赖具体结果 $x$ 的随机量。下一步才是把它对真实分布取平均。

---

## 2. 熵：自信息的期望

**定义（Shannon 熵）**：有限离散随机变量 $X$ 的熵为

$$
H(X)
=\mathbb E[\imath_X(X)]
=\mathbb E[-\log p_X(X)]
=-\sum_{x\in\mathcal X}p_X(x)\log p_X(x).
$$

若只强调概率分布 $p$，也写作

$$
H(p)=-\sum_{x\in\mathcal X}p(x)\log p(x).
$$

这里的平均由真实分布 $p_X$ 自己决定。概率较小的结果具有较大的自信息，但它们也以较小权重进入期望；熵把这两部分同时保留下来。

---

## 3. 熵的非负性与零点

**命题**：

$$
H(X)\ge0.
$$

并且

$$
H(X)=0
\quad\Longleftrightarrow\quad
X\text{ 几乎必然取某个固定值}.
$$

{{< details summary="证明：熵的非负性与零点" >}}

对任意 $x\in S_X$，有 $0\lt p_X(x)\le1$，因此

$$
-\log p_X(x)\ge0.
$$

熵是这些非负量的加权平均，所以 $H(X)\ge0$。

若 $H(X)=0$，则每一个权重 $p_X(x)>0$ 对应的项都必须为零，即

$$
-\log p_X(x)=0
\quad\Longrightarrow\quad
p_X(x)=1.
$$

概率质量只能集中在一个点上，因此 $X$ 几乎必然为常数。

反过来，若存在 $x_0$ 使 $p_X(x_0)=1$，则

$$
H(X)=-1\cdot\log 1=0.
$$

证毕。

{{< /details >}}

---

## 4. 熵的最大值

令

$$
m=|S_X|.
$$

**定理（有限支持上的最大熵）**：

$$
H(X)\le\log m\le\log|\mathcal X|.
$$

第一个等号成立当且仅当 $X$ 在有效支持集 $S_X$ 上均匀分布；因此

$$
H(X)=\log|\mathcal X|
$$

当且仅当 $X$ 在整个字母表 $\mathcal X$ 上均匀分布。

{{< details summary="证明：有限支持上的最大熵" >}}

把熵写成

$$
H(X)=\mathbb E\!\left[\log\frac1{p_X(X)}\right].
$$

因为 $\log$ 是严格凹函数，由 Jensen 不等式，

$$
\begin{aligned}
H(X)
&\le
\log\mathbb E\!\left[\frac1{p_X(X)}\right]\\
&=
\log\left(\sum_{x\in S_X}p_X(x)\frac1{p_X(x)}\right)\\
&=\log m.
\end{aligned}
$$

Jensen 等号成立当且仅当 $1/p_X(X)$ 几乎处处为常数，也就是 $p_X(x)$ 在 $S_X$ 上恒定。由概率和为 $1$，此时

$$
p_X(x)=\frac1m,\qquad x\in S_X.
$$

又因为 $m\le|\mathcal X|$，所以 $\log m\le\log|\mathcal X|$。后一等号要求 $S_X=\mathcal X$。

证毕。

{{< /details >}}

这一定理把“均匀分布最不确定”变成了严格结论，而不是额外加入的直觉假设。

---

## 5. 熵关于分布的凹性

设 $p,q$ 是同一有限字母表上的两个分布，$\lambda\in[0,1]$，并令

$$
r=\lambda p+(1-\lambda)q.
$$

**定理（熵的凹性）**：

$$
H(r)\ge\lambda H(p)+(1-\lambda)H(q).
$$

当 $0\lt\lambda\lt1$ 时，等号成立当且仅当 $p=q$。

{{< details summary="证明：熵的凹性" >}}

令

$$
h(t)=-t\log t,\qquad t\in[0,1],
$$

并连续定义 $h(0)=0$。在 $(0,1]$ 上，

$$
h''(t)=-\frac1{t\ln2}\lt0,
$$

因此 $h$ 在任意 $[\varepsilon,1]$（$\varepsilon>0$）上严格凹。还需检查端点 $0$：对任意 $v>0$ 与 $0\lt\lambda\lt1$，

$$
h(\lambda v)
=\lambda h(v)-\lambda v\log\lambda
\mathrel{>}\lambda h(v)+(1-\lambda)h(0).
$$

结合 $h(0)=0$，可知连续延拓后的 $h$ 在整个 $[0,1]$ 上严格凹。

对每个 $x\in\mathcal X$，

$$
h(\lambda p(x)+(1-\lambda)q(x))
\ge
\lambda h(p(x))+(1-\lambda)h(q(x)).
$$

对 $x$ 求和：

$$
\begin{aligned}
H(r)
&=\sum_xh(r(x))\\
&\ge
\lambda\sum_xh(p(x))+(1-\lambda)\sum_xh(q(x))\\
&=\lambda H(p)+(1-\lambda)H(q).
\end{aligned}
$$

当 $0\lt\lambda\lt1$ 时，严格凹性的等号条件要求每个坐标都满足 $p(x)=q(x)$，即 $p=q$。

证毕。

{{< /details >}}

**推论（有限混合版本）**：若 $q_1,\ldots,q_k$ 是同一有限字母表上的分布，$\lambda_i\ge0$ 且 $\sum_i\lambda_i=1$，则

$$
H\!\left(\sum_{i=1}^k\lambda_iq_i\right)
\ge
\sum_{i=1}^k\lambda_iH(q_i).
$$

该结论由二元凹性作有限次归纳得到。严格凹性还说明：等号成立当且仅当所有满足 $\lambda_i>0$ 的 $q_i$ 完全相同。

凹性说明：在不知道究竟采用哪个分布时，把多个候选分布混合起来，不会降低其平均不确定性。Part 2 将直接用这一定理证明“给定额外信息后，平均不确定性不会增加”。

---

## 总结与下一站

本篇从信息可加性推出自信息的对数形式，再把熵定义为自信息的期望，并得到三条基本结构：

$$
0\le H(X)\le\log|\mathcal X|,
$$

$$
H(X)=0
\Longleftrightarrow
X\text{ 几乎必然为常数},
$$

以及

$$
H(\lambda p+(1-\lambda)q)
\ge
\lambda H(p)+(1-\lambda)H(q).
$$

下一篇把单个随机变量推广到变量对，建立联合熵、条件熵与链式法则：

$$
H(X,Y)=H(X)+H(Y\mid X).
$$

[继续阅读：信息论 Part 2——联合熵、条件熵与链式法则](/notes/math/information-theory/note-it-2-joint-conditional-entropy/)
