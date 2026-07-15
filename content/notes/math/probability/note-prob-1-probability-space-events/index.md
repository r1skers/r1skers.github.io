---
date: '2026-07-15T12:15:00+09:00'
draft: false
title: '概率论 Part 1：概率空间、条件概率、独立性与 Bayes'
summary: "从概率空间三元组出发，证明概率测度的基本推论，再由条件概率建立乘法公式、独立性、全概率公式与 Bayes 公式。"
description: "概率论基础：样本空间、σ-代数、概率测度、事件运算、概率的连续性、条件概率、独立性、全概率公式与 Bayes 公式及其证明。"
tags: ["Probability Theory", "Probability Space", "Conditional Probability", "Independence", "Bayes Theorem", "Proof"]
categories: ["Crucible"]
math: true
---

# 概率论 Part 1：概率空间、条件概率、独立性与 Bayes

> 本篇从一般概率空间开始，不假设样本空间有限或可数。唯一的集合论结构是 $\sigma$-代数，唯一的数值结构是可数可加的概率测度。

本篇的链条是

$$
(\Omega,\mathcal F,P)
\longrightarrow
\text{事件运算与测度连续性}
\longrightarrow
P(A\mid B)
\longrightarrow
\text{独立性、全概率与 Bayes}.
$$

---

## 1. 样本空间、事件与 $\sigma$-代数

**定义（样本空间）**：随机试验所有可能结果组成的集合记为 $\Omega$。单个结果记为 $\omega\in\Omega$。

不是任意子集都必须被赋予概率。能够被赋予概率的子集组成集合族 $\mathcal F$。

**定义（$\sigma$-代数）**：若 $\mathcal F\subseteq2^\Omega$ 满足

1. $\Omega\in\mathcal F$；
2. $A\in\mathcal F\Rightarrow A^c\in\mathcal F$；
3. $A_1,A_2,\ldots\in\mathcal F\Rightarrow\bigcup_{n=1}^\infty A_n\in\mathcal F$，

则称 $\mathcal F$ 是 $\Omega$ 上的 $\sigma$-代数，其元素称为**事件**。

由 De Morgan 律，$\mathcal F$ 也对可数交封闭：

$$
\bigcap_{n=1}^\infty A_n
=
\left(\bigcup_{n=1}^\infty A_n^c\right)^c
\in\mathcal F.
$$

空集也可测，因为 $\emptyset=\Omega^c\in\mathcal F$。

---

## 2. 概率测度

**定义（概率测度）**：映射 $P:\mathcal F\to[0,1]$ 若满足

1. $P(\Omega)=1$；
2. 对任意两两不交的 $A_1,A_2,\ldots\in\mathcal F$，

$$
P\!\left(\bigcup_{n=1}^\infty A_n\right)
=
\sum_{n=1}^\infty P(A_n),
$$

则称 $P$ 是 $\mathcal F$ 上的概率测度，$(\Omega,\mathcal F,P)$ 称为**概率空间**。

下面所有基本公式都从这两条公理推出。

### 空事件、补事件与有限可加性

**命题**：对任意 $A,B\in\mathcal F$，

$$
P(\emptyset)=0,
\qquad
P(A^c)=1-P(A),
$$

并且若 $A\cap B=\emptyset$，则

$$
P(A\cup B)=P(A)+P(B).
$$

{{< details summary="证明：概率测度的三个基本推论" >}}

因为

$$
\Omega=\Omega\cup\emptyset\cup\emptyset\cup\cdots
$$

是两两不交并，由可数可加性，

$$
1=P(\Omega)=P(\Omega)+\sum_{n=1}^\infty P(\emptyset).
$$

所有项非负，所以 $P(\emptyset)=0$。

又因为 $A\cap A^c=\emptyset$ 且 $A\cup A^c=\Omega$，有限可加性给出

$$
1=P(\Omega)=P(A)+P(A^c),
$$

故 $P(A^c)=1-P(A)$。有限可加性本身是在可数可加性中令第三项以后全为空集得到的。

{{< /details >}}

### 单调性与差集公式

**命题**：若 $A\subseteq B$，则

$$
P(A)\le P(B),
$$

并且

$$
P(B\setminus A)=P(B)-P(A).
$$

{{< details summary="证明：单调性与差集公式" >}}

由

$$
B=A\mathbin{\dot\cup}(B\setminus A),
$$

