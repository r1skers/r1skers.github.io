---
date: '2026-07-15T11:30:00+09:00'
draft: false
title: 'Shannon 支线 S1：AEP、典型集与熵的渐近意义'
summary: "把长 i.i.d. 序列的每符号信息量写成样本均值，用大数定律证明 AEP，再证明典型集的概率质量、逐点概率界与基数界。"
description: "信息论基础笔记：有限离散 i.i.d. 信源的块熵、弱渐近等分性 AEP、弱典型集、典型序列概率界、典型集基数上下界，以及熵作为渐近描述速率的计数基础。"
tags: ["Information Theory", "AEP", "Typical Set", "Entropy", "Law of Large Numbers", "Source Coding", "Proof"]
categories: ["Crucible"]
---

# Shannon 支线 S1：AEP、典型集与熵的渐近意义

> 这是共同基础之后的 Shannon / Source Coding 支线。本篇把同一随机源独立重复 $n$ 次，研究真实抽到的长序列每个符号究竟携带多少信息。乘积概率在负对数下变成样本均值，因此大数定律会把它推向 $H(X)$；本系列暂止于典型集及其最直接的确定性定长计数推论，不继续展开完整信源编码理论或信道模型。

逻辑依赖上，[Part 1](/notes/math/information-theory/note-it-1-entropy-self-information/) 提供自信息与熵，[Part 2](/notes/math/information-theory/note-it-2-joint-conditional-entropy/) 的多变量链式法则用于证明块熵可加性。AEP 本身则直接来自单符号自信息的大数定律，不依赖 Part 3 的 KL 或互信息。

本篇的链条是：

$$
\begin{aligned}
p(x^n)=\prod_{i=1}^np(x_i)
&\longrightarrow
-\frac1n\log p(X^n)
=\frac1n\sum_{i=1}^n[-\log p(X_i)]\\
&\longrightarrow \mathrm{AEP}
\longrightarrow A_\epsilon^{(n)}\\
&\longrightarrow
H(X)-\epsilon+o(1)
\le\frac1n\log|A_\epsilon^{(n)}|
\le H(X)+\epsilon.
\end{aligned}
$$

最后一行是在固定 $\epsilon>0$ 后关于 $n$ 的指数率窗口；只有先令 $n\to\infty$、再令 $\epsilon\downarrow0$，窗口才收缩到 $H(X)$。

本篇始终假设

$$
X_1,X_2,\ldots\overset{\mathrm{i.i.d.}}{\sim}p
$$

取值于有限字母表 $\mathcal X$。记有效支持集为

$$
S=\{x\in\mathcal X:p(x)>0\},
$$

并约定 $\log=\log_2$。

---

## 1. 序列概率与每符号信息量

记

$$
X^n=(X_1,\ldots,X_n),
\qquad
x^n=(x_1,\ldots,x_n).
$$

由独立同分布假设，长度为 $n$ 的乘积分布为

$$
p^{\otimes n}(x^n)
=P(X^n=x^n)
=\prod_{i=1}^np(x_i),
\qquad x^n\in S^n.
$$

序列 $x^n$ 的总信息量为

$$
\imath_{X^n}(x^n)
=-\log p^{\otimes n}(x^n).
$$

定义每符号信息量

$$
\bar\imath_n(x^n)
=-\frac1n\log p^{\otimes n}(x^n).
$$

利用乘积结构，

$$
\begin{aligned}
\bar\imath_n(X^n)
&=-\frac1n\log\prod_{i=1}^np(X_i)\\
&=\frac1n\sum_{i=1}^n[-\log p(X_i)].
\end{aligned}
$$

右侧正是单符号自信息的样本平均。

---

## 2. i.i.d. 块熵的可加性

**命题**：

$$
H(X^n)=nH(X).
$$

{{< details summary="证明：i.i.d. 块熵的可加性" >}}

由 Part 2 的多变量链式法则，

$$
H(X^n)
=\sum_{i=1}^nH(X_i\mid X_1,\ldots,X_{i-1}).
$$

由于 $X_i$ 与 $(X_1,\ldots,X_{i-1})$ 独立，条件化不改变其分布，因此

