---
date: '2026-07-15T14:05:00+09:00'
draft: false
title: '线性代数 Part 5：对称、正规、二次型与谱定理'
summary: "在有限维实或复内积空间中，从伴随出发区分 Hermitian、normal 与 unitary，证明有限维谱定理，再以谱坐标刻画二次型、正定性、Gram 矩阵和协方差矩阵。"
description: "有限维线性代数笔记：伴随矩阵、Hermitian 与正规矩阵、酉对角化、有限维谱定理、Rayleigh 商、正定与半正定、平方根、Gram 矩阵和协方差矩阵，并给出核心命题的证明。"
tags: ["Mathematics", "Linear Algebra", "Spectral Methods"]
categories: ["Notes"]
series: ["Linear Algebra"]
note_kind: "foundation"
math: true
---

# 线性代数 Part 5：对称、正规、二次型与谱定理

> [Part 4：特征值、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/) 说明了一般方阵在换基后最多能简化到什么程度。本篇加入内积，追问一个更强的问题：什么时候可以用**正交或酉基**完成对角化？答案是正规矩阵；其中 Hermitian 矩阵又把谱限制在实轴上，并由此产生二次型、正定性、Gram 与协方差的统一结构。

本篇只讨论有限维空间。除非特别说明，底域为

$$
\mathbb F\in\{\mathbb R,\mathbb C\},
$$

向量采用列表示，并与实分析及前四篇统一采用**第一变量线性**约定：复数情形的内积取

$$
\langle x,y\rangle=y^*x,
$$

其中 $A^*=\overline A^{\mathsf T}$；在实数域上 $A^*=A^{\mathsf T}$。所有关于正定性的陈述都以 Hermitian 为前提。

整条链是

$$
A^*
\longrightarrow
\text{Hermitian / normal / unitary}
\longrightarrow
\text{酉对角化}
\longrightarrow
\text{二次型与 Rayleigh 商}
\longrightarrow
\text{PSD}
\longrightarrow
\text{Gram 与协方差}.
$$

---

## 1. 伴随：把线性映射移过内积

设 $A\in\mathbb F^{m\times n}$。它的伴随 $A^*\in\mathbb F^{n\times m}$ 由恒等式

$$
\langle Ax,y\rangle=\langle x,A^*y\rangle
$$

唯一确定。坐标计算给出 $A^*=\overline A^{\mathsf T}$。

伴随与矩阵运算相容：

$$
(A+B)^*=A^*+B^*,
\qquad
(\alpha A)^*=\overline\alpha A^*,
$$

$$
(AB)^*=B^*A^*,
\qquad
(A^*)^*=A.
$$

最后一个乘积公式解释了次序为何反转。对任意相容的 $x,y$，

$$
\langle ABx,y\rangle
=\langle Bx,A^*y\rangle
=\langle x,B^*A^*y\rangle,
$$

因此 $(AB)^*=B^*A^*$。

### 三类方阵

设 $A\in\mathbb F^{n\times n}$。

**Hermitian（实数域上称对称）**：

$$
A=A^*.
$$

**normal（正规）**：

$$
A^*A=AA^*.
$$

**unitary（实数域上称正交）**：

$$
A^*A=AA^*=I.
$$

Hermitian 和 unitary 都蕴含 normal，但二者彼此不包含。Hermitian 控制谱的位置；unitary 控制长度；normal 则精确刻画能否用酉基对角化。

---

## 2. 酉矩阵保持全部内积几何

**命题**：对方阵 $U$，以下条件等价：

1. $U^*U=I$；
2. $\langle Ux,Uy\rangle=\langle x,y\rangle$ 对所有 $x,y$ 成立；
3. $\|Ux\|_2=\|x\|_2$ 对所有 $x$ 成立；
4. $U$ 的列构成一组标准正交基。

**证明**：由 $U^*U=I$，

$$
\langle Ux,Uy\rangle=y^*U^*Ux=y^*x=\langle x,y\rangle.
$$

取 $y=x$ 得到保长度。反过来，若对所有 $x$ 都保长度，则由复内积的极化恒等式，内积也被保持，因而

$$
y^*(U^*U-I)x=0
$$

对所有 $x,y$ 成立，只能有 $U^*U=I$。若 $u_i$ 是 $U$ 的第 $i$ 列，则 $(U^*U)_{ij}=u_i^*u_j=\langle u_j,u_i\rangle$，所以 $U^*U=I$ 当且仅当列标准正交。有限维方阵满足 $U^*U=I$ 时必可逆，且 $U^{-1}=U^*$，于是也有 $UU^*=I$。证毕。

因此酉变换不改变长度、角度、正交性和二范数。后面的谱分解、SVD 与 QR 都用酉矩阵承担换基，是因为这种换基不引入几何畸变。

---

