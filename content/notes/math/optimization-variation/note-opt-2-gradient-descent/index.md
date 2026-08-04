---
date: '2026-07-15T12:20:00+09:00'
draft: false
title: '优化与变分 Part 2：梯度下降、收敛率与谱滤波'
summary: "从 L-光滑性证明下降引理，再分析固定步长梯度下降：一般光滑目标得到驻点复杂度，凸目标得到 O(1/k) 函数值速率，强凸目标得到线性收敛；最后在线性最小二乘中推导 early stopping 的奇异值滤波公式。"
description: "梯度下降证明型笔记：下降引理、步长范围、非凸梯度范数界、凸 O(1/k) 收敛率、强凸线性收敛、最优固定步长，以及 early stopping 在线性最小二乘中的谱正则化解释。"
tags: ["Mathematics", "Optimization", "Numerical Methods"]
categories: ["Notes"]
series: ["Optimization and Variational Methods"]
note_kind: "foundation"
math: true
---

# 优化与变分 Part 2：梯度下降、收敛率与谱滤波

梯度下降的固定步长形式是

$$
x_{k+1}
\mathrel{=}
x_k-\eta\nabla f(x_k).
$$

负梯度确实是一阶下降最陡方向，但这只是一条局部陈述。有限步长 $\eta$ 会把点送到别处；要保证新点的函数值可控，必须知道梯度在这段距离内变化多快。

本篇的证明链是：

$$
L\text{-光滑}
\longrightarrow
\text{下降引理}
\longrightarrow
\text{单步下降}
\longrightarrow
\begin{cases}
\text{一般目标：驻点界},\\
\text{凸目标：}O(k^{-1}),\\
\text{强凸目标：线性收敛}.
\end{cases}
$$

最后把同一迭代放到线性最小二乘的 SVD 坐标中，证明有限迭代次数本身就是一个谱滤波参数。

除特别说明外，设 $f:\mathbb R^n\to\mathbb R$ 可微且 $L$-光滑：

$$
\|\nabla f(x)-\nabla f(y)\|
\le
L\|x-y\|.
$$

---

## 1. 负梯度为什么是最陡下降方向

在单位方向集合 $\|v\|=1$ 上，一阶变化率为

$$
D_vf(x)=\nabla f(x)^\top v.
$$

由 Cauchy–Schwarz，

$$
\nabla f(x)^\top v
\ge
-\|\nabla f(x)\|\,\|v\|
\mathrel{=}
-\|\nabla f(x)\|.
$$

当 $\nabla f(x)\ne0$ 时，等号由

$$
v=-\frac{\nabla f(x)}{\|\nabla f(x)\|}
$$

达到。因此在 Euclidean 范数下，负梯度是单位长度方向中一阶下降最快的方向。

这一定理只决定方向，不决定步长。步长由光滑性控制。

---

## 2. 下降引理

**定理**：若 $f$ 为 $L$-光滑，则对任意 $x,y\in\mathbb R^n$，

$$
f(y)
\le
f(x)+\nabla f(x)^\top(y-x)
+
\frac L2\|y-x\|^2.
$$

**证明**：

令

$$
d=y-x.
$$

由沿线段的一阶 Taylor 积分公式，

$$
f(y)-f(x)
\mathrel{=}
\int_0^1
\nabla f(x+td)^\top d\,dt.
$$

加减 $\nabla f(x)$：

$$
\begin{aligned}
f(y)-f(x)
&=
\nabla f(x)^\top d\\
&\quad+
\int_0^1
\bigl(\nabla f(x+td)-\nabla f(x)\bigr)^\top d\,dt.
\end{aligned}
$$

由 Cauchy–Schwarz 与梯度 Lipschitz 条件，

$$
\begin{aligned}
\bigl(\nabla f(x+td)-\nabla f(x)\bigr)^\top d
&\le
\|\nabla f(x+td)-\nabla f(x)\|\,\|d\|\\
&\le
Lt\|d\|^2.
\end{aligned}
$$

积分得到

$$
\int_0^1Lt\|d\|^2\,dt
\mathrel{=}
\frac L2\|d\|^2.
$$

代回即得下降引理。证毕。

下降引理不是凸性结论；它只用梯度的 Lipschitz 连续性，因此也适用于非凸光滑函数。

---

## 3. 梯度步的单步下降

令

$$
g_k=\nabla f(x_k),
\qquad
x_{k+1}=x_k-\eta g_k.
$$

在下降引理中取 $y=x_k-\eta g_k$：

