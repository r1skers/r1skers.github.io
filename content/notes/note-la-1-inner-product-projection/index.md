---
date: '2026-05-27T00:20:00+09:00'
draft: false
title: '线性代数笔记 Part 1：内积、正交投影与最小二乘'
summary: "从内积开始建立线性代数的几何语言：范数、距离、角度、正交、正交补、四基本子空间、正交投影、投影矩阵、最小二乘和法方程。"
description: "线性代数推理链条的第一篇：内积如何产生范数、距离、角度和正交；正交投影为什么是最近点；最小二乘如何等价于把 b 投影到 A 的列空间。"
tags: ["Linear Algebra", "Inner Product", "Orthogonal Projection", "Least Squares", "Normal Equations"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-线性代数-内积正交投影与最小二乘/
---

# 线性代数笔记 Part 1：内积、正交投影与最小二乘

基础篇里，我们把矩阵 $A$ 解释为：

$$
\text{矩阵}
=
\text{线性映射在选定基下的坐标表示}.
$$

这一篇给这个坐标世界配上几何结构。没有内积时，向量空间只知道“线性组合”。有了内积以后，我们才开始谈长度、距离、角度、正交、投影和最小二乘（希尔伯特空间）。

这条推理链是：

$$
\text{内积}
\longrightarrow
\text{范数}
\longrightarrow
\text{距离与角度}
\longrightarrow
\text{正交}
\longrightarrow
\text{正交投影}
\longrightarrow
\text{最小二乘}.
$$

PCA、低秩近似、SVD 的几何解释都会踩在这条链上。所以在进入 PCA 之前，先把投影和最小二乘钉稳。

---

## 1. 为什么从内积开始

一个普通向量空间只允许你做两件事：

$$
u+v,\qquad cv.
$$

这足够定义线性组合、子空间、基、维数和线性映射，但还不够回答几何问题。

比如下面这些问题，在没有额外结构时都没有自然答案：

- 一个向量有多长？
- 两个向量之间有多远？
- 两个方向夹角是多少？
- 一个向量是否垂直于另一个向量？
- 哪个子空间里的点离 $b$ 最近？

内积就是给向量空间加上的“几何传感器”。它让空间不只会线性组合，还能比较方向、长度和误差。

在 $\mathbb R^n$ 里最常用的内积是点积：

$$
\langle x,y\rangle=x^\top y=\sum_{i=1}^n x_i y_i.
$$

一旦有了这个量，几何的问题就可以开始研究了。

---

## 2. 内积

内积是一个把两个向量送到一个数的运算：

$$
\langle \cdot,\cdot\rangle:V\times V\to \mathbb R.
$$

在实向量空间里，它满足三条核心性质。

第一，对第一个变量线性：

$$
\langle au+bv,w\rangle
=
a\langle u,w\rangle+b\langle v,w\rangle.
$$

第二，对称：

$$
\langle u,v\rangle=\langle v,u\rangle.
$$

第三，正定：

$$
\langle v,v\rangle\ge 0,
\qquad
\langle v,v\rangle=0 \Longleftrightarrow v=0.
$$

这三条分别对应三种直觉：

- 线性：比较方向时兼容线性组合；
- 对称：$u$ 看 $v$ 和 $v$ 看 $u$ 是同一个相似度；
- 正定：一个非零向量一定有正长度。

矩阵语言里，很多内积可以写成

$$
\langle x,y\rangle_M=x^\top M y,
$$

其中 $M$ 是对称正定矩阵。普通点积对应 $M=I$。

这提示我们：几何也可以被矩阵改变。不同的 $M$ 会定义不同的长度、角度和距离。后面的 whitening、正则化、二次型都会用到这个视角。

---

## 3. 范数

有了内积，就可以定义长度：

$$
\|v\|=\sqrt{\langle v,v\rangle}.
$$

在 $\mathbb R^n$ 的标准内积下，

$$
\|v\|_2=\sqrt{v_1^2+\cdots+v_n^2}.
$$

范数告诉我们向量有多大。它满足：

$$
\|v\|\ge 0,\qquad
\|v\|=0\Longleftrightarrow v=0,
$$

$$
\|cv\|=|c|\,\|v\|,
$$

以及三角不等式：

$$
\|u+v\|\le \|u\|+\|v\|.
$$

范数不一定来自内积。比如 $\ell_1$ 范数

$$
\|x\|_1=|x_1|+\cdots+|x_n|
$$

也很重要，它会通向稀疏性和 L1 正则化。

但这一篇主要关注由内积诱导的二范数，因为正交、投影、最小二乘、PCA 都首先建立在二范数几何上。

---

## 4. 距离与角度

距离由范数给出：

$$
d(u,v)=\|u-v\|.
$$

角度由内积给出。若 $u,v\ne 0$，定义

$$
\cos\theta
=
\frac{\langle u,v\rangle}{\|u\|\|v\|}.
$$

这个公式背后的关键不等式是 Cauchy-Schwarz：

$$
|\langle u,v\rangle|
\le
\|u\|\|v\|.
$$

它保证上面的比值总在 $[-1,1]$ 之间，因此角度有意义。

从机器学习角度看，点积和 cosine similarity 已经在这里出现了：

$$
\operatorname{cos}(u,v)
=
\frac{u^\top v}{\|u\|_2\|v\|_2}.
$$

如果所有向量都被归一化到单位球面上，那么点积就是 cosine similarity。这是 CLIP、文本 embedding、spherical KMeans 里常见的球面几何入口。

---

## 5. 正交

两个向量正交，意思是内积为零：

$$
u\perp v
\Longleftrightarrow
\langle u,v\rangle=0.
$$

正交不是“看起来垂直”的图像直觉，而是内积给出的代数条件。

正交最重要的性质是 Pythagoras：

如果 $u\perp v$，那么

$$
\|u+v\|^2=\|u\|^2+\|v\|^2.
$$

证明：

$$
\|u+v\|^2
=
\langle u+v,u+v\rangle
=
\|u\|^2+2\langle u,v\rangle+\|v\|^2.
$$

当 $\langle u,v\rangle=0$ 时，中间项消失。

所以正交的意义是：它让误差可以被干净拆开。最小二乘、投影、PCA 的误差分解都依赖这个事实。

---

## 6. 正交补与四基本子空间

设 $S$ 是内积空间 $V$ 的一个子空间。所有与 $S$ 中每个向量都正交的向量，构成 $S$ 的正交补：

$$
S^\perp=\{v\in V:\langle v,s\rangle=0,\ \forall s\in S\}.
$$

如果 $S$ 是有限维内积空间的子空间，那么每个向量 $v$ 都可以唯一分解为

$$
v=s+r,
\qquad
s\in S,\ r\in S^\perp.
$$

这句话是投影的基础：$s$ 是 $v$ 在 $S$ 里的部分，$r$ 是垂直于 $S$ 的残差。

对矩阵 $A\in\mathbb R^{m\times n}$，有四个基本子空间：

- 列空间 $\mathcal C(A)\subseteq \mathbb R^m$；
- 左零空间 $\mathcal N(A^\top)\subseteq \mathbb R^m$；
- 行空间 $\mathcal C(A^\top)\subseteq \mathbb R^n$；
- 零空间 $\mathcal N(A)\subseteq \mathbb R^n$。

它们成对正交：

$$
\mathcal C(A)^\perp=\mathcal N(A^\top),
\qquad
\mathcal C(A^\top)^\perp=\mathcal N(A).
$$

这个结构在解方程 $Ax=b$ 时变得非常清楚：

- $Ax$ 永远落在列空间 $\mathcal C(A)$；
- 如果 $b$ 不在列空间里，方程无解；
- 但可以找列空间中离 $b$ 最近的点；
- 这就是最小二乘。

---

## 7. 正交投影

设 $S$ 是内积空间里的一个子空间。给定向量 $b$，我们想找 $S$ 中离 $b$ 最近的向量：

$$
\min_{s\in S}\|b-s\|.
$$

这个最近点叫 $b$ 在 $S$ 上的正交投影，记作

$$
\operatorname{Proj}_S(b).
$$

设

$$
p=\operatorname{Proj}_S(b),
\qquad
r=b-p.
$$

投影的核心条件是：

$$
r\perp S.
$$

也就是说，最近点 $p$ 不只是“距离小”，而是让残差 $r$ 垂直于整个子空间。

为什么这是最近点？对任何 $s\in S$，

$$
b-s=(b-p)+(p-s).
$$

其中 $b-p\in S^\perp$，而 $p-s\in S$，所以两部分正交。于是

$$
\|b-s\|^2
=
\|b-p\|^2+\|p-s\|^2
\ge
\|b-p\|^2.
$$

所以 $p$ 是唯一最近点。

这就是投影的几何本质：

> 最近点由“残差正交”刻画。

---

## 8. 投影矩阵

如果子空间 $S\subseteq\mathbb R^m$ 由矩阵 $A$ 的列张成，即

$$
S=\mathcal C(A),
$$

那么把 $b$ 投影到 $S$ 上，可以写成

$$
p=Pb,
$$

其中 $P$ 是投影矩阵。

投影矩阵最核心的代数性质是幂等：

$$
P^2=P.
$$

意思是投影一次以后已经在子空间里，再投影一次不会改变。

如果 $P$ 是正交投影矩阵，还满足对称：

$$
P^\top=P.
$$

若 $A$ 的列线性无关，则到列空间 $\mathcal C(A)$ 的正交投影矩阵是

$$
P=A(A^\top A)^{-1}A^\top.
$$

这个公式很重要，但它不是投影的定义。投影的定义仍然是“找最近点”，公式只是把最近点写成矩阵计算。

---

## 9. 最小二乘

现在看方程

$$
Ax=b.
$$

如果 $b\in\mathcal C(A)$，方程有解。因为存在某个 $x$，使得 $Ax$ 正好等于 $b$。

但如果 $b\notin\mathcal C(A)$，方程无解。此时我们退一步，找一个 $Ax$，让它尽量接近 $b$：

$$
\min_x \|Ax-b\|^2.
$$

这就是最小二乘。

几何上，所有可能的 $Ax$ 组成列空间 $\mathcal C(A)$。最小二乘就是把 $b$ 投影到 $\mathcal C(A)$ 上：

$$
p=A\hat x
=
\operatorname{Proj}_{\mathcal C(A)}(b).
$$

残差是

$$
r=b-A\hat x.
$$

投影条件告诉我们：

$$
r\perp \mathcal C(A).
$$

所以最小二乘的本质不是“平方误差公式”，而是：

> 让残差垂直于所有可达方向。

---

## 10. 法方程

如果残差

$$
r=b-A\hat x
$$

垂直于 $A$ 的每一列，那么

$$
A^\top r=0.
$$

代入 $r=b-A\hat x$：

$$
A^\top(b-A\hat x)=0.
$$

整理得到法方程：

$$
A^\top A\hat x=A^\top b.
$$

这就是最小二乘的代数形式。

如果 $A$ 的列线性无关，$A^\top A$ 可逆，于是

$$
\hat x=(A^\top A)^{-1}A^\top b.
$$

对应的投影点是

$$
p=A\hat x
=
A(A^\top A)^{-1}A^\top b.
$$

因此投影矩阵又出现了：

$$
P=A(A^\top A)^{-1}A^\top.
$$

但这里要埋下一个稳定性提醒：实际数值计算里，直接解法方程常常不是最稳的做法，因为 $A^\top A$ 会放大条件数。后面会用 QR、SVD 和正则化重新处理这个问题。

---

## 11. 最小二乘优化

最小二乘也可以从优化角度看。

定义目标函数

$$
f(x)=\frac12\|Ax-b\|^2.
$$

展开为

$$
f(x)
=
\frac12(Ax-b)^\top(Ax-b).
$$

它的梯度是

$$
\nabla f(x)=A^\top(Ax-b).
$$

令梯度为零：

$$
A^\top(Ax-b)=0.
$$

这还是法方程：

$$
A^\top A x=A^\top b.
$$

所以同一个对象有三种视角：

- 几何视角：把 $b$ 投影到列空间；
- 方程视角：残差垂直于列空间；
- 优化视角：平方误差目标的梯度为零。

这三种说法不是三个知识点，而是同一件事的三种坐标。

---

## 12. 投影近似

投影不只用来解无解方程，也是一种近似思想。

给定一个复杂对象 $b$，如果我们只允许使用子空间 $S$ 里的向量来表示它，那么最佳近似就是

$$
\operatorname{Proj}_S(b).
$$

误差是正交残差：

$$
b-\operatorname{Proj}_S(b)\in S^\perp.
$$

这给出一个非常普遍的模板：

$$
\text{原对象}
=
\text{可表示部分}
+
\text{正交误差}.
$$

后面的低秩近似和 PCA 会把这个模板从“一个向量投影到一个子空间”推广到“一批数据投影到一个低维子空间”。

如果数据矩阵是

$$
X=
\begin{pmatrix}
- & x_1^\top & -\\
  & \vdots &  \\
- & x_N^\top & -
\end{pmatrix},
$$

那么 PCA 要问的是：

> 找哪个 $k$ 维子空间，能让所有样本投影后的总重构误差最小？

也就是

$$
\min_{\dim S=k}\sum_{i=1}^N
\|x_i-\operatorname{Proj}_S(x_i)\|^2.
$$

这就是 PCA 和本篇的连接点。

---

## 13. 这一篇接到 PCA 哪里

PCA 不是突然出现的机器学习技巧。它是投影近似的自然下一步。

本篇已经建立了三件事：

- 内积给出长度、距离、角度和正交；
- 正交投影给出子空间里的最近点；
- 最小二乘把“无解方程”改写成“到列空间的最近点”。

下一篇进入低秩近似、SVD 与 PCA 时，只需要把问题从一个向量 $b$ 推广到一批数据点：

$$
\text{一个向量到子空间的投影}
\longrightarrow
\text{一批样本到低维子空间的投影}.
$$

于是 PCA 的两个经典解释会自然合流：

- 最大方差：保留数据变化最大的方向；
- 最小重构误差：让投影损失最小。

这两种说法最终都会由 SVD 统一。
