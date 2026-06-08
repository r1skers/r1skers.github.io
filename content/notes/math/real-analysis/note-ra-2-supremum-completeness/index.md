---
date: '2026-05-13T10:00:00+09:00'
draft: false
title: '实分析 Part 2：确界公理、单调收敛与完备性等价链'
summary: "从 LUB 公理出发，沿着 MCT、闭区间套、B–W 一路推到 Cauchy 完备性，再用二分法把 Cauchy + Archimedes 推回 LUB，完整闭合 ℝ 上完备性的等价环。"
description: "实分析进阶笔记：上确界与确界公理、Archimedes 性质、单调收敛定理、闭区间套定理、Bolzano–Weierstrass 定理、Cauchy 完备性，以及这五条命题在 ℝ 上的等价链与 Archimedean 条件的必要性。"
tags: ["Real Analysis", "Completeness", "Supremum", "Monotone Convergence", "Bolzano-Weierstrass", "Cauchy Sequence", "Archimedean", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-实分析2-完备性/
  - /notes/笔记-实分析2-确界公理、单调收敛与完备性等价链/
  - /notes/note-ra-2-supremum-completeness/
---

# 实分析 Part 2：确界公理、单调收敛与完备性等价链

Part 1 留下了一个方向问题：

$$
\text{收敛} \Longrightarrow \text{柯西}
$$

这一方向在很一般的空间里都成立。但反过来

$$
\text{柯西} \Longrightarrow \text{收敛}
$$

在 $\mathbb{Q}$ 里就不成立，需要 $\mathbb{R}$ 的某种"完备性"才能保住。

这一篇主要内容便是：

$$
\text{LUB 公理}
\to \text{MCT}
\to \text{闭区间套}
\to \text{B–W}
\to \text{Cauchy 完备性}
\to \text{LUB 公理}
$$

中间一根箭头一根箭头地推，最后用二分构造把箭头回接到起点，整个环就闭上了。五条命题在 $\mathbb{R}$ 上**互相等价**，任意一条都可以作为公理。

首先一个思想：

**这五条里只有 Cauchy 完备性是可以推广到一般空间的。** LUB、MCT、闭区间套都依赖序结构，B–W 依赖有限维。所以等价链是 $\mathbb{R}$ 这个特殊空间里的奢侈品，过了泛函这一关，能依赖的就只剩 Cauchy 一条了。

几个需要注意的点（写在前面）：
- 上确界不是“最大值”，而是“最小上界”；
- LUB 公理是 $\mathbb{R}$ 完备性的序结构版本；
- MCT、闭区间套、B–W、Cauchy 完备性会一环扣一环地互相推出；
- 证明里反复使用“尾部控制 + 有限项兜底”“取子列做桥”“二分夹逼”这些套路；
- Archimedes 性质不是完备性本身，但它是 Cauchy 完备性回推 LUB 时不可省的前提。

---

## 1. 上确界与确界公理

### 定义

设 $S\subseteq \mathbb{R}$，$S\ne\emptyset$。

**上界 (upper bound)**：$M$ 是 $S$ 的上界，若

$$
\forall x\in S,\ x\le M.
$$

**上确界 (supremum, least upper bound)**：$M^\star=\sup S$，若

$$
(\forall x\in S,\ x\le M^\star)\ \land\ (\forall M\text{ 上界},\ M^\star\le M).
$$

即 $M^\star$ 既是上界，又是所有上界中最小的那个。对称地有**下确界 (infimum)** $\inf S$。

### 等价刻画

$M^\star=\sup S$ 等价于

$$
(\forall x\in S,\ x\le M^\star)\ \land\ (\forall \varepsilon \gt 0,\ \exists x\in S,\ x \gt M^\star-\varepsilon).
$$

第 2 项是后面所有证明里最常用的入口：

**只要把 $M^\star$ 往下挪一丁点 $\varepsilon$，下面立刻就有 $S$ 的元素冒出来。**

### 确界公理

**LUB 公理**：

$$
\forall S\subseteq\mathbb{R},\ (S\ne\emptyset\ \land\ S \text{ 有上界})\Rightarrow \sup S\in\mathbb{R}.
$$

这是 $\mathbb{R}$ 区别于 $\mathbb{Q}$ 的根。在 $\mathbb{Q}$ 里取

$$
S=\{x\in\mathbb{Q}:x^2 \lt 2\},
$$

$S$ 显然有上界（比如 $2$），但 $\sup S=\sqrt 2\notin\mathbb{Q}$，LUB 公理失效。

---

## 2. Archimedes 性质

**命题**：

$$
\forall x\in\mathbb{R},\ x \gt 0,\ \exists n\in\mathbb{N},\ n \gt x.
$$

也就是说 $\mathbb{N}$ 在 $\mathbb{R}$ 中无上界。

{{< details summary="证明：Archimedes 性质" >}}

反证。假设 $\mathbb{N}$ 在 $\mathbb{R}$ 中有上界。

由 LUB 公理，$M^\star=\sup\mathbb{N}$ 存在。

由等价刻画，取 $\varepsilon=1$，存在 $n\in\mathbb{N}$ 使得

$$
n \gt M^\star-1.
$$

但 $n+1$ 仍然是自然数，且

$$
n+1 \gt M^\star,
$$

这与 $M^\star$ 是上界矛盾。

所以 $\mathbb{N}$ 在 $\mathbb{R}$ 中无上界。

{{< /details >}}

**推论 1**：

$$
\forall \varepsilon \gt 0,\ \exists n\in\mathbb{N},\ \frac{1}{n} \lt \varepsilon.
$$

**推论 2**：

$$
\forall x\in\mathbb{R},\ \exists!\, n\in\mathbb{Z},\ n\le x \lt n+1.
$$

也就是 floor 函数 $\lfloor x\rfloor$ 总是有定义的（$\exists!$ 表示"存在且唯一"）。

需要分清楚一点：

**Archimedes 性质不是 $\mathbb{R}$ 区别于 $\mathbb{Q}$ 的标志。** $\mathbb{Q}$ 也满足 Archimedes。所以它本身不是完备性的核心，但它是把 $\varepsilon$ 和 $N$ 在证明里粘起来的胶水，几乎每一个 $\varepsilon$-$N$ 证明背后都用到它（比如选 $N \gt 1/\varepsilon$）。

后面到 §10 会看到它的另一个角色：在没有 LUB 的世界里，Archimedes 是 Cauchy 完备性回推 LUB 的**必要外加条件**。

---

## 3. 单调收敛定理 (MCT)

**命题**：若 $(a_n)$ 单调递增（即 $\forall n,\ a_{n+1}\ge a_n$）且有上界，则

$$
a_n\to\sup_{n\in\mathbb{N}} a_n.
$$

{{< details summary="证明：单调有界 ⇒ 收敛" >}}

令

$$
M^\star=\sup_{n\in\mathbb{N}} a_n.
$$

因 $\{a_n\}$ 非空有上界，由 LUB 公理 $M^\star\in\mathbb{R}$ 存在。

任取 $\varepsilon\gt 0$。由 $\sup$ 的等价刻画，$\exists N$ 使得

$$
a_N \gt M^\star-\varepsilon.
$$

由单调性，当 $n\ge N$ 时 $a_n\ge a_N$，于是

$$
M^\star-\varepsilon \lt a_n\le M^\star,
$$

即

$$
|a_n-M^\star| \lt \varepsilon.
$$

所以 $a_n\to M^\star$。

{{< /details >}}

**对称版本**：单调递减且有下界的数列收敛到 $\inf$。

这个定理结构上极其简洁：把序的信息（单调）和大小的信息（有界）凑齐，收敛性自动出来。它会成为后面闭区间套和 B–W 的直接工具。

---

## 4. 闭区间套定理

**命题**：设

$$
[a_1,b_1]\supseteq[a_2,b_2]\supseteq\cdots,\qquad b_n-a_n\to 0.
$$

则（其中 $\exists!$ 是"存在且唯一"的记号，见 §2 推论 2）

$$
\exists!\, x^\star\in\mathbb{R},\ \bigcap_{n=1}^\infty[a_n,b_n]=\{x^\star\}.
$$

{{< details summary="证明：闭区间套" >}}

由套娃结构，

$$
a_1\le a_2\le\cdots\le b_2\le b_1,
$$

所以 $(a_n)$ 单调递增有上界 $b_1$，$(b_n)$ 单调递减有下界 $a_1$。

由 MCT，

$$
a_n\to a^\star,\qquad b_n\to b^\star.
$$

对所有 $n$ 取极限 $a_n\le b_n$ 得 $a^\star\le b^\star$。

又由条件 $b_n-a_n\to 0$，两边取极限得 $b^\star-a^\star=0$，故 $a^\star=b^\star$。

令 $x^\star=a^\star=b^\star$。

**$x^\star$ 在每个区间里**：因 $a_n$ 单调递增到 $x^\star$，有 $a_n\le x^\star$；同理 $x^\star\le b_n$。所以 $x^\star\in[a_n,b_n]$。

**唯一性**：若 $y\in\bigcap_n [a_n,b_n]$，则 $\forall n$，

$$
|y-x^\star|\le b_n-a_n.
$$

右边 $\to 0$，故 $y=x^\star$。

{{< /details >}}

闭区间套的意义在于它是 LUB 与 B–W 之间的桥梁：

**把"有界集"的存在性证明改写成"嵌套区间长度 → 0"的几何对象，方便后面取出收敛子列。**

---

## 5. 子列

设 $n_1 \lt n_2 \lt n_3 \lt \cdots$ 是严格递增的自然数列，则

$$
(a_{n_k})_{k=1}^\infty
$$

称为 $(a_n)$ 的**子列 (subsequence)**。

**基本事实**：

$$
a_n\to a\ \Longrightarrow\ \forall \text{ 子列 } (a_{n_k}),\ a_{n_k}\to a.
$$

{{< details summary="证明：收敛列的子列也收敛到同一极限" >}}

因 $n_1 \lt n_2 \lt \cdots$ 是严格递增自然数列，归纳可证 $n_k\ge k$。

任取 $\varepsilon\gt 0$。由 $a_n\to a$，$\exists N$ 使得 $\forall n\ge N$，

$$
|a_n-a| \lt \varepsilon.
$$

当 $k\ge N$ 时，$n_k\ge k\ge N$，所以

$$
|a_{n_k}-a| \lt \varepsilon.
$$

故 $a_{n_k}\to a$。

{{< /details >}}

注意子列的方向**只能往后挑**，不能跳回前面。这条单调递增是后面所有"取子列"操作的隐性前提。

---

## 6. 单调子列引理

**命题**：

$$
\forall \text{ 实数数列 } (a_n),\ \exists \text{ 单调子列 } (a_{n_k}).
$$

这条引理初看不起眼，但它是 B–W 干净证明的关键。

{{< details summary="证明：单调子列引理（peak term 分类）" >}}

称 $a_m$ 为 $(a_n)$ 的**峰值项 (peak term)**，若

$$
\forall n \gt m,\ a_n\le a_m.
$$

也就是 $a_m$ 比它后面所有项都大或相等。

按峰值项的多少分两种情形：

**情形一：峰值项有无穷多个。**

把所有峰值项的下标按顺序排出来：$m_1 \lt m_2 \lt m_3 \lt \cdots$。

由峰值的定义，$m_2 \gt m_1$ 时 $a_{m_2}\le a_{m_1}$，依此类推，得到

$$
a_{m_1}\ge a_{m_2}\ge a_{m_3}\ge\cdots
$$

这是一个单调（非增）子列。

**情形二：峰值项只有有限个。**

设最后一个峰值项的下标为 $M$。从 $n_1=M+1$ 起，每一项都**不是**峰值项。

$a_{n_1}$ 不是峰值，故 $\exists n_2 \gt n_1$ 使得 $a_{n_2} \gt a_{n_1}$。

$a_{n_2}$ 也不是峰值，故 $\exists n_3 \gt n_2$ 使得 $a_{n_3} \gt a_{n_2}$。

这样归纳下去，得到严格递增子列

$$
a_{n_1}\lt a_{n_2}\lt a_{n_3}\lt \cdots
$$

两种情形都给出了单调子列。

{{< /details >}}

这个证明里值得注意的是：

**不需要任何有界性、不需要任何度量结构。只用了"两两可比"，所以它本质是序的引理。**

这也是为什么 B–W 在一般度量空间里需要重新证（用紧性 / 完全有界等），不能直接套这条引理。

---

## 7. Bolzano–Weierstrass 定理

**命题**：

$$
\forall \text{ 有界实数数列 } (a_n),\ \exists \text{ 收敛子列 } (a_{n_k}).
$$

{{< details summary="证明：B–W" >}}

设 $(a_n)$ 有界。

由单调子列引理（§6），$\exists$ 单调子列 $(a_{n_k})$。

子列继承了原数列的有界性。

由 MCT（或其对称版本），$(a_{n_k})$ 单调有界 $\Rightarrow$ 收敛。

{{< /details >}}

短短三步，但每一步都用了前面的结果：

- 单调子列引理（§6）保证我们能挑出单调子列；
- MCT（§3）保证单调有界子列必然收敛；
- 而 MCT 又是从 LUB 公理来的。

所以 B–W 是 LUB → MCT → 单调子列 三者拼出来的结果。

B–W 的意义远不止技术性，它是**紧致性 (compactness) 的雏形**：

**有界集合"跑不远"，无论怎么从里面取序列，总能从中榨出一条收敛子列。**

这一思想在度量空间里推广成"列紧 (sequentially compact)"，在拓扑空间里推广成"开覆盖意义下的紧"。整个泛函分析里关于紧算子、紧嵌入的讨论，都可以追溯到这条定理的精神。

---

## 8. Cauchy 完备性

到这里 LUB → MCT → 闭区间套 → B–W 的链条已经拉好，最后一棒交给 Cauchy 完备性。

回顾 Part 1 给出的柯西列定义：

$$
(a_n)\text{ 是柯西列}\ \iff\ \forall\varepsilon \gt 0,\ \exists N,\ \forall m,n\ge N,\ |a_n-a_m| \lt \varepsilon.
$$

**命题（Cauchy 完备性）**：

$$
\forall \text{ 柯西列 } (a_n)\subseteq\mathbb{R},\ \exists a\in\mathbb{R},\ a_n\to a.
$$

证明分三步走，每一步都用到前面的工具。

{{< details summary="证明：Cauchy 完备性（三步）" >}}

**第一步：柯西列有界。**

取 $\varepsilon=1$。由柯西条件，$\exists N$，使得 $\forall n,m\ge N$，

$$
|a_n-a_m| \lt 1.
$$

特别地，取 $m=N$，得 $\forall n\ge N$，

$$
|a_n|=|(a_n-a_N)+a_N|\le|a_n-a_N|+|a_N| \lt 1+|a_N|.
$$

令

$$
M=\max\{|a_1|,\ldots,|a_{N-1}|,1+|a_N|\}.
$$

则 $\forall n,\ |a_n|\le M$。

（结构和 Part 1 §6 的收敛列有界完全一样：尾巴用条件控制，前面有限项用最大值兜底。）

**第二步：用 B–W 取出收敛子列。**

由 §7，$(a_n)$ 有界 $\Rightarrow$ $\exists$ 收敛子列

$$
a_{n_k}\to a.
$$

**第三步：用柯西条件把原数列拉过来。**

任取 $\varepsilon\gt 0$。

由柯西条件，$\exists N_1$，使得 $\forall m,n\ge N_1$，

$$
|a_n-a_m| \lt \frac{\varepsilon}{2}.
$$

由子列收敛，$\exists k$ 足够大，使得 $n_k\ge N_1$ 且

$$
|a_{n_k}-a| \lt \frac{\varepsilon}{2}.
$$

于是 $\forall n\ge N_1$（注意 $n_k\ge N_1$，柯西条件适用）：

$$
\begin{aligned}
|a_n-a|
&=|(a_n-a_{n_k})+(a_{n_k}-a)|\\
&\le|a_n-a_{n_k}|+|a_{n_k}-a|\\
&\lt \frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

所以 $a_n\to a$。

{{< /details >}}

第三步的核心技巧值得单独拎出来：

**$a_{n_k}$ 同时具有两重身份：它既是原数列的项，又是子列的项。**

- 当原数列项看：柯西条件直接给出 $|a_n-a_{n_k}|$ 小；
- 当子列项看：子列收敛给出 $|a_{n_k}-a|$ 小。

它充当桥的两端，把"任意两项接近"和"逼近极限"接起来。这种把同一对象当两种东西用的把戏，在泛函里会反复出现（比如对偶空间里同一个元素既是函数又是泛函）。

到这里完成了

$$
\text{LUB}\to\text{MCT}\to\text{闭区间套}\to\text{B–W}\to\text{Cauchy 完备性}.
$$

链条单向走通了。接下来需要把它接回起点。

---

## 9. 闭环：Cauchy 完备性 + Archimedes ⇒ LUB

为了说"五条等价"，需要证明反向：从 Cauchy 完备性回到 LUB。

**这一步很重要**：需要额外假设 Archimedes 性质。原因放在 §10 单独说。

**命题**：设 $F$ 是 Archimedean 有序域，则

$$
(\forall\text{ 柯西列 } (a_n)\subseteq F,\ \exists a\in F,\ a_n\to a)\ \Longrightarrow\ \text{LUB 公理成立于 }F.
$$

证明思路是**二分构造**：把 $\sup S$ 这个不知道是否存在的对象，用一列闭区间夹出来，靠 Cauchy 完备性保证它真的存在。

{{< details summary="证明：二分法构造 sup" >}}

设 $S\ne\emptyset$ 有上界。

**初始化**：

任取 $s_0\in S$，令

$$
a_0=s_0-1,\qquad b_0=\text{某个 } S\text{ 的上界}.
$$

注意 $a_0 \lt s_0\in S$，所以 $a_0$ **不是** $S$ 的上界（它下面有 $S$ 的元素）；而 $b_0$ 是上界。

**归纳步骤**：

假设已经有闭区间 $[a_n,b_n]$，满足

- $a_n$ **不是** $S$ 的上界；
- $b_n$ **是** $S$ 的上界。

取中点 $m_n=(a_n+b_n)/2$，分两种情况：

- 若 $m_n$ 是 $S$ 的上界：令 $a_{n+1}=a_n$，$b_{n+1}=m_n$；
- 若 $m_n$ 不是 $S$ 的上界：令 $a_{n+1}=m_n$，$b_{n+1}=b_n$。

两种情况都保持了不变量，且

$$
b_{n+1}-a_{n+1}=\frac{b_n-a_n}{2},
$$

故

$$
b_n-a_n=\frac{b_0-a_0}{2^n}.
$$

**关键一步用 Archimedes**：要从上式得 $b_n-a_n\to 0$，需要 $1/2^n\to 0$，即 $2^n$ 无上界。这正是 Archimedes 性质（推论 1 与 $2^n\ge n$ 合起来）。

**$(a_n)$ 是柯西列**：$(a_n)$ 单调递增（每步要么不动要么往右挪到中点）有上界 $b_0$。$\forall m\ge n$，

$$
|a_m-a_n|=a_m-a_n\le b_n-a_n=\frac{b_0-a_0}{2^n}\to 0.
$$

所以 $(a_n)$ 是柯西列。

**取极限**：

由 Cauchy 完备性，$a_n\to\alpha$。由 $b_n-a_n\to 0$，$b_n\to\alpha$ 同一极限。

**$\alpha=\sup S$**：

- **$\alpha$ 是上界**：$\forall s\in S$，每个 $b_n$ 都是上界，故 $s\le b_n$。两边对 $n$ 取极限得 $s\le\alpha$。

- **$\alpha$ 是最小上界**：假设 $\beta \lt \alpha$ 也是上界。因 $a_n\to\alpha$，$\exists n$ 使 $a_n \gt \beta$。但 $a_n$ 不是 $S$ 的上界，故 $\exists s\in S$ 使 $s \gt a_n \gt \beta$，与 $\beta$ 是上界矛盾。

所以 $\alpha=\sup S$，LUB 公理成立。

{{< /details >}}

完成。整个环闭合：

$$
\text{LUB}\Rightarrow\text{MCT}\Rightarrow\text{闭区间套}\Rightarrow\text{B–W}\Rightarrow\text{Cauchy}\Rightarrow\text{LUB}.
$$

在 $\mathbb{R}$ 上，五条命题等价。

---

## 10.  Archimedes 不能省

§9 的证明里 Archimedes 出现在一处：**从 $b_n-a_n=(b_0-a_0)/2^n$ 得到 $b_n-a_n\to 0$。**

如果没有 Archimedes 会怎样？可以构造一个**有序域** $F$，里面：

- 存在"无穷小"元素 $\eta \gt 0$，使得 $\forall n\in\mathbb{N},\ n\eta \lt 1$（即 Archimedes 失败）；
- 每个柯西列都收敛（Cauchy 完备）；
- 但 LUB 公理失败。

**抽象论证**：在任何非 Archimedean 有序域 $F$ 中，取嵌入的标准自然数

$$
\mathbb{N}\hookrightarrow F.
$$

它在 $F$ 中**有上界**（取任意一个 $F$ 中的"无穷大"元素 $\omega$，即 $\forall n\in\mathbb{N},\ n \lt \omega$），但**没有上确界**：

- 任何"无穷大"候选 $\alpha$，$\alpha-1$ 仍是无穷大、仍是 $\mathbb{N}$ 的上界，故 $\alpha$ 不是最小上界；
- 任何"有限"候选 $\alpha$，被某个标准自然数超过，根本不是上界。

具体构造可以查超实数 ${}^*\mathbb{R}$ 或形式 Laurent 级数域 $\mathbb{R}(\!(t)\!)$ 之类的例子，这里不展开。

所以严格的说法应该是：

> 在**有序域**这个层面，"LUB 公理"等价于"Archimedes 性质 + Cauchy 完备性"。Cauchy 完备性单独不够强。

$\mathbb{R}$ 默认是 Archimedean 的，所以平时把"完备"和"Cauchy 完备"混用没问题。但写"五条等价"时要在脑子里记一下这层前提。

更重要的是它给出的视角：

**只有 Cauchy 完备性是真正可以脱离序结构推广出去的。** 度量空间、赋范空间、Banach 空间里的"完备"，指的全是 Cauchy 完备性。LUB、MCT、闭区间套、B–W 在那里都没有直接对应物。

这就是为什么 Part 1 末尾要把 Cauchy 单独拎出来强调：它是 $\mathbb{R}$ 的众多刻画里**唯一能继承到泛函世界**的那一条。

---

## 11. 完备性作为下一站

到这里为止，完备性等价链的全图已经闭合：

$$
\underbrace{\text{LUB}\to\text{MCT}\to\text{闭区间套}\to\text{B–W}\to\text{Cauchy}}_{\text{§1–§8}}
\;\xrightarrow{\;+\text{Archimedes}\;}\;
\underbrace{\text{LUB}}_{\text{§9}}.
$$

这条链在 $\mathbb{R}$ 里很漂亮，但进入更一般的空间后，很多东西会失去原来的形状：

- **Banach 空间**就是完备的赋范空间，这里的“完备”特指 Cauchy $\Rightarrow$ Convergent；
- **Hilbert 空间**就是完备的内积空间；
- Banach 不动点定理、Galerkin 逼近、迭代算法的收敛性证明，全都建立在某种 Cauchy 完备性上；
- LUB、MCT、B–W 在无穷维空间里都需要重新审视。典型反例是 $\ell^2$ 中的单位球：它闭且有界，但**不列紧**，因为单位向量列 $e_n$ 没有收敛子列。

这正是无穷维与有限维的本质分歧。

下一站是把这些概念从 $\mathbb{R}$ 抽出来，进入**度量空间 (metric space)**。

之后会重新遇到收敛、Cauchy、完备、紧致这几个词，但定义都换成 $d(x,y)$ 的语言。完备性会继续在那里活下来，B–W 会以“列紧”的形式出现并部分失效，进而引出无穷维空间里独有的现象。

