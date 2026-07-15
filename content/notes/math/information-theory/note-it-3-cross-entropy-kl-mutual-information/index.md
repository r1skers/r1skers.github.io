---
date: '2026-07-15T11:00:00+09:00'
draft: false
title: '信息论 Part 3：交叉熵、KL 散度与互信息'
summary: "从真实分布 p 与描述分布 q 的错配出发，定义交叉熵与 KL 散度，证明 Gibbs 不等式，再把 KL 施加于联合分布与边缘乘积分布，得到互信息的等价形式与独立性刻画。"
description: "信息论基础笔记：交叉熵、KL 散度、交叉熵分解、Gibbs 不等式、互信息的 KL 定义、熵等价式、条件 KL 表示、非负性、独立性与上界证明。"
tags: ["Information Theory", "Cross Entropy", "KL Divergence", "Gibbs Inequality", "Mutual Information", "Independence", "Proof"]
categories: ["Crucible"]
---

# 信息论 Part 3：交叉熵、KL 散度与互信息

> [Part 1](/notes/math/information-theory/note-it-1-entropy-self-information/) 和 [Part 2](/notes/math/information-theory/note-it-2-joint-conditional-entropy/) 中的熵都由真实分布自身产生。本篇加入第二个分布 $q$：数据依照 $p$ 出现，却使用 $q$ 来描述。由这个错配得到交叉熵与 KL 散度，再把同一结构用于随机变量之间的依赖，得到互信息。

本篇的链条是：

$$
H(p,q)
\longrightarrow
D_{\mathrm{KL}}(p\|q)
\longrightarrow
H(p,q)=H(p)+D_{\mathrm{KL}}(p\|q)
\longrightarrow
I(X;Y)=D_{\mathrm{KL}}(p_{X,Y}\|p_Xp_Y).
$$

仍假设所有分布定义在有限离散字母表上，且 $\log=\log_2$。除 $0\log0=0$ 外，再约定

$$
0\log\frac0q=0,
\qquad
p\log\frac p0=+\infty\quad(p>0).
$$

---

## 1. 交叉熵

设 $p,q$ 是同一有限字母表 $\mathcal X$ 上的两个概率分布。$p$ 决定结果真实出现的频率，$q$ 决定对这些结果赋予的 log-loss，也可解释为理想化描述长度 $-\log q(x)$。这个量可以是实数；一般前缀码的实际码长还受到整数码长与可译码条件约束。

**定义（交叉熵）**：

$$
H(p,q)
=-\sum_{x\in\mathcal X}p(x)\log q(x)
=\mathbb E_{X\sim p}[-\log q(X)].
$$

若存在某个 $x$ 满足 $p(x)>0$ 而 $q(x)=0$，则定义

$$
H(p,q)=+\infty.
$$

交叉熵的平均仍在真实分布 $p$ 下进行，但被平均的不是 $-\log p(X)$，而是 $-\log q(X)$。二者之差正是 KL 散度。

---

## 2. KL 散度

**定义（Kullback–Leibler divergence）**：

$$
D_{\mathrm{KL}}(p\|q)
=\sum_{x\in\mathcal X}p(x)
\log\frac{p(x)}{q(x)}.
$$

若

$$
\operatorname{supp}(p)
\nsubseteq
\operatorname{supp}(q),
$$

则 $D_{\mathrm{KL}}(p\|q)=+\infty$。

$D_{\mathrm{KL}}(p\|q)$ 的两个位置承担不同角色：期望在 $p$ 下取，而分母中的 $q$ 是被比较的分布。因此交换 $p,q$ 会改变定义，一般没有

$$
D_{\mathrm{KL}}(p\|q)=D_{\mathrm{KL}}(q\|p).
$$

---

## 3. 交叉熵分解

**命题**：

$$
H(p,q)=H(p)+D_{\mathrm{KL}}(p\|q).
$$

{{< details summary="证明：交叉熵分解" >}}

当 $\operatorname{supp}(p)\subseteq\operatorname{supp}(q)$ 时，直接展开：

$$
\begin{aligned}
D_{\mathrm{KL}}(p\|q)
&=\sum_xp(x)\log\frac{p(x)}{q(x)}\\
&=\sum_xp(x)\log p(x)-\sum_xp(x)\log q(x)\\
&=-H(p)+H(p,q).
\end{aligned}
$$

移项即得

$$
H(p,q)=H(p)+D_{\mathrm{KL}}(p\|q).
$$

若支撑不匹配，则 $H(p,q)$ 与 $D_{\mathrm{KL}}(p\|q)$ 同为 $+\infty$；有限离散分布的 $H(p)$ 有限，因此等式在扩展实数意义下仍成立。

证毕。

{{< /details >}}

