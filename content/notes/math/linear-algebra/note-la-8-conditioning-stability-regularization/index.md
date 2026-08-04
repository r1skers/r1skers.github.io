---
date: '2026-07-15T15:05:00+09:00'
draft: false
title: '线性代数 Part 8：条件数、数值稳定性与正则化'
summary: "把误差责任分成三层：扰动理论描述问题本身的敏感度，后向稳定性描述算法是否额外添乱，正则化则主动改变病态反演。证明条件数误差界、到奇异矩阵的距离，并推导 Tikhonov、TSVD 与 early stopping 的谱滤波形式。"
description: "数值线性代数基础：算子范数、条件数、右端与矩阵扰动界、距离奇异性、前向和后向误差、QR 与正规方程的稳定性差异、Tikhonov、截断 SVD、L1 和 Landweber early stopping。"
tags: ["Mathematics", "Linear Algebra", "Numerical Stability", "Regularization"]
categories: ["Notes"]
series: ["Linear Algebra"]
note_kind: "foundation"
math: true
---

# 线性代数 Part 8：条件数、数值稳定性与正则化

> [Part 7](/notes/math/linear-algebra/note-la-7-low-rank-pca/) 把小奇异值当作可以舍弃的谱尾。本篇从反演方向重新读取同一组数：解 $Ax=b$ 时要除以奇异值，因此小奇异值会放大噪声。条件数衡量问题本身的敏感度；后向稳定性衡量算法是否额外制造了大扰动；正则化则主动压制不可信方向。

本文仍只处理有限维空间。向量默认使用二范数，矩阵默认使用诱导谱范数，除非明确写出其他范数。讨论可逆性时先设

$$
A\in\mathbb F^{n\times n},
$$

而最小二乘与正则化允许矩形 $A\in\mathbb F^{m\times n}$。

首先要把三个问题分开：

$$
\text{问题敏感吗？}
\quad\longleftrightarrow\quad
\text{condition number},
$$

$$
\text{算法添乱了吗？}
\quad\longleftrightarrow\quad
\text{backward stability},
$$

$$
\text{问题本来就病态怎么办？}
\quad\longleftrightarrow\quad
\text{regularization}.
$$

---

## 1. 诱导范数：把误差传播写成不等式

矩阵 $A\in\mathbb F^{m\times n}$ 的诱导二范数为

$$
\|A\|_2
=\max_{x\ne0}\frac{\|Ax\|_2}{\|x\|_2}
=\max_{\|x\|_2=1}\|Ax\|_2.
$$

由定义立即得到

$$
\|Ax\|_2\le\|A\|_2\|x\|_2.
$$

**命题（次乘性）**：若矩阵尺寸相容，则

$$
\|AB\|_2\le\|A\|_2\|B\|_2.
$$

**证明**：对任意 $x$，

$$
\|ABx\|_2
\le\|A\|_2\|Bx\|_2
\le\|A\|_2\|B\|_2\|x\|_2.
$$

对单位向量取上确界即得。证毕。

谱范数与 SVD 的关系是

$$
\|A\|_2=\sigma_{\max}(A).
$$

它还具有酉不变性：若 $U,V$ 酉，则

$$
\|UAV\|_2=\|A\|_2.
$$

因此在奇异向量坐标中分析误差，不会改变误差的二范数大小。

---

## 2. 条件数：前向映射和逆映射的联合放大

对可逆方阵 $A$，定义二范数条件数

$$
\kappa_2(A)=\|A\|_2\|A^{-1}\|_2.
$$

若 $A$ 奇异，约定

$$
\kappa_2(A)=+\infty.
$$

若

$$
A=U\Sigma V^*,
$$

则

$$
A^{-1}=V\Sigma^{-1}U^*,
$$

所以

$$
\|A\|_2=\sigma_1,
\qquad
\|A^{-1}\|_2=\frac1{\sigma_n},
$$

并得到

$$
\boxed{
\kappa_2(A)=\frac{\sigma_1}{\sigma_n}
}.
$$

因为

