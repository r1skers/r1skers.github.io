---
date: '2026-06-16T20:00:00+09:00'
draft: false
title: '实分析 Part 6：测度、可测函数与 Lebesgue 积分'
summary: "从 Riemann 积分的失败案例（Dirichlet 函数）出发，把『切定义域 vs 切值域』的直觉换成严格的 σ-代数 + 测度框架。Lebesgue 测度作为『质量分布』把 m(ℚ)=0 这种反直觉结论变成毯子覆盖的两行计算。再借可测函数 + 简单函数 + 阶梯逼近定理把 Lebesgue 积分一砖一瓦造出来，最后用 a.e. 等价类把『积分对零测集免疫』这件事内建到底层。Part 6 是把积分这件事从『区间和』升级到『质量加权』，下一篇 Part 7 才开始用它。"
description: "实分析进阶笔记：Riemann 与 Lebesgue 积分的对照（切定义域 vs 切值域）、σ-代数、测度的定义与可数可加性、Lebesgue 测度的外测度覆盖定义、m(ℚ)=0 的毯子覆盖证明、Dirac 测度与 Radon–Nikodym 预告、可测函数、简单函数与示性函数、从下方阶梯逼近定理、Lebesgue 积分的三步构造（简单 → 非负 → 一般可测）、几乎处处 (a.e.) 等价类。"
tags: ["Mathematics", "Real Analysis", "Measure Theory"]
categories: ["Notes"]
series: ["Real and Functional Analysis"]
note_kind: "foundation"
aliases:
  - /notes/笔记-实分析6-测度lebesgue积分/
  - /notes/note-ra-6-measure-lebesgue-integral/
---

# 实分析 Part 6：测度、可测函数与 Lebesgue 积分

> Part 5 收尾的 Banach 不动点 + 完备性，把"分析在抽象空间里的迭代"讲完了。Part 6 转身回去补 Part 3、Part 4 一直在用但从未严格定义的对象——**Lebesgue 积分**与 $L^p$ 空间。这一篇先把积分这件事**从底层重造**，下一篇 Part 7 才用它做事（三大收敛定理 + $L^p$ 完备性）。

链条：

$$
\text{Riemann 困境}\to\text{σ-代数}\to\text{测度}\to\text{Lebesgue 测度}\to\text{可测函数}\to\text{阶梯逼近}\to\text{Lebesgue 积分}\to\text{a.e.}
$$

几条主旋律：

- **切定义域 vs 切值域**：Riemann 把横轴切成小段（"按位置堆"），Lebesgue 把纵轴切成水平条（"按面值堆"）。后者天然能处理高度不连续的函数。
- **测度是"称重"**：把"长度/面积/体积/概率"统一抽象为一个加性函数 $\mu: \Sigma \to [0,\infty]$。
- **σ-代数 + 可数可加性是关键**：可数（不是有限）可加性是处理"无穷过程"的命根子，也是 Lebesgue 击败 Riemann 的根本武器。
- **m(ℚ) = 0 不是悖论**：用可数毯子覆盖法两行可证。这件事直接驱动了"a.e. 等价类"——Lebesgue 积分天生对零测集免疫。
- **从下方阶梯逼近**：非负可测函数总能被简单函数从下单调递增逼近。Lebesgue 积分的定义靠这条建立。
- **a.e. = 在零测集外**：处处相等 → 几乎处处相等 → 等价类，Lebesgue 把"个别点处的值"扔进了不在乎的范畴。

---

## 1. 从 Riemann 困境到 Lebesgue 视角

### Riemann 的局限

Riemann 积分的构造是**切定义域**：把 $[a,b]$ 分成 $n$ 段，每段取一个高度近似（上/下和），段长 $\to 0$ 时取极限。

它的痼疾在两类情形露馅：

**例 1（Dirichlet 函数）**：

$$
\chi_\mathbb{Q}(x)=\begin{cases}1, & x\in\mathbb{Q}\\ 0, & x\notin\mathbb{Q}\end{cases}
$$

定义在 $[0,1]$ 上。任何小区间里 $\chi_\mathbb{Q}$ 的上确界 $=1$、下确界 $=0$，所以 Riemann 上和 $=1$、下和 $=0$，**永远不收敛**。Riemann 不可积。

