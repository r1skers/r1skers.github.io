---
date: '2026-06-09T10:00:00+09:00'
draft: false
title: '实分析 Part 5：弱收敛、Hahn–Banach 与 Banach 不动点定理'
summary: "继续 Part 4 的对偶空间。先用 Hilbert 上 e_n ⇀ 0 这个反例把强/弱收敛的真实分歧钉死；再借 Banach–Alaoglu 把 BW 在无穷维里的失效一半地恢复回来。然后从 Hahn–Banach 拉出三个推论——保范延拓、范数对偶刻画、凸集分离——这是泛函分析里把抽象空间『看清楚』的扳手。最后用 Banach 不动点定理把这些工具落回数值方法：完备性是不动点存在的命根子，几何收敛速度直接挂在压缩常数 k 上，与条件数 κ 形成闭环。"
description: "泛函分析进阶笔记：强收敛与弱收敛、弱收敛在 Hilbert 上的内积形式、弱下半连续性、Banach–Alaoglu 与弱列紧、Hahn–Banach 延拓定理及三个推论（保范延拓、范数对偶刻画、凸集分离）、Banach 不动点定理、压缩映射、完备性在不动点证明里的角色、几何收敛速度与条件数的联系。"
tags: ["Mathematics", "Real Analysis", "Functional Analysis", "Convergence"]
categories: ["Notes"]
series: ["Real and Functional Analysis"]
note_kind: "foundation"
aliases:
  - /notes/笔记-实分析5-弱收敛hahnbanach不动点/
  - /notes/笔记-泛函分析3-弱收敛hahnbanach不动点/
  - /notes/note-ra-5-weak-convergence-hahn-banach-fixed-point/
---

# 实分析 Part 5：弱收敛、Hahn–Banach 与 Banach 不动点定理

> 实分析 Part 5 = 泛函分析 Part 3。Part 4 把舞台搭好（算子 → 对偶 → 谱），这一篇把"对偶空间"这件武器真正用起来——**弱收敛**让 Bolzano–Weierstrass 在无穷维空间里一半地恢复，**Hahn–Banach** 让我们能从对偶端"看"原空间，**Banach 不动点定理**把整套抽象工具落回数值方法的几何收敛上。

链条：

$$
\text{强收敛} \to \text{弱收敛} \to \text{弱下半连续} \to \text{Banach–Alaoglu / 弱列紧} \to \text{Hahn–Banach 与三推论} 
$$

$$
 \to \text{Banach 不动点} \to \text{收敛速度} \leftrightarrow \text{条件数}
$$

主旋律：

- **强 $\Rightarrow$ 弱，反之不然**。例：$\ell^2$ 中 $e_n \rightharpoonup 0$ 但 $\|e_n\|=1$ 永不强收敛。
- **弱拓扑救回 BW**：自反空间（含 Hilbert）的闭球**弱列紧**——Banach–Alaoglu。这是变分法存在性证明的核心引擎。
- **Hahn–Banach** 是泛函分析"看清空间"的扳手。三个面孔：保范延拓、范数对偶刻画 $\|x\|=\sup_{\|f\|\le 1}|f(x)|$、凸集几何分离。
- **Banach 不动点**：完备 + 压缩 = 唯一不动点 + 几何收敛 $d(x_n, x^\star) \le \tfrac{k^n}{1-k}\,d(x_0, x_1)$。**别忘了完备性**。
- **收敛速度 $\leftrightarrow$ 条件数**：压缩常数 $k$ 由谱半径 $\rho(I - M^{-1}A)$ 控制，而 $\rho$ 又被条件数 $\kappa(A)$ 限制。Tikhonov 提升 $\sigma_{\min}$ → 降低 $\kappa$ → 收紧 $k$ → 加速迭代。

---

## 1. 强收敛与弱收敛

### 定义

设 $X$ 是赋范空间，$X^*$ 是它的对偶。

**强收敛 (strong convergence)**：

$$
x_n \to x\ \iff\ \|x_n - x\|_X \to 0.
$$

**弱收敛 (weak convergence)**：

$$
x_n \rightharpoonup x\ \iff\ \forall f \in X^*,\ f(x_n) \to f(x).
$$

记号上，弱收敛用 $\rightharpoonup$ 区别于强收敛的 $\to$。

