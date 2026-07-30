---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: '误差分析 · Taylor 5：从步长到 Richardson 外推'
summary: "利用误差的尺度规律测量收敛阶，再消去主导误差；同时观察截断误差与浮点舍入怎样共同决定可用步长。"
description: "从有限差分推导 observed order、Richardson extrapolation、稳定表示和确定性误差预算。"
tags: ["Error Analysis", "Finite Difference", "Richardson Extrapolation", "Floating Point"]
categories: ["Notes"]
weight: 5
---

Taylor 余项不只是事后解释误差，还能帮助我们主动控制误差。最小例子是估计

\[
A=f'(0)=1,\qquad f(x)=e^x.
\]

## 1. 步长改变时，误差按什么规律缩放

前向差分为

\[
A_h=\frac{e^h-1}{h}.
\]

由 Taylor 展开，

\[
A_h
=1+\frac h2+O(h^2),
\]

所以主导误差是一阶：

\[
E(h)=A_h-A\approx\frac h2.
\]

中心差分为

\[
A_h^{(c)}
=\frac{e^h-e^{-h}}{2h}
=\frac{\sinh h}{h},
\]

并且

\[
A_h^{(c)}
=1+\frac{h^2}{6}+O(h^4).
\]

对称性消掉了偶数函数值项，使导数估计的主导误差变成二阶。

一般地，如果

\[
A_h=A+Ch^p+O(h^{p+1}),
\qquad C\ne0,
\]

则

\[
\frac{E(h)}{E(h/2)}\approx2^p.
\]

步长减半时，一阶误差约除以 \(2\)，二阶误差约除以 \(4\)。

## 2. 不知道真值，也可以估计收敛阶

现实里通常不知道 \(A\)，无法直接计算 \(E(h)\)。但相邻尺度之差仍保留主导误差结构：

\[
A_{h/2}-A_h
\approx
C(2^{-p}-1)h^p.
\]

再加入 \(A_{h/4}\)，得到

\[
\boxed{
p_{\mathrm{obs}}
\approx
\log_2
\left|
\frac{A_{h/2}-A_h}
{A_{h/4}-A_{h/2}}
\right|.
}
\]

这是一种“利用不同尺度之间的自相似误差，反推未知误差规律”的方法。它要求当前尺度已经进入主导项稳定的渐近区间；若多个误差项竞争，观测阶就会漂移。

## 3. Richardson extrapolation：把主导误差消掉

由

\[
A_h=A+Ch^p+\cdots,
\qquad
A_{h/2}=A+C2^{-p}h^p+\cdots,
\]

取线性组合

\[
\boxed{
\widehat A=
\frac{2^pA_{h/2}-A_h}{2^p-1}.
}
\]

\(Ch^p\) 项恰好变成零。直觉上，可以把 \(A_h\) 看作沿着坐标 \(h^p\) 接近截距 \(A\) 的点；用两个有限步长点拟合主导直线，再把它外推到 \(h=0\)，截距就是改进后的估计。

这不是单纯“再缩短一次步长”，而是利用两个已有近似中重复出现的误差结构，构造一个新的表示并消掉首项。

## 4. 为什么 \(h\) 不能无限缩小

朴素前向差分需要计算

\[
\frac{\operatorname{fl}(e^h)-1}{h}.
\]

截断误差随 \(h\) 下降，但 cancellation 与 roundoff 会被除法放大。常见模型是

\[
E_{\mathrm{total}}(h)
\approx
C_1h^p+C_2\frac{u}{h}.
\]

因此步长过大时由 truncation 主导，步长过小时由 floating-point error 主导，中间才存在最佳区域。

稳定表示会改变第二项：

- 前向差分使用 \(\operatorname{expm1}(h)/h\)；
- 中心差分使用 \(\sinh(h)/h\)。

它们保留相同数学公式，却避免了不必要的近数相减。

![四种有限差分实现的误差曲线](finite_difference_error.png)

图中右侧的稳定曲线分别贴近 \(h/2\) 和 \(h^2/6\)，这就是截断主导区：log-log 图上的斜率对应理论阶数。极小步长处，naive 实现因输入在 binary64 中舍入和减法消去而失效；稳定实现则能继续保持小量结构，部分误差甚至舍入为零，因此没有显示在对数纵轴上。

## 5. 一套可复用的确定性流程

面对一个由尺度 \(h\) 控制的近似，可以依次做：

1. 推导 \(A_h=A+Ch^p+\cdots\)；
2. 在运行前预测误差方向、倍率和 log-log 斜率；
3. 计算 \(h,h/2,h/4\)；
4. 用相邻尺度差估计 \(p_{\mathrm{obs}}\)；
5. 在主导阶稳定后使用 Richardson 外推；
6. 继续减小 \(h\)，定位 roundoff 或其他误差开始接管的位置；
7. 比较代数等价但数值路径不同的实现。

对应的源码、CSV 与 metadata 保存在 [Error Atlas 的 Taylor experiments](https://github.com/r1skers/error-atlas/tree/main/topics/taylor-expansion/experiments)。

---

**下一篇：** [Taylor 6：把噪声写进误差预算](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-6-statistical-noise/)
