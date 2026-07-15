---
date: '2026-07-15T11:30:00+09:00'
draft: false
title: '线性代数 Part 4：特征值、不变子空间、Schur 与 Jordan'
summary: "从特征向量对应的一维不变子空间开始，经特征多项式、代数与几何重数证明可对角化判据；再证明复 Schur 分解，并由 Cayley–Hamilton、主分解与幂零链构造 Jordan 标准型。"
description: "有限维谱理论基础：特征值、特征向量、不变子空间、特征多项式、代数重数、几何重数、可对角化、复 Schur 分解、Cayley–Hamilton 定理、广义特征空间与 Jordan 标准型。"
tags: ["Linear Algebra", "Eigenvalue", "Invariant Subspace", "Characteristic Polynomial", "Diagonalization", "Schur Decomposition", "Cayley-Hamilton", "Jordan Form", "Proof"]
categories: ["Crucible"]
math: true
---

# 线性代数 Part 4：特征值、不变子空间、Schur 与 Jordan

前三篇允许线性映射在不同空间之间作用：

$$
A:\mathbb F^n\to\mathbb F^m.
$$

特征理论要求输入空间与输出空间相同。本篇研究有限维空间上的线性算子

$$
T:V\to V,
$$

或者选定基后的方阵

$$
A\in\mathbb F^{n\times n}.
$$

核心问题是：

> 能否找到被 $T$ 保持的方向或子空间，并据此选一组基，把矩阵化到尽可能简单？

整条链是：

$$
\text{特征直线}
\longrightarrow
\text{不变子空间}
\longrightarrow
\text{可对角化}
\longrightarrow
\text{Schur 上三角化}
\longrightarrow
\text{广义特征空间}
\longrightarrow
\text{Jordan 块}.
$$

域的边界必须先说明：

- 第 1–4 节在 $\mathbb F\in\{\mathbb R,\mathbb C\}$ 上成立，但特征多项式未必在 $\mathbb R$ 上分裂；
- Schur 上三角分解与 Jordan 标准型的完整形式在 $\mathbb C$ 上证明；
- 实矩阵可以先复化，也可以使用含 $1\times1$ 与 $2\times2$ 对角块的实 Schur 形式；
- 全文只讨论有限维空间。

---

## 1. 特征值、特征向量与不变子空间

### 1.1 特征对

若存在非零向量 $v\in V$ 与标量 $\lambda\in\mathbb F$，使

$$
Tv=\lambda v,
$$

则称 $\lambda$ 为 $T$ 的特征值，$v$ 为属于 $\lambda$ 的特征向量。

对应的特征空间是

$$
E_\lambda
\mathrel{=}
\ker(T-\lambda I).
$$

它确实是子空间；其中的非零向量才称为特征向量。

从子空间角度看，$v$ 是特征向量，当且仅当一维子空间

$$
\operatorname{span}\{v\}
$$

在 $T$ 下保持不变。

### 1.2 不变子空间

子空间 $S\subseteq V$ 称为 $T$-不变子空间，如果

$$
T(S)\subseteq S.
$$

此时可以定义限制算子

$$
T|_S:S\to S.
$$

若先取 $S$ 的一组基，再把它扩充成 $V$ 的基，则 $T$ 的矩阵具有分块上三角形式

$$
[T]
\mathrel{=}
\begin{pmatrix}
B & C\\
0 & D
\end{pmatrix}.
$$

**证明**：

设 $s_1,\ldots,s_k$ 是 $S$ 的基。因为 $S$ 不变，每个 $T(s_j)$ 都仍在 $S$ 内，所以矩阵前 $k$ 列在后 $n-k$ 个坐标上全部为零。这正给出左下角零块。证毕。

因此，寻找不变子空间就是寻找能够把矩阵分块的坐标结构。特征向量只是最小的一维情形。

---

## 2. 特征多项式

对 $A\in\mathbb F^{n\times n}$，定义特征多项式

$$
\chi_A(t)=\det(tI-A).
$$

