---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: '误差分析 · Taylor 4：误差怎样传播'
summary: "输出误差约等于敏感度乘输入误差，但这只是局部一阶模型；完整分析还要区分 conditioning、stability 和浮点求值路径。"
description: "从 Taylor 线性化推导误差传播，区分问题敏感性与算法稳定性，并解释 cancellation。"
tags: ["Error Analysis", "Numerical Analysis", "Taylor Expansion", "Numerical Stability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 4
---

前面研究的是“一个近似值有多大误差”。现在让这个近似进入下一步计算：

\[
x\longrightarrow y=f(x).
\]

如果输入从 \(x\) 变为 \(x+\Delta x\)，Taylor 展开给出

\[
f(x+\Delta x)-f(x)
=f'(x)\Delta x+O(\Delta x^2).
\]

因此在扰动足够小时，

\[
\boxed{\Delta y\approx f'(x)\Delta x.}
\]

这就是“输出误差约等于敏感度乘输入误差”的来源。

## 1. 这不是全局线性定律

公式成立依赖三个关键词：

- **局部**：\(\Delta x\) 要足够小；
- **一阶**：忽略了 \(O(\Delta x^2)\)；
- **有位置**：敏感度 \(f'(x)\) 会随 \(x\) 变化。

如果需要严格保证，可以写

\[
|\Delta y|
\le
\sup_{\xi\in I}|f'(\xi)|\,|\Delta x|.
\]

但这又回到了误差界质量的问题：区间 supremum 可能覆盖所有情况，却丢失实际扰动经过的位置。

还要区分绝对误差与相对误差。绝对条件数可由 \(|f'(x)|\) 描述；当 \(x\ne0\) 且 \(f(x)\ne0\) 时，相对敏感度近似为

\[
\kappa_{\mathrm{rel}}(x)=
\left|\frac{x f'(x)}{f(x)}\right|.
\]

同一个函数在不同误差 metric 下，敏感度结论可能不同。

## 2. 误差穿过复合计算

对于

\[
x\longrightarrow y=f(x)\longrightarrow z=g(y),
\]

输入扰动传播为

\[
\Delta z
\approx
g'(f(x))f'(x)\Delta x.
\]

如果第一步和第二步还分别产生新的局部误差 \(\eta_f,\eta_g\)，一阶模型变成

\[
\Delta z
\approx
g'(f(x))
\bigl(f'(x)\Delta x+\eta_f\bigr)
+\eta_g.
\]

所以误差归因至少要记录：

1. 误差在哪里产生；
2. 后面经过了哪些运算；
3. 哪些敏感度负责放大或压缩；
4. 多个误差源是否相关；
5. 它们是抵消还是同向累积。

标量导数推广到向量映射后，就是 Jacobian：

\[
\Delta\mathbf y
\approx
J_f(\mathbf x)\Delta\mathbf x.
\]

这也正是后续 Softmax 研究的入口。

## 3. Conditioning 与 stability 是两个问题

- **Conditioning**：数学问题本身对输入扰动有多敏感；
- **Stability**：具体算法有没有引入远大于问题所要求的额外误差。

一个问题可以条件良好，却被不稳定算法算坏；也可以问题本身病态，即使算法已经稳定，输出仍会对输入微扰非常敏感。

## 4. \(e^h-1\)：问题不病态，写法却不稳定

当 \(h\approx0\) 时，

\[
e^h-1\approx h.
\]

这个数学函数本身没有异常。但朴素求值会：

1. 先计算一个约为 \(1\) 的 \(e^h\)；
2. 再减去整数 \(1\)；
3. 得到只有 \(O(h)\) 的小结果。

\(e^h\) 所携带的 \(O(u)\) 绝对舍入误差，在减法后没有一起缩小。相对于 \(O(h)\) 的真实信号，它变成

\[
O\!\left(\frac{u}{h}\right)
\]

的相对误差。

\(\operatorname{expm1}(h)\) 不是修改数学问题，而是换一条求值路径，直接计算小量 \(e^h-1\)，避免先构造两个接近的 \(O(1)\) 数再相减。

\[
\boxed{\text{代数等价，不代表浮点误差等价。}}
\]

## 5. 多个误差源还会发生相关抵消

中心差分

\[
D_hf(0)=\frac{f(h)-f(-h)}{2h}
\]

利用几何对称性消掉 Taylor 展开中的偶数次幂，使截断误差从一阶提升到二阶。

若左右观测带有噪声 \(\varepsilon_+,\varepsilon_-\)，传播后的噪声是

\[
\frac{\varepsilon_+-\varepsilon_-}{2h}.
\]

当二者标准差均为 \(\sigma\)、相关系数为 \(\rho\) 时，

\[
\operatorname{Var}(D_h)=
\frac{\sigma^2(1-\rho)}{2h^2}.
\]

于是：

- \(\rho\gt0\)：共同模式在差分中部分抵消；
- \(\rho=0\)：独立噪声的方差相加；
- \(\rho\lt0\)：相反方向的噪声被差分增强；
- \(h\) 越小：剩余噪声越被 \(1/h\) 放大。

因此完整的传播公式不能只剩一句“敏感度乘输入误差”。还必须交代局部/全局、绝对/相对、确定性/随机性、相关性，以及具体浮点实现。

---

**下一篇：** [Taylor 5：从步长到 Richardson 外推](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/)
