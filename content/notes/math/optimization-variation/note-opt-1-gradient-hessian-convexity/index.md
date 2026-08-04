---
date: '2026-07-15T12:10:00+09:00'
draft: false
title: '优化与变分 Part 1：梯度、Hessian、Taylor 与凸性'
summary: "从 Fréchet 微分出发把梯度定义为导数的 Euclidean 表示，再把 Hessian 定义为梯度的导数；通过 Taylor 积分公式证明一阶与二阶最优性条件，并建立凸、强凸与光滑的梯度和 Hessian 判据。"
description: "光滑优化基础：Fréchet 微分、方向导数、梯度、Hessian、Taylor 公式、局部最优性条件、凸函数的一阶与二阶判据、强凸性、L-光滑性及梯度单调性证明。"
tags: ["Mathematics", "Optimization", "Taylor Expansion"]
categories: ["Notes"]
series: ["Optimization and Variational Methods"]
note_kind: "foundation"
math: true
---

# 优化与变分 Part 1：梯度、Hessian、Taylor 与凸性

优化算法读取的是目标函数的局部信息：

$$
f(x),\qquad
\nabla f(x),\qquad
\nabla^2f(x).
$$

但局部信息并不会自动控制全局行为。要从“当前点的一阶或二阶近似”推到“下一步一定下降”乃至“最终收敛到全局最优”，还必须加入凸性、强凸性与光滑性。

本篇建立这条结构链：

$$
\text{微分}
\longrightarrow
\text{梯度}
\longrightarrow
\text{Hessian}
\longrightarrow
\text{Taylor 公式}
\longrightarrow
\text{凸性、强凸性与光滑性}.
$$

全文设 $\Omega\subseteq\mathbb R^n$ 为开凸集，$f:\Omega\to\mathbb R$。内积与范数均为 Euclidean 版本。

---

## 1. 微分是线性近似

### 1.1 Fréchet 微分

**定义**：若存在一个线性泛函

$$
Df(x):\mathbb R^n\to\mathbb R
$$

使得

$$
f(x+h)
\mathrel{=}
f(x)+Df(x)[h]+r_x(h),
$$

并且

$$
\lim_{\|h\|\to0}
\frac{|r_x(h)|}{\|h\|}
=0,
$$

则称 $f$ 在 $x$ 处可微，$Df(x)$ 称为 $f$ 在 $x$ 处的 Fréchet 微分。

定义中的关键不是“存在各坐标偏导”，而是存在一个对所有小方向同时有效的线性主部：

$$
f(x+h)-f(x)
\mathrel{=}
Df(x)[h]+o(\|h\|).
$$

### 1.2 梯度是微分的向量表示

有限维 Euclidean 内积把每个线性泛函唯一表示成与某个向量做内积。因此存在唯一向量 $\nabla f(x)$，使

$$
Df(x)[h]
\mathrel{=}
\nabla f(x)^\top h
\qquad
\text{对所有 }h\in\mathbb R^n.
$$

这个向量就是梯度。

若标准坐标下的偏导存在且 $f$ 可微，取 $h=e_i$ 得

$$
\nabla f(x)
\mathrel{=}
\begin{pmatrix}
\partial_1f(x)\\
\vdots\\
\partial_nf(x)
\end{pmatrix}.
$$

所以梯度依赖所选内积，而微分 $Df(x)$ 才是先于坐标表示的导数对象。

### 1.3 方向导数

沿方向 $v$ 的方向导数定义为

$$
D_vf(x)
\mathrel{=}
\lim_{t\to0}
\frac{f(x+tv)-f(x)}{t},
$$

只要极限存在。

**命题**：若 $f$ 在 $x$ 可微，则每个方向导数都存在，并且

$$
D_vf(x)
\mathrel{=}
Df(x)[v]
\mathrel{=}
\nabla f(x)^\top v.
$$

**证明**：

将 $h=tv$ 代入可微定义：

$$
f(x+tv)-f(x)
\mathrel{=}
tDf(x)[v]+o(|t|\,\|v\|).
$$

除以 $t$ 并令 $t\to0$，余项趋于零，得到结论。证毕。

---

## 2. 一阶必要条件