这个分解在代数上把交叉熵拆成 $H(p)$ 与 $D_{\mathrm{KL}}(p\|q)$。下一节证明 KL 非负后，第二项才能严格解释为使用 $q$ 代替 $p$ 所增加的 log-loss。

---

## 4. Gibbs 不等式：KL 为什么非负

**定理（Gibbs inequality）**：

$$
D_{\mathrm{KL}}(p\|q)\ge0,
$$

且等号成立当且仅当 $p=q$。

{{< details summary="证明：Gibbs 不等式" >}}

记 $S=\operatorname{supp}(p)$。若存在 $x\in S$ 使 $q(x)=0$，则

$$
D_{\mathrm{KL}}(p\|q)=+\infty,
$$

结论成立。以下假设 $q(x)>0$ 对所有 $x\in S$ 成立。

由基本不等式

$$
\ln t\le t-1,\qquad t>0,
$$

可得

$$
-\log_2t\ge\frac{1-t}{\ln2}.
$$

对每个 $x\in S$ 取

$$
t=\frac{q(x)}{p(x)},
$$

于是

$$
\begin{aligned}
D_{\mathrm{KL}}(p\|q)
&=-\sum_{x\in S}p(x)\log_2\frac{q(x)}{p(x)}\\
&\ge
\frac1{\ln2}
\sum_{x\in S}p(x)
\left(1-\frac{q(x)}{p(x)}\right)\\
&=\frac1{\ln2}
\left(1-\sum_{x\in S}q(x)\right)\\
&\ge0.
\end{aligned}
$$

要使最终等号成立，首先必须有

$$
\sum_{x\in S}q(x)=1,
$$

所以 $q$ 在 $S$ 外没有概率质量。此时若 $D_{\mathrm{KL}}(p\|q)=0$，由点态不等式产生的非负余项之加权和也必须为零。由于每个 $x\in S$ 都有 $p(x)>0$，每一个点态不等式都必须取等。又因为 $\ln t\le t-1$ 的等号只在 $t=1$ 时成立，因此对每个 $x\in S$，

$$
\frac{q(x)}{p(x)}=1.
$$

故 $q(x)=p(x)$ 对所有 $x$ 成立，即 $p=q$。

反过来，若 $p=q$，则每一项都是 $p(x)\log1=0$，所以 KL 为零。

证毕。

{{< /details >}}

结合交叉熵分解，立刻得到：

$$
H(p,q)\ge H(p),
$$

且等号成立当且仅当 $q=p$。因此在真实分布 $p$ 固定时，交叉熵以 $q=p$ 取得唯一最小值。

---

## 5. 互信息：联合分布偏离独立乘积多少

对随机变量 $X,Y$，若它们独立，则联合分布分解为

$$
p_{X,Y}(x,y)=p_X(x)p_Y(y).
$$

因此可以把真实联合分布 $p_{X,Y}$ 与“假设独立”时的乘积分布 $p_Xp_Y$ 放进 KL 散度。

**定义（互信息）**：

$$
\begin{aligned}
I(X;Y)
&=D_{\mathrm{KL}}(p_{X,Y}\|p_Xp_Y)\\
&=\sum_{x,y}p_{X,Y}(x,y)
\log\frac{p_{X,Y}(x,y)}{p_X(x)p_Y(y)}.
\end{aligned}
$$

只要 $p_{X,Y}(x,y)>0$，就必有 $p_X(x)>0$ 且 $p_Y(y)>0$，因此有限离散情形下该 KL 的支撑条件自动满足。

---

## 6. 互信息的熵等价式

**定理**：

$$
I(X;Y)=H(X)+H(Y)-H(X,Y).
$$

结合 Part 2 的链式法则，还可写成

$$
I(X;Y)=H(X)-H(X\mid Y)
$$

以及

$$
I(X;Y)=H(Y)-H(Y\mid X).
$$

{{< details summary="证明：互信息的熵等价式" >}}

从 KL 定义展开：

$$
\begin{aligned}
I(X;Y)
&=\sum_{x,y}p(x,y)
\left[
\log p(x,y)-\log p_X(x)-\log p_Y(y)
\right]\\
&=\sum_{x,y}p(x,y)\log p(x,y)\\
&\quad
-\sum_x\left(\sum_yp(x,y)\right)\log p_X(x)\\
&\quad
-\sum_y\left(\sum_xp(x,y)\right)\log p_Y(y)\\
&=-H(X,Y)+H(X)+H(Y).
\end{aligned}
$$

再使用

$$
H(X,Y)=H(X)+H(Y\mid X),
$$

得到

$$
I(X;Y)=H(Y)-H(Y\mid X).
$$

交换 $X,Y$ 可得

$$
I(X;Y)=H(X)-H(X\mid Y).
$$

证毕。

{{< /details >}}