其中点号表示不交并，有限可加性给出

$$
P(B)=P(A)+P(B\setminus A).
$$

第二项非负，所以 $P(A)\le P(B)$；移项即得差集公式。

{{< /details >}}

### 容斥与 union bound

**命题**：

$$
P(A\cup B)=P(A)+P(B)-P(A\cap B).
$$

进一步，对任意事件列 $(A_n)$，

$$
P\!\left(\bigcup_{n=1}^\infty A_n\right)
\le
\sum_{n=1}^\infty P(A_n).
$$

{{< details summary="证明：二元容斥与可数 union bound" >}}

把 $A\cup B$ 分成三个不交事件：

$$
A\cup B
=
(A\setminus B)\mathbin{\dot\cup}(A\cap B)\mathbin{\dot\cup}(B\setminus A).
$$

同时

$$
P(A)=P(A\setminus B)+P(A\cap B),
$$

$$
P(B)=P(B\setminus A)+P(A\cap B).
$$

代入并整理得到二元容斥。

对可数情形，令

$$
B_1=A_1,
\qquad
B_n=A_n\setminus\bigcup_{k=1}^{n-1}A_k\quad(n\ge2).
$$

则 $B_n$ 两两不交，$B_n\subseteq A_n$，且

$$
\bigcup_nB_n=\bigcup_nA_n.
$$

因此

$$
P\!\left(\bigcup_nA_n\right)
=\sum_nP(B_n)
\le\sum_nP(A_n).
$$

{{< /details >}}

---

## 3. 概率测度对单调极限连续

后面证明 CDF 的右连续性与几乎必然收敛推出依概率收敛，都要使用下面两条结果。

**定理（continuity from below）**：若

$$
A_1\subseteq A_2\subseteq\cdots,
\qquad
A=\bigcup_{n=1}^\infty A_n,
$$

则

$$
P(A_n)\uparrow P(A).
$$

{{< details summary="证明：从下连续性" >}}

令 $B_1=A_1$，并对 $n\ge2$ 令

$$
B_n=A_n\setminus A_{n-1}.
$$

则 $B_n$ 两两不交，且

$$
A_n=\bigcup_{k=1}^nB_k,
\qquad
A=\bigcup_{k=1}^\infty B_k.
$$

因此

$$
P(A_n)=\sum_{k=1}^nP(B_k)
\longrightarrow
\sum_{k=1}^\infty P(B_k)=P(A).
$$

{{< /details >}}

**定理（continuity from above）**：若

$$
A_1\supseteq A_2\supseteq\cdots,
\qquad
A=\bigcap_{n=1}^\infty A_n,
$$

则

$$
P(A_n)\downarrow P(A).
$$

{{< details summary="证明：从上连续性" >}}

补事件满足

$$
A_1^c\subseteq A_2^c\subseteq\cdots,
\qquad
\bigcup_nA_n^c=A^c.
$$

由从下连续性，$P(A_n^c)\to P(A^c)$。利用补事件公式，

$$
P(A_n)=1-P(A_n^c)
\longrightarrow
1-P(A^c)=P(A).
$$

概率测度有限，因此这里不需要额外的 $P(A_1)<\infty$ 假设；对一般测度，从上连续性需要这一有限性条件。

{{< /details >}}

---

## 4. 条件概率与乘法公式

**定义（条件概率）**：若 $B\in\mathcal F$ 且 $P(B)>0$，定义

$$
P(A\mid B)
=
\frac{P(A\cap B)}{P(B)}.
$$

固定 $B$ 后，映射

$$
P_B(A)=P(A\mid B)
$$

本身是 $(\Omega,\mathcal F)$ 上的概率测度：非负性直接成立，$P_B(\Omega)=1$，而不交事件的可数可加性由 $P$ 的可数可加性继承。

定义立即给出**乘法公式**：

$$
P(A\cap B)=P(B)P(A\mid B).
$$

对事件 $A_1,\ldots,A_n$，若每个条件事件

$$
P(A_1\cap\cdots\cap A_{k-1})>0,
$$

反复应用乘法公式得到链式分解

$$
P\!\left(\bigcap_{k=1}^nA_k\right)
=
P(A_1)
\prod_{k=2}^n
P\!\left(A_k\mid\bigcap_{j=1}^{k-1}A_j\right).
$$

---

## 5. 独立性

