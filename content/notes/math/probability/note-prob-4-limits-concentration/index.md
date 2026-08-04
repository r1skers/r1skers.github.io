---
date: '2026-07-15T13:00:00+09:00'
draft: false
title: '概率论 Part 4：收敛方式、大数定律、中心极限定理与集中不等式'
summary: "区分几乎必然、依概率、Lᵖ 与依分布收敛，证明它们的基本蕴含关系，再由 Markov 和 Chebyshev 得到弱大数定律，并建立 Hoeffding 与 Chernoff 指数尾界。"
description: "概率极限定理：四种随机变量收敛、Markov 和 Chebyshev 不等式、弱强大数定律、Lindeberg–Lévy 中心极限定理、Hoeffding lemma、不等式与 Chernoff 方法及证明依赖。"
tags: ["Mathematics", "Probability Theory", "Convergence"]
categories: ["Notes"]
series: ["Probability and Statistics"]
note_kind: "foundation"
math: true
---

# 概率论 Part 4：收敛方式、大数定律、中心极限定理与集中不等式

> [Part 3](/notes/math/probability/note-prob-3-expectation-conditioning/) 建立了期望与方差。本篇研究随机变量列 $X_n$ 如何逼近 $X$：极限理论描述 $n\to\infty$ 时的结构，集中不等式则在每个有限 $n$ 上直接控制偏离概率。

本篇的链条是

$$
\text{收敛方式}
\longrightarrow
\text{Markov / Chebyshev}
\longrightarrow
\text{LLN}
\longrightarrow
\text{CLT 与指数集中}.
$$

---

## 1. 四种收敛

以下随机变量都定义在同一概率空间 $(\Omega,\mathcal F,P)$ 上；依分布收敛只比较分布，因此可以在不同概率空间上定义，但为统一记号仍放在一起写。

### 几乎必然收敛

**定义**：若

$$
P\!\left(\left\{\omega:
X_n(\omega)\to X(\omega)
\right\}\right)=1,
$$

则称 $X_n$ 几乎必然收敛到 $X$，记作

$$
X_n\xrightarrow{\mathrm{a.s.}}X.
$$

### 依概率收敛

**定义**：若对每个 $\varepsilon>0$，

$$
P(|X_n-X|>\varepsilon)\to0,
$$

则称 $X_n$ 依概率收敛到 $X$，记作

$$
X_n\xrightarrow{P}X.
$$

### $L^p$ 收敛

**定义**：对 $p\ge1$，若 $X_n,X\in L^p(P)$ 且

$$
\mathbb E[|X_n-X|^p]\to0,
$$

则称 $X_n$ 在 $L^p$ 中收敛到 $X$，记作

$$
X_n\xrightarrow{L^p}X.
$$

### 依分布收敛

**定义**：若对 $F_X$ 的每个连续点 $x$，

$$
F_{X_n}(x)\to F_X(x),
$$

则称 $X_n$ 依分布收敛到 $X$，记作

$$
X_n\xrightarrow{d}X.
$$

---

## 2. 收敛方式之间的基本蕴含

**定理**：

$$
X_n\xrightarrow{L^p}X
\Longrightarrow
X_n\xrightarrow{P}X
\Longrightarrow
X_n\xrightarrow{d}X,
$$

并且

$$
X_n\xrightarrow{\mathrm{a.s.}}X
\Longrightarrow
X_n\xrightarrow{P}X.
$$

{{< details summary="证明：Lᵖ 收敛推出依概率收敛" >}}

对 $\varepsilon>0$，在非负随机变量 $|X_n-X|^p$ 上应用后文 §3 的 Markov 不等式：

$$
\begin{aligned}
P(|X_n-X|>\varepsilon)
&=P(|X_n-X|^p>\varepsilon^p)\\
&\le\frac{\mathbb E[|X_n-X|^p]}{\varepsilon^p}
\longrightarrow0.
\end{aligned}
$$

{{< /details >}}

{{< details summary="证明：几乎必然收敛推出依概率收敛" >}}