但直觉上 $\chi_\mathbb{Q}$ "几乎都是 0"——$\mathbb{Q}$ 是可数的，"密度" 应当是 $0$。Lebesgue 会给它积分值 $0$。

**例 2（逐点收敛 vs 积分换序）**：构造 $f_n: [0,1]\to\mathbb{R}$ 是 $\chi_\mathbb{Q}$ 的部分逼近，每个 $f_n$ Riemann 可积（取 $\mathbb{Q}$ 的有限子集），$f_n\to\chi_\mathbb{Q}$ 逐点收敛——**但极限函数不可积**。Riemann 积分对"逐点收敛 + 取极限"不友好。

### 切值域：数钱比喻

Lebesgue 把方向反过来——**切值域**而不是切定义域。

> **数钱比喻**：桌上一堆硬币要数总额。
>
> - **Riemann 法**：按它们摆在桌上的位置一枚一枚数（按位置）；
> - **Lebesgue 法**：先把同面值的归一堆（1 元堆、5 元堆、10 元堆……），每堆数个数 $\times$ 面值，再加总（按面值）。
>
> 桌面摆得乱七八糟（高度不连续函数）时，**按面值堆**显然更省力。

形式化地：对函数 $f$，把它的值域 $[0, M]$ 切成水平条 $[k\Delta y, (k+1)\Delta y]$，每条上量"$f$ 落在这条里的 $x$ 集合的测度"，乘以条高，再求和：

$$
\int f\,d\mu \approx \sum_k k\Delta y\cdot\mu(\{x: f(x)\in[k\Delta y,(k+1)\Delta y]\}).
$$

**关键**：要让这件事工作，需要"$\{x: f(x)\in[\cdot,\cdot]\}$ 这样的集合可以被『称重』"——这就要求一个能给集合赋值的对象，即**测度**。

---

## 2. σ-代数与测度

### σ-代数 (σ-algebra)

设 $X$ 是集合。$\Sigma\subseteq 2^X$ 是 $X$ 上的 **σ-代数**，若：

1. $X\in\Sigma$；
2. $A\in\Sigma\Rightarrow X\setminus A\in\Sigma$（封闭于补）；
3. $A_1,A_2,\ldots\in\Sigma\Rightarrow\bigcup_{n=1}^\infty A_n\in\Sigma$（封闭于**可数**并）。

由 1、2、3 推出 $\emptyset\in\Sigma$ 和可数交封闭。

> **理解**：σ-代数是"我们决定可以称重的集合的全体"。**"σ-" 强调的是可数（不是有限）**——这是后面所有"取极限"的基础。

$\Sigma$ 中元素称为**可测集 (measurable set)**。$(X,\Sigma)$ 称为**可测空间**。

### 测度 (measure)

$\mu:\Sigma\to[0,\infty]$ 是 $(X,\Sigma)$ 上的**测度**，若：

1. $\mu(\emptyset)=0$；
2. **可数可加性**：若 $\{A_n\}\subseteq\Sigma$ 两两不交，则

$$
\mu\left(\bigsqcup_{n=1}^\infty A_n\right)=\sum_{n=1}^\infty\mu(A_n).
$$

$(X,\Sigma,\mu)$ 称为**测度空间 (measure space)**。

### 直觉：质量分布

把 $X$ 想成"空间"，$\mu$ 想成"摆在这空间里的质量分布"。$\mu(A)$ 就是 $A$ 区域里有多少质量。

- 长度 / 面积 / 体积：均匀质量分布；
- 概率：总质量 $=1$ 的归一化质量分布；
- 一个点质量：**Dirac 测度** $\delta_p$，定义为 $\delta_p(A)=\mathbf{1}_A(p)$（$A$ 含 $p$ 则 1，否则 0）。

可数可加性翻译成质量语言就是：**互不重叠的可数多块区域，质量直接相加**。

### Dirac 测度与密度

**Dirac 测度** $\delta_p$ 是质量全部集中在一点上的情形。在 $\mathbb{R}$ 上：

$$
\int f\,d\delta_p=f(p).
$$

它不是任何函数 $f(x)$ 的"密度"——没有 Lebesgue 意义下的密度函数能描述 $\delta_p$。