$$
1=\|I\|_2=\|AA^{-1}\|_2
\le\|A\|_2\|A^{-1}\|_2,
$$

所以 $\kappa_2(A)\ge1$。等号意味着所有奇异值相等，即 $A$ 是一个统一缩放乘酉矩阵；不同方向的反演难度完全一致。

对满列秩矩形矩阵 $A\in\mathbb F^{m\times n}$，同样定义

$$
\kappa_2(A)=\frac{\sigma_1}{\sigma_n},
$$

它控制最小二乘逆映射在可观测子空间上的敏感度。

---

## 3. 只扰动右端时的相对误差界

考虑

$$
Ax=b
$$

与右端受扰动后的方程

$$
A(x+\Delta x)=b+\Delta b.
$$

以下相对误差公式假设 $b\ne0$；因为 $A$ 可逆，这等价于 $x\ne0$。若 $b=0$，分母中的相对量没有定义，但绝对误差界

$$
\|\Delta x\|_2
\le\|A^{-1}\|_2\|\Delta b\|_2
$$

仍然成立。

两式相减得

$$
A\Delta x=\Delta b,
\qquad
\Delta x=A^{-1}\Delta b.
$$

因此

$$
\|\Delta x\|_2
\le\|A^{-1}\|_2\|\Delta b\|_2.
$$

另一方面，由 $b=Ax$，

$$
\|b\|_2\le\|A\|_2\|x\|_2.
$$

合并两式得到

$$
\boxed{
\frac{\|\Delta x\|_2}{\|x\|_2}
\le
\kappa_2(A)
\frac{\|\Delta b\|_2}{\|b\|_2}
}.
$$

这是最基本的扰动定理。它是最坏方向上的上界，不声称每个扰动都达到等号；但这个放大因子不能由换一个求解算法消除，因为它来自映射 $b\mapsto A^{-1}b$ 本身。

---

## 4. 矩阵和右端同时扰动

先证明一个可逆性引理。

**引理**：若矩阵 $E$ 满足 $\|E\|_2\lt1$，则 $I+E$ 可逆，且

$$
\|(I+E)^{-1}\|_2
\le\frac1{1-\|E\|_2}.
$$

**证明**：有限部分和满足

$$
(I+E)\sum_{j=0}^N(-E)^j
=I+(-1)^NE^{N+1}.
$$

由 $\|E^{N+1}\|_2\le\|E\|_2^{N+1}\to0$，级数

$$
\sum_{j=0}^\infty(-E)^j
$$

收敛到 $(I+E)^{-1}$。再用三角不等式，

$$
\|(I+E)^{-1}\|_2
\le\sum_{j=0}^\infty\|E\|_2^j
=\frac1{1-\|E\|_2}.
$$

证毕。

现在比较

$$
Ax=b
$$

和

$$
(A+\Delta A)(x+\Delta x)=b+\Delta b.
$$

继续假设 $b\ne0$，并定义相对扰动

$$
\delta_A=\frac{\|\Delta A\|_2}{\|A\|_2},
\qquad
\delta_b=\frac{\|\Delta b\|_2}{\|b\|_2}.
$$

**定理**：如果

$$
\kappa_2(A)\delta_A\lt1,
$$

则 $A+\Delta A$ 可逆，并且

$$
\boxed{
\frac{\|\Delta x\|_2}{\|x\|_2}
\le
\frac{\kappa_2(A)}{1-\kappa_2(A)\delta_A}
(\delta_A+\delta_b)
}.
$$

**证明**：分解

$$
A+\Delta A
=A(I+A^{-1}\Delta A).
$$

因为

$$
\|A^{-1}\Delta A\|_2
\le\|A^{-1}\|_2\|\Delta A\|_2
=\kappa_2(A)\delta_A\lt1,
$$

引理保证 $A+\Delta A$ 可逆，且

$$
\|(A+\Delta A)^{-1}\|_2
\le
\frac{\|A^{-1}\|_2}{1-\kappa_2(A)\delta_A}.
$$

由扰动方程相减，

$$
(A+\Delta A)\Delta x
=\Delta b-\Delta A x.
$$

