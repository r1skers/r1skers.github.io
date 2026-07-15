---
date: '2026-07-15T11:00:00+09:00'
draft: false
title: '线性代数 Part 1：向量空间、基、秩与四基本子空间'
summary: "从子空间、张成与线性无关开始，建立有限维向量空间的基与维数，再以线性映射的核和像证明秩—零度定理，最后把矩阵的四基本子空间放进同一张代数结构图。"
description: "有限维线性代数基础：向量空间、子空间、张成、线性无关、基、维数、线性映射、核、像、秩—零度定理、行秩等于列秩，以及矩阵四基本子空间的定义与维数。"
tags: ["Linear Algebra", "Vector Space", "Basis", "Dimension", "Linear Map", "Rank-Nullity", "Fundamental Subspaces", "Proof"]
categories: ["Crucible"]
math: true
---

# 线性代数 Part 1：向量空间、基、秩与四基本子空间

Part 0 把矩阵放回了它应在的位置：矩阵是线性映射在选定基下的坐标表示。本篇先暂时拿掉坐标，只研究映射本身能够保留多少方向、消去多少方向。

整条链是：

$$
\text{子空间}
\longrightarrow
\text{张成与线性无关}
\longrightarrow
\text{基与维数}
\longrightarrow
\ker T\text{ 与 }\operatorname{im}T
\longrightarrow
\text{秩—零度}
\longrightarrow
\text{四基本子空间}.
$$

全文约定：

- 标量域为 $\mathbb F\in\{\mathbb R,\mathbb C\}$；
- 所有向量空间均为 $\mathbb F$ 上的有限维向量空间；
- $A^*$ 表示共轭转置；在实数域上就是 $A^\top$；
- 本篇只建立四基本子空间的代数结构，它们之间的正交关系留到 Part 2，在定义内积之后证明。

---

## 1. 向量空间与子空间

### 1.1 向量空间

一个 $\mathbb F$-向量空间 $V$ 是一个集合，配有向量加法与标量乘法，使得加法满足交换律、结合律并存在零元与加法逆元，同时数乘满足

$$
a(x+y)=ax+ay,
$$

$$
(a+b)x=ax+bx,
$$

$$
(ab)x=a(bx),
$$

$$
1x=x.
$$

这些公理的作用只有一个：保证有限线性组合

$$
a_1v_1+\cdots+a_kv_k
$$

仍然属于同一空间，并且可以按通常的代数规则运算。

### 1.2 子空间判别

子集 $W\subseteq V$ 称为 $V$ 的线性子空间，如果 $W$ 在继承自 $V$ 的加法和数乘下本身也是向量空间。

**子空间判别定理**：非空子集 $W\subseteq V$ 是子空间，当且仅当

$$
\forall x,y\in W,\ \forall a,b\in\mathbb F,\qquad ax+by\in W.
$$

**证明**：

若 $W$ 是子空间，它对加法与数乘封闭，所以任意 $ax+by$ 都在 $W$ 中。

反过来，设上述条件成立。因为 $W$ 非空，取 $w\in W$，令 $a=b=0$ 得 $0\in W$；令 $a=-1,b=0$ 得 $-w\in W$；分别取适当的 $a,b$ 又得到加法与数乘封闭。其余向量空间公理由 $V$ 继承，因此 $W$ 是子空间。证毕。

这个判别把许多证明压缩成一句话：只要检验任意两个元素的任意线性组合仍留在集合中，就完成了子空间判定。

---

## 2. 张成、线性无关与基

### 2.1 张成

给定向量组 $S=\{v_1,\ldots,v_k\}\subseteq V$，它的张成空间定义为

$$
\operatorname{span}S
=
\left\{
\sum_{i=1}^k a_iv_i:a_i\in\mathbb F
\right\}.
$$

**命题**：$\operatorname{span}S$ 是包含 $S$ 的最小子空间。

**证明**：

$\operatorname{span}S$ 对线性组合封闭，因此是子空间，并且显然包含每个 $v_i$。若子空间 $W$ 包含 $S$，那么 $W$ 对线性组合封闭，所以包含 $S$ 的每个线性组合；于是

$$
\operatorname{span}S\subseteq W.
$$