**理解**：强收敛要求"$x_n$ 整体长度上靠近 $x$"；弱收敛只要求"每一根连续线性测量上 $x_n$ 靠近 $x$"。

> 把 $f$ 想成"一种观测仪器"——弱收敛是**每一种仪器读出来都收敛**，但物体本身可能还在以一种不可被任何仪器单独捕捉的方式"摇晃"。

### 强 $\Rightarrow$ 弱

**命题**：

$$
x_n \to x\ \Rightarrow\ x_n \rightharpoonup x.
$$

{{< details summary="证明：强收敛 ⇒ 弱收敛" >}}

任取 $f \in X^*$。由 $f$ 有界（即连续），

$$
|f(x_n) - f(x)| = |f(x_n - x)| \le \|f\|_{X^*}\,\|x_n - x\|_X \to 0.
$$

所以 $f(x_n) \to f(x)$。

{{< /details >}}

### 反之不然：$\ell^2$ 中的标准基

**反例**：$X = \ell^2$，$e_n = (0, \ldots, 0, 1, 0, \ldots)$（第 $n$ 位为 $1$）。

**断言**：$e_n \rightharpoonup 0$，但 $\|e_n\| = 1$ 不强收敛。

{{< details summary="证明：e_n ⇀ 0 但 ‖e_n‖ = 1" >}}

由 Riesz 表示（Part 4 §4），$\ell^2$ 上的有界线性泛函都是与某个 $y \in \ell^2$ 做内积的形式 $f(x) = \langle x, y \rangle = \sum_k x_k \overline{y_k}$。

于是

$$
f(e_n) = \langle e_n, y \rangle = \overline{y_n}.
$$

因为 $y \in \ell^2$，$\sum_k |y_k|^2 \lt \infty$，故 $y_n \to 0$，所以 $f(e_n) \to 0 = f(0)$。

对所有 $f$ 都成立，即 $e_n \rightharpoonup 0$。

另一方面 $\|e_n\| = 1$ 不依赖 $n$，所以 $\|e_n - 0\| = 1 \not\to 0$，即不强收敛。

{{< /details >}}

这是无穷维空间最干净的反例。它说明**单位球面上的点列可以无穷多次"绕圈"，每根坐标方向上都消散到零，但整体能量始终为 1**——一种纯粹的"无穷维振荡"。

### 极限的唯一性

弱极限唯一：若 $x_n \rightharpoonup x$ 且 $x_n \rightharpoonup x'$，则 $x = x'$。

{{< details summary="证明：弱极限唯一" >}}

$\forall f \in X^*$，$f(x) = \lim f(x_n) = f(x')$，故 $f(x - x') = 0$。

由 Hahn–Banach 推论（§4 推论 1），若 $x - x' \ne 0$，存在 $f$ 使 $f(x-x') = \|x-x'\| \ne 0$，矛盾。故 $x = x'$。

{{< /details >}}

注意这一步**已经在用 Hahn–Banach**，无穷维里"泛函足够多分离点"不是显然的。

---

## 2. Hilbert 上的弱收敛

由 Riesz，Hilbert 上的弱收敛有完全干净的内积形式。

**命题（Hilbert 上的弱收敛）**：设 $H$ 是 Hilbert 空间，则

$$
x_n \rightharpoonup x\ \iff\ \forall y \in H,\ \langle x_n, y \rangle \to \langle x, y \rangle.
$$

这一条把"对所有 $f \in H^*$" 翻译成"对所有 $y \in H$"，理解和验证都直接得多。

### 弱收敛的范数下半连续性

**命题（弱下半连续）**：

$$
x_n \rightharpoonup x\ \Rightarrow\ \|x\| \le \liminf_n \|x_n\|.
$$

不等号是**单边**的——弱极限的范数可以**严格小于**序列的范数极限。$e_n \rightharpoonup 0$ 是教科书例子：$\|0\| = 0 \lt 1 = \liminf \|e_n\|$。

{{< details summary="证明：弱下半连续性" >}}

由 Hahn–Banach 推论（§4 推论 1），存在 $f \in X^*$ 使 $\|f\| = 1$ 且 $f(x) = \|x\|$。

由弱收敛，$f(x_n) \to f(x) = \|x\|$。

又 $|f(x_n)| \le \|f\|\|x_n\| = \|x_n\|$。

取 $\liminf$：

