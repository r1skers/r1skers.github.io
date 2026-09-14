---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: 'Softmax 稳定求值：subtract-max、log-sum-exp 与各自的边界'
summary: "subtract-max 消除正指数 overflow 但不管尾部下溢；先算概率再取 log 会拆开本可解析抵消的因子；问题条件性与算法稳定性必须分开问。"
description: "比较 naive Softmax、稳定 log-sum-exp 与 fused cross-entropy 各自解决了什么问题、又留下什么边界。"
tags: ["Error Analysis", "Softmax", "Numerical Stability", "Floating Point"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 99
---

精确 Softmax 满足平移不变性：

\[
s(z+c\mathbf1)=s(z).
\]

因为分子分母都会多出同一个因子 $e^c$，随后约掉。这个简单恒等式同时
给出了最常用的稳定求值形式，也暴露出一个边界：数学上的不变性并不保证
低精度存储后的信息还在。

## 1. 直接公式为什么会产生无意义的巨大中间量

取

\[
z=(1000,999).
\]

精确概率只依赖差值 $1$，所以第一类概率约为

\[
\sigma(1)\approx0.731.
\]

但直接计算

\[
\frac{e^{1000}}{e^{1000}+e^{999}}
\]

会先生成超出常见浮点范围的中间量。最后答案完全正常，中间路径却可能出现
$\infty/\infty$ 和 NaN。

令

\[
m=\max_i z_i,
\]

利用平移不变性改写为

\[
p_i
=\frac{e^{z_i-m}}{\sum_j e^{z_j-m}}.
\]

现在所有指数输入都满足

\[
z_i-m\le0,
\]

最大指数恰好为 $e^0=1$，正向 overflow 被消除，分母也至少包含一个
$1$。这不是修改数学问题，而是选择一条动态范围更合理的等价求值路径。

## 2. subtract-max 仍然允许尾部下溢

若某个 $z_i-m$ 是很大的负数，$e^{z_i-m}$ 仍可能下溢为零。此时需要
先问 metric 和下游 consumer：

- 对 argmax 或整体绝对误差，丢掉极小尾部概率可能没有实际影响；
- 对该分量的相对误差，$p_i\to0$ 会变成 $100\%$ 误差；
- 若后续要计算 $\log p_i$，零会直接变成 $-\infty$。

所以 subtract-max 解决的是正向 overflow，不是“所有 Softmax 数值问题”。

## 3. 不要先生成概率再取 log

one-hot cross-entropy 为

\[
L=-\log p_y
=\log\sum_i e^{z_i}-z_y.
\]

若先计算 $p_y$，极小概率可能已经下溢成零。稳定形式直接保留解析抵消：

\[
\boxed{
L=(m-z_y)+\log\sum_i e^{z_i-m}.
}
\]

对应梯度是

\[
\nabla_zL=p-y,
\]

Hessian 则是 Softmax Jacobian

\[
\nabla_z^2L=J_s.
\]

直接 Softmax 再取 log 会把本可在解析式中消掉的病态因子拆开求值；fused
cross-entropy 或 log-softmax 则让抵消发生在浮点离散化之前。

二分类 sigmoid 也使用同一原则。令 $d=z_1-z_2$，可按符号分支：

\[
\sigma(d)=
\begin{cases}
\dfrac{1}{1+e^{-d}},&d\ge0,\\[6pt]
\dfrac{e^d}{1+e^d},&d\lt0.
\end{cases}
\]

两个分支都只计算非正指数。

## 4. Conditioning 与 stability 不能用一个词概括

精确 Softmax 满足

\[
\|s(z')-s(z)\|_2
\le\frac12\|z'-z\|_2.
\]

这说明数学映射在绝对 $2$-norm 下条件良好。它并不能证明某段程序稳定。
naive Softmax 仍可能在 $z=(1000,999)$ 上溢出。

因此要分别问：

- **问题条件性**：输入真的改变后，精确输出改变多少？
- **算法稳定性**：同一个输入下，浮点程序离精确输出多远？

$\|J_s\|_2\le1/2$ 回答第一问；overflow、exp approximation、求和和
除法舍入回答第二问。

---

**已移出本文：** 输入量化、$2^{24}$ 边界与总误差按来源的拆分，现已并入[输入表示与平移](/notes/systems/error-analysis/softmax/input-and-shift/) —— 那里有更完整的推导、ties-to-even 的反例，以及平移自身舍入的上界。完整的 FP32 边界实验、测试、CSV 与 closed-book rewrite 保存在 [Error Atlas](https://github.com/r1skers/error-atlas/tree/17ffd2a/topics/softmax/experiments)。

**下一篇：** [把 exp、求和与除法写进误差预算](/notes/systems/error-analysis/softmax/error-budget/)
