---
date: '2026-07-15T11:20:00+09:00'
draft: false
title: '线性代数 Part 3：线性方程、伪逆与最小范数解'
summary: "从 Ax=b 的可解性与唯一性开始，证明全部精确解和最小二乘解的结构；随后把 A 限制到零空间的正交补上，构造 Moore–Penrose 伪逆，并证明它给出唯一的最小范数最小二乘解。"
description: "有限维线性方程理论：Ax=b 的可解性、唯一性、通解、最小二乘解、最小范数解、Moore–Penrose 四条件、伪逆的坐标无关构造、满秩公式与 SVD 表达。"
tags: ["Linear Algebra", "Linear Equations", "Solvability", "Least Squares", "Minimum Norm", "Moore-Penrose Pseudoinverse", "SVD", "Proof"]
categories: ["Crucible"]
math: true
---

# 线性代数 Part 3：线性方程、伪逆与最小范数解

对

$$
A\in\mathbb F^{m\times n},
\qquad
b\in\mathbb F^m,
$$

方程 $Ax=b$ 并不总处于“存在唯一解”的理想状态。完整理论必须同时回答：

1. $b$ 是否是 $A$ 能够到达的输出；
2. 若能到达，输入是否唯一；
3. 若不能精确到达，哪个输入使残差最小；
4. 若最优输入仍不唯一，哪个输入的范数最小。

本篇的统一链条是：

$$
\mathcal C(A)\text{ 控制存在性}
\longrightarrow
\mathcal N(A)\text{ 控制唯一性}
\longrightarrow
\text{正交投影控制最小二乘}
\longrightarrow
A^+\text{ 选出唯一最小范数解}.
$$

全文仍约定 $\mathbb F\in\{\mathbb R,\mathbb C\}$，所有空间有限维，标准内积对第一变量线性，$A^*$ 表示共轭转置。

---

## 1. 精确方程的可解性

矩阵乘法把 $x$ 的坐标作为系数，对 $A$ 的列做线性组合。因此

$$
\{Ax:x\in\mathbb F^n\}=\mathcal C(A).
$$

**可解性定理**：以下条件等价：

1. $Ax=b$ 有解；
2. $b\in\mathcal C(A)$；
3. $b\perp\mathcal N(A^*)$；
4. $\operatorname{rank}[A\ b]=\operatorname{rank}A$。

**证明**：

第一条与第二条只是像空间的定义。

由 Part 2 的四基本子空间定理，

$$
\mathcal C(A)^\perp=\mathcal N(A^*).
$$

有限维下取两次正交补得到

$$
\mathcal C(A)=\mathcal N(A^*)^\perp,
$$

所以第二条与第三条等价。

增广矩阵 $[A\ b]$ 的列空间是

$$
\operatorname{span}\bigl(\mathcal C(A)\cup\{b\}\bigr).
$$

加入 $b$ 不增加这个空间的维数，当且仅当 $b$ 原本就在 $\mathcal C(A)$ 中。因此第二条与第四条等价。证毕。

第三个条件也可写成兼容条件：

$$
y^*b=0
\qquad
\text{对所有满足 }A^*y=0\text{ 的 }y.
$$

它说明左零空间给出了所有阻止 $b$ 被 $A$ 生成的线性约束。

---

## 2. 全部精确解与唯一性

**定理**：若 $x_0$ 是 $Ax=b$ 的一个特解，则全部解恰好是仿射子空间

$$
x_0+\mathcal N(A)
=
\{x_0+z:z\in\mathcal N(A)\}.
$$

**证明**：

若 $z\in\mathcal N(A)$，则

$$
A(x_0+z)=Ax_0+Az=b.
$$

反过来，若 $x$ 也是解，则

$$
A(x-x_0)=Ax-Ax_0=0,
$$

所以 $x-x_0\in\mathcal N(A)$。证毕。

**唯一性推论**：在方程可解的前提下，解唯一当且仅当

$$
\mathcal N(A)=\{0\}.
$$

由秩—零度定理，这又等价于

