---
date: '2026-07-15T12:30:00+09:00'
draft: false
title: '概率论 Part 2：随机变量、CDF 与常见分布族'
summary: "把随机变量定义为可测映射，用推前测度与 CDF 描述其分布，区分离散分布、绝对连续分布，并建立常见计数与等待时间分布族。"
description: "概率论基础：随机变量的可测性、分布与推前测度、CDF 的单调性和右连续性、离散与绝对连续分布、Bernoulli、Binomial、Geometric、Poisson、Uniform、Exponential 与 Normal 分布。"
tags: ["Mathematics", "Probability Theory"]
categories: ["Notes"]
series: ["Probability and Statistics"]
note_kind: "foundation"
math: true
---

# 概率论 Part 2：随机变量、CDF 与常见分布族

> [Part 1](/notes/math/probability/note-prob-1-probability-space-events/) 在抽象样本空间 $\Omega$ 上建立了事件概率。本篇通过可测映射 $X$ 把这些概率推送到数轴，并严格区分离散分布、具有密度的绝对连续分布，以及两者之外的一般分布。

本篇的链条是

$$
(\Omega,\mathcal F,P)
\xrightarrow{\ X\ }
(\mathbb R,\mathcal B(\mathbb R))
\longrightarrow
\mu_X
\longrightarrow
F_X
\longrightarrow
\text{离散族与绝对连续族}.
$$

---

## 1. 随机变量是可测映射

记 $\mathcal B(\mathbb R)$ 为由实数开集生成的 Borel $\sigma$-代数。

**定义（实随机变量）**：映射

$$
X:(\Omega,\mathcal F)\to(\mathbb R,\mathcal B(\mathbb R))
$$

若满足对每个 $B\in\mathcal B(\mathbb R)$，

$$
X^{-1}(B)=\{\omega:X(\omega)\in B\}\in\mathcal F,
$$

则称 $X$ 是实随机变量。

可测性保证所有关于 $X$ 的 Borel 条件都是事件，因而可以被 $P$ 赋予概率。

**命题（半直线判据）**：映射 $X:\Omega\to\mathbb R$ 可测，当且仅当对每个 $x\in\mathbb R$，

$$
\{X\le x\}\in\mathcal F.
$$

{{< details summary="证明：半直线判据" >}}

若 $X$ 可测，$(-\infty,x]$ 是 Borel 集，因此

$$
\{X\le x\}=X^{-1}(({-\infty},x])\in\mathcal F.
$$

反过来，设所有 $\{X\le x\}$ 均在 $\mathcal F$ 中。令

$$
\mathcal G=\{B\subseteq\mathbb R:X^{-1}(B)\in\mathcal F\}.
$$

原像与补、可数并交换，所以 $\mathcal G$ 是 $\mathbb R$ 上的 $\sigma$-代数。假设说明所有半直线 $(-\infty,x]$ 都在 $\mathcal G$ 中，而这些半直线生成 $\mathcal B(\mathbb R)$。故

$$
\mathcal B(\mathbb R)\subseteq\mathcal G,
$$

即 $X$ 可测。

{{< /details >}}

---

## 2. 分布是推前概率测度

**定义（随机变量的分布或律）**：随机变量 $X$ 的分布 $\mu_X$ 定义为

$$
\mu_X(B)
\mathrel{=}
P(X\in B)
\mathrel{=}
P(X^{-1}(B)),
\qquad B\in\mathcal B(\mathbb R).
$$

也写作

$$
\mu_X=P\circ X^{-1}.
$$

因为原像保持空集、补和可数不交并，$\mu_X$ 是 $(\mathbb R,\mathcal B(\mathbb R))$ 上的概率测度。

分布把 $\Omega$ 的具体结构压缩掉：只要两个随机变量有同一个 $\mu_X$，所有只依赖取值分布的结论就相同。

---

## 3. 累积分布函数

**定义（CDF）**：随机变量 $X$ 的累积分布函数为

$$
F_X(x)=P(X\le x)=\mu_X(({-\infty},x]).
$$

**定理（CDF 的基本性质）**：$F_X$ 满足

1. 单调不减；
2. 右连续；
3. $\lim_{x\to-\infty}F_X(x)=0$；
4. $\lim_{x\to+\infty}F_X(x)=1$。

{{< details summary="证明：CDF 的四条基本性质" >}}

若 $x\le y$，则

$$
\{X\le x\}\subseteq\{X\le y\},
$$

由概率的单调性，$F_X(x)\le F_X(y)$。

设 $x_n\downarrow x$。事件

$$
A_n=\{X\le x_n\}
$$

单调递减，且

$$
\bigcap_nA_n=\{X\le x\}.
$$

由 Part 1 的概率从上连续性，

$$
F_X(x_n)=P(A_n)\downarrow P(X\le x)=F_X(x),
$$

