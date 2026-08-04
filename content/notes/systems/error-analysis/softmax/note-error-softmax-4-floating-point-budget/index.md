---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: '误差分析 · Softmax 4：把 exp、求和与除法写进误差预算'
summary: "normalization 会消掉 exp 相对误差的共同模式，却会把差异性误差传播给所有概率；求和和除法还会引入新的误差方向。"
description: "逐步推导 Softmax 的一阶浮点误差预算、概率总量偏差、下溢边界，以及顺序与树形求和的理论差异。"
tags: ["Error Analysis", "Softmax", "Floating Point", "Numerical Stability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 4
---

subtract-max 解决了正向 overflow，却没有让 exp、求和和除法变成精确运算。
这一篇沿实际计算图逐步加入误差：

\[
x_i=z_i-\max_jz_j
\longrightarrow
q_i=e^{x_i}
\longrightarrow
S=\sum_iq_i
\longrightarrow
p_i=\frac{q_i}{S}.
\]

为了看清每一步的作用，先固定假设：

- shifted logits $x_i\le0$ 已经给定；
- 暂时没有下溢；
- 每一步都满足标准的小相对误差模型；
- 先分开误差源，最后再合并。

## 1. exp 误差先怎样进入 normalizer

设第 $i$ 个指数计算为

\[
\widehat q_i=q_i(1+\epsilon_i).
\]

那么 normalizer 的绝对误差是

\[
\Delta S
=\sum_jq_j\epsilon_j.
\]

除以

\[
S=\sum_jq_j
\]

后，得到相对误差

\[
\frac{\Delta S}{S}
=\sum_j\frac{q_j}{S}\epsilon_j
=\sum_jp_j\epsilon_j.
\]

记

\[
\bar\epsilon=\sum_jp_j\epsilon_j.
\]

它只是 exp 相对误差在概率分布 $p$ 下的加权平均。概率大的项对分母误差
权重更大；这有概率加权的结构，但它本身不是熵。

## 2. Normalization 消掉共同模式

若先假设求和与除法精确，则

\[
\widehat S=S(1+\bar\epsilon),
\]

\[
\widehat p_i
=p_i\frac{1+\epsilon_i}{1+\bar\epsilon}.
\]

因此得到精确关系

\[
\boxed{
\frac{\widehat p_i-p_i}{p_i}
=\frac{\epsilon_i-\bar\epsilon}{1+\bar\epsilon}.
}
\]

误差足够小时，

\[
\frac{\widehat p_i-p_i}{p_i}
\approx\epsilon_i-\bar\epsilon.
\]

如果所有 $\epsilon_i=c$，则 $\bar\epsilon=c$，最终概率没有误差。这里
消掉的不是“所有 exp 误差”，而是它们的共同相对部分；类别间不同的误差仍会
保留。

这个结论也可以重新接回 Jacobian。因为

\[
q_i(1+\epsilon_i)
=\exp\left(x_i+\log(1+\epsilon_i)\right),
\]

exp 相对误差等价于 logits 扰动

\[
\Delta x_i=\log(1+\epsilon_i)
\approx\epsilon_i.
\]

于是

\[
\Delta p\approx J_s\Delta x,
\]

逐分量正好重新得到 $\epsilon_i-\bar\epsilon$。共同 exp 误差对应一个非零
的共同平移向量，它不是零输入，而是被 Jacobian 映到零。

## 3. 求和误差只进入分母

现在单独加入求和相对误差

\[
\widehat S=S(1+\eta).
\]

若分子和除法精确，

\[
\frac{\widehat p_i}{p_i}
=\frac{1}{1+\eta}.
\]

当 $\eta>0$ 时，所有概率一起偏小，而且

\[
\sum_i\widehat p_i
=\frac{1}{1+\eta}
\ne1.
\]

这和共同 exp 误差不同：exp 的共同因子同时进入分子和分母，可以约掉；求和误差只附加在分母上，没有对应的分子因子。

## 4. 每个除法还有自己的舍入

令最终除法满足

\[
\operatorname{fl}\left(\frac{\widehat q_i}{\widehat S}\right)
=\frac{\widehat q_i}{\widehat S}(1+\delta_i).
\]

把三段误差合并：

\[
\frac{\widehat p_i}{p_i}
=\frac{(1+\epsilon_i)(1+\delta_i)}
{(1+\bar\epsilon)(1+\eta)}.
\]

只保留一阶项，得到本轮的核心误差预算：

\[
\boxed{
\frac{\widehat p_i-p_i}{p_i}
\approx
\epsilon_i-\bar\epsilon-\eta+\delta_i.
}
\]

四项可以按来源阅读：

- $\epsilon_i$：第 $i$ 个 exp 的局部相对误差；
- $-\bar\epsilon$：normalization 对 exp 共同模式的消除；
- $-\eta$：normalizer 求和误差；
- $+\delta_i$：第 $i$ 次最终除法误差。

“一阶”意味着忽略 $\epsilon_i\eta$、$\delta_i\eta$ 这类 $O(u^2)$ 乘积，而不是把所有小量都设为零。

## 5. 从表达式得到最坏界

若 exp 满足

\[
|\epsilon_i|\le\alpha u,
\]

则

\[
|\bar\epsilon|\le\alpha u.
\]

更精细地，

\[
\epsilon_i-\bar\epsilon
=\sum_{j\ne i}p_j(\epsilon_i-\epsilon_j),
\]

所以

\[
|\epsilon_i-\bar\epsilon|
\le2(1-p_i)\alpha u.
\]

普通顺序求和 $n$ 个正数时，标准相对误差界为

\[
|\eta|\le\gamma_{n-1},
\qquad
\gamma_{n-1}
=\frac{(n-1)u}{1-(n-1)u}
\approx(n-1)u.
\]

若基本除法满足 $|\delta_i|\le u$，三角不等式给出

\[
\left|
\frac{\widehat p_i-p_i}{p_i}
\right|
\lesssim
2(1-p_i)\alpha u+\gamma_{n-1}+u.
\]

这是把所有误差都假设成最坏符号、恰好同向累积得到的安全界，不是实际误差的逐点预测。

## 6. 顺序求和与树形求和

顺序求和有长度 $n-1$ 的舍入依赖链，因此最坏量级是 $O(nu)$。平衡树形求和中，每个数到根节点只经过约 $\lceil\log_2n\rceil$ 层，所以理论量级降为

\[
O((\log_2n)u).
\]

以 FP32、$n=1000$ 为例，$u\approx6\times10^{-8}$：

- 顺序求和上界约 $999u\approx6\times10^{-5}$；
- 十层树形求和约 $10u\approx6\times10^{-7}$。

但误差界不是每个输入都会达到。若所有 $q_i=1$，FP32 在 $n<2^{24}$ 时可能精确累加这些整数，实验反而看不到误差。更有辨识力的构造是

\[
q=(1,u,u,\ldots,u).
\]

把 $1$ 放在最前面时，后续小量可能逐个被舍掉；先把小量两两合并，再与 $1$ 相加，则更容易保留它们。

## 7. 概率和为 1 为什么不够

把相对误差乘回 $p_i$，

\[
\Delta p_i
\approx
p_i(\epsilon_i-\bar\epsilon-\eta+\delta_i).
\]

对所有分量求和：

\[
\boxed{
\sum_i\widehat p_i-1
\approx
-\eta+\sum_i p_i\delta_i.
}
\]

exp 差异误差没有出现在总量偏差里，因为它只在类别之间重新分配概率。
求和和除法误差则可能让结果离开概率单纯形。

因此：

\[
\widehat p=p
\Longrightarrow
\sum_i\widehat p_i=1,
\]

但

\[
\sum_i\widehat p_i=1
\not\Longrightarrow
\widehat p=p.
\]

不同分量的错误可能互相补偿，$-\eta$ 与加权除法误差也可能偶然抵消。
“概率和为 $1$”是必要检查，不是充分证明。

## 8. 下溢让小误差模型突然失效

数学上 $q_i=e^{x_i}>0$，但浮点结果可能是

\[
\widehat q_i=0.
\]

形式上的相对误差是

\[
\epsilon_i
=\frac{0-q_i}{q_i}
=-1.
\]

它仍然可以定义，却不再是 $O(u)$ 小量，前面的一阶推导不再适用。若真实
概率是 $10^{-40}$ 而计算结果为 $0$，绝对误差是 $10^{-40}$，分量相对
误差幅度却是 $1$。

这不是一句“稳定”或“不稳定”能够解决的冲突。必须先说明下游究竟关心：

- 整体绝对 norm；
- 极小概率分量的相对误差；
- argmax；
- 还是 $\log p_i$ 与 cross-entropy。

## 9. 本轮证据边界

| 结论 | 当前证据 |
| --- | --- |
| exp 共同相对误差被 normalization 消掉 | 精确代数推导与 Jacobian 解释 |
| 一阶预算 $\epsilon_i-\bar\epsilon-\eta+\delta_i$ | 标准浮点误差模型推导 |
| 顺序求和 $O(nu)$、树形求和 $O(\log n\,u)$ | 理论上界，实验待完成 |
| $2^{24}$ 处单位 logit difference 丢失 | FP32 可复现实验、测试、CSV 与 metadata |
| 下溢时分量相对误差可达 $100\%$ | 边界反例；consumer-dependent 处置尚待系统整理 |

下一阶段不再继续增加误差公式，而是建立“故障—metric/consumer—处置”
决策链，再把 tree reduction、mixed precision、fast exp、kernel fusion 与
非确定求和顺序放到 GPU 实现中验证。

---

**本 Topic 第一轮完成：** [返回 Softmax 父页面](/notes/systems/error-analysis/softmax/)
