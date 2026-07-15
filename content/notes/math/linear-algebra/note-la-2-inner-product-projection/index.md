---
date: '2026-07-15T11:10:00+09:00'
draft: false
title: '线性代数 Part 2：内积、正交投影与最小二乘'
summary: "在有限维实或复向量空间上加入内积，从 Cauchy–Schwarz 推出范数与正交几何，经 Gram–Schmidt 构造正交基，证明投影定理、四基本子空间的正交分解与最小二乘正规方程。"
description: "有限维内积空间笔记：内积、范数、Cauchy–Schwarz、正交、Gram–Schmidt、正交补、投影定理、投影矩阵、四基本子空间正交分解、正规方程与最小二乘。"
tags: ["Linear Algebra", "Inner Product", "Cauchy-Schwarz", "Orthogonality", "Gram-Schmidt", "Projection", "Least Squares", "Normal Equations", "Proof"]
categories: ["Crucible"]
math: true
---

# 线性代数 Part 2：内积、正交投影与最小二乘

Part 1 只使用加法和数乘，因此能够讨论子空间、基、核、像与维数，却还不能说两个方向是否垂直，也不能说子空间里哪个向量离目标最近。

本篇加入一项结构：内积。随后整条几何链都会被严格推出：

$$
\text{内积}
\longrightarrow
\text{Cauchy--Schwarz}
\longrightarrow
\text{范数}
\longrightarrow
\text{正交与 Gram--Schmidt}
\longrightarrow
\text{投影定理}
\longrightarrow
\text{最小二乘}.
$$

全文约定：

- 标量域为 $\mathbb F\in\{\mathbb R,\mathbb C\}$；
- 所有空间均为有限维 $\mathbb F$-向量空间；
- 复内积采用**第一变量线性、第二变量共轭线性**的约定；
- 在 $\mathbb F^n$ 上使用标准内积

$$
\langle x,y\rangle=y^*x;
$$

- $A^*$ 表示共轭转置，实数情形退化为 $A^\top$。

有限维假设很重要：本篇的子空间自动闭，投影存在性不需要额外的完备性论证。无穷维 Hilbert 空间中的对应结论需要“闭子空间”与完备性条件。

---

## 1. 内积与它诱导的范数

### 1.1 内积

设 $V$ 是 $\mathbb F$-向量空间。映射

$$
\langle\cdot,\cdot\rangle:V\times V\to\mathbb F
$$

称为内积，如果对所有 $x,y,z\in V$ 与 $a,b\in\mathbb F$ 满足：

1. 第一变量线性：

$$
\langle ax+by,z\rangle
=a\langle x,z\rangle+b\langle y,z\rangle;
$$

2. 共轭对称：

$$
\langle x,y\rangle=\overline{\langle y,x\rangle};
$$

3. 正定：

$$
\langle x,x\rangle\ge0,
\qquad
\langle x,x\rangle=0\Longleftrightarrow x=0.
$$

共轭对称性与第一变量线性共同推出第二变量共轭线性：

$$
\langle x,ay+bz\rangle
=
\overline a\,\langle x,y\rangle
+
\overline b\,\langle x,z\rangle.
$$

在实数域上，共轭消失，内积就是对称双线性形式。

由内积定义长度：

$$
\|x\|=\sqrt{\langle x,x\rangle}.
$$

正定性立刻给出范数的非负性与可分性，齐次性也直接成立：

$$
\|ax\|^2
=
\langle ax,ax\rangle
=
|a|^2\langle x,x\rangle.
$$

但三角不等式尚未得到，它需要 Cauchy–Schwarz 不等式。

---

## 2. Cauchy–Schwarz 不等式

**定理**：对任意 $x,y\in V$，

$$
|\langle x,y\rangle|
\le
\|x\|\,\|y\|.
$$

等号成立当且仅当 $x,y$ 线性相关。

**证明**：

若 $y=0$，结论显然成立。设 $y\ne0$，令

$$
\alpha
=
\frac{\langle x,y\rangle}{\langle y,y\rangle},
\qquad
r=x-\alpha y.
$$

由第一变量线性，

$$
\langle r,y\rangle
=
\langle x,y\rangle-\alpha\langle y,y\rangle
=0.
$$

所以 $r\perp y$。将 $x=\alpha y+r$ 代入长度平方：

$$
\|x\|^2
=
\|\alpha y+r\|^2
=
|\alpha|^2\|y\|^2+\|r\|^2
\ge
|\alpha|^2\|y\|^2.
$$

而

$$
|\alpha|^2\|y\|^2
=
\frac{|\langle x,y\rangle|^2}{\|y\|^2}.
$$

两边乘以 $\|y\|^2$ 后开平方，得到

