---
date: '2026-07-15T15:25:00+09:00'
draft: false
title: '线性代数 Part 9：矩阵函数、迭代法与结构化计算'
summary: "从幂级数定义矩阵函数，证明 Neumann 级数与谱半径条件；再统一 stationary iteration、Jacobi、Gauss–Seidel 和共轭梯度的收敛机制，最后整理 Hadamard、Kronecker、稀疏、循环结构与量化误差的线性代数接口。"
description: "有限维计算线性代数笔记：矩阵指数、Neumann 级数、固定点迭代、Jacobi、Gauss-Seidel、Sassenfeld 条件、共轭梯度及条件数收敛界、Hadamard 与 Schur 乘积定理、Kronecker、vec、循环矩阵、稀疏计算和量化误差界。"
tags: ["Mathematics", "Linear Algebra", "Numerical Methods"]
categories: ["Notes"]
series: ["Linear Algebra"]
note_kind: "foundation"
math: true
---

# 线性代数 Part 9：矩阵函数、迭代法与结构化计算

> [Part 8](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/) 说明了误差如何穿过矩阵和逆映射。本篇收束到“怎样真正计算”：矩阵函数描述重复与连续演化；Neumann 级数把逆写成幂的和；迭代法把一次分解换成反复矩阵向量乘；结构化矩阵则用代数规律减少存储与运算。量化只保留其误差传播接口，具体表示格式与 kernel 行为交回 AI Infra。

全文仍在有限维空间上，底域为 $\mathbb R$ 或 $\mathbb C$。涉及共轭梯度时假设 $A$ Hermitian 正定；涉及 Jacobi 与 Gauss–Seidel 时明确写出矩阵分裂与收敛条件。

主线是

$$
f(A)
\longrightarrow
\sum_{j\ge0}B^j
\longrightarrow
x_{k+1}=Gx_k+c
\longrightarrow
\rho(G)\lt1
\longrightarrow
\text{结构化矩阵向量乘}.
$$

---

## 1. 矩阵多项式与幂级数

对多项式

$$
p(z)=\sum_{j=0}^dc_jz^j,
$$

定义

$$
p(A)=\sum_{j=0}^dc_jA^j,
\qquad
A^0=I.
$$

这是标量函数演算的第一层。若 $A=SBS^{-1}$，则

$$
A^j=SB^jS^{-1},
$$

所以

$$
p(A)=Sp(B)S^{-1}.
$$

矩阵函数因此与换基相容：坐标改变不会改变函数演算所描述的线性映射。

设标量幂级数

$$
f(z)=\sum_{j=0}^\infty c_jz^j
$$

的收敛半径为 $R$。若某个次乘矩阵范数满足 $\|A\|\lt R$，则定义

$$
f(A)=\sum_{j=0}^\infty c_jA^j.
$$

因为

$$
\sum_{j=0}^\infty\|c_jA^j\|
\le
\sum_{j=0}^\infty|c_j|\|A\|^j
\lt\infty,
$$

矩阵级数绝对收敛。

### 对角化情形

若 $A=S\Lambda S^{-1}$ 可对角化，则

$$
f(A)=Sf(\Lambda)S^{-1},
$$

其中

$$
f(\Lambda)
=\operatorname{diag}
\bigl(f(\lambda_1),\ldots,f(\lambda_n)\bigr).
$$

对 normal 矩阵可取 $S=U$ 酉，因此这个公式不会被病态特征向量矩阵额外放大。一般不可对角化矩阵则要在 Jordan 块上加入导数项，或在数值上使用 Schur 形式；这些标准形已放在 [Part 4：特征值、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)。

---

## 2. 矩阵指数与线性微分方程

指数函数是整函数，所以对任意方阵 $A$ 都可定义

$$
e^A
=\sum_{j=0}^\infty\frac{A^j}{j!}.
$$

它满足

$$
e^{SAS^{-1}}=Se^AS^{-1},
$$

$$
(e^A)^{-1}=e^{-A},
$$

以及当 $AB=BA$ 时