$$
H(X_i\mid X_1,\ldots,X_{i-1})=H(X_i).
$$

又因为各 $X_i$ 同分布，

$$
H(X_i)=H(X).
$$

故

$$
H(X^n)=\sum_{i=1}^nH(X)=nH(X).
$$

证毕。

{{< /details >}}

块熵的可加性是一个期望等式。AEP 给出更强的概率结论：不仅平均值等于 $nH(X)$，真实抽到的长序列，其每符号信息量也会以高概率靠近 $H(X)$。

---

## 3. AEP：每符号信息量收敛到熵

**定理（弱渐近等分性，weak AEP）**：对任意 $\epsilon>0$，

$$
P\!\left(
\left|
-\frac1n\log p^{\otimes n}(X^n)-H(X)
\right|>\epsilon
\right)
\longrightarrow0.
$$

等价地，

$$
-\frac1n\log p^{\otimes n}(X^n)
\xrightarrow{P}
H(X).
$$

{{< details summary="证明：有限离散 i.i.d. 信源的弱 AEP" >}}

令

$$
Z_i=-\log p(X_i).
$$

因为有效支持集 $S$ 有限，

$$
p_{\min}=\min_{x\in S}p(x)>0.
$$

所以

$$
0\le Z_i\le-\log p_{\min},
$$

$Z_i$ 是具有有限方差的 i.i.d. 随机变量。它的期望为

$$
\mathbb E[Z_i]
=-\sum_{x\in S}p(x)\log p(x)
=H(X).
$$

另一方面，

$$
-\frac1n\log p^{\otimes n}(X^n)
=\frac1n\sum_{i=1}^nZ_i.
$$

由独立性，样本平均的方差为

$$
\operatorname{Var}\!\left(\frac1n\sum_{i=1}^nZ_i\right)
=\frac{\operatorname{Var}(Z_1)}n.
$$

由 Chebyshev 不等式，

$$
\begin{aligned}
&P\!\left(
\left|
\frac1n\sum_{i=1}^nZ_i-H(X)
\right|>\epsilon
\right)\\
&\qquad\le
\frac{\operatorname{Var}(Z_1)}{n\epsilon^2}
\longrightarrow0.
\end{aligned}
$$

因此

$$
-\frac1n\log p^{\otimes n}(X^n)
\xrightarrow{P}
H(X).
$$

证毕。

{{< /details >}}

证明只使用了有限支持、独立同分布和大数定律的 Chebyshev 版本。更一般的平稳遍历信源需要相应的遍历定理，不属于本组笔记的范围。

---

## 4. 弱典型集

AEP 是随机变量的收敛陈述。把“每符号信息量靠近熵”的序列收集起来，就得到典型集。

**定义（弱 $\epsilon$-典型集）**：给定 $\epsilon>0$，

$$
A_\epsilon^{(n)}
=\left\{
x^n\in S^n:
\left|
-\frac1n\log p^{\otimes n}(x^n)-H(X)
\right|
\le\epsilon
\right\}.
$$

把集合限制在 $S^n$ 中，是为了排除概率为零、信息量为 $+\infty$ 的序列。

由 AEP 立即得到：

$$
P\!\left(X^n\in A_\epsilon^{(n)}\right)
\longrightarrow1.
$$

因此，对任意 $\delta\in(0,1)$，存在 $N(\epsilon,\delta)$，使得所有 $n\ge N(\epsilon,\delta)$ 都满足

$$
P\!\left(X^n\in A_\epsilon^{(n)}\right)
\ge1-\delta.
$$

---

## 5. 典型序列的逐点概率界

**命题**：若 $x^n\in A_\epsilon^{(n)}$，则

$$
2^{-n(H(X)+\epsilon)}
\le
p^{\otimes n}(x^n)
\le
2^{-n(H(X)-\epsilon)}.
$$

{{< details summary="证明：典型序列的逐点概率界" >}}

由典型集定义，

$$
H(X)-\epsilon
\le
-\frac1n\log p^{\otimes n}(x^n)
\le
H(X)+\epsilon.
$$

两边乘以 $-n$ 时不等号反向：