因此它是包含 $S$ 的最小子空间。证毕。

张成回答的是覆盖问题：给定的方向能够生成多大的空间。

### 2.2 线性无关

向量组 $v_1,\ldots,v_k$ 称为线性无关，如果

$$
a_1v_1+\cdots+a_kv_k=0
$$

只能推出

$$
a_1=\cdots=a_k=0.
$$

否则称为线性相关。

**线性相关判别**：$v_1,\ldots,v_k$ 线性相关，当且仅当其中某个向量可以由其余向量线性表示。

**证明**：

若向量组相关，则存在不全为零的系数满足

$$
\sum_{i=1}^k a_iv_i=0.
$$

取一个 $a_j\ne0$，移项得到

$$
v_j=-\sum_{i\ne j}\frac{a_i}{a_j}v_i.
$$

反过来，若某个 $v_j$ 是其余向量的线性组合，移到同一边便得到一个系数不全为零的零线性组合，所以向量组相关。证毕。

因此，线性无关回答的是冗余问题：是否存在一个方向已经被其余方向表达。

### 2.3 基与坐标唯一性

向量组 $\mathcal B=(v_1,\ldots,v_n)$ 称为 $V$ 的一组基，如果它同时满足：

$$
\operatorname{span}\{v_1,\ldots,v_n\}=V,
$$

并且 $v_1,\ldots,v_n$ 线性无关。

**定理**：$\mathcal B$ 是 $V$ 的基，当且仅当每个 $x\in V$ 都存在唯一的一组标量 $a_1,\ldots,a_n$，使得

$$
x=\sum_{i=1}^n a_iv_i.
$$

**证明**：

若 $\mathcal B$ 是基，张成性给出表示的存在性。若

$$
x=\sum_i a_iv_i=\sum_i b_iv_i,
$$

则

$$
\sum_i(a_i-b_i)v_i=0.
$$

由线性无关性，$a_i-b_i=0$，所以表示唯一。

反过来，若每个向量都有唯一表示，存在性说明 $\mathcal B$ 张成 $V$。对零向量的表示若满足

$$
0=\sum_i a_iv_i,
$$

唯一性迫使它等于全零表示，因此所有 $a_i=0$，所以 $\mathcal B$ 线性无关。证毕。

基的两项条件不能拆开理解：张成保证没有遗漏方向，线性无关保证没有重复方向；两者共同保证坐标存在且唯一。

---

## 3. 维数与基的交换原理

有限维空间的维数定义为任意一组基所含向量的个数。这个定义成立，依赖于不同基必有相同长度。

### 3.1 Steinitz 交换引理

**交换引理**：若 $v_1,\ldots,v_m$ 线性无关，而 $w_1,\ldots,w_n$ 张成 $V$，则

$$
m\le n.
$$

并且可以用 $v_1,\ldots,v_m$ 逐个替换张成组中的 $m$ 个向量，仍得到一组生成 $V$ 的向量。

**证明**：

因为 $w_1,\ldots,w_n$ 张成 $V$，可将 $v_1$ 写成它们的线性组合。至少有一个系数非零；重新编号后设 $w_1$ 的系数非零，就能反解出 $w_1$，所以

$$
v_1,w_2,\ldots,w_n
$$

仍张成 $V$。

接着把 $v_2$ 写成这组向量的线性组合。若 $w_2,\ldots,w_n$ 的系数全为零，则 $v_2$ 是 $v_1$ 的倍数，与 $v_1,v_2$ 线性无关矛盾。因此至少有一个尚未替换的 $w_j$ 的系数非零，可以用 $v_2$ 替换它。

重复这个过程。在放入 $v_k$ 时，线性无关性保证仍有一个未替换的 $w_j$ 可以被解出。因此至少需要 $m$ 个 $w_j$，即 $m\le n$；完成 $m$ 次替换后，所得向量组仍张成 $V$。证毕。

### 3.2 维数良定义

**推论**：有限维空间的任意两组基含有相同数目的向量。

**证明**：

设两组基分别含 $m$ 与 $n$ 个向量。第一组线性无关、第二组张成，交换引理给出 $m\le n$；交换两组角色又得 $n\le m$。所以 $m=n$。证毕。

