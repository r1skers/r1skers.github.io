---
date: '2026-07-15T14:25:00+09:00'
draft: false
title: '线性代数 Part 6：LU、QR、Cholesky、SVD 与极分解'
summary: "把矩阵分解放回各自的存在条件：消元产生带主元的 LU，正交化产生 QR，正定性产生 Cholesky，谱定理作用于 A* A 产生任意矩形矩阵的 SVD，并由 SVD 重组出极分解。"
description: "有限维矩阵分解笔记：PA=LU、thin QR、Cholesky、SVD 与 polar decomposition 的存在条件、唯一性边界、构造与核心证明，并说明 Schur 和 Jordan 在一般方阵理论中的位置。"
tags: ["Linear Algebra", "Matrix Factorization", "LU", "QR", "Cholesky", "SVD", "Polar Decomposition", "Numerical Linear Algebra", "Proof"]
categories: ["Crucible"]
math: true
---

# 线性代数 Part 6：LU、QR、Cholesky、SVD 与极分解

> [Part 5](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/) 证明了谱定理与正定结构。本篇把“矩阵可被简化”落实成五种分解。它们并非五套彼此无关的公式：LU 记录消元，QR 记录正交化，Cholesky 是正定矩阵的三角平方根，SVD 是 $A^*A$ 的谱定理，极分解则是 SVD 的重新分组。

仍在有限维空间中工作，底域为 $\mathbb F\in\{\mathbb R,\mathbb C\}$。复数情形用 $A^*$，实数情形把它读作 $A^{\mathsf T}$。

本篇的组织不是按名称罗列，而是按结构递进：

$$
\text{消元}
\longrightarrow
PA=LU,
$$

$$
\text{正交化}
\longrightarrow
A=QR,
$$

$$
\text{Hermitian 正定}
\longrightarrow
A=LL^*,
$$

$$
\text{任意矩形矩阵}
\longrightarrow
A=U\Sigma V^*
\longrightarrow
A=QH.
$$

---

## 1. 三角矩阵为什么适合求解

设 $L\in\mathbb F^{n\times n}$ 为下三角矩阵，且对角元都非零。方程

$$
Ly=b
$$

可以按 $i=1,2,\ldots,n$ 前向代入：

$$
y_i
=\frac{1}{l_{ii}}
\left(
b_i-\sum_{j=1}^{i-1}l_{ij}y_j
\right).
$$

上三角方程 $Ux=y$ 则按相反顺序回代：

$$
x_i
=\frac{1}{u_{ii}}
\left(
y_i-\sum_{j=i+1}^{n}u_{ij}x_j
\right).
$$

两次代入都只需 $O(n^2)$ 次标量运算。因此，把一般矩阵预先化成三角因子后，同一个 $A$ 对多个右端 $b$ 的求解会明显便宜。

---

## 2. LU：高斯消元的乘法记录

### 2.1 无换行 LU 的存在条件

**定理**：设 $A\in\mathbb F^{n\times n}$。如果它的所有顺序主子式都非零，

$$
\det A_{1:k,1:k}\ne0,
\qquad
k=1,\ldots,n,
$$

则存在唯一分解

$$
A=LU,
$$

其中 $L$ 为单位下三角矩阵，$U$ 为上三角矩阵。

这里“唯一”依赖 $L$ 的对角线固定为 $1$；若允许在两个因子的对角线之间任意搬动非零缩放，分解当然不唯一。

**存在性证明**：对维数作归纳。把矩阵分块为

$$
A=
\begin{pmatrix}
a_{11}&r^*\\
c&B
\end{pmatrix}.
$$

由第一个顺序主子式非零，$a_{11}\ne0$。定义

$$
\ell=\frac{c}{a_{11}},
\qquad
S=B-\frac{cr^*}{a_{11}}.
$$

于是

$$
A=
\begin{pmatrix}
1&0\\
\ell&I
\end{pmatrix}
\begin{pmatrix}
a_{11}&r^*\\
0&S
\end{pmatrix}.
$$

