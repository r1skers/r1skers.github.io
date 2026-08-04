---
date: '2026-05-14T10:00:00+09:00'
draft: false
title: '实分析 Part 3：度量空间、赋范空间、Hilbert 空间与傅里叶基础'
summary: "从 ℝ 的完备性出发把分析推广到一般空间——度量、范数、内积一层一层加结构，直到 Hilbert 空间，最后用正交归一基与 Parseval 等式把傅里叶级数和傅里叶变换装回严格基础。"
description: "实分析进阶笔记：度量空间、赋范空间、Banach 空间、内积空间、Hilbert 空间、Cauchy–Schwarz 不等式、正交分解定理、正交投影、Bessel 不等式、Parseval 等式、傅里叶级数的 L² 基础，以及傅里叶变换作为无穷维坐标变换的视角。"
tags: ["Mathematics", "Real Analysis", "Fourier Transform"]
categories: ["Notes"]
series: ["Real and Functional Analysis"]
note_kind: "foundation"
aliases:
  - /notes/笔记-实分析3-度量赋范hilbert与傅里叶/
  - /notes/note-ra-3-metric-normed-hilbert-fourier/
---

# 实分析 Part 3：度量空间、赋范空间、Hilbert 空间与傅里叶基础

Part 2 收尾时留了一句话：

**完备性等价链里只有 Cauchy 完备性是能脱离序结构推广出去的那一条。**

这一篇就把它兑现：从 ℝ 出发，把分析的全部语言一层一层抽出来，配上越来越多的结构，最后落到 Hilbert 空间——傅里叶的天然舞台。

整条链是这样：

$$
\varepsilon\text{-}N \to \text{完备性} \to \text{度量空间} \to \text{赋范空间} \to \text{内积空间} \to \text{Hilbert 空间} \to \text{正交分解} \to \text{傅里叶}
$$

每一步只多加一种结构，多兑现一类几何对象：

- 度量给"距离"；
- 范数给"长度"；
- 内积给"角度"；
- 完备性把所有 Cauchy 列的极限收归空间内。

到 Hilbert 这一层，ℝⁿ 的所有几何（投影、正交、坐标分解）都重新成立，只是维数从有限变成可数无穷。傅里叶级数其实就是这件事的一个具体实例。

几个需要注意的点（写在前面）：
- 度量、范数、内积之间是**层层加结构**的关系，不是并列；
- Part 2 里证过的命题（收敛唯一性、收敛列有界、收敛 ⇒ Cauchy）在度量空间里一字不改地都成立——**证一次，处处用**；
- Cauchy–Schwarz 不等式是内积诱导范数的命根子；
- 正交分解定理的存在性证明是"最小化 + 完备性 + 验证正交"的经典三步套路；
- 傅里叶级数 = Hilbert 空间里的坐标分解，傅里叶变换 = 无穷维坐标变换。

---

## 1. 度量空间 (Metric Space)

### 动机

回头看 ℝ 上的全部分析，核心其实是 $|a_n-a|$ 这一个距离对象。把"距离"这件事抽离出来当成原始结构，所有 $\varepsilon$-$N$ 语言、柯西列、完备性都可以原封不动地搬过去。

### 定义

$(X, d)$ 是**度量空间**，若 $d:X\times X\to\mathbb{R}$ 满足：

1. **非负与可分**：$\forall x,y,\ d(x,y)\ge 0$，且 $d(x,y)=0\iff x=y$；
2. **对称**：$\forall x,y,\ d(x,y)=d(y,x)$；
3. **三角不等式**：$\forall x,y,z,\ d(x,z)\le d(x,y)+d(y,z)$。

### 例子

- $(\mathbb{R},|x-y|)$：Part 1、Part 2 的全部内容；
- $(\mathbb{R}^n, \|x-y\|_2)$：欧几里得距离；
- **离散度量** $d(x,y)=0$ 若 $x=y$，否则 $=1$。它是反例制造机：所有点彼此等距，没有数列收敛到外面去。用于检验定义而不是真正做分析；
- $(C[0,1], \max_t|f(t)-g(t)|)$：元素是**函数**，距离是它们在区间上的最大偏差。这是分析进入泛函世界的第一个标志——**距离的"点"可以是函数**。