$$
-n(H(X)+\epsilon)
\le
\log p^{\otimes n}(x^n)
\le
-n(H(X)-\epsilon).
$$

以 $2$ 为底取指数即得

$$
2^{-n(H(X)+\epsilon)}
\le
p^{\otimes n}(x^n)
\le
2^{-n(H(X)-\epsilon)}.
$$

证毕。

{{< /details >}}

这个界没有声称所有长度为 $n$ 的序列等概率。它只说明：承载绝大部分概率质量的典型序列，在指数尺度上具有相同的主导量级 $2^{-nH(X)}$。

---

## 6. 典型集的基数界

**定理**：对任意 $\epsilon>0$，

$$
|A_\epsilon^{(n)}|
\le
2^{n(H(X)+\epsilon)}.
$$

并且对任意 $\delta\in(0,1)$，当 $n$ 充分大时，

$$
|A_\epsilon^{(n)}|
\ge
(1-\delta)2^{n(H(X)-\epsilon)}.
$$

{{< details summary="证明：典型集的基数上下界" >}}

对每个典型序列，有概率下界

$$
p^{\otimes n}(x^n)
\ge2^{-n(H(X)+\epsilon)}.
$$

所以

$$
\begin{aligned}
1
&\ge P(X^n\in A_\epsilon^{(n)})\\
&=\sum_{x^n\in A_\epsilon^{(n)}}p^{\otimes n}(x^n)\\
&\ge|A_\epsilon^{(n)}|2^{-n(H(X)+\epsilon)}.
\end{aligned}
$$

移项得到

$$
|A_\epsilon^{(n)}|
\le2^{n(H(X)+\epsilon)}.
$$

另一方面，当 $n$ 充分大时，AEP 保证

$$
P(X^n\in A_\epsilon^{(n)})\ge1-\delta.
$$

对每个典型序列，又有概率上界

$$
p^{\otimes n}(x^n)
\le2^{-n(H(X)-\epsilon)}.
$$

因此

$$
\begin{aligned}
1-\delta
&\le P(X^n\in A_\epsilon^{(n)})\\
&=\sum_{x^n\in A_\epsilon^{(n)}}p^{\otimes n}(x^n)\\
&\le|A_\epsilon^{(n)}|2^{-n(H(X)-\epsilon)}.
\end{aligned}
$$

移项得到

$$
|A_\epsilon^{(n)}|
\ge(1-\delta)2^{n(H(X)-\epsilon)}.
$$

证毕。

{{< /details >}}

取对数并除以 $n$，可把基数界写成

$$
H(X)-\epsilon+\frac1n\log(1-\delta)
\le
\frac1n\log|A_\epsilon^{(n)}|
\le
H(X)+\epsilon.
$$

固定 $\epsilon>0$ 与 $\delta\in(0,1)$，下界对充分大的 $n$ 成立。先令 $n\to\infty$，得到

$$
H(X)-\epsilon
\le
\liminf_{n\to\infty}\frac1n\log|A_\epsilon^{(n)}|
\le
\limsup_{n\to\infty}\frac1n\log|A_\epsilon^{(n)}|
\le
H(X)+\epsilon.
$$

再令 $\epsilon\downarrow0$，由夹逼得到严格的双重极限表述：

$$
\begin{aligned}
\lim_{\epsilon\downarrow0}
\left[
\liminf_{n\to\infty}
\frac1n\log|A_\epsilon^{(n)}|
\right]
&=H(X),\\
\lim_{\epsilon\downarrow0}
\left[
\limsup_{n\to\infty}
\frac1n\log|A_\epsilon^{(n)}|
\right]
&=H(X).
\end{aligned}
$$

这里的顺序是先对每个固定 $\epsilon$ 令 $n\to\infty$，再令 $\epsilon\downarrow0$。它既不声称固定 $\epsilon$ 时极限一定存在或恰好等于 $H(X)$，也不自动覆盖任意随 $n$ 变化的 $\epsilon_n\downarrow0$。这就是“典型集的指数增长率由熵控制”的精确限定。

---

## 7. 熵作为渐近描述速率的计数基础

AEP 与典型集共同给出两条纯计数结论：

