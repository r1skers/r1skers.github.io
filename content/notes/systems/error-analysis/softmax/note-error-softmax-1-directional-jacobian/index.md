---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: '误差分析 · Softmax 1：误差为什么有方向'
summary: "相同长度的输入误差可以被放大成完全不同的输出误差；operator norm、singular values 和 Jacobian 分别保留不同层次的信息。"
description: "从二维线性映射出发理解方向性误差、奇异值与局部 Jacobian，为 Softmax 的敏感方向建立几何语言。"
tags: ["Error Analysis", "Numerical Analysis", "Jacobian", "Singular Values"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 1
---

标量误差分析很容易形成一个直觉：输入差了 $\epsilon$，输出就按某个倍率差一点。但进入向量映射后，“差了多少”不再只由长度决定，还取决于方向。

比如说：

\[
A=
\begin{pmatrix}
3&0\\
0&0.5
\end{pmatrix}.
\]

沿第一坐标轴的单位误差被放大 $3$ 倍，沿第二坐标轴则只剩 $\frac{1}{2}$。同样是
长度为 $1$ 的输入误差，输出长度可以差六倍。

## 1. 放大倍数是方向的函数

令单位方向

\[
v(\theta)=(\cos\theta,\sin\theta)^T.
\]

经过 $A$ 后，

\[
Av(\theta)
=(3\cos\theta,0.5\sin\theta)^T,
\]

所以长度放大倍数为

\[
g(\theta)
=\|Av(\theta)\|_2
=\sqrt{9\cos^2\theta+0.25\sin^2\theta}.
\]

最大值 $3$ 在第一坐标轴取得，最小值 $0.5$ 在第二坐标轴取得。这个操作直觉上把单位圆扭成一条椭圆：椭圆主轴的方向告诉我们“往哪里最敏感”，轴长告诉我们“放大多少”。

## 2. Operator norm 只回答最坏情况

矩阵的 operator $2$-norm 定义为

\[
\|A\|_2
=\max_{\|v\|_2=1}\|Av\|_2.
\]

在这个例子里，

\[
\|A\|_2=3.
\]

它是一个很有用的安全结论：任意输入误差都不会被放大超过三倍。但只保留
$3$ 会丢掉另一条轴上的 $0.5$，也会丢掉两个轴的方向。

完整信息来自

\[
A^TA=
\begin{pmatrix}
9&0\\
0&0.25
\end{pmatrix}.
\]

$A^TA$ 的特征值是 $9$ 与 $0.25$，开平方得到 singular values：

\[
\sigma_1=3,
\qquad
\sigma_2=0.5.
\]

因此需要区分：

- operator norm：最大的 singular value，只保留最坏放大倍数；
- singular values：各条正交主方向上的放大倍数；
- singular vectors：这些倍率分别对应哪些输入和输出方向。



## 3. 非线性映射只能局部线性化

考虑

\[
f(x_1,x_2)=
\begin{pmatrix}
x_1^2\\
0.5x_2
\end{pmatrix}.
\]

它的 Jacobian 是

\[
J_f(x_1,x_2)=
\begin{pmatrix}
2x_1&0\\
0&0.5
\end{pmatrix}.
\]

在 $x=(1.5,0)$ 处，

\[
J_f(x)=
\begin{pmatrix}
3&0\\
0&0.5
\end{pmatrix}=A.
\]

于是刚才的椭圆直觉可以原样用于这个点附近。但它只是局部结论。令

\[
\Delta x=(h,k)^T,
\]

则精确输出变化为

\[
f(x+\Delta x)-f(x)=
\begin{pmatrix}
3h+h^2\\
0.5k
\end{pmatrix}.
\]

Jacobian 给出的线性部分是

\[
J_f(x)\Delta x=
\begin{pmatrix}
3h\\
0.5k
\end{pmatrix},
\]

遗漏的 remainder 为

\[
r(\Delta x)=
\begin{pmatrix}
h^2\\
0
\end{pmatrix}.
\]

因此 Jacobian 的正确解释是：

> 它是某个输入点附近，输入微小扰动到输出微小变化的最佳一阶线性地图。

它既不是全局不变的放大矩阵，也不能在有限扰动下自动消除 Taylor remainder。

## 4. 从这里进入 Softmax

Softmax 也是非线性向量映射。接下来关注：

1. 哪些 logits 方向完全不影响概率？
2. 哪些方向被放大得最多？
3. 这个局部最坏增益是否存在跨所有输入的全局界？
4. 概率变得不均匀以后，主方向会不会发生分裂？

这些问题都由 Softmax Jacobian 的零空间、特征向量和特征值回答。

---

**下一篇：** [Softmax 2：概率单纯形上的方向与谱](/notes/systems/error-analysis/softmax/note-error-softmax-2-geometry-spectrum/)