固定 $\varepsilon>0$，令

$$
B_n
\mathrel{=}
\bigcup_{k\ge n}\{|X_k-X|>\varepsilon\}.
$$

则 $B_n\downarrow B$，其中

$$
B
\mathrel{=}
\limsup_{n\to\infty}\{|X_n-X|>\varepsilon\}
$$

表示偏离超过 $\varepsilon$ 的事件发生无穷多次。几乎必然收敛意味着 $P(B)=0$。由概率从上连续性，

$$
P(B_n)\downarrow P(B)=0.
$$

而

$$
\{|X_n-X|>\varepsilon\}\subseteq B_n,
$$

所以

$$
P(|X_n-X|>\varepsilon)\le P(B_n)\to0.
$$

{{< /details >}}

{{< details summary="证明：依概率收敛推出依分布收敛" >}}

设 $x$ 是 $F_X$ 的连续点。对任意 $\delta>0$，有集合包含关系

$$
\{X_n\le x\}
\subseteq
\{X\le x+\delta\}
\cup
\{|X_n-X|>\delta\},
$$

所以

$$
\limsup_nF_{X_n}(x)\le F_X(x+\delta).
$$

另一方面，

$$
\{X\le x-\delta\}
\subseteq
\{X_n\le x\}
\cup
\{|X_n-X|>\delta\},
$$

所以

$$
F_X(x-\delta)\le\liminf_nF_{X_n}(x).
$$

令 $\delta\downarrow0$。由 $F_X$ 在 $x$ 连续，

$$
F_X(x-\delta),F_X(x+\delta)\to F_X(x).
$$

夹逼得到 $F_{X_n}(x)\to F_X(x)$。

{{< /details >}}

这些箭头是单向结构。若需要从依概率收敛抽取几乎必然收敛子列，或从依分布收敛升级到其他收敛方式，需要额外定理与假设；本篇只使用上面已经证明的方向。

---

## 3. Markov 与 Chebyshev 不等式

**定理（Markov inequality）**：若 $Y\ge0$ a.s. 且 $\mathbb E[Y]\lt\infty$，则对每个 $a>0$，

$$
P(Y\ge a)
\le
\frac{\mathbb E[Y]}a.
$$

{{< details summary="证明：Markov 不等式" >}}

逐点有

$$
Y\ge a\mathbf1_{\{Y\ge a\}}.
$$

利用期望的单调性，

$$
\mathbb E[Y]
\ge
a\mathbb E[\mathbf1_{\{Y\ge a\}}]
=aP(Y\ge a).
$$

除以 $a$ 即得结论。

{{< /details >}}

**定理（Chebyshev inequality）**：若 $X\in L^2$，均值为 $\mu$、方差为 $\sigma^2$，则对每个 $\varepsilon>0$，

$$
P(|X-\mu|\ge\varepsilon)
\le
\frac{\sigma^2}{\varepsilon^2}.
$$

{{< details summary="证明：Chebyshev 是平方偏差上的 Markov" >}}

对非负变量

$$
Y=(X-\mu)^2
$$

和阈值 $a=\varepsilon^2$ 应用 Markov：

$$
\begin{aligned}
P(|X-\mu|\ge\varepsilon)
&=P((X-\mu)^2\ge\varepsilon^2)\\
&\le\frac{\mathbb E[(X-\mu)^2]}{\varepsilon^2}
=\frac{\sigma^2}{\varepsilon^2}.
\end{aligned}
$$

{{< /details >}}

---

## 4. 大数定律

设 $X_1,X_2,\ldots$ 独立同分布，并记

$$
\bar X_n=\frac1n\sum_{i=1}^nX_i.
$$

### 弱大数定律

**定理（有限方差版本 WLLN）**：若

$$
\mathbb E[X_1]=\mu,
\qquad
\operatorname{Var}(X_1)=\sigma^2\lt\infty,
$$

则

$$
\bar X_n\xrightarrow{P}\mu.
$$

{{< details summary="证明：Chebyshev 推出弱大数定律" >}}

