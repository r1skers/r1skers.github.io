---
date: '2026-05-27T00:00:00+09:00'
draft: false
title: '线性代数 Part 0：矩阵、线性映射与坐标语言'
summary: "线性代数证明型系列的基础篇：从矩阵不是数表、而是线性映射在选定基下的坐标表示出发，给出 LA1–LA9 的静态阅读路线。"
description: "线性代数基础篇：矩阵、线性映射、基、坐标、复合与换基，以及 LA1–LA9 如何从同一个核心对象依次展开。"
tags: ["Mathematics", "Linear Algebra"]
categories: ["Notes"]
series: ["Linear Algebra"]
note_kind: "foundation"
math: true
aliases:
  - /notes/note-la-0-foundation/
---

# 线性代数笔记 Part 0：矩阵、线性映射与坐标语言

这一篇是整套线性代数笔记的地基。后面的正交、投影、特征值、SVD、PCA、最小二乘、正则化、条件数、优化、迭代法，都会不断回到这：

> 矩阵不是一张数表。矩阵是一个线性映射在选定基下的坐标表示。

如果只把矩阵看成数表，线性代数会变成很多孤立技巧：行变换、乘法公式、特征值公式、分解算法、最小二乘公式。它们当然都能算，但很难统一。

如果把矩阵看成线性映射的坐标表示，事情会变成另一种形状：

$$
\text{空间}
\longrightarrow
\text{线性映射}
\longrightarrow
\text{选基}
\longrightarrow
\text{矩阵}
\longrightarrow
\text{计算与解释}.
$$

这也是整套 LA0–LA9 系列从矩阵 $A$ 出发，再依次展开代数结构、几何、方程、谱、分解、近似、稳定性与计算的原因。

---

## 1. 从空间开始，而不是从数表开始

线性代数处理的第一对象不是矩阵，而是向量空间。

一个向量空间 $V$ 里有两种基本操作：

$$
u+v,\qquad c v.
$$

它们满足加法和数乘的规则。几何上，你可以把向量想成箭头、位移、状态、特征、信号、函数，甚至一张图片展平成的长向量。不同例子长得不一样，但只要能做线性组合，就进入了线性代数的世界。

所谓线性组合，就是

$$
c_1v_1+c_2v_2+\cdots+c_kv_k.
$$

线性代数最核心的问题之一是：

> 一个复杂对象，能不能由少数基本方向线性组合出来？

这句话会变成后面的很多概念：

- 张成：这些方向能覆盖多大的空间？
- 线性无关：这些方向有没有重复信息？
- 基：哪些方向既不重复，又能表达整个空间？
- 维数：表达这个空间至少需要多少个自由方向？
- 秩：一个线性映射真正保留下来的自由方向有多少？

所以，矩阵出现之前，空间和方向已经在场了。

---

## 2. 线性映射：保持线性组合的变化

设 $V,W$ 是两个向量空间。一个映射

$$
T:V\to W
$$

如果满足

$$
T(u+v)=T(u)+T(v),\qquad T(cv)=cT(v),
$$

就叫线性映射。

这两个条件可以合成一句：

$$
T(c_1v_1+\cdots+c_kv_k)
=c_1T(v_1)+\cdots+c_kT(v_k).
$$

也就是说，线性映射不会破坏线性组合。先组合再映射，和先映射再组合，结果一样。

这非常重要，因为它意味着：

> 只要知道 $T$ 如何作用在一组基上，就知道 $T$ 如何作用在整个空间上。

设 $V$ 的一组基是

$$
\mathcal B=(v_1,\ldots,v_n).
$$

任意向量 $x\in V$ 都能唯一写成

$$
x=c_1v_1+\cdots+c_nv_n.
$$

那么

$$
T(x)=c_1T(v_1)+\cdots+c_nT(v_n).
$$

所以，理解一个线性映射，不必逐个检查无穷多个向量。只要抓住基向量的像，整个映射就被确定了。

---

## 3. 选基之后，矩阵才出现

向量本身属于空间。坐标是向量在某组基下的表达。

如果

$$
x=c_1v_1+\cdots+c_nv_n,
$$

那么 $x$ 在基 $\mathcal B$ 下的坐标是