$S$ 是消去第一列后留下的 Schur complement。由块行列式公式，$S$ 的前 $k-1$ 阶顺序主子式满足

$$
\det S_{1:k-1,1:k-1}
=\frac{\det A_{1:k,1:k}}{a_{11}}
\ne0.
$$

归纳假设给出 $S=L_2U_2$。代回便得到 $A=LU$。证毕。

**唯一性证明**：若

$$
A=L_1U_1=L_2U_2,
$$

则

$$
L_2^{-1}L_1=U_2U_1^{-1}.
$$

左边是单位下三角，右边是上三角；同时属于这两类的矩阵只能是 $I$。故 $L_1=L_2$ 且 $U_1=U_2$。证毕。

### 2.2 为什么实际形式是 $PA=LU$

若当前主元为零或过小，直接消元会失败或放大舍入误差。用置换矩阵 $P$ 交换行后，可以把可用主元移到当前位置。

**定理（带行置换的 LU）**：对任意可逆方阵 $A$，存在置换矩阵 $P$、单位下三角矩阵 $L$ 与上三角矩阵 $U$，使

$$
PA=LU.
$$

**证明思路**：第一列非零，否则 $A$ 不可逆。选取一个非零元素换到第一行，再完成第一步消元；所得右下角 Schur complement 仍可逆。对它递归重复换行与消元，所有置换合并成 $P$，所有消元乘数进入 $L$，最终上三角结果进入 $U$。证毕。

在有限精度计算里通常选择当前列绝对值最大的候选主元，即 partial pivoting。分解是否存在是代数问题；主元如何选择则属于 [Part 8：条件数与数值稳定性](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)。

---

## 3. QR：把列空间换成标准正交坐标

设 $A\in\mathbb F^{m\times n}$，$m\ge n$，并假设 $A$ 满列秩。

**定理（thin QR）**：存在

$$
Q\in\mathbb F^{m\times n},
\qquad
R\in\mathbb F^{n\times n},
$$

使

$$
A=QR,
\qquad
Q^*Q=I_n,
$$

且 $R$ 为可逆上三角矩阵。如果再要求 $R$ 的对角元为正实数，则分解唯一。

### 3.1 存在性证明

把 $A$ 的列写作 $a_1,\ldots,a_n$。依次定义

$$
w_j
=a_j-\sum_{i=1}^{j-1}q_iq_i^*a_j,
$$

以及

$$
r_{jj}=\|w_j\|_2,
\qquad
q_j=\frac{w_j}{r_{jj}}.
$$

因为 $A$ 满列秩，$a_j$ 不在前 $j-1$ 列的张成空间中，所以 $w_j\ne0$，从而 $r_{jj}>0$。令

$$
r_{ij}=q_i^*a_j
\quad(i<j),
$$

则

$$
a_j=\sum_{i=1}^jr_{ij}q_i.
$$

把这些列等式合并，得到 $A=QR$；$q_i$ 的构造保证 $Q^*Q=I$，而 $r_{ij}=0$ 对 $i>j$ 成立，所以 $R$ 上三角。证毕。

这段证明使用 Gram–Schmidt 来展示结构。实际数值计算通常用 Householder 反射或 Givens 旋转构造 QR，因为它们更能维持有限精度下的正交性。

### 3.2 唯一性证明

若

$$
A=Q_1R_1=Q_2R_2
$$

且两个 $R_i$ 的对角元均为正，则

$$
Q_2^*Q_1=R_2R_1^{-1}.
$$

因为

$$
\operatorname{range}(Q_1)
=\operatorname{range}(A)
=\operatorname{range}(Q_2),
$$

两个 thin $Q$ 是同一个 $n$ 维子空间的两组标准正交基，所以 $Q_2^*Q_1$ 是酉矩阵。等式右边则是对角元为正的上三角矩阵。一个既酉又具有正对角元的上三角矩阵只能是 $I$：由第一列的单位长度先得首个对角元为 $1$，再逐列归纳可消去所有上三角非对角元。因此 $Q_1=Q_2$ 且 $R_1=R_2$。证毕。