**定义（二事件独立）**：事件 $A,B$ 独立，记作 $A\perp B$，若

$$
P(A\cap B)=P(A)P(B).
$$

这个定义不要求 $P(A)$ 或 $P(B)$ 为正。若 $P(B)>0$，它等价于

$$
P(A\mid B)=P(A).
$$

**命题**：若 $A\perp B$，则 $A^c\perp B$、$A\perp B^c$、$A^c\perp B^c$。

{{< details summary="证明：独立性对取补封闭" >}}

由 $A\cap B$ 与 $A^c\cap B$ 不交且并为 $B$，

$$
\begin{aligned}
P(A^c\cap B)
&=P(B)-P(A\cap B)\\
&=P(B)-P(A)P(B)\\
&=(1-P(A))P(B)\\
&=P(A^c)P(B).
\end{aligned}
$$

所以 $A^c\perp B$。其余两式同理，或重复取补得到。

{{< /details >}}

**定义（事件族相互独立）**：事件族 $(A_i)_{i\in I}$ 相互独立，若对任意有限个互异下标 $i_1,\ldots,i_k$，

$$
P(A_{i_1}\cap\cdots\cap A_{i_k})
=
\prod_{j=1}^kP(A_{i_j}).
$$

这一定义要求所有有限子族的乘法分解，而不只要求每一对事件独立。

---

## 6. 全概率公式

**定义（可数划分）**：事件列 $(B_i)_{i\ge1}$ 若满足

$$
B_i\cap B_j=\emptyset\quad(i\ne j),
\qquad
\bigcup_{i=1}^\infty B_i=\Omega,
$$

则称它是 $\Omega$ 的可数可测划分。

**定理（全概率公式）**：若 $(B_i)$ 是可数可测划分，且对使用条件概率的各项有 $P(B_i)>0$，则对任意 $A\in\mathcal F$，

$$
P(A)=\sum_{i=1}^\infty P(A\mid B_i)P(B_i).
$$

零概率的 $B_i$ 可以直接删去；它们对总和没有贡献。

{{< details summary="证明：全概率公式" >}}

因为

$$
A=A\cap\Omega
=
A\cap\left(\bigcup_iB_i\right)
=
\bigcup_i(A\cap B_i),
$$

且 $A\cap B_i$ 两两不交，可数可加性给出

$$
P(A)=\sum_iP(A\cap B_i).
$$

再使用乘法公式

$$
P(A\cap B_i)=P(A\mid B_i)P(B_i)
$$

即可。

{{< /details >}}

---

## 7. Bayes 公式

**定理（Bayes 公式）**：设 $(B_i)$ 是可数可测划分，$P(B_i)>0$。若 $P(A)>0$，则

$$
P(B_j\mid A)
=
\frac{P(A\mid B_j)P(B_j)}
{\sum_{i=1}^\infty P(A\mid B_i)P(B_i)}.
$$

{{< details summary="证明：Bayes 公式" >}}

由条件概率和乘法公式，

$$
P(B_j\mid A)
=
\frac{P(A\cap B_j)}{P(A)}
=
\frac{P(A\mid B_j)P(B_j)}{P(A)}.
$$

再由全概率公式，

$$
P(A)=\sum_iP(A\mid B_i)P(B_i).
$$

代入分母即得结论。

{{< /details >}}

二事件形式是

$$
P(A\mid B)
=
\frac{P(B\mid A)P(A)}{P(B)},
\qquad P(B)>0.
$$

这里所有量都仍然是事件概率。到 Part 2，事件会通过随机变量被推送到数轴；到 Part 5，参数 $\theta$ 被赋予先验后，同一代数结构会变成 posterior $\propto$ likelihood $\times$ prior。

---

## 总结与下一站

本篇从两条概率公理推出了

$$
P(A^c)=1-P(A),
$$

$$
P\!\left(\bigcup_nA_n\right)
\le\sum_nP(A_n),
$$

以及概率测度对单调事件列的连续性。条件概率把 $P$ 限制并重新归一化到 $B$ 上：

$$
P(A\mid B)=\frac{P(A\cap B)}{P(B)}.
$$

由此得到独立性、全概率和 Bayes 的完整链条。

[返回：概率论路线图](/notes/math/probability/note-prob-0-roadmap/)

[继续阅读：概率论 Part 2——随机变量、CDF 与常见分布族](/notes/math/probability/note-prob-2-random-variables-distributions/)