### 度量空间上的收敛与 Cauchy

**收敛**：

$$
x_n\to x\ \iff\ \forall \varepsilon\gt 0,\ \exists N,\ \forall n\ge N,\ d(x_n,x)\lt \varepsilon.
$$

**Cauchy 列**：

$$
(x_n)\text{ Cauchy}\ \iff\ \forall \varepsilon\gt 0,\ \exists N,\ \forall m,n\ge N,\ d(x_m,x_n)\lt \varepsilon.
$$

**完备度量空间**：每个 Cauchy 列都在空间内收敛。

### 不完备的例子

$(\mathbb{Q},|\cdot|)$：序列

$$
1,\ 1.4,\ 1.41,\ 1.414,\ \ldots
$$

是 Cauchy 的，但它逼近的 $\sqrt 2\notin\mathbb{Q}$，**落脚点掉到空间外面去了**。这正是 Part 2 反复强调的"完备性补 Cauchy 极限"。

### 证一次，处处用

Part 1、Part 2 在 ℝ 上证过的所有"$|\cdot|$ 类命题"——收敛极限唯一、收敛列有界、收敛 ⇒ Cauchy——在**任意度量空间**里证明完全相同，只要把 $|\cdot|$ 换成 $d(\cdot,\cdot)$。这是抽象化的第一个红利：

**证一次，处处用。**

只有反过来 "Cauchy $\Rightarrow$ 收敛" 这一条不自动成立，它的成立与否定义了"完备"。

---

## 2. 赋范空间 (Normed Space)

### 定义

$(V,\|\cdot\|)$ 是**赋范空间**，若 $V$ 是实（或复）向量空间，$\|\cdot\|:V\to\mathbb{R}$ 满足：

1. **非负与可分**：$\|x\|\ge 0$，且 $\|x\|=0\iff x=0$；
2. **齐次性**：$\|\alpha x\|=|\alpha|\,\|x\|$；
3. **三角不等式**：$\|x+y\|\le\|x\|+\|y\|$。

范数比度量多出来的两条信息——**齐次性**（缩放尺度）与**对加法的相容性**——背后是线性结构。

### 范数诱导度量

$$
d(x,y)=\|x-y\|.
$$

立刻满足度量三条公理。所以：

$$
\text{赋范空间} \subset \text{度量空间}.
$$

### Banach 空间

$$
\text{Banach 空间} = \text{完备的赋范空间}.
$$

ℝⁿ 是 Banach，$C[0,1]$ 配 $\sup$ 范数也是 Banach。

### 一个不完备的赋范空间

取

$$
V=\bigl\{(x_1,x_2,\ldots) : \text{只有有限项非零}\bigr\}\subset\mathbb{R}^{\mathbb{N}},
$$

配 $\ell^2$ 范数 $\|x\|_2=\sqrt{\sum x_n^2}$。考虑序列

$$
x^{(N)}=\bigl(1,\tfrac{1}{2},\tfrac{1}{3},\ldots,\tfrac{1}{N},0,0,\ldots\bigr)\in V.
$$

它是 Cauchy 列（尾项 $\sum_{n\gt N}\tfrac{1}{n^2}\to 0$），但它要逼近的目标

$$
\bigl(1,\tfrac12,\tfrac13,\ldots\bigr)
$$

**有无穷多项非零，不在 $V$ 里**。Cauchy 列的落脚点掉出空间——$V$ 不完备。把这些"理应存在但缺席的落脚点"补上去，得到的就是 $\ell^2$，完备。

> 这是抽象完备性问题的第一手感：**完备化 = 把所有 Cauchy 列的极限请回家**。

---

## 3. 内积空间与 Hilbert 空间

### 内积

$\langle\cdot,\cdot\rangle:V\times V\to\mathbb{R}$ 是 $V$ 上的**内积**，若：