### 3.3 QR 与最小二乘

对满列秩 $A$，考虑

$$
\min_x\|Ax-b\|_2.
$$

把 thin $Q$ 补成酉矩阵 $\widehat Q=(Q,Q_\perp)$。由酉不变性，

$$
\|Ax-b\|_2^2
=\left\|
\widehat Q^*(QRx-b)
\right\|_2^2
=\|Rx-Q^*b\|_2^2+\|Q_\perp^*b\|_2^2.
$$

第二项与 $x$ 无关，因此唯一极小点由上三角方程

$$
Rx=Q^*b
$$

给出。QR 不需要显式形成 $A^*A$，这正是它在最小二乘中兼具结构与稳定性的原因。

---

## 4. Cholesky：正定矩阵的三角平方根

**定理（Cholesky）**：对 Hermitian 方阵 $A\in\mathbb F^{n\times n}$，以下条件等价：

1. $A\succ0$；
2. 存在唯一的下三角矩阵 $L$，其对角元为正实数，并满足

$$
A=LL^*.
$$

### 4.1 $A=LL^*$ 蕴含正定

若 $L$ 下三角且对角元全正，则 $L$ 可逆。对任意 $x\ne0$，

$$
x^*Ax=x^*LL^*x=\|L^*x\|_2^2>0.
$$

所以 $A\succ0$。

### 4.2 正定蕴含分解存在

仍对维数归纳。把 $A$ 写成

$$
A=
\begin{pmatrix}
a&r^*\\
r&B
\end{pmatrix}.
$$

由正定性，取第一标准基得到 $a>0$。令

$$
\ell_{11}=\sqrt a,
\qquad
c=\frac r{\ell_{11}},
$$

以及 Schur complement

$$
S=B-cc^*=B-\frac{rr^*}{a}.
$$

$S$ 仍正定。事实上对任意 $y\ne0$，取

$$
x=
\begin{pmatrix}
-r^*y/a\\
y
\end{pmatrix},
$$

则 $x\ne0$，且直接展开得到

$$
x^*Ax=y^*Sy>0.
$$

归纳假设给出 $S=L_2L_2^*$，其中 $L_2$ 下三角且对角元全正。于是

$$
L=
\begin{pmatrix}
\ell_{11}&0\\
c&L_2
\end{pmatrix}
$$

满足 $A=LL^*$。证毕。

### 4.3 唯一性

若 $A=L_1L_1^*=L_2L_2^*$，令

$$
C=L_2^{-1}L_1.
$$

原等式推出

$$
C
=L_2^*(L_1^*)^{-1}
=(C^{-1})^*,
$$

因而

$$
CC^*=I.
$$

$C$ 是下三角、对角元为正的酉矩阵。酉矩阵的第一行单位长度迫使第一个对角元为 $1$；第一列单位长度再迫使其下方元素为零。逐阶归纳可得 $C=I$，从而 $L_1=L_2$。证毕。

Cholesky 不只是“对称版 LU”。它的存在条件正好等价于 Hermitian 正定；半正定但奇异时，标准算法可能遇到零对角元，需要带主元或低秩变体。

---

## 5. SVD：任意矩形矩阵的正交主轴

设 $A\in\mathbb F^{m\times n}$，不要求方阵、可逆或可对角化。

**定理（奇异值分解）**：存在酉矩阵

$$
U\in\mathbb F^{m\times m},
\qquad
V\in\mathbb F^{n\times n},
$$

以及矩形对角矩阵 $\Sigma\in\mathbb R^{m\times n}$，其对角元满足

$$
\sigma_1\ge\sigma_2\ge\cdots\ge\sigma_r>0,
$$

其余为零，使

$$
A=U\Sigma V^*.
$$

$\sigma_i$ 称为奇异值，且 $r=\operatorname{rank}(A)$。