所以 $F_X$ 右连续。

取任意 $x_n\downarrow-\infty$，则 $\{X\le x_n\}\downarrow\emptyset$，故 $F_X(x_n)\to0$。类似地，若 $x_n\uparrow+\infty$，则 $\{X\le x_n\}\uparrow\Omega$，故 $F_X(x_n)\to1$。

{{< /details >}}

CDF 的跳跃精确记录点质量。记左极限

$$
F_X(x-)=\lim_{t\uparrow x}F_X(t).
$$

**命题**：

$$
P(X=x)=F_X(x)-F_X(x-).
$$

{{< details summary="证明：CDF 跳跃等于点质量" >}}

事件 $\{X\le t\}$ 随 $t\uparrow x$ 从下逼近 $\{X\lt x\}$，所以

$$
F_X(x-)=P(X\lt x).
$$

又

$$
\{X\le x\}=\{X\lt x\}\mathbin{\dot\cup}\{X=x\},
$$

因此

$$
F_X(x)=F_X(x-)+P(X=x).
$$

{{< /details >}}

**外部依赖（Lebesgue–Stieltjes 对应）**：反过来，任意满足以上四条性质的函数 $F$ 都唯一决定一个 Borel 概率测度 $\mu_F$，使

$$
\mu_F((a,b])=F(b)-F(a).
$$

存在性要从半开区间上的预测度扩张到 Borel $\sigma$-代数，唯一性要用生成类上的测度唯一性定理；本篇不重复证明 Carathéodory 扩张定理。

---

## 4. 离散分布与绝对连续分布

### 离散分布

若存在有限或可数集合 $S\subseteq\mathbb R$ 使

$$
P(X\in S)=1,
$$

则称 $X$ 是离散随机变量。其概率质量函数为

$$
p_X(x)=P(X=x),
\qquad x\in S,
$$

并满足

$$
p_X(x)\ge0,
\qquad
\sum_{x\in S}p_X(x)=1.
$$

此时

$$
F_X(t)=\sum_{x\in S:x\le t}p_X(x).
$$

### 绝对连续分布

若存在非负 Borel 可测函数 $f_X$ 满足

$$
\int_{\mathbb R}f_X(x)\,dx=1
$$

且对任意 Borel 集 $B$，

$$
P(X\in B)=\int_Bf_X(x)\,dx,
$$

则称 $X$ 的分布相对于 Lebesgue 测度绝对连续，$f_X$ 称为概率密度函数。此时

$$
F_X(t)=\int_{-\infty}^tf_X(x)\,dx.
$$

密度只在 Lebesgue 几乎处处意义下唯一。由 Radon–Nikodym 定理，$\mu_X\ll m$ 当且仅当这样的 $f_X$ 存在；这一存在性依赖 [实分析 Part 6](/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral/) 的测度论框架。

离散与绝对连续不是穷尽分类。一般概率测度还可以同时含离散部分与连续部分，或含没有密度的奇异连续部分。CDF 是覆盖所有这些情形的统一对象。

---

## 5. 离散分布族

以下参数均限制在使公式成为概率分布的范围内。

### Bernoulli 分布

若 $p\in[0,1]$，定义

$$
X\sim\operatorname{Bernoulli}(p)
$$

为

$$
P(X=1)=p,
\qquad
P(X=0)=1-p.
$$

### Binomial 分布

若 $n\in\mathbb N$、$p\in[0,1]$，定义

$$
X\sim\operatorname{Binomial}(n,p)
$$

为

$$
P(X=k)=\binom nkp^k(1-p)^{n-k},
\qquad k=0,1,\ldots,n.
$$

归一化由二项式定理给出：

$$
\sum_{k=0}^n\binom nkp^k(1-p)^{n-k}
=(p+1-p)^n=1.
$$

**定理（Bernoulli 和产生 Binomial）**：若 $X_1,\ldots,X_n$ 相互独立且同服从 $\operatorname{Bernoulli}(p)$，则

$$
S_n=\sum_{i=1}^nX_i
\sim\operatorname{Binomial}(n,p).
$$

{{< details summary="证明：独立 Bernoulli 和的分布" >}}

事件 $\{S_n=k\}$ 表示恰有 $k$ 个下标对应 $X_i=1$。共有 $\binom nk$ 种下标集合。对每一种固定集合，由相互独立性，其概率都是

$$
p^k(1-p)^{n-k}.
$$

这些事件两两不交，所以

$$
P(S_n=k)=\binom nkp^k(1-p)^{n-k}.
$$

{{< /details >}}

### Geometric 分布

若 $p\in(0,1]$，本系列采用“首次成功所在试验编号”的约定：

$$
P(T=k)=(1-p)^{k-1}p,
\qquad k=1,2,\ldots.
$$

几何级数给出归一化：

