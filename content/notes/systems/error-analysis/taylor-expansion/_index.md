---
date: '2026-07-30T00:10:00+09:00'
draft: false
title: 'Taylor 展开：从余项到误差控制'
summary: "误差分析的第一个完整 topic：从 Taylor 余项出发，走到误差界、传播、数值稳定性和最优步长。"
description: "用 Taylor 展开走完一次误差的定义、表示、估计、传播、控制与实验验证。"
tags: ["Error Analysis", "Taylor Expansion", "Numerical Analysis"]
categories: ["Notes"]
weight: 1
---

Taylor 展开经常被写成一个“把函数变成多项式”的公式：

\[
f(x)=
\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k
+R_n(x).
\]

但从误差角度看，真正的主角不是多项式，而是最后留下的 \(R_n(x)\)。它让我们第一次可以沿着完整链条追问：

- 这个误差对象到底是什么？
- 不同余项公式保留了多少信息？
- \(O\)、\(o\) 和数值上界分别告诉了我们什么？
- 一个始终正确的界，为什么仍可能完全没用？
- 误差进入下一步计算后怎样传播？
- 怎样用步长、阶数、稳定表示和采样量控制总误差？

## 本轮路线

### 1. 先固定误差语言

[先把误差说清楚：\(R\)、\(O\)、\(o\) 与误差界](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/) 区分 exact remainder、absolute error、asymptotic order 与 computable bound。这里最重要的纠正是：big-\(O\) 和 little-\(o\) 不是“上限和下限”，而是两种不同的渐近比较。

### 2. 比较三种余项表示

[Lagrange、积分与 Peano：三种余项保留了什么](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-2-remainder-forms/) 比较未知中间点、区间积分与局部渐近式。三者表达的是同一个近似问题，却使用不同假设并保留不同信息。

### 3. 不只问界对不对，还要问界有没有用

[正确的界为什么可能没有说服力](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/) 用 \(1/(1-x)\) 展示一个合法的 Lagrange bound 怎样错过真实的指数收敛。问题不在定理，而在取 supremum 时丢失了导数与积分 kernel 的位置关系。

### 4. 让误差进入计算链

[误差怎样传播：敏感度、conditioning 与 stability](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/) 从

\[
\Delta y\approx f'(x)\Delta x
\]

出发，但不把它误当成全局定律。随后区分问题本身的敏感性与算法引入的额外误差，并用 \(e^h-1\) 与 \(\operatorname{expm1}(h)\) 解释 cancellation。

### 5. 控制确定性误差

[从步长到外推：确定性误差怎样被测量和消除](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/) 把 Taylor 主导项变成 observed order、Richardson extrapolation 和 finite-difference error budget，并比较 naive 与 stable representation。

### 6. 把随机噪声放进同一个预算

[把噪声写进误差预算：MSE、相关性与最优步长](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-6-statistical-noise/) 用带相关噪声的中心差分验证 bias–variance 分解，区分估计器内部采样数 \(N\) 与外层 Monte Carlo 重复数 \(M\)，并推导最优步长。

## 最后得到工作流

这一轮最重要的产物可以压缩为：

\[
\boxed{
\text{定义 reference 和 metric}
\rightarrow
\text{列出误差源}
\rightarrow
\text{找主导项或界}
\rightarrow
\text{分析传播}
\rightarrow
\text{建立总误差模型}
\rightarrow
\text{预测并实验验证}
}
\]

Taylor 展开只是第一站。后续进入 Softmax、低精度计算和 CPU–GPU 系统时，数学对象会变化，但这套提问方式会保留下来。

---

**开始阅读：** [Taylor 1：先把 \(R\)、\(O\)、\(o\) 与误差界说清楚](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/)
