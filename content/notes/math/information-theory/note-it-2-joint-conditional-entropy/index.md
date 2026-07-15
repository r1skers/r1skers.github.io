---
date: '2026-07-15T10:30:00+09:00'
draft: false
title: '信息论 Part 2：联合熵、条件熵与链式法则'
summary: "把熵从单个随机变量推广到变量对，定义联合熵与条件熵，证明链式法则、条件化不增熵以及联合熵的上下界。"
description: "信息论基础笔记：有限离散随机变量的联合熵、条件熵、二元与多变量链式法则，条件熵为零的函数刻画，conditioning reduces entropy 与联合熵次可加性的证明。"
tags: ["Information Theory", "Joint Entropy", "Conditional Entropy", "Chain Rule", "Independence", "Proof"]
categories: ["Crucible"]
---

# 信息论 Part 2：联合熵、条件熵与链式法则

> [Part 1](/notes/math/information-theory/note-it-1-entropy-self-information/) 把熵定义为单个随机变量的平均自信息。本篇把对象扩展为一对随机变量，并回答：先知道 $X$ 以后，$Y$ 还剩多少不确定性？

本篇的链条是：

$$
\begin{aligned}
H(X),H(Y)
&\longrightarrow H(X,Y)\longrightarrow H(Y\mid X)\\
&\longrightarrow H(X,Y)=H(X)+H(Y\mid X)\\
&\longrightarrow H(Y\mid X)\le H(Y).
\end{aligned}
$$

仍假设 $X,Y$ 取值于有限离散字母表，且 $\log=\log_2$。

---

## 1. 联合熵

变量对 $(X,Y)$ 本身就是一个取值于 $\mathcal X\times\mathcal Y$ 的随机变量。它的分布是联合分布

$$
p_{X,Y}(x,y)=P(X=x,Y=y).
$$

**定义（联合熵）**：

$$
H(X,Y)
=-\sum_{x\in\mathcal X}\sum_{y\in\mathcal Y}
p_{X,Y}(x,y)\log p_{X,Y}(x,y).
$$

等价地，

$$
H(X,Y)=\mathbb E[-\log p_{X,Y}(X,Y)].
$$

联合熵计算的是把 $(X,Y)$ 作为一个整体观察时的平均信息量。要把它拆成“先观察 $X$，再观察 $Y$”的两阶段结构，需要条件熵。

---

## 2. 条件熵

对任意满足 $p_X(x)>0$ 的 $x$，条件分布为

$$
p_{Y\mid X}(y\mid x)
=\frac{p_{X,Y}(x,y)}{p_X(x)}.
$$

固定 $X=x$ 后，$Y$ 的熵定义为

$$
H(Y\mid X=x)
=-\sum_{y\in\mathcal Y}
p_{Y\mid X}(y\mid x)
\log p_{Y\mid X}(y\mid x).
$$

**定义（条件熵）**：对不同 $x$ 下的条件熵按 $p_X(x)$ 加权平均，得到

$$
\begin{aligned}
H(Y\mid X)
&=\sum_{x\in\mathcal X}p_X(x)H(Y\mid X=x)\\
&=-\sum_{x,y}p_{X,Y}(x,y)\log p_{Y\mid X}(y\mid x).
\end{aligned}
$$

当 $p_X(x)=0$ 时，任取一个 $\mathcal Y$ 上的概率分布作为 $p_{Y\mid X=x}$。所有相关等式都由权重 $p_X(x)=0$ 消去这一选择，因此条件熵、边缘化公式和后续结论均与该任意延拓无关。

条件熵不是某个固定条件 $x$ 下的熵，而是观察随机变量 $X$ 以后，$Y$ 所剩不确定性的平均值。

---

## 3. 熵的链式法则

联合分布可以分解为

$$
p_{X,Y}(x,y)=p_X(x)p_{Y\mid X}(y\mid x).
$$

乘法在负对数下变成加法，这正是链式法则的来源。

**定理（二元熵链式法则）**：

$$
H(X,Y)=H(X)+H(Y\mid X).
$$

对称地，

