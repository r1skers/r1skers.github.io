---
date: '2026-07-15T12:45:00+09:00'
draft: false
title: '概率论 Part 3：期望、联合分布、条件期望与方差分解'
summary: "把期望定义为概率空间上的 Lebesgue 积分，建立推前积分公式、方差与协方差，再从联合分布进入条件期望，证明塔律、全期望和全方差公式。"
description: "概率论主干：期望与 LOTUS、常见分布的矩、方差、协方差、联合和边缘分布、条件分布、相对于 σ-代数的条件期望、塔律、条件方差与全方差公式。"
tags: ["Probability Theory", "Expectation", "Variance", "Covariance", "Joint Distribution", "Conditional Expectation", "Tower Property", "Proof"]
categories: ["Crucible"]
math: true
---

# 概率论 Part 3：期望、联合分布、条件期望与方差分解

> [Part 2](/notes/math/probability/note-prob-2-random-variables-distributions/) 把随机变量的分布写成数轴上的概率测度。本篇对这个测度积分，再把单变量结构推广到随机向量和条件信息。一般部分在概率空间上表述；求和公式只用于离散变量，密度公式只用于联合分布绝对连续的情形。

本篇的链条是

$$
\mu_X
\longrightarrow
\mathbb E[g(X)]
\longrightarrow
\operatorname{Var}(X),\operatorname{Cov}(X,Y)
\longrightarrow
\mathbb E[X\mid\mathcal G]
\longrightarrow
\text{塔律与全方差}.
$$

---

## 1. 期望是概率测度下的积分

**定义（期望）**：若随机变量 $X$ 非负，定义

$$
\mathbb E[X]=\int_\Omega X(\omega)\,P(d\omega)\in[0,\infty].
$$

对一般实随机变量，写

$$
X=X^+-X^-,
\qquad
X^+=\max\{X,0\},
\qquad
X^-=\max\{-X,0\}.
$$

若

$$
\mathbb E[|X|]
\mathrel{=}
\mathbb E[X^+]+\mathbb E[X^-]
\lt\infty,
$$

则称 $X$ 可积，并定义

$$
\mathbb E[X]=\mathbb E[X^+]-\mathbb E[X^-].
$$

线性、单调性和绝对值控制都继承自 Lebesgue 积分：对可积 $X,Y$ 与常数 $a,b$，

$$
\mathbb E[aX+bY]=a\mathbb E[X]+b\mathbb E[Y],
$$

$$
X\le Y\text{ a.s.}\Longrightarrow\mathbb E[X]\le\mathbb E[Y],
$$

$$
|\mathbb E[X]|\le\mathbb E[|X|].
$$

这些积分性质的构造见 [实分析 Part 6](/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral/)。

---

## 2. LOTUS：只用分布计算期望

**定理（推前积分公式 / LOTUS）**：设 $g:\mathbb R\to\overline{\mathbb R}$ Borel 可测。若 $g\ge0$，或 $g(X)$ 可积，则

$$
\mathbb E[g(X)]
\mathrel{=}
\int_{\mathbb R}g(x)\,\mu_X(dx).
$$

{{< details summary="证明：从示性函数到一般可测函数" >}}

先取 $g=\mathbf1_B$。由分布的定义，

$$
\int_\Omega\mathbf1_B(X(\omega))\,dP
=P(X\in B)
=\mu_X(B)
=\int_{\mathbb R}\mathbf1_B(x)\,d\mu_X.
$$

由积分的线性性，结论对非负简单函数

$$
g=\sum_{k=1}^mc_k\mathbf1_{B_k}
$$

成立。

对一般非负 Borel 可测 $g$，取简单函数 $g_n\uparrow g$。则 $g_n(X)\uparrow g(X)$。对两侧使用单调收敛定理，并利用简单函数情形：

