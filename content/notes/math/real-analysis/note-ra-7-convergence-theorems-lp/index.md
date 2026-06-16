---
date: '2026-06-16T20:30:00+09:00'
draft: false
title: '实分析 Part 7：MCT、Fatou、DCT 与 L^p 空间'
summary: "用 Part 6 造好的 Lebesgue 积分做事。三大收敛定理把『极限和积分能否换序』这件事讲透：MCT 单调护送、Fatou 单向不等、DCT 用支配函数挡住质量逃逸。配上质量逃逸的尖塔反例，三者关系一目了然。然后建 L^p 空间：Hölder（Cauchy–Schwarz 的 p 推广）、Minkowski（L^p 三角不等式）、Riesz–Fischer（L^p 完备 ⇒ Banach）、L^2 唯一可配内积（接 Part 3 Hilbert）、(L^p)*=L^q（接 Part 4 对偶）。Part 3-Part 7 至此一脉贯通。"
description: "实分析进阶笔记：Lebesgue 积分版本的单调收敛定理 (MCT)、Fatou 引理、控制收敛定理 (DCT)、三者之间的蕴含关系、尖塔反例与质量逃逸、天花板/支配函数的作用、L^p 空间、a.e. 等价类、Hölder 不等式（Cauchy–Schwarz 是 p=2 的特例）、Minkowski 不等式、Riesz–Fischer 完备性定理、L^2 作为唯一可配内积的 L^p、(L^p)*=L^q 对偶配对。"
tags: ["Real Analysis", "Measure Theory", "Lebesgue Integral", "Monotone Convergence", "Fatou", "Dominated Convergence", "Lp Space", "Holder", "Minkowski", "Riesz-Fischer", "Banach Space", "Hilbert Space", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-实分析7-收敛定理与lp/
  - /notes/note-ra-7-convergence-theorems-lp/
---

# 实分析 Part 7：MCT、Fatou、DCT 与 L^p 空间

> Part 6 把 Lebesgue 积分造出来了。Part 7 拿它做两件事：**先把极限和积分换序的规则定死**（三大收敛定理），**再建 $L^p$ 空间**，跟 Part 3 的 Hilbert、Part 4 的对偶配对在 Riesz–Fischer 那一站正式接上。

链条：

$$
\text{MCT}\to\text{Fatou}\to\text{DCT}\to L^p\to\text{Hölder}\to\text{Minkowski}\to\text{Riesz–Fischer}\to (L^p)^*=L^q
$$

几条主旋律：

- **三大收敛定理的关系**：MCT $\Rightarrow$ Fatou $\Rightarrow$ DCT。MCT 是源头，Fatou 是中转，DCT 是最常用的工程工具。
- **质量逃逸 (mass escape) 是反例机器**：尖塔函数 $f_n=n\mathbf{1}_{[0,1/n]}$ 单点收敛到 0，但积分恒为 1——质量"跑到无穷高"。这是为什么 Fatou 只有单边不等式、DCT 需要支配函数的根本原因。
- **L^p 的两块基石**：Hölder 给乘积积分的不等式控制；Minkowski 给 $L^p$ 的三角不等式（$\|\cdot\|_p$ 真的是范数）。
- **Riesz–Fischer 是 Part 3 的"补票"**：$L^p$ 完备性的真正证明在这里。Part 3 §3 当时把"$L^2$ 是 Hilbert 空间"直接当结论用，这一节是它的根。
- **$L^2$ 独尊**：所有 $L^p$ 里只有 $p=2$ 能配出内积（平行四边形恒等式只对 $p=2$ 成立），这是 Hilbert 空间方法在 $L^2$ 上格外有力的根本原因。
- **$(L^p)^* = L^q$**：与 Part 4 的对偶配对结构对齐——$\ell^p$ 的对偶是 $\ell^q$，$L^p$ 的也是 $L^q$。

---

## 1. 单调收敛定理 (MCT)

### 命题

设 $(X,\Sigma,\mu)$ 是测度空间，$f_n:X\to[0,\infty]$ 是**非负可测**函数列，**单调递增** $f_1\le f_2\le\cdots$，逐点收敛到 $f$。则

$$
\lim_{n\to\infty}\int f_n\,d\mu=\int f\,d\mu=\int\lim_n f_n\,d\mu.
$$

**用一句话**：单调递增非负序列，极限和积分**可以无条件换序**。

{{< details summary="证明：MCT" >}}

**第一步：$\int f_n\,d\mu$ 单调递增**。由 $f_n\le f_{n+1}\le f$ 与积分单调性，$\int f_n\,d\mu\le\int f_{n+1}\,d\mu\le\int f\,d\mu$。所以 $\lim_n\int f_n\,d\mu$ 存在（可能 $=\infty$），且 $\le\int f\,d\mu$。

**第二步：反向不等式**。任取简单函数 $0\le\varphi\le f$ 与常数 $\alpha\in(0,1)$，令

$$
A_n=\{x\in X: f_n(x)\ge\alpha\varphi(x)\}.
$$

由 $f_n\nearrow f\ge\varphi\gt\alpha\varphi$ 与单调性，$A_n\nearrow X$。

$$
\int f_n\,d\mu\ge\int_{A_n}f_n\,d\mu\ge\alpha\int_{A_n}\varphi\,d\mu.
$$

由测度的下连续性（$A_n\nearrow X$ ⇒ $\mu(A_n)\nearrow\mu(X)$），

$$
\int_{A_n}\varphi\,d\mu\to\int\varphi\,d\mu.
$$

取 $n\to\infty$ 得 $\lim_n\int f_n\,d\mu\ge\alpha\int\varphi\,d\mu$。再令 $\alpha\nearrow 1$、对 $\varphi\le f$ 取 sup 得 $\lim_n\int f_n\,d\mu\ge\int f\,d\mu$。

两边夹得 $\lim_n\int f_n\,d\mu=\int f\,d\mu$。

{{< /details >}}

### 与 Part 6 阶梯逼近的对接

Part 6 §4 的阶梯逼近定理刚好给出了"非负可测函数 $f$ 总有简单函数列 $\varphi_n\nearrow f$"——MCT 立刻保证：

$$
\int f\,d\mu=\lim_n\int\varphi_n\,d\mu.
$$

也就是说 **Part 6 §5 第二步的 sup 定义（非负可测的积分）**等价于 **从阶梯函数取极限**。这两套定义在 MCT 下统一。

---

## 2. Fatou 引理

### 命题

设 $f_n:X\to[0,\infty]$ 是非负可测函数列（**不要求单调，不要求收敛**）。则

$$
\int\liminf_n f_n\,d\mu\le\liminf_n\int f_n\,d\mu.
$$

**用一句话**：先取 $\liminf$ 再积分 $\le$ 先积分再取 $\liminf$。$\liminf$ 是单边的。

{{< details summary="证明：Fatou 引理（从 MCT 推出）" >}}

令 $g_n=\inf_{k\ge n}f_k$。则 $g_n\nearrow\liminf_n f_n$ 单调递增非负。

由 MCT，

$$
\int\liminf_n f_n\,d\mu=\lim_n\int g_n\,d\mu.
$$

又 $g_n\le f_k$ 对所有 $k\ge n$ 成立，因此

$$
\int g_n\,d\mu\le \inf_{k\ge n}\int f_k\,d\mu.
$$

令 $n\to\infty$：

$$
\lim_n\int g_n\,d\mu\le\liminf_n\int f_n\,d\mu.
$$

合起来得 Fatou。

{{< /details >}}

### 为什么是单边的：尖塔反例

**尖塔反例 (moving spike)**：在 $[0,1]$ 上，

$$
f_n(x)=n\cdot\mathbf{1}_{[0,1/n]}(x).
$$

对每个 $x\gt 0$，$n$ 足够大时 $x\notin[0,1/n]$，$f_n(x)=0$。所以 $f_n\to 0$ 几乎处处（$\{0\}$ 是零测）。

但

$$
\int f_n\,dm=n\cdot\frac{1}{n}=1\quad\forall n.
$$

所以 $\int\lim_n f_n=\int 0=0\ne 1=\lim_n\int f_n$。

> **质量逃逸 (mass escape)**：函数列每一项的"质量" $=1$，但极限函数捕不到这份质量——它"跑到无穷高的细针里"消散了。Fatou 在这里给出 $0\le 1$（成立但严格不等）；MCT 不适用（$f_n$ 不单调）；DCT 也不适用（找不到非平凡支配函数）。

这就是为什么三大定理里 Fatou 只有单边——**质量可能逃逸，积分极限可能严格大于极限的积分**。

---

## 3. 控制收敛定理 (DCT)

### 命题

设 $f_n:X\to\mathbb{R}$ 可测，$f_n\to f$ a.e.，且**存在支配函数 (dominating function)** $g\ge 0$ 可测、可积，使

$$
|f_n|\le g\ \text{a.e.}\quad\forall n.
$$

则 $f$ 可积，且

$$
\lim_n\int f_n\,d\mu=\int f\,d\mu.
$$

**用一句话**：有可积"天花板"罩着的序列，极限和积分**可以换序**。

{{< details summary="证明：DCT（双向 Fatou 夹）" >}}

$g+f_n\ge 0$ a.e.，Fatou 给：

$$
\int\liminf_n(g+f_n)\,d\mu\le\liminf_n\int(g+f_n)\,d\mu.
$$

由 $f_n\to f$，左边 $=\int(g+f)\,d\mu$；右边 $=\int g\,d\mu+\liminf_n\int f_n\,d\mu$。约去 $\int g$ 得

$$
\int f\,d\mu\le\liminf_n\int f_n\,d\mu.
$$

同理对 $g-f_n\ge 0$ 用 Fatou 得 $\int f\,d\mu\ge\limsup_n\int f_n\,d\mu$。

两边夹得 $\liminf=\limsup=\int f\,d\mu$，即 $\lim_n\int f_n\,d\mu=\int f\,d\mu$。

{{< /details >}}

### 天花板挡住质量逃逸

回到尖塔反例：$f_n=n\mathbf{1}_{[0,1/n]}$。要找支配 $g\ge f_n$ a.e.，至少在 $[0,1/n]$ 上 $g\ge n$。让这对所有 $n$ 成立：固定 $x\gt 0$，所有满足 $x\le 1/n$ 的 $n$ 都要求 $g(x)\ge n$，所以

$$
g(x)\ge\sup_{n\le 1/x}n=\lfloor 1/x\rfloor.
$$

在 $0\lt x\le 1/2$ 上，$\lfloor 1/x\rfloor\ge 1/(2x)$，而 $\int_0^{1/2}1/x\,dx=\infty$。所以任何这样的 $g$ 都不可积——**找不到可积支配 $g$**。

> **DCT 的本质**：可积"天花板"$g$ 把所有 $f_n$ 同时压在一个有限质量的容器里，质量逃不出去，于是极限和积分可以换序。"质量逃逸"在 DCT 的前提下被几何性地禁止了。

### 三大定理的关系

```
            MCT (单调非负)
              ↓ (取 g_n = inf_{k≥n} f_k)
            Fatou (单边不等)
              ↓ (对 g±f_n 双向用)
            DCT (有支配)
```

**强度递减、适用性递增**：

- **MCT** 要求最强（非负 + 单调），结论最干净（直接换序）；
- **Fatou** 要求最弱（只要非负），结论最弱（单边不等）；
- **DCT** 居中（不要求单调，要求有支配），结论也直接（换序）。

工程上最常用的是 **DCT**——只要能找出"显然可积"的支配函数（比如 $f_n$ 一致有界，或被 $|f|+1$ 罩住），就能直接换序。

---

## 4. $L^p$ 空间

### 定义

设 $(X,\Sigma,\mu)$ 是测度空间，$1\le p\lt\infty$。

$$
\mathcal{L}^p(X,\mu)=\left\{f:X\to\mathbb{R}\ \text{可测}\ :\ \int_X|f|^p\,d\mu\lt\infty\right\}.
$$

配上

$$
\|f\|_p=\left(\int_X|f|^p\,d\mu\right)^{1/p}.
$$

$p=\infty$ 的特例：

$$
\mathcal{L}^\infty(X,\mu)=\{f \text{ 可测}: f \text{ 本质有界}\},\qquad\|f\|_\infty=\operatorname*{ess\,sup}_x|f(x)|.
$$

其中**本质上确界 (essential supremum)** 忽略零测集上的尖峰：$\operatorname*{ess\,sup}f=\inf\{M: |f|\le M\ \text{a.e.}\}$。

### a.e. 等价类

**$\|\cdot\|_p$ 在 $\mathcal{L}^p$ 上不是范数**——存在非零函数 $f$（譬如 $\mathbf{1}_\mathbb{Q}$）使 $\|f\|_p=0$，正定性失败。

**修法**：商掉 a.e. 等价关系：

$$
L^p(X,\mu)=\mathcal{L}^p(X,\mu)/\sim,\qquad f\sim g\iff f=g\ \text{a.e.}
$$

$L^p$ 的元素是"a.e. 等价类"。在 $L^p$ 上 $\|\cdot\|_p$ 才真正是范数。

> 这是 Part 6 §5 末尾"a.e. 等价类作为根本约定"的兑现。**$L^p$ 一开始就是商空间**，不是函数空间。日常使用中"$f\in L^p$"指的是"$f$ 的等价类 $[f]\in L^p$"，但通常省略中括号。

---

## 5. Hölder 与 Minkowski

要证 $\|\cdot\|_p$ 是范数，关键是三角不等式（Minkowski），而 Minkowski 又靠 Hölder 撑底。

### Hölder 不等式

设 $1\le p,q\le\infty$，$\tfrac1p+\tfrac1q=1$（$p, q$ 称**共轭指标**）。则对可测 $f, g$，

$$
\int|fg|\,d\mu\le\|f\|_p\cdot\|g\|_q.
$$

**特例**：$p=q=2$ 时是 **Cauchy–Schwarz 不等式**（Part 3 §3 已用）。

{{< details summary="证明：Hölder 不等式（Young 不等式法）" >}}

先看端点：若 $p=1,q=\infty$，则 $|fg|\le \|g\|_\infty |f|$ a.e.，积分即得；$p=\infty,q=1$ 同理。

下面设 $1\lt p,q\lt\infty$。

若 $\|f\|_p=0$ 或 $\|g\|_q=0$，两边为零，平凡。设两个都正。归一化 $F=f/\|f\|_p$, $G=g/\|g\|_q$，化归为 $\|F\|_p=\|G\|_q=1$ 时证 $\int|FG|\,d\mu\le 1$。

**Young 不等式**：对 $a,b\ge 0$ 与 $1/p+1/q=1$，

$$
ab\le\frac{a^p}{p}+\frac{b^q}{q}.
$$

证明：由加权 AM-GM，

$$
\frac{a^p}{p}+\frac{b^q}{q}\ge (a^p)^{1/p}(b^q)^{1/q}=ab.
$$

取 $a=|F|, b=|G|$：

$$
|FG|\le\frac{|F|^p}{p}+\frac{|G|^q}{q}.
$$

积分：

$$
\int|FG|\,d\mu\le\frac{1}{p}\int|F|^p\,d\mu+\frac{1}{q}\int|G|^q\,d\mu=\frac{1}{p}+\frac{1}{q}=1.
$$

代回原始 $f,g$ 得 Hölder。

{{< /details >}}

### Minkowski 不等式（$L^p$ 三角不等式）

设 $1\le p\le\infty$。对可测 $f, g$，

$$
\|f+g\|_p\le\|f\|_p+\|g\|_p.
$$

{{< details summary="证明：Minkowski 不等式（用 Hölder）" >}}

$p=1$ 时是积分单调性的直接推论；$p=\infty$ 是 $\sup$ 的三角不等式。设 $1\lt p\lt\infty$。

$$
|f+g|^p=|f+g|\cdot|f+g|^{p-1}\le(|f|+|g|)|f+g|^{p-1}.
$$

积分：

$$
\int|f+g|^p\,d\mu\le\int|f||f+g|^{p-1}\,d\mu+\int|g||f+g|^{p-1}\,d\mu.
$$

对每一项用 Hölder（与共轭指标 $q=p/(p-1)$）：

$$
\int|f||f+g|^{p-1}\,d\mu\le\|f\|_p\cdot\|(|f+g|^{p-1})\|_q=\|f\|_p\cdot\|f+g\|_p^{p-1}.
$$

同理对 $g$ 项。合起来：

$$
\|f+g\|_p^p\le(\|f\|_p+\|g\|_p)\cdot\|f+g\|_p^{p-1}.
$$

两边除以 $\|f+g\|_p^{p-1}$ 得 Minkowski。

{{< /details >}}

至此 $\|\cdot\|_p$ 的三条范数公理都齐了——$(L^p, \|\cdot\|_p)$ 是赋范空间。

---

## 6. Riesz–Fischer 定理：$L^p$ 完备

到这里"$L^p$ 是 Banach 空间"还差最后一步——完备性。

**定理 (Riesz–Fischer)**：$1\le p\le\infty$，$L^p(X,\mu)$ 是完备的赋范空间，即**Banach 空间**。

{{< details summary="证明：Riesz–Fischer（先证 1≤p<∞，再处理 p=∞）" >}}

先设 $1\le p\lt\infty$。

设 $(f_n)\subseteq L^p$ 是 Cauchy 列。

**第一步：取一个"快速 Cauchy"子列**。可选 $n_1\lt n_2\lt\cdots$ 使

$$
\|f_{n_{k+1}}-f_{n_k}\|_p\lt 2^{-k}.
$$

**第二步：构造极限**。令

$$
g_K(x)=\sum_{k=1}^K|f_{n_{k+1}}(x)-f_{n_k}(x)|,\qquad g(x)=\sum_{k=1}^\infty|f_{n_{k+1}}(x)-f_{n_k}(x)|.
$$

由 Minkowski（用 $K$ 次），$\|g_K\|_p\lt\sum_{k=1}^K 2^{-k}\lt 1$。由于 $g_K\nearrow g$，也有 $g_K^p\nearrow g^p$；由 MCT 得 $\|g\|_p\le 1\lt\infty$，故 $g$ a.e. 有限。

因此**级数 $\sum_k(f_{n_{k+1}}-f_{n_k})$ a.e. 绝对收敛**，部分和 $f_{n_K}-f_{n_1}\to F\in L^p$ a.e.；令 $f=F+f_{n_1}$。

**第三步：子列 $f_{n_k}\to f$ 在 $L^p$ 中**。$|f_{n_k}-f|\le 2g\in L^p$（支配），由 DCT 得 $\|f_{n_k}-f\|_p\to 0$。

**第四步：原列也收敛到 $f$**。原列 Cauchy + 子列收敛 $\Rightarrow$ 原列收敛（Part 2 的经典套路："柯西 + 收敛子列 ⇒ 收敛"）。

$p=\infty$ 的情形单独看：若 $(f_n)$ 在 $\|\cdot\|_\infty$ 下 Cauchy，则可取子列满足 $\|f_{n_{k+1}}-f_{n_k}\|_\infty\lt 2^{-k}$。在去掉一个零测集后，这个子列逐点一致 Cauchy，极限 $f$ 本质有界，且 $\|f_{n_k}-f\|_\infty\to 0$；再由原列 Cauchy 推出 $f_n\to f$ 于 $L^\infty$。所以 $L^\infty$ 也完备。

{{< /details >}}

**关键工具回顾**：对 $1\le p\lt\infty$，MCT（积出 $g$ 的范数）+ DCT（把子列收敛升级为 $L^p$ 收敛）+ Part 2 §8 的"柯西 + 收敛子列 ⇒ 收敛"——三件套合力。$p=\infty$ 则靠本质上确界范数下的一致 Cauchy 论证。**Part 6 + 前 5 节积分理论的全部投资在这里集中变现**。

> Part 3 §3 当时说"$L^2[0,1]$ 是 Hilbert 空间"直接用作结论；Riesz–Fischer 就是它的根。

---

## 7. $L^2$ 独尊与 $(L^p)^*=L^q$

### $L^2$ 是**唯一**能配内积的 $L^p$

定义

$$
\langle f, g\rangle=\int f\,\overline{g}\,d\mu,
$$

在 $L^2$ 上立刻得到一个内积（线性、共轭对称、正定都是积分性质），它诱导的范数正是 $\|f\|_2=\sqrt{\langle f,f\rangle}$。

**为什么通常只有 $p=2$**：在非平凡测度空间上，若 $L^p$ 范数来自某个内积，则它必须满足**平行四边形恒等式**：

$$
\|f+g\|^2+\|f-g\|^2=2\|f\|^2+2\|g\|^2.
$$

可以验证 $L^p$ 范数在 $p\ne 2$ 时违背这条等式（在能取到两个不交正测集的空间上，取简单的 $\mathbf{1}_A, \mathbf{1}_B$ 即可）。退化的一维情形不在这里讨论。

**所以**：

$$
L^2 = \text{完备 + 内积} = \text{Hilbert 空间}.
$$

这就是为什么所有 PDE 弱解理论、量子力学态空间、信号处理 Parseval 等式都偏爱 $L^2$——在通常的非平凡情形下，它是 $L^p$ 家族里**唯一保留 $\mathbb{R}^n$ 全部几何**的那个。

### 对偶配对 $(L^p)^* = L^q$

**对偶配对**：在常见的 $\sigma$-有限测度空间上，对 $1\le p\lt\infty$ 与共轭指标 $q$，

$$
\Phi:L^q\to(L^p)^*,\qquad \Phi(g)(f)=\int fg\,d\mu
$$

是**等距同构**。即

$$
(L^p)^*\cong L^q.
$$

> Hölder 不等式给"$\Phi(g)$ 有界且 $\|\Phi(g)\|\le\|g\|_q$"；反向（每个 $L^p$ 上的有界泛函都是这种积分形式）的证明要用 Radon–Nikodym 定理，跳过细节。

### 与 Part 4 §3 的对接

回看 Part 4 §3 的"经典对偶配对"表，$\ell^p$ 与 $\ell^q$ 配对、$L^p$ 与 $L^q$ 配对，**当时是直接引用**。现在 Riesz–Fischer + Hölder + Radon–Nikodym 把它的根都讲清楚了。

**注意 $p=\infty$ 的例外**：$(L^\infty)^*\supsetneq L^1$，严格大。这也对应 Part 4 §3 提过的"$\ell^\infty\ne(\ell^1)^*$ 反向"——$p=\infty$ 在对偶 / 自反性 / 弱拓扑里普遍是例外。

---

## 总结：积分理论的全图

Part 6 + Part 7 合起来构成一个完整的"造积分 + 用积分"闭环。它在 Part 1–Part 5 的整体地图里占据**底层基础设施**的位置：

```
Part 1-2 (ℝ 上的 ε-N、完备性)
   ↓
Part 3 (度量/赋范/Hilbert/Fourier) ←─── Part 7 §6-7
   ↓                                       ↑ (Riesz–Fischer 补 L² 完备性)
Part 4 (算子/对偶/谱/紧)          ←─── Part 7 §7
   ↓                                       ↑ ((L^p)*=L^q 补对偶配对)
Part 5 (弱收敛/Hahn-Banach/不动点)
   ↓
Part 6-7 (测度/积分/L^p)
   ↑
   是 Part 3 §6 (L² Fourier)、Part 4 §3 ($\ell^p, L^p$ 对偶) 一直在用
   但从未严格定义的对象——这两篇是补票
```

**三件回头看才看清的事**：

1. **Lebesgue 积分不是"另一种积分"**，而是 Riemann 积分的**严格扩展 + 收敛定理更友好的版本**。所有计算照旧能用，新工具只对 Riemann 处理不动的对象起作用（高度不连续、逐点收敛极限、$L^p$ 完备化）。
2. **可数可加性 + 阶梯逼近 + a.e. 等价类** 是三件让 Lebesgue 优雅的内置武器。可数可加让 $m(\mathbb{Q})=0$ 类反直觉变成两行计算；阶梯逼近让积分有归纳定义；a.e. 让 $L^p$ 能成为真正的赋范空间。
3. **三大收敛定理 + Riesz–Fischer = $L^p$ 完备性的真正证明**。Part 3 §3 直接用作结论的事，现在有了底——MCT 让阶梯函数的极限定义自洽，DCT 让"逐点收敛 + 支配"升级为 $L^p$ 收敛，Riesz–Fischer 把 Cauchy 子列拼成完整极限。三者合力，"$L^p$ 是 Banach 空间"这件事终于站起来了。

---

## 下一站候选

到此为止，实分析 Part 1-7 把分析的**主干**全部走完了。后续路径根据兴趣可以选：

- **Sobolev 空间**：把 $L^p$ + 弱导数拼起来做 PDE 弱解（Part 5 的弱收敛 + Part 6-7 的积分理论联手）；
- **谱测度与谱定理（连续谱版）**：把 Part 4 的紧算子谱定理推广到一般有界自伴算子，用到 Borel 测度的算子值版本；
- **概率论严格基础**：测度论 + Radon–Nikodym 给随机变量、条件期望、鞅论奠基；
- **拓扑向量空间 / 局部凸空间**：把 Part 5 的弱拓扑系统化，进入泛函分析"现代化"那一层。

无论走哪条，Part 1-7 的工具集已经齐了。
