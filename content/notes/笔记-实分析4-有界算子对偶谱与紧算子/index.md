---
date: '2026-05-14T18:00:00+09:00'
draft: false
title: '实分析 Part 4：有界线性算子、对偶空间、谱理论与紧算子'
summary: "从 Hilbert 空间走到算子。先把有界 ⟺ 连续这条等价钉死，建立 𝓑(X,Y) 与对偶空间 X*，由 Riesz 表示定理把 Hilbert 空间和它的对偶等同；再上谱理论与自伴算子，最后到紧算子的谱定理——把反问题里『小奇异值放大噪声』这件事翻译成谱语言，自然引出 Tikhonov 正则化的滤子解释。"
description: "泛函分析进阶笔记：有界线性算子、算子范数、有界与连续的等价、算子空间 𝓑(X,Y)、对偶空间、Riesz 表示定理、谱与预解集、伴随与自伴算子、紧算子、紧自伴算子的谱定理、反问题的病态性、Tikhonov 与截断 SVD 的谱层面解释。"
tags: ["Functional Analysis", "Bounded Operator", "Operator Norm", "Dual Space", "Riesz Representation", "Spectrum", "Self-Adjoint", "Compact Operator", "Spectral Theorem", "Inverse Problem", "Tikhonov Regularization", "SVD", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-实分析4-有界算子谱与紧算子/
  - /notes/笔记-泛函分析2-算子对偶谱/
---

# 实分析 Part 4：有界线性算子、对偶空间、谱理论与紧算子

> 实分析 Part 4 = 泛函分析 Part 2。Part 3 把舞台搭好（度量 → 范数 → 内积 → Hilbert），这一篇上演员（**算子**），并把"反问题为什么病态、为什么要正则化"这件长期被当作工程经验的事翻译成谱语言。

链条：

$$
\text{有界线性算子}\to\mathcal{B}(X,Y)\to\text{对偶 }X^*\to\text{Riesz 表示}\to\text{谱}\to\text{自伴}\to\text{紧算子谱定理}\to\text{反问题与正则化}
$$

每一步都在做同一件事：**把有限维线性代数里熟悉的东西（矩阵、转置、特征值、对角化、伪逆）一件一件地搬到无穷维 Hilbert 空间里，并指出哪些直接搬、哪些要补完备性、哪些要加紧性才能活下来。**

几个需要注意的点（写在前面）：

- 对线性算子，**有界 ⟺ 连续**——这是泛函分析的入口；
- $\mathcal{B}(X,Y)$ 在 $Y$ 完备时自动 Banach，所以 $X^*=\mathcal{B}(X,\mathbb{K})$ **总是** Banach；
- Riesz 表示定理让 Hilbert 与它的对偶**等距同构**，于是无穷维内积空间里"取坐标 = 与基向量做内积"完全合法；
- 谱在无穷维不只是特征值——还有连续谱、剩余谱；但**紧算子的非零谱就是一组退化到 $0$ 的特征值**，这条让紧自伴算子像有限对称矩阵一样"对角化"；
- **反问题的病态性 = 算子谱里 $0$ 是聚点**；Tikhonov 正则化就是在谱上加一个滤子 $\sigma^2/(\sigma^2+\alpha)$，把小奇异值方向上对噪声的放大压下去。

---

## 1. 有界线性算子

### 线性 + 有界

设 $X,Y$ 是赋范空间，$T:X\to Y$。

**线性**：

$$
\forall x,y\in X,\ \alpha,\beta\in\mathbb{K},\ T(\alpha x+\beta y)=\alpha Tx+\beta Ty.
$$

**有界**：$\exists M\ge 0$，使得

$$
\forall x\in X,\ \|Tx\|_Y\le M\|x\|_X.
$$

### 算子范数

$$
\|T\|_{\text{op}}=\sup_{x\ne 0}\frac{\|Tx\|_Y}{\|x\|_X}=\sup_{\|x\|_X=1}\|Tx\|_Y=\sup_{\|x\|_X\le 1}\|Tx\|_Y.
$$

三种写法等价（线性性把单位球上的 sup 拉伸成全空间的 sup）。$\|T\|_{\text{op}}$ 是使

$$
\|Tx\|_Y\le\|T\|_{\text{op}}\|x\|_X
$$

成立的**最小** $M$。

### 有界 ⟺ 连续

**命题**：对**线性**算子 $T:X\to Y$，

$$
T \text{ 有界}\ \iff\ T \text{ 连续}\ \iff\ T \text{ 在 }0\text{ 处连续}.
$$

{{< details summary="证明：有界 ⟺ 连续（线性算子专有等价）" >}}

**有界 $\Rightarrow$ 连续**：

$$
\|T(x_n)-T(x)\|=\|T(x_n-x)\|\le\|T\|_{\text{op}}\|x_n-x\|\to 0.
$$

所以 $T$ 在每一点连续。

**连续 $\Rightarrow$ 在 $0$ 处连续**：平凡。

**在 $0$ 处连续 $\Rightarrow$ 有界**：

由 $0$ 处连续，对 $\varepsilon=1$，$\exists\delta\gt 0$ 使

$$
\|x\|\le\delta\ \Rightarrow\ \|Tx\|\le 1.
$$

对任意 $x\ne 0$，令 $y=\dfrac{\delta x}{\|x\|}$，则 $\|y\|=\delta$，故 $\|Ty\|\le 1$，即

$$
\frac{\delta}{\|x\|}\|Tx\|\le 1\ \Rightarrow\ \|Tx\|\le\frac{1}{\delta}\|x\|.
$$

所以 $T$ 有界，且 $\|T\|_{\text{op}}\le 1/\delta$。

{{< /details >}}

**这条等价是线性映射独有的**。一般非线性映射"有界"和"连续"是两个完全独立的概念。线性结构把它俩压成同一件事——这也是为什么泛函分析里"算子"默认就是"线性 + 连续"两件套。

### 例子

| 算子 | 作用 | $\|T\|_{\text{op}}$ |
|------|------|---------------------|
| 恒等 $I:X\to X$ | $Ix=x$ | $1$ |
| 乘性算子 $M_\varphi:L^2\to L^2$ | $(M_\varphi f)(t)=\varphi(t)f(t)$ | $\|\varphi\|_\infty$ |
| 左移 $S:\ell^2\to\ell^2$ | $(Sx)_n=x_{n+1}$ | $1$ |
| 积分算子 $T_K:L^2[0,1]\to L^2[0,1]$ | $(T_Kf)(x)=\int_0^1 K(x,y)f(y)\,dy$ | $\le\|K\|_{L^2}$ |

最后一条是 PDE 和反问题里最重要的算子类——Hilbert–Schmidt 算子。它自动是紧算子（§6）。

---

## 2. 算子空间 $\mathcal{B}(X,Y)$

记

$$
\mathcal{B}(X,Y)=\{T:X\to Y \mid T \text{ 线性且有界}\}.
$$

### 是赋范空间

向量空间结构：$(\alpha S+\beta T)x=\alpha Sx+\beta Tx$。

范数：算子范数 $\|\cdot\|_{\text{op}}$。三条公理都易验证。

### $Y$ 完备 $\Rightarrow\mathcal{B}(X,Y)$ 完备

**命题**：若 $Y$ 是 Banach 空间，则 $\mathcal{B}(X,Y)$ 也是 Banach 空间。

{{< details summary="证明：$\mathcal{B}(X,Y)$ 完备性（逐点取极限 + 一致性）" >}}

设 $(T_n)\subseteq\mathcal{B}(X,Y)$ 是 Cauchy 列。

**第一步：每个点处的像是 Cauchy**。

$\forall x\in X$，

$$
\|T_nx-T_mx\|\le\|T_n-T_m\|_{\text{op}}\|x\|\to 0.
$$

所以 $(T_nx)$ 是 $Y$ 中的 Cauchy 列。由 $Y$ 完备，$\exists Tx\in Y$ 使 $T_nx\to Tx$。

**第二步：$T$ 是线性的**。

由极限的代数运算，

$$
T(\alpha x+\beta y)=\lim_n T_n(\alpha x+\beta y)=\alpha\lim_n T_nx+\beta\lim_n T_ny=\alpha Tx+\beta Ty.
$$

**第三步：$T$ 是有界的，且 $T_n\to T$ 按算子范数**。

$(T_n)$ Cauchy 故有界：$\exists M$，$\|T_n\|_{\text{op}}\le M$。取极限 $\|Tx\|\le M\|x\|$，故 $T$ 有界。

任取 $\varepsilon\gt 0$，$\exists N$ 使 $\forall m,n\ge N$，$\|T_n-T_m\|_{\text{op}}\lt\varepsilon$。固定 $n\ge N$，对 $\|x\|\le 1$，

$$
\|T_nx-Tx\|=\lim_m\|T_nx-T_mx\|\le\lim_m\|T_n-T_m\|_{\text{op}}\le\varepsilon.
$$

对所有 $\|x\|\le 1$ 同时成立，故 $\|T_n-T\|_{\text{op}}\le\varepsilon$。即 $T_n\to T$。

{{< /details >}}

这条结论的直接推论决定了下一节：**对偶空间 $X^*=\mathcal{B}(X,\mathbb{K})$ 永远完备**（因为 $\mathbb{R}$ 和 $\mathbb{C}$ 都完备）。

### 复合与算子代数

**复合的范数控制**：

$$
\|ST\|_{\text{op}}\le\|S\|_{\text{op}}\|T\|_{\text{op}}.
$$

证明：$\|STx\|\le\|S\|\|Tx\|\le\|S\|\|T\|\|x\|$。

当 $X=Y$ 时，$\mathcal{B}(X)=\mathcal{B}(X,X)$ 既是 Banach 空间又有乘法（复合）和单位元（$I$），构成**Banach 代数 (Banach algebra)**。谱理论的舞台就是它。

---

## 3. 对偶空间 $X^*$

### 定义

$$
X^*=\mathcal{B}(X,\mathbb{K})=\{f:X\to\mathbb{K} \mid f \text{ 线性且有界}\}.
$$

元素 $f\in X^*$ 称为 $X$ 上的**有界线性泛函 (bounded linear functional)**。

由 §2 结论，$X^*$ **总是** Banach 空间，与 $X$ 是否完备无关。

范数：

$$
\|f\|_{X^*}=\sup_{\|x\|\le 1}|f(x)|.
$$

### 经典对偶配对

| $X$ | $X^*$ | 配对 |
|-----|-------|------|
| $\mathbb{R}^n$ | $\mathbb{R}^n$ | $f(x)=\sum f_ix_i$ |
| $\ell^p,\ 1\le p\lt\infty$ | $\ell^q,\ \tfrac1p+\tfrac1q=1$ | $f(x)=\sum f_nx_n$ |
| $L^p[a,b],\ 1\le p\lt\infty$ | $L^q[a,b]$ | $f(g)=\int fg$ |
| $c_0$ (零序列) | $\ell^1$ | $f(x)=\sum f_nx_n$ |

注意 $\ell^\infty\ne(\ell^1)^*$ 的反向（$(\ell^\infty)^*$ 严格大于 $\ell^1$），这是 $p=\infty$ 例外的一个表现。

### Hahn–Banach 定理

> **Hahn–Banach**：定义在子空间 $M\subseteq X$ 上的有界线性泛函 $f_0$，可以延拓为 $X$ 上的有界线性泛函 $f$，且 $\|f\|_{X^*}=\|f_0\|_{M^*}$。

直接推论是 $X^*$ "足够大"——对任意 $x\ne 0$，$\exists f\in X^*$ 使 $f(x)\ne 0$。这条保证了 $X$ 自然嵌入 $X^{**}$，并使弱拓扑成为有意义的概念。

**自反 (reflexive)**：$X$ 自反，若典范映射 $X\hookrightarrow X^{**}$ 是满射。

- $\ell^p\ (1\lt p\lt\infty)$、$L^p\ (1\lt p\lt\infty)$、所有 Hilbert 空间——自反；
- $\ell^1$、$\ell^\infty$、$L^1$、$L^\infty$——不自反。

自反性是后续弱收敛理论里"有界 $\Rightarrow$ 弱列紧"的前提（Banach–Alaoglu + 自反 $\Rightarrow$ 弱列紧）。

---

## 4. Riesz 表示定理

到 Hilbert 空间这一层，**$H$ 与 $H^*$ 不只是同构，是等距同构**。

**命题（Riesz 表示）**：设 $H$ 是 Hilbert 空间，则

$$
\forall f\in H^*,\ \exists!\,y_f\in H,\ \forall x\in H,\ f(x)=\langle x,y_f\rangle.
$$

进一步 $\|f\|_{H^*}=\|y_f\|_H$。

也就是 Hilbert 空间上的有界线性泛函 = "和某个固定向量做内积"，**没有别的形式**。

{{< details summary="证明：Riesz 表示定理（用正交分解）" >}}

若 $f=0$，取 $y_f=0$。

否则令 $N=\ker f=\{x:f(x)=0\}$。$f$ 连续 $\Rightarrow N$ 是 $H$ 的闭子空间。又 $f\ne 0\Rightarrow N\subsetneq H$。

由 §4（Part 3）正交分解，$N^\perp\ne\{0\}$。取 $z\in N^\perp$ 满足 $\|z\|=1$。

**关键构造**：对任意 $x\in H$，令

$$
u=f(x)z-f(z)x.
$$

计算 $f(u)=f(x)f(z)-f(z)f(x)=0$，故 $u\in N$。又 $z\in N^\perp$，于是

$$
\langle u,z\rangle=0\ \Rightarrow\ \langle f(x)z-f(z)x,z\rangle=0\ \Rightarrow\ f(x)\langle z,z\rangle=f(z)\langle x,z\rangle.
$$

由 $\|z\|=1$ 得

$$
f(x)=f(z)\langle x,z\rangle=\langle x,\overline{f(z)}z\rangle.
$$

（复数情形需把标量挪进内积的第二参数时取共轭；实数情形 $\overline{f(z)}=f(z)$。）

取 $y_f=\overline{f(z)}z$ 即得 $f(x)=\langle x,y_f\rangle$。

**唯一性**：若另有 $y'_f$ 满足，$\langle x,y_f-y'_f\rangle=0,\ \forall x$；取 $x=y_f-y'_f$ 得 $\|y_f-y'_f\|=0$。

**等距**：

$$
\|f\|=\sup_{\|x\|\le 1}|\langle x,y_f\rangle|\le\|y_f\|\quad(\text{Cauchy–Schwarz}),
$$

取 $x=y_f/\|y_f\|$ 达到上界，故 $\|f\|=\|y_f\|$。

{{< /details >}}

直接推论：

1. **$H$ 自反**：$H\cong H^*\cong H^{**}$ 都等距同构；
2. **弱收敛在 Hilbert 上有干净的形式**：

$$
x_n\rightharpoonup x\ \iff\ \forall y\in H,\ \langle x_n,y\rangle\to\langle x,y\rangle.
$$

3. **任意 Hilbert 上的线性方程都可以读成内积方程**——这是 §5 里定义伴随算子的基础。

---

## 5. 谱、伴随与自伴算子

下面 $H$ 是 Hilbert，$T\in\mathcal{B}(H)$。

### 伴随算子 $T^*$

由 Riesz，对任意固定 $y\in H$，映射 $x\mapsto\langle Tx,y\rangle$ 是 $H$ 上的有界线性泛函，故 $\exists!\,T^*y\in H$ 使

$$
\langle Tx,y\rangle=\langle x,T^*y\rangle,\quad\forall x,y\in H.
$$

容易验证 $T^*\in\mathcal{B}(H)$ 且 $\|T^*\|_{\text{op}}=\|T\|_{\text{op}}$。

**自伴 (self-adjoint)**：$T=T^*$。对应有限维的"对称矩阵"。

### 谱与预解集

**谱**：

$$
\sigma(T)=\{\lambda\in\mathbb{C}:T-\lambda I \text{ 在 }\mathcal{B}(H)\text{ 中不可逆}\}.
$$

**预解集**：$\rho(T)=\mathbb{C}\setminus\sigma(T)$，对应的 $R(\lambda;T)=(T-\lambda I)^{-1}$ 称为**预解算子 (resolvent)**。

谱分三类：

| 类别 | 名称 | 描述 |
|------|------|------|
| $\sigma_p(T)$ | 点谱 (point spectrum) | $\lambda$ 是特征值：$\exists x\ne 0,\ Tx=\lambda x$ |
| $\sigma_c(T)$ | 连续谱 (continuous spectrum) | $T-\lambda I$ 单射、值域稠密但非满 |
| $\sigma_r(T)$ | 剩余谱 (residual spectrum) | $T-\lambda I$ 单射但值域不稠密 |

有限维 $T$，$\sigma(T)=\sigma_p(T)$ 完全就是特征值集合；无穷维一般要分三类。

### 谱的基本结构

- **谱不空 + 紧致**（复 Banach 空间上）：$\sigma(T)$ 是 $\mathbb{C}$ 中非空紧集；
- **谱半径** $r(T)=\sup\{|\lambda|:\lambda\in\sigma(T)\}=\lim_n\|T^n\|^{1/n}\le\|T\|_{\text{op}}$。

### 自伴算子的关键性质

**性质 A：特征值为实数**。

{{< details summary="证明：自伴算子特征值是实的" >}}

设 $Tx=\lambda x$，$x\ne 0$。由自伴性，

$$
\lambda\|x\|^2=\langle Tx,x\rangle=\langle x,Tx\rangle=\overline{\langle Tx,x\rangle}=\overline\lambda\|x\|^2.
$$

故 $\lambda=\overline\lambda$，即 $\lambda\in\mathbb{R}$。

{{< /details >}}

**性质 B：不同特征值的特征向量正交**。

{{< details summary="证明：不同特征值 ⇒ 特征向量正交" >}}

$Tx_1=\lambda_1x_1$，$Tx_2=\lambda_2x_2$，$\lambda_1\ne\lambda_2$，都实。

$$
\lambda_1\langle x_1,x_2\rangle=\langle Tx_1,x_2\rangle=\langle x_1,Tx_2\rangle=\lambda_2\langle x_1,x_2\rangle.
$$

故 $(\lambda_1-\lambda_2)\langle x_1,x_2\rangle=0$。由 $\lambda_1\ne\lambda_2$，$\langle x_1,x_2\rangle=0$。

{{< /details >}}

**性质 C**：$\sigma(T)\subseteq\mathbb{R}$，且 $\|T\|_{\text{op}}=\sup_{\|x\|=1}|\langle Tx,x\rangle|$。

这些性质把"对称矩阵的频谱在实轴上、谱半径就是数值范围"原封不动地搬到了无穷维。

---

## 6. 紧算子与谱定理

自伴算子的谱可能很复杂（含连续谱），要得到"对角化"必须再加一条结构性条件——**紧性**。

### 紧算子

$K:X\to Y$ 是**紧算子 (compact operator)**，若 $K$ 把 $X$ 的有界集映成 $Y$ 中的相对紧集。等价地：

$$
\forall\text{ 有界列 }(x_n)\subseteq X,\ (Kx_n)\text{ 有收敛子列}.
$$

> 这正是 Part 2 里 Bolzano–Weierstrass 在无穷维空间"残破"后留下的那一缝隙：$\ell^2$ 单位球不列紧，但**经过紧算子映过去就重新列紧**。

### 紧算子的性质

- **有限秩算子**（像空间有限维）紧；
- 紧算子按算子范数取极限**仍紧**：$\mathcal{K}(X,Y)$ 是 $\mathcal{B}(X,Y)$ 的闭子空间；
- 紧 $\circ$ 有界 = 紧，有界 $\circ$ 紧 = 紧——紧算子是 $\mathcal{B}(H)$ 中的**双边理想**；
- 无穷维空间上，恒等映射 $I$ **不紧**（否则单位球列紧，矛盾）。

### 紧算子的谱结构

**定理 (Riesz–Schauder)**：设 $K\in\mathcal{B}(X)$ 紧，则

1. $\sigma(K)\setminus\{0\}$ 只由**特征值**组成；
2. 每个非零特征值的特征空间 $\ker(K-\lambda I)$ **有限维**；
3. $\sigma(K)$ 至多可数，**$0$ 是唯一可能的聚点**。

形式上：

$$
\sigma(K)=\{0\}\cup\{\lambda_n\}_{n\ge 1},\qquad |\lambda_1|\ge|\lambda_2|\ge\cdots,\quad \lambda_n\to 0\ (\text{或有限多项}).
$$

无穷维时 $0$ 总在 $\sigma(K)$ 里（否则 $K$ 可逆 $\Rightarrow I=K\cdot K^{-1}$ 紧，矛盾）。

### 谱定理（紧自伴情形）

把"紧"和"自伴"凑齐，就得到无穷维 Hilbert 空间上的对角化。

**谱定理**：设 $K\in\mathcal{B}(H)$ 紧且自伴。则存在 $H$ 的正交归一基 $\{e_n\}$ 由 $K$ 的特征向量组成，对应特征值 $\lambda_n\in\mathbb{R}$，$\lambda_n\to 0$，使得

$$
Kx=\sum_n\lambda_n\langle x,e_n\rangle e_n,\quad\forall x\in H.
$$

等价写法：

$$
K=\sum_n\lambda_n P_n,
$$

其中 $P_n$ 是到 $\ker(K-\lambda_n I)$ 的正交投影。

这是有限维"对称矩阵正交对角化 $A=U\Lambda U^\top$"在无穷维的完整搬运。**完备性 + 紧性**联手，把可数无穷个特征模式对角化，并保证级数在 $H$ 范数下收敛。

### SVD 推论（一般紧算子）

把谱定理用到 $K^*K$（自伴、半正定、紧），得到 $K$ 自己的**奇异值分解**：

$$
K=\sum_n\sigma_n\langle\cdot,v_n\rangle u_n,\qquad \sigma_1\ge\sigma_2\ge\cdots\ge 0,\ \sigma_n\to 0.
$$

$\{v_n\},\{u_n\}$ 分别是 $K^*K$、$KK^*$ 的特征基。这就是有限维 SVD 的无穷维原型。

---

## 7. 反问题的病态性与正则化的谱解释

到这里，所有工具齐了。把它们摆在反问题前面，**"病态"和"正则化"瞬间变成纯代数事实**——这正是 Part 2、Part 3 一直在铺垫的兑现时刻。

### 反问题与紧算子

典型反问题：已知 $y$，解

$$
Kx=y,
$$

其中 $K:H_1\to H_2$ 是紧算子（地球物理反演的前向算子、CT 的 Radon 变换、椭圆 PDE 的解算子……都是紧的）。

**病态的本质**：

- $K$ 紧、无穷维 $\Rightarrow K^{-1}$（若存在）**无界**；
- 也就是说 $y$ 的微小扰动可以让 $x$ 任意大；
- 数据噪声直接放大成解的爆炸。

### SVD 视角

写 $K$ 的 SVD：

$$
K=\sum_n\sigma_n\langle\cdot,v_n\rangle u_n.
$$

形式上的"伪逆"解（Moore–Penrose）是

$$
x^\dagger=K^\dagger y=\sum_n\frac{1}{\sigma_n}\langle y,u_n\rangle v_n.
$$

**关键观察**：$\sigma_n\to 0$，所以 $1/\sigma_n\to\infty$。$y$ 在 $u_n$ 方向上含一点噪声 $\eta_n$，传到 $x^\dagger$ 上就是 $\eta_n/\sigma_n$——**小奇异值方向上噪声被放大到爆炸**。

> 用 §6 的语言总结：**反问题病态 ⟺ $\sigma_n\to 0$ ⟺ $0\in\sigma(K)$ 是聚点 ⟺ $K^{-1}$ 无界**。这是工程"病态"二字的纯谱描述。

### 截断 SVD (TSVD)

**最直接的正则化**：只保留 $\sigma_n$ 超过某个阈值 $\tau$ 的方向：

$$
x_\tau=\sum_{\sigma_n\gt \tau}\frac{1}{\sigma_n}\langle y,u_n\rangle v_n.
$$

小奇异值方向**直接砍掉**，避免噪声放大。代价是丢失了 $\sigma_n\le\tau$ 方向上的信号。

### Tikhonov 正则化

更平滑的做法：把 $K^\dagger$ 中的 $1/\sigma_n$ 替换为**滤子 (filter)** $\sigma_n/(\sigma_n^2+\alpha)$：

$$
x_\alpha=\sum_n\frac{\sigma_n}{\sigma_n^2+\alpha}\langle y,u_n\rangle v_n.
$$

等价的算子写法：

$$
x_\alpha=(K^*K+\alpha I)^{-1}K^*y.
$$

**滤子分析**：

| 方向 | $\sigma_n$ 大 (信号方向) | $\sigma_n$ 小 (噪声方向) |
|------|---------------------------|---------------------------|
| 滤子 $\dfrac{\sigma_n}{\sigma_n^2+\alpha}$ 行为 | $\approx 1/\sigma_n$（保留） | $\approx\sigma_n/\alpha\to 0$（压制） |

也就是 Tikhonov 在谱上扮演的角色是：**对大 $\sigma_n$ 几乎透明（保留信号），对小 $\sigma_n$ 平滑截断（压住噪声放大）**。

更直观：

$$
\text{Tikhonov 是 TSVD 的"软"版本}.
$$

TSVD 是硬截断（指示函数），Tikhonov 是软截断（光滑滤子）。$\alpha\to 0$ 退化为伪逆，$\alpha\to\infty$ 退化为零解；中间挑一个让"信号保留 + 噪声压制"取平衡。

### 参考对接

把这一节摆在你之前做过的几篇笔记旁边：

- [线性代数 Part 0–2](https://r1skers.github.io/notes/笔记-线性代数2-正则化与稳定反演/) 里"奇异矩阵 → SVD → 正则化"的全过程；
- [计算科学与高可靠系统设计 Part 8–10](https://r1skers.github.io/notes/笔记-计算科学与高可靠系统设计8-正则化、先验与稳定反演/) 里 Tikhonov + 先验 + 光滑项的实际数值实验。

**都是这一节谱定理 + 滤子分析的特例**。线性代数版本用的是有限维矩阵 SVD；这里 §6–§7 是它在无穷维 Hilbert 空间上的母体。从工程直觉（"小奇异值放大噪声，要压一下"）到纯谱事实（"$0$ 是紧算子谱的聚点，滤子 $\sigma/(\sigma^2+\alpha)$ 在这附近驱零"），中间的转换全部在本篇里完成了。

---

## 总结：三条主轴

这一篇围绕三件事打转：

1. **算子是泛函的核心对象**：$\mathcal{B}(X,Y)$、对偶 $X^*$、伴随 $T^*$、谱 $\sigma(T)$——把"映射"本身当成研究对象，加上完备性 + 范数 + 内积让"算子也是空间里的元素"成立。
2. **Riesz + 自伴 + 紧性 = 无穷维对角化**：单独任何一条都不够，三者凑齐才给出谱定理。Riesz 让 $T^*$ 有定义、自伴让谱实、紧让谱退化为可数特征值——逐步把无穷维约束回到"看起来像有限维"的状态。
3. **反问题的病态 = 谱上的事实**：$0\in\sigma(K)$ 是聚点是病态的本质；Tikhonov 是谱滤子；正则化的所有工程花样，本质都在选不同滤子函数 $\varphi(\sigma)$ 替换 $1/\sigma$。