> **Radon–Nikodym 预告**：当一个测度 $\mu$ 相对另一个测度 $\nu$ "够温和"（写作 $\mu\ll\nu$，称 $\mu$ 对 $\nu$ 绝对连续）时，存在密度函数 $\rho$ 使 $\mu(A)=\int_A \rho\,d\nu$ 对所有可测 $A$ 成立。
>
> Dirac 测度对 Lebesgue 测度**不**绝对连续（集中在零测集上），所以**没有 Lebesgue 密度**——这正是为什么物理学里"$\delta(x)$ 函数"在严格意义上不是函数，而是测度（或更广的分布）。

---

## 3. Lebesgue 测度

### 外测度（覆盖定义）

在 $\mathbb{R}$ 上，定义**外测度 (outer measure)**：

$$
m^*(A)=\inf\left\{\sum_{n=1}^\infty\ell(I_n)\ :\ A\subseteq\bigcup_{n=1}^\infty I_n,\ I_n \text{ 是开区间}\right\}.
$$

其中 $\ell(I_n)$ 是区间长度。

**直观**：用**可数多条开区间毯子**盖住 $A$，每种盖法的总长度都是一个候选，取所有候选的下确界。

### Lebesgue 可测集

$A\subseteq\mathbb{R}$ 是 **Lebesgue 可测** 的，若对所有 $E\subseteq\mathbb{R}$，

$$
m^*(E)=m^*(E\cap A)+m^*(E\setminus A).
$$

（Carathéodory 判据——"$A$ 把任意 $E$ 干净地分两半，外测度相加。"）

可测集全体记为 $\mathcal{L}(\mathbb{R})$，它是 $\mathbb{R}$ 上的 σ-代数；$m^*|_{\mathcal{L}}$ 称为 **Lebesgue 测度**，简记 $m$。

> 不是所有 $\mathbb{R}$ 的子集都可测——典型反例是 **Vitali 集**（§3.4 单独讲），构造要用选择公理。但**实践中遇到的开/闭/Borel/可数交并**等集合都可测，所以平时不用为此操心。

### m(ℚ) = 0 的毯子覆盖证明

**命题**：$m(\mathbb{Q})=0$。

{{< details summary="证明：可数稠密集的测度为零" >}}

**$\mathbb{Q}$ 可数**——以 $\mathbb{Q}\cap[0,1]$ 为例，把所有 $p/q$（$0\le p\le q$）摆成二维表格：

| 分母 ↓ ／ 分子 → | 0   | 1   | 2   | 3   | 4   | …   |
|------------------|-----|-----|-----|-----|-----|-----|
| 1                | 0/1 | 1/1 |     |     |     |     |
| 2                |     | 1/2 |     |     |     |     |
| 3                |     | 1/3 | 2/3 |     |     |     |
| 4                |     | 1/4 | 2/4 | 3/4 |     |     |
| 5                |     | 1/5 | 2/5 | 3/5 | 4/5 |     |
| …                |     |     |     |     |     |     |

沿对角线 zig-zag $0/1\to 1/1\to 1/2\to 1/3\to 2/3\to 1/4\to 2/4\to\cdots$ 即可把整张表排成单序列。同样方法对所有 $\mathbb{Q}$ 都有效（先做 $\mathbb{Q}_{\ge 0}$，再镜像负半轴）。所以 $\mathbb{Q}$ 可列：

$$
\mathbb{Q}=\{q_1, q_2, q_3, \ldots\}.
$$

任取 $\varepsilon\gt 0$。对每个 $q_n$，盖一条长度 $\varepsilon/2^n$ 的开区间：

$$
I_n=\left(q_n-\frac{\varepsilon}{2^{n+1}},\ q_n+\frac{\varepsilon}{2^{n+1}}\right),\qquad \ell(I_n)=\frac{\varepsilon}{2^n}.
$$

则 $\mathbb{Q}\subseteq\bigcup_n I_n$，总长度

$$
\sum_{n=1}^\infty\ell(I_n)=\sum_{n=1}^\infty\frac{\varepsilon}{2^n}=\varepsilon.
$$

所以 $m^*(\mathbb{Q})\le\varepsilon$。$\varepsilon$ 任意 $\Rightarrow m^*(\mathbb{Q})=0$，故 $m(\mathbb{Q})=0$。

{{< /details >}}

**这条证明的精髓**：可数无穷个区间，每条只用上一条的一半长度，几何级数总和有限——这是**可数可加性（不是有限可加性）的力量**。Riemann 的有限切割做不到这件事。