$$
|\langle x,y\rangle|
\le
\|x\|\,\|y\|.
$$

等号成立当且仅当 $\|r\|=0$，也就是 $x=\alpha y$。加上 $y=0$ 的情形，恰好等价于 $x,y$ 线性相关。证毕。

### 三角不等式

由 Cauchy–Schwarz，

$$
\begin{aligned}
\|x+y\|^2
&=
\|x\|^2+\|y\|^2
+2\operatorname{Re}\langle x,y\rangle\\
&\le
\|x\|^2+\|y\|^2+2|\langle x,y\rangle|\\
&\le
(\|x\|+\|y\|)^2.
\end{aligned}
$$

因此

$$
\|x+y\|\le\|x\|+\|y\|.
$$

所以内积确实诱导一个范数，进而诱导距离

$$
d(x,y)=\|x-y\|.
$$

在有限维线性代数中，长度、距离、夹角与最近点都从这一步开始。

---

## 3. 正交性与正交归一组

定义

$$
x\perp y
\Longleftrightarrow
\langle x,y\rangle=0.
$$

### 3.1 Pythagoras 恒等式

若 $x\perp y$，则

$$
\|x+y\|^2
=
\|x\|^2+\|y\|^2.
$$

**证明**：

$$
\begin{aligned}
\|x+y\|^2
&=
\langle x+y,x+y\rangle\\
&=
\|x\|^2+\langle x,y\rangle
+\langle y,x\rangle+\|y\|^2.
\end{aligned}
$$

两个交叉项均为零。证毕。

反复使用这个结论可得：若 $v_1,\ldots,v_k$ 两两正交，则

$$
\left\|\sum_{i=1}^k v_i\right\|^2
=
\sum_{i=1}^k\|v_i\|^2.
$$

### 3.2 正交非零组必线性无关

**命题**：两两正交的非零向量 $v_1,\ldots,v_k$ 线性无关。

**证明**：

若

$$
\sum_{i=1}^k a_iv_i=0,
$$

则对任意 $j$ 与 $v_j$ 做内积：

$$
0
=
\left\langle\sum_i a_iv_i,v_j\right\rangle
=
a_j\|v_j\|^2.
$$

因为 $v_j\ne0$，所以 $a_j=0$。对每个 $j$ 都成立，故向量组线性无关。证毕。

若进一步有 $\|v_i\|=1$，就称它们为正交归一组。对正交归一组 $q_1,\ldots,q_k$，向量

$$
x=\sum_{i=1}^k a_iq_i
$$

的系数可以直接由内积读出：

$$
a_j=\langle x,q_j\rangle.
$$

---

## 4. Gram–Schmidt 正交化

**定理**：设 $v_1,\ldots,v_k$ 线性无关。则存在正交归一组 $q_1,\ldots,q_k$，使得对每个 $j$，

$$
\operatorname{span}\{q_1,\ldots,q_j\}
=
\operatorname{span}\{v_1,\ldots,v_j\}.
$$

**构造与证明**：

先令

$$
u_1=v_1,
\qquad
q_1=\frac{u_1}{\|u_1\|}.
$$

假设已经构造出 $q_1,\ldots,q_{j-1}$，令

$$
u_j
=
v_j-\sum_{i=1}^{j-1}\langle v_j,q_i\rangle q_i.
$$

对任意 $\ell<j$，

$$
\begin{aligned}
\langle u_j,q_\ell\rangle
&=
\langle v_j,q_\ell\rangle
-
\sum_{i=1}^{j-1}
\langle v_j,q_i\rangle
\langle q_i,q_\ell\rangle\\
&=
\langle v_j,q_\ell\rangle
-
\langle v_j,q_\ell\rangle
=0.
\end{aligned}
$$

所以 $u_j$ 与此前所有 $q_i$ 正交。

还需证明 $u_j\ne0$。若 $u_j=0$，则 $v_j$ 属于

$$
\operatorname{span}\{q_1,\ldots,q_{j-1}\}
=
\operatorname{span}\{v_1,\ldots,v_{j-1}\},
$$

这与 $v_1,\ldots,v_j$ 线性无关矛盾。因此可定义

$$
q_j=\frac{u_j}{\|u_j\|}.
$$

由构造，$q_j$ 属于 $\operatorname{span}\{v_1,\ldots,v_j\}$；反过来，

$$
v_j
=
u_j+\sum_{i<j}\langle v_j,q_i\rangle q_i
$$

属于 $\operatorname{span}\{q_1,\ldots,q_j\}$。结合归纳假设，两个逐级张成空间相等。证毕。

因此，任意有限维内积空间都有正交归一基：先取任意基，再施行 Gram–Schmidt。

---