所以

$$
\frac{\|\Delta x\|_2}{\|x\|_2}
\le
\frac{\|A^{-1}\|_2}{1-\kappa_2(A)\delta_A}
\left(
\frac{\|\Delta b\|_2}{\|x\|_2}
+\|\Delta A\|_2
\right).
$$

再由 $\|b\|_2\le\|A\|_2\|x\|_2$ 得

$$
\frac{\|\Delta b\|_2}{\|x\|_2}
\le\|A\|_2\delta_b.
$$

代回并整理即得结论。证毕。

当扰动很小时，分母接近 $1$，一阶读法就是

$$
\text{相对解误差}
\lesssim
\kappa_2(A)
(\text{相对矩阵扰动}+\text{相对右端扰动}).
$$

---

## 5. 条件数就是到奇异矩阵的相对距离

**定理**：若 $A$ 可逆，则

$$
\min\{\|E\|_2:A+E\text{ 奇异}\}
=\sigma_n(A).
$$

因此

$$
\boxed{
\frac{
\min\{\|E\|_2:A+E\text{ 奇异}\}
}{\|A\|_2}
=\frac1{\kappa_2(A)}
}.
$$

**证明**：取最小奇异值对应的左右奇异向量 $u_n,v_n$，令

$$
E=-\sigma_nu_nv_n^*.
$$

则

$$
(A+E)v_n
=\sigma_nu_n-\sigma_nu_n
=0,
$$

所以 $A+E$ 奇异，且 $\|E\|_2=\sigma_n$。这给出上界。

反过来，若 $A+E$ 奇异，存在单位向量 $x$ 使 $(A+E)x=0$。于是

$$
\sigma_n
\le\|Ax\|_2
=\|Ex\|_2
\le\|E\|_2.
$$

任何能把 $A$ 推到奇异的扰动都至少有范数 $\sigma_n$，下界得证。证毕。

所以“病态”并不是模糊评价：$\kappa_2(A)$ 很大，精确表示 $A$ 距离奇异集合很近。

---

## 6. 前向误差、残差与后向稳定性

设精确解为 $x$，算法返回 $\widehat x$。

**前向误差**直接比较答案：

$$
\frac{\|\widehat x-x\|_2}{\|x\|_2}.
$$

**残差**是

$$
r=b-A\widehat x.
$$

残差小只表示 $\widehat x$ 几乎满足方程；若 $A$ 病态，残差经过 $A^{-1}$ 后仍可能对应较大的前向误差，因为

$$
x-\widehat x=A^{-1}r.
$$

**后向误差**则问：$\widehat x$ 是否是一个邻近问题的精确解？即是否存在小扰动 $E,f$，使

$$
(A+E)\widehat x=b+f.
$$

若只允许扰动右端，最小扰动就是

$$
f=A\widehat x-b=-r,
$$

当 $b\ne0$ 时，相对后向误差精确等于

$$
\eta_b(\widehat x)=\frac{\|r\|_2}{\|b\|_2}.
$$

若 $b=0$，这个相对归一化不适用，应直接使用绝对后向误差 $\|r\|_2$，或另选与问题尺度相容的归一化。

一个算法称为后向稳定，若它在浮点计算中给出的 $\widehat x$，总能解释为某个相对扰动量与机器精度同阶的问题的精确解。

把本节与前面的扰动定理合并，得到责任分解：

$$
\text{前向误差}
\lesssim
\text{条件数}
\times
\text{后向误差}.
$$

后向稳定算法保证自己没有显著放大输入误差；它不能改变原问题的大条件数。

---

## 7. 为什么正规方程会平方条件数

设 $A\in\mathbb F^{m\times n}$ 满列秩。最小二乘正规方程为

$$
A^*Ax=A^*b.
$$

$A^*A$ 的特征值为 $\sigma_i(A)^2$，因此

$$
\kappa_2(A^*A)
=\frac{\sigma_1(A)^2}{\sigma_n(A)^2}
=\kappa_2(A)^2.
$$