$$
e^{A+B}=e^Ae^B.
$$

最后一条需要可交换性；一般矩阵不满足标量指数的简单加法公式。

### 2.1 $e^{tA}$ 是线性系统的演化算子

**定理**：初值问题

$$
x'(t)=Ax(t),
\qquad
x(0)=x_0
$$

的唯一解是

$$
x(t)=e^{tA}x_0.
$$

**证明**：矩阵指数级数在任意有界 $t$ 区间上一致绝对收敛，可以逐项求导：

$$
\frac{d}{dt}e^{tA}
=\frac{d}{dt}
\sum_{j=0}^\infty\frac{t^jA^j}{j!}
=\sum_{j=1}^\infty\frac{t^{j-1}A^j}{(j-1)!}
=Ae^{tA}.
$$

且 $e^{0A}=I$，所以 $e^{tA}x_0$ 满足方程与初值。

若 $x_1,x_2$ 都是解，令 $y=x_1-x_2$。则

$$
\frac{d}{dt}(e^{-tA}y(t))
=-Ae^{-tA}y+e^{-tA}Ay
=0.
$$

由 $y(0)=0$ 得 $e^{-tA}y(t)=0$，从而 $y(t)=0$。唯一性得证。

因此离散重复作用由 $A^k$ 描述，连续时间演化由 $e^{tA}$ 描述。两者都通过谱把高维问题拆成各特征方向上的标量动力学。

---

## 3. Neumann 级数：逆存在的谱判据

标量几何级数的矩阵版本是

$$
\sum_{j=0}^\infty B^j.
$$

**定理**：对有限维方阵 $B$，以下条件等价：

1. Neumann 级数 $\sum_{j=0}^\infty B^j$ 收敛；
2. $B^k\to0$；
3. 谱半径

$$
\rho(B)=\max_{\lambda\in\sigma(B)}|\lambda|
$$

满足 $\rho(B)\lt1$。

此时

$$
\boxed{
(I-B)^{-1}
=\sum_{j=0}^\infty B^j
}.
$$

**证明**：若 $B$ 为实矩阵，下面涉及特征值与 Jordan 形的论证先在其复化上进行；复化不改变谱半径，也不改变有限维下幂或级数是否收敛。

若级数收敛，则相邻部分和之差 $B^k$ 必趋于零，所以 $1\Rightarrow2$。

若 $Bv=\lambda v$，$v\ne0$，则

$$
B^kv=\lambda^kv.
$$

$B^k\to0$ 迫使 $|\lambda|\lt1$，故 $2\Rightarrow3$。

若 $\rho(B)\lt1$，把 $B$ 化为 Jordan 形式。每个 Jordan 块可写成

$$
J=\lambda I+N,
$$

其中 $N$ 幂零。二项式展开给出

$$
J^k
=\sum_{s=0}^{q-1}
\binom{k}{s}
\lambda^{k-s}N^s.
$$

每项都是关于 $k$ 的多项式乘以 $|\lambda|^k$；当 $|\lambda|\lt1$ 时都趋于零，而且 $\sum_k\|J^k\|$ 收敛。有限多个 Jordan 块合并后，$\sum B^k$ 收敛，故 $3\Rightarrow1$。

最后，部分和满足

$$
(I-B)\sum_{j=0}^NB^j=I-B^{N+1}.
$$

令 $N\to\infty$，得到

$$
(I-B)\sum_{j=0}^\infty B^j=I.
$$

右乘版本同理，所以级数就是 $(I-B)^{-1}$。证毕。

更强但更易检查的充分条件是

$$
\|B\|\lt1.
$$

它自动蕴含 $\rho(B)\le\|B\|\lt1$，并给出截断误差界

$$
\left\|
(I-B)^{-1}-\sum_{j=0}^NB^j
\right\|
\le
\frac{\|B\|^{N+1}}{1-\|B\|}.
$$

---

## 4. Stationary iteration 的统一形式

考虑线性方程

$$
Ax=b.
$$

选取矩阵分裂

