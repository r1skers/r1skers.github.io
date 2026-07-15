---
date: '2026-06-23T10:00:00+09:00'
draft: false
title: '问题集 · 优化与变分'
summary: "优化与变分笔记的配套练习——拉格朗日乘子、最大熵、softmax、凸对偶，多为「同一件事的两种语言」（一个「在哪取到」、一个「为什么下不去」）。"
description: "优化与变分配套习题集：拉格朗日乘子与 Jensen/Gibbs/KL 下的最大熵、最优码长、高斯最大熵、softmax 与凸对偶，附参考解答。"
tags: ["Problems", "Exercises", "Optimization", "Calculus of Variations"]
categories: ["Crucible"]
problemPage: true
---

# 问题集 · 优化与变分

配套 [拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) 的练习。多数题带「换种语言再证一遍」的味道——拉格朗日解「在哪取到」，凸性 / KL 解「为什么下不去」。

{{< problem-map kind="optimization" >}}

---

{{% problem-section title="拉格朗日与最大熵" %}}

{{% problem-exercise title="拉格朗日乘子与 Jensen 不等式下的最大熵" %}}

设 $|\mathcal{X}|=3$。求熵

$$
H(p_1,p_2,p_3)=-\sum_{i=1}^3 p_i\ln p_i
$$