$$
\begin{aligned}
\int_\Omega g(X)\,dP
&=\lim_n\int_\Omega g_n(X)\,dP\\
&=\lim_n\int_{\mathbb R}g_n\,d\mu_X\\
&=\int_{\mathbb R}g\,d\mu_X.
\end{aligned}
$$

对可积的有符号 $g(X)$，分别应用于 $g^+$ 与 $g^-$ 后相减。

{{< /details >}}

离散情形下，LOTUS 化为

$$
\mathbb E[g(X)]
\mathrel{=}
\sum_{x\in S}g(x)p_X(x),
$$

绝对连续情形下化为

$$
\mathbb E[g(X)]
\mathrel{=}
\int_{\mathbb R}g(x)f_X(x)\,dx.
$$

---

## 3. 方差与常见分布的矩

设 $X\in L^2(P)$，即 $\mathbb E[X^2]\lt\infty$。

**定义（方差）**：

$$
\operatorname{Var}(X)
\mathrel{=}
\mathbb E\!\left[(X-\mathbb E[X])^2\right].
$$

标准差为

$$
\operatorname{sd}(X)=\sqrt{\operatorname{Var}(X)}.
$$

**命题（方差恒等式）**：

$$
\operatorname{Var}(X)
\mathrel{=}
\mathbb E[X^2]-\mathbb E[X]^2.
$$

进一步，对常数 $a,b$，

$$
\operatorname{Var}(aX+b)=a^2\operatorname{Var}(X).
$$

{{< details summary="证明：方差恒等式与仿射变换" >}}

记 $\mu=\mathbb E[X]$。展开平方并使用期望线性性：

$$
\begin{aligned}
\operatorname{Var}(X)
&=\mathbb E[X^2-2\mu X+\mu^2]\\
&=\mathbb E[X^2]-2\mu\mathbb E[X]+\mu^2\\
&=\mathbb E[X^2]-\mu^2.
\end{aligned}
$$

又

$$
aX+b-\mathbb E[aX+b]
=a(X-\mathbb E[X]),
$$

所以

$$
\operatorname{Var}(aX+b)
=a^2\operatorname{Var}(X).
$$

{{< /details >}}

Part 2 各分布族的前两阶矩为

| 分布 | $\mathbb E[X]$ | $\operatorname{Var}(X)$ |
|---|---:|---:|
| $\operatorname{Bernoulli}(p)$ | $p$ | $p(1-p)$ |
| $\operatorname{Binomial}(n,p)$ | $np$ | $np(1-p)$ |
| $\operatorname{Geometric}(p)$，支持从 $1$ 开始 | $1/p$ | $(1-p)/p^2$ |
| $\operatorname{Poisson}(\lambda)$ | $\lambda$ | $\lambda$ |
| $\operatorname{Uniform}(a,b)$ | $(a+b)/2$ | $(b-a)^2/12$ |
| $\operatorname{Exponential}(\lambda)$ | $1/\lambda$ | $1/\lambda^2$ |
| $\mathcal N(\mu,\sigma^2)$ | $\mu$ | $\sigma^2$ |

{{< details summary="证明：分布族前两阶矩的统一计算" >}}

对 Bernoulli 变量，$X^2=X$，所以

$$
\mathbb E[X]=p,
\qquad
\operatorname{Var}(X)=p-p^2=p(1-p).
$$

Binomial 变量可写成独立 Bernoulli 和 $S_n=\sum_iX_i$。由线性性和后文将证明的独立变量方差可加性，

$$
\mathbb E[S_n]=np,
\qquad
\operatorname{Var}(S_n)=np(1-p).
$$

对 Geometric 变量，令 $q=1-p$。由幂级数

$$
\sum_{k=1}^\infty kq^{k-1}=\frac1{(1-q)^2},
$$

$$
\sum_{k=1}^\infty k^2q^{k-1}=\frac{1+q}{(1-q)^3},
$$

得到

$$
\mathbb E[T]=p\frac1{(1-q)^2}=\frac1p,
$$

