---
date: '2026-08-11T00:00:00+09:00'
draft: false
title: '误差分析 · Softmax 5：求和顺序怎样吞掉尾部小量'
summary: "FP32 中半个 ULP 的正增量可能完全无法改变 running sum；同一组 numerators 只改变 reduction graph，就会得到不同结果。"
description: "从 q=(1,u,u) 的最小反例出发，放大到 Softmax denominator stress case，再用 midpoint controls 比较 sequential、pairwise、Kahan 与 FP64 accumulator。"
tags: ["Error Analysis", "Softmax", "Floating Point", "Summation"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 5
---

上一篇得到 Softmax 的一阶误差预算：

\[
\frac{\widehat p_i-p_i}{p_i}
\approx
\epsilon_i-\bar\epsilon-\eta+\delta_i.
\]

其中 $\eta$ 是 normalizer 的求和误差。标准理论告诉我们，顺序求和的最坏
误差量级约为 $O(nu)$，平衡树形求和则约为 $O((\log n)u)$。

但误差界不会自动告诉我们：

- 哪个输入会真的失败；
- 小量究竟在哪一步被舍掉；
- 为什么同一组数换一个求和顺序就可能恢复；
- pairwise、Kahan 和更宽 accumulator 各自修复了什么。

这一篇研究 denominator reduction 收到的 FP32 numerators。

## 1. 冻结 Sum 阶段的实际输入
  
Softmax 的计算图可以写成

\[
z
\longrightarrow
x=z-\max(z)
\longrightarrow
\widehat q
\longrightarrow
\widehat S
\longrightarrow
\widehat p.
\]

如果当前研究 reduction，就冻结 exp 阶段实际产生的 $\widehat q$。局部
reference 是这些 stored FP32 values 的精确和：

\[
S_q=\sum_i\widehat q_i.
\]

某个 reduction method $M$ 返回 $\widehat S_M$，本阶段的误差定义为

\[
E_M=\widehat S_M-S_q,
\qquad
r_M=\frac{\widehat S_M-S_q}{S_q}.
\]

这样输入量化和 exp approximation 已经被冻结，不会被重复归因给求和。
这与第三篇的原则相同：

> 每次只让一个 stage 对自己的新增误差负责。

## 2. 半个 ULP 出现的问题

对 FP32，

\[
u=2^{-24},
\qquad
\operatorname{ulp}(1)=2^{-23}=2u.
\]

所以 $1+u$ 恰好位于 $1$ 与下一个 FP32 数之间的 midpoint。默认
round-to-nearest, ties-to-even 会选择尾位为偶数的 $1$：

\[
\operatorname{RN}_{32}(1+u)=1.
\]

这不是“小量产生了一点相对误差”，而是本次加法的正增量完全没有改变
stored result。

最小反例是

\[
q=(1,u,u).
\]

若从左到右求和：

\[
\operatorname{RN}_{32}
\left(
\operatorname{RN}_{32}(1+u)+u
\right)
=1.
\]

两个 $u$ 分别撞上 half-ULP tie，又分别被舍回 $1$。

若先合并尾项：

\[
\operatorname{RN}_{32}
\left(
1+\operatorname{RN}_{32}(u+u)
\right)
=1+2u.
\]

$u+u=2u$ 已经等于 $\operatorname{ulp}(1)$，可以进入最终结果。

同一组数没有改变，改变的只是 reduction graph。

## 3. “尾部不为零”不等于“尾部能进入总和”

每个 $u=2^{-24}$ 都是正常、非零、可精确表示的 FP32 数。故障并不来自
tail input 已经量化为零，而来自它与当前 partial sum 的尺度关系。

因此下面两种故障必须区分：

1. **输入表示丢失**：某个值在进入 Sum stage 前已经变成零或失去差值；
2. **求和停滞**：输入值仍非零，但加进当前 running sum 时没有改变结果。

检查

\[
\widehat q_i\ne0
\]

只能排除第一种，不能排除第二种。

## 4. 把局部停滞放大成可测故障

使用

\[
q=(1,\underbrace{2^{-24},\ldots,2^{-24}}_{2^{20}\text{ 个}})
\]

作为 stress case。精确 stored-input reference 是

\[
S_q
=1+2^{20}2^{-24}
=\frac{17}{16}.
\]

head-first sequential FP32 每一步都尝试把半个 ULP 加进 $1$，最终仍返回

\[
\widehat S_{\mathrm{seq}}=1.
\]

它丢掉了完整尾部质量

\[
\frac1{16},
\]

绝对相对误差为

\[
\left|
\frac{1-\frac{17}{16}}{\frac{17}{16}}
\right|
=\frac1{17}.
\]

局部每次只丢 $2^{-24}$，重复足够多次后却成为可见的整体偏差。

## 5. 四种 reduction 的受控比较

保持输入、reference 与输出 dtype 不变，只更换求和方法：

| Candidate | $\widehat S$ | 最大绝对相对误差 |
| --- | ---: | ---: |
| sequential FP32 | $1$ | $1/17$ |
| fixed pairwise FP32 | $17/16$ | $0$ |
| Kahan FP32 | $17/16$ | $0$ |
| FP64 accumulator，FP32 output | $17/16$ | $0$ |

### Fixed pairwise

当前树形实现先让尾项形成更大的 partial sums，再与 $1$ 合并，因此恢复了
当前案例的完整尾部质量。

但

\[
O((\log n)u)
\]

是树深对应的误差量级，不是“任意输入上都比 sequential 精确”的逐点保证。
具体 pairing 仍然重要。

### Kahan compensation

Kahan 额外维护 compensation，把前一步未进入 running sum 的低位信息带到
后续计算。在这个案例中，它恢复了精确 FP32 结果。

这不等于 Kahan 对任意输入都 correctly rounded，也不说明它在并行硬件上
代价最低。

### FP64 accumulator

把 FP32 inputs 转入 FP64 accumulator 后，尾项可以先在更宽的有效位中累积，
最后再舍入回 FP32。当前案例同样得到 $17/16$。

它说明“更宽 accumulation 可以恢复当前故障”，但没有回答目标硬件上的
throughput、register pressure 或能耗代价。

## 6. 用舍入边界控制族检验结论

上面的 $17/16$ stress case 证明 fixed pairwise 可以修复一种停滞，但它仍是一个
对树形 reduction 友好的案例。要检验“具体 pairing 仍然重要”，需要把精确和放在
FP32 舍入边界的两侧。

先取可精确表示的 binary tail

\[
t=2^{-34},
\qquad
S_q=1+Nt.
\]

在 $1$ 附近，半个 ULP 是 $2^{-24}$，所以 $N=1023,1024,1025$ 分别位于
midpoint 下方、正好落在 midpoint，以及最小上方：

| $N$ | correctly rounded FP32 bits | 边界位置 |
| ---: | --- | --- |
| $1023$ | `0x3f800000` | midpoint 下方 |
| $1024$ | `0x3f800000` | tie，ties-to-even 向下 |
| $1025$ | `0x3f800001` | midpoint 最小上方 |

在 $N=1025$ 时，head-first sequential FP32 仍然返回 `0x3f800000`；先累积
tail 的 sequential 返回 `0x3f800001`。当前 fixed pairwise 在两种 layout 上都
返回 `0x3f800000`，而 Kahan 与 FP64 accumulator 返回正确的
`0x3f800001`。

这给出了一个直接反例：pairwise 在大 stress case 上恢复 reference，却在刚越过
midpoint 的控制样本上向下舍入。树深较短仍然有价值，但它不是逐输入的
correct-rounding 保证。

再取十进制 source tail

\[
t_{\mathrm{source}}=10^{-8},
\qquad
\widehat t=\operatorname{RN}_{32}(t_{\mathrm{source}}).
\]

此时必须同时保存

\[
S_{\mathrm{source}}=1+Nt_{\mathrm{source}},
\qquad
S_{\mathrm{stored}}=1+N\widehat t.
\]

二者之差属于 input quantization；reduction error 只能相对于
$S_{\mathrm{stored}}$ 判断。$N=5$ 的 correctly rounded stored sum 仍是
`0x3f800000`，而 $N=6$ 已经是 `0x3f800001`。在 $N=6$ 的控制样本上，
head-first sequential 与 fixed pairwise 不能 correctly round；tail-first
sequential、Kahan 和 FP64 accumulator 可以。

因此边界控制族同时完成了三件事：

- 验证 midpoint 与 ties-to-even 的预测；
- 把 source-input error 与 reduction error 分开；
- 用实测反例限制“pairwise 更准”的适用范围。

## 7. 为什么不能用 CPU 原型耗时排名

Python 循环中的 sequential、recursive pairwise、Kahan 和 FP64 loop 具有
完全不同的解释器开销。这些耗时不能代表 GPU 上：

- warp/block reduction；
- shared memory 与 register 使用；
- synchronization；
- vectorization；
- accumulator throughput；
- kernel launch 与 memory traffic。

所以当前实验只比较数值结果，不使用 CPU Python 时间建立性能结论。

## 8. 总结
本篇验证：

- FP32 非零尾项可以在 addition stage 完全停滞；
- 同一 multiset 的 reduction graph 会改变结果；
- 顺序求和的局部舍入可以积累成 $1/17$ 相对误差；
- fixed pairwise、Kahan 与 FP64 accumulator 在 $17/16$ stress case 上恢复
  reference；
- midpoint 控制族给出 fixed pairwise 不能 correctly round 的输入，实验证明
  “树深更短”不能直接改写成“所有输入上都更准”；
- 十进制 tail control 把 source-input quantization 与 reduction error 分开；
- CPU 原型只能提供数值证据，不能提供 GPU cost ranking。

还需要另一个问题才能真正选择处置：

> 多大误差算失败，是否要求 repeatability，以及由谁决定？

这属于 consumer policy，而不是 reduction method 自己的属性。

首个 stress case 的版本化 CSV 与 metadata，以及后续 boundary controls 的源码
与测试，保存在
[Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax/experiments)。

---

**上一篇：** [Softmax 4：把 exp、求和与除法写进误差预算](/notes/systems/error-analysis/softmax/note-error-softmax-4-floating-point-budget/)

**下一篇：** [Softmax 6：从观测到 consumer-specific 处置](/notes/systems/error-analysis/softmax/note-error-softmax-6-consumer-specific-mitigation/)