$$
\begin{aligned}
f(x_{k+1})
&\le
f(x_k)-\eta\|g_k\|^2
+
\frac L2\eta^2\|g_k\|^2\\
&=
f(x_k)
\mathbin{-}
\eta\left(1-\frac{L\eta}{2}\right)
\|g_k\|^2.
\end{aligned}
$$

所以当

$$
0\lt\eta\lt\frac2L
$$

时，只要 $g_k\ne0$，该上界就保证严格下降。

最常用的选择是

$$
\eta=\frac1L,
$$

此时

$$
f(x_{k+1})
\le
f(x_k)-\frac1{2L}\|g_k\|^2.
$$

这是后续三个速率证明共同的单步不等式。

---

## 4. 一般光滑目标：先收敛到驻点意义

这一节不假设凸性，只假设 $f$ 有下界

$$
f_{\inf}>-\infty.
$$

采用 $\eta=1/L$，把单步下降从 $k=0$ 加到 $K-1$：

$$
f(x_K)
\le
f(x_0)
\mathbin{-}
\frac1{2L}
\sum_{k=0}^{K-1}\|\nabla f(x_k)\|^2.
$$

由 $f(x_K)\ge f_{\inf}$，

$$
\sum_{k=0}^{K-1}\|\nabla f(x_k)\|^2
\le
2L\bigl(f(x_0)-f_{\inf}\bigr).
$$

因此

$$
\min_{0\le k\lt K}
\|\nabla f(x_k)\|^2
\le
\frac{
2L\bigl(f(x_0)-f_{\inf}\bigr)
}{K}.
$$

这说明为了找到某次迭代满足

$$
\|\nabla f(x_k)\|\le\varepsilon,
$$

该证明给出的迭代复杂度是

$$
K=O(\varepsilon^{-2}).
$$

这里得到的是小梯度点，而不是全局极小点。没有凸性时，驻点可能具有不同的二阶类型。

---

## 5. 凸目标：函数值的 $O(1/k)$ 速率

现在额外假设 $f$ 凸，并且存在全局极小点 $x^\star$。仍取

$$
\eta=\frac1L.
$$

**定理**：对所有 $K\ge1$，

$$
f(x_K)-f(x^\star)
\le
\frac{L\|x_0-x^\star\|^2}{2K}.
$$

**证明**：

先展开到最优点的距离：

$$
\begin{aligned}
\|x_{k+1}-x^\star\|^2
&=
\left\|
x_k-x^\star-\frac1L g_k
\right\|^2\\
&=
\|x_k-x^\star\|^2
\mathbin{-}
\frac2L g_k^\top(x_k-x^\star)
+
\frac1{L^2}\|g_k\|^2.
\end{aligned}
$$

凸性的一阶判据给出

$$
g_k^\top(x_k-x^\star)
\ge
f(x_k)-f(x^\star).
$$

单步下降式又给出

$$
\frac1{L^2}\|g_k\|^2
\le
\frac2L
\bigl(f(x_k)-f(x_{k+1})\bigr).
$$

合并两式：

$$
\begin{aligned}
\|x_{k+1}-x^\star\|^2
&\le
\|x_k-x^\star\|^2\\
&\quad-
\frac2L
\bigl(f(x_{k+1})-f(x^\star)\bigr).
\end{aligned}
$$

移项并从 $k=0$ 加到 $K-1$：

$$
\sum_{k=0}^{K-1}
\bigl(f(x_{k+1})-f(x^\star)\bigr)
\le
\frac L2\|x_0-x^\star\|^2.
$$

函数值沿迭代不增，所以

$$
f(x_{k+1})-f(x^\star)
\ge
f(x_K)-f(x^\star)
$$

对所有 $k\lt K$ 成立。于是

$$
K\bigl(f(x_K)-f(x^\star)\bigr)
\le
\frac L2\|x_0-x^\star\|^2.
$$

除以 $K$ 即得结论。证毕。

凸性在这个证明中的作用非常具体：它把梯度与全局函数值差联系起来。没有这条联系，第四节只能控制梯度范数。

---

## 6. 强凸目标：线性收敛

进一步假设 $f$ 为 $\mu$-强凸，其中 $\mu>0$。先从强凸性推出一个梯度下界。

### 6.1 强凸推出 Polyak–Łojasiewicz 不等式

**命题**：若 $f$ 为 $\mu$-强凸，$x^\star$ 为其唯一极小点，则

$$
\|\nabla f(x)\|^2
\ge
2\mu\bigl(f(x)-f(x^\star)\bigr).
$$

**证明**：

强凸性对任意 $y$ 给出

$$
f(y)
\ge
f(x)+\nabla f(x)^\top(y-x)
+
\frac\mu2\|y-x\|^2.
$$

把右侧看作关于 $y$ 的二次函数。其最小点是