这个共同的整数记为

$$
\dim V.
$$

### 3.3 基的删减与扩充

交换引理还给出两个有限维结论：

1. 每个有限生成组都能删去冗余向量，得到一组基；
2. 每个线性无关组都能加入若干向量，扩充成一组基。

第一条通过不断删除可由其余向量表示的成员得到；第二条从任意有限生成组开始，用交换引理将给定线性无关组逐个换进去。

因此，对子空间 $W\subseteq V$ 有

$$
\dim W\le\dim V,
$$

并且等号成立当且仅当 $W=V$。

---

## 4. 线性映射、核与像

设 $T:V\to W$。如果对所有 $x,y\in V$ 与 $a,b\in\mathbb F$ 都有

$$
T(ax+by)=aT(x)+bT(y),
$$

则称 $T$ 为线性映射。

它的两个基本子空间是：

$$
\ker T=\{x\in V:T(x)=0\},
$$

$$
\operatorname{im}T=\{T(x):x\in V\}.
$$

**命题**：$\ker T$ 是 $V$ 的子空间，$\operatorname{im}T$ 是 $W$ 的子空间。

**证明**：

若 $x,y\in\ker T$，则

$$
T(ax+by)=aT(x)+bT(y)=0,
$$

所以核对线性组合封闭。若 $u=T(x)$、$v=T(y)$ 属于像，则

$$
au+bv=T(ax+by)
$$

仍属于像。由子空间判别定理即得结论。证毕。

定义

$$
\operatorname{nullity}T=\dim\ker T,
$$

$$
\operatorname{rank}T=\dim\operatorname{im}T.
$$

核记录被映射完全消去的输入方向；像记录映射真正能够到达的输出方向。

---

## 5. 秩—零度定理

**定理**：若 $T:V\to W$ 为线性映射，且 $V$ 有限维，则

$$
\dim V
=
\dim\ker T+\dim\operatorname{im}T.
$$

也就是

$$
\dim V=\operatorname{nullity}T+\operatorname{rank}T.
$$

**证明**：

取 $\ker T$ 的一组基

$$
z_1,\ldots,z_k.
$$

把它扩充成 $V$ 的一组基：

$$
z_1,\ldots,z_k,v_1,\ldots,v_r.
$$

我们证明

$$
T(v_1),\ldots,T(v_r)
$$

是 $\operatorname{im}T$ 的一组基。

先证张成。任意 $y\in\operatorname{im}T$ 可写成 $y=T(x)$。将 $x$ 按上述基展开：

$$
x=\sum_{i=1}^k a_iz_i+\sum_{j=1}^r b_jv_j.
$$

由于 $T(z_i)=0$，

$$
y=T(x)=\sum_{j=1}^r b_jT(v_j).
$$

再证线性无关。若

$$
\sum_{j=1}^r b_jT(v_j)=0,
$$

则

$$
T\left(\sum_{j=1}^r b_jv_j\right)=0,
$$

所以 $\sum_jb_jv_j\in\ker T$，可写成 $\sum_i a_iz_i$。于是

$$
\sum_{j=1}^r b_jv_j-\sum_{i=1}^k a_iz_i=0.
$$

整组 $z_1,\ldots,z_k,v_1,\ldots,v_r$ 是基，故所有系数为零，特别是 $b_j=0$。所以 $T(v_j)$ 线性无关。

因此

$$
\dim\operatorname{im}T=r,\qquad
\dim\ker T=k,\qquad
\dim V=k+r.
$$

证毕。

这一定理把“保留下来的方向”和“丢失的方向”精确地守恒起来：输入维数不会凭空消失，它只是在像与核之间重新分配。

---

## 6. 从线性映射回到矩阵

设

$$
A\in\mathbb F^{m\times n},
$$

把它视为线性映射

$$
A:\mathbb F^n\to\mathbb F^m,\qquad x\mapsto Ax.
$$

若把列向量写成

$$
A=(a_1,\ldots,a_n),
$$

则

$$
Ax=x_1a_1+\cdots+x_na_n.
$$

因此矩阵的列空间就是映射的像：

$$
\mathcal C(A)
=
\operatorname{im}A
=
\operatorname{span}\{a_1,\ldots,a_n\}.
$$