$$
[x]_{\mathcal B}=
\begin{pmatrix}
c_1\\
\vdots\\
c_n
\end{pmatrix}.
$$

坐标不是向量本身，而是向量相对于某组基的编号。

同理，矩阵也不是线性映射本身，而是线性映射相对于两组基的编号。

设

$$
T:V\to W,
$$

$V$ 的基是 $\mathcal B=(v_1,\ldots,v_n)$，$W$ 的基是 $\mathcal C=(w_1,\ldots,w_m)$。把每个 $T(v_j)$ 用 $\mathcal C$ 的坐标表示：

$$
[T(v_j)]_{\mathcal C}=
\begin{pmatrix}
a_{1j}\\
a_{2j}\\
\vdots\\
a_{mj}
\end{pmatrix}.
$$

把这些列向量并在一起，就得到矩阵

$$
[T]_{\mathcal C\leftarrow \mathcal B}=
\begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n}\\
a_{21} & a_{22} & \cdots & a_{2n}\\
\vdots & \vdots & \ddots & \vdots\\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}.
$$

这个矩阵的第 $j$ 列，就是第 $j$ 个输入基向量被 $T$ 送到输出空间后，在输出基下的坐标。

于是有核心公式：

$$
[T(x)]_{\mathcal C}=
[T]_{\mathcal C\leftarrow \mathcal B}[x]_{\mathcal B}.
$$

如果记

$$
A=[T]_{\mathcal C\leftarrow \mathcal B},
\qquad
\xi=[x]_{\mathcal B},
\qquad
\eta=[T(x)]_{\mathcal C},
$$

就得到熟悉的矩阵乘法形式：

$$
\eta=A\xi.
$$

这就是矩阵 $A$ 的本体论位置：它是 $T$ 的坐标化。

---

## 4. 矩阵乘法：线性映射的复合

如果

$$
V\xrightarrow{T}W\xrightarrow{S}U,
$$

那么可以先做 $T$，再做 $S$，得到复合映射

$$
S\circ T:V\to U.
$$

在线性映射层面，这是“先变一次，再变一次”。在矩阵层面，它变成矩阵乘法。

若

$$
A=[T],\qquad B=[S],
$$

那么

$$
[S\circ T]=BA.
$$

注意顺序：先作用的是 $A$，后作用的是 $B$，所以坐标上写成

$$
x\mapsto Ax\mapsto B(Ax)=(BA)x.
$$

因此矩阵乘法不是人为规定出来的数表运算，而是复合映射在坐标里的影子。

这也解释了为什么矩阵乘法通常不交换：

$$
BA\ne AB.
$$

因为“先旋转再投影”和“先投影再旋转”本来就不是同一个动作。

---

## 5. 换基：同一个映射，不同坐标

同一个向量，在不同基下坐标不同。同一个线性映射，在不同基下矩阵也不同。

设同一个空间 $V$ 里有两组基 $\mathcal B,\mathcal B'$。如果