$$
\|x\| = \lim_n f(x_n) = \liminf_n f(x_n) \le \liminf_n |f(x_n)| \le \liminf_n \|x_n\|.
$$

{{< /details >}}

**这条性质的用法**：变分问题里取最小化序列 $\|x_n\| \to \inf$，若 $x_n \rightharpoonup x^\star$，则 $\|x^\star\| \le \liminf \|x_n\| = \inf$，**弱极限自动达到下确界**。这是变分法存在性证明的引擎之一。

---

## 3. Banach–Alaoglu 与弱列紧

Part 2 在 $\mathbb{R}^n$ 上的 Bolzano–Weierstrass："闭+有界 $\Rightarrow$ 列紧"。Part 3 在 $\ell^2$ 上指出这条在无穷维强收敛意义下**失效**——闭单位球不列紧。Part 5 现在把它**在弱意义下**部分恢复回来。

### Banach–Alaoglu 定理

**命题（Banach–Alaoglu）**：设 $X$ 是赋范空间，则 $X^*$ 的闭单位球

$$
B_{X^*} = \{f \in X^* : \|f\| \le 1\}
$$

在 **弱*拓扑 (weak-* topology)** 下是**紧致**的。

证明用 Tychonoff（无穷乘积的紧性），技术性较强，这里跳过细节。

**直观**：把每个 $f \in B_{X^*}$ 看成函数 $X \ni x \mapsto f(x) \in [-\|x\|, \|x\|]$。每个 $x$ 处 $f(x)$ 都被卡在紧区间里——这是一族被卡在乘积空间 $\prod_x [-\|x\|, \|x\|]$ 里的元素，Tychonoff 保证这个乘积空间紧致，于是 $B_{X^*}$ 也紧致。

### 自反空间上的弱列紧

**推论**：若 $X$ 自反（$X \cong X^{**}$ via 典范嵌入），则 $X$ 的闭有界集**弱列紧**：

$$
(x_n) \text{ 有界}\ \Rightarrow\ \exists \text{ 子列 } (x_{n_k})\ \text{ 与 } x \in X,\ x_{n_k} \rightharpoonup x.
$$

特别地，**所有 Hilbert 空间**（自反）的有界序列都有弱收敛子列。

### 与 BW 的对照

| 空间维度 | 收敛意义 | "闭+有界 ⇒ 列紧" |
|------|----------|-------------------|
| $\mathbb{R}^n$ | 强 | ✅（BW） |
| 无穷维 Hilbert | 强 | ❌（$e_n$ 反例） |
| 无穷维自反 Banach | **弱** | ✅（Banach–Alaoglu） |

**这是无穷维分析里的关键 trade-off**：放松"收敛"的强度（强 → 弱），换回紧性。变分法、PDE 弱解、最优控制里所有"存在性"证明，本质都是在用这条权衡。

### 弱收敛 + 弱下半连续 = 存在性证明的引擎

典型用法（极小化问题）：

1. 取最小化序列 $\|x_n\| \to d = \inf$；
2. $(x_n)$ 有界；
3. Banach–Alaoglu $\Rightarrow$ 存在弱收敛子列 $x_{n_k} \rightharpoonup x^\star$；
4. 弱下半连续 $\Rightarrow \|x^\star\| \le \liminf \|x_{n_k}\| = d$；
5. 又 $\|x^\star\| \ge d$（$d$ 是下确界），故 $\|x^\star\| = d$，**最小值被达到**。

整个推理只用到"有界 + 弱拓扑"，**完全没用强收敛**。这是 Part 4 §4 正交分解存在性证明的"轻量版"。

---

## 4. Hahn–Banach 定理与三个推论

Part 4 提过一句 Hahn–Banach，这里展开它真正的工作内容。

### 分析形式（保范延拓）

**Hahn–Banach（分析形式）**：设 $X$ 是赋范空间，$M \subseteq X$ 是子空间，$f_0: M \to \mathbb{K}$ 是 $M$ 上的有界线性泛函。则**存在** $f \in X^*$ 满足：

1. $f|_M = f_0$（延拓）；
2. $\|f\|_{X^*} = \|f_0\|_{M^*}$（保范）。

证明用 Zorn 引理（无穷维需要选择公理），跳过细节。

**核心**：从一个子空间上的"局部"泛函，可以延拓成全空间的"整体"泛函，**且不增加范数**。