**定理**：$\lambda\in\mathbb F$ 是 $A$ 的特征值，当且仅当

$$
\chi_A(\lambda)=0.
$$

**证明**：

$$
\begin{aligned}
\lambda\text{ 是特征值}
&\Longleftrightarrow
\exists v\ne0,\ (A-\lambda I)v=0\\
&\Longleftrightarrow
A-\lambda I\text{ 不可逆}\\
&\Longleftrightarrow
\det(A-\lambda I)=0\\
&\Longleftrightarrow
\det(\lambda I-A)=0.
\end{aligned}
$$

最后两个行列式只相差因子 $(-1)^n$。证毕。

### 2.1 相似变换不改变特征多项式

若

$$
B=P^{-1}AP,
$$

则

$$
\begin{aligned}
\chi_B(t)
&=
\det(tI-P^{-1}AP)\\
&=
\det\bigl(P^{-1}(tI-A)P\bigr)\\
&=
\det(tI-A)
\mathrel{=}
\chi_A(t).
\end{aligned}
$$

所以特征值属于线性算子本身，而不依赖于所选坐标。

### 2.2 复数域上的存在性

$\chi_A$ 是首一的 $n$ 次多项式。由代数基本定理，若 $n\ge1$ 且 $A$ 是复矩阵，则 $\chi_A$ 至少有一个复根，因此每个复方阵至少有一个特征值。

实方阵则未必有实特征值；把它视为复方阵以后，特征多项式在 $\mathbb C$ 上分裂，非实根成共轭对出现。

---

## 3. 不同特征值的特征向量

**定理**：属于两两不同特征值 $\lambda_1,\ldots,\lambda_k$ 的特征向量 $v_1,\ldots,v_k$ 线性无关。

**证明**：

对 $k$ 归纳。$k=1$ 时显然成立。设结论对 $k-1$ 个向量成立，并假设

$$
\sum_{i=1}^k c_iv_i=0.
$$

对两边作用 $A-\lambda_kI$：

$$
\sum_{i=1}^{k-1}
c_i(\lambda_i-\lambda_k)v_i=0.
$$

由归纳假设，$v_1,\ldots,v_{k-1}$ 线性无关，而 $\lambda_i-\lambda_k\ne0$，所以

$$
c_1=\cdots=c_{k-1}=0.
$$

原关系随即给出 $c_kv_k=0$，故 $c_k=0$。证毕。

**推论**：若 $A\in\mathbb F^{n\times n}$ 有 $n$ 个两两不同的特征值，则 $A$ 可对角化。

这是充分条件而非必要条件；重复特征值仍可能拥有足够大的特征空间。

---

## 4. 代数重数、几何重数与可对角化

假设 $\chi_A$ 在 $\mathbb F$ 上分裂：

$$
\chi_A(t)
\mathrel{=}
\prod_{i=1}^s(t-\lambda_i)^{a_i},
$$

其中 $\lambda_i$ 两两不同。$a_i$ 称为 $\lambda_i$ 的代数重数。

定义几何重数

$$
g_i=\dim E_{\lambda_i}
\mathrel{=}
\dim\ker(A-\lambda_iI).
$$

### 4.1 几何重数不超过代数重数

**定理**：

$$
1\le g_i\le a_i.
$$

**证明**：

$\lambda_i$ 是特征值，所以 $E_{\lambda_i}$ 至少含一个非零向量，故 $g_i\ge1$。

取 $E_{\lambda_i}$ 的一组基并扩充成整个空间的基。因为 $E_{\lambda_i}$ 是不变子空间，$A$ 在这组基下具有形式

$$
\begin{pmatrix}
\lambda_iI_{g_i} & C\\
0 & D
\end{pmatrix}.
$$

因此

$$
\chi_A(t)
\mathrel{=}
\det
\begin{pmatrix}
(t-\lambda_i)I_{g_i} & -C\\
0 & tI-D
\end{pmatrix}
\mathrel{=}
(t-\lambda_i)^{g_i}\det(tI-D).
$$