$$
A=M-N,
$$

其中 $M$ 容易求解。方程等价于

$$
Mx=Nx+b,
$$

于是得到 stationary iteration

$$
x_{k+1}=Gx_k+c,
$$

其中

$$
G=M^{-1}N,
\qquad
c=M^{-1}b.
$$

若 $x_*$ 是精确解，误差 $e_k=x_k-x_*$ 满足

$$
e_{k+1}=Ge_k,
$$

从而

$$
e_k=G^ke_0.
$$

**定理**：stationary iteration 对每个初值 $x_0$ 都收敛到唯一解，当且仅当

$$
\rho(G)\lt1.
$$

**证明**：由上一节，$G^k\to0$ 当且仅当 $\rho(G)\lt1$。而

$$
x_k-x_*=G^k(x_0-x_*).
$$

所以 $G^k\to0$ 正好等价于所有初始误差都消失。证毕。

同样可以从固定点方程得到

$$
x_*=(I-G)^{-1}c
=\sum_{j=0}^\infty G^jc.
$$

迭代法与 Neumann 级数因此是同一个结构：第 $k$ 次迭代累积到第 $k$ 阶的矩阵幂修正。

---

## 5. Jacobi 与 Gauss–Seidel

把 $A$ 唯一分解为

$$
A=D+L+U,
$$

其中 $D$ 为对角部分，$L$ 为严格下三角部分，$U$ 为严格上三角部分。假设 $a_{ii}\ne0$。

### 5.1 Jacobi

Jacobi 同时使用上一步的所有分量：

$$
Dx_{k+1}=b-(L+U)x_k.
$$

所以迭代矩阵为

$$
G_J=-D^{-1}(L+U).
$$

**定理**：若 $A$ 严格按行对角占优，即

$$
|a_{ii}|>
\sum_{j\ne i}|a_{ij}|
\quad\text{对所有 }i,
$$

则 Jacobi 对任意初值收敛。

**证明**：诱导无穷范数满足

$$
\|G_J\|_\infty
=\max_i
\frac{\sum_{j\ne i}|a_{ij}|}{|a_{ii}|}
\lt1.
$$

所以

$$
\rho(G_J)\le\|G_J\|_\infty\lt1.
$$

由 stationary iteration 定理，Jacobi 收敛。证毕。

### 5.2 Gauss–Seidel

Gauss–Seidel 在同一轮中立即使用已经更新的低索引分量：

$$
(D+L)x_{k+1}=b-Ux_k.
$$

其迭代矩阵为

$$
G_{GS}=-(D+L)^{-1}U.
$$

定义 Sassenfeld 系数

$$
\beta_1
=\frac{\sum_{j>1}|a_{1j}|}{|a_{11}|},
$$

以及递归式

$$
\beta_i
=\frac{
\sum_{j\lt i}|a_{ij}|\beta_j
+\sum_{j>i}|a_{ij}|
}{|a_{ii}|}.
$$

**定理（Sassenfeld）**：若

$$
\beta=\max_i\beta_i\lt1,
$$

则 Gauss–Seidel 收敛，并且

$$
\|e_{k+1}\|_\infty
\le\beta\|e_k\|_\infty.
$$

**证明**：误差方程为

$$
(D+L)e_{k+1}=-Ue_k.
$$

按分量写，

$$
|e_{i,k+1}|
\le
\frac{
\sum_{j\lt i}|a_{ij}|\,|e_{j,k+1}|
+\sum_{j>i}|a_{ij}|\,|e_{j,k}|
}{|a_{ii}|}.
$$

从 $i=1$ 开始归纳。若前面已有

$$
|e_{j,k+1}|
\le\beta_j\|e_k\|_\infty,
$$

则

$$
|e_{i,k+1}|
\le\beta_i\|e_k\|_\infty.
$$

对 $i$ 取最大值即得结论。因为 $\beta\lt1$，误差几何收缩。证毕。