### 推论 1：足够多的泛函分离点

**命题**：$\forall x_0 \in X,\ x_0 \ne 0$，$\exists f \in X^*$ 使

$$
f(x_0) = \|x_0\|,\quad \|f\|_{X^*} = 1.
$$

{{< details summary="证明：推论 1（达到范数的泛函的存在性）" >}}

在一维子空间 $M = \text{span}\{x_0\}$ 上定义

$$
f_0(\alpha x_0) = \alpha\|x_0\|.
$$

它是线性的，$\|f_0\|_{M^*} = 1$（取 $\alpha = 1/\|x_0\|$ 达到）。

由 Hahn–Banach，存在 $f \in X^*$ 延拓 $f_0$ 且 $\|f\|_{X^*} = 1$。特别 $f(x_0) = f_0(x_0) = \|x_0\|$。

{{< /details >}}

**重要意义**：$X^*$ 总是"够大"——对任何非零向量都能找到一个泛函把它"测出来"。这是 §1 弱极限唯一性证明的关键一步。

### 推论 2：范数的对偶刻画

**命题**：

$$
\forall x \in X,\quad \|x\| = \sup_{\substack{f \in X^* \\ \|f\| \le 1}} |f(x)|.
$$

{{< details summary="证明：推论 2（范数的对偶刻画）" >}}

**$\le$ 方向**：$\forall \|f\| \le 1$，$|f(x)| \le \|f\|\|x\| \le \|x\|$，取 sup 仍 $\le \|x\|$。

**$\ge$ 方向**：由推论 1，存在 $f$ 使 $\|f\| = 1, f(x) = \|x\|$，故 $\sup \ge \|x\|$。

{{< /details >}}

**这条把范数"翻译成对偶配对"**。在很多场合（弱下半连续性证明、对偶范数比较、变分不等式）比直接算范数更好用。

### 推论 3：凸集分离（几何形式）

**命题（几何 Hahn–Banach）**：设 $X$ 是赋范空间，$C \subseteq X$ 是闭凸集，$a \in X \setminus C$。则**存在** $f \in X^*$ 与 $\gamma \in \mathbb{R}$ 使

$$
f(a) \gt \gamma\quad\text{且}\quad \forall c \in C,\ f(c) \le \gamma.
$$

换句话说，**闭凸集与外部点可以用闭超平面分开**。

这是凸分析、最优化（KKT、对偶问题）、博弈论的几何基础。在变分不等式和单调算子理论里反复出现。


| 推论 | 形式 | 用途 |
|------|------|------|
| 1. 保范延拓 | $\exists f,\ \Vert f\Vert=1,\ f(x_0)=\Vert x_0\Vert$ | 泛函足够多分离点 |
| 2. 对偶刻画 | $\Vert x\Vert = \sup_{\Vert f\Vert\le 1}\vert f(x)\vert$ | 范数翻译成对偶配对 |
| 3. 凸集分离 | 闭凸集与外点用超平面分开 | 凸分析 / 最优化的几何基础 |

整套 Hahn–Banach **是泛函分析"从对偶端看原空间"的扳手**。无穷维空间的几何感很多时候要靠 $X^*$ 给的"探针"才能可视化。

---

## 5. Banach 不动点定理

把抽象工具落地到数值方法。

### 压缩映射 (Contraction)

设 $(X, d)$ 是度量空间，$T: X \to X$。

**$T$ 是压缩映射**，若 $\exists k \in [0, 1)$ 使

$$
\forall x, y \in X,\ d(Tx, Ty) \le k\,d(x, y).
$$

$k$ 称为**压缩常数 (contraction constant)**。

**关键**：$k \lt 1$。"$k = 1$" 称为非扩展（non-expansive），不动点可能不存在或不唯一。

### Banach 不动点定理

**命题（Banach Fixed Point Theorem）**：设 $(X, d)$ 是**完备**度量空间，$T: X \to X$ 是压缩映射。则

1. **唯一不动点**：$\exists!\, x^\star \in X,\ Tx^\star = x^\star$；
2. **迭代收敛**：$\forall x_0 \in X$，序列 $x_n = Tx_{n-1}$ 满足 $x_n \to x^\star$（强收敛）；
3. **几何速率估计**：

$$
d(x_n, x^\star) \le \frac{k^n}{1 - k}\,d(x_0, x_1).
$$

