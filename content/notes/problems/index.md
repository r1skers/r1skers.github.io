---
date: '2026-06-23T10:00:00+09:00'
draft: false
title: '问题集'
summary: "配套笔记的练习，按主题分小节、一题一条列出，每题附可展开的参考解答。先合后分：题少放一个小节，攒多了再拆独立页。"
description: "数学笔记的配套练习题集，按主题分小节、逐题列举，附参考解答；不少题带「换种语言再证一遍」的提示。"
tags: ["Problems", "Exercises"]
categories: ["Crucible"]
aliases:
  - /notes/note-problems/
---

# 问题集

配套笔记的练习，按主题分小节、一题一条列出，每题附可展开的参考解答。


---

## 优化与变分

### 拉格朗日乘子与 Jensen 不等式下的最大熵

设 $|\mathcal{X}|=3$。求熵

$$
H(p_1,p_2,p_3)=-\sum_{i=1}^3 p_i\ln p_i
$$

在约束 $\sum_i p_i=1$ 下的最大值；分别用拉格朗日乘子法与 Jensen 不等式证明它在 $p_1=p_2=p_3=\tfrac13$ 取到，并体会两者是同一件事的两种语言。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [大一统知识地图 · 熵](https://r1skers.github.io/r1skers-knowledge-map/?map=probability&node=%E7%86%B5)*

{{< details summary="参考解答" >}}

**拉格朗日语言（找驻点）.** 要最大化的是熵 $H=-\sum_{i=1}^3 p_i\ln p_i$，约束 $p_1+p_2+p_3=1$ 先写成 $g(p)=\sum_i p_i-1=0$。构造拉格朗日函数

$$
L(p_1,p_2,p_3,\lambda)=-\sum_{i=1}^3 p_i\ln p_i+\lambda\Big(\sum_{i=1}^3 p_i-1\Big),
$$

也就是「新函数 = 要最大化的熵 $+\ \lambda\times$ 约束条件」。

对每个 $p_i$ 求偏导。先看单独一项 $-p_i\ln p_i$：

$$
\frac{d}{dp_i}\big(-p_i\ln p_i\big)=-(\ln p_i+1),
$$

于是

$$
\frac{\partial L}{\partial p_i}=-(\ln p_i+1)+\lambda=0
\ \Longrightarrow\
\ln p_i=\lambda-1
\ \Longrightarrow\
p_i=e^{\lambda-1}.
$$

右边与 $i$ 无关，所以 $p_1=p_2=p_3$。代入约束 $\sum_i p_i=1$：

$$
3\,e^{\lambda-1}=1\ \Longrightarrow\ p_i=\tfrac13,\qquad H_{\max}=\ln 3.
$$

$H$ 是凹函数（每个 $-p\ln p$ 都凹）、约束线性，故这个唯一驻点就是全局最大。

**Jensen 语言（全局不等式）.** 把 $H$ 写成期望，对凹函数 $\ln$ 用 Jensen（$\mathbb{E}[\ln X]\le\ln\mathbb{E}[X]$，取 $X=1/p_i$、按分布 $p$ 取期望）：

$$
H(p)=\sum_i p_i\ln\frac{1}{p_i}
=\mathbb{E}\!\left[\ln\frac{1}{p_i}\right]
\le\ln\mathbb{E}\!\left[\frac{1}{p_i}\right]
=\ln\Big(\sum_i p_i\cdot\frac{1}{p_i}\Big)
=\ln 3,
$$

等号当且仅当 $1/p_i$ 为常数，即 $p_i=\tfrac13$。

{{< /details >}}

### 拉格朗日乘子求最优码长（最小期望长度 = 熵）

给定信源分布 $p=(p_1,\dots,p_n)$，给每个符号配一个二元前缀码、码长 $l_i$。任何唯一可译码都满足 **Kraft 不等式** $\sum_i 2^{-l_i}\le 1$。求最小化期望码长 $\bar L=\sum_i p_i l_i$ 的最优码长（先把 $l_i$ 放松成实数），证明最小期望长度恰为熵 $H(p)=-\sum_i p_i\log_2 p_i$；再用 Gibbs / KL 不等式给出同一结论的另一种语言，并说明整数约束带来的差距。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [大一统知识地图 · 熵](https://r1skers.github.io/r1skers-knowledge-map/?map=probability&node=%E7%86%B5)*

{{< details summary="参考解答" >}}

**拉格朗日语言（找驻点）.** 最优时 Kraft 取等 $\sum_i 2^{-l_i}=1$。记期望码长 $\bar L=\sum_i p_i l_i$（它和下面的拉格朗日函数 $L$ 是两个东西，别混）。构造

$$
L(l_1,\dots,l_n,\lambda)=\sum_i p_i l_i+\lambda\Big(\sum_i 2^{-l_i}-1\Big).
$$

对 $l_i$ 求偏导（用 $\frac{d}{dl}2^{-l}=-\ln 2\cdot 2^{-l}$）：

$$
\frac{\partial L}{\partial l_i}=p_i-\lambda\ln 2\cdot 2^{-l_i}=0
\ \Longrightarrow\
2^{-l_i}=\frac{p_i}{\lambda\ln 2}.
$$

代入约束 $\sum_i 2^{-l_i}=1$、并用 $\sum_i p_i=1$ 得 $\lambda\ln 2=1$，于是

$$
2^{-l_i}=p_i\ \Longrightarrow\ l_i^*=-\log_2 p_i,
\qquad
\bar L_{\min}=\sum_i p_i(-\log_2 p_i)=H(p).
$$

**Gibbs / KL 语言（全局不等式）.** 对任意满足 Kraft 的码，令 $c=\sum_i 2^{-l_i}\le 1$、$q_i=2^{-l_i}/c$（一个分布）。则

$$
\bar L-H(p)=\sum_i p_i\log_2\frac{p_i}{2^{-l_i}}
=\underbrace{\sum_i p_i\log_2\frac{p_i}{q_i}}_{=\,D(p\,\|\,q)\,\ge\,0}-\log_2 c\ \ge\ 0,
$$

因为 KL 散度 $D(p\,\|\,q)\ge 0$（Gibbs）且 $\log_2 c\le 0$。等号当且仅当 $p=q$ 且 $c=1$，即 $2^{-l_i}=p_i$、$l_i=-\log_2 p_i$——与拉格朗日同解。

**两种语言.** 拉格朗日解一阶条件，直接定出最优码长 $l_i^*=-\log_2 p_i$；Gibbs/KL 用散度非负，直接给出 $\bar L\ge H$ 的全局下界、等号刻画最优。一个「在哪取到」、一个「为什么下不去」——和 E1 是一个套路。

**整数的现实** $l_i^*=-\log_2 p_i$ 一般**不是整数**，但真实码长必须是正整数。所以「$\bar L=H$」只有当所有 $p_i$ 都是 $1/2$ 的幂（dyadic）时才精确达到；一般要向上取整，Shannon 码 $l_i=\lceil-\log_2 p_i\rceil$ 给出

$$
H(p)\le \bar L\lt H(p)+1.
$$

即:拉格朗日解的是**放松了整数约束**的连续问题;熵是打不破的下界，可逼近（分块编码能逼到任意接近）、但未必恰好达到。

{{< /details >}}

### 拉格朗日乘子与 Gibbs 不等式：高斯-最大熵分布

在所有均值为 $\mu$、方差为 $\sigma^2$ 的连续概率密度中，最大化微分熵 $h[p]=-\int p\ln p\,dx$。分别用拉格朗日乘子（对密度做变分）与 Gibbs 不等式证明最大熵分布是高斯 $\mathcal N(\mu,\sigma^2)$，体会两者是同一件事的两种语言。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [大一统知识地图 · 熵](https://r1skers.github.io/r1skers-knowledge-map/?map=probability&node=%E7%86%B5)*

{{< details summary="参考解答" >}}

**拉格朗日语言（变分找驻点）.** 三条约束 $\int p\,dx=1$、$\int xp\,dx=\mu$、$\int(x-\mu)^2p\,dx=\sigma^2$ 各配一个乘子，作泛函

$$
L[p]=-\int p\ln p\,dx+\lambda_0\Big(\int p\,dx-1\Big)+\lambda_1\Big(\int xp\,dx-\mu\Big)+\lambda_2\Big(\int(x-\mu)^2p\,dx-\sigma^2\Big).
$$

对密度 $p(x)$ 取变分 $\delta L/\delta p=0$（被积式对 $p$ 逐点求偏导；这里没有 $p'$ 项，欧拉–拉格朗日退化成逐点条件）：

$$
-\ln p(x)-1+\lambda_0+\lambda_1 x+\lambda_2(x-\mu)^2=0
\ \Longrightarrow\
p(x)=\exp\!\big(\lambda_0-1+\lambda_1 x+\lambda_2(x-\mu)^2\big).
$$

右边是 $\exp(\text{$x$ 的二次式})$，必为高斯形。三条约束定常数（归一 + 均值 + 方差）给出 $\lambda_1=0,\ \lambda_2=-\tfrac{1}{2\sigma^2}$，即

$$
p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{(x-\mu)^2}{2\sigma^2}\Big)=\mathcal N(\mu,\sigma^2).
$$

（微分熵凹、约束线性，这个唯一驻点即全局最大。）

**Gibbs 语言（全局不等式）.** 记 $g=\mathcal N(\mu,\sigma^2)$。对任意同均值 $\mu$、同方差 $\sigma^2$ 的密度 $p$，KL 非负：

$$
0\le D(p\,\|\,g)=\int p\ln\frac{p}{g}\,dx=-h(p)-\int p\ln g\,dx
\ \Longrightarrow\
h(p)\le-\int p\ln g\,dx.
$$

关键：$\ln g(x)=-\tfrac12\ln(2\pi\sigma^2)-\tfrac{(x-\mu)^2}{2\sigma^2}$ 是 $x$ 的二次式，故 $-\int p\ln g$ **只通过 $p$ 的归一与二阶矩起作用**，而它们与 $g$ 相同：

$$
-\int p\ln g\,dx=\tfrac12\ln(2\pi\sigma^2)+\frac{1}{2\sigma^2}\underbrace{\int p\,(x-\mu)^2\,dx}_{=\sigma^2}=\tfrac12\ln(2\pi e\sigma^2)=h(g).
$$

于是 $h(p)\le h(g)$，等号当且仅当 $p=g$。最大微分熵 $h_{\max}=\tfrac12\ln(2\pi e\sigma^2)$。

**两种语言.** 拉格朗日解变分一阶条件，直接定出最优分布的**形状**（$\exp$ 二次式 = 高斯）；Gibbs 用 KL 非负 +「与高斯的交叉熵只看二阶矩」，直接给出 $h\le h(g)$ 的**全局上界**、等号刻画最优。一个「长什么样」、一个「为什么没人比它高」——和 E1 同套路，只是这里从有限维升到了**对密度的变分**（笔记第 8 节那半场）。

**两个细节.** ① 这里是**微分熵**（连续），可负、不具坐标不变性，但「给定矩下最大」这一相对结论是干净的；② 约束须**同时**固定均值与方差，Gibbs 那步正是靠 $p,g$ 两矩相同。

{{< /details >}}

<a id="softmax-maximum-entropy"></a>

### 拉格朗日乘子与凸对偶：softmax-最大熵分布

$n$ 个结局，每个有一个「得分」$z_i$。在期望得分 $\sum_i p_i z_i$ 固定的约束下最大化熵 $H(p)=-\sum_i p_i\ln p_i$。用拉格朗日乘子证明最大熵分布是 softmax $p_i=e^{\beta z_i}/\sum_j e^{\beta z_j}$；再换凸对偶的语言看 softmax 是 log-sum-exp 的梯度。

*参考：[拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/) · [大一统知识地图 · 熵](https://r1skers.github.io/r1skers-knowledge-map/?map=probability&node=%E7%86%B5)*

{{< details summary="参考解答" >}}

**拉格朗日语言（找驻点）.** 约束 $\sum_i p_i=1$、$\sum_i p_i z_i=\bar z$。拉格朗日函数

$$
L=-\sum_i p_i\ln p_i+\lambda\Big(\sum_i p_i-1\Big)+\beta\Big(\sum_i p_i z_i-\bar z\Big).
$$

对 $p_i$ 求偏导置零：

$$
\frac{\partial L}{\partial p_i}=-\ln p_i-1+\lambda+\beta z_i=0
\ \Longrightarrow\
p_i=e^{\lambda-1+\beta z_i}\propto e^{\beta z_i}.
$$

归一化给出

$$
p_i=\frac{e^{\beta z_i}}{\sum_j e^{\beta z_j}}=\operatorname{softmax}(\beta z)_i.
$$

乘子 $\beta$（「逆温度」）由期望约束 $\bar z$ 定：$\beta\to 0$ 退回均匀（E1），$\beta\to\infty$ 集中到最大的 $z_i$（硬 argmax）。

**凸对偶语言（softmax 是 ∇ log-sum-exp）.** 换个等价问法：把熵当正则项，在单纯形 $\Delta$ 上做带熵正则的线性极大化

$$
\max_{p\in\Delta}\ \langle p,z\rangle+\tfrac1\beta H(p).
$$

同样的拉格朗日（归一约束）解出同一个 $p=\operatorname{softmax}(\beta z)$，而最优值正是

$$
\tfrac1\beta\ln\sum_i e^{\beta z_i}=\tfrac1\beta\operatorname{LSE}(\beta z),
\qquad
\nabla\operatorname{LSE}(z)=\operatorname{softmax}(z).
$$

log-sum-exp 是负熵在单纯形上的**凸共轭**，softmax 就是这个凸势的梯度。

**两种视角.** 拉格朗日：最大熵 + 期望约束直接解出 $e^{\beta z}$ 的形状；凸对偶：softmax 是 LSE 的梯度、LSE 是负熵的共轭。

{{< /details >}}

---

## 鸽笼原理

### 任取五个整点，必有两点的中点也是整点

平面上任取 5 个整点（坐标皆为整数）。证明：必存在两点，其中点也是整点。

{{< details summary="参考解答" >}}

两点 $(x_1,y_1),(x_2,y_2)$ 的中点 $\big(\tfrac{x_1+x_2}{2},\tfrac{y_1+y_2}{2}\big)$ 为整点，当且仅当

$$
x_1\equiv x_2 \pmod 2 \ \text{且}\ y_1\equiv y_2 \pmod 2,
$$

即两坐标**分别**同奇偶。给每点配奇偶标签

$$
(x\bmod 2,\ y\bmod 2)\in\{(0,0),(0,1),(1,0),(1,1)\},
$$

共 4 个取值。5 个点配 4 个标签，鸽笼 $\Rightarrow$ 必有两点同标签 $\Rightarrow$ 其中点为整点。$\blacksquare$

**下界紧.** 4 个点可占满四类各一个（如 $(0,0),(1,0),(0,1),(1,1)$）而无整点中点，故 5 不能再减。一般地，$d$ 维格点保证有整点中点需 $2^d+1$ 个点。

{{< /details >}}

### 连续子段和被 n 整除

任给 $n$ 个整数 $a_1,\dots,a_n$（可重复、可正可负）。证明：必存在一段**连续**的 $a_{i+1}+a_{i+2}+\cdots+a_j$ 能被 $n$ 整除。

{{< details summary="参考解答" >}}

设前缀和 $S_0=0,\ S_k=a_1+\cdots+a_k\ (1\le k\le n)$，则连续段恰为两前缀和之差

$$
a_{i+1}+\cdots+a_j=S_j-S_i.
$$

共有 $S_0,S_1,\dots,S_n$ 即 $n+1$ 个前缀和；模 $n$ 的余数只有 $\{0,1,\dots,n-1\}$ 共 $n$ 个。$n+1$ 个数配 $n$ 个余数，鸽笼 $\Rightarrow$ 存在 $i\lt j$ 使 $S_i\equiv S_j\pmod n$，于是

$$
a_{i+1}+\cdots+a_j=S_j-S_i\equiv 0\pmod n. \qquad\blacksquare
$$

**$S_0$ 不可省.** 缺它则只剩 $n$ 个前缀和配 $n$ 个余数，鸽笼失效；且 $S_0$ 覆盖「从首项起的段」——若某 $S_k\equiv 0$，与之相撞的正是 $S_0$，给出 $a_1+\cdots+a_k$。

{{< /details >}}

### 从 {1,…,2n} 取 n+1 个数，必有一个整除另一个

从 $\{1,2,\dots,2n\}$ 中任取 $n+1$ 个数。证明：必有两数，一个整除另一个。

{{< details summary="参考解答" >}}

任何正整数唯一分解为 $a=2^{k}\cdot m$（$m$ 奇，把因子 2 抽尽），称 $m$ 为 $a$ 的**奇部**，以它作标签。$\{1,\dots,2n\}$ 中奇数恰为 $1,3,\dots,2n-1$ 共 $n$ 个，故标签至多 $n$ 种。$n+1$ 个数配 $n$ 个奇部，鸽笼 $\Rightarrow$ 有 $a\ne b$ 同奇部：

$$
a=2^{s}m,\quad b=2^{t}m,\quad s\lt t
\ \Longrightarrow\
b=2^{\,t-s}\cdot a,\ \text{即 } a\mid b. \qquad\blacksquare
$$

奇部之所以可用而余数不行：目标 $a\mid b$ 是乘性关系，须用乘性结构的标签。

**下界紧.** $\{n+1,\dots,2n\}$ 共 $n$ 个数、两两无整除（最小者翻倍即超出 $2n$），故 $n$ 个数可避开，$n+1$ 不能再减。

**偏序视角.** 链 $\{m,2m,4m,\dots\}$（$m$ 奇）给出整除偏序的一组**链覆盖**，上半段 $\{n+1,\dots,2n\}$ 是一条长 $n$ 的**反链**；由 **Dilworth 定理**（最小链覆盖 = 最大反链 = 宽度），该偏序宽度恰为 $n$，命题即「宽度 $n$ 容不下 $n+1$ 个两两不可比的元素」。

**推论（弱）.** 素数互不整除，构成反链，故 $\pi(2n)\le n$；此界很松，真值为 $\pi(2n)\sim 2n/\ln(2n)$（素数定理）。

{{< /details >}}

### 单调子列存在性（Erdős–Szekeres）

任给 $n^2+1$ 个**互不相同**的实数排成一列。证明：必存在长度 $n+1$ 的**子列**（下标递增、不必连续），严格递增或严格递减。

{{< details summary="参考解答" >}}

给每项 $a_i$ 配二维标签 $(x_i,y_i)$：$x_i$ 为以 $a_i$ 结尾的最长**严格递增**子列长度，$y_i$ 为以 $a_i$ 结尾的最长**严格递减**子列长度。

**反证.** 设无长度 $n+1$ 的单调子列，则每个 $x_i,y_i\in\{1,\dots,n\}$，标签落在 $n\times n$ 网格，共 $n^2$ 种。

**标签互不相同.** 设 $i\lt j$，因 $a_i\ne a_j$：若 $a_i\lt a_j$，以 $a_i$ 结尾的最长递增子列接上 $a_j$ 得 $x_j\ge x_i+1$；若 $a_i\gt a_j$，同理 $y_j\ge y_i+1$。两种情形必有一个分量严格增大，故 $(x_i,y_i)\ne(x_j,y_j)$。（「互不相同」即用在此，保证必有一边可接。）

于是 $n^2+1$ 个互异标签要配进 $n^2$ 种取值，鸽笼矛盾。故长度 $n+1$ 的单调子列存在。$\blacksquare$

**手算（$n=2$）.** 序列 $3,1,4,2,5$ 的标签依次为 $(1,1),(1,2),(2,1),(2,2)$ 恰好填满 $2\times 2$ 网格，第 5 项 $5$ 无可用标签，被迫 $x=3$，对应递增子列 $3,4,5$。

**下界紧.** 把 $\{1,\dots,n^2\}$ 排成 $n$ 个递减块、块首递增（$n=2$：$2,1,4,3$），最长单调子列仅 $n$，故 $n^2+1$ 不能再减。

{{< /details >}}