**定理**：若 $x^\star\in\Omega$ 是 $f$ 的局部极小点，且 $f$ 在 $x^\star$ 可微，则

$$
\nabla f(x^\star)=0.
$$

**证明**：

任取方向 $v$。因为 $\Omega$ 开，充分小的 $t$ 使 $x^\star+tv\in\Omega$。一元函数

$$
\phi(t)=f(x^\star+tv)
$$

在 $t=0$ 取局部极小，所以

$$
\phi'(0)=0.
$$

由方向导数公式，

$$
0=\phi'(0)=\nabla f(x^\star)^\top v.
$$

这对所有 $v$ 成立。取 $v=\nabla f(x^\star)$，得到

$$
\|\nabla f(x^\star)\|^2=0.
$$

所以 $\nabla f(x^\star)=0$。证毕。

满足 $\nabla f(x)=0$ 的点称为驻点。一阶条件只说明局部极小点必为驻点，尚未说明每个驻点都是极小点。

---

## 3. Hessian 与二阶方向曲率

若梯度映射

$$
\nabla f:\Omega\to\mathbb R^n
$$

在 $x$ 可微，其导数称为 Hessian：

$$
\nabla^2f(x)
\mathrel{=}
D(\nabla f)(x)
\mathrel{=}
\bigl(\partial_j(\partial_i f)(x)\bigr)_{i,j=1}^n.
$$

对任意方向 $v$，令 $\phi(t)=f(x+tv)$，则

$$
\phi'(t)
\mathrel{=}
\nabla f(x+tv)^\top v,
$$

$$
\phi''(t)
\mathrel{=}
v^\top\nabla^2f(x+tv)v.
$$

因此二次型

$$
v^\top\nabla^2f(x)v
$$

就是 $f$ 沿方向 $v$ 的二阶曲率。

### 3.1 Hessian 的对称性

**定理**：若 $f\in C^2(\Omega)$，则

$$
\partial_j(\partial_i f)(x)
\mathrel{=}
\partial_i(\partial_j f)(x),
$$

所以 $\nabla^2f(x)$ 对称。

**证明**：

固定 $i,j$，考察矩形增量

$$
\Delta(s,t)
\mathrel{=}
f(x+se_i+te_j)-f(x+se_i)-f(x+te_j)+f(x).
$$

先沿 $e_i$ 再沿 $e_j$ 使用微积分基本定理：

$$
\Delta(s,t)
\mathrel{=}
\int_0^s\int_0^t
\partial_j(\partial_i f)(x+ue_i+ve_j)
\,dv\,du.
$$

交换积分次序与求导顺序，同一个增量也等于

$$
\Delta(s,t)
\mathrel{=}
\int_0^t\int_0^s
\partial_i(\partial_j f)(x+ue_i+ve_j)
\,du\,dv.
$$

两边除以 $st$，令 $(s,t)\to(0,0)$。二阶偏导连续，所以两个平均值分别趋于 $\partial_j(\partial_i f)(x)$ 与 $\partial_i(\partial_j f)(x)$，从而二者相等。证毕。

---

## 4. Taylor 积分公式

设从 $x$ 到 $x+h$ 的线段包含在 $\Omega$ 中，并定义

$$
\phi(t)=f(x+th),
\qquad
0\le t\le1.
$$

### 4.1 一阶公式

若 $f\in C^1$，则

$$
\begin{aligned}
f(x+h)-f(x)
&=
\int_0^1\phi'(t)\,dt\\
&=
\int_0^1\nabla f(x+th)^\top h\,dt.
\end{aligned}
$$

加减 $\nabla f(x)^\top h$ 得

$$
f(x+h)
\mathrel{=}
f(x)+\nabla f(x)^\top h
+
\int_0^1
\bigl(\nabla f(x+th)-\nabla f(x)\bigr)^\top h\,dt.
$$

### 4.2 二阶公式

若 $f\in C^2$，对一元函数 $\phi$ 积分两次可得

$$
\phi(1)
\mathrel{=}
\phi(0)+\phi'(0)
+
\int_0^1(1-t)\phi''(t)\,dt.
$$

因此

$$
f(x+h)
\mathrel{=}
f(x)+\nabla f(x)^\top h
+
\int_0^1
(1-t)h^\top\nabla^2f(x+th)h\,dt.
$$

