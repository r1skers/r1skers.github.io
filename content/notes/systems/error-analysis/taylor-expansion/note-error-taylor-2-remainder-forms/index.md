---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: '误差分析 · Taylor 2：Lagrange、积分与 Peano 余项'
summary: "三种余项形式使用不同假设，也保留不同信息：未知中间点、区间贡献和局部渐近性不能互相混用。"
description: "比较 Lagrange remainder、integral remainder 与 Peano remainder 的假设、结论和信息损失。"
tags: ["Error Analysis", "Taylor Expansion", "Lagrange Remainder", "Peano Remainder"]
categories: ["Notes"]
weight: 2
---

余项已经定义为

\[
R_n(x)=f(x)-P_n(x).
\]

接下来要解决的是：怎样描述这个精确差值？不同余项公式的差别，本质上是对假设强度、信息量和可操作性的不同选择。

## 1. Lagrange remainder：精确，但藏着一个点

若 \(f\in C^{n+1}(I)\)，且区间 \(I\) 包含 \(a\) 与 \(x\)，则存在某个介于二者之间的 \(\xi\)，使

\[
\boxed{
R_n(x)=
\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1}.
}
\]

这是精确等式，但 \(\xi\) 通常无法直接求出。它由 Rolle 定理保证存在，并会随 \(x\) 改变。

如果区间上有

\[
|f^{(n+1)}(t)|\le M,
\]

就能消去未知点：

\[
|R_n(x)|
\le
\frac{M}{(n+1)!}|x-a|^{n+1}.
\]

代价是把实际的 \(f^{(n+1)}(\xi)\) 换成了整个区间的最坏值。

以 \(\sin\theta\approx\theta\) 为例：

\[
\sin\theta-\theta
=-\frac{\cos\xi}{6}\theta^3,
\]

因此

\[
|\sin\theta-\theta|\le\frac{|\theta|^3}{6}.
\]

当 \(\theta\to0\) 时，夹在 \(0\) 与 \(\theta\) 之间的 \(\xi\to0\)，所以还能读出主导项

\[
\sin\theta-\theta
=-\frac{\theta^3}{6}+o(\theta^3).
\]

## 2. Integral remainder：保留整个区间的贡献

积分形式为

\[
\boxed{
R_n(x)=
\frac1{n!}
\int_a^x f^{(n+1)}(t)(x-t)^n\,dt.
}
\]

它不再把信息藏进一个未知中间点，而是展示每个位置 \(t\) 的高阶导数怎样经过 kernel

\[
\frac{(x-t)^n}{n!}
\]

加权后累积成总误差。

这个表示可以直接回答一些 Lagrange 形式不容易回答的问题：

- 被积函数同号时，余项符号是什么；
- 哪一段区间贡献最大；
- 高阶导数大的位置是否真的具有较大权重；
- 为什么某个 supremum bound 会很松。

例如一阶近似中，

\[
R_1(x)=\int_a^x f''(t)(x-t)\,dt.
\]

若 \(x>a\) 且 \(f''\ge0\)，则 \(R_1\ge0\)，即凸函数位于切线上方。

对积分取绝对值并使用区间上界 \(M\)，就重新得到

\[
|R_n(x)|
\le
\frac{M}{(n+1)!}|x-a|^{n+1}.
\]

这说明 Lagrange bound 可以理解为：先保留完整的区间结构，再把它压缩成最坏情况常数。

## 3. Peano remainder：假设更弱，只承诺局部渐近性

可微的定义本身就等价于

\[
f(a+h)=f(a)+f'(a)h+o(h).
\]

推广到 \(n\) 阶：

\[
\boxed{
f(a+h)=
\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}h^k
+o(h^n).
}
\]

Peano 形式通常不提供：

- 余项符号；
- 显式常数；
- 未知中间点；
- \(O(h^{n+1})\) 级别的保证。

但它只依赖更局部、更弱的可微信息。

令

\[
f(x)=|x|^{3/2},\qquad a=0.
\]

因为 \(f(0)=f'(0)=0\)，一阶多项式为零，而

\[
R_1(x)=|x|^{3/2}=o(|x|).
\]

然而

\[
\frac{|x|^{3/2}}{x^2}\to\infty,
\]

所以 \(R_1\ne O(x^2)\)。Peano 结论成立，并不意味着更强的二阶 Lagrange-style bound 也成立。

## 4. 三种形式怎样选择

| 形式 | 主要假设 | 保留的信息 | 主要用途 |
| --- | --- | --- | --- |
| Lagrange | 区间上的高阶光滑性 | 某个未知点处的高阶导数 | 快速给出阶数和显式上界 |
| Integral | 可进行相应积分与分部积分 | 整个区间的符号、位置和权重 | 分析结构、符号与界的松弛来源 |
| Peano | 局部 \(n\) 阶可微 | 局部相对衰减 | 在较弱假设下陈述渐近近似 |

它们不是三种互相竞争的答案。更准确的关系是：

\[
\text{完整区间信息}
\rightarrow
\text{未知中间点}
\rightarrow
\text{区间最坏值},
\]

信息逐步减少，可计算性逐步增强。下一篇将看到：最后这一步压缩虽然合法，却可能让误差界失去实际说服力。

---

**下一篇：** [Taylor 3：正确的界为什么可能没有说服力](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/)