1. **对称**：$\langle x,y\rangle=\langle y,x\rangle$；
2. **双线性的第一变量线性**：$\langle\alpha x+y,z\rangle=\alpha\langle x,z\rangle+\langle y,z\rangle$；
3. **正定**：$\langle x,x\rangle\ge 0$，且 $\langle x,x\rangle=0\iff x=0$。

> **复数版本**：把对称性换成共轭对称 $\langle x,y\rangle=\overline{\langle y,x\rangle}$，第一变量线性、第二变量共轭线性。Fourier 那一节就要切到复版本。

### 内积诱导范数

$$
\|x\|=\sqrt{\langle x,x\rangle}.
$$

它确实满足范数三公理，但**第三条三角不等式不显然**——它需要 Cauchy–Schwarz 兜底。

### 三层嵌套

$$
\text{内积空间}\subset\text{赋范空间}\subset\text{度量空间}.
$$

每加一层，几何对象更多一样：度量给"远近"，范数加"长度与缩放"，内积加"角度与正交"。

### Cauchy–Schwarz 不等式

$$
\forall x,y\in V,\ |\langle x,y\rangle|\le\|x\|\cdot\|y\|.
$$

{{< details summary="证明：Cauchy–Schwarz（判别式法）" >}}

若 $y=0$，两边为零，平凡。设 $y\ne 0$。

对任意 $t\in\mathbb{R}$，由正定性

$$
0\le\|x-ty\|^2=\langle x-ty,x-ty\rangle=\|x\|^2-2t\langle x,y\rangle+t^2\|y\|^2.
$$

把右边看作关于 $t$ 的二次函数。它对所有 $t$ 非负 $\iff$ 判别式 $\le 0$：

$$
\bigl(2\langle x,y\rangle\bigr)^2-4\|x\|^2\|y\|^2\le 0,
$$

即

$$
\langle x,y\rangle^2\le\|x\|^2\|y\|^2.
$$

两边开方得 $|\langle x,y\rangle|\le\|x\|\,\|y\|$。

{{< /details >}}

它的三件用途：

1. **保三角不等式成立**：$\|x+y\|^2=\|x\|^2+2\langle x,y\rangle+\|y\|^2\le\|x\|^2+2\|x\|\|y\|+\|y\|^2=(\|x\|+\|y\|)^2$，所以内积诱导的"$\sqrt{\langle\cdot,\cdot\rangle}$"是合法的范数；
2. **定义夹角**：$\cos\theta=\dfrac{\langle x,y\rangle}{\|x\|\,\|y\|}\in[-1,1]$；
3. **在 $L^2$ 上变成 Hölder 不等式的特例**，在偏微分方程、数值分析、概率论里到处出现。

### Hilbert 空间

$$
\text{Hilbert 空间} = \text{完备的内积空间}.
$$

典型例子：

- $\mathbb{R}^n$（有限维总是完备）；
- $\ell^2=\bigl\{(x_n):\sum x_n^2\lt\infty\bigr\}$；
- $L^2[0,1]=\bigl\{f:\int_0^1|f|^2\lt\infty\bigr\}$（后面 §6 会重用）。

---

## 4. 正交性与正交分解

到这一节，**角度结构**正式上场。

### 正交

$x\perp y\ \iff\ \langle x,y\rangle=0$。

**勾股定理**：

$$
x\perp y\ \Rightarrow\ \|x+y\|^2=\|x\|^2+\|y\|^2.
$$

证明就是展开 $\|x+y\|^2=\langle x+y,x+y\rangle=\|x\|^2+2\langle x,y\rangle+\|y\|^2$，交叉项为零。

### 正交补

设 $M\subseteq V$ 是子集，

$$
M^\perp=\{x\in V:\langle x,y\rangle=0,\ \forall y\in M\}.
$$

容易验证 $M^\perp$ 总是 $V$ 的**闭线性子空间**。

### 正交分解定理

**命题**：设 $H$ 是 Hilbert 空间，$M\subseteq H$ 是闭子空间，则

$$
\forall x\in H,\ \exists!\,(m,m^\perp)\in M\times M^\perp,\ x=m+m^\perp.
$$