1. 存在一个概率趋于 $1$ 的集合 $A_\epsilon^{(n)}$，其元素个数不超过 $2^{n(H(X)+\epsilon)}$；
2. 任何指数增长率严格低于 $H(X)$ 的集合，其信源概率不只是无法趋于 $1$，而是必然趋于 $0$。

**定理（低于熵率的集合强消失）**：若集合序列 $B_n\subseteq S^n$ 满足（约定 $\log0=-\infty$）

$$
\limsup_{n\to\infty}
\frac1n\log|B_n|
\lt H(X),
$$

则

$$
P(X^n\in B_n)\longrightarrow0.
$$

{{< details summary="证明：低于熵率的集合强消失" >}}

在上面的严格不等式之间选择常数 $R$，使得

$$
\limsup_{n\to\infty}
\frac1n\log|B_n|
\lt R\lt H(X).
$$

于是当 $n$ 充分大时，

$$
|B_n|\le2^{nR}.
$$

再选择

$$
0\lt\epsilon\lt H(X)-R.
$$

把 $B_n$ 分成典型与非典型两部分：

$$
\begin{aligned}
P(X^n\in B_n)
&\le P(X^n\notin A_\epsilon^{(n)})\\
&\quad
+P(X^n\in B_n\cap A_\epsilon^{(n)}).
\end{aligned}
$$

典型序列的单点概率至多是 $2^{-n(H(X)-\epsilon)}$，因此

$$
P(X^n\in B_n\cap A_\epsilon^{(n)})
\le2^{nR}2^{-n(H(X)-\epsilon)}.
$$

由 $\epsilon$ 的选择，$R\lt H(X)-\epsilon$，所以右侧指数项趋于零；AEP 又保证非典型部分的概率趋于零。因此

$$
P(X^n\in B_n)\longrightarrow0.
$$

证毕。

{{< /details >}}

这比“低速率集合不能覆盖接近全部的概率质量”更强：其覆盖概率实际趋于零。另一方面，典型集给出了速率不超过 $H(X)+\epsilon$ 的高概率覆盖。

要把该结论翻译成编码 converse，必须先限定编码模型。考虑一个**确定性的定长无损块码**：

$$
f_n:S^n\to\{1,\ldots,M_n\},
\qquad
g_n:\{1,\ldots,M_n\}\to S^n.
$$

定义能够被正确恢复的序列集合

$$
B_n
=\{x^n\in S^n:g_n(f_n(x^n))=x^n\}.
$$

每个索引经确定性解码器只能输出一个序列，因此每个索引至多对应一个被正确恢复的输入，从而

$$
|B_n|\le M_n.
$$

若码本速率满足

$$
\limsup_{n\to\infty}\frac1n\log M_n\lt H(X),
$$

则上面的定理给出

$$
P_{\mathrm{correct}}^{(n)}
=P(X^n\in B_n)\longrightarrow0,
$$

等价地，块错误概率满足

$$
P_{\mathrm e}^{(n)}\longrightarrow1.
$$

这是确定性定长块码与块错误准则下的 strong-converse 计数结论。变长码、随机编码器或其他错误准则需要分别定义和证明；本组笔记不继续进入这些结构。

---

## 总结

对有限离散 i.i.d. 信源，

$$
-\frac1n\log p^{\otimes n}(X^n)
\xrightarrow{P}
H(X).
$$

由此定义的典型集满足

$$
P(X^n\in A_\epsilon^{(n)})\to1,
$$

$$
2^{-n(H(X)+\epsilon)}
\le p^{\otimes n}(x^n)
\le2^{-n(H(X)-\epsilon)},
$$

以及对充分大的 $n$，

$$
(1-\delta)2^{n(H(X)-\epsilon)}
\le|A_\epsilon^{(n)}|
\le2^{n(H(X)+\epsilon)}.
$$

因此，熵不再只是单次结果自信息的期望；它同时控制了高概率长序列集合的指数规模。这正是 AEP 与典型集赋予 $H(X)$ 的渐近意义。

[返回：信息论与信息几何路线图](/notes/math/information-theory/note-it-0-roadmap/)

[返回共同基础 Part 3：交叉熵、KL 散度与互信息](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)