## 3. Hermitian 矩阵的谱为什么是实的

**命题 1**：Hermitian 矩阵的每个特征值都是实数。

**证明**：设 $Av=\lambda v$，$v\ne0$。由 $A=A^*$，

$$
\lambda\|v\|_2^2
=v^*Av
=(A v)^*v
=\overline\lambda\|v\|_2^2.
$$

因为 $\|v\|_2^2>0$，所以 $\lambda=\overline\lambda$，即 $\lambda\in\mathbb R$。证毕。

**命题 2**：Hermitian 矩阵对应不同特征值的特征向量正交。

**证明**：设

$$
Av_i=\lambda_i v_i,
\qquad
Av_j=\lambda_j v_j,
\qquad
\lambda_i\ne\lambda_j.
$$

由 Hermitian 性与特征值为实数，

$$
\lambda_i\langle v_i,v_j\rangle
=\langle Av_i,v_j\rangle
=\langle v_i,Av_j\rangle
=\lambda_j\langle v_i,v_j\rangle.
$$

故

$$
(\lambda_i-\lambda_j)\langle v_i,v_j\rangle=0,
$$

从而 $\langle v_i,v_j\rangle=0$。证毕。

这两个命题还不等于谱定理：重特征值对应的特征空间仍需在内部选取标准正交基，而且必须证明所有特征空间合起来足以张成整个空间。

---

## 4. 有限维谱定理

**定理（Hermitian 谱定理）**：若 $A=A^*\in\mathbb F^{n\times n}$，则存在酉矩阵 $U$ 与实对角矩阵 $\Lambda$，使

$$
A=U\Lambda U^*.
$$

等价地，$\mathbb F^n$ 存在一组由 $A$ 的特征向量组成的标准正交基。

**证明**：先在复数域证明。特征多项式在 $\mathbb C$ 上至少有一个根，所以存在单位特征向量 $u_1$，满足

$$
Au_1=\lambda_1u_1.
$$

考虑正交补

$$
M=u_1^\perp.
$$

它对 $A$ 不变。事实上，对任意 $x\in M$，

$$
\langle Ax,u_1\rangle
=\langle x,A^*u_1\rangle
=\langle x,Au_1\rangle
=\lambda_1\langle x,u_1\rangle
=0.
$$

所以 $Ax\in M$。限制映射 $A|_M$ 仍是 Hermitian。对维数作归纳：$M$ 上存在一组标准正交特征基 $u_2,\ldots,u_n$。连同 $u_1$，便得到整个空间的标准正交特征基。令

$$
U=(u_1,\ldots,u_n),
\qquad
\Lambda=\operatorname{diag}(\lambda_1,\ldots,\lambda_n),
$$

则 $AU=U\Lambda$，右乘 $U^*$ 得 $A=U\Lambda U^*$。

实对称矩阵的情形可以直接在实单位球面上极大化连续函数 $x^{\mathsf T}Ax$，由拉格朗日乘子得到一个实特征向量；随后使用同一个正交补归纳。证毕。

谱分解也可以写成秩一投影之和：

$$
A=\sum_{i=1}^n\lambda_i u_i u_i^*.
$$

其中 $u_i u_i^*$ 是投到 $\operatorname{span}\{u_i\}$ 的正交投影。于是 Hermitian 映射的全部作用，就是沿一组相互正交的轴分别乘以实数 $\lambda_i$。

---

## 5. 正规矩阵：酉对角化的精确边界

Hermitian 只是正规矩阵的一部分。正规矩阵的特征值可以是复数，但仍有正交特征基。

**定理（normal 谱定理）**：对 $A\in\mathbb C^{n\times n}$，以下两件事等价：

1. $A$ 正规，即 $A^*A=AA^*$；
2. 存在酉矩阵 $U$ 与对角矩阵 $\Lambda$，使

$$
A=U\Lambda U^*.
$$

**证明**：若 $A=U\Lambda U^*$，则

$$
A^*A
=U\Lambda^*\Lambda U^*,
\qquad
AA^*
=U\Lambda\Lambda^*U^*.
$$

对角矩阵与其伴随可交换，所以二者相等，$A$ 正规。

反过来，由 Schur 定理存在酉矩阵 $Q$，使

$$
A=QTQ^*,
$$

其中 $T$ 为上三角矩阵。酉相似保持正规性，因此 $T$ 正规。比较 $T^*T$ 与 $TT^*$ 的第 $(1,1)$ 项：

$$
(T^*T)_{11}=|t_{11}|^2,
$$

而

$$
(TT^*)_{11}=|t_{11}|^2+\sum_{j=2}^n|t_{1j}|^2.
$$

正规性迫使 $t_{1j}=0$，$j>1$。删去第一行第一列后，余下上三角块仍正规；归纳得到 $T$ 必为对角矩阵。于是 $A$ 酉对角化。证毕。