**唯一性**：

{{< details summary="证明：唯一性" >}}

若 $x=m_1+m_1^\perp=m_2+m_2^\perp$，则

$$
m_1-m_2=m_2^\perp-m_1^\perp.
$$

左边在 $M$ 里，右边在 $M^\perp$ 里，所以两边同属 $M\cap M^\perp$。但 $z\in M\cap M^\perp$ 意味着 $\langle z,z\rangle=0$，即 $z=0$。故 $m_1=m_2,\ m_1^\perp=m_2^\perp$。

{{< /details >}}

**存在性**：这是分析味儿最浓的一步，套路是"最小化 + 完备性 + 验证正交"。

{{< details summary="证明：存在性（最小化 → Cauchy → 完备性给落脚点 → 验证正交）" >}}

**第一步：构造最小化序列。**

令 $d=\inf_{y\in M}\|x-y\|$。由下确界的等价刻画，存在序列 $y_n\in M$ 使得

$$
\|x-y_n\|\to d.
$$

**第二步：$(y_n)$ 是 Cauchy 列。**

关键是**平行四边形恒等式**（任何内积空间都成立）：

$$
\|u+v\|^2+\|u-v\|^2=2\|u\|^2+2\|v\|^2.
$$

取 $u=x-y_m,\ v=x-y_n$，则 $u+v=2x-(y_m+y_n)$，$u-v=y_n-y_m$。代入：

$$
\|2x-(y_m+y_n)\|^2+\|y_n-y_m\|^2=2\|x-y_m\|^2+2\|x-y_n\|^2.
$$

整理：

$$
\|y_n-y_m\|^2=2\|x-y_m\|^2+2\|x-y_n\|^2-4\left\|x-\tfrac{y_m+y_n}{2}\right\|^2.
$$

因 $\tfrac{y_m+y_n}{2}\in M$（$M$ 是子空间），故 $\|x-\tfrac{y_m+y_n}{2}\|\ge d$。所以

$$
\|y_n-y_m\|^2\le 2\|x-y_m\|^2+2\|x-y_n\|^2-4d^2\to 2d^2+2d^2-4d^2=0.
$$

即 $(y_n)$ 是 Cauchy 列。

**第三步：完备性给出落脚点。**

$H$ 完备 ⇒ $y_n\to m\in H$。

$M$ 闭 ⇒ $m\in M$。

由距离的连续性 $\|x-m\|=d$。

**第四步：验证 $x-m\in M^\perp$。**

$\forall v\in M$, $\forall t\in\mathbb{R}$，因 $m+tv\in M$，

$$
\|x-m\|^2\le\|x-m-tv\|^2=\|x-m\|^2-2t\langle x-m,v\rangle+t^2\|v\|^2.
$$

即 $0\le -2t\langle x-m,v\rangle+t^2\|v\|^2$ 对所有 $t$ 成立。把它看作关于 $t$ 的二次函数，**在 $t=0$ 处取最小** $\Leftrightarrow$ 一次项系数为零，即

$$
\langle x-m,v\rangle=0,\quad\forall v\in M.
$$

所以 $x-m\in M^\perp$。

取 $m^\perp=x-m$ 即得分解 $x=m+m^\perp$。

{{< /details >}}

证明的骨架值得记住：

> **最小化问题 → Cauchy 列 → 完备性给落脚点 → 用变分论证验证正交。**

完备性是关键——任何不完备空间里这种构造都会缺最后一步的落脚点。

### 正交投影

定义 $P_M x=m$，即上面分解里的 $M$-分量。它满足

$$
\|x-P_Mx\|=\min_{y\in M}\|x-y\|.
$$

**$P_Mx$ 是 $M$ 中距 $x$ 最近的点**。这条**最佳逼近性质**是后面：

- Galerkin 方法（PDE 数值解）；
- 最小二乘（正规方程）；
- 有限元方法（弱形式上的投影）；
- 傅里叶截断（部分和的最优性）

的共同核心。

---

## 5. 正交归一基与傅里叶

### 正交归一集