这不是说正规方程在精确代数上错误；它说显式形成 $A^*A$ 后，原来已存在的尺度差异被平方。

QR 分解则写成

$$
A=QR,
$$

并求解

$$
Rx=Q^*b.
$$

因为 $Q$ 的列标准正交，

$$
\|Qy\|_2=\|y\|_2,
$$

所以 QR 不会通过左侧正交变换额外放大二范数。Householder QR 是求解稠密最小二乘的典型后向稳定路线；Cholesky 适合 Hermitian 正定系统；带主元的 LU 则需把舍入误差与 pivot growth 一并评估。分解名称本身不是稳定性证明，真正的判断要落在计算出的因子是否对应一个邻近输入。

---

## 8. Tikhonov：把不可控逆替换成有界谱滤子

设 $A\in\mathbb F^{m\times n}$，$b\in\mathbb F^m$，$\lambda>0$。Tikhonov 正则化求解

$$
\min_x
\left(
\|Ax-b\|_2^2
+\lambda\|x\|_2^2
\right).
$$

**定理**：该问题有唯一解

$$
\boxed{
x_\lambda
=(A^*A+\lambda I)^{-1}A^*b
}.
$$

**证明**：沿任意方向 $h$ 对目标作一阶变分，极小点必须满足

$$
A^*(Ax-b)+\lambda x=0,
$$

即

$$
(A^*A+\lambda I)x=A^*b.
$$

对任意 $h\ne0$，

$$
h^*(A^*A+\lambda I)h
=\|Ah\|_2^2+\lambda\|h\|_2^2
\mathrel{>}0.
$$

所以 $A^*A+\lambda I$ 正定可逆，驻点唯一。目标是严格凸二次函数，因此该驻点就是唯一全局极小点。证毕。

取 reduced SVD

$$
A=U_r\Sigma_rV_r^*,
$$

则

$$
x_\lambda
=\sum_{i=1}^r
\frac{\sigma_i}{\sigma_i^2+\lambda}
(u_i^*b)v_i.
$$

未正则化的最小范数伪逆解为

$$
x^\dagger
=\sum_{i=1}^r
\frac1{\sigma_i}(u_i^*b)v_i.
$$

所以 Tikhonov 把危险因子替换为

$$
\frac1{\sigma_i}
\quad\longmapsto\quad
\frac{\sigma_i}{\sigma_i^2+\lambda}.
$$

当 $\sigma_i^2\gg\lambda$ 时，它接近 $1/\sigma_i$；当 $\sigma_i^2\ll\lambda$ 时，它接近 $\sigma_i/\lambda$ 并趋近零。正则化的本质不是让所有坐标机械变小，而是降低数据无法可靠辨识的谱方向的权重。

---

## 9. 截断 SVD：硬谱滤波

仍写

$$
A=\sum_{i=1}^r\sigma_i u_i v_i^*.
$$

给定截断秩 $k$，TSVD 解定义为

$$
x_k
=\sum_{i=1}^k
\frac{u_i^*b}{\sigma_i}v_i.
$$

它对应滤子

$$
g_k(\sigma_i)
\mathrel{=}
\begin{cases}
1/\sigma_i,&i\le k,\\
0,&i>k.
\end{cases}
$$

因此 TSVD 完全删除尾部方向，是硬阈值；Tikhonov 使用连续函数

$$
g_\lambda(\sigma)
=\frac{\sigma}{\sigma^2+\lambda}
$$

逐渐压低尾部，是软滤波。

同一个 $A_k$ 在 [Part 7](/notes/math/linear-algebra/note-la-7-low-rank-pca/) 中是最佳秩 $k$ 近似；在这里则是正则化后的前向算子。两种解释共享 SVD，但优化目标不同：前者控制矩阵近似误差，后者控制反演中的噪声放大。

---

## 10. $\ell_1$：把谱偏好改成坐标稀疏偏好

$\ell_1$ 正则化常写成

$$
\min_x
\frac12\|Ax-b\|_2^2
+\lambda\|x\|_1.
$$

它与 Tikhonov 都用偏差换稳定，但偏好不同：