在约束 $\sum_i p_i=1$ 下的最大值；分别用拉格朗日乘子法与 Jensen 不等式证明它在 $p_1=p_2=p_3=\tfrac13$ 取到，并体会两者是同一件事的两种语言。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [信息论 Part 1 · 自信息与熵](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**拉格朗日语言（找驻点）.** 要最大化的是熵 $H=-\sum_{i=1}^3 p_i\ln p_i$，约束 $p_1+p_2+p_3=1$ 先写成 $g(p)=\sum_i p_i-1=0$。构造拉格朗日函数

$$
L(p_1,p_2,p_3,\lambda)=-\sum_{i=1}^3 p_i\ln p_i+\lambda\Big(\sum_{i=1}^3 p_i-1\Big),
$$

也就是「新函数 = 要最大化的熵 $+\ \lambda\times$ 约束条件」。

对每个 $p_i$ 求偏导。先看单独一项 $-p_i\ln p_i$：

$$
\frac{d}{dp_i}\big(-p_i\ln p_i\big)=-(\ln p_i+1),
$$

于是

$$
\frac{\partial L}{\partial p_i}=-(\ln p_i+1)+\lambda=0
\ \Longrightarrow\
\ln p_i=\lambda-1
\ \Longrightarrow\
p_i=e^{\lambda-1}.
$$

右边与 $i$ 无关，所以 $p_1=p_2=p_3$。代入约束 $\sum_i p_i=1$：

$$
3\,e^{\lambda-1}=1\ \Longrightarrow\ p_i=\tfrac13,\qquad H_{\max}=\ln 3.
$$

$H$ 是凹函数（每个 $-p\ln p$ 都凹）、约束线性，故这个唯一驻点就是全局最大。

**Jensen 语言（全局不等式）.** 把 $H$ 写成期望，对凹函数 $\ln$ 用 Jensen（$\mathbb{E}[\ln X]\le\ln\mathbb{E}[X]$，取 $X=1/p_i$、按分布 $p$ 取期望）：

$$
H(p)=\sum_i p_i\ln\frac{1}{p_i}
=\mathbb{E}\!\left[\ln\frac{1}{p_i}\right]
\le\ln\mathbb{E}\!\left[\frac{1}{p_i}\right]
=\ln\Big(\sum_i p_i\cdot\frac{1}{p_i}\Big)
=\ln 3,
$$

等号当且仅当 $1/p_i$ 为常数，即 $p_i=\tfrac13$。

{{< /details >}}

{{% problem-exercise title="拉格朗日乘子求最优码长（最小期望长度 = 熵）" %}}

给定信源分布 $p=(p_1,\dots,p_n)$，给每个符号配一个二元前缀码、码长 $l_i$。任何唯一可译码都满足 **Kraft 不等式** $\sum_i 2^{-l_i}\le 1$。求最小化期望码长 $\bar L=\sum_i p_i l_i$ 的最优码长（先把 $l_i$ 放松成实数），证明最小期望长度恰为熵 $H(p)=-\sum_i p_i\log_2 p_i$；再用 Gibbs / KL 不等式给出同一结论的另一种语言，并说明整数约束带来的差距。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [信息论 Part 1 · 自信息与熵](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**拉格朗日语言（找驻点）.** 最优时 Kraft 取等 $\sum_i 2^{-l_i}=1$。记期望码长 $\bar L=\sum_i p_i l_i$（它和下面的拉格朗日函数 $L$ 是两个东西，别混）。构造

$$
L(l_1,\dots,l_n,\lambda)=\sum_i p_i l_i+\lambda\Big(\sum_i 2^{-l_i}-1\Big).
$$

对 $l_i$ 求偏导（用 $\frac{d}{dl}2^{-l}=-\ln 2\cdot 2^{-l}$）：

$$
\frac{\partial L}{\partial l_i}=p_i-\lambda\ln 2\cdot 2^{-l_i}=0
\ \Longrightarrow\
2^{-l_i}=\frac{p_i}{\lambda\ln 2}.
$$

代入约束 $\sum_i 2^{-l_i}=1$、并用 $\sum_i p_i=1$ 得 $\lambda\ln 2=1$，于是

$$
2^{-l_i}=p_i\ \Longrightarrow\ l_i^*=-\log_2 p_i,
\qquad
\bar L_{\min}=\sum_i p_i(-\log_2 p_i)=H(p).
$$

**Gibbs / KL 语言（全局不等式）.** 对任意满足 Kraft 的码，令 $c=\sum_i 2^{-l_i}\le 1$、$q_i=2^{-l_i}/c$（一个分布）。则

$$
\bar L-H(p)=\sum_i p_i\log_2\frac{p_i}{2^{-l_i}}
=\underbrace{\sum_i p_i\log_2\frac{p_i}{q_i}}_{=\,D(p\,\|\,q)\,\ge\,0}-\log_2 c\ \ge\ 0,
$$

因为 KL 散度 $D(p\,\|\,q)\ge 0$（Gibbs）且 $\log_2 c\le 0$。等号当且仅当 $p=q$ 且 $c=1$，即 $2^{-l_i}=p_i$、$l_i=-\log_2 p_i$——与拉格朗日同解。

**两种语言.** 拉格朗日解一阶条件，直接定出最优码长 $l_i^*=-\log_2 p_i$；Gibbs/KL 用散度非负，直接给出 $\bar L\ge H$ 的全局下界、等号刻画最优。一个「在哪取到」、一个「为什么下不去」——和 E1 是一个套路。

**整数的现实** $l_i^*=-\log_2 p_i$ 一般**不是整数**，但真实码长必须是正整数。所以「$\bar L=H$」只有当所有 $p_i$ 都是 $1/2$ 的幂（dyadic）时才精确达到；一般要向上取整，Shannon 码 $l_i=\lceil-\log_2 p_i\rceil$ 给出

$$
H(p)\le \bar L\lt H(p)+1.
$$

即:拉格朗日解的是**放松了整数约束**的连续问题;熵是打不破的下界，可逼近（分块编码能逼到任意接近）、但未必恰好达到。

{{< /details >}}

{{% problem-exercise title="拉格朗日乘子与 Gibbs 不等式：高斯-最大熵分布" %}}

在所有均值为 $\mu$、方差为 $\sigma^2$ 的连续概率密度中，最大化微分熵 $h[p]=-\int p\ln p\,dx$。分别用拉格朗日乘子（对密度做变分）与 Gibbs 不等式证明最大熵分布是高斯 $\mathcal N(\mu,\sigma^2)$，体会两者是同一件事的两种语言。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [信息论 Part 1 · 自信息与熵](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**拉格朗日语言（变分找驻点）.** 三条约束 $\int p\,dx=1$、$\int xp\,dx=\mu$、$\int(x-\mu)^2p\,dx=\sigma^2$ 各配一个乘子，作泛函

$$
L[p]=-\int p\ln p\,dx+\lambda_0\Big(\int p\,dx-1\Big)+\lambda_1\Big(\int xp\,dx-\mu\Big)+\lambda_2\Big(\int(x-\mu)^2p\,dx-\sigma^2\Big).
$$

对密度 $p(x)$ 取变分 $\delta L/\delta p=0$（被积式对 $p$ 逐点求偏导；这里没有 $p'$ 项，欧拉–拉格朗日退化成逐点条件）：

$$
-\ln p(x)-1+\lambda_0+\lambda_1 x+\lambda_2(x-\mu)^2=0
\ \Longrightarrow\
p(x)=\exp\!\big(\lambda_0-1+\lambda_1 x+\lambda_2(x-\mu)^2\big).
$$

右边是 $\exp(\text{$x$ 的二次式})$，必为高斯形。三条约束定常数（归一 + 均值 + 方差）给出 $\lambda_1=0,\ \lambda_2=-\tfrac{1}{2\sigma^2}$，即

$$
p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{(x-\mu)^2}{2\sigma^2}\Big)=\mathcal N(\mu,\sigma^2).
$$

（微分熵凹、约束线性，这个唯一驻点即全局最大。）

**Gibbs 语言（全局不等式）.** 记 $g=\mathcal N(\mu,\sigma^2)$。对任意同均值 $\mu$、同方差 $\sigma^2$ 的密度 $p$，KL 非负：

$$
0\le D(p\,\|\,g)=\int p\ln\frac{p}{g}\,dx=-h(p)-\int p\ln g\,dx
\ \Longrightarrow\
h(p)\le-\int p\ln g\,dx.
$$

关键：$\ln g(x)=-\tfrac12\ln(2\pi\sigma^2)-\tfrac{(x-\mu)^2}{2\sigma^2}$ 是 $x$ 的二次式，故 $-\int p\ln g$ **只通过 $p$ 的归一与二阶矩起作用**，而它们与 $g$ 相同：

$$
-\int p\ln g\,dx=\tfrac12\ln(2\pi\sigma^2)+\frac{1}{2\sigma^2}\underbrace{\int p\,(x-\mu)^2\,dx}_{=\sigma^2}=\tfrac12\ln(2\pi e\sigma^2)=h(g).
$$

于是 $h(p)\le h(g)$，等号当且仅当 $p=g$。最大微分熵 $h_{\max}=\tfrac12\ln(2\pi e\sigma^2)$。

**两种语言.** 拉格朗日解变分一阶条件，直接定出最优分布的**形状**（$\exp$ 二次式 = 高斯）；Gibbs 用 KL 非负 +「与高斯的交叉熵只看二阶矩」，直接给出 $h\le h(g)$ 的**全局上界**、等号刻画最优。一个「长什么样」、一个「为什么没人比它高」——和 E1 同套路，只是这里从有限维升到了**对密度的变分**（笔记第 8 节那半场）。

**两个细节.** ① 这里是**微分熵**（连续），可负、不具坐标不变性，但「给定矩下最大」这一相对结论是干净的；② 约束须**同时**固定均值与方差，Gibbs 那步正是靠 $p,g$ 两矩相同。

{{< /details >}}

<a id="softmax-maximum-entropy"></a>

{{% problem-exercise title="拉格朗日乘子与凸对偶：softmax-最大熵分布" %}}

$n$ 个结局，每个有一个「得分」$z_i$。在期望得分 $\sum_i p_i z_i$ 固定的约束下最大化熵 $H(p)=-\sum_i p_i\ln p_i$。用拉格朗日乘子证明最大熵分布是 softmax $p_i=e^{\beta z_i}/\sum_j e^{\beta z_j}$；再换凸对偶的语言看 softmax 是 log-sum-exp 的梯度。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [信息论 Part 1 · 自信息与熵](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**拉格朗日语言（找驻点）.** 约束 $\sum_i p_i=1$、$\sum_i p_i z_i=\bar z$。拉格朗日函数

$$
L=-\sum_i p_i\ln p_i+\lambda\Big(\sum_i p_i-1\Big)+\beta\Big(\sum_i p_i z_i-\bar z\Big).
$$

对 $p_i$ 求偏导置零：

$$
\frac{\partial L}{\partial p_i}=-\ln p_i-1+\lambda+\beta z_i=0
\ \Longrightarrow\
p_i=e^{\lambda-1+\beta z_i}\propto e^{\beta z_i}.
$$

归一化给出

$$
p_i=\frac{e^{\beta z_i}}{\sum_j e^{\beta z_j}}=\operatorname{softmax}(\beta z)_i.
$$

乘子 $\beta$（「逆温度」）由期望约束 $\bar z$ 定：$\beta\to 0$ 退回均匀（E1），$\beta\to\infty$ 集中到最大的 $z_i$（硬 argmax）。

**凸对偶语言（softmax 是 ∇ log-sum-exp）.** 换个等价问法：把熵当正则项，在单纯形 $\Delta$ 上做带熵正则的线性极大化

$$
\max_{p\in\Delta}\ \langle p,z\rangle+\tfrac1\beta H(p).
$$

同样的拉格朗日（归一约束）解出同一个 $p=\operatorname{softmax}(\beta z)$，而最优值正是

$$
\tfrac1\beta\ln\sum_i e^{\beta z_i}=\tfrac1\beta\operatorname{LSE}(\beta z),
\qquad
\nabla\operatorname{LSE}(z)=\operatorname{softmax}(z).
$$

log-sum-exp 是负熵在单纯形上的**凸共轭**，softmax 就是这个凸势的梯度。

**两种视角.** 拉格朗日：最大熵 + 期望约束直接解出 $e^{\beta z}$ 的形状；凸对偶：softmax 是 LSE 的梯度、LSE 是负熵的共轭。

{{< /details >}}

{{% /problem-section %}}