严格按行对角占优会通过归纳推出每个 $\beta_i\lt1$，所以它也是 Gauss–Seidel 的充分条件。另有一个标准结论：Hermitian 正定矩阵也保证 Gauss–Seidel 收敛，可由二次能量的逐坐标下降证明；这一结论在本文不再另证，也不作为后续推导的依赖。

---

## 6. 共轭梯度：在 Krylov 子空间中做能量最优

现在假设

$$
A=A^*\succ0.
$$

定义 $A$-内积与 $A$-范数：

$$
\langle x,y\rangle_A=y^*Ax,
\qquad
\|x\|_A=\sqrt{x^*Ax}.
$$

这里继续采用全系列的第一变量线性约定。

两个非零方向 $p_i,p_j$ 称为 $A$-共轭，若

$$
\langle p_i,p_j\rangle_A
=p_j^*Ap_i
=0,
$$

等价地，由 Hermitian 性也有 $p_i^*Ap_j=0$。

给定初值 $x_0$，共轭梯度法（CG）为

$$
r_0=b-Ax_0,
\qquad
p_0=r_0,
$$

并迭代

$$
\alpha_k
=\frac{r_k^*r_k}{p_k^*Ap_k},
$$

$$
x_{k+1}=x_k+\alpha_kp_k,
$$

$$
r_{k+1}=r_k-\alpha_kAp_k,
$$

$$
\beta_k
=\frac{r_{k+1}^*r_{k+1}}{r_k^*r_k},
$$

$$
p_{k+1}=r_{k+1}+\beta_kp_k.
$$

由于 $A\succ0$，只要尚未收敛就有 $p_k^*Ap_k>0$，所以步长定义良好。

### 6.1 正交与共轭递推引理

定义 Krylov 子空间

$$
\mathcal K_k(A,r_0)
=\operatorname{span}
\{r_0,Ar_0,\ldots,A^{k-1}r_0\}.
$$

**引理**：在尚未终止的精确算术 CG 中：

1. 残差 $r_0,r_1,\ldots$ 两两正交；
2. 搜索方向 $p_0,p_1,\ldots$ 两两 $A$-共轭；
3. 对每个 $k$，

$$
\operatorname{span}\{p_0,\ldots,p_{k-1}\}
=\mathcal K_k(A,r_0).
$$

**证明**：对 $k$ 归纳。$k=0$ 时 $p_0=r_0$，所以本步所需的恒等式 $r_0^*p_0=r_0^*r_0$ 直接成立。对 $k\ge1$，假设到第 $k$ 步以前成立。因为

$$
p_k=r_k+\beta_{k-1}p_{k-1}
$$

且 $r_k$ 与以前的搜索方向正交，所以

$$
r_k^*p_k=r_k^*r_k.
$$

由 $\alpha_k$ 的定义，

$$
p_k^*r_{k+1}
=p_k^*r_k-\alpha_kp_k^*Ap_k
=0.
$$

对 $j\lt k$，利用归纳假设中的 $p_j^*r_k=0$ 与 $p_j^*Ap_k=0$，

$$
p_j^*r_{k+1}
=p_j^*r_k-\alpha_kp_j^*Ap_k
=0.
$$

所以 $r_{k+1}$ 与 $p_0,\ldots,p_k$ 全部正交。又因为 $r_0=p_0$，而对 $j\ge1$ 有

$$
r_j=p_j-\beta_{j-1}p_{j-1},
$$

每个旧残差都在旧搜索方向张成的空间中，故 $r_{k+1}$ 也与 $r_0,\ldots,r_k$ 正交，得到第一条。

下面证明新方向与旧方向 $A$-共轭。由

$$
Ap_j=\frac{r_j-r_{j+1}}{\alpha_j}
$$

以及残差两两正交，对 $j\lt k$ 有

$$
p_j^*Ar_{k+1}
=(Ap_j)^*r_{k+1}
=0.
$$

因此

$$
p_j^*Ap_{k+1}
=p_j^*A(r_{k+1}+\beta_kp_k)
=0.
$$

对 $j=k$，仍用 $Ap_k=(r_k-r_{k+1})/\alpha_k$，得到