若 Hessian 在 $x$ 连续，便得到熟悉的二阶渐近式：

$$
f(x+h)
\mathrel{=}
f(x)+\nabla f(x)^\top h
+
\frac12h^\top\nabla^2f(x)h
+o(\|h\|^2).
$$

积分余项比只写 $o(\|h\|^2)$ 更适合优化证明，因为矩阵上下界可以直接放入积分。

---

## 5. 二阶局部最优性条件

### 5.1 必要条件

**定理**：若 $x^\star$ 是局部极小点且 $f\in C^2$，则

$$
\nabla f(x^\star)=0,
\qquad
\nabla^2f(x^\star)\succeq0.
$$

**证明**：

第一式由一阶必要条件得到。任取 $v$，一元函数

$$
\phi(t)=f(x^\star+tv)
$$

在 $0$ 处取局部极小，所以

$$
\phi''(0)\ge0.
$$

而

$$
\phi''(0)
\mathrel{=}
v^\top\nabla^2f(x^\star)v.
$$

这对所有 $v$ 成立，故 Hessian 半正定。证毕。

### 5.2 严格充分条件

**定理**：若 $f$ 在 $x^\star$ 的一个邻域内属于 $C^2$，并且

$$
\nabla f(x^\star)=0
$$

且

$$
\nabla^2f(x^\star)\succ0,
$$

则 $x^\star$ 是严格局部极小点。

**证明**：

设 Hessian 的最小特征值为 $m>0$。由 Hessian 连续性，存在 $x^\star$ 的邻域，使该邻域内

$$
\nabla^2f(x)\succeq\frac m2I.
$$

对充分小的 $h\ne0$，整条线段 $x^\star+th$ 位于此邻域。由二阶 Taylor 积分公式和 $\nabla f(x^\star)=0$，

$$
\begin{aligned}
f(x^\star+h)-f(x^\star)
&=
\int_0^1
(1-t)h^\top\nabla^2f(x^\star+th)h\,dt\\
&\ge
\int_0^1(1-t)\frac m2\|h\|^2\,dt\\
&=
\frac m4\|h\|^2
\mathrel{>}0.
\end{aligned}
$$

所以 $x^\star$ 是严格局部极小点。证毕。

半正定 Hessian 不能单独给出充分性；严格正定通过一个统一的局部曲率下界完成了证明。

---

## 6. 凸集与凸函数

集合 $\Omega$ 称为凸集，如果

$$
x,y\in\Omega,\quad
\theta\in[0,1]
\Longrightarrow
(1-\theta)x+\theta y\in\Omega.
$$

函数 $f:\Omega\to\mathbb R$ 称为凸函数，如果

$$
f((1-\theta)x+\theta y)
\le
(1-\theta)f(x)+\theta f(y)
$$

对所有 $x,y\in\Omega$ 与 $\theta\in[0,1]$ 成立。

这一定义把函数在任意线段上的图像限制在端点弦线之下。由于定义只涉及线段，多维凸性可以沿任意直线化为一维凸性。

---

## 7. 可微凸函数的一阶刻画

**定理**：设 $f$ 在开凸集 $\Omega$ 上可微。则 $f$ 凸，当且仅当

$$
f(y)
\ge
f(x)+\nabla f(x)^\top(y-x)
$$

对所有 $x,y\in\Omega$ 成立。

右侧是 $f$ 在 $x$ 的切平面，所以该定理也称为支撑超平面性质。

**必要性的证明**：

固定 $x,y$，令

$$
\phi(t)=f(x+t(y-x)),
\qquad
0\le t\le1.
$$

由 $f$ 凸，$\phi$ 是一元凸函数。对 $0\lt t\le1$，

$$
\phi(t)
\le
(1-t)\phi(0)+t\phi(1).
$$

整理得

$$
\frac{\phi(t)-\phi(0)}{t}
\le
\phi(1)-\phi(0).
$$

令 $t\downarrow0$：

$$
\nabla f(x)^\top(y-x)
\mathrel{=}
\phi'(0)
\le
f(y)-f(x).
$$

移项即得结论。

**充分性的证明**：

假设一阶不等式成立。令

$$
z=(1-\theta)x+\theta y.
$$