## 5. 正交补与有限维正交分解

对任意子空间 $S\subseteq V$，定义它的正交补

$$
S^\perp
=
\{x\in V:\langle x,s\rangle=0,\ \forall s\in S\}.
$$

$S^\perp$ 是子空间。更重要的是，有限维情形下它恰好补齐 $S$。

**定理**：若 $V$ 有限维，则

$$
V=S\oplus S^\perp,
$$

并且

$$
\dim S+\dim S^\perp=\dim V.
$$

**证明**：

取 $S$ 的一组基，对它做 Gram–Schmidt，得到 $S$ 的正交归一基

$$
q_1,\ldots,q_k.
$$

先把原基扩充为 $V$ 的基，再继续做 Gram–Schmidt，可得到 $V$ 的正交归一基

$$
q_1,\ldots,q_k,q_{k+1},\ldots,q_n.
$$

后面的每个 $q_j$ 与前 $k$ 个向量正交，所以

$$
\operatorname{span}\{q_{k+1},\ldots,q_n\}
\subseteq S^\perp.
$$

反过来，若 $x\in S^\perp$，把 $x$ 按整组正交归一基展开：

$$
x=\sum_{i=1}^n\langle x,q_i\rangle q_i.
$$

因为 $x\perp S$，前 $k$ 个系数为零，故 $x$ 属于后 $n-k$ 个向量的张成。因此

$$
S^\perp
=
\operatorname{span}\{q_{k+1},\ldots,q_n\}.
$$

两组基合起来构成 $V$ 的基，所以得到正交直和与维数公式。证毕。

---

## 6. 正交投影定理

**定理**：设 $S\subseteq V$ 是子空间。对每个 $x\in V$，存在唯一的 $p\in S$ 与 $r\in S^\perp$，使得

$$
x=p+r.
$$

其中 $p$ 是 $S$ 中距离 $x$ 最近的唯一向量：

$$
\|x-p\|
=
\min_{s\in S}\|x-s\|.
$$

**存在性与唯一性**：

上一节的正交直和

$$
V=S\oplus S^\perp
$$

已经给出分解的存在性与唯一性。把其中的 $S$-分量记为

$$
p=P_Sx,
$$

称为 $x$ 在 $S$ 上的正交投影。

**最佳逼近性质的证明**：

任取 $s\in S$。因为 $p-s\in S$，而 $x-p=r\in S^\perp$，所以

$$
x-s=(x-p)+(p-s)
$$

是正交和。由 Pythagoras，

$$
\|x-s\|^2
=
\|x-p\|^2+\|p-s\|^2
\ge
\|x-p\|^2.
$$

等号成立当且仅当 $p-s=0$，也就是 $s=p$。因此最近点存在且唯一。证毕。

### 6.1 投影公式

若 $q_1,\ldots,q_k$ 是 $S$ 的正交归一基，则

$$
P_Sx
=
\sum_{i=1}^k\langle x,q_i\rangle q_i.
$$

**证明**：

右端显然属于 $S$。对任意 $q_j$，

$$
\left\langle
x-\sum_i\langle x,q_i\rangle q_i,
q_j
\right\rangle
=0,
$$

所以残差与 $S$ 的一组基正交，从而与整个 $S$ 正交。由投影分解的唯一性即得公式。证毕。

把 $q_i$ 按列排成

$$
Q=(q_1,\ldots,q_k),
\qquad
Q^*Q=I_k,
$$

则投影矩阵为

$$
P_S=QQ^*.
$$

它满足

$$
P_S^2=P_S,
\qquad
P_S^*=P_S.
$$

第一式表示投影两次与投影一次相同，第二式表示这是正交投影而不是一般的斜投影。

---

## 7. 四基本子空间的正交结构

现在可以兑现 Part 1 留下的结论。

**定理**：对 $A\in\mathbb F^{m\times n}$，

$$
\mathcal C(A)^\perp=\mathcal N(A^*),
$$

$$
\mathcal C(A^*)^\perp=\mathcal N(A).
$$

**证明**：

对 $y\in\mathbb F^m$，

$$
\begin{aligned}
y\in\mathcal C(A)^\perp
&\Longleftrightarrow
\langle Ax,y\rangle=0
\quad\text{对所有 }x\in\mathbb F^n\\
&\Longleftrightarrow
\langle x,A^*y\rangle=0
\quad\text{对所有 }x\in\mathbb F^n\\
&\Longleftrightarrow
A^*y=0\\
&\Longleftrightarrow
y\in\mathcal N(A^*).
\end{aligned}
$$

倒数第二步可取 $x=A^*y$，得到 $\|A^*y\|^2=0$。把同一结论应用于 $A^*$，便得