所以 $(t-\lambda_i)^{g_i}$ 整除 $\chi_A(t)$，即 $g_i\le a_i$。证毕。

### 4.2 可对角化判据

**定理**：在 $\chi_A$ 于 $\mathbb F$ 上分裂的前提下，以下条件等价：

1. $A$ 可在 $\mathbb F$ 上对角化；
2. $V$ 有一组完全由特征向量组成的基；
3.

$$
V=E_{\lambda_1}\oplus\cdots\oplus E_{\lambda_s};
$$

4.

$$
\sum_{i=1}^s g_i=n;
$$

5. 对每个 $i$，

$$
g_i=a_i.
$$

**证明**：

若 $A=PDP^{-1}$，则 $P$ 的各列构成特征向量基；反过来，把一组特征向量基按列组成 $P$，逐列的特征方程合并为

$$
AP=PD,
$$

从而 $A=PDP^{-1}$。所以第一、二条等价。

不同特征空间的非零向量合在一起仍线性无关，这是上一节定理的直接推广。因此所有特征空间之和是直和。它等于整个 $V$，当且仅当维数之和为 $n$。所以第二、三、四条等价。

又因为

$$
\sum_i a_i=n,
\qquad
g_i\le a_i,
$$

所以 $\sum_i g_i=n$ 当且仅当每个 $g_i=a_i$。故第四、五条等价。证毕。

对角化的本质至此明确：

$$
\text{可对角化}
\Longleftrightarrow
\text{有一组特征向量基}.
$$

---

## 5. Schur 分解：永远存在的酉上三角化

并非每个方阵都拥有特征向量基，但在复数域上，每个方阵都能保住一组正交归一基，并化为上三角矩阵。

**复 Schur 分解定理**：对任意 $A\in\mathbb C^{n\times n}$，存在酉矩阵 $Q$ 与上三角矩阵 $T$，使

$$
A=QTQ^*.
$$

$T$ 的对角元是 $A$ 的全部特征值，计入代数重数。

**证明**：

对 $n$ 归纳。$n=1$ 时结论显然。

设 $n>1$。由代数基本定理，$A$ 有特征值 $\lambda_1$。取对应的单位特征向量 $q_1$，并把它扩充成 $\mathbb C^n$ 的正交归一基。令这些基向量组成酉矩阵 $Q_1$。

因为

$$
Aq_1=\lambda_1q_1,
$$

所以 $Q_1^*AQ_1$ 的第一列是 $(\lambda_1,0,\ldots,0)^\top$，从而

$$
Q_1^*AQ_1
\mathrel{=}
\begin{pmatrix}
\lambda_1 & w^*\\
0 & A_1
\end{pmatrix}
$$

其中 $A_1\in\mathbb C^{(n-1)\times(n-1)}$。

由归纳假设，存在酉矩阵 $U$ 使

$$
U^*A_1U=T_1
$$

为上三角矩阵。令

$$
\widetilde U
\mathrel{=}
\begin{pmatrix}
1&0\\
0&U
\end{pmatrix},
\qquad
Q=Q_1\widetilde U.
$$

则 $Q$ 酉，并且

$$
Q^*AQ
\mathrel{=}
\widetilde U^*(Q_1^*AQ_1)\widetilde U
\mathrel{=}
\begin{pmatrix}
\lambda_1 & w^*U\\
0 & T_1
\end{pmatrix},
$$

仍为上三角矩阵。记它为 $T$，便有 $A=QTQ^*$。

上三角矩阵的特征多项式是

$$
\chi_T(t)
\mathrel{=}
\prod_{j=1}^n(t-t_{jj}),
$$

而酉相似不改变特征多项式，所以 $T$ 的对角元恰是 $A$ 的全部特征值。证毕。

### 5.1 Schur 基给出的不变旗标

把 $Q$ 的列记为 $q_1,\ldots,q_n$。由

$$
AQ=QT
$$

和 $T$ 上三角可知

$$
Aq_j\in\operatorname{span}\{q_1,\ldots,q_j\}.
$$

因此

