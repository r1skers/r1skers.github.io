---
date: '2026-06-23T10:00:00+09:00'
draft: false
title: '问题集 · 其他'
summary: "暂未单独成册的杂题——目前是鸽笼原理一组：整点中点、连续子段和、整除对、Erdős–Szekeres 单调子列，全是「数 + 比」的套路。"
description: "组合 / 离散杂题集：鸽笼原理的四道经典题（整点中点、连续子段和被 n 整除、{1..2n} 取 n+1 个必有整除对、Erdős–Szekeres 单调子列），附参考解答。"
tags: ["Exercises"]
categories: ["Notes"]
series: ["Problems"]
note_kind: "exercise"
problemPage: true
---

# 问题集 · 其他

暂未攒够独立成册的杂题都放这里。攒多了再拆出去。

{{< problem-map kind="misc" >}}

---

{{% problem-section title="鸽笼原理" %}}

一组「先数集合大小、再比范围」的经典题——**造鸽子、造笼子、数一数**。

{{% problem-exercise title="任取五个整点，必有两点的中点也是整点" %}}

平面上任取 5 个整点（坐标皆为整数）。证明：必存在两点，其中点也是整点。

{{% /problem-exercise %}}

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

{{% problem-exercise title="连续子段和被 n 整除" %}}

任给 $n$ 个整数 $a_1,\dots,a_n$（可重复、可正可负）。证明：必存在一段**连续**的 $a_{i+1}+a_{i+2}+\cdots+a_j$ 能被 $n$ 整除。

{{% /problem-exercise %}}

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

{{% problem-exercise title="从 {1,…,2n} 取 n+1 个数，必有一个整除另一个" %}}

从 $\{1,2,\dots,2n\}$ 中任取 $n+1$ 个数。证明：必有两数，一个整除另一个。

{{% /problem-exercise %}}

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

{{% problem-exercise title="单调子列存在性（Erdős–Szekeres）" %}}

任给 $n^2+1$ 个**互不相同**的实数排成一列。证明：必存在长度 $n+1$ 的**子列**（下标递增、不必连续），严格递增或严格递减。

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

给每项 $a_i$ 配二维标签 $(x_i,y_i)$：$x_i$ 为以 $a_i$ 结尾的最长**严格递增**子列长度，$y_i$ 为以 $a_i$ 结尾的最长**严格递减**子列长度。

**反证.** 设无长度 $n+1$ 的单调子列，则每个 $x_i,y_i\in\{1,\dots,n\}$，标签落在 $n\times n$ 网格，共 $n^2$ 种。

**标签互不相同.** 设 $i\lt j$，因 $a_i\ne a_j$：若 $a_i\lt a_j$，以 $a_i$ 结尾的最长递增子列接上 $a_j$ 得 $x_j\ge x_i+1$；若 $a_i\gt a_j$，同理 $y_j\ge y_i+1$。两种情形必有一个分量严格增大，故 $(x_i,y_i)\ne(x_j,y_j)$。（「互不相同」即用在此，保证必有一边可接。）

于是 $n^2+1$ 个互异标签要配进 $n^2$ 种取值，鸽笼矛盾。故长度 $n+1$ 的单调子列存在。$\blacksquare$

**手算（$n=2$）.** 序列 $3,1,4,2,5$ 的标签依次为 $(1,1),(1,2),(2,1),(2,2)$ 恰好填满 $2\times 2$ 网格，第 5 项 $5$ 无可用标签，被迫 $x=3$，对应递增子列 $3,4,5$。

**下界紧.** 把 $\{1,\dots,n^2\}$ 排成 $n$ 个递减块、块首递增（$n=2$：$2,1,4,3$），最长单调子列仅 $n$，故 $n^2+1$ 不能再减。

{{< /details >}}

{{% /problem-section %}}