因此有严格区分：

$$
\text{Hermitian}
\subset
\text{normal}
\subset
\text{可对角化矩阵},
$$

最后一个包含关系指复数域，而且通常是严格包含：一般可对角化矩阵的特征基不必正交。

---

## 6. 二次型只看 Hermitian 部分

在实数域上，矩阵 $A\in\mathbb R^{n\times n}$ 产生二次型

$$
q_A(x)=x^{\mathsf T}Ax.
$$

把 $A$ 分成对称与反对称两部分：

$$
A=\frac{A+A^{\mathsf T}}2+\frac{A-A^{\mathsf T}}2.
$$

令 $K=(A-A^{\mathsf T})/2$，则 $K^{\mathsf T}=-K$。标量 $x^{\mathsf T}Kx$ 满足

$$
x^{\mathsf T}Kx
=(x^{\mathsf T}Kx)^{\mathsf T}
=x^{\mathsf T}K^{\mathsf T}x
=-x^{\mathsf T}Kx,
$$

所以它只能为零。因此

$$
x^{\mathsf T}Ax
=x^{\mathsf T}\frac{A+A^{\mathsf T}}2x.
$$

复数情形对应 Hermitian 型 $x^*Ax$。若希望它对所有 $x$ 都是实数，就必须且只需 $A=A^*$。

### 谱坐标中的二次型

设 $A=U\Lambda U^*$ 为 Hermitian 谱分解，令 $z=U^*x$。由于 $U$ 酉，

$$
x^*Ax
=z^*\Lambda z
=\sum_{i=1}^n\lambda_i|z_i|^2.
$$

二次型的符号、曲率与退化方向全部由特征值决定。

---

## 7. Rayleigh 商与极值特征值

对非零向量 $x$，定义 Hermitian 矩阵 $A$ 的 Rayleigh 商

$$
R_A(x)=\frac{x^*Ax}{x^*x}.
$$

**定理（Rayleigh 极值原理）**：若特征值按

$$
\lambda_1\ge\lambda_2\ge\cdots\ge\lambda_n
$$

排列，则

$$
\lambda_n
\le
R_A(x)
\le
\lambda_1
$$

对所有 $x\ne0$ 成立，并且

$$
\max_{x\ne0}R_A(x)=\lambda_1,
\qquad
\min_{x\ne0}R_A(x)=\lambda_n.
$$

**证明**：在谱坐标 $z=U^*x$ 下，

$$
R_A(x)
=\frac{\sum_i\lambda_i|z_i|^2}{\sum_i|z_i|^2}
=\sum_i\lambda_i w_i,
$$

其中

$$
w_i=\frac{|z_i|^2}{\sum_j|z_j|^2},
\qquad
w_i\ge0,
\qquad
\sum_iw_i=1.
$$

所以 Rayleigh 商是特征值的凸组合，必落在最小和最大特征值之间。取 $x=u_1$ 或 $x=u_n$ 分别达到两个端点。证毕。

这个结论把“寻找主方向”转成约束极值问题，也是 PCA 的直接入口。

---

## 8. 正定与半正定的等价刻画

设 $A=A^*$。

**定义**：若

$$
x^*Ax\ge0
$$

对所有 $x$ 成立，则称 $A$ 半正定，记作 $A\succeq0$。若

$$
x^*Ax>0
$$

对所有 $x\ne0$ 成立，则称 $A$ 正定，记作 $A\succ0$。

**定理（PSD 等价链）**：对 Hermitian 矩阵 $A$，以下条件等价：

1. $A\succeq0$；
2. $A$ 的所有特征值非负；
3. 存在矩阵 $B$，使 $A=B^*B$；
4. 存在唯一的 Hermitian 半正定矩阵 $A^{1/2}$，使

$$
(A^{1/2})^2=A.
$$

**证明**：由谱分解 $A=U\Lambda U^*$，

$$
x^*Ax=\sum_i\lambda_i|u_i^*x|^2.
$$

因此全部二次型非负，当且仅当全部 $\lambda_i\ge0$，即 $1\Leftrightarrow2$。

若 $\lambda_i\ge0$，定义

$$
\Lambda^{1/2}=\operatorname{diag}(\sqrt{\lambda_1},\ldots,\sqrt{\lambda_n}),
$$

以及

$$
A^{1/2}=U\Lambda^{1/2}U^*.
$$

则 $A^{1/2}$ Hermitian 半正定，且平方为 $A$。取 $B=A^{1/2}$ 得 $A=B^*B$，故 $2\Rightarrow4\Rightarrow3$。

若 $A=B^*B$，则

$$
x^*Ax=x^*B^*Bx=\|Bx\|_2^2\ge0,
$$