$\{e_n\}_{n\in\mathbb{N}}\subseteq H$ 是**正交归一集 (orthonormal set)**，若

$$
\langle e_i,e_j\rangle=\delta_{ij}=\begin{cases}1,&i=j\\0,&i\ne j\end{cases}.
$$

### Fourier 系数

$$
\hat x_n=\langle x,e_n\rangle.
$$

几何上：$x$ 在 $e_n$ 方向的投影长度。这跟 $\mathbb{R}^n$ 里"取第 $i$ 坐标 $=$ 内积 $\langle x,e_i\rangle$"一字不差。

### Bessel 不等式

$$
\sum_{n=1}^\infty|\hat x_n|^2\le\|x\|^2.
$$

{{< details summary="证明：Bessel 不等式" >}}

令 $S_N=\sum_{n=1}^N\hat x_n e_n$ 为 $x$ 在前 $N$ 个基方向上的部分投影。由正交归一性，

$$
\|S_N\|^2=\sum_{n=1}^N|\hat x_n|^2,\qquad\langle x,S_N\rangle=\sum_{n=1}^N|\hat x_n|^2.
$$

展开

$$
0\le\|x-S_N\|^2=\|x\|^2-2\langle x,S_N\rangle+\|S_N\|^2=\|x\|^2-\sum_{n=1}^N|\hat x_n|^2.
$$

整理：

$$
\sum_{n=1}^N|\hat x_n|^2\le\|x\|^2.
$$

对 $N$ 取极限即得 Bessel 不等式。

{{< /details >}}

直观地讲，Bessel 在说：**$x$ 在所有基方向上的"分量总能量"不超过它自身的能量。**

### 正交归一基

$\{e_n\}$ 是**正交归一基 (orthonormal basis)**，若它正交归一**且对所有 $x\in H$**，

$$
x=\sum_{n=1}^\infty\hat x_n e_n
$$

在 $H$ 的范数意义下收敛。这一步收敛**完全依赖完备性**——部分和 $S_N$ 是 Cauchy 列（由 Bessel 可证），需要 $H$ 完备才能找到极限。

此时 Bessel 取等号，称为 **Parseval 等式**：

$$
\|x\|^2=\sum_{n=1}^\infty|\hat x_n|^2.
$$

### 与 $\mathbb{R}^n$ 的对照

| | $\mathbb{R}^n$ | Hilbert 空间 $H$ |
|---|---|---|
| 坐标 | $x_i=\langle x,e_i\rangle$ | $\hat x_n=\langle x,e_n\rangle$ |
| 重建 | $x=\sum_{i=1}^n x_i e_i$ | $x=\sum_{n=1}^\infty\hat x_n e_n$ |
| 范数 | $\|x\|^2=\sum_i x_i^2$ | $\|x\|^2=\sum_n|\hat x_n|^2$ |

结构**完全平行**，差别只在求和从有限变成可数无穷。**完备性是保证无穷级数收敛的那块底板。**

---

## 6. 傅里叶级数的 Hilbert 空间基础

### 舞台：$L^2[0,T]$

$$
L^2[0,T]=\left\{f:[0,T]\to\mathbb{C}\ \Big|\ \int_0^T|f(t)|^2\,dt\lt\infty\right\},
$$

配上内积（复版本）

$$
\langle f,g\rangle=\frac{1}{T}\int_0^T f(t)\,\overline{g(t)}\,dt.
$$

$L^2[0,T]$ 是 Hilbert 空间（完备性是 $L^2$ 理论的核心结论，背后用到 Riesz–Fischer 定理 / 测度论）。

### 基函数的正交归一性

取

$$
e_n(t)=e^{jn\omega_0 t},\qquad \omega_0=\frac{2\pi}{T},\quad n\in\mathbb{Z}.
$$

计算

$$
\langle e_m,e_n\rangle=\frac{1}{T}\int_0^T e^{jm\omega_0 t}\overline{e^{jn\omega_0 t}}\,dt=\frac{1}{T}\int_0^T e^{j(m-n)\omega_0 t}\,dt=\delta_{mn}.
$$