$$
\mathbb E[T^2]=p\frac{1+q}{(1-q)^3}=\frac{2-p}{p^2}.
$$

相减得 $\operatorname{Var}(T)=q/p^2$。

对 Poisson 变量，先计算 factorial moments：

$$
\begin{aligned}
\mathbb E[X]
&=e^{-\lambda}\sum_{k=1}^\infty k\frac{\lambda^k}{k!}
=\lambda,\\
\mathbb E[X(X-1)]
&=e^{-\lambda}\sum_{k=2}^\infty k(k-1)\frac{\lambda^k}{k!}
=\lambda^2.
\end{aligned}
$$

因为 $X^2=X(X-1)+X$，故

$$
\operatorname{Var}(X)
=\lambda^2+\lambda-\lambda^2
=\lambda.
$$

Uniform 与 Exponential 的结果分别由

$$
\frac1{b-a}\int_a^bx^r\,dx
$$

和

$$
\int_0^\infty t^r\lambda e^{-\lambda t}\,dt
$$

在 $r=1,2$ 时直接计算。后一个积分作 $u=\lambda t$ 换元，并使用 $\int_0^\infty u^re^{-u}du=r!$。

对标准正态 $Z$，密度关于 $0$ 对称，所以 $\mathbb E[Z]=0$。分部积分给出

$$
\mathbb E[Z^2]
\mathrel{=}
\frac1{\sqrt{2\pi}}
\int_{-\infty}^\infty z^2e^{-z^2/2}\,dz
=1.
$$

若 $X=\mu+\sigma Z$，方差的仿射变换公式给出

$$
\mathbb E[X]=\mu,
\qquad
\operatorname{Var}(X)=\sigma^2.
$$

{{< /details >}}

---

## 4. 随机向量、联合分布与边缘分布

若 $X_1,\ldots,X_d$ 是实随机变量，则

$$
X=(X_1,\ldots,X_d):\Omega\to\mathbb R^d
$$

是随机向量。其联合分布为

$$
\mu_X(B)=P(X\in B),
\qquad B\in\mathcal B(\mathbb R^d).
$$

对二维随机向量 $(X,Y)$：

- 离散情形的联合 pmf 为

$$
p_{X,Y}(x,y)=P(X=x,Y=y);
$$

- 绝对连续情形的联合密度满足

$$
P((X,Y)\in B)=\iint_Bf_{X,Y}(x,y)\,dx\,dy.
$$

**定义（边缘分布）**：$X$ 的分布是联合分布在第一坐标投影下的推前。离散和联合绝对连续情形分别给出

$$
p_X(x)=\sum_yp_{X,Y}(x,y),
$$

$$
f_X(x)=\int_{\mathbb R}f_{X,Y}(x,y)\,dy
\quad\text{a.e.}
$$

后一个公式由 Tonelli 定理保证。

---

## 5. 随机变量的独立性

**定义**：随机变量 $X,Y$ 独立，若对任意 Borel 集 $A,B$，

$$
P(X\in A,Y\in B)
\mathrel{=}
P(X\in A)P(Y\in B).
$$

等价地，联合分布是乘积测度：

$$
\mu_{X,Y}=\mu_X\otimes\mu_Y.
$$

在离散情形，这等价于

$$
p_{X,Y}(x,y)=p_X(x)p_Y(y),
$$

在联合绝对连续情形，这等价于

$$
f_{X,Y}(x,y)=f_X(x)f_Y(y)
\quad\text{a.e.}
$$

**定理（独立变量的乘积期望）**：若 $X,Y$ 独立，且 $g(X),h(Y)$ 均可积，则

$$
\mathbb E[g(X)h(Y)]
\mathrel{=}
\mathbb E[g(X)]\mathbb E[h(Y)].
$$

{{< details summary="证明依赖：乘积测度与 Fubini 定理" >}}