直接推论：**任意可数集的 Lebesgue 测度是 0**——所以 $\chi_\mathbb{Q}$ 在 Lebesgue 意义下"几乎处处为 0"，$\int_0^1\chi_\mathbb{Q}\,dm=0$。Riemann 的死结，Lebesgue 一刀切开。

### Vitali 集：不可测集存在

我们来看看病态的维塔利集——**不是所有 ℝ 的子集都能称出重量**。

结论：**Lebesgue σ-代数 $\mathcal{L}(\mathbb{R})$ 是 $2^\mathbb{R}$ 的严格子集**，存在子集 $V\subseteq[0,1]$ 没有任何自洽的"重量"可分配。要看完整的"蛋糕刀"推理，展开下面。

{{< details summary="蛋糕刀比喻：好刀 vs 坏刀，以及为什么需要 σ-代数" >}}

**用集合当"刀"切蛋糕**

把 $[0,1]$ 想成一块蛋糕。集合 $A\subseteq[0,1]$ 当成一把刀：

- 凡是属于 $A$ 的点 → 左盘；
- 凡是不属于 $A$ 的点 → 右盘；
- 分别称两盘的重量，看相加是不是还等于整块蛋糕的 $1$。

**加得起来 = $A$ 是把好刀（可测）；加不起来 = $A$ 是把坏刀（不可测）。**

这正是 §3.2 Carathéodory 判据 $m^*(E)=m^*(E\cap A)+m^*(E\setminus A)$ 的画面版——"$A$ 把任意测试蛋糕 $E$ 干净地分两半，外测度相加。"

**好刀：无理数集**

取 $A = I = [0,1]$ 上的无理数集。拿它切整块蛋糕：

- **左盘**（落在 $I$ 里）：所有无理点，重量 $m(I) = 1$（$[0,1]$ 减去可数零测的 $\mathbb{Q}$，由 §3.3）；
- **右盘**（落在 $I$ 外）：所有有理点，重量 $m(\mathbb{Q}\cap[0,1]) = 0$。

称重相加：

$$
1 + 0 = 1\ \checkmark
$$

刚好整块。换任何测试蛋糕（比如只切 $[0, 0.3]$）账也对得上。**无理数集是把好刀，可测。**

**坏刀：Vitali 集**

接下来构造一把彻底切不对账的刀。

**先给蛋糕涂色**。每个点 $x\in[0,1]$ 涂颜色，规则：

$$
x, y \text{ 同色}\ \iff\ x - y \in \mathbb{Q}.
$$

把蛋糕分成不可数多种颜色——同色 = 互相只差一个有理数；每种颜色都**可数稠密**地撒在整块蛋糕里。

**Vitali 切**：从每种颜色挑**一颗代表点**，攒成集合

$$
V \subseteq [0,1].
$$

这一步对**不可数多种颜色同时挑**——**只能靠选择公理 (Axiom of Choice)**。$V$ 是个怪集合：跨越整块蛋糕，每种颜色只占一颗。

**称重失败：可数无穷份的死局**

不直接给 $V$ 称重，而是看它的**平移副本**怎么拼。把 $V$ 整组沿有理数 $q$ 平移得到

$$
V_q = (V + q)\bmod 1.
$$

所有 $\{V_q : q\in\mathbb{Q}\cap[0,1]\}$ 满足三件事：

1. **两两不重叠**：若两份副本抢同一个点，则原代表同色——但 $V$ 每色只选一个，矛盾；
2. **合起来正好铺满整块蛋糕 $[0,1)$**：每个点都属于某种颜色，必然能由该色代表 + 某个 $q$ 得到；
3. **每份重量相同**（设它叫 $c$）：因为都是 $V$ 平移来的，**平移不改变重量**。

现在称重：可数份相同重量 $c$ 的副本不重叠地铺满整块蛋糕，所以

$$
1 = \underbrace{c + c + c + \cdots}_{\text{可数无穷份}}.
$$

**致命问题**：$c$ 不管取什么都不行——

- $c = 0$：$0 + 0 + 0 + \cdots = 0 \ne 1$；
- $c \gt 0$（哪怕 $0.0001$）：可数个正数相加 $= \infty \ne 1$。

**永远凑不出 1。** 所以 $V$ 根本没有自洽的重量可分配——它是把**坏刀**，不可测。