$$
p_k^*Ar_{k+1}
=-\frac{r_{k+1}^*r_{k+1}}{\alpha_k}.
$$

另一方面，

$$
\beta_kp_k^*Ap_k
=\frac{r_{k+1}^*r_{k+1}}{r_k^*r_k}
\frac{r_k^*r_k}{\alpha_k}
=\frac{r_{k+1}^*r_{k+1}}{\alpha_k}.
$$

两项抵消，所以 $p_k^*Ap_{k+1}=0$，第二条得证。

最后，递推式表明 $p_k\in\mathcal K_{k+1}(A,r_0)$。尚未终止时，非零的两两 $A$-共轭方向线性无关，因此前 $k+1$ 个方向张成一个 $k+1$ 维子空间；它包含在 $\mathcal K_{k+1}$ 中，而后者由 $k+1$ 个向量生成，故二者相等。归纳完成。证毕。

### 6.2 Krylov 最优性

**定理**：精确算术下，CG 满足

$$
x_k\in x_0+\mathcal K_k(A,r_0),
$$

并且

$$
x_k
=\operatorname*{argmin}_{x\in x_0+\mathcal K_k(A,r_0)}
\|x-x_*\|_A,
$$

其中 $x_*=A^{-1}b$。

**证明**：由上一引理，$x_k-x_0$ 是 $p_0,\ldots,p_{k-1}$ 的线性组合，所以 $x_k\in x_0+\mathcal K_k$。又因为 $r_k$ 与 $\mathcal K_k$ 正交，而

$$
r_k=b-Ax_k=-A(x_k-x_*),
$$

所以对任意 $z\in\mathcal K_k$，

$$
\langle x_k-x_*,z\rangle_A
=z^*A(x_k-x_*)
=-z^*r_k
=0.
$$

即 $x_k-x_*$ 与 $\mathcal K_k$ 在 $A$-内积下正交。任取 $x=x_k+z\in x_0+\mathcal K_k$，由勾股恒等式，

$$
\|x-x_*\|_A^2
=\|x_k-x_*\|_A^2+\|z\|_A^2
\ge\|x_k-x_*\|_A^2.
$$

所以 $x_k$ 是唯一极小点。等价地，它也最小化二次函数

$$
\phi(x)=\frac12x^*Ax-\operatorname{Re}(b^*x).
$$

因为

$$
\phi(x)-\phi(x_*)
=\frac12\|x-x_*\|_A^2,
$$

证毕。

非零的 $A$-共轭向量必线性无关，因此最多 $n$ 个方向就张成整个空间。由此得到：CG 在精确算术下至多 $n$ 步终止。有限精度下共轭性会逐渐损失，所以实际停止由残差与误差容限决定，而不是等待形式上的 $n$ 步。

### 6.3 条件数控制的收敛界

**定理**：设 $\kappa=\kappa_2(A)=\lambda_{\max}/\lambda_{\min}$。对每个 $k\ge1$，

$$
\boxed{
\|x_k-x_*\|_A
\le
2
\left(
\frac{\sqrt\kappa-1}{\sqrt\kappa+1}
\right)^k
\|x_0-x_*\|_A
}.
$$

在 $k=0$ 时，初始误差就是自身，不需要用这个收敛因子估计。

**证明**：若 $\kappa=1$，Hermitian 正定矩阵的全部特征值相同，由谱定理 $A=\lambda I$，CG 一步即得到精确解；对 $k\ge1$ 结论直接成立。下面设 $\kappa>1$，于是 $\lambda_{\max}-\lambda_{\min}>0$。

Krylov 向量可以写成多项式作用在初始误差上，所以存在次数不超过 $k$、满足 $p(0)=1$ 的多项式，使

$$
e_k=p(A)e_0.
$$

CG 的最优性给出

$$
\|e_k\|_A
\le
\min_{p(0)=1,\ \deg p\le k}
\max_{\lambda\in[\lambda_{\min},\lambda_{\max}]}
|p(\lambda)|
\,\|e_0\|_A.
$$

