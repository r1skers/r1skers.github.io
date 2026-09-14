---
date: '2026-09-13T00:00:00+09:00'
draft: false
title: 'Softmax 下游使用：误差怎样进入加权输出'
summary: "从概率误差到标量加权输出，区分误差方向、分子分母的抵消与最终存储；沿 Error Atlas 的 V 探针和输出测量代码展开。"
description: "分析 Softmax 概率误差对加权输出的影响，对照 output_probe、output_reference 和 output_measure 的实现，解释恒定 V 控制、非恒定探针与低精度存储对照的边界。"
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Attention"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 7
math: true
ShowToc: true
softmaxArticle: true
---

[← 返回计算阶段地图 · 下游使用者](/notes/systems/error-analysis/softmax/#consumer)

> 由 agent 协助起草并完成技术核对。开发记录按 Error Atlas 已有源码的依赖顺序整理，不是逐日开发日志；仓库中的 explain-back 与实现边界会分别说明。本篇只展开标量加权输出，不把它当作完整 attention、loss 或模型质量实验。

## 1. 概率有误差，输出就一定明显变差吗？

[上一篇](/notes/systems/error-analysis/softmax/normalization-division/)停在了实际概率及其存储值。接下来研究使用方式（Attention）：

\[
y=\sum_i p_iV_i.
\]

这里 $p$ 是精确 Softmax 概率，$V_i$ 是给定的有限标量。它可以理解为 attention 输出的一个坐标，但本篇先固定 $V$，不包含生成或量化 $V$ 的误差。

设下游实际收到的概率为 $\tilde p_i=p_i+\Delta p_i$。如果加权求和暂时按实数精确执行，记结果为 $y_{\tilde p}$，则

\[
\boxed{y_{\tilde p}-y=\sum_i\Delta p_iV_i.}
\]

误差是否进入输出，取决于 $\Delta p$ 与 $V$ 的配合，而不只是某个概率误差的大小。

例如取 $p=(1/2,1/2)$、$\Delta p=(\varepsilon,-\varepsilon)$，其中 $0\lt\varepsilon\lt1/2$：

- $V=(1,1)$ 时，输出误差为 $0$。
- $V=(1,-1)$ 时，同一组概率误差变成输出误差 $2\varepsilon$。

因此，分母误差更小、概率误差更小和某个下游输出误差更小，不能不加条件地画等号。

### 1.1 常数方向是否真的消失？

对任意常数 $c$，可以精确改写为

\[
\sum_i\Delta p_iV_i
=\sum_i\Delta p_i(V_i-c)+c\sum_i\Delta p_i.
\]

如果实际概率和仍为 $1$，那么 $\sum_i\Delta p_i=0$，常数部分不影响输出；否则还会留下第二项。上一篇的三等分例子已经说明，存储后的概率和未必精确为 $1$。

而实际加权求和还会新增乘法、累加误差。定义 $a=\hat y-y_{\tilde p}$，就有

\[
\hat y-y=\sum_i\Delta p_iV_i+a.
\]

所以本节只把“传入的概率误差”和“consumer 自己新增的算术误差”分开，且不假设后者为零。

## 2. 融合输出不一定先生成概率

另一条实现路径不存储各个 $p_i$，而是同时计算加权分子与分母，最后再相除：

\[
O_*=\sum_i q_iV_i,\qquad
\ell_*=\sum_iq_i,\qquad
y=\frac{O_*}{\ell_*},
\]

其中 $q_i=\exp(x_i-M)$，$M=\max_i x_i$，以上参考量都按实数精确计算。

常规求值可以这样组织，online / tiled 求值也可以维护对应状态。它们共享这个数学目标，但不共享所有中间舍入。本篇用 Error Atlas 的 online 标量实现作具体案例，不能将它误读成“先存概率，再算 $PV$”的代码。

设实际分子、分母为

\[
\hat O=O_*+\Delta O,\qquad
\hat\ell=\ell_*+\Delta\ell>0.
\]

在最后一次除法舍入之前，误差满足精确恒等式

\[
\boxed{
\frac{\hat O}{\hat\ell}-y
=\frac{\Delta O-y\Delta\ell}{\hat\ell}.
}
\]

分母误差并不是单独进入结果的：它与分子误差一起出现，两项可能抵消，也可能加强。再加上除法残差 $d$ 与存储残差 $c_{\mathrm{store}}$，最终存储输出满足

\[
\tilde y-y
=\frac{\Delta O-y\Delta\ell}{\hat\ell}
+d+c_{\mathrm{store}}.
\]

这里只沿用上一篇的残差定义，不再展开除法与 cast 的实现。

### 2.1 为什么要先检查 V = 1？

数学上，如果所有 $V_i=1$，则 $O_*=\ell_*$、$y=1$。但要在浮点实现里得到相同结论，还需要实际分子与分母走相同的算术路径。

在本仓库的受控实现中，$V=1$ 时叶子的分子等于分母；每次合并又复用相同权重、相同分支及舍入方式，因此可以逐节点检查

\[
\hat O_v=\hat\ell_v.
\]

只要最终分母有效且为正，就有 $\hat O/\hat\ell=1$，最后除法与支持的输出存储也都精确。即使分母自身偏离真实值，输出仍可能完全正确。

这不是“任何恒定 $V$ 都能在任意实现中精确恢复”的保证，更不是显式存储概率路径的保证。若先逐个舍入 $p_i$，存储值的精确和不保证为 $1$；随后对 $V=1$ 做浮点累加时，结果也可能恰好舍回 $1$。两者不能混为一谈。

## 3. 开发记录：先固定 V，再接入已有计算路径

本篇的源码主线是 [online/output_probe.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_probe.py)。先确定探针和叶子，再传播分子；最后才接 [output_reference.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_reference.py) 与 [output_measure.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_measure.py)。

### 3.1 probe_values：改变值，不改变概率问题

这里的 `BlockFamily` 是特意简化过的输入：第 $b$ 块由 $n_b$ 个相同 logit $m_b$ 组成，块内 $V$ 也取同一个值 $V_b$。改变探针只改变 $V_b$，不改变 logits、块质量或合并图。

`probe_values` 固定了五种模式：

| 模式 | V 的选择 | 观察什么 |
| --- | --- | --- |
| `zero` | 全部为 0 | 零输出控制 |
| `one` | 全部为 1 | 分子、分母的路径一致性 |
| `max_block` | 原始顺序中第一个最大 logit 块取 1，其余为 0 | 该块的总概率质量 |
| `first_block` | 第一个块取 1，其余为 0 | 固定位置的块质量 |
| `alternating_sign` | 按原始块序交替取 +1、−1 | 两组质量之差与有符号抵消 |

`max_block` 在运行各棵树之前就固定并列最大值的选择，不是让每棵树各选自己的“赢家”。`first_block` 也不保证选中尾部小概率块；它只固定位置。

源码 explain-back 中首先澄清的就是：**V 是值，不是概率。** 指示探针的输出才是所选块的概率质量，不能先把 $V$ 归一化后再带入。

### 3.2 leaf_numerators：局部叶子不要多乘一次概率

每个块在自己的最大值尺度下，所有指数都是 $\exp(m_b-m_b)=1$，所以

\[
\ell_b=n_b,\qquad O_b=n_bV_b.
\]

对应代码的核心只有：

~~~python
result = tuple(Fraction(n) * v for n, v in zip(family.masses, values))
~~~

这里不乘全局概率，也不提前乘 $\exp(m_b-M)$。后面的合并才负责把不同局部尺度接起来。

函数允许的值为 $\{0,\pm1/2,\pm1\}$，并检查叶子结果可以精确表示成 FP32；上述五种探针实际只使用 $0,\pm1$。这是为了先隔离后续传播，不是通用块内点积实现。

### 3.3 propagate_numerator：复用权重，不重新计算 exp

已有 `MergeDump` 保存了图的子节点索引和实际舍入后的左右权重。分子传播只读取这些数据，不重新计算 max、gap 或 exp。

separate 分支按顺序执行两个 FP32 乘法，再做一次 FP32 加法：

~~~python
p_a, _ = fp32_mul(o_a, w_a)
p_b, _ = fp32_mul(o_b, w_b)
o_v, _ = fp32_add(p_a, p_b)
~~~

FMA 分支沿用分母的判断顺序：先看左权重是否为 $1$，否则再看右权重；把另一侧的乘法与加法交给一次 `fp32_fma`。不能按 $O$ 的正负或大小重新选择分支，因为决定重标定的是权重。

源码的 explain-back 也提醒：$O$ 可以为负，是因为 $V$ 可以为负；$O$ 本身不是“误差”。$V=1$ 时逐节点相等的量，是**当前节点最大值尺度下的质量**，不是所有后代叶子质量的普通相加。

### 3.4 一个先验控制：逐节点检查，而不只看最终的 1

以下例子可在 Error Atlas 的 `topics/softmax/experiments` 目录运行：

~~~python
from fractions import Fraction as F
from online.pilot import BlockFamily
from online.merge import merge_reduce
from online.schedules import sequential_chain, balanced_pairwise
from online.output_probe import probe_values, leaf_numerators, propagate_numerator
from online.output_reference import finish_output, reference_output
from online.output_measure import record

family = BlockFamily(tuple(map(F, (-3, 0, -1, -2))), (32,) * 4)
values = probe_values(family, "one")
leaves = leaf_numerators(family, values)
reference = reference_output(family, values)
assert reference.output == (F(1), F(1))

for tree in (sequential_chain(4), balanced_pairwise(4)):
    for fused in (False, True):
        dump = merge_reduce(family.leaf_max, family.leaf_ell, tree, fused=fused)
        assert propagate_numerator(dump, leaves) == dump.node_ell
        computed = finish_output(dump, leaves)
        assert computed.value == 1
        assert computed.division_residual == 0
        measured = record(computed, reference, max(map(abs, values)))
        assert all(row["abs_error"] == (0, 0)
                   for row in measured["formats"].values())
~~~

这个例子检查的是路径一致性，不是先宣称它的分母误差足够大。非恒定探针仍然要另做检查，不能因为 `one` 通过就认为输出实现已经在所有输入上正确。

## 4. 参考值与测量：别让零输出把指标弄坏

### 4.1 reference_output：比较的不是另一个浮点实现

这个块模型的真实参考是

\[
O_*=\sum_b n_bV_b\exp(m_b-M),\qquad
\ell_*=\sum_b n_b\exp(m_b-M).
\]

`numerator_interval` 使用输入之间的精确 Fraction 差和实数 exp 区间。它不能复用 dump 中已舍入的 gap 或 exp，否则会把被测实现的部分误差混进参考。

乘上负的 $n_bV_b$ 时，区间上下端点要反转；分子区间除以严格正的分母区间时，`quotient_interval` 检查四个端点组合。得到的是保守外包，不一定是利用相关性后的最紧区间。

恒定 $V=v$ 则单独处理：利用 $O_*=v\ell_*$，直接返回输出区间 $[v,v]$。这条数学相关性不能靠两个独立区间相除自动恢复。它也不意味着浮点计算对任意 $v$ 都精确。

### 4.2 record：相对于 V 的尺度，而不是除以 y

`alternating_sign` 可能产生接近零甚至精确为零的参考输出。输出为零时，相对误差未定义；输出非零但接近零时，相对误差仍有定义，却可能对很小的绝对误差非常敏感。

`output_runner.py` 传给 `record` 的尺度是 $s=\max_b\lvert V_b\rvert$。当 $s>0$ 时，记录

\[
\frac{\lvert\tilde y-y\rvert}{s}.
\]

它是按输入值尺度归一化的绝对误差，不是相对于 $y$ 的相对误差。`zero` 模式下 $s=0$，归一化字段为 `None`，但原始输出与绝对误差仍然保留。

如果参考输出为 $[y_-,y_+]$，实际存储值 $\tilde y$ 的有符号误差区间就是 $[\tilde y-y_+,\tilde y-y_-]$。这是数值外包，不是重复采样得到的统计置信区间。

### 4.3 两个单侧替换只作诊断

`record` 另外保存“只换分母”与“只换分子”的比值区间：

\[
\frac{O_*}{\hat\ell},\qquad
\frac{\hat O}{\ell_*}.
\]

它们帮助回答某一侧单独改变会怎样，却不是实际输出，也不是可直接部署的算法。这两个反事实的绝对误差不能相加后冒充真实误差预算：实际输出包含 §2 的分子、分母耦合。

## 5. 输出不同、误差更小与存储相同，是三件事

`paired` 对同一输入、同一探针和同一 FMA 设置下的 chain / balanced 结果进行比较：先比较实际存储位模式，再记录输出差和绝对误差之差。

定义

\[
D=\lvert e_{\mathrm{chain}}\rvert-\lvert e_{\mathrm{balanced}}\rvert.
\]

只有 $D$ 的整个外包区间都大于零时，才认证这一对中 chain 的绝对误差更大；区间跨零时不能用中点强行判高下。两边存储值相同且共享参考时，实际误差也相同，代码直接记 $D=[0,0]$，避免独立区间相减产生虚假的宽度。

### 5.1 已保存实验说明了什么？

[标量输出诊断记录](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/online_scalar_output_v1.md)与[冻结结果包](https://github.com/r1skers/error-atlas/tree/17ffd2a/topics/softmax/experiments/online/runs/scalar_output_v1)记录了既有 64 个输入族上的事后诊断。下面只取三个非恒定探针、两种 FMA 设置下的 online 树形配对，共 $64\times3\times2=384$ 对：

| 最终格式 | chain / balanced 输出位模式不同的配对数 |
| --- | --- |
| FP32 | 332 / 384 |
| FP16 | 0 / 384 |
| BF16 | 0 / 384 |

其中 FP32 有 266 对 chain 的绝对误差更大，66 对 balanced 更大。这个结果既不是“balanced 永远更准”，也不是“低精度下优化一定没有价值”。它只说明这批实际 FP32 输出经过 cast 后，落入了相同的低精度舍入区间。

**存储相同不等于误差为零。** 两棵树可能共享同一个偏离参考的存储值；换一组输入，也可能跨过舍入中点而产生不同结果。不能仅凭误差小于某个 dtype 的 unit roundoff 就推断 cast 后相同，必须真正转换并比较。

这些配对共享输入与探针，不是 384 个独立随机样本。上述数字来自既有冻结实验，不是本篇新运行的大规模实验；完整 attention、目标 GPU 成本和模型质量都不在这份证据里。

## 6. 审计顺序与本篇边界

对应源码，建议按以下顺序审计：

1. `probe_values` 与 `leaf_numerators`：V 是否保持值的语义，叶子是否多乘了全局权重？
2. `propagate_numerator`：是否复用实际权重，保持 separate / FMA 路径，并通过逐节点 `V=1` 控制？
3. `reference_output`：是否使用真实参考、处理负系数并保留恒定 V 的相关性？
4. `record` 与 `paired`：是否从实际 FP32 输出执行 cast，区分参考误差、输出差与存储位模式？

现有 [探针测试](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_probe.py)覆盖探针选择、叶子初始化、实际权重复用、有符号抵消和 FMA 边界；[参考值测试](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_reference.py)与[测量测试](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_measure.py)继续检查区间、除法和存储记账。

到这里，只能回答“这些误差怎样进入这个 consumer”。要判断输出是否可接受，还需要应用自己的 metric、tolerance 与成本约束，这部分接到已有的[验收与处置文章](/notes/systems/error-analysis/softmax/consumer-mitigation/)。

Online 的块状态、重标定和合并拓扑仍放在[Online 求值分支](/notes/systems/error-analysis/softmax/#online-softmax)。本篇借用其标量实现连接概率与输出，不在这里重写整套 online 算法。

返回计算阶段地图：[下游使用者](/notes/systems/error-analysis/softmax/#consumer) · [Online 求值](/notes/systems/error-analysis/softmax/#online-softmax)