$$
[x]_{\mathcal B}=P[x]_{\mathcal B'},
$$

那么 $P$ 是从新坐标到旧坐标的换基矩阵。

如果 $T:V\to V$ 是同一个线性映射，它在旧基 $\mathcal B$ 下的矩阵是 $A$，在新基 $\mathcal B'$ 下的矩阵是 $A'$，那么

$$
A'=P^{-1}AP.
$$

这个公式的意思不是“把矩阵变魔术”。它是在说：

$$
\text{新坐标}
\xrightarrow{P}
\text{旧坐标}
\xrightarrow{A}
\text{旧坐标下的结果}
\xrightarrow{P^{-1}}
\text{新坐标下的结果}.
$$

所以相似变换

$$
A'\sim A
$$

表达的是：矩阵不同，但背后的线性映射相同。

这会直接通向特征值、对角化、Jordan 标准型、Schur 分解和谱分解。它们本质上都在问：

> 能不能换一组更聪明的基，让同一个映射看起来更简单？

---

## 6. LA1–LA9 静态路线图

Part 0 负责统一语言，后续九篇按下面的依赖顺序展开：

1. [**LA1：向量空间、基、秩与四基本子空间**](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)：先确定线性映射的定义域、值域、核、像与秩。
2. [**LA2：内积、正交投影与最小二乘**](/notes/math/linear-algebra/note-la-2-inner-product-projection/)：在 LA1 的子空间语言上加入几何结构。
3. [**LA3：线性方程、伪逆与最小范数解**](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)：把可解性、最小二乘与非唯一解统一到 $A^+$。
4. [**LA4：特征值、不变子空间、Schur 与 Jordan**](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)：研究线性映射在自身作用下保持不变的方向与子空间。
5. [**LA5：对称、正规、二次型与谱定理**](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)：利用额外结构得到正交对角化与能量解释。
6. [**LA6：LU、QR、Cholesky、SVD 与极分解**](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)：把复杂映射拆成可解释、可计算的基本部分。
7. [**LA7：低秩近似、PCA 与结构化近似**](/notes/math/linear-algebra/note-la-7-low-rank-pca/)：从 SVD 进入最优近似与降维。
8. [**LA8：条件数、数值稳定性与正则化**](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)：区分问题敏感性、算法稳定性与正则化作用。
9. [**LA9：矩阵函数、迭代法与结构化计算**](/notes/math/linear-algebra/note-la-9-matrix-functions-iterative-structured/)：把谱与分解落实为大规模计算方法。

下面保留八种横向追问，作为这条顺序路线的主题索引；它们不再是另一套目录。

### 6.1 几何：这个映射怎样改变长度、角度和子空间？（LA2）

一旦空间里有了内积

$$
\langle u,v\rangle,
$$

就有长度

$$
\|v\|=\sqrt{\langle v,v\rangle},
$$

也有角度、正交、投影、距离。

几何支关心的是：

- $A$ 是否保持长度？
- $A$ 是否保持角度？
- 哪些方向被压扁？
- 哪些子空间彼此正交？
- 一个向量如何分解成子空间内部分和正交残差？

正交投影、四基本子空间、最小二乘，都会从这里出来。

### 6.2 结构：这个矩阵有什么内在形状？（LA5）

有些矩阵不是普通矩阵，它们带有额外结构。

比如正交矩阵满足

$$
Q^\top Q=I,
$$

对称矩阵满足

$$
A^\top=A,
$$

正定矩阵满足

$$
x^\top A x>0\quad (x\ne 0).
$$

结构支关心的是：

- 这个映射是否保长度？
- 它是否能由能量函数刻画？
- 它是否可对角化？
- 它是否低秩、稀疏、投影、正规？

结构越强，可解释性和可计算性通常越好。

### 6.3 分解：能不能把复杂映射拆成简单映射？（LA6）

矩阵分解的共同问题是：

> 一个复杂的 $A$，能不能拆成几个更容易理解或更容易计算的部分？

例如 SVD 写成

$$
A=U\Sigma V^\top.
$$

这句话的几何意思是：

$$
\text{先换到输入主方向}
\longrightarrow
\text{按奇异值缩放}
\longrightarrow
\text{转到输出主方向}.
$$

QR、LU、Cholesky、Schur、谱分解也类似。它们不是孤立算法，而是在用不同方式拆开同一个线性映射。

### 6.4 近似：如果不能完整保留，保留什么最重要？（LA7）

真实问题里，矩阵可能太大、太吵、太高维。

近似支关心的是：

- 能否用低秩矩阵逼近 $A$？
- 能否保留主要方向，丢掉噪声方向？
- 能否把高维数据投到低维子空间？
- 能否用随机化方法快速得到近似分解？

PCA 就是这条支路的重要节点。它把数据矩阵的主要变化方向提取出来，本质上依赖 SVD 和投影近似。

无监督学习里的聚类前表示，也接在这里：先理解表征空间的方向、尺度和邻域，再谈聚类。

### 6.5 稳定性：这个计算结果靠不靠谱？（LA8）

线性代数不只问能不能算，还问算出来是否可信。

方程

$$
Ax=b
$$

如果 $A$ 接近奇异，小扰动就可能被放大。条件数就是衡量这种敏感性的工具。

稳定性支关心的是：

- 输入扰动会被放大多少？
- 哪些方向是病态方向？
- 正则化如何牺牲一点精确性来换稳定性？
- 截断 SVD、Tikhonov、L1、early stopping 分别在压制什么不稳定性？

这条支路会把线性代数从“精确公式”带到“可靠计算”。

### 6.6 优化：很多问题其实是在最小化某个量（优化系列）

最小二乘问题

$$
\min_x \|Ax-b\|^2
$$

是优化和线性代数交汇的入口。

它可以从几何上理解为投影，也可以从微积分上写成法方程：

$$
A^\top A x=A^\top b.
$$

优化支关心的是：

- 目标函数的梯度是什么？
- Hessian 对应什么二次型？
- 凸性如何由正定性判断？
- 约束问题如何通过 KKT 条件表达？

也就是说，优化不是线性代数之外的东西。很多优化问题的骨架就是矩阵、内积、投影和正定性。

### 6.7 方程：什么时候有解，解有多少，哪个解最好？（LA1–LA3）

方程支从

$$
Ax=b
$$

出发。

核心问题是：

- $b$ 是否在 $A$ 的列空间里？
- 如果有解，是否唯一？
- 如果无解，哪个 $Ax$ 离 $b$ 最近？
- 如果解不唯一，哪个解范数最小？

这些问题会自然引出列空间、零空间、秩、伪逆、最小二乘和最小范数解。

方程不是单纯求 $x$。它是在问 $A$ 这个映射是否能把某个输入送到目标 $b$。

### 6.8 计算：如何真正把这些东西算出来？（LA6、LA9）

最后才是计算。

计算支关心的是：

- 行变换如何改变方程但不改变解集？
- 矩阵乘法如何组织复合映射？
- 消元为什么对应 LU 分解？
- QR 为什么适合最小二乘？
- Kronecker 积和 Hadamard 积分别表达什么结构？
- 迭代法如何在不显式求逆的情况下逼近答案？

计算不是低级技巧。它是把抽象结构落到有限步骤里的过程。

---

## 7. 基础词典

这一篇后面会反复用到下面几组词。

**向量与坐标**

向量是空间里的对象。坐标是向量在某组基下的数字表示。

**线性映射与矩阵**

线性映射是保持线性组合的函数。矩阵是线性映射在选定基下的坐标表示。

**列与基向量的像**

矩阵的第 $j$ 列，是第 $j$ 个输入基向量经过映射后的坐标。

**矩阵乘法与复合**

矩阵乘法对应线性映射的复合。先作用的矩阵写在右边。

**换基与相似**

换基改变坐标，不改变对象本身。相似矩阵表示同一个线性映射在不同基下的矩阵。

**秩与信息保留**

秩衡量一个线性映射真正输出的自由维度。秩下降意味着某些方向被压扁到一起。

**零空间与丢失方向**

零空间里的向量都会被送到 $0$。它描述映射完全丢掉了哪些方向。

**列空间与可达目标**

列空间是 $Ax$ 所有可能到达的地方。方程 $Ax=b$ 有解，当且仅当 $b$ 在列空间里。

---

## 8. 下一篇与完整顺序

这一篇只回答：

> 矩阵到底是什么？

下一篇是 [**LA1：向量空间、基、秩与四基本子空间**](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)。完整顺序为：

- [LA1：向量空间、基、秩与四基本子空间](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)；
- [LA2：内积、正交投影与最小二乘](/notes/math/linear-algebra/note-la-2-inner-product-projection/)；
- [LA3：线性方程、伪逆与最小范数解](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)；
- [LA4：特征值、不变子空间、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)；
- [LA5：对称、正规、二次型与谱定理](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)；
- [LA6：LU、QR、Cholesky、SVD 与极分解](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)；
- [LA7：低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/)；
- [LA8：条件数、数值稳定性与正则化](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)；
- [LA9：矩阵函数、迭代法与结构化计算](/notes/math/linear-algebra/note-la-9-matrix-functions-iterative-structured/)。

$$
\text{对象}
\longrightarrow
\text{映射}
\longrightarrow
\text{坐标}
\longrightarrow
\text{结构}
\longrightarrow
\text{计算}
\longrightarrow
\text{解释}.
$$