选取缩放后的 Chebyshev 多项式

$$
p_k(\lambda)
\mathrel{=}
\frac{
T_k\!\left(
\dfrac{\lambda_{\max}+\lambda_{\min}-2\lambda}
{\lambda_{\max}-\lambda_{\min}}
\right)
}{
T_k\!\left(
\dfrac{\lambda_{\max}+\lambda_{\min}}
{\lambda_{\max}-\lambda_{\min}}
\right)
}.
$$

分子在谱区间上的绝对值不超过 $1$，而分母的双曲余弦表达给出

$$
\max_{\lambda\in[\lambda_{\min},\lambda_{\max}]}
|p_k(\lambda)|
\le
2
\left(
\frac{\sqrt\kappa-1}{\sqrt\kappa+1}
\right)^k.
$$

代回即得。证毕。

这条界说明预条件的目标：把谱压缩到更窄区间，降低有效条件数，从而减少 Krylov 迭代次数。

---

## 7. Hadamard 积与 Schur 乘积定理

对同形矩阵 $A,B\in\mathbb F^{m\times n}$，Hadamard 积逐元素定义为

$$
(A\circ B)_{ij}=a_{ij}b_{ij}.
$$

它不是线性映射的复合；它保留坐标位置并逐点调制。

**定理（Schur product theorem）**：若

$$
A\succeq0,
\qquad
B\succeq0,
$$

则

$$
A\circ B\succeq0.
$$

**证明**：PSD 矩阵都是 Gram 矩阵，所以存在向量 $x_i,y_i$。按本文第一变量线性约定，标准 Gram 索引写成

$$
a_{ij}=\langle x_j,x_i\rangle,
\qquad
b_{ij}=\langle y_j,y_i\rangle.
$$

在张量积空间中，

$$
\langle x_j\otimes y_j,x_i\otimes y_i\rangle
=\langle x_j,x_i\rangle
\langle y_j,y_i\rangle
=a_{ij}b_{ij}.
$$

因此 $A\circ B$ 是向量组 $x_i\otimes y_i$ 的 Gram 矩阵，必半正定。证毕。

这条定理是逐元素乘法仍能保留某些全局谱结构的关键条件；任意两个矩阵逐元素相乘则没有这样的保证。

---

## 8. Kronecker 积、张量结构与 vec 恒等式

若

$$
A\in\mathbb F^{m\times n},
\qquad
B\in\mathbb F^{p\times q},
$$

定义 Kronecker 积

$$
A\otimes B
\mathrel{=}
\begin{pmatrix}
a_{11}B&\cdots&a_{1n}B\\
\vdots&\ddots&\vdots\\
a_{m1}B&\cdots&a_{mn}B
\end{pmatrix}
\in\mathbb F^{mp\times nq}.
$$

它满足混合乘积规则：只要普通乘法尺寸相容，

$$
(A\otimes B)(C\otimes D)
=(AC)\otimes(BD),
$$

以及

$$
(A\otimes B)^*=A^*\otimes B^*.
$$

**证明**：先对纯张量 $x\otimes y$ 验证

$$
(A\otimes B)(x\otimes y)
=(Ax)\otimes(By).
$$

再连续作用 $C\otimes D$，得到

$$
(A\otimes B)(C\otimes D)(x\otimes y)
=(ACx)\otimes(BDy).
$$

纯张量张成整个张量积空间，所以两个算子相等。伴随公式同理由内积定义得到。证毕。

若 $Ax=\lambda x$、$By=\mu y$，则

$$
(A\otimes B)(x\otimes y)
=\lambda\mu(x\otimes y).
$$

这证明了两侧特征向量张成空间中的乘积特征对。要覆盖不可对角化情形并计入代数重数，分别取 Schur 分解

$$
A=UT_AU^*,
\qquad
B=VT_BV^*,
$$

其中 $T_A,T_B$ 上三角。由混合乘积公式，

$$
A\otimes B
=(U\otimes V)
(T_A\otimes T_B)
(U\otimes V)^*.
$$