由独立性，$(X,Y)$ 的联合分布是 $\mu_X\otimes\mu_Y$。先对绝对值使用 Tonelli，得到

$$
\mathbb E[|g(X)h(Y)|]
\mathrel{=}
\mathbb E[|g(X)|]\mathbb E[|h(Y)|]
\lt\infty.
$$

所以乘积可积；再应用二维 LOTUS 与 Fubini 定理：

$$
\begin{aligned}
\mathbb E[g(X)h(Y)]
&=\iint g(x)h(y)\,\mu_X(dx)\mu_Y(dy)\\
&=\left(\int g\,d\mu_X\right)
\left(\int h\,d\mu_Y\right).
\end{aligned}
$$

非负情形使用 Tonelli；可积有符号情形使用 Fubini。乘积测度和 Fubini–Tonelli 定理是本证明的测度论依赖。

{{< /details >}}

---

## 6. 协方差

对 $X,Y\in L^2(P)$，定义

$$
\operatorname{Cov}(X,Y)
\mathrel{=}
\mathbb E[(X-\mathbb E[X])(Y-\mathbb E[Y])].
$$

展开得到

$$
\operatorname{Cov}(X,Y)
\mathrel{=}
\mathbb E[XY]-\mathbb E[X]\mathbb E[Y].
$$

协方差是对称双线性的，并且

$$
\operatorname{Cov}(X,X)=\operatorname{Var}(X).
$$

因此对 $X_1,\ldots,X_n\in L^2$，

$$
\operatorname{Var}\!\left(\sum_{i=1}^nX_i\right)
\mathrel{=}
\sum_{i=1}^n\operatorname{Var}(X_i)
+2\sum_{1\le i\lt j\le n}\operatorname{Cov}(X_i,X_j).
$$

若 $X_i$ 相互独立，则乘积期望分解给出所有交叉协方差为 $0$，从而

$$
\operatorname{Var}\!\left(\sum_{i=1}^nX_i\right)
\mathrel{=}
\sum_{i=1}^n\operatorname{Var}(X_i).
$$

---

## 7. 条件分布：离散与密度公式

若 $Y$ 离散且 $P(Y=y)>0$，定义

$$
p_{X\mid Y}(x\mid y)
\mathrel{=}
P(X=x\mid Y=y)
\mathrel{=}
\frac{p_{X,Y}(x,y)}{p_Y(y)}.
$$

若 $(X,Y)$ 具有联合密度，且 $f_Y(y)>0$，定义条件密度

$$
f_{X\mid Y}(x\mid y)
\mathrel{=}
\frac{f_{X,Y}(x,y)}{f_Y(y)}.
$$

对每个这样的 $y$，它关于 $x$ 的积分为 $1$。

一般概率空间中，事件 $\{Y=y\}$ 可能概率为 $0$，此时不能通过除以 $P(Y=y)$ 定义条件概率。严谨对象是**相对于信息 $\sigma$-代数的条件期望**；若状态空间是 standard Borel，则可以进一步选取 regular conditional distribution。后者的存在性是一条测度论定理，本篇不证明。

---

## 8. 相对于 $\sigma$-代数的条件期望

设 $\mathcal G\subseteq\mathcal F$ 是子 $\sigma$-代数，表示当前可用的信息。

**定义（条件期望）**：若 $X\in L^1(P)$，随机变量 $Y$ 若满足

1. $Y$ 是 $\mathcal G$-可测的；
2. $Y\in L^1(P)$；
3. 对每个 $G\in\mathcal G$，

$$
\int_GY\,dP=\int_GX\,dP,
$$

则称 $Y$ 是 $X$ 给定 $\mathcal G$ 的条件期望，记作

$$
Y=\mathbb E[X\mid\mathcal G].
$$

**外部依赖（存在唯一性）**：条件期望的存在由 Radon–Nikodym 定理得到。其几乎处处唯一性由下面的标准引理推出：若两个 $\mathcal G$-可测可积函数在所有 $G\in\mathcal G$ 上积分相同，则它们 a.s. 相等。Radon–Nikodym 定理与该引理属于测度论依赖，不在本篇重新证明。