$$
\{0\}
\subset
\operatorname{span}\{q_1\}
\subset
\operatorname{span}\{q_1,q_2\}
\subset\cdots\subset
\mathbb C^n
$$

是一条逐级增加一维的不变子空间链。

Schur 分解并不要求 $A$ 可对角化。它牺牲“对角”，保住“酉基”，是一般方阵总能达到的正交坐标形式。

### 5.2 实 Schur 形式

若 $A$ 为实矩阵而又要求换基矩阵保持实数，则通常不能得到严格上三角形式，因为非实特征值没有实特征向量。对应结论是

$$
A=QRQ^\top,
$$

其中 $Q$ 为实正交矩阵，$R$ 为准上三角矩阵：对角线上是对应实特征值的 $1\times1$ 块，以及对应共轭复特征值对的 $2\times2$ 块。

---

## 6. Cayley–Hamilton 定理

Jordan 理论需要研究 $(A-\lambda I)^k$ 的核。首先要证明，矩阵会被自己的特征多项式消去。

**Cayley–Hamilton 定理**：

$$
\chi_A(A)=0.
$$

**证明**：

由伴随矩阵恒等式，

$$
(tI-A)\operatorname{adj}(tI-A)
\mathrel{=}
\chi_A(t)I.
$$

把两侧看成关于标量 $t$ 的矩阵多项式，写成

$$
\operatorname{adj}(tI-A)
\mathrel{=}
B_0+B_1t+\cdots+B_{n-1}t^{n-1},
$$

$$
\chi_A(t)
\mathrel{=}
c_0+c_1t+\cdots+c_{n-1}t^{n-1}+t^n.
$$

比较 $t^k$ 的系数，得到

$$
-AB_0=c_0I,
$$

$$
B_{k-1}-AB_k=c_kI
\qquad
(1\le k\le n-1),
$$

以及

$$
B_{n-1}=I.
$$

把第一式视为 $k=0$；将中间第 $k$ 式左乘 $A^k$，并将末式 $B_{n-1}=I$ 左乘 $A^n$。再把全部等式相加，左侧的

$$
-AB_0+AB_0-A^2B_1+A^2B_1-\cdots-A^nB_{n-1}+A^nB_{n-1}
$$

逐项消去，右侧得到

$$
c_0I+c_1A+\cdots+c_{n-1}A^{n-1}+A^n=0.
$$

这正是 $\chi_A(A)=0$。证毕。

---

## 7. 广义特征空间与主分解

普通特征空间

$$
\ker(A-\lambda I)
$$

在不可对角化时可能太小。为容纳缺失的方向，定义广义特征空间

$$
G_\lambda
\mathrel{=}
\ker(A-\lambda I)^n.
$$

指数取 $n$ 足以覆盖所有可能的链；也可取不小于该特征值最大 Jordan 块尺寸的任意指数。

### 7.1 互素分解引理

**引理**：若多项式 $p,q\in\mathbb F[t]$ 互素，并且

$$
p(A)q(A)=0,
$$

则

$$
V=\ker p(A)\oplus\ker q(A).
$$

**证明**：

由 Bézout 恒等式，存在多项式 $u,v$ 使

$$
u(t)p(t)+v(t)q(t)=1.
$$

代入 $A$：

$$
u(A)p(A)+v(A)q(A)=I.
$$

所以任意 $x\in V$ 可写成

$$
x=u(A)p(A)x+v(A)q(A)x.
$$

第一项属于 $\ker q(A)$，因为多项式作用彼此可交换且 $p(A)q(A)=0$；第二项属于 $\ker p(A)$。

若 $x$ 同时属于两个核，则

$$
x=u(A)p(A)x+v(A)q(A)x=0.
$$

所以这个和是直和。证毕。

### 7.2 主分解定理

现在令 $A\in\mathbb C^{n\times n}$，并将特征多项式分解为

$$
\chi_A(t)
\mathrel{=}
\prod_{i=1}^s(t-\lambda_i)^{a_i}.
$$