$T_A\otimes T_B$ 仍为上三角，其对角元正是 $T_A,T_B$ 对角元的两两乘积。因此即使 $A$ 或 $B$ 不可对角化，$A\otimes B$ 的全部特征值（按代数重数计）仍是两侧特征值的两两乘积。

按列堆叠矩阵定义 $\operatorname{vec}(X)$，则有核心恒等式

$$
\boxed{
\operatorname{vec}(AXB^{\mathsf T})
=(B\otimes A)\operatorname{vec}(X)
}.
$$

它把矩阵方程改写成更大的线性方程；反过来，如果算法不显式形成 $B\otimes A$，也可以利用左乘 $A$、右乘 $B^{\mathsf T}$ 的结构显著降低存储。

---

## 9. 稀疏、带状、Toeplitz 与循环结构

### 9.1 稀疏矩阵

记

$$
\operatorname{nnz}(A)
$$

为非零元个数。稠密矩阵向量乘通常需要 $O(mn)$ 次乘加；若只遍历非零元，稀疏矩阵向量乘的算术量为

$$
O(\operatorname{nnz}(A)).
$$

CSR 与 CSC 等格式保存非零值、索引和行列边界。这个复杂度结论依赖算法确实使用稀疏格式；把稀疏矩阵展开成稠密数组不会自动获得节省。

带状矩阵进一步限制非零元只出现在若干条对角线附近。若半带宽固定，存储与矩阵向量乘都可以随 $n$ 线性增长；对应的消元也能利用带宽控制 fill-in。

### 9.2 Toeplitz 与循环矩阵

Toeplitz 矩阵满足

$$
T_{ij}=t_{i-j},
$$

即每条对角线为常数。循环矩阵是带周期边界的 Toeplitz 特例，由第一列 $c=(c_0,\ldots,c_{n-1})^{\mathsf T}$ 完全确定。

采用从 $0$ 到 $n-1$ 的下标，并明确规定循环矩阵

$$
C_{ij}=c_{(i-j)\bmod n}.
$$

令

$$
\omega=e^{-2\pi i/n},
$$

并定义 unitary DFT 矩阵

$$
F_{jk}=\frac{\omega^{jk}}{\sqrt n},
\qquad
j,k=0,\ldots,n-1.
$$

记 $f_k$ 为 $F$ 的第 $k$ 列，并定义

$$
\lambda_k
=\sum_{\ell=0}^{n-1}c_\ell\omega^{-\ell k}
=\sqrt n\,(F^*c)_k.
$$

**定理**：每个按上述约定定义的循环矩阵都被 $F$ 酉对角化：

$$
\boxed{
C=F\operatorname{diag}(\lambda_0,\ldots,\lambda_{n-1})F^*
}.
$$

**证明**：第 $i$ 个分量为

$$
\begin{aligned}
(Cf_k)_i
&=\sum_{j=0}^{n-1}
c_{(i-j)\bmod n}
\frac{\omega^{jk}}{\sqrt n}\\
&=\frac{\omega^{ik}}{\sqrt n}
\sum_{\ell=0}^{n-1}c_\ell\omega^{-\ell k}\\
&=\lambda_k(f_k)_i,
\end{aligned}
$$

其中第二行换元 $\ell=(i-j)\bmod n$。所以 $Cf_k=\lambda_kf_k$。$F$ 的列构成标准正交基，即 $F^*F=I$，合并全部特征向量便得

$$
CF=F\operatorname{diag}(\lambda_k),
$$

右乘 $F^*$ 得到结论。证毕。

由此，循环卷积可以通过

$$
\text{FFT}
\longrightarrow
\text{逐点相乘}
\longrightarrow
\text{inverse FFT}
$$

在 $O(n\log n)$ 时间内完成，而无需显式构造 $n\times n$ 矩阵。

---

## 10. 量化的线性代数接口：先把它当作结构化扰动

这里不讨论 INT8、FP8、per-channel scale、饱和策略或具体硬件指令，只建立量化如何进入矩阵误差界。