由期望线性性，

$$
\mathbb E[\bar X_n]=\mu.
$$

由独立性，协方差交叉项为零，因此

$$
\operatorname{Var}(\bar X_n)
\mathrel{=}
\frac1{n^2}\sum_{i=1}^n\operatorname{Var}(X_i)
\mathrel{=}
\frac{\sigma^2}{n}.
$$

Chebyshev 不等式给出

$$
P(|\bar X_n-\mu|\ge\varepsilon)
\le
\frac{\sigma^2}{n\varepsilon^2}
\longrightarrow0.
$$

{{< /details >}}

### 强大数定律

**定理（Kolmogorov SLLN，i.i.d. 版本）**：若 $X_i$ i.i.d. 且

$$
\mathbb E[|X_1|]\lt\infty,
$$

则

$$
\bar X_n\xrightarrow{\mathrm{a.s.}}\mathbb E[X_1].
$$

**外部依赖**：这一结论比上面的 Chebyshev 证明更强，并且只要求一阶绝对矩。完整证明通常使用截断、Kolmogorov maximal inequality、Borel–Cantelli 引理与 Kronecker 引理；这些工具未在当前系列建立，因此这里把 SLLN 明确作为外部定理，不伪装成由 $\operatorname{Var}(\bar X_n)=\sigma^2/n$ 直接得到。

---

## 5. 中心极限定理

弱大数定律说明 $\bar X_n-\mu$ 消失。要观察它消失前的波动形状，必须乘以 $\sqrt n$。

**定理（Lindeberg–Lévy CLT）**：若 $X_i$ i.i.d.，

$$
\mathbb E[X_1]=\mu,
\qquad
0\lt\operatorname{Var}(X_1)=\sigma^2\lt\infty,
$$

则

$$
\frac{\sqrt n(\bar X_n-\mu)}\sigma
\mathrel{=}
\frac{\sum_{i=1}^n(X_i-\mu)}{\sigma\sqrt n}
\xrightarrow{d}
\mathcal N(0,1).
$$

**外部依赖**：标准证明先证明标准化和的特征函数逐点收敛到 $e^{-t^2/2}$，再使用 Lévy continuity theorem 把特征函数收敛转回依分布收敛。特征函数、Taylor 余项控制与 Lévy continuity theorem 尚未在本系列建立，因此本篇只精确陈述定理和假设，不给出不完整的两行证明。

LLN 与 CLT 控制不同对象：

$$
\bar X_n-\mu\xrightarrow{P}0,
$$

而

$$
\sqrt n(\bar X_n-\mu)
$$

在适当标准化后保留非退化极限分布。

---

## 6. Chernoff 方法：指数化后的 Markov

设随机变量 $Y$ 的正向矩母函数有限域

$$
\mathcal D_+
\mathrel{=}
\{\lambda>0:\mathbb E[e^{\lambda Y}]\lt\infty\}
$$

非空。任取 $\lambda\in\mathcal D_+$。由 $x\mapsto e^{\lambda x}$ 单调递增，

$$
P(Y\ge t)
\mathrel{=}
P(e^{\lambda Y}\ge e^{\lambda t}).
$$

对 $e^{\lambda Y}$ 使用 Markov 不等式得到

$$
P(Y\ge t)
\le
e^{-\lambda t}\mathbb E[e^{\lambda Y}].
$$

因为对每个 $\lambda\in\mathcal D_+$ 都成立，

$$
P(Y\ge t)
\le
\inf_{\lambda\in\mathcal D_+}
\exp\!\left(
-\lambda t+\log\mathbb E[e^{\lambda Y}]
\right).
$$

这不是单个固定公式，而是一套方法：先控制 log-mgf，再对 $\lambda$ 优化。

---

## 7. Hoeffding lemma

**引理（Hoeffding lemma）**：若 $X\in[a,b]$ a.s.，则对任意 $\lambda\in\mathbb R$，

$$
\mathbb E\!\left[e^{\lambda(X-\mathbb E[X])}\right]
\le
\exp\!\left(\frac{\lambda^2(b-a)^2}{8}\right).
$$