$$
\operatorname{rank}A=n,
$$

即 $A$ 列满秩。

所以存在性与唯一性由不同子空间控制：存在性看输出空间中的 $\mathcal C(A)$，唯一性看输入空间中的 $\mathcal N(A)$。

---

## 3. 无精确解时的广义问题

无论 $b$ 是否属于 $\mathcal C(A)$，都可以考虑

$$
\min_{x\in\mathbb F^n}\|Ax-b\|.
$$

Part 2 已经证明：最接近 $b$ 的列空间向量唯一，并且是

$$
p=P_{\mathcal C(A)}b.
$$

因此 $x$ 是最小二乘解，当且仅当

$$
Ax=p,
$$

也当且仅当满足正规方程

$$
A^*(Ax-b)=0.
$$

最小二乘解至少存在一个，因为 $p\in\mathcal C(A)$。但若 $\mathcal N(A)\ne\{0\}$，所有最小二乘解仍构成

$$
x_0+\mathcal N(A).
$$

于是需要再加一条选择原则：

$$
\text{在所有最小二乘解中，使 }\|x\|\text{ 最小}.
$$

接下来构造的伪逆会直接给出这个唯一向量。

---

## 4. 把不可逆映射限制成可逆映射

由四基本子空间的正交分解，

$$
\mathbb F^n
=
\mathcal N(A)^\perp\oplus\mathcal N(A).
$$

考虑 $A$ 在 $\mathcal N(A)^\perp$ 上的限制：

$$
A_0
=
A\big|_{\mathcal N(A)^\perp}
:
\mathcal N(A)^\perp
\longrightarrow
\mathcal C(A).
$$

**命题**：$A_0$ 是双射。

**证明**：

若 $x\in\mathcal N(A)^\perp$ 且 $A_0x=0$，则

$$
x\in\mathcal N(A)^\perp\cap\mathcal N(A)=\{0\},
$$

所以 $A_0$ 单射。

任取 $y\in\mathcal C(A)$，存在 $x\in\mathbb F^n$ 使 $Ax=y$。将 $x$ 正交分解为

$$
x=x_{\perp}+x_0,
\qquad
x_{\perp}\in\mathcal N(A)^\perp,
\quad
x_0\in\mathcal N(A).
$$

于是

$$
y=Ax=Ax_{\perp}=A_0x_{\perp}.
$$

所以 $A_0$ 满射。证毕。

这一步是伪逆的核心：$A$ 的不可逆性全部来自零空间。去掉零空间方向以后，$A$ 恰好成为

$$
\mathcal N(A)^\perp
\xrightarrow[\text{双射}]{A_0}
\mathcal C(A).
$$

---

## 5. Moore–Penrose 伪逆的构造

定义

$$
A^+
=
A_0^{-1}P_{\mathcal C(A)}
:
\mathbb F^m\to\mathbb F^n.
$$

它先把 $b$ 投影到 $A$ 真正能够到达的列空间，再用受限逆映射 $A_0^{-1}$ 拉回零空间正交补中的唯一输入。

由定义立刻得到两个投影恒等式。

### 5.1 输出投影

对任意 $b\in\mathbb F^m$，

$$
AA^+b
=
A_0A_0^{-1}P_{\mathcal C(A)}b
=
P_{\mathcal C(A)}b.
$$

所以

$$
AA^+=P_{\mathcal C(A)}.
$$

### 5.2 输入投影

把任意 $x\in\mathbb F^n$ 写成

$$
x=x_{\perp}+x_0,
\qquad
x_{\perp}\in\mathcal N(A)^\perp,
\quad
x_0\in\mathcal N(A).
$$

由于 $Ax=Ax_{\perp}\in\mathcal C(A)$，

$$
A^+Ax
=
A_0^{-1}Ax_{\perp}
=
x_{\perp}.
$$

所以

$$
A^+A=P_{\mathcal N(A)^\perp}
=
P_{\mathcal C(A^*)}.
$$

第二个等号来自