分别把 $x,y$ 代入以 $z$ 为基点的一阶不等式：

$$
f(x)\ge f(z)+\nabla f(z)^\top(x-z),
$$

$$
f(y)\ge f(z)+\nabla f(z)^\top(y-z).
$$

第一式乘 $1-\theta$，第二式乘 $\theta$，再相加。因为

$$
(1-\theta)(x-z)+\theta(y-z)=0,
$$

梯度项抵消，得到

$$
(1-\theta)f(x)+\theta f(y)\ge f(z).
$$

这正是凸性定义。证毕。

### 驻点成为全局最优点

若 $f$ 凸且

$$
\nabla f(x^\star)=0,
$$

则对任意 $y$，

$$
f(y)
\ge
f(x^\star)+\nabla f(x^\star)^\top(y-x^\star)
\mathrel{=}
f(x^\star).
$$

所以 $x^\star$ 是全局极小点。凸性把局部一阶条件升级成全局结论。

---

## 8. 二阶凸性判据

**定理**：若 $f\in C^2(\Omega)$，则

$$
f\text{ 凸}
\Longleftrightarrow
\nabla^2f(x)\succeq0
\quad
\text{对所有 }x\in\Omega.
$$

**证明**：

若 $f$ 凸，固定 $x$ 与方向 $v$，一元函数

$$
\phi(t)=f(x+tv)
$$

在其定义区间上凸。可微一元凸函数的导数单调，因此

$$
\phi''(0)\ge0.
$$

也就是

$$
v^\top\nabla^2f(x)v\ge0.
$$

任意 $v$ 均成立，所以 Hessian 半正定。

反过来，假设 Hessian 处处半正定。沿连接 $x,y$ 的线段定义 $\phi(t)$，则

$$
\phi''(t)
\mathrel{=}
(y-x)^\top
\nabla^2f(x+t(y-x))
(y-x)
\ge0.
$$

所以 $\phi$ 是一元凸函数，从而

$$
\phi(\theta)
\le
(1-\theta)\phi(0)+\theta\phi(1).
$$

这正是 $f$ 的凸性。证毕。

---

## 9. 强凸性

### 9.1 定义

可微函数 $f$ 称为 $\mu$-强凸，其中 $\mu>0$，如果

$$
f(y)
\ge
f(x)+\nabla f(x)^\top(y-x)
+
\frac\mu2\|y-x\|^2
$$

对所有 $x,y\in\Omega$ 成立。

它在普通凸性的一阶支撑平面之上，额外加入统一的二次曲率下界。

### 9.2 与平移二次项的等价性

**定理**：$f$ 为 $\mu$-强凸，当且仅当

$$
g(x)=f(x)-\frac\mu2\|x\|^2
$$

是凸函数。

**证明**：

$g$ 凸的一阶判据为

$$
g(y)\ge g(x)+\nabla g(x)^\top(y-x).
$$

代入

$$
\nabla g(x)=\nabla f(x)-\mu x
$$

并整理，使用恒等式

$$
\frac12\|y\|^2-\frac12\|x\|^2-x^\top(y-x)
\mathrel{=}
\frac12\|y-x\|^2,
$$

恰好得到强凸定义。所有步骤可逆，所以二者等价。证毕。

### 9.3 Hessian 判据

若 $f\in C^2$，应用上一节的二阶凸性判据到 $g$，得到

$$
f\text{ 为 }\mu\text{-强凸}
\Longleftrightarrow
\nabla^2f(x)\succeq\mu I
$$

对所有 $x$ 成立。

### 9.4 极小点的存在与唯一性

设 $\Omega=\mathbb R^n$，且 $f$ 可微并 $\mu$-强凸。取 $x=0$：

$$
f(y)
\ge
f(0)+\nabla f(0)^\top y+\frac\mu2\|y\|^2.
$$

右侧在 $\|y\|\to\infty$ 时趋于 $+\infty$，所以 $f$ coercive。连续 coercive 函数的足够低子水平集非空且紧；在该紧集上由 Weierstrass 定理取得最小值。因此极小点存在。

若 $x^\star$ 是极小点，则 $\nabla f(x^\star)=0$。强凸不等式给出

$$
f(y)
\ge
f(x^\star)+\frac\mu2\|y-x^\star\|^2.
$$