矩阵的零空间就是映射的核：

$$
\mathcal N(A)=\ker A=\{x\in\mathbb F^n:Ax=0\}.
$$

矩阵的秩定义为

$$
\operatorname{rank}A=\dim\mathcal C(A).
$$

由秩—零度定理立即得到

$$
\dim\mathcal N(A)=n-\operatorname{rank}A.
$$

### 行秩等于列秩

把 $A$ 经过初等行变换化为行最简阶梯形矩阵 $R$。存在可逆矩阵 $E$ 使

$$
R=EA.
$$

左乘可逆矩阵不改变列向量之间的线性关系：

$$
\sum_jc_j(Ea_j)=0
\Longleftrightarrow
E\left(\sum_jc_ja_j\right)=0
\Longleftrightarrow
\sum_jc_ja_j=0.
$$

所以 $A$ 与 $R$ 的列秩相同。初等行变换又不改变行空间，因此 $A$ 与 $R$ 的行秩相同。

在 $R$ 中，每个非零行都有一个不同的主元，所以非零行数等于主元数；主元列线性无关，而每个非主元列由主元列线性表示，所以主元数也等于列秩。因此 $R$ 的行秩等于列秩，进而

$$
\dim\mathcal C(A^*)=\dim\mathcal C(A)=\operatorname{rank}A.
$$

这里 $\mathcal C(A^*)$ 是把 $A$ 的行取共轭转置后看成列向量所张成的空间，也称为 $A$ 的行空间。

---

## 7. 四基本子空间

对 $A\in\mathbb F^{m\times n}$，四个基本子空间是：

$$
\mathcal C(A)\subseteq\mathbb F^m,
$$

$$
\mathcal N(A)\subseteq\mathbb F^n,
$$

$$
\mathcal C(A^*)\subseteq\mathbb F^n,
$$

$$
\mathcal N(A^*)\subseteq\mathbb F^m.
$$

若 $r=\operatorname{rank}A$，由行秩等于列秩和两次秩—零度定理，得到完整的维数表：

| 所在空间 | 子空间 | 维数 |
|---|---|---:|
| 输出空间 $\mathbb F^m$ | 列空间 $\mathcal C(A)$ | $r$ |
| 输出空间 $\mathbb F^m$ | 左零空间 $\mathcal N(A^*)$ | $m-r$ |
| 输入空间 $\mathbb F^n$ | 行空间 $\mathcal C(A^*)$ | $r$ |
| 输入空间 $\mathbb F^n$ | 零空间 $\mathcal N(A)$ | $n-r$ |

这张表已经给出两个代数事实：

$$
\dim\mathcal C(A)+\dim\mathcal N(A^*)=m,
$$

$$
\dim\mathcal C(A^*)+\dim\mathcal N(A)=n.
$$

但“维数相加恰好填满空间”还不足以推出它们构成直和，更没有说明它们为什么正交。下一篇加入内积后会证明更强的结论：

$$
\mathbb F^m
=
\mathcal C(A)\oplus\mathcal N(A^*),
$$

$$
\mathbb F^n
=
\mathcal C(A^*)\oplus\mathcal N(A),
$$

并且两处都是正交直和。

---

## 总结与下一站

本篇建立了有限维线性代数的代数骨架：

$$
\text{基}
\Longleftrightarrow
\text{每个向量有唯一坐标},
$$

$$
\dim V
=
\dim\ker T+\dim\operatorname{im}T,
$$

以及对 $A\in\mathbb F^{m\times n}$，

$$
\dim\mathcal C(A)=\dim\mathcal C(A^*)=r,
$$

$$
\dim\mathcal N(A)=n-r,\qquad
\dim\mathcal N(A^*)=m-r.
$$

Part 2 将在这些子空间上加入内积，证明 Cauchy–Schwarz、Gram–Schmidt、有限维投影定理、四基本子空间的正交分解，以及正规方程为何正是最小二乘的投影条件。

[返回：线性代数 Part 0——矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)

[继续阅读：线性代数 Part 2——内积、正交投影与最小二乘](/notes/math/linear-algebra/note-la-2-inner-product-projection/)