$$
\mathcal N(A)^\perp=\mathcal C(A^*).
$$

---

## 6. Moore–Penrose 四条件

由两个投影恒等式可得：

$$
AA^+A=A,
$$

$$
A^+AA^+=A^+,
$$

$$
(AA^+)^*=AA^+,
$$

$$
(A^+A)^*=A^+A.
$$

前两式来自投影在对应像空间上等于恒等映射；后两式来自正交投影自伴。

这四式称为 Moore–Penrose 条件。它们不只由上面的构造满足，而且能够唯一刻画 $A^+$。

**唯一性定理**：若线性映射 $B:\mathbb F^m\to\mathbb F^n$ 满足

$$
ABA=A,
\qquad
BAB=B,
$$

$$
(AB)^*=AB,
\qquad
(BA)^*=BA,
$$

则 $B=A^+$。

**证明**：

由 $ABA=A$，

$$
(AB)^2=ABAB=AB,
$$

所以 $AB$ 幂等；它又自伴，因此是正交投影。并且

$$
\mathcal C(AB)\subseteq\mathcal C(A),
$$

而对任意 $Ax\in\mathcal C(A)$，

$$
AB(Ax)=Ax.
$$

故 $\mathcal C(AB)=\mathcal C(A)$，从而

$$
AB=P_{\mathcal C(A)}.
$$

同理，$BA$ 是自伴幂等映射。它的核满足

$$
\mathcal N(BA)=\mathcal N(A):
$$

若 $Ax=0$，显然 $BAx=0$；若 $BAx=0$，则

$$
Ax=ABAx=0.
$$

因此 $BA$ 是以 $\mathcal N(A)$ 为核的正交投影，即

$$
BA=P_{\mathcal N(A)^\perp}.
$$

由 $B=BAB$ 可知

$$
\mathcal C(B)=\mathcal C(BA)=\mathcal N(A)^\perp.
$$

对任意 $b$，向量 $Bb$ 位于 $\mathcal N(A)^\perp$，并满足

$$
A(Bb)=ABb=P_{\mathcal C(A)}b.
$$

而 $A_0:\mathcal N(A)^\perp\to\mathcal C(A)$ 是双射，所以这样的向量唯一，必有

$$
Bb=A_0^{-1}P_{\mathcal C(A)}b=A^+b.
$$

故 $B=A^+$。证毕。

---

## 7. 伪逆给出的最小范数最小二乘解

定义

$$
x^\dagger=A^+b.
$$

**定理**：$x^\dagger$ 是唯一的最小范数最小二乘解，即

$$
x^\dagger
=
\underset{x}{\operatorname{argmin}}
\left\{
\|x\|:
x\in\underset{z}{\operatorname{argmin}}\ \|Az-b\|
\right\}.
$$

**证明**：

首先，

$$
Ax^\dagger
=
AA^+b
=
P_{\mathcal C(A)}b.
$$

因此 $x^\dagger$ 是最小二乘解。

任意其他最小二乘解 $x$ 产生同一个唯一投影点，所以

$$
Ax=Ax^\dagger.
$$

从而

$$
x=x^\dagger+z
\qquad
\text{其中 }z\in\mathcal N(A).
$$

另一方面，由 $A^+$ 的值域包含于 $\mathcal N(A)^\perp$，

$$
x^\dagger\perp z.
$$

Pythagoras 给出

$$
\|x\|^2
=
\|x^\dagger\|^2+\|z\|^2
\ge
\|x^\dagger\|^2.
$$

等号成立当且仅当 $z=0$，即 $x=x^\dagger$。证毕。

特别地，若原方程可解，则

$$
P_{\mathcal C(A)}b=b,
$$

所以 $A^+b$ 是全部精确解中范数最小的唯一解。

---

## 8. 三种满秩公式

### 8.1 方阵可逆

若 $A$ 可逆，则

$$
\mathcal N(A)=\{0\},
\qquad
\mathcal C(A)=\mathbb F^n.
$$

受限映射 $A_0$ 就是 $A$ 本身，两个投影都是恒等映射，因此