$$
H(X,Y)=H(Y)+H(X\mid Y).
$$

{{< details summary="证明：二元熵链式法则" >}}

在 $p_{X,Y}(x,y)>0$ 的点上，必有 $p_X(x)>0$，且

$$
\log p_{X,Y}(x,y)
=\log p_X(x)+\log p_{Y\mid X}(y\mid x).
$$

代入联合熵：

$$
\begin{aligned}
H(X,Y)
&=-\sum_{x,y}p_{X,Y}(x,y)\log p_{X,Y}(x,y)\\
&=-\sum_{x,y}p_{X,Y}(x,y)\log p_X(x)\\
&\quad
-\sum_{x,y}p_{X,Y}(x,y)\log p_{Y\mid X}(y\mid x).
\end{aligned}
$$

第一项中对 $y$ 求和：

$$
-\sum_x\left(\sum_y p_{X,Y}(x,y)\right)\log p_X(x)
=-\sum_xp_X(x)\log p_X(x)
=H(X).
$$

第二项按条件熵的定义正是 $H(Y\mid X)$。因此

$$
H(X,Y)=H(X)+H(Y\mid X).
$$

交换 $X,Y$ 的位置即可得到对称式。

证毕。

{{< /details >}}

**推论（多变量熵链式法则）**：对 $n\ge1$ 个有限离散随机变量 $X_1,\ldots,X_n$，

$$
H(X_1,\ldots,X_n)
=\sum_{i=1}^nH(X_i\mid X_1,\ldots,X_{i-1}),
$$

其中第一项约定为 $H(X_1)$。

{{< details summary="证明：多变量熵链式法则" >}}

对 $n=1$，右侧按约定只有 $H(X_1)$，结论平凡成立；对 $n=2$，结论就是二元链式法则。

假设结论对 $n-1$ 个变量成立。把 $(X_1,\ldots,X_{n-1})$ 看成一个联合随机变量，由二元链式法则，

$$
H(X_1,\ldots,X_n)
=H(X_1,\ldots,X_{n-1})
+H(X_n\mid X_1,\ldots,X_{n-1}).
$$

再对第一项使用归纳假设：

$$
H(X_1,\ldots,X_{n-1})
=\sum_{i=1}^{n-1}H(X_i\mid X_1,\ldots,X_{i-1}).
$$

两式相加即得结论。

证毕。

{{< /details >}}

---

## 4. 条件熵何时为零

**定理（零条件熵的函数刻画）**：

$$
H(Y\mid X)=0
$$

当且仅当存在函数 $f:\mathcal X\to\mathcal Y$，使得

$$
Y=f(X)\qquad\text{几乎必然成立}.
$$

{{< details summary="证明：零条件熵的函数刻画" >}}

由 Part 1 的熵非负性，对每个 $p_X(x)>0$，

$$
H(Y\mid X=x)\ge0.
$$

而

$$
H(Y\mid X)=\sum_xp_X(x)H(Y\mid X=x).
$$

这是非负数的加权和。它等于零，当且仅当对每个 $p_X(x)>0$ 的 $x$，都有

$$
H(Y\mid X=x)=0.
$$

由 Part 1 的零熵刻画，每一个这样的条件分布都集中在某个唯一值 $f(x)$ 上。于是

$$
P(Y=f(X)\mid X=x)=1
$$

对所有 $p_X(x)>0$ 的 $x$ 成立，从而 $Y=f(X)$ 几乎必然成立。对 $p_X(x)=0$ 的点，可任意延拓 $f$。

反过来，若 $Y=f(X)$ 几乎必然成立，则对每个 $p_X(x)>0$，条件分布 $p_{Y\mid X}(\cdot\mid x)$ 都是点质量，所以每个 $H(Y\mid X=x)=0$，进而 $H(Y\mid X)=0$。

证毕。

{{< /details >}}

结合链式法则可得：

$$
H(X,Y)=H(X)
\quad\Longleftrightarrow\quad
Y=f(X)\text{ 几乎必然成立}.
$$

---

## 5. 条件化不会增加平均熵

边缘分布可以写成条件分布的混合：