各因子两两互素，而 Cayley–Hamilton 给出 $\chi_A(A)=0$。反复应用互素分解引理，得到

$$
\mathbb C^n
\mathrel{=}
G_{\lambda_1}\oplus\cdots\oplus G_{\lambda_s},
$$

其中可以取

$$
G_{\lambda_i}
\mathrel{=}
\ker(A-\lambda_iI)^{a_i}.
$$

每个 $G_{\lambda_i}$ 都是 $A$-不变子空间，而且在其上

$$
N_i
\mathrel{=}
(A-\lambda_iI)\big|_{G_{\lambda_i}}
$$

是幂零算子：

$$
N_i^{a_i}=0.
$$

因此 Jordan 问题已经被分解为若干个独立问题：

> 如何为一个幂零算子构造由链组成的基？

---

## 8. 幂零链引理

设 $N:W\to W$ 为幂零算子，存在最小正整数 $s$ 使

$$
N^s=0.
$$

定义递增的核过滤：

$$
K_0=\{0\},
\qquad
K_j=\ker N^j
\quad
(1\le j\le s).
$$

于是

$$
\{0\}=K_0\subseteq K_1\subseteq\cdots\subseteq K_s=W.
$$

**幂零链引理**：$W$ 存在一组基，可以分成若干条链

$$
N^{\ell-1}w,\,
N^{\ell-2}w,\,
\ldots,\,
Nw,\,
w,
$$

并且

$$
N(N^{\ell-1}w)=0,
\qquad
N(N^jw)=N^{j+1}w
\quad
(0\le j\le\ell-2),
$$

按上述从左到右的排列等价地表现为：每个向量被 $N$ 送到它左边的向量，最左端被送到零。

**证明**：

对每个 $j\ge1$，$N$ 诱导线性映射

$$
\overline N_j:
K_{j+1}/K_j
\longrightarrow
K_j/K_{j-1}.
$$

这个诱导映射是单射。因为若 $x\in K_{j+1}$ 且

$$
Nx\in K_{j-1},
$$

则 $N^jx=0$，所以 $x\in K_j$，即 $x$ 在商空间 $K_{j+1}/K_j$ 中为零。

现在从最高层向下构造。先在 $K_s/K_{s-1}$ 中取一组基，并在 $K_s$ 中选择代表元；这些代表元作为长度 $s$ 的链顶。

假设长度大于 $j$ 的链顶已经选好。它们在第 $j$ 层的后继向量，其模 $K_{j-1}$ 的陪集线性无关：这是上面各个诱导映射反复保持单射的结果。把这些陪集扩充成 $K_j/K_{j-1}$ 的一组基，并为新加入的陪集在 $K_j$ 中选择代表元；这些新代表元作为长度 $j$ 的链顶。

从 $j=s-1$ 一直做到 $j=1$。构造完成后，对每个 $j$，所有长度至少为 $j$ 的链在第 $j$ 层留下的向量，其陪集恰好构成

$$
K_j/K_{j-1}
$$

的一组基。

因此所有链向量合起来张成每一层 $K_j$，最终张成 $K_s=W$；若存在非平凡线性关系，取其中涉及的最高过滤层并模去下一层 $K_{j-1}$，就会得到该商空间基的非平凡线性关系，矛盾。所以全部链向量线性无关，构成 $W$ 的一组基。证毕。

若按

$$
N^{\ell-1}w,\ldots,Nw,w
$$

的顺序排列一条链，$N$ 在这组基下的矩阵是

$$
J_\ell(0)
\mathrel{=}
\begin{pmatrix}
0&1&&0\\
&0&\ddots&\\
&&\ddots&1\\
0&&&0
\end{pmatrix}.
$$

---

## 9. Jordan 标准型

回到每个广义特征空间 $G_\lambda$。算子

$$
N=(A-\lambda I)|_{G_\lambda}
$$

幂零。由幂零链引理，可选一组链基，使 $N$ 成为若干个 $J_\ell(0)$ 的块对角矩阵。因此 $A=\lambda I+N$ 在同一组基下成为若干个 Jordan 块