{{< details summary="证明：Banach 不动点定理" >}}

**第一步：$(x_n)$ 是 Cauchy 列**。

由压缩性，

$$
d(x_{n+1}, x_n) = d(T x_n, T x_{n-1}) \le k\,d(x_n, x_{n-1}) \le \cdots \le k^n\,d(x_1, x_0).
$$

对 $m \gt n$，用三角不等式叠加：

$$
d(x_m, x_n) \le \sum_{j=n}^{m-1} d(x_{j+1}, x_j) \le \sum_{j=n}^{m-1} k^j\,d(x_1, x_0) \le \frac{k^n}{1-k}\,d(x_1, x_0).
$$

右边 $\to 0$（因 $k\lt 1$），所以 $(x_n)$ Cauchy。

**第二步：完备性给出极限**。

$X$ 完备 $\Rightarrow x_n \to x^\star \in X$。

**第三步：$x^\star$ 是不动点**。

压缩映射 Lipschitz $\Rightarrow$ 连续。在 $x_{n+1} = T x_n$ 两边取 $n \to \infty$：

$$
x^\star = \lim x_{n+1} = \lim T x_n = T(\lim x_n) = T x^\star.
$$

**第四步：唯一性**。

设 $x^\star, y^\star$ 都是不动点，则

$$
d(x^\star, y^\star) = d(T x^\star, T y^\star) \le k\,d(x^\star, y^\star).
$$

由 $k \lt 1$，只能 $d(x^\star, y^\star) = 0$，即 $x^\star = y^\star$。

**第五步：速率估计**。

由第一步推导，对任意 $m \gt n$：

$$
d(x_m, x_n) \le \frac{k^n}{1-k}\,d(x_0, x_1).
$$

令 $m \to \infty$ 得 $d(x_n, x^\star) \le \tfrac{k^n}{1-k}\,d(x_0, x_1)$。

{{< /details >}}

### 完备性在证明里的角色

**完备性出现在第二步**——构造好 Cauchy 列后，需要它在 $X$ 内有极限。**没有完备性，不动点可能不存在**。

**经典反例**：在 $X = \mathbb{Q}$ 上考虑 $T(x) = \cos(x)$（或任何 $\mathbb{R}$ 上不动点为无理数的压缩映射）。$T$ 是 $\mathbb{Q}$ 上的压缩，但不动点 $x^\star \approx 0.7391\ldots$ 是无理数，**$x^\star \notin \mathbb{Q}$**，所以 $\mathbb{Q}$ 上的 Banach 迭代收敛到一个掉出空间的点。

> 这正是 Part 2 完备性论调的一次具体兑现：**"完备性 = 把所有 Cauchy 列的极限请回家"，没它，Banach 迭代会迭代到屋外去**。

### 几何收敛速率

$$
d(x_n, x^\star) \le C\,k^n.
$$

**几何级数式的收敛**——每步把误差砍掉 $1 - k$ 比例。$k$ 越小，收敛越快；$k \to 1^-$ 时收敛速度趋零。

这是数值方法里"迭代法收敛速度"的统一语言：Jacobi、Gauss–Seidel、SOR、不动点格式、Picard 迭代——全是 Banach 不动点的实例，压缩常数 $k$ 对应**迭代矩阵的谱半径**。

---

## 6. 收敛速度 $\leftrightarrow$ 条件数

数值线性代数和迭代法里的"条件数 $\kappa$ 决定收敛速度"这一条，可以从 Banach 不动点定理直接读出来。

### 从线性方程到不动点

解 $Ax = b$，$A$ 是有界算子（有限维则是矩阵）。Picard / Richardson / 一阶迭代格式：

$$
x_{n+1} = x_n - \alpha\,(A x_n - b) = (I - \alpha A) x_n + \alpha b.
$$

写成 $x_{n+1} = T(x_n)$，其中

$$
T(x) = M x + \alpha b,\qquad M = I - \alpha A.
$$

这是仿射映射，**压缩 $\iff \|M\| \lt 1$**。

### 压缩常数 = 谱半径

对自伴正定 $A$（特征值 $0 \lt \lambda_{\min} \le \cdots \le \lambda_{\max}$）：

