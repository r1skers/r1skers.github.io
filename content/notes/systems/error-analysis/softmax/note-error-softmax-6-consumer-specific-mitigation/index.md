---
date: '2026-08-11T00:10:00+09:00'
draft: false
title: '误差分析 · Softmax 6：从观测到 consumer-specific 处置'
summary: "同一个求和结果可以通过 tolerance 却不是 correctly rounded，也可以完全可重复却共同偏离 reference；判定必须把 observation、summary、policy 与 mitigation 分开。"
description: "建立 Softmax 的第一条“故障—consumer—metric—tolerance—处置”链，区分 accuracy、correct rounding、repeatability、结构性失败与尚未测量的 GPU 成本。"
tags: ["Error Analysis", "Softmax", "Numerical Stability", "Verification"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 6
---

上一篇已经构造出明确的求和故障：

\[
q=(1,\underbrace{2^{-24},\ldots,2^{-24}}_{2^{20}\text{ 个}}),
\]

其中 sequential FP32 返回 $1$，而 stored-input reference 是 $17/16$。
pairwise、Kahan 和 FP64 accumulator 在这个案例上恢复了 reference。

但“某个方法误差更小”仍然不是完整决策。还要先问：

- consumer 使用 denominator、概率、loss 还是 argmax？
- 它关心绝对误差、相对误差还是 bitwise identity？
- tolerance 是多少？
- repeatability 是否是独立要求？
- correctly rounded 是否是独立要求？
- 哪种 failure 必须阻塞，哪种只需要 warning？

因此处置链应写成

\[
\boxed{
\text{failure}
\longrightarrow
\text{consumer}
\longrightarrow
\text{metric}
\longrightarrow
\text{tolerance}
\longrightarrow
\text{mitigation}.
}
\]

## 1. Failure 名称不能直接决定修复

“Softmax 求和有误差”仍然太宽泛。

如果 consumer 只关心 argmax，一个极小 denominator 相对误差可能不改变
最终类别；如果 consumer 要求 correctly rounded denominator，同一个误差
已经失败；如果后续进入 log 或 cross-entropy，极小概率下溢又可能成为结构性
故障。

所以需要先冻结：

- 当前 stage 的实际输入；
- 局部 reference；
- metric；
- consumer tolerance；
- execution environment。

只有这些条件固定以后，pass/fail 才有可解释含义。

## 2. Raw observation 不应该直接写 pass/fail

每次 reduction run 首先只记录事实：

- case identity；
- input hash；
- implementation/config identity；
- environment identity；
- 输出值与 FP32 bit pattern；
- signed、absolute 与 relative error；
- correctly rounded reference bit pattern；
- run index。

这一层叫 raw observation。它不应该知道 consumer tolerance，也不应该根据
当前结果选择判定规则。

如果 raw CSV 已经只有一列 pass/fail，后续就无法重新回答：

- 把 tolerance 从 $10^{-6}$ 改成 $10^{-8}$ 会怎样？
- 不要求 bitwise repeatability 时，accuracy 是否仍合格？
- 三次结果不同，但全部在 tolerance 内，应该怎样分类？

原始事实必须先保留下来。finite、NaN 与正负 infinity 类别可以由输出值派生，
其分类计数属于下一层 summary，而不是每条 raw record 的独立决策。

## 3. Summary 只负责聚合，不负责决策

对同一 case、config 和 environment 的多次运行，再生成 summary：

- run count；
- finite 与 nonfinite count；
- unique bit-pattern count；
- finite min、max、mean 与 population spread；
- 最大绝对相对误差；
- 共同的 correctly rounded reference bit pattern。

summary 可以回答“发生了什么”，但不能回答“consumer 是否接受”。

例如三次运行都返回同一个错误值：

\[
\text{unique bit patterns}=1.
\]

结果完全可重复，却仍可能共同偏离 reference：

\[
\boxed{
\text{bitwise repeatable}
\not\Rightarrow
\text{accurate}.
}
\]

反过来，多个不同 bit patterns 也可能全部落在允许误差内。此时 accuracy
合格，repeatability 却失败。

## 4. Policy 才定义 consumer 要求什么

当前实验中的 `RunAcceptancePolicy` 只声明三个 consumer-owned requirement：

- 最大允许绝对相对误差；
- 是否要求 bitwise repeatability；
- 是否要求 correctly rounded output。

metric 已由当前 reduction suite 固定为最大绝对相对误差；nonfinite output 是
固定的 structural failure。failure 与 warning code 则由 assessment 根据 policy
派生，而不是由 policy 任意命名。例如同一个非 correctly rounded 的 summary：

- 当 correct rounding 是必要条件时，得到 failure；
- 当它不是必要条件时，只记录 `not_correctly_rounded` warning。

把同一个 policy-free summary 代入不同 policy 后，才得到不同 assessment。当前
suite 注册了两套 policy：

| Policy | Error tolerance | Bitwise repeatability | Correct rounding |
| --- | ---: | --- | --- |
| consumer tolerance | $10^{-6}$ | required | not required |
| correct rounding | $10^{-6}$ | not required | required |

policy 本身通过 canonical JSON 和 `policy_id` 保存，因此修改任何 requirement 都会
形成新的判定身份，而不会改写原 observation 或 summary。

### 大 stress case：accuracy 已经足够判失败

对 $17/16$ stress case，consumer-tolerance policy 要求：

\[
\max_r
\left|
\frac{\widehat S^{(r)}-S_q}{S_q}
\right|
\le10^{-6},
\]

并要求 bitwise repeatability。

于是：

| Candidate | Accuracy | Repeatability | Overall |
| --- | --- | --- | --- |
| sequential FP32 | fail | pass | fail |
| fixed pairwise FP32 | pass | pass | pass |
| Kahan FP32 | pass | pass | pass |
| FP64 accumulator | pass | pass | pass |

sequential 的失败原因是 accuracy tolerance exceeded，不是 nondeterminism。

### 边界 control：tolerance pass 不代表 correctly rounded

第 5 篇的 $t_{\mathrm{source}}=10^{-8},N=6$ control 更能显示两套 policy 的
区别。所有 candidate 的相对误差都在 $10^{-6}$ 内，而且当前 CPU 运行都
bitwise repeatable；但它们不一定返回 correctly rounded stored sum：

| Candidate / layout | Consumer tolerance | Correct rounding |
| --- | --- | --- |
| sequential FP32 / head-first | pass | fail |
| sequential FP32 / tail-first | pass | pass |
| fixed pairwise FP32 / 两种 layout | pass | fail |
| Kahan FP32 / 两种 layout | pass | pass |
| FP64 accumulator / 两种 layout | pass | pass |

因此“稳定地返回同一个值”“误差满足 consumer tolerance”和“correctly rounded”
是三个不同命题。

## 5. 结构性失败、accuracy、correct rounding 与 repeatability 要分开

一个清楚的 assessment 至少区分：

### Structural failure

- NaN；
- positive 或 negative infinity；
- 没有有限输出；
- reference 不可认证；
- 输入 recipe 与实际 materialized bytes 不一致。

这些问题通常应在计算 metric 前阻塞。

### Accuracy failure

有限输出存在，但相对于局部 reference 的误差超过 consumer tolerance。

### Correct-rounding failure

输出可能满足 consumer tolerance，甚至完全可重复，但 bit pattern 不等于局部
reference 的 correctly rounded target。只有 consumer 明确要求 correct rounding
时，这才是 blocking failure；否则它是 warning。

### Repeatability failure

固定 case、config 和 environment 后，不同 run 得到不同 bit patterns。

### Non-blocking warning

某个性质不满足，但当前 consumer 没有把它设为必要条件。

failure code 应描述观察到的 gate，而不是猜测原因。例如 nonfinite output
可以被明确记录，但在没有更多证据时，不应直接命名为“overflow”或“GPU
race”。

## 6. 处置前后的证据都要保留

某些处置会直接修改输出。例如再次 renormalize 可以让概率和恢复为 $1$。
这时必须同时保存：

- pre-mitigation output；
- 原始 mass residual；
- post-mitigation output；
- post-mitigation mass residual；
- 处置幅度；
- 最终 consumer metric。

否则“概率和现在等于 $1$”会覆盖原来的故障症状。

而且

\[
\sum_i\widehat p_i=1
\]

仍然不能证明

\[
\widehat p=p.
\]

renormalization 可以修正共同缩放，却不能恢复已经丢失的 tail mass，也不能
撤销不同分量之间的错误重分配。

## 7. 不同 stage 需要不同处置

把 Softmax 拆回计算图：

\[
z^*
\longrightarrow
\widehat z
\longrightarrow
\widehat q
\longrightarrow
\widehat S
\longrightarrow
\widehat p.
\]

### Input contrast collapse

若 logit difference 在 cast 前后已经消失，应在有损量化前提高精度，或先在
高精度中形成 centered logits。提高后续 denominator accumulator 无法恢复
这个差值。

### Exp overflow 或 tail underflow

subtract-max 控制正指数 overflow；log-sum-exp 或 fused loss 避免先生成零
概率再取 log。若 consumer 必须得到非零 tail probability，则需要更宽的 exp
或 output dtype。

### Sum/reduction rounding

候选处置包括明确的 tree、compensated summation 和更宽 accumulator。选择
依据是 denominator metric、consumer tolerance 与 correct-rounding requirement。

### Division/output rounding

可以提高 reciprocal、division 或 output storage precision。单纯提高
denominator accumulator 不能修复每个分量独立的 division rounding。

所谓“Softmax 数值不稳定”只有被拆到具体 stage 后，才可能连接到有效处置。

## 8. 数值合格不等于工程最优

在 $17/16$ stress case 上，pairwise、Kahan 和 FP64 accumulator 都通过
consumer-tolerance policy；但在 midpoint control 上，fixed pairwise 不能通过
correct-rounding policy。候选集合会随 consumer requirement 改变。

要在它们之间选择，还需要目标硬件上的：

- latency 与 throughput；
- workspace；
- register/shared-memory 使用；
- synchronization；
- accumulator throughput；
- 实际 reduction graph。

CPU Python 原型的耗时不能替代这些证据，也不能从 black-box 库调用的结果
反推内部 tree、atomic order 或 block size。

因此当前只能说：

> 三种方法在 $17/16$ 注册案例上数值合格；成本排序尚未建立。

## 9. 总结

当前已经完成：

- 从一阶误差预算定位到 denominator summation；
- 构造并验证 FP32 power-tail stress case；
- 用 binary 与 decimal midpoint controls 检验 ties-to-even，并分开 source-input
  quantization 与 reduction error；
- 比较 sequential、fixed pairwise、Kahan 与 FP64 accumulator；
- 分离 raw observation、summary、consumer policy 和 assessment；
- 分离 structural failure、accuracy、correct rounding 与 repeatability；
- 建立 failure—consumer—metric—tolerance—mitigation 决策链；
- 明确 CPU 数值原型不能提供 GPU performance evidence。


\[
\boxed{
\text{处置不是 failure 的固有属性，而是由 consumer、evidence 与 cost 共同决定。}
}
\]

首个 stress case 的版本化 artifact，以及后续 boundary controls 的源码与测试，
保存在
[Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax/experiments)。

下一阶段不会直接用 CPU timing 猜测 GPU 成本，而是先寻找只依赖输入与明确
reduction graph 的 predictor，并用受控分布与真实 attention data 做可证伪验证。
预测模型通过以后，再进入目标硬件上的 GPU reduction 与 accuracy-cost frontier。

---

**上一篇：** [Softmax 5：求和顺序怎样吞掉尾部小量](/notes/systems/error-analysis/softmax/note-error-softmax-5-summation-stagnation/)

**返回：** [Softmax：从方向性误差到有限精度](/notes/systems/error-analysis/softmax/)