**为什么不能是 $\tfrac{1}{n}$、为什么级数收敛救不了**

直觉上你可能想说"每份给 $\tfrac{1}{n}$ 不就行了"——

- "**$\tfrac{1}{n}$ 能 work**" 的前提是**份数是有限的 $n$**。$5\times\tfrac15 = 1$ 成立因为份数是 5。可这里份数是**可数无穷**，没有有限 $n$ 可写。
- 那"几何级数 $\sum 1/2^n = 1$ 不是无穷份也能凑出 1 吗"——对，但那是**每份不一样大**，递减级数靠"后面越来越小"才收敛。Vitali 的诅咒**强制每份一样大**（平移不变性逼的），没有"越来越小"这条逃生通道。

"**全相等 + 无穷份**"是死局：正数 $\times \infty = \infty$，零 $\times \infty = 0$，中间没有任何落点能停在 1。

**与 m(ℚ) = 0 的对照**

这正是 §3.3 和 §3.4 的分水岭，也是 Vitali 这一节真正的精华——**两边都在用"可数可加性 + 平移不变性"，但符号方向不一样**：

| | 副本结构 | 每份重量 | 无穷份求和 | 结论 |
|---|---|---|---|---|
| **m(ℚ)=0**（§3.3） | 毯子盖 $\mathbb{Q}$，**互相重叠允许** | 可以**递减** $\varepsilon/2^n$ | 收敛，**可压到任意小** | $m(\mathbb{Q})=0$ |
| **Vitali**（§3.4） | $V_q$ 平移副本，**强制不重叠** | 平移不变性逼着**全相等** $c$ | **只能是 0 或 ∞**，永远跳过 1 | $V$ 不可测 |

毯子覆盖能成立靠的是"碎片可以越铺越小"（递减级数收敛）；Vitali 之所以失败靠的是"碎片必须一样大"（几何级数被禁掉）。

**两条对应的根都是同一组工具**，方向相反。

**这就回答了"为什么要 σ-代数"**

如果坚持要给 $2^\mathbb{R}$ 的每一个子集都称重，Vitali 这种"对不上账"的集合会混进来，整个重量系统自相矛盾（被逼承认 $1 = 0$ 或 $1 = \infty$）。

测度论的策略：**只给"好刀"发执照**——能切得对上账的集合（σ-代数里的）才定义测度，像 Vitali 这种刀直接拒之门外。

$$
\boxed{\,\text{σ-代数} = \text{所有好刀的名册}\,}
$$

这就是 §3.2 那条括号注的真正意义：

$$
\text{开集 / 闭集 / Borel / 它们的可数交并补} \subsetneq \mathcal{L}(\mathbb{R}) \subsetneq 2^\mathbb{R}.
$$

实践中能"自然写下来"的集合全在 $\mathcal{L}(\mathbb{R})$ 里。Vitali 集**必须**靠选择公理才能造，**写不出**具体的元素 $v\in V$——它更像是 ZFC 公理体系下的"理论存在物"，而不是会真正在分析里出现的集合。

> **意义**：Vitali 集是一面镜子。它说明 Lebesgue 测度的力量有上限——不能扩展到 $2^\mathbb{R}$ 上还同时保持**平移不变性 + 可数可加性 + 全 $2^\mathbb{R}$ 上定义**。**三件任选其二都能兼得，三件全要就崩**。Lebesgue 选择牺牲第三件（缩小到 $\mathcal{L}$），保下前两件——这条权衡是测度论的根本姿态。

{{< /details >}}

{{< details summary="证明：Vitali 集不可 Lebesgue 测（形式化版本）" >}}

**第一步：等价关系与代表选取**。

在 $[0,1]$ 上定义 $x\sim y\iff x-y\in\mathbb{Q}$。这是等价关系，把 $[0,1]$ 划分成不可数多个等价类，每类是可数稠密的。

由**选择公理**，从每个等价类中各取一个代表，构成 $V\subseteq[0,1]$。

**第二步：平移构造**。

枚举 $\mathbb{Q}\cap[0,1]=\{q_1, q_2, \ldots\}$。定义

$$
V_n=(V+q_n)\bmod 1\subseteq[0,1].
$$

**断言 A（不交）**：$V_n\cap V_m = \emptyset$ 当 $n\ne m$。