### 5.1 从 $A^*A$ 推出 SVD

$A^*A$ Hermitian 半正定，因为

$$
x^*A^*Ax=\|Ax\|_2^2\ge0.
$$

由谱定理，存在标准正交基 $v_1,\ldots,v_n$ 与非负特征值，使

$$
A^*Av_i=\sigma_i^2v_i.
$$

对 $\sigma_i>0$，定义

$$
u_i=\frac{Av_i}{\sigma_i}.
$$

这些 $u_i$ 标准正交。因为对 $i,j\le r$，

$$
u_i^*u_j
=\frac{v_i^*A^*Av_j}{\sigma_i\sigma_j}
=\frac{\sigma_j^2v_i^*v_j}{\sigma_i\sigma_j}
=\delta_{ij}.
$$

并且

$$
Av_i=\sigma_i u_i.
$$

对 $\sigma_i=0$ 的右奇异向量，

$$
\|Av_i\|_2^2
=v_i^*A^*Av_i
=0,
$$

所以同样有 $Av_i=0$。

把 $u_1,\ldots,u_r$ 补成 $\mathbb F^m$ 的标准正交基，把 $v_1,\ldots,v_n$ 排成 $V$，便得到

$$
AV=U\Sigma,
$$

从而

$$
A=U\Sigma V^*.
$$

证毕。

### 5.2 四个立即推论

第一，非零奇异值个数等于秩：

$$
\operatorname{rank}(A)
=\operatorname{rank}(A^*A)
=r.
$$

第二，若 $A=0$，则 $r=0$ 且 $\|A\|_2=0$。若 $r\ge1$，谱范数是最大的正奇异值：

$$
\|A\|_2
=\max_{\|x\|_2=1}\|Ax\|_2
=\sigma_1.
$$

证明只需令 $z=V^*x$，则

$$
\|Ax\|_2^2
=\|\Sigma z\|_2^2
=\sum_i\sigma_i^2|z_i|^2
\le\sigma_1^2.
$$

取 $x=v_1$ 达到等号。

第三，Frobenius 范数满足

$$
\|A\|_F^2
=\operatorname{tr}(A^*A)
=\sum_{i=1}^r\sigma_i^2.
$$

第四，$A$ 可以展开为秩一矩阵之和：

$$
A=\sum_{i=1}^r\sigma_i u_i v_i^*.
$$

这条展开将在 Part 7 中导出最佳低秩近似，而在 Part 8 中导出条件数与谱正则化。

### 5.3 reduced SVD

只保留非零奇异值及对应向量，得到

$$
A=U_r\Sigma_rV_r^*,
$$

其中

$$
U_r\in\mathbb F^{m\times r},
\qquad
\Sigma_r\in\mathbb R^{r\times r},
\qquad
V_r\in\mathbb F^{n\times r}.
$$

这不是近似，而是与 full SVD 完全相同的精确矩阵；被删除的只是乘零奇异值的基向量。

---

## 6. 极分解：纯旋转与纯拉伸

对 $A\in\mathbb F^{m\times n}$，定义唯一的 PSD 矩阵

$$
H=(A^*A)^{1/2}\in\mathbb F^{n\times n}.
$$

**定理（polar decomposition）**：存在唯一的 canonical partial isometry $Q\in\mathbb F^{m\times n}$，使

$$
A=QH.
$$

$Q$ 的初始空间为 $\operatorname{range}(H)=\ker(A)^\perp$，终止空间为 $\operatorname{range}(A)$，并满足

$$
\ker(Q)=\ker(H)=\ker(A).
$$

也就是说，$Q$ 在 $\operatorname{range}(H)$ 上保持长度，并在 $\ker(H)$ 上严格取零。这个 canonical $Q$ 与 $H$ 都唯一。当 $m=n$ 且 $A$ 可逆时，$Q$ 本身就是唯一酉因子；当 $A$ 为奇异方阵时，只能把限制 $Q|_{\ker(H)^\perp}$ 延拓成酉矩阵：需要在 $\ker(H)$ 上用到 $\ker(A^*)$ 的酉对应替换 canonical $Q$ 的零作用，因此所得酉因子一般不唯一。