{{< details summary="证明：tilted variance 与区间方差上界" >}}

令 $Y=X-\mathbb E[X]$，并定义

$$
\psi(\lambda)=\log\mathbb E[e^{\lambda Y}].
$$

因为 $Y$ 有界，可以在期望号内求导。显然

$$
\psi(0)=0,
\qquad
\psi'(0)=\mathbb E[Y]=0.
$$

定义 exponential tilt 下的期望

$$
\mathbb E_\lambda[g(Y)]
\mathrel{=}
\frac{\mathbb E[g(Y)e^{\lambda Y}]}
{\mathbb E[e^{\lambda Y}]}.
$$

直接求导得到

$$
\psi''(\lambda)
\mathrel{=}
\operatorname{Var}_\lambda(Y).
$$

任意支持于长度 $b-a$ 区间的随机变量 $Z$ 都满足 Popoviciu 方差界

$$
\operatorname{Var}(Z)\le\frac{(b-a)^2}{4}.
$$

证明如下：若 $Z\in[a,b]$ 且 $m=\mathbb E[Z]$，由 $(Z-a)(b-Z)\ge0$，

$$
\mathbb E[Z^2]\le(a+b)m-ab.
$$

因此

$$
\operatorname{Var}(Z)
\le(b-m)(m-a)
\le\frac{(b-a)^2}{4}.
$$

exponential tilt 改变概率权重但不改变支持区间，所以

$$
\psi''(\lambda)\le\frac{(b-a)^2}{4}.
$$

由 Taylor 公式的积分形式，

$$
\psi(\lambda)
\mathrel{=}
\psi(0)+\lambda\psi'(0)
+\int_0^\lambda(\lambda-s)\psi''(s)\,ds
\le
\frac{\lambda^2(b-a)^2}{8}.
$$

指数化即得结论。$\lambda\lt0$ 时同一积分论证仍成立。

{{< /details >}}

---

## 8. Hoeffding 不等式

**定理（Hoeffding inequality）**：设 $X_1,\ldots,X_n$ 独立，且

$$
X_i\in[a_i,b_i]\quad\text{a.s.}
$$

令

$$
S_n=\sum_iX_i,
\qquad
V=\sum_{i=1}^n(b_i-a_i)^2.
$$

若 $V>0$，则对 $t>0$，

$$
P(S_n-\mathbb E[S_n]\ge t)
\le
\exp\!\left(
-\frac{2t^2}{V}
\right).
$$

双侧形式为

$$
P(|S_n-\mathbb E[S_n]|\ge t)
\le
2\exp\!\left(
-\frac{2t^2}{V}
\right).
$$

若 $V=0$，则每个 $X_i$ 都 a.s. 等于常数，因而对 $t>0$，上述单侧与双侧事件的概率都为 $0$。这是退化情形，应单独读取而不把零代入分母。

{{< details summary="证明：独立 mgf 分解并优化 λ" >}}

记 $d_i=b_i-a_i$。对 $\lambda>0$，由 Chernoff 方法与独立性，

$$
\begin{aligned}
&P(S_n-\mathbb E[S_n]\ge t)\\
&\quad\le
e^{-\lambda t}
\prod_{i=1}^n
\mathbb E[e^{\lambda(X_i-\mathbb E[X_i])}].
\end{aligned}
$$

对每一项使用 Hoeffding lemma：

$$
P(S_n-\mathbb E[S_n]\ge t)
\le
\exp\!\left(
-\lambda t+\frac{\lambda^2}{8}\sum_id_i^2
\right).
$$

右侧指数是 $\lambda$ 的二次函数，在

$$
\lambda^*=\frac{4t}{\sum_id_i^2}
$$

处最小。代入得到

$$
P(S_n-\mathbb E[S_n]\ge t)
\le
\exp\!\left(-\frac{2t^2}{\sum_id_i^2}\right).
$$

对 $-X_i$ 应用同一结论得到下尾界，再用 union bound 得双侧形式。