$m\ne n$ 时被积函数是非零频率的复指数，整周期上平均为零；$m=n$ 时被积函数恒为 $1$，积分为 $T$，除掉 $1/T$ 系数得 $1$。

所以 $\{e_n\}_{n\in\mathbb{Z}}$ 是 $L^2[0,T]$ 的一组**正交归一基**（基性的证明属于经典 Fourier 理论结论）。

### Fourier 系数 = 内积投影

$$
c_n=\langle f,e_n\rangle=\frac{1}{T}\int_0^T f(t)\,e^{-jn\omega_0 t}\,dt.
$$

这正是工科 / 信号教材里 Fourier 系数的标准公式。它的**意义**现在彻底清楚：

**$c_n$ 是 $f$ 在第 $n$ 个基方向上的投影长度（坐标）。**

"乘上目标频率的复指数再积分"这个魔法操作，本质就是 **§5 里取坐标 = 与基向量做内积** 的实例。正交性消掉所有其他频率分量的交叉项，只留目标频率自己。

### 重建与 Parseval

$$
f=\sum_{n=-\infty}^\infty c_n e_n\quad(L^2\text{ 意义下收敛}),
$$

$$
\frac{1}{T}\int_0^T|f(t)|^2\,dt=\sum_{n=-\infty}^\infty|c_n|^2.
$$

左边是 $f$ 在时域的能量（平均），右边是它在频域的能量谱之和。**时域能量 $=$ 频域能量**。

这就是 §5 通用 Parseval 等式 $\|x\|^2=\sum|\hat x_n|^2$ 在 $L^2[0,T]$ 上的具体写法。

### $T\to\infty$：傅里叶变换

把周期 $T$ 拉到无穷，离散频率 $\{n\omega_0\}_{n\in\mathbb{Z}}$ 间距 $\omega_0=2\pi/T\to 0$，离散求和过渡为连续积分：

$$
F(\omega)=\int_{-\infty}^\infty f(t)\,e^{-j\omega t}\,dt,\qquad f(t)=\frac{1}{2\pi}\int_{-\infty}^\infty F(\omega)\,e^{j\omega t}\,d\omega.
$$

对应的 Parseval（Plancherel）等式：

$$
\int_{-\infty}^\infty|f(t)|^2\,dt=\frac{1}{2\pi}\int_{-\infty}^\infty|F(\omega)|^2\,d\omega.
$$

把 §5 的有限基扩张到"连续基"（$\{e^{j\omega t}\}_{\omega\in\mathbb{R}}$），整套坐标语言就从可数无穷推广到不可数连续。**傅里叶变换 $=$ 无穷维空间里的坐标变换，结构与 $\mathbb{R}^n$ 里的标准基分解完全平行。**

到这里，Part 1 的 $\varepsilon$-$N$、Part 2 的完备性、本篇前 5 节的几何抽象，全部接上了你做信号处理、PDE、量子力学时一直在用的傅里叶。

---

## 总结：三件事贯穿始终

Hilbert 空间 → 傅里叶这条链能跑通，靠的是三件事互相咬合：

1. **内积定义角度**：有了 $\langle\cdot,\cdot\rangle$ 才有"正交"，有了正交才有"分解"，是后续一切几何的源头。
2. **正交性消交叉项**：Fourier 系数 $c_n=\langle f,e_n\rangle$ 的计算公式不是凭空来的——它就是正交基下的标准坐标读取。"乘以目标频率再积分"，消掉交叉项，只剩目标分量。
3. **完备性保证落脚点**：无穷级数 $\sum c_n e_n$ 收敛、最小化序列有极限、$L^2$ 内的 Cauchy 列必有 $L^2$ 极限——这些都在用完备性。**完备性是分析能在无穷维空间里活下去的氧气。**

**与泛函分析的连接**：下一站是**有界线性算子 (bounded linear operators)**。Hilbert 空间是它的自然舞台——伴随、谱、紧算子、自伴等概念都建立在内积 + 完备性之上。傅里叶变换本身就是一个酉算子（unitary operator）的例子，留待后续展开。