对随机变量 $Y$，约定

$$
\mathbb E[X\mid Y]
\mathrel{=}
\mathbb E[X\mid\sigma(Y)].
$$

离散情形下，这一定义恢复熟悉公式：

$$
\mathbb E[X\mid Y=y]
\mathrel{=}
\sum_xx\,p_{X\mid Y}(x\mid y),
$$

而 $\mathbb E[X\mid Y]$ 是把右侧视为 $y$ 的函数后再代入随机变量 $Y$。

### 基本性质

由定义和 a.s. 唯一性可得：

$$
\mathbb E[aX+bZ\mid\mathcal G]
\mathrel{=}
a\mathbb E[X\mid\mathcal G]
+b\mathbb E[Z\mid\mathcal G],
$$

若 $X\le Z$ a.s.，则

$$
\mathbb E[X\mid\mathcal G]
\le
\mathbb E[Z\mid\mathcal G]
\quad\text{a.s.}
$$

若 $X$ 已经 $\mathcal G$-可测，则

$$
\mathbb E[X\mid\mathcal G]=X
\quad\text{a.s.}
$$

若 $Z$ 有界且 $\mathcal G$-可测，则

$$
\mathbb E[ZX\mid\mathcal G]
\mathrel{=}
Z\mathbb E[X\mid\mathcal G]
\quad\text{a.s.}
$$

最后一条先对 $Z=\mathbf1_G$ 由定义验证，再扩展到简单函数。对一般有界的 $\mathcal G$-可测 $Z$，取简单函数 $Z_m\to Z$ a.s. 且 $|Z_m|\le\|Z\|_\infty$。对每个 $G\in\mathcal G$，等式两侧分别由 $\|Z\|_\infty|X|$ 与 $\|Z\|_\infty|\mathbb E[X\mid\mathcal G]|$ 支配，因此可用 dominated convergence 把简单函数情形的积分恒等式传到极限。

---

## 9. 塔律与全期望公式

**定理（tower property）**：若

$$
\mathcal H\subseteq\mathcal G\subseteq\mathcal F
$$

且 $X\in L^1(P)$，则

$$
\mathbb E[\mathbb E[X\mid\mathcal G]\mid\mathcal H]
\mathrel{=}
\mathbb E[X\mid\mathcal H]
\quad\text{a.s.}
$$

{{< details summary="证明：塔律" >}}

令 $Y=\mathbb E[X\mid\mathcal G]$。对任意 $H\in\mathcal H$，因为 $\mathcal H\subseteq\mathcal G$，也有 $H\in\mathcal G$，所以

$$
\int_HY\,dP=\int_HX\,dP.
$$

因此 $\mathbb E[Y\mid\mathcal H]$ 满足 $X$ 关于 $\mathcal H$ 的条件期望定义。由 a.s. 唯一性，

$$
\mathbb E[Y\mid\mathcal H]
\mathrel{=}
\mathbb E[X\mid\mathcal H].
$$

{{< /details >}}

取平凡 $\sigma$-代数 $\mathcal H=\{\emptyset,\Omega\}$，得到**全期望公式**：

$$
\mathbb E[\mathbb E[X\mid\mathcal G]]
\mathrel{=}
\mathbb E[X].
$$

离散 $Y$ 的版本为

$$
\mathbb E[X]
\mathrel{=}
\sum_y\mathbb E[X\mid Y=y]P(Y=y),
$$

求和只需遍历 $P(Y=y)>0$ 的取值。

---

## 10. 条件方差与全方差公式