当 $y\ne x^\star$ 时右侧严格大于 $f(x^\star)$，所以极小点唯一。

---

## 10. 光滑性

**定义**：若存在 $L>0$，使

$$
\|\nabla f(x)-\nabla f(y)\|
\le
L\|x-y\|
$$

对所有 $x,y\in\Omega$ 成立，则称 $f$ 为 $L$-光滑函数。

$L$ 控制梯度变化的最快速度，是一阶算法可使用的全局曲率上界。

### 10.1 Hessian 谱界

**定理**：设 $f\in C^2(\Omega)$。若

$$
\|\nabla^2f(x)\|_2\le L
$$

处处成立，则 $f$ 为 $L$-光滑。反过来，若 $f$ 为 $L$-光滑，则

$$
\|\nabla^2f(x)\|_2\le L.
$$

**证明**：

由微积分基本定理，

$$
\nabla f(y)-\nabla f(x)
\mathrel{=}
\int_0^1
\nabla^2f(x+t(y-x))(y-x)\,dt.
$$

若 Hessian 算子范数不超过 $L$，则

$$
\begin{aligned}
\|\nabla f(y)-\nabla f(x)\|
&\le
\int_0^1
\|\nabla^2f(x+t(y-x))\|_2
\|y-x\|\,dt\\
&\le
L\|y-x\|.
\end{aligned}
$$

反过来，若梯度为 $L$-Lipschitz，对任意单位向量 $v$，

$$
\|\nabla^2f(x)v\|
\mathrel{=}
\lim_{t\to0}
\frac{\|\nabla f(x+tv)-\nabla f(x)\|}{|t|}
\le L.
$$

对单位向量取上确界即得

$$
\|\nabla^2f(x)\|_2\le L.
$$

证毕。

若 $f$ 还凸，则 Hessian 对称半正定，算子范数上界等价于

$$
0\preceq\nabla^2f(x)\preceq LI.
$$

若同时 $\mu$-强凸，则统一得到

$$
\mu I
\preceq
\nabla^2f(x)
\preceq
LI.
$$

比值

$$
\kappa=\frac L\mu
$$

是目标函数的曲率条件数，将直接进入梯度下降和 Newton 类方法的速度分析。

---

## 11. 梯度的单调性

**定理**：若 $f$ 可微且凸，则

$$
\bigl(\nabla f(x)-\nabla f(y)\bigr)^\top(x-y)
\ge0.
$$

若 $f$ 为 $\mu$-强凸，则

$$
\bigl(\nabla f(x)-\nabla f(y)\bigr)^\top(x-y)
\ge
\mu\|x-y\|^2.
$$

**证明**：

凸性的一阶判据分别给出

$$
f(y)\ge f(x)+\nabla f(x)^\top(y-x),
$$

$$
f(x)\ge f(y)+\nabla f(y)^\top(x-y).
$$

相加并整理得到普通单调性。

若 $f$ 强凸，两条不等式右侧各多出 $\mu\|x-y\|^2/2$。相加后得到强单调性。证毕。

梯度单调性把函数的几何结构转写成算子不等式，也是后续分析迭代映射的入口。

---

## 总结与下一站

本篇得到四组后续反复使用的结论：

$$
Df(x)[h]=\nabla f(x)^\top h,
$$

$$
f(x+h)
\mathrel{=}
f(x)+\nabla f(x)^\top h
+
\int_0^1(1-t)
h^\top\nabla^2f(x+th)h\,dt,
$$

$$
f\text{ 凸}
\Longleftrightarrow
f(y)\ge f(x)+\nabla f(x)^\top(y-x),
$$

以及在 $C^2$ 情形，

$$
\mu I\preceq\nabla^2f(x)\preceq LI.
$$

下一篇只使用其中的一阶支撑不等式与 $L$-光滑性，证明固定步长梯度下降的下降性质、凸与强凸收敛率，并在线性最小二乘上推导 early stopping 的谱滤波公式。

[返回路线图：优化与变分 Part 0](/notes/math/optimization-variation/note-opt-0-roadmap/)

[继续阅读：优化与变分 Part 2——梯度下降、收敛率与谱滤波](/notes/math/optimization-variation/note-opt-2-gradient-descent/)
