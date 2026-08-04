---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: '误差分析 · Taylor 3：正确的界为什么可能没有说服力'
summary: "误差界始终覆盖真实误差只是最低要求；一个粗糙 supremum bound 可能完全看不见近似正在收敛。"
description: "用 1/(1-x) 的 Taylor 余项分析 bound validity、tightness、奇点和区间信息压缩。"
tags: ["Error Analysis", "Numerical Analysis", "Taylor Expansion"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 3
---

误差分析不能停在“这个 bound 是正确的”。如果界比真实误差大很多，甚至随着阶数增加越来越松，它就无法指导算法选择。

考虑

\[
f(x)=\frac1{1-x},\qquad a=0,\qquad 0\le x\lt1.
\]

## 1. 先利用函数结构得到真实余项

\(n\) 阶 Taylor polynomial 是有限几何和：

\[
P_n(x)=1+x+\cdots+x^n
=\frac{1-x^{n+1}}{1-x}.
\]

因此 exact remainder 为

\[
\boxed{
R_n(x)
=f(x)-P_n(x)
=\frac{x^{n+1}}{1-x}.
}
\]

这一步没有估计，而是直接使用了几何级数结构。

## 2. 再看通用 Lagrange bound

高阶导数为

\[
f^{(n+1)}(t)
=\frac{(n+1)!}{(1-t)^{n+2}}.
\]

在 \(0\le t\le x\) 上，它随 \(t\) 增长，所以区间最大值位于最右端 \(x\)：

\[
M=\frac{(n+1)!}{(1-x)^{n+2}}.
\]

代入通用公式：

\[
|R_n(x)|
\le
\frac{x^{n+1}}{(1-x)^{n+2}}.
\]

这个界与真实误差的比值是

\[
\frac{B_n(x)}{|R_n(x)|}
=\frac1{(1-x)^{n+1}}.
\]

对任意固定 \(x\in(0,1)\)，相对松弛度都会随 \(n\) 指数增长。

## 3. \(x=1/2\)：真实误差下降，界却一动不动

当 \(x=1/2\) 时，

\[
R_n(1/2)=2^{-n},
\]

真实误差随阶数指数衰减。但 Lagrange bound 恒为

\[
B_n(1/2)=2.
\]

因此它永远正确，却完全无法认证近似正在改善。

这不是 Taylor 定理失效，而是“把未知 \(\xi\) 粗暴换成区间最右端”造成了结构损失。

## 4. 为什么真实的 \(\xi_n\) 不在最右边

Lagrange 形式要求

\[
R_n(x)
=\frac{f^{(n+1)}(\xi_n)}{(n+1)!}x^{n+1}.
\]

与 exact remainder 对比，可以解出

\[
\xi_n
=1-(1-x)^{1/(n+2)}.
\]

固定 \(0\lt x\lt1\) 时，

\[
\xi_n\to0,
\qquad n\to\infty.
\]

也就是说，随着阶数增加，承担真实余项的中间点反而向展开点移动。把它换成右端 \(x\)，会把导数因子

\[
(1-\xi_n)^{-(n+2)}
\]

替换成更大的

\[
(1-x)^{-(n+2)}.
\]

这个过度放大还会被阶数不断累积。

## 5. 积分图像揭示了丢失的信息

积分余项是

\[
R_n(x)
=\frac1{n!}\int_0^x
\frac{(n+1)!}{(1-t)^{n+2}}
(x-t)^n\,dt.
\]

其中有两个相反趋势：

- 高阶导数靠近右端 \(t=x\) 时最大；
- kernel \((x-t)^n\) 恰好在 \(t=x\) 时为零。

supremum bound 分别把“导数最大值”和“全部 kernel mass”取出来相乘，相当于假设二者能在整个区间同时达到最坏情况。真实积分中，它们的位置却互相错开。

\(x=1\) 的奇点进一步放大了这个问题：阶数越高，右端附近的导数增长越猛烈，错误的位置配对就越昂贵。

这里不需要 Laurent 展开。问题确实受到奇点影响，但 exact remainder 已经由有限几何和直接给出；真正要分析的是奇点怎样让通用界的信息损失越来越严重。

## 6. 怎样评价一个误差界

至少分开检查：

1. **Validity**：界是否始终覆盖 actual error；
2. **Tightness**：\(B/E\) 的松弛度是否可接受；
3. **Asymptotic quality**：尺度或阶数改变时，界是否显示真实收敛；
4. **Information loss**：在哪一步使用了 supremum、三角不等式或独立最坏情况；
5. **Decision value**：这个界能否帮助选择阶数、步长或计算精度。

\[
\boxed{\text{界正确，只是误差界质量的最低门槛。}}
\]

下一步不再只研究一个孤立误差，而是让它进入后续计算，观察它怎样传播和被重新放大。

---

**下一篇：** [Taylor 4：误差怎样传播](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/)