$$
y=x-\frac1\mu\nabla f(x),
$$

最小值为

$$
f(x)-\frac1{2\mu}\|\nabla f(x)\|^2.
$$

因此对所有 $y$，特别是 $y=x^\star$，

$$
f(x^\star)
\ge
f(x)-\frac1{2\mu}\|\nabla f(x)\|^2.
$$

整理即得结论。证毕。

### 6.2 函数值线性率

采用 $\eta=1/L$。由单步下降和刚证明的不等式，

$$
\begin{aligned}
f(x_{k+1})-f(x^\star)
&\le
f(x_k)-f(x^\star)
\mathbin{-}
\frac1{2L}\|\nabla f(x_k)\|^2\\
&\le
\left(1-\frac\mu L\right)
\bigl(f(x_k)-f(x^\star)\bigr).
\end{aligned}
$$

归纳得到

$$
f(x_k)-f(x^\star)
\le
\left(1-\frac\mu L\right)^k
\bigl(f(x_0)-f(x^\star)\bigr).
$$

因为

$$
0\le1-\frac\mu L\lt1
$$

所以误差按几何级数衰减；$\mu=L$ 时该上界退化为一步到达的零因子。条件数

$$
\kappa=\frac L\mu
$$

越大，因子 $1-1/\kappa$ 越接近 $1$，一阶法越慢。

### 6.3 一般保守步长

若

$$
0\lt\eta\le\frac1L,
$$

单步下降与强凸梯度下界给出

$$
f(x_{k+1})-f(x^\star)
\le
\left[
1-2\mu\eta
\left(1-\frac{L\eta}{2}\right)
\right]
\bigl(f(x_k)-f(x^\star)\bigr).
$$

也就是

$$
f(x_{k+1})-f(x^\star)
\le
\bigl(1-2\mu\eta+\mu L\eta^2\bigr)
\bigl(f(x_k)-f(x^\star)\bigr).
$$

这条式子明确展示：在该证明框架里，过小的 $\eta$ 也会让收敛因子接近 $1$。

---

## 7. Hessian 谱界下的距离收缩

若进一步假设 $f\in C^2$ 且

$$
\mu I
\preceq
\nabla^2f(x)
\preceq
LI
$$

处处成立，可以直接分析迭代映射的距离收缩。

因为 $\nabla f(x^\star)=0$，微积分基本定理给出

$$
\nabla f(x_k)
\mathrel{=}
\overline H_k(x_k-x^\star),
$$

其中

$$
\overline H_k
\mathrel{=}
\int_0^1
\nabla^2f\bigl(x^\star+t(x_k-x^\star)\bigr)\,dt.
$$

Loewner 序在积分下保持，所以

$$
\mu I\preceq\overline H_k\preceq LI.
$$

令 $e_k=x_k-x^\star$，则

$$
e_{k+1}
\mathrel{=}
(I-\eta\overline H_k)e_k.
$$

由于 $\overline H_k$ 对称，其特征值都在 $[\mu,L]$ 内，故

$$
\|e_{k+1}\|
\le
q(\eta)\|e_k\|,
$$

其中

$$
q(\eta)
\mathrel{=}
\max_{\lambda\in[\mu,L]}
|1-\eta\lambda|
\mathrel{=}
\max\{|1-\eta\mu|,\ |1-\eta L|\}.
$$

当

$$
0\lt\eta\lt\frac2L
$$

时 $q(\eta)\lt1$。使两个端点误差绝对值相等，得到最优固定步长

$$
\eta_\star=\frac2{L+\mu},
$$

以及距离收缩因子

$$
q(\eta_\star)
\mathrel{=}
\frac{L-\mu}{L+\mu}
\mathrel{=}
\frac{\kappa-1}{\kappa+1}.
$$

这条更精细的结论显式使用了 $C^2$ 与 Hessian 的逐点谱界；上一节的函数值证明只需要强凸与梯度 Lipschitz。

---

## 8. 线性最小二乘中的谱滤波

现在考虑

$$
f(x)=\frac12\|Ax-b\|^2,
$$

其中 $A\in\mathbb R^{m\times n}$。梯度为

$$
\nabla f(x)=A^\top(Ax-b).
$$

令 $A$ 的紧 SVD 为

$$
A
\mathrel{=}
\sum_{i=1}^r
\sigma_i u_iv_i^\top,
\qquad
\sigma_1\ge\cdots\ge\sigma_r>0.
$$

从

$$
x_0=0
$$

开始做固定步长梯度下降：

$$
x_{k+1}
\mathrel{=}
(I-\eta A^\top A)x_k+\eta A^\top b.
$$

为使每个非零奇异方向单调进入，先取