$$
A^+=A^{-1}.
$$

### 8.2 列满秩

若 $\operatorname{rank}A=n$，则 $A^*A$ 正定并可逆。Part 2 的唯一最小二乘解为

$$
x^\dagger=(A^*A)^{-1}A^*b.
$$

因为 $A^+b$ 对每个 $b$ 都是同一个唯一最小二乘解，所以

$$
A^+=(A^*A)^{-1}A^*.
$$

### 8.3 行满秩

若 $\operatorname{rank}A=m$，则 $AA^*$ 正定并可逆。令

$$
x=A^*(AA^*)^{-1}b.
$$

则

$$
Ax=AA^*(AA^*)^{-1}b=b,
$$

并且

$$
x\in\mathcal C(A^*)=\mathcal N(A)^\perp.
$$

所以 $x$ 是所有精确解中唯一位于零空间正交补的向量，也就是最小范数解。故

$$
A^+=A^*(AA^*)^{-1}.
$$

这些公式都是坐标无关构造在特殊秩条件下的化简，而不是伪逆的一般定义。

---

## 9. 与奇异值分解的接口

有限维奇异值分解写成

$$
A=U\Sigma V^*,
$$

其中 $U,V$ 为酉矩阵，$\Sigma$ 的非零对角元为

$$
\sigma_1,\ldots,\sigma_r>0,
\qquad
r=\operatorname{rank}A.
$$

若 $u_i,v_i$ 分别是对应的左右奇异向量，则

$$
Av_i=\sigma_i u_i
\qquad
(1\le i\le r),
$$

并且

$$
\mathcal C(A)=\operatorname{span}\{u_1,\ldots,u_r\},
$$

$$
\mathcal N(A)^\perp
=
\operatorname{span}\{v_1,\ldots,v_r\}.
$$

对任意 $b$，列空间投影是

$$
P_{\mathcal C(A)}b
=
\sum_{i=1}^r\langle b,u_i\rangle u_i.
$$

受限逆映射满足

$$
A_0^{-1}u_i=\frac1{\sigma_i}v_i.
$$

因此

$$
A^+b
=
\sum_{i=1}^r
\frac{\langle b,u_i\rangle}{\sigma_i}v_i.
$$

写成矩阵形式：

$$
A^+=V\Sigma^+U^*,
$$

其中

$$
\Sigma^+_{ii}
=
\begin{cases}
\sigma_i^{-1},&1\le i\le r,\\
0,&i>r.
\end{cases}
$$

这证明了 SVD 公式与前面的坐标无关定义完全一致：非零奇异方向被反向缩放，零奇异方向保持为零。

当 $r\ge1$ 时，可以直接读出

$$
\|A^+\|_2=\frac1{\sigma_r}.
$$

若 $A=0$，则 $r=0$、$A^+=0$，因而 $\|A^+\|_2=0$。对非零矩阵，最小非零奇异值越小，反解沿该方向的放大越强。这里先完成代数接口；奇异值分解的存在性、构造与稳定性含义将在后续分解篇完整证明。

---

## 总结与下一站

本篇把线性方程的各种情形统一成一个结论：

$$
x^\dagger=A^+b
$$

是唯一的最小范数最小二乘解，并满足

$$
AA^+=P_{\mathcal C(A)},
\qquad
A^+A=P_{\mathcal N(A)^\perp}.
$$

当 $b\in\mathcal C(A)$ 时，它是最小范数精确解；当 $b\notin\mathcal C(A)$ 时，它先把 $b$ 投影到列空间，再反解这个投影。

下一篇回到方阵 $A:V\to V$。核与像研究的是哪些方向被消去、哪些输出可达；特征理论则研究更细的问题：是否存在经过 $A$ 后只缩放而不离开自身张成直线的方向。

[上一篇：线性代数 Part 2——内积、正交投影与最小二乘](/notes/math/linear-algebra/note-la-2-inner-product-projection/)

[继续阅读：线性代数 Part 4——特征值、不变子空间、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)