{{< /details >}}

若 $X_i\in[a,b]$ i.i.d.，令 $t=n\varepsilon$，则

$$
P(|\bar X_n-\mu|\ge\varepsilon)
\le
2\exp\!\left(-\frac{2n\varepsilon^2}{(b-a)^2}\right).
$$

与 Chebyshev 的 $1/n$ 上界相比，这里更强的独立和有界假设换来了关于 $n$ 的指数衰减。

---

## 9. Bernoulli 和的 Chernoff 界

设 $X_1,\ldots,X_n$ 是相互独立的 Bernoulli 变量，成功概率可以不同，令

$$
S=\sum_iX_i,
\qquad
\mu=\mathbb E[S]=\sum_ip_i.
$$

**定理（乘法型 Chernoff 上尾界）**：对 $\delta>0$，

$$
P(S\ge(1+\delta)\mu)
\le
\left(
\frac{e^\delta}{(1+\delta)^{1+\delta}}
\right)^\mu.
$$

进一步，

$$
P(S\ge(1+\delta)\mu)
\le
\exp\!\left(-\frac{\delta^2}{2+\delta}\mu\right).
$$

{{< details summary="证明：Bernoulli mgf 与参数优化" >}}

对 $\lambda>0$，

$$
\mathbb E[e^{\lambda X_i}]
=1-p_i+p_ie^\lambda
=1+p_i(e^\lambda-1)
\le
\exp(p_i(e^\lambda-1)).
$$

独立性给出

$$
\mathbb E[e^{\lambda S}]
\le
\exp(\mu(e^\lambda-1)).
$$

因此

$$
P(S\ge(1+\delta)\mu)
\le
\exp\!\left(
-\lambda(1+\delta)\mu
+\mu(e^\lambda-1)
\right).
$$

令 $\lambda=\ln(1+\delta)$，得到

$$
\exp\!\left(
-\mu[(1+\delta)\ln(1+\delta)-\delta]
\right),
$$

即第一条结论。对 $\delta\ge0$，微分验证

$$
(1+\delta)\ln(1+\delta)-\delta
\ge
\frac{\delta^2}{2+\delta},
$$

代入即得第二条较简洁但稍弱的界。

{{< /details >}}

---

## 10. 与 AEP 的接口

设有限字母表 $\mathcal X$ 上的 $X_1,X_2,\ldots$ i.i.d.，共同 pmf 为 $p$。记正概率支持为

$$
\operatorname{supp}(p)
\mathrel{=}
\{x\in\mathcal X:p(x)>0\}.
$$

因为 $X_i\in\operatorname{supp}(p)$ a.s.，可以令

$$
Z_i=-\log_2p(X_i).
$$

$Z_i$ 只取有限多个有限值，因此有有限方差，且

$$
\mathbb E[Z_i]=H(X).
$$

于是 WLLN 直接给出

$$
\frac1n\sum_{i=1}^nZ_i
\mathrel{=}
-\frac1n\log_2p(X^n)
\xrightarrow{P}H(X).
$$

这正是 [Shannon 支线 S1：AEP 与典型集](/notes/math/information-theory/note-it-4-aep-typical-set/) 的概率论入口。

---

## 总结与下一站

本篇把极限陈述分成了不同强度：

$$
L^p\Rightarrow P\Rightarrow d,
\qquad
\mathrm{a.s.}\Rightarrow P.
$$

Markov 与 Chebyshev 只使用低阶矩，WLLN 由样本均值方差 $\sigma^2/n$ 直接推出；CLT 则在 $\sqrt n$ 尺度保留波动形状。Hoeffding 与 Chernoff 使用更强的有界性或指数矩结构，把有限样本尾概率压到指数尺度。

[返回：概率论 Part 3——期望、联合分布、条件期望与方差分解](/notes/math/probability/note-prob-3-expectation-conditioning/)

[继续阅读：概率论 Part 5——Likelihood、MLE、MAP、区间、检验与 EM](/notes/math/probability/note-prob-5-statistical-inference-em/)