**证明**：取 SVD

$$
A=U\Sigma V^*.
$$

则

$$
A^*A=V\Sigma^*\Sigma V^*,
$$

所以

$$
H=V(\Sigma^*\Sigma)^{1/2}V^*.
$$

在奇异值非零的子空间上定义

$$
Qv_i=u_i,
$$

在 $\ker(H)$ 上定义为零，便有

$$
QHv_i
=Q(\sigma_i v_i)
=\sigma_i u_i
=Av_i
$$

对所有基向量成立，因此 $A=QH$。这个定义也证明了 canonical $Q$ 的唯一性：$A=QH$ 在 $\operatorname{range}(H)$ 上由 $H$ 的逆唯一决定 $Q$，而 $\ker(Q)=\ker(H)$ 又唯一规定了零空间上的取值。若 $A$ 为可逆方阵，则所有奇异值正，$Q=UV^*$ 酉且唯一，因为

$$
Q=AH^{-1}.
$$

证毕。

对奇异方阵，选择 $\ker(H)$ 到 $\ker(A^*)$ 的任意酉对应，并让它在 $\ker(H)^\perp$ 上与 canonical $Q$ 一致，就得到某个酉矩阵 $\widetilde Q$。严格地说，这是对限制 $Q|_{\ker(H)^\perp}$ 的延拓，而不是对整个 canonical $Q$ 的延拓。方阵 full SVD 给出其中一个选择：

$$
\widetilde Q=UV^*,
\qquad
H=V\Sigma V^*,
$$

于是

$$
A=\widetilde QH.
$$

$H$ 沿正交主轴作非负拉伸，$Q$ 再在可观测子空间上作刚性旋转。极分解由此成为复数极式“模长乘相位”的矩阵版本。

---

## 7. 分解之间的依赖关系

这些分解的适用范围可以压缩成一张表：

| 分解 | 输入假设 | 因子结构 | 核心来源 |
|---|---|---|---|
| $PA=LU$ | 可逆方阵 | 置换、下三角、上三角 | 带主元消元 |
| $A=QR$ | 本文取 $m\ge n$ 且满列秩的 thin QR | $Q$ 有标准正交列，$R$ 为可逆上三角 | 正交化 |
| $A=LL^*$ | Hermitian 正定 | 正对角下三角 | 正定 Schur complement |
| $A=U\Sigma V^*$ | 任意矩形矩阵 | 两侧酉、非负对角 | $A^*A$ 的谱定理 |
| $A=QH$ | 任意矩形矩阵 | 部分等距、PSD | SVD 重组 |

Schur 与 Jordan 不在这张“求解与几何分解”表里重复展开。它们解决的是一般方阵在**相似变换**下的标准形式：Schur 保住酉换基而得到上三角，Jordan 放弃正交性以得到理论上的相似标准型。完整定义与证明见 [Part 4：特征值、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)。

---

## 8. 本篇闭环

本篇可以浓缩为五个结构命题：

$$
\text{可逆方阵}
\Longrightarrow
PA=LU,
$$

$$
\text{满列秩}
\Longrightarrow
A=QR,
$$

$$
A\succ0
\Longleftrightarrow
A=LL^*,
$$

$$
\text{任意 }A
\Longrightarrow
A=U\Sigma V^*,
$$

$$
A=U\Sigma V^*
\Longrightarrow
A=Q(A^*A)^{1/2}.
$$

下一篇将不再追求精确重建，而是问：如果只能保留秩 $k$ 的信息，SVD 截断为什么在谱范数和 Frobenius 范数下同时最优？PCA、随机化 range finder、Nyström、NMF 与稀疏近似都从这个问题分叉。

[上一篇：Part 5——对称、正规、二次型与谱定理](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)

[下一篇：Part 7——低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/)

[返回：Part 0——矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)
