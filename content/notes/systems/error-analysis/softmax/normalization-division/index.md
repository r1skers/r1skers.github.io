---
date: '2026-09-12T00:00:00+09:00'
draft: false
title: 'Softmax 归一化与除法：最后一次舍入'
summary: "固定实际分子与分母，区分精确比值、除法舍入和输出存储；沿 Error Atlas 的输出实现记录最后两步新增的误差。"
description: "从三等分算例出发，分析直接除法、倒数乘法与 FP16/BF16 存储，并对照 finish_output、ComputedOutput 和 storage_cast 的实现。"
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Division"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 6
math: true
ShowToc: true
softmaxArticle: true
---

[← 返回计算阶段地图 · 归一化与除法](/notes/systems/error-analysis/softmax/#division)

> 由 agent 协助起草并完成技术核对。开发记录依据 Error Atlas 的已有实现整理；常规概率输出与 online 标量输出的对应关系另行标明，不将算术模型当成 GPU 指令实测。

## 1. 给定分子分母的背景

[分母归约](/notes/systems/error-analysis/softmax/denominator-reduction/)最后停在实际算出的分母 $\hat L$。现在进一步固定它与各个分子 $\hat q_i$，不再改变 exp 或求和方法。

假设 $\hat q_i$ 是有限非负 FP32 数，$\hat L$ 是有限正 FP32 数。局部参考为

\[
r_i=\frac{\hat q_i}{\hat L}.
\]

这里的除法按实数精确执行。$r_i$ 不一定等于原问题的精确概率，其分量和也不一定为 $1$，因为上游误差已经包含在这组操作数中。

本篇继续比较：

| 对象 | 记号 | 含义 |
| --- | --- | --- |
| 精确比值 | $r_i$ | 实际分子除以实际分母的精确结果 |
| FP32 除法输出 | $\hat p_i$ | 对该比值执行指定的除法实现 |
| 最终存储值 | $\tilde p_i$ | 将 $\hat p_i$ 转成输出格式后的值 |

先讨论最直观的路径：精确比值按 round-to-nearest、ties-to-even **舍入一次**到 FP32，保留次正规数，且不溢出，即

\[
\hat p_i=Q_{32}(r_i).
\]

然后再区分倒数乘法与后续存储转换。

## 2. 前面完全精确，最后也可能舍入

取三个相等的 logits。平移后都是零，指数都是 $1$，分母 $3$ 也能精确表示。最后一步仍需要计算

\[
r_1=r_2=r_3=\frac13.
\]

$1/3$ 无法用有限位二进制精确表示。正确舍入的 FP32 结果为

\[
\hat p_i=\frac{11184811}{33554432},
\qquad
d_i=\hat p_i-\frac13
=\frac{1}{100663296}.
\]

因此，三个存储结果的**精确和**为

\[
\sum_i\hat p_i=1+2^{-25}.
\]

exp 和分母归约的计算都没有错，偏差来自最后的除法舍入。

## 3. 最后一步的观察

定义绝对残差

\[
d_i=\hat p_i-r_i.
\]

它对 $r_i=0$ 也有定义。若 $r_i>0$，还可以定义相对误差

\[
\delta_i=\frac{d_i}{r_i},
\qquad
\hat p_i=r_i(1+\delta_i).
\]

当精确比值处于 FP32 正规范围、且采用上述正确舍入模型时，$|\delta_i|\le u$，其中 $u=2^{-24}$。这不是对任意快速除法实现的默认保证。

次正规区要改看绝对误差。以 $h=2^{-149}$ 表示 FP32 最小正次正规数，若

\[
\hat q_i=h,\qquad \hat L=2,
\]

则精确比值为 $h/2$，ties-to-even 将它舍为零。**指数项原本非零，也可能在除法阶段才归零。** 此时绝对误差很小，分量相对误差却为 $-1$，不能继续套用 $O(u)$ 小相对误差模型。

与上一阶段衔接时，令

\[
L_q=\sum_j\hat q_j,\qquad
\eta=\frac{\hat L-L_q}{L_q},\qquad
p_i^{(e)}=\frac{\hat q_i}{L_q}.
\]

对非零分量，

\[
\frac{\hat p_i}{p_i^{(e)}}
=\frac{1+\delta_i}{1+\eta}.
\]

分母归约提供共同的因子，除法再给每个分量加入自己的舍入。小误差下相对变化才近似为 $-\eta+\delta_i$。这里不再重新推导 exp 的预算，也不把 $d_i$ 当作相对原始 Softmax 真值的总误差。

## 4. 开发记录：精确比值之后，只调用一次舍入

### 4.1 代码位置

常规原型 [fp32_softmax_summation.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/fp32_softmax_summation.py) 的末尾是：

~~~python
denominator = summation(exponentials)
probabilities = exponentials / denominator
~~~

它保留了各阶段输出，便于冻结实际操作数。但这两行本身没有保存精确比值和除法残差，也没有证明目标 GPU 使用了哪种指令。

更明确的逐步记账在 [online/output_reference.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_reference.py) 中。这里原本计算的是标量加权输出 $\hat O/\hat\ell$，并非 materialized Softmax 的整组概率：

| 本篇的常规概率 | online 标量输出 | 共通的最后一步 |
| --- | --- | --- |
| 非负分子 $\hat q_i$ | 可有正负号的分子 $\hat O$ | 固定实际分子 |
| 实际分母 $\hat L>0$ | 实际分母 $\hat\ell>0$ | 固定实际分母 |
| 每个概率分量 | 一个标量结果 | 精确比值，再执行指定舍入 |

### 4.2 finish_output：先取实际状态，再做最后一次舍入

`finish_output` 先调用 `propagate_numerator` 沿已有 merge dump 计算分子，取根节点的分子与分母。只有一个叶子时，没有内部节点，直接取叶子分子。

因此整个函数不仅有除法；本篇分析的阶段边界从分子、分母已取出之后开始：

~~~python
if denominator <= 0:
    raise ValueError("Output division requires a positive computed denominator")
ratio = numerator / denominator
value = round_to_fp32(ratio)
return ComputedOutput(numerator, denominator, ratio, value, value - ratio)
~~~

两个操作数都是 Fraction，所以 `ratio` 是精确有理数。`round_to_fp32` 接收它，再返回舍入后的数值；`value - ratio` 才是最后这一步新增的残差。

代码使用 [online/fp32_signed.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/fp32_signed.py) 中的有符号舍入函数：按绝对值确定格点、做 RN-even 舍入，最后恢复符号。延续上一篇 oracle 的网格逻辑，不专门实现长除法来产生精确比值。

### 4.3 ComputedOutput：把局部参考与最终结果分开保存

`ComputedOutput` 保留五个字段：

| 字段 | 含义 |
| --- | --- |
| `numerator` | 实际计算出的分子 |
| `denominator` | 实际计算出的分母 |
| `before_division_rounding` | 两者的精确比值 |
| `value` | 最后一次 FP32 舍入的结果 |
| `division_residual` | `value - before_division_rounding` |

这样，分子或分母本来已有的偏差不会再次计入 `division_residual`。

复现 $1/3$ 时，可以使用只有一个叶子的 dump，让内部传播为空。在 Error Atlas 的 `topics/softmax/experiments` 目录下运行：

~~~python
from fractions import Fraction as F
from online.merge import merge_reduce
from online.schedules import sequential_chain
from online.output_reference import finish_output

dump = merge_reduce((F(0),), (F(3),), sequential_chain(1))
computed = finish_output(dump, (F(1),))

assert computed.before_division_rounding == F(1, 3)
assert computed.value == F(11184811, 33554432)
assert computed.division_residual == F(1, 100663296)
~~~

这是隔离除法的构造，不是在声称该 dump 就是三个类别的完整 Softmax 执行轨迹。改用分子 $-1$ 可以检查有符号舍入；改用零分母则应触发拒绝条件。

## 5. 先求倒数再乘，不是同一条计算路径

若改成

\[
\hat t=Q_{32}(1/\hat L),\qquad
\hat p_i^{(\mathrm{rm})}=Q_{32}(\hat q_i\hat t),
\]

则有两处舍入：共同倒数一次，每个乘法各一次。即使倒数与乘法都正确舍入，也不保证结果等于 $Q_{32}(\hat q_i/\hat L)$。

一个隔离算例是 $\hat q_i=5/64$、$\hat L=3$：

| 路径 | FP32 输出的精确值 |
| --- | --- |
| 直接除法，舍入一次 | $13981013/536870912$ |
| FP32 倒数，再 FP32 乘法 | $13981014/536870912$ |

两个结果相差该位置的一个 FP32 间距。可以用已有舍入函数核对：

~~~python
from fractions import Fraction as F
from online.fp32_signed import round_to_fp32

q, denominator = F(5, 64), F(3)
direct = round_to_fp32(q / denominator)
via_reciprocal = round_to_fp32(q * round_to_fp32(1 / denominator))
assert direct != via_reciprocal
~~~

这里构造的是两个规定好的算术模型，不是仓库已有的 GPU 除法基准。`finish_output` 只实现直接比值舍入，没有实现这条倒数乘法路径。

在没有下溢等结构性问题时，若写成

\[
\hat t=\frac{1}{\hat L}(1+\alpha),\qquad
\hat p_i^{(\mathrm{rm})}
=\hat q_i\hat t(1+\beta_i),
\]

对 $r_i>0$ 的分量，相对局部参考 $r_i$ 就有

\[
\frac{\hat p_i^{(\mathrm{rm})}}{r_i}
=(1+\alpha)(1+\beta_i).
\]

$r_i=0$ 时不使用这个相对误差比值，而用 $\hat p_i^{(\mathrm{rm})}-r_i$ 记录绝对残差。

$\alpha$ 是所有分量共享的倒数误差，$\beta_i$ 是局部乘法误差。它们应按实际路径记账，不能仅凭源代码中的一个斜杠就认定程序只做了一次舍入。

## 6. storage_cast：从实际 FP32 结果出发

除法结束后，若结果还要存成 FP16 或 BF16，应继续定义

\[
\tilde p_i=Q_T(\hat p_i),\qquad
c_i=\tilde p_i-\hat p_i.
\]

相对本篇局部参考，误差精确拆成

\[
\boxed{
\tilde p_i-r_i
=\underbrace{\hat p_i-r_i}_{d_i}
+\underbrace{\tilde p_i-\hat p_i}_{c_i}.
}
\]

这是有符号的相加，不代表两项绝对值必须同向累积。也不能为了方便，直接计算 $Q_T(r_i)$ 代替真实的 $Q_T(Q_{32}(r_i))$；这会跳过 FP32 中间结果，两次舍入一般不等价于一次。

### 6.1 三种存储分支

[online/output_measure.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_measure.py) 的 `storage_cast` 先要求输入已经是 FP32 且位于 $[-2,2]$，然后按格式分支：

- **FP32**：直接返回原值与位模式，没有新增精度转换。
- **FP16**：用 `struct.pack(">e", float(value))` 转成 binary16，再解码为 Fraction。
- **BF16**：读取 FP32 位模式，按被丢弃的低位与保留位奇偶性舍入。

FP32 数可以精确转成 Python 的 binary64 float，所以 FP16 分支中的这次提升没有先损失信息；[struct 文档](https://docs.python.org/3/library/struct.html#format-characters)规定 `e` 表示 IEEE binary16。BF16 分支的核心是：

~~~python
upper = (bits + 0x7fff + ((bits >> 16) & 1)) >> 16
~~~

低 16 位不足半格时不进位，超过半格时进位；恰好等于 `0x8000` 时，由保留部分的最低位决定是否进位，实现 ties-to-even。它不是直接截掉低位。

这段代码的合同是渐进下溢，并把零统一记录为正零；它只服务于上述受限范围，不是通用的溢出、NaN 和有符号零转换器。

### 6.2 同一个三分之一，经过不同存储格式

继续使用 §4 的 `computed`：

~~~python
from online.output_measure import storage_cast

for dtype in ("fp32", "fp16", "bf16"):
    stored, bits = storage_cast(computed.value, dtype)
    cast_residual = stored - computed.value
    assert stored - F(1, 3) == computed.division_residual + cast_residual
    print(dtype, stored, bits, stored - F(1, 3))
~~~

对应结果为：

| 存储格式 | 实际存储值 | 位模式 | 存储值减去 $1/3$ |
| --- | --- | --- | --- |
| FP32 | $11184811/33554432$ | `3eaaaaab` | $1/100663296$ |
| FP16 | $1365/4096$ | `3555` | $-1/12288$ |
| BF16 | $171/512$ | `3eab` | $1/1536$ |

这是单个构造的结果，不是格式在所有输入上的误差排名。FP16 存储误差在这里改变了总误差的符号：除法与存储残差的绝对值之和只能给出总误差绝对值的上界，不能还原实际的有符号总误差。

模块的 `record` 从 `computed.value` 出发执行各格式转换，并保存 `division_residual`；但其 `formats.signed_error` 比较的是传入的**完整输出参考区间**，不是这里的 $c_i$。若要单独看存储误差，仍应计算 `stored - computed.value`。不要因字段都叫“error”就把局部误差与端到端误差混在一起。

## 7. 验证与本篇边界

现有 [test_online_output_reference.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_reference.py) 检查负的三分之一、常数输出和非正分母拒绝；其中其他区间参考测试属于 online 输出真值的构造，不是普通除法的额外步骤。

[test_online_output_measure.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_measure.py) 则检查 FP16 对照、BF16 中点及邻点、次正规归零和存储输入范围。这些是特定实现的工程检查，不是对任意 GPU、编译选项或输入全域的精度保证。

审计本篇时，先确认三件事：

1. 除法残差是否始终相对于实际分子、分母的精确比值？
2. 是否区分一次除法舍入与倒数乘法的两步模型？
3. 存储转换是否从实际 FP32 输出出发，而不是从数学真值重新舍入？

本篇没有把 online 的分子传播或完整参考区间推导重新写一遍，也没有评估快速除法的吞吐量。到这里，常规求值路径的输出已经落到指定存储格式。下一阶段的[下游使用者](/notes/systems/error-analysis/softmax/#consumer)才讨论这些差异是否影响 loss、概率比值或加权输出；“误差可测”不等于“对所有用途都有害”。

返回计算阶段地图：[归一化与除法](/notes/systems/error-analysis/softmax/#division) · [下游使用者](/notes/systems/error-analysis/softmax/#consumer)