$$
J_\ell(\lambda)
\mathrel{=}
\begin{pmatrix}
\lambda&1&&0\\
&\lambda&\ddots&\\
&&\ddots&1\\
0&&&\lambda
\end{pmatrix}.
$$

对所有特征值的广义特征空间合并这些链基，得到：

**Jordan 标准型定理**：对任意 $A\in\mathbb C^{n\times n}$，存在可逆矩阵 $P$，使

$$
P^{-1}AP
\mathrel{=}
J
\mathrel{=}
\operatorname{diag}
\bigl(
J_{\ell_1}(\lambda_1),
\ldots,
J_{\ell_k}(\lambda_k)
\bigr).
$$

Jordan 块除排列顺序外唯一。

### 9.1 块尺寸为什么唯一

固定特征值 $\lambda$，令

$$
d_j
\mathrel{=}
\dim\ker(A-\lambda I)^j
\mathbin{-}
\dim\ker(A-\lambda I)^{j-1}.
$$

一个尺寸为 $\ell$ 的 Jordan 块对上述差值的贡献，在 $j\le\ell$ 时为 $1$，在 $j>\ell$ 时为 $0$。所以

$$
d_j
\mathrel{=}
\#\{\text{尺寸至少为 }j\text{ 的 }\lambda\text{-Jordan 块}\}.
$$

进而

$$
d_j-d_{j+1}
\mathrel{=}
\#\{\text{尺寸恰为 }j\text{ 的 }\lambda\text{-Jordan 块}\}.
$$

右侧完全由算子各次幂的核维数决定，因此每种尺寸的块数唯一，只有块的排列可以改变。

### 9.2 可对角化的 Jordan 判据

Jordan 块 $J_\ell(\lambda)$ 在且仅在 $\ell=1$ 时已经是对角块。因此

$$
A\text{ 可对角化}
\Longleftrightarrow
\text{所有 Jordan 块尺寸均为 }1.
$$

这与第 4 节的重数判据完全一致：尺寸大于 $1$ 的 Jordan 块正是几何重数小于代数重数时缺失特征向量的记录。

---

## 10. Schur 与 Jordan 各自回答什么

两种分解都适用于任意复方阵，但保留的结构不同：

| 分解 | 换基矩阵 | 结果 | 主要信息 |
|---|---|---|---|
| Schur | 酉矩阵 $Q$ | 上三角 $T$ | 保持内积与范数，给出正交不变旗标 |
| Jordan | 一般可逆矩阵 $P$ | Jordan 块对角 $J$ | 精确记录广义特征链与相似类 |

Schur 分解保证正交坐标，但上三角的非对角部分没有固定的标准形。Jordan 标准型给出相似意义下的精确分类，但其基通常不正交。

对角化位于二者的交点：当有足够多的特征向量时，Jordan 块全部降为 $1\times1$；若算子还能在正交归一特征基下对角化，则需要更强的正规结构，这将在下一篇讨论。

---

## 总结与下一站

本篇建立了有限维方阵的完整结构链：

$$
Av=\lambda v
\Longleftrightarrow
\operatorname{span}\{v\}\text{ 是一维不变子空间},
$$

$$
A\text{ 可对角化}
\Longleftrightarrow
V=\bigoplus_\lambda E_\lambda,
$$

$$
A=QTQ^*
\qquad
\text{对任意复方阵成立},
$$

以及

$$
A=PJP^{-1}
\qquad
\text{其中 }J\text{ 由广义特征链组成}.
$$

Schur 分解说明一般方阵总能在正交归一基下上三角化；Jordan 标准型则精确说明对角化失败时究竟缺少了多少普通特征向量。

下一篇将给算子加入伴随结构，研究对称、Hermitian、正规、正定与二次型，并证明何时 Schur 的上三角部分必然消失，从而得到正交或酉对角化。

[上一篇：线性代数 Part 3——线性方程、伪逆与最小范数解](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)

[继续阅读：线性代数 Part 5——对称、正规、二次型与谱定理](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)