- $M = I - \alpha A$ 的特征值是 $1 - \alpha \lambda_i$；
- 最佳 $\alpha = \dfrac{2}{\lambda_{\min} + \lambda_{\max}}$；
- 此时 $\|M\|_{\text{op}} = \rho(M) = \dfrac{\lambda_{\max} - \lambda_{\min}}{\lambda_{\max} + \lambda_{\min}} = \dfrac{\kappa(A) - 1}{\kappa(A) + 1}$；
- 其中 $\kappa(A) = \dfrac{\lambda_{\max}}{\lambda_{\min}}$ 是条件数。

代入 Banach 速率：

$$
\|x_n - x^\star\| \le \left(\frac{\kappa - 1}{\kappa + 1}\right)^n \cdot \|x_0 - x^\star\|.
$$

### 条件数 → 收敛速度

| $\kappa(A)$ | $k = \tfrac{\kappa - 1}{\kappa + 1}$ | 每步误差缩减 |
|----|----|----|
| $1$（理想） | $0$ | 一步收敛 |
| $10$ | $\approx 0.82$ | 每步缩 18% |
| $100$ | $\approx 0.98$ | 每步缩 2% |
| $10^6$（病态） | $\approx 1 - 2\times 10^{-6}$ | 几乎不动 |

**$\kappa$ 大 $\Rightarrow k$ 接近 $1$ $\Rightarrow$ Banach 几何收敛趋停**。这就是工程文献里反复出现的"病态 $\Rightarrow$ 迭代不收敛"。

### 与 Part 4 反问题的闭环

Part 4 §7 讲的 Tikhonov 正则化：

$$
A_\alpha = A^*A + \alpha I.
$$

它在谱上的作用：把 $A^*A$ 的最小奇异值 $\sigma_{\min}^2$ 提到 $\sigma_{\min}^2 + \alpha$。所以

$$
\kappa(A_\alpha) = \frac{\sigma_{\max}^2 + \alpha}{\sigma_{\min}^2 + \alpha} \ll \kappa(A^*A) = \frac{\sigma_{\max}^2}{\sigma_{\min}^2}.
$$

**$\alpha$ 大，$\kappa$ 小，$k$ 小，几何收敛快**。

```
Tikhonov 正则化
  ↓  谱上：σ_min² → σ_min² + α
条件数 κ 降
  ↓  压缩常数 k = (κ-1)/(κ+1) 降
Banach 迭代速度提升
```

**Part 4 的"反问题谱解释"和 Part 5 的"Banach 几何收敛"在条件数这一节闭环**。同一件工程现象（"正则化让迭代收敛得更快"）在两个抽象层面有同一份完整描述。

### 对接实际应用

| 你前面的工作 | Part 5 的解释 |
|---|---|
| [Computational Science Part 5](/notes/systems/computational-science/note-csys-5-finite-diff-gradient-descent) 梯度下降步长调试 | 步长 $\alpha$ 调到 $\dfrac{2}{\lambda_{\min}+\lambda_{\max}}$ 是 §6 最佳选择 |
| [Computational Science Part 7](/notes/systems/computational-science/note-csys-7-lbfgs-log-parameterization) L-BFGS / 对数参数化 | 对数参数化 = 在新坐标系下重塑 $A$ 使 $\kappa$ 降 |
| [Computational Science Part 8](/notes/systems/computational-science/note-csys-8-regularization-prior) Tikhonov + 先验 | $\alpha$ 既稳化解（Part 4）又加速迭代（Part 5），双重收益 |

---

## 总结：三条线索

1. **强 vs 弱：放松收敛换回紧性**。强收敛是直观的"长度收敛"，但在无穷维里太严格——闭单位球都不列紧。弱收敛只要"每个对偶配对收敛"，弱化了刻画但换回 Banach–Alaoglu 的紧性，让变分法的存在性证明可以工作。
2. **Hahn–Banach：从对偶端看原空间**。三个推论（保范延拓、范数对偶刻画、凸集分离）是泛函分析"看清抽象空间"的扳手。无穷维几何感很多时候要靠 $X^*$ 给的探针才能可视化。
3. **Banach 不动点：完备 + 压缩 = 几何收敛**。这是数值方法的母定理。完备性保证 Cauchy 极限被收回家，压缩常数 $k$ 控制几何速率，而 $k$ 又通过条件数 $\kappa$ 与 Part 4 的谱视角闭环——Tikhonov 既稳化又加速，两份收益在同一份谱图上同时出现。