所以 $3\Rightarrow1$。半正定平方根的唯一性来自：任何 Hermitian 半正定平方根都与 $A$ 可交换，并在 $A$ 的每个特征空间上只能取非负根 $\sqrt\lambda$。证毕。

同理，以下条件等价：

$$
A\succ0,
$$

$$
\lambda_i>0\quad\text{对所有 }i,
$$

$$
A=B^*B\quad\text{且 }B\text{ 可逆},
$$

$$
\lambda_{\min}(A)>0.
$$

特别地，正定矩阵必可逆；半正定矩阵允许零特征值，其零空间正是二次型能量为零的方向。

---

## 9. Gram 矩阵：所有有限 PSD 矩阵的统一形式

给定向量 $v_1,\ldots,v_n\in\mathbb F^m$，定义 Gram 矩阵

$$
G_{ij}=\langle v_j,v_i\rangle=v_i^*v_j.
$$

这里交换内积中的索引，是因为本文约定第一变量线性；这样 $G_{ij}$ 仍采用标准的“第 $i$ 个向量共轭转置乘第 $j$ 个向量”顺序。若把向量作为列组成

$$
V=(v_1,\ldots,v_n),
$$

则

$$
G=V^*V.
$$

**命题**：Gram 矩阵 Hermitian 半正定，并且

$$
\operatorname{rank}(G)=\operatorname{rank}(V).
$$

**证明**：Hermitian 性由

$$
G^*=(V^*V)^*=V^*V=G
$$

得到。对任意 $c\in\mathbb F^n$，

$$
c^*Gc=c^*V^*Vc=\|Vc\|_2^2\ge0.
$$

而

$$
c\in\ker(G)
\Longleftrightarrow
c^*Gc=0
\Longleftrightarrow
Vc=0,
$$

所以 $\ker(G)=\ker(V)$。由秩—零度定理，两者秩相等。证毕。

反过来，每个 Hermitian PSD 矩阵都是某组向量的 Gram 矩阵。因为 $G\succeq0$ 时可写成

$$
G=G^{1/2}G^{1/2},
$$

把 $G^{1/2}$ 的列视作向量即可。于是“PSD”与“某组向量的两两内积表”在有限维里是同一件事。

---

## 10. 协方差矩阵是中心化数据的 Gram 矩阵

设 $n$ 个样本 $x_1,\ldots,x_n\in\mathbb R^d$，样本均值为

$$
\overline x=\frac1n\sum_{i=1}^n x_i.
$$

把中心化样本作为行组成

$$
X_c=
\begin{pmatrix}
(x_1-\overline x)^{\mathsf T}\\
\vdots\\
(x_n-\overline x)^{\mathsf T}
\end{pmatrix}
\in\mathbb R^{n\times d}.
$$

采用分母 $n$ 的经验协方差定义

$$
S=\frac1nX_c^{\mathsf T}X_c.
$$

当 $n\ge2$ 且讨论无偏样本协方差时，可以把 $1/n$ 换成 $1/(n-1)$；这只改变整体尺度，不改变特征向量与半正定性。

**命题**：$S$ 对称半正定，并且对任意方向 $u\in\mathbb R^d$，

$$
u^{\mathsf T}Su
=\frac1n\sum_{i=1}^n
\bigl(u^{\mathsf T}(x_i-\overline x)\bigr)^2.
$$

**证明**：直接计算

$$
u^{\mathsf T}Su
=\frac1n u^{\mathsf T}X_c^{\mathsf T}X_cu
=\frac1n\|X_cu\|_2^2.
$$

$X_cu$ 的第 $i$ 个分量正是 $u^{\mathsf T}(x_i-\overline x)$，展开平方范数即得公式，也立即得到非负性。证毕。

因此 $S$ 的 Rayleigh 商就是单位方向上的投影方差。由 Rayleigh 极值原理，最大特征值对应方差最大的方向；这将在 [Part 7：低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/) 中成为 PCA 的定义，而不是事后解释。

---

## 11. 本篇闭环

本篇得到两条有限维等价链：

$$
A\text{ normal}
\Longleftrightarrow
A\text{ 可酉对角化},
$$

以及对 Hermitian $A$，

$$
A\succeq0
\Longleftrightarrow
\lambda_i(A)\ge0
\Longleftrightarrow
A=B^*B
\Longleftrightarrow
A\text{ 有唯一 PSD 平方根}.
$$

Gram 与协方差并不是另外两类孤立矩阵；它们都是 $B^*B$ 结构的实例。下一篇把这些结构变成可计算的分解：正定性产生 Cholesky，正交化产生 QR，消元产生 LU，而谱定理作用于 $A^*A$ 则产生适用于任意矩形矩阵的 SVD。

[上一篇：Part 4——特征值、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)

[下一篇：Part 6——LU、QR、Cholesky、SVD 与极分解](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)

[返回：Part 0——矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)