$$
0\lt\eta\le\frac1{\sigma_1^2}.
$$

### 8.1 每个奇异方向的标量递推

定义

$$
z_{k,i}=v_i^\top x_k,
\qquad
\beta_i=u_i^\top b.
$$

在第 $i$ 个右奇异方向上，

$$
z_{k+1,i}
\mathrel{=}
(1-\eta\sigma_i^2)z_{k,i}
+
\eta\sigma_i\beta_i.
$$

由 $z_{0,i}=0$ 解这个等比递推：

$$
z_{k,i}
\mathrel{=}
\frac{
1-(1-\eta\sigma_i^2)^k
}{\sigma_i}
\beta_i.
$$

因此

$$
x_k
\mathrel{=}
\sum_{i=1}^r
\underbrace{
\left[
1-(1-\eta\sigma_i^2)^k
\right]
}_{g_k(\sigma_i)}
\frac{u_i^\top b}{\sigma_i}
v_i.
$$

### 8.2 与伪逆解比较

最小范数最小二乘解记为 $x^\dagger$，其谱表达为

$$
x^\dagger
\mathrel{=}
\sum_{i=1}^r
\frac{u_i^\top b}{\sigma_i}v_i.
$$

梯度下降第 $k$ 步只是在每个伪逆系数前乘上滤波因子

$$
g_k(\sigma)
\mathrel{=}
1-(1-\eta\sigma^2)^k.
$$

对固定 $\sigma>0$，

$$
g_k(\sigma)\longrightarrow1
$$

当 $k\to\infty$。但在有限 $k$ 下，若 $\eta\sigma^2$ 很小，则

$$
g_k(\sigma)
\approx
k\eta\sigma^2.
$$

所以大奇异值方向较快接近伪逆解，小奇异值方向较慢进入。由于伪逆中的 $1/\sigma_i$ 会放大小奇异方向，有限步停止会暂时抑制这些方向。

这就是 early stopping 的谱滤波表达：

$$
\text{迭代次数 }k
\quad\longleftrightarrow\quad
\text{滤波强度}.
$$

### 8.3 证明边界

上述推导严格证明了：

- 在线性最小二乘、固定步长与 $x_0=0$ 下，迭代具有显式谱滤波因子；
- $k$ 增大时，各非零奇异方向最终趋向伪逆解；
- 小奇异值方向在有限时间内受到更强抑制。

它尚未单独给出“哪个 $k$ 的统计误差最小”。这还需要噪声模型、目标信号在奇异向量上的分布，以及可执行的停止准则。谱公式提供机制，不替代统计选择定理。

---

## 9. 步长结论汇总

| 假设 | 步长 | 由本文证明的结论 |
|---|---:|---|
| $L$-光滑 | $0\lt\eta\lt2/L$ | 单步上界保证非驻点处下降 |
| $L$-光滑且有下界 | $\eta=1/L$ | 最小梯度范数平方为 $O(1/K)$ |
| 凸且 $L$-光滑 | $\eta=1/L$ | 函数值差为 $O(1/K)$ |
| $\mu$-强凸且 $L$-光滑 | $\eta=1/L$ | 函数值差按 $(1-\mu/L)^k$ 衰减 |
| $C^2$ 且 $\mu I\preceq H\preceq LI$ | $\eta=2/(L+\mu)$ | 距离因子为 $(L-\mu)/(L+\mu)$ |
| 线性最小二乘 | $0\lt\eta\le1/\sigma_1^2$ | 单调谱滤波表达 |

步长不是与问题结构无关的超参数。它与最大曲率 $L$、最小曲率 $\mu$ 以及线性问题中的奇异值谱直接绑定。

---

## 总结与下一站

梯度下降的全部证明从下降引理开始：

$$
f(x-\eta\nabla f(x))
\le
f(x)
\mathbin{-}
\eta\left(1-\frac{L\eta}{2}\right)
\|\nabla f(x)\|^2.
$$

凸性把小梯度升级为全局函数值控制，强凸性再把次线性速度升级为线性速度。在线性最小二乘中，迭代本身进一步具有

$$
g_k(\sigma)
\mathrel{=}
1-(1-\eta\sigma^2)^k
$$

这一显式谱滤波器。

下一篇改用二阶局部模型。Newton 法直接解 Hessian 给出的曲率方程；拟 Newton 法则只从相邻梯度差恢复满足割线条件的曲率近似。

[上一篇：优化与变分 Part 1——梯度、Hessian、Taylor 与凸性](/notes/math/optimization-variation/note-opt-1-gradient-hessian-convexity/)

[继续阅读：优化与变分 Part 3——Newton、阻尼与拟 Newton](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)