$$
\sum_{k=1}^\infty(1-p)^{k-1}p=1.
$$

其尾概率为

$$
P(T>n)=(1-p)^n.
$$

因此当 $p\in(0,1)$ 时，对整数 $m,n\ge0$，

$$
P(T>m+n\mid T>m)
\mathrel{=}
\frac{(1-p)^{m+n}}{(1-p)^m}
\mathrel{=}
P(T>n).
$$

这就是离散无记忆性。

### Poisson 分布

若 $\lambda>0$，定义

$$
X\sim\operatorname{Poisson}(\lambda)
$$

为

$$
P(X=k)=e^{-\lambda}\frac{\lambda^k}{k!},
\qquad k=0,1,2,\ldots.
$$

指数级数给出

$$
\sum_{k=0}^\infty e^{-\lambda}\frac{\lambda^k}{k!}
=e^{-\lambda}e^\lambda=1.
$$

---

## 6. 绝对连续分布族

### Uniform 分布

若 $a\lt b$，定义

$$
X\sim\operatorname{Uniform}(a,b)
$$

的密度为

$$
f_X(x)=\frac1{b-a}\mathbf1_{[a,b]}(x).
$$

### Exponential 分布

若 $\lambda>0$，定义

$$
T\sim\operatorname{Exponential}(\lambda)
$$

的密度为

$$
f_T(t)=\lambda e^{-\lambda t}\mathbf1_{[0,\infty)}(t).
$$

其 CDF 与生存函数分别为

$$
F_T(t)=1-e^{-\lambda t},
\qquad
P(T>t)=e^{-\lambda t}
\quad(t\ge0).
$$

所以对 $s,t\ge0$，

$$
P(T>s+t\mid T>s)
\mathrel{=}
\frac{e^{-\lambda(s+t)}}{e^{-\lambda s}}
=e^{-\lambda t}
=P(T>t).
$$

### Normal 分布

若 $\mu\in\mathbb R$、$\sigma>0$，定义

$$
X\sim\mathcal N(\mu,\sigma^2)
$$

的密度为

$$
f_X(x)
\mathrel{=}
\frac1{\sqrt{2\pi}\sigma}
\exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right).
$$

它的归一化归结为 Gaussian integral：

$$
\int_{-\infty}^{\infty}e^{-u^2/2}\,du=\sqrt{2\pi}.
$$

{{< details summary="证明依赖：Gaussian integral 的二维极坐标计算" >}}

令

$$
I=\int_{-\infty}^{\infty}e^{-u^2/2}\,du.
$$

被积函数非负，Tonelli 定理允许把乘积写成二维积分：

$$
I^2
\mathrel{=}
\iint_{\mathbb R^2}e^{-(x^2+y^2)/2}\,dx\,dy.
$$

使用极坐标换元，

$$
I^2
\mathrel{=}
\int_0^{2\pi}\int_0^\infty e^{-r^2/2}r\,dr\,d\theta
=2\pi.
$$

因为 $I>0$，故 $I=\sqrt{2\pi}$。这里依赖 Tonelli 定理与多元换元公式；二者属于 Lebesgue 积分和多元分析的外部基础。

再作 $u=(x-\mu)/\sigma$ 换元，即得 $f_X$ 的积分为 $1$。

{{< /details >}}

---

## 7. 从分布进入积分

Part 2 只回答随机变量“按怎样的概率落在各处”。要得到平均位置、波动尺度以及多个变量之间的共同结构，还需要把函数对分布积分。

对任意 Borel 可测函数 $g$，只要相应积分存在，下一篇将证明

$$
\mathbb E[g(X)]
\mathrel{=}
\int_{\mathbb R}g(x)\,\mu_X(dx).
$$

在离散情形，它变成

$$
\mathbb E[g(X)]=\sum_xg(x)p_X(x),
$$

在绝对连续情形，它变成

$$
\mathbb E[g(X)]=\int_{\mathbb R}g(x)f_X(x)\,dx.
$$

这条推前积分公式将成为期望、方差、协方差和条件期望的共同入口。

---

## 总结与下一站

随机变量不是脱离样本空间漂浮的“随机数”，而是可测映射。它把 $P$ 推前为数轴上的概率测度：

$$
\mu_X=P\circ X^{-1}.
$$

CDF

$$
F_X(x)=\mu_X(({-\infty},x])
$$

统一描述所有实分布；概率质量函数和密度只是离散与绝对连续情形下的两种额外表示。常见分布族则把不同的支持集与概率结构参数化，为后面的期望、极限定理和随机过程提供基本构件。

[返回：概率论 Part 1——概率空间、条件概率、独立性与 Bayes](/notes/math/probability/note-prob-1-probability-space-events/)

[继续阅读：概率论 Part 3——期望、联合分布、条件期望与方差分解](/notes/math/probability/note-prob-3-expectation-conditioning/)