证明：若 $x\in V_n\cap V_m$，则 $\exists v_1, v_2\in V$ 使 $v_1+q_n\equiv v_2+q_m\pmod 1$，即 $v_1-v_2\in\mathbb{Q}$，故 $v_1\sim v_2$。但 $V$ 是各等价类的代表集合，每类只选一个 $\Rightarrow v_1=v_2 \Rightarrow q_n=q_m$，矛盾。

**断言 B（覆盖）**：$[0,1]\subseteq\bigcup_n V_n$。

证明：$\forall x\in[0,1]$，$x$ 所在等价类的代表为某 $v\in V$，则 $x-v\in\mathbb{Q}\cap[-1,1]$。取 $q_n = x-v\bmod 1\in\mathbb{Q}\cap[0,1]$，则 $x\in V+q_n\pmod 1 = V_n$。

**第三步：导出矛盾**。

假设 $V$ Lebesgue 可测。由 Lebesgue 测度的**平移不变性**（与 mod 1 操作的等距性），$m(V_n) = m(V)$ 对所有 $n$。

由不交性与可数可加性，

$$
m([0,1]) = m\!\left(\bigsqcup_n V_n\right) = \sum_{n=1}^\infty m(V_n) = \sum_{n=1}^\infty m(V).
$$

左端 $= 1$。右端：

- $m(V) = 0$ $\Rightarrow$ 和 $= 0$；
- $m(V) \gt 0$ $\Rightarrow$ 和 $= \infty$。

两种情形都跟左端 $=1$ 矛盾。故 $V$ 不可 Lebesgue 测。 $\square$

{{< /details >}}

---

## 4. 可测函数与简单函数

### 可测函数

设 $(X,\Sigma)$ 是可测空间。函数 $f:X\to\mathbb{R}$ 是 **可测函数 (measurable function)**，若

$$
\forall a\in\mathbb{R},\ f^{-1}\big((a,\infty)\big)=\{x\in X: f(x)\gt a\}\in\Sigma.
$$

> **理解**：可测函数 = "切水平条得到的集合都可以称重(可测集)"——这正是 §1 末尾说 Lebesgue 切值域时需要的那个性质。

把 $(a,\infty)$ 换成 $(-\infty,a)$、$[a,b]$、Borel 集等都等价。

### 示性函数与简单函数

**示性函数 (indicator function)**：

$$
\mathbf{1}_A(x)=\begin{cases}1, & x\in A\\ 0, & x\notin A\end{cases}.
$$

$\mathbf{1}_A$ 可测 $\iff A\in\Sigma$。

**简单函数 (simple function)**：可测函数 $\varphi$，**像只取有限多个值**。等价地，

$$
\varphi=\sum_{k=1}^n c_k\,\mathbf{1}_{A_k},\qquad c_k\in\mathbb{R},\ A_k\in\Sigma \text{ 两两不交}.
$$

简单函数的积分定义是显然的（"每个水平台阶 = 高度 × 测度"，再加总）：

$$
\int\varphi\,d\mu=\sum_{k=1}^n c_k\,\mu(A_k).
$$

这是 §5 整个 Lebesgue 积分构造的起点。

### 阶梯逼近定理

**定理（从下方阶梯逼近）**：设 $f:X\to[0,\infty]$ 非负可测，则**存在**简单函数列 $\varphi_n$ 满足：

1. $0\le\varphi_1\le\varphi_2\le\cdots\le f$（**单调递增**）；
2. $\varphi_n(x)\to f(x)$ **逐点收敛** 对所有 $x\in X$；
3. 若 $f$ 有界，收敛**一致**。

{{< details summary="证明：阶梯逼近定理（切值域 + 向下压平）" >}}

**核心构造**：在每个第 $n$ 步，把值域 $[0, 2^n]$ 等分为 $2^{2n}$ 份，每份宽 $2^{-n}$；值域超过 $2^n$ 的全部"截"到 $2^n$。具体定义：

$$
\varphi_n(x)=\begin{cases}\dfrac{k-1}{2^n}, & x\in f^{-1}\!\left(\left[\tfrac{k-1}{2^n},\tfrac{k}{2^n}\right)\right),\ k=1,\ldots,n\cdot 2^n\\[4pt] n, & f(x)\ge n\end{cases}.
$$