设 $X\in L^2(P)$。此时 $M=\mathbb E[X\mid\mathcal G]$ 也属于 $L^2(P)$：对截断 $M_K=\max\{-K,\min\{M,K\}\}$ 使用条件期望定义，可得 $\mathbb E[M M_K]=\mathbb E[X M_K]$；再由 $M M_K\ge M_K^2$ 与 Cauchy–Schwarz，得到 $\lVert M_K\rVert_2\le\lVert X\rVert_2$，令 $K\to\infty$ 即得 $\lVert M\rVert_2\le\lVert X\rVert_2$。因此下面所有乘积都可积。

**定义（条件方差）**：

$$
\operatorname{Var}(X\mid\mathcal G)
\mathrel{=}
\mathbb E\!\left[
(X-\mathbb E[X\mid\mathcal G])^2
\mid\mathcal G
\right].
$$

展开可得

$$
\operatorname{Var}(X\mid\mathcal G)
\mathrel{=}
\mathbb E[X^2\mid\mathcal G]
\mathbin{-}
\mathbb E[X\mid\mathcal G]^2.
$$

**定理（law of total variance）**：

$$
\operatorname{Var}(X)
\mathrel{=}
\mathbb E[\operatorname{Var}(X\mid\mathcal G)]
+
\operatorname{Var}(\mathbb E[X\mid\mathcal G]).
$$

{{< details summary="证明：全方差公式" >}}

令

$$
m=\mathbb E[X],
\qquad
M=\mathbb E[X\mid\mathcal G].
$$

分解

$$
X-m=(X-M)+(M-m).
$$

平方后取期望：

$$
\begin{aligned}
\operatorname{Var}(X)
&=\mathbb E[(X-M)^2]
+\mathbb E[(M-m)^2]\\
&\quad+2\mathbb E[(X-M)(M-m)].
\end{aligned}
$$

交叉项为零。因为 $M-m$ 是 $\mathcal G$-可测的，且“提出已知量”的性质可由有界截断扩展到当前 $L^2$ 情形，

$$
\begin{aligned}
\mathbb E[(X-M)(M-m)]
&=\mathbb E\!\left[
\mathbb E[(X-M)(M-m)\mid\mathcal G]
\right]\\
&=\mathbb E\!\left[
(M-m)\mathbb E[X-M\mid\mathcal G]
\right]\\
&=0.
\end{aligned}
$$

第一项由全期望公式变成

$$
\mathbb E[(X-M)^2]
\mathrel{=}
\mathbb E[\operatorname{Var}(X\mid\mathcal G)],
$$

第二项正是 $\operatorname{Var}(M)$。代回即得结论。

{{< /details >}}

这个分解把总二阶波动分成“给定信息后仍剩余的平均波动”与“条件均值自身的波动”，也为 Part 4 中样本平均方差按 $1/n$ 缩小提供了统一的二阶语言。

---

## 总结与分叉

本篇建立了概率主干最重要的积分结构：

$$
\mathbb E[g(X)]=\int g\,d\mu_X,
$$

$$
\operatorname{Var}(X)=\mathbb E[X^2]-\mathbb E[X]^2,
$$

以及

$$
\mathbb E[\mathbb E[X\mid\mathcal G]]
\mathrel{=}
\mathbb E[X],
$$

$$
\operatorname{Var}(X)
\mathrel{=}
\mathbb E[\operatorname{Var}(X\mid\mathcal G)]
+
\operatorname{Var}(\mathbb E[X\mid\mathcal G]).
$$

从这里开始有两个直接出口：独立重复样本进入收敛与集中；按时间索引的随机变量族进入随机过程。

[返回：概率论 Part 2——随机变量、CDF 与常见分布族](/notes/math/probability/note-prob-2-random-variables-distributions/)

[继续阅读：概率论 Part 4——收敛方式、大数定律、中心极限定理与集中不等式](/notes/math/probability/note-prob-4-limits-concentration/)

[转入过程线：概率论 Part 6——随机过程、Markov 链、排队与尾延迟](/notes/math/probability/note-prob-6-stochastic-processes-queues/)