因此，互信息同时拥有两种完全等价的读法：它既是联合分布到独立乘积分布的 KL 散度，也是观察一个变量后另一个变量所减少的平均熵。

---

## 7. 互信息是条件 KL 的平均

**命题**：

$$
I(X;Y)
=\sum_{x:p_X(x)>0}p_X(x)
D_{\mathrm{KL}}\!\left(
p_{Y\mid X=x}\|p_Y
\right).
$$

求和只遍历 $p_X(x)>0$ 的条件事件，从而不需要处理零权重乘以未定义或无穷 KL 的表达式。

{{< details summary="证明：互信息的条件 KL 表示" >}}

利用

$$
p_{X,Y}(x,y)=p_X(x)p_{Y\mid X}(y\mid x),
$$

有

$$
\begin{aligned}
I(X;Y)
&=\sum_{x:p_X(x)>0}\sum_y p_X(x)p(y\mid x)
\log\frac{p_X(x)p(y\mid x)}{p_X(x)p_Y(y)}\\
&=\sum_{x:p_X(x)>0}p_X(x)
\sum_yp(y\mid x)
\log\frac{p(y\mid x)}{p_Y(y)}\\
&=\sum_{x:p_X(x)>0}p_X(x)
D_{\mathrm{KL}}\!\left(p_{Y\mid X=x}\|p_Y\right).
\end{aligned}
$$

证毕。

{{< /details >}}

这个等式说明，互信息衡量的是：随着 $X$ 的取值变化，$Y$ 的条件分布平均偏离其边缘分布多少。

---

## 8. 非负性、独立性与上界

由互信息的 KL 定义和 Gibbs 不等式，

$$
I(X;Y)\ge0.
$$

并且

$$
\begin{aligned}
I(X;Y)=0
&\Longleftrightarrow
p_{X,Y}=p_Xp_Y\\
&\Longleftrightarrow
X\text{ 与 }Y\text{ 独立}.
\end{aligned}
$$

互信息的熵等价式还给出

$$
I(X;Y)=H(X)-H(X\mid Y)\le H(X),
$$

以及

$$
I(X;Y)=H(Y)-H(Y\mid X)\le H(Y).
$$

所以

$$
0\le I(X;Y)\le\min\{H(X),H(Y)\}.
$$

由 Part 2 的零条件熵刻画，

$$
I(X;Y)=H(Y)
\quad\Longleftrightarrow\quad
H(Y\mid X)=0
\quad\Longleftrightarrow\quad
Y=f(X)\text{ 几乎必然成立}.
$$

交换 $X,Y$ 可得对称结论。

因而，若 $H(X)\le H(Y)$，则

$$
I(X;Y)=\min\{H(X),H(Y)\}=H(X)
$$

当且仅当 $X$ 几乎必然是 $Y$ 的函数；若 $H(Y)\le H(X)$，则对称地要求 $Y$ 几乎必然是 $X$ 的函数。当 $H(X)=H(Y)$ 时，上界取等会同时推出 $H(X\mid Y)=H(Y\mid X)=0$，因此两个变量几乎必然互为确定函数。

---

## 总结与分叉

本篇把三类对象压进同一条等式链：

$$
H(p,q)=H(p)+D_{\mathrm{KL}}(p\|q),
$$

$$
D_{\mathrm{KL}}(p\|q)\ge0,
$$

以及

$$
\begin{aligned}
I(X;Y)
&=D_{\mathrm{KL}}(p_{X,Y}\|p_Xp_Y)\\
&=H(X)+H(Y)-H(X,Y)\\
&=H(Y)-H(Y\mid X).
\end{aligned}
$$

前三篇到这里构成共同基础，但后续不再是一条唯一的 “Part 4”。这里有两个不同出口。

### Information Geometry 主线

沿 KL divergence 继续追问其参数微分结构。在参数化分布族上，KL 在对角线附近的二阶项给出 Fisher metric，并进一步连接 natural gradient、指数族与凸对偶。

[进入信息几何 G1：Score Function 与 Fisher Information](/notes/math/information-geometry/note-ig-1-score-fisher/)

### Shannon / Source Coding 支线

沿熵与 i.i.d. 重复继续追问长序列的渐近结构。对序列 $X^n=(X_1,\ldots,X_n)$，每符号信息量

$$
-\frac1n\log p_{X^n}(X^n)
$$

将收敛到单符号熵 $H(X)$，由此得到 AEP 与典型集。它是熵加上大数定律的出口，并不是互信息之后必然接续的唯一主题。

[进入 Shannon 支线 S1：AEP、典型集与熵的渐近意义](/notes/math/information-theory/note-it-4-aep-typical-set/)

[返回：信息论与信息几何路线图](/notes/math/information-theory/note-it-0-roadmap/)