**条件 1（单调递增）**：从 $\varphi_n$ 到 $\varphi_{n+1}$，值域分辨率翻倍——每条水平条被切成两半，下半条 $\varphi$ 值不变，上半条 $\varphi$ 值**严格增大** $1/2^{n+1}$。所以 $\varphi_{n+1}\ge\varphi_n$。

**条件 2（逐点收敛）**：

- 若 $f(x)\lt\infty$：当 $n$ 足够大使 $f(x)\lt n$ 时，$\varphi_n(x)$ 落在 $f(x)$ 同一条水平条里，相差 $\lt 2^{-n}\to 0$。
- 若 $f(x)=\infty$：$\varphi_n(x)=n\to\infty=f(x)$。

**条件 3（有界时一致）**：若 $f\le M$，$n\gt M$ 时 $\varphi_n$ 永不被截顶，误差 $\le 2^{-n}\to 0$ **均匀**对所有 $x$。

{{< /details >}}

这条定理是 Lebesgue 积分的**架桥工具**：先在简单函数上定义积分（显然），再用阶梯逼近把它推广到所有非负可测函数。**"从下方"和"单调递增"两条很关键**——保证了 §5 取上确界时不出问题，也是 Part 7 MCT 的天然预备。

### 反例预告：行走的尖塔

那 **"丢掉单调约束"** 会发生什么？看一个简单函数序列：

$$
f_n(x) = n\,\mathbf{1}_{(0,\,1/n)}(x).
$$

每个 $f_n$ 都是简单函数（单台阶，高 $n$、宽 $\tfrac{1}{n}$）。逐点极限：

- $x = 0$：始终在塔外，$f_n(0) = 0$；
- $x \gt 0$：$n$ 大到 $\tfrac{1}{n}\lt x$ 时塔已跑出 $x$ 右边，$f_n(x) = 0$。

故 $f_n\to 0$ **处处**。$\{f_n\}$ 长得像 $f = 0$ 的某种简单函数逼近——**但它不是阶梯逼近**。

**为什么不是**：阶梯逼近要求 $\varphi_n\le f$（从下方）且 $\varphi_n\le\varphi_{n+1}$（单调）。这里 $f = 0$ 而每个 $f_n$ 在自己的塔里**远远高于 $0$**；并且塔的位置和形状都在变（$f_1$ 的塔在 $(0,1)$、$f_2$ 在 $(0,\tfrac12)$、…），既不"从下方"也不"单调"。

**后果在积分上现形**：

$$
\int_0^1 f_n\,dm = n\cdot\tfrac{1}{n} = 1\quad\forall n.
$$

按"阶梯逼近 + MCT"的逻辑，积分应当趋于 $\int 0\,dm = 0$。但这里**恒为 1**——**差出整整 1 个单位的质量**。这 1 单位"逃到无穷高、无穷瘦的塔里藏起来了"。

> **预告 Part 7 §3.4**：这串尖塔会被同时摆到三大收敛定理（MCT、Fatou、DCT）面前受审，看每条定理面对同一份病例时怎么各自反应——那是阶梯逼近"从下方单调"这条要求的下游兑现。

阶梯逼近的"从下方单调"和 MCT 的"非负 + 单调递增"是**同一根血脉的两端**：没有它，简单函数序列可以行为完全不可控。

---

## 5. Lebesgue 积分（三步构造）

### 第一步：非负简单函数

$$
\varphi=\sum_{k=1}^n c_k\,\mathbf{1}_{A_k},\ c_k\ge 0\ \Longrightarrow\ \int\varphi\,d\mu=\sum_{k=1}^n c_k\,\mu(A_k).
$$

这里 $0\cdot\infty=0$ 约定（用于 $c_k=0$ 但 $\mu(A_k)=\infty$ 的情形）。

### 第二步：非负可测函数

$$
\int f\,d\mu=\sup\left\{\int\varphi\,d\mu\ :\ \varphi \text{ 简单非负},\ 0\le\varphi\le f\right\}.
$$

由阶梯逼近定理（§4），这个 sup **总能被达到**（由阶梯列单调递增逼近的极限就是这个 sup）。这是积分的"几何含义"——"$f$ 与 $x$ 轴之间的面积，从下方填满"。

### 第三步：一般可测函数

把 $f$ 拆成正负部 $f=f^+-f^-$，其中

$$
f^+(x)=\max(f(x),0),\qquad f^-(x)=\max(-f(x),0).
$$