在不发生 clipping 的范围内，步长为 $s>0$ 的最近邻均匀量化写成

$$
Q_s(x)=s\operatorname{round}(x/s).
$$

量化误差

$$
\delta x=Q_s(x)-x
$$

满足

$$
|\delta x|\le\frac s2.
$$

对 $A\in\mathbb R^{m\times n}$ 逐元素量化，写

$$
\widehat A=A+\Delta A.
$$

若统一步长为 $s_A$ 且不 clipping，则

$$
\|\Delta A\|_F
\le\frac{s_A}{2}\sqrt{mn}.
$$

现在同时量化矩阵乘法的两侧：

$$
\widehat A=A+\Delta A,
\qquad
\widehat B=B+\Delta B.
$$

误差具有精确分解

$$
\widehat A\widehat B-AB
=\Delta A\,B
+A\,\Delta B
+\Delta A\,\Delta B.
$$

因此

$$
\|\widehat A\widehat B-AB\|_F
\le
\|\Delta A\|_F\|B\|_2
+\|A\|_2\|\Delta B\|_F
+\|\Delta A\|_F\|\Delta B\|_2.
$$

这条式子给出线性代数层面的责任边界：scale 和 clipping 决定 $\Delta A,\Delta B$，矩阵范数决定扰动怎样穿过乘法，后续层与非线性则继续传播这些误差。

真实系统还必须考虑 accumulator 精度、FMA 舍入顺序、outlier 通道、内存带宽和 kernel 是否真的使用目标低精度格式。这些不是再写一遍矩阵扰动理论能回答的；它们归入 [AI Infra 的真实实现与验证链](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/)，该系列也明确区分数学正确性与真实低精度 kernel 证据。

---

## 11. 结构不是装饰，而是复杂度假设

本篇各类方法的计算前提可以整理为：

| 结构 | 可利用的代数事实 | 主要节省 |
|---|---|---|
| $\rho(G)\lt1$ | $G^k\to0$，Neumann 级数收敛 | 用反复更新替代显式逆 |
| 严格对角占优 | Jacobi / Gauss–Seidel 收缩 | 便宜的 stationary iteration |
| Hermitian 正定 | CG 的 $A$-内积与 Krylov 最优性 | 只需矩阵向量乘，不需分解 |
| Hadamard + PSD | Schur 乘积仍 PSD | 保持核与协方差结构 |
| Kronecker | 混合乘积与 vec 恒等式 | 用小因子表示大算子 |
| sparse / banded | 只访问非零元或局部带宽 | 存储与乘法降到近线性 |
| circulant | 被 DFT 对角化 | FFT 将乘法降到 $O(n\log n)$ |
| quantized | 可写成 $A+\Delta A$ | 用误差换表示与吞吐；系统收益需实测 |

如果实现没有利用这些结构，公式本身不会自动降低成本。反之，结构一旦被正确编码，许多“大矩阵算法”其实从未需要形成那张大矩阵。

---

## 12. 线性代数主线的收束

从 Part 0 到本篇，有限维主线已经闭合：

$$
\text{线性映射与坐标}
\longrightarrow
\text{子空间与投影}
\longrightarrow
\text{方程与伪逆}
\longrightarrow
\text{谱与标准形}
\longrightarrow
\text{Hermitian / PSD}
\longrightarrow
\text{分解}
\longrightarrow
\text{近似}
\longrightarrow
\text{稳定性}
\longrightarrow
\text{结构化计算}.
$$

矩阵函数说明映射如何重复作用，迭代法说明如何用便宜步骤逼近逆，结构化代数说明何时可以避免通用稠密计算。Attention、聚类、量化 kernel 等任务只在这里领取所需的线性代数接口；它们的模型语义与系统证据继续留在 ML 和 AI Infra 系列，不再复制成第二份数学正文。

[上一篇：Part 8——条件数、数值稳定性与正则化](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)

[返回：Part 0——矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)

[进入：无监督表征系列](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)

[进入：AI Infra 实现与验证链](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/)