$$
p_Y(\cdot)
=\sum_xp_X(x)p_{Y\mid X=x}(\cdot).
$$

Part 1 已由二元凹性归纳出有限混合版本，因此混合分布的熵不小于各成分熵的加权平均。

**定理（conditioning reduces entropy）**：

$$
H(Y\mid X)\le H(Y).
$$

等号成立当且仅当 $X$ 与 $Y$ 独立。

{{< details summary="证明：条件化不会增加平均熵" >}}

由边缘化公式，

$$
p_Y=\sum_xp_X(x)p_{Y\mid X=x}.
$$

对这一分布混合使用熵的凹性：

$$
\begin{aligned}
H(Y)
&=H\!\left(\sum_xp_X(x)p_{Y\mid X=x}\right)\\
&\ge\sum_xp_X(x)H(Y\mid X=x)\\
&=H(Y\mid X).
\end{aligned}
$$

对于所有 $p_X(x)>0$ 的 $x$，凹性的等号条件要求条件分布 $p_{Y\mid X=x}$ 完全相同。它们的混合是 $p_Y$，所以共同分布只能是 $p_Y$。因此

$$
p_{Y\mid X}(y\mid x)=p_Y(y)
$$

对所有 $p_X(x)>0$ 的 $x$ 成立。这等价于

$$
p_{X,Y}(x,y)=p_X(x)p_Y(y),
$$

即 $X,Y$ 独立。

反过来，若 $X,Y$ 独立，则 $p_{Y\mid X=x}=p_Y$，所以

$$
H(Y\mid X)=\sum_xp_X(x)H(Y)=H(Y).
$$

证毕。

{{< /details >}}

这里的结论是对随机条件 $X$ 取平均后的不等式。它与链式法则一起控制了联合熵的范围。

---

## 6. 联合熵的上下界

**定理**：

$$
\max\{H(X),H(Y)\}
\le H(X,Y)
\le H(X)+H(Y).
$$

右侧等号成立当且仅当 $X,Y$ 独立。左侧中，

$$
H(X,Y)=H(X)
$$

当且仅当 $Y$ 几乎必然是 $X$ 的函数；交换 $X,Y$ 可得另一侧的等号条件。

因此，若 $H(X)\ge H(Y)$，则整个下界取等

$$
H(X,Y)=\max\{H(X),H(Y)\}=H(X)
$$

当且仅当 $Y$ 几乎必然是 $X$ 的函数；若 $H(Y)\ge H(X)$，则对称地要求 $X$ 几乎必然是 $Y$ 的函数。当 $H(X)=H(Y)$ 时，下界取等会同时推出两个条件熵都为零，因此两个变量几乎必然互为确定函数。

{{< details summary="证明：联合熵的上下界" >}}

由条件熵非负性与链式法则，

$$
H(X,Y)=H(X)+H(Y\mid X)\ge H(X).
$$

对称地，

$$
H(X,Y)\ge H(Y).
$$

因此

$$
H(X,Y)\ge\max\{H(X),H(Y)\}.
$$

再由条件化不增熵，

$$
H(X,Y)
=H(X)+H(Y\mid X)
\le H(X)+H(Y).
$$

各等号条件分别来自上一节的独立性刻画与零条件熵的函数刻画。

证毕。

{{< /details >}}

---

## 总结与下一站

本篇建立了三个核心对象之间的精确关系：

$$
H(X,Y)=H(X)+H(Y\mid X)=H(Y)+H(X\mid Y).
$$

同时，

$$
0\le H(Y\mid X)\le H(Y),
$$

其中左侧等号对应“$Y$ 由 $X$ 决定”，右侧等号对应“$X,Y$ 独立”。因此

$$
\max\{H(X),H(Y)\}
\le H(X,Y)
\le H(X)+H(Y).
$$

到这里，所有熵都由同一个真实联合分布产生。下一篇将引入两个不同分布 $p$ 与 $q$，由交叉熵进入 KL 散度，再把 KL 用到联合分布与边缘分布乘积之间，得到互信息。

[继续阅读：信息论 Part 3——交叉熵、KL 散度与互信息](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)