两者都非负可测。**$f$ 称为 $\mu$-可积**，若

$$
\int f^+\,d\mu\lt\infty\ \text{ 且 }\ \int f^-\,d\mu\lt\infty.
$$

此时

$$
\int f\,d\mu=\int f^+\,d\mu-\int f^-\,d\mu.
$$

注意"可积"要求**正负部分别有限**。$\int |f|\,d\mu\lt\infty$ 是等价条件。

### Riemann 可积 ⇒ Lebesgue 可积

**事实**：$[a,b]$ 上 Riemann 可积的函数也是 Lebesgue 可积，且两个积分相等。**反之不然**：$\chi_\mathbb{Q}$ Lebesgue 可积但 Riemann 不可积。

> 所以 Lebesgue 积分是 Riemann 的**严格扩展**——所有传统计算照旧能用，新工具只对"传统积分搞不定"的对象起作用。

### 几乎处处 (a.e.)

**关键概念**：性质 $P$ 在 $X$ 上**几乎处处成立 (almost everywhere, a.e.)**，若

$$
\mu\big(\{x\in X: P(x) \text{ 不成立}\}\big)=0.
$$

例子：

- $f=g$ a.e.：$\{x: f(x)\ne g(x)\}$ 是零测集；
- $f_n\to f$ a.e.：除了零测集外，$f_n(x)\to f(x)$。

**积分对 a.e. 免疫**：

$$
f=g\ \text{a.e.}\ \Longrightarrow\ \int f\,d\mu=\int g\,d\mu.
$$

因为它俩差异只发生在零测集上，对积分的贡献为 $0$。

**这驱动了一个根本约定**：

> **把"a.e. 相等"作为等价关系，Lebesgue 积分的真正定义域是等价类，不是函数本身。**

下一篇 Part 7 §4 会看到，$L^p$ 空间的元素从一开始就是 a.e. 等价类——这是它能成为完备赋范空间（每个 Cauchy 列收敛到一个**唯一**元素）的根本原因。如果不商掉 a.e.，"不同函数"可能对应"同一个积分对象"，范数 $\|f\|_p=0$ 就推不出 $f=0$，正定性就崩了。

---

## 总结：三条主轴

这一篇做了一件事——**把积分从"区间和"升级到"质量加权"**。围绕它的是三条主轴：

1. **切值域 vs 切定义域**。Lebesgue 的根本视角转向：横轴切不动的（Dirichlet 函数），纵轴切就利索；"按面值堆"比"按位置堆"对乱序数据更鲁棒。这背后的代价是要先建立"称重"（测度）的机器。
2. **σ-代数 + 可数可加性**。"σ-" 不是装饰，是命脉——可数（不是有限）可加性让 $m(\mathbb{Q})=0$ 那种"无穷小区间总和"的论证成立。这正是 Lebesgue 击败 Riemann 的根本武器，也是 Part 7 三大收敛定理（MCT/Fatou/DCT）能成立的底层。
3. **阶梯逼近 + a.e. 等价类**。"从下方单调递增逼近"让 Lebesgue 积分有干净的归纳定义（简单 → 非负 → 一般），同时为 MCT 备好了胚胎。"a.e." 把"个别点的值"扔进不在乎范畴，让 $L^p$ 空间的范数能成为真正的范数（正定）。

---

## 下一站：Part 7

Part 7 拿这套工具做**三件事**：

- **三大收敛定理**：MCT、Fatou、DCT。把"取极限和积分换序"这件事彻底搞清——什么时候可以换、何时质量逃逸、天花板（支配函数）的作用；
- **$L^p$ 空间**：$L^p$ 的定义、Hölder 不等式（Cauchy–Schwarz 是 $p=2$ 的特例）、Minkowski（$L^p$ 的三角不等式）；
- **完备性与对偶**：Riesz–Fischer 定理保证 $L^p$ 完备（Banach），$L^2$ 是**唯一**能配内积的 $L^p$（与 Part 3 的 Hilbert 空间桥接），$(L^p)^*=L^q$（与 Part 4 对偶配对桥接）。

Part 6 是"造积分"，Part 7 是"用积分"。两边接上后，Part 3 §3 / §6 一直在偷偷用的"$L^2[0,T]$ 是 Hilbert 空间"才算真正落地。