$$
\|x\|_2^2
\quad\text{偏好整体能量小},
$$

$$
\|x\|_1
\quad\text{偏好少数坐标非零}.
$$

$\ell_1$ 目标是凸的，但在坐标为零处不可微，一般没有 SVD 式闭式解。它何时能恢复真正的稀疏表示，需要字典的 null-space property、coherence 或 restricted isometry 条件；严格的唯一性与 coherence 恢复定理已经放在 [Part 7 的稀疏近似一节](/notes/math/linear-algebra/note-la-7-low-rank-pca/#8-稀疏近似少数坐标而不是少数奇异方向)。算法如 proximal gradient 和 coordinate descent 属于优化主线，不在这里展开。

---

## 11. Early stopping：迭代次数也是谱滤子

Early stopping 不改写目标函数，但可以改写最终采用的谱权重。考虑最小二乘的 Landweber 迭代：

以下假设 $A\ne0$，从而最大奇异值 $\sigma_1>0$。

$$
x_{t+1}
=x_t+\eta A^*(b-Ax_t),
\qquad
x_0=0,
$$

其中

$$
0\lt\eta\le\frac1{\sigma_1^2}.
$$

这个区间比纯粹保证收敛所需的 $0\lt\eta\lt2/\sigma_1^2$ 更窄；采用它是为了让每个谱方向的因子 $1-\eta\sigma_i^2$ 都落在 $[0,1)$，从而下面的“先后进入”解释保持单调而不发生振荡。

把 $x_t$ 展开到右奇异向量基上。第 $i$ 个非零奇异方向的系数 $\alpha_{i,t}=v_i^*x_t$ 满足

$$
\alpha_{i,t+1}
=(1-\eta\sigma_i^2)\alpha_{i,t}
+\eta\sigma_i(u_i^*b).
$$

这是标量等比递推。由 $\alpha_{i,0}=0$，

$$
\alpha_{i,t}
=\frac{1-(1-\eta\sigma_i^2)^t}{\sigma_i}
(u_i^*b).
$$

因此

$$
x_t
=\sum_{i=1}^r
\frac{1-(1-\eta\sigma_i^2)^t}{\sigma_i}
(u_i^*b)v_i.
$$

因为 $|1-\eta\sigma_i^2|\lt1$，当 $t\to\infty$ 时，滤子收敛到 $1/\sigma_i$，$x_t$ 收敛到最小范数最小二乘解。

但在有限 $t$ 下，小奇异值方向满足近似关系

$$
1-(1-\eta\sigma_i^2)^t
\approx t\eta\sigma_i^2,
$$

所以对应滤子约为

$$
t\eta\sigma_i,
$$

而不是爆炸的 $1/\sigma_i$。大奇异值方向先接近伪逆权重，小奇异值方向后进入；提前停止因此构成一种由迭代时间控制的软谱正则化。

---

## 12. 本篇闭环

稳定性主线可以压成四条公式：

$$
\kappa_2(A)=\frac{\sigma_{\max}}{\sigma_{\min}},
$$

$$
\frac{\text{到奇异矩阵的最短距离}}{\|A\|_2}
=\frac1{\kappa_2(A)},
$$

$$
\text{前向误差}
\lesssim
\kappa_2(A)\times\text{后向误差},
$$

以及三类谱滤子

$$
\frac1\sigma,
\qquad
\frac{\sigma}{\sigma^2+\lambda},
\qquad
\frac{1-(1-\eta\sigma^2)^t}{\sigma}.
$$

条件数诊断问题，后向稳定性审计算法，正则化改变问题。下一篇把这里出现的 Neumann 级数与迭代更新系统化，并讨论矩阵函数、Jacobi、Gauss–Seidel、共轭梯度、Hadamard/Kronecker 结构、稀疏计算和量化误差的线性代数接口。

[上一篇：Part 7——低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/)

[下一篇：Part 9——矩阵函数、迭代法与结构化计算](/notes/math/linear-algebra/note-la-9-matrix-functions-iterative-structured/)

[返回：Part 0——矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)