$$
\mathcal C(A^*)^\perp=\mathcal N(A).
$$

证毕。

结合有限维正交分解，得到四基本子空间定理：

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

两处均为正交直和。

因此，输出空间中的每个 $b$ 唯一分成

$$
b=b_{\mathcal C}+b_{\mathcal N},
\qquad
b_{\mathcal C}\in\mathcal C(A),
\quad
b_{\mathcal N}\in\mathcal N(A^*),
$$

输入空间中的每个 $x$ 唯一分成

$$
x=x_{\mathcal R}+x_{\mathcal N},
\qquad
x_{\mathcal R}\in\mathcal C(A^*),
\quad
x_{\mathcal N}\in\mathcal N(A).
$$

前一分解控制最小二乘残差，后一分解控制最小范数解。

---

## 8. 最小二乘与正规方程

给定

$$
A\in\mathbb F^{m\times n},
\qquad
b\in\mathbb F^m,
$$

考虑最小二乘问题

$$
\min_{x\in\mathbb F^n}\|Ax-b\|^2.
$$

所有 $Ax$ 都位于列空间 $\mathcal C(A)$。所以这个问题等价于：在 $\mathcal C(A)$ 中寻找距离 $b$ 最近的向量。

由投影定理，最近的拟合向量唯一，并且等于

$$
p=P_{\mathcal C(A)}b.
$$

因为 $p\in\mathcal C(A)$，至少存在一个 $\widehat x$ 满足

$$
A\widehat x=p.
$$

于是最小二乘解总是存在，但当 $\mathcal N(A)\ne\{0\}$ 时不一定唯一。

### 8.1 正规方程

**定理**：向量 $\widehat x$ 是最小二乘解，当且仅当

$$
A^*(A\widehat x-b)=0,
$$

也就是

$$
A^*A\widehat x=A^*b.
$$

**证明**：

$\widehat x$ 最优，当且仅当 $A\widehat x$ 是 $b$ 在 $\mathcal C(A)$ 上的正交投影；这又等价于残差

$$
r=b-A\widehat x
$$

属于 $\mathcal C(A)^\perp=\mathcal N(A^*)$。因此

$$
A^*r=0,
$$

也就是正规方程。每一步都是充要条件，所以反向同样成立。证毕。

### 8.2 解的唯一性

若 $\widehat x_1,\widehat x_2$ 都是最小二乘解，则它们产生同一个投影点：

$$
A\widehat x_1=A\widehat x_2=P_{\mathcal C(A)}b.
$$

所以

$$
\widehat x_1-\widehat x_2\in\mathcal N(A).
$$

因此最小二乘解唯一，当且仅当

$$
\mathcal N(A)=\{0\},
$$

也就是 $A$ 列满秩。此时 $A^*A$ 正定，因为对 $x\ne0$，

$$
x^*A^*Ax=\|Ax\|^2>0,
$$

故正规方程有唯一解

$$
\widehat x=(A^*A)^{-1}A^*b.
$$

这条闭式依赖列满秩；一般情形将在 Part 3 由 Moore–Penrose 伪逆统一处理。

### 8.3 Gram–Schmidt 与 QR 接口

若 $A$ 的列线性无关，对列向量施行 Gram–Schmidt 可得

$$
A=QR,
$$

其中 $Q^*Q=I$，$R$ 为可逆上三角矩阵。代入正规方程：

$$
R^*R\widehat x=R^*Q^*b.
$$

因为 $R^*$ 可逆，

$$
R\widehat x=Q^*b.
$$

因此正交化不仅证明投影存在，也把最小二乘化为一个上三角方程。完整的 QR 分解与数值稳定实现将在后续分解篇处理。

---

## 总结与下一站

本篇从内积推出了有限维空间的完整正交几何：

$$
|\langle x,y\rangle|
\le
\|x\|\,\|y\|,
$$

$$
V=S\oplus S^\perp,
$$

$$
P_Sx
=
\underset{s\in S}{\operatorname{argmin}}\ \|x-s\|,
$$

$$
\mathcal C(A)^\perp=\mathcal N(A^*),
\qquad
\mathcal C(A^*)^\perp=\mathcal N(A),
$$

以及

$$
\widehat x\text{ 是最小二乘解}
\Longleftrightarrow
A^*(A\widehat x-b)=0.
$$

Part 3 将把“精确解、最小二乘解、最小范数解”统一起来：先把 $A$ 限制在 $\mathcal N(A)^\perp$ 上得到一个真正可逆的映射，再由此构造 Moore–Penrose 伪逆。

[上一篇：线性代数 Part 1——向量空间、基、秩与四基本子空间](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)

[继续阅读：线性代数 Part 3——线性方程、伪逆与最小范数解](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)
