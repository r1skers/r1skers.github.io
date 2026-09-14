---
date: '2026-09-13T00:00:00+09:00'
draft: false
title: 'Online Softmax 块内状态：用 (m, ℓ) 接住后续输入'
summary: "从局部最大值与归一化因子出发，推导两块合并与逐元素递推，并沿 Error Atlas 的 BlockFamily、Schedule 和 MergeDump 理解状态怎样进入实际计算。"
description: "解释 Online Softmax 的局部状态、尺度转换及其信息边界，区分实数合并等价与 FP32 求值路径，附可运行的重标定和求和顺序算例。"
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Online Softmax"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 8
math: true
ShowToc: true
softmaxArticle: true
---

[← 返回计算阶段地图 · 块内状态](/notes/systems/error-analysis/softmax/#block-state)

> 由 agent 协助起草并完成技术核对。开发记录按 Error Atlas 已有源码的依赖顺序整理，不补写尚未填写的 explain-back，也不将 CPU 算术模型当作 GPU 实测。本篇只展开 normalizer 状态，输出扩展另见[下游使用](/notes/systems/error-analysis/softmax/downstream-output/)。

## 1. 后面的最大值还不知道，前面的和怎么保留？

常规稳定求值先找到全局最大值 $M$，再形成

\[
\begin{aligned}
\ell&=\sum_i\exp(x_i-M),\\
p_i&=\frac{\exp(x_i-M)}{\ell}.
\end{aligned}
\]

但逐块读取输入时，后面的数据可能带来更大的最大值。前面算过的指数和，不能直接按原来的尺度继续相加。

解决方法是保留两个量：**这份和以哪个最大值为基准，以及在这个基准下的指数和是多少。**

本篇先假设每个块非空，所有 logits 都是有限实数。对块 $B$，定义精确状态

\[
\begin{aligned}
S_B&=(m_B,\ell_B),\\
m_B&=\max_{i\in B}x_i,\\
\ell_B&=\sum_{i\in B}\exp(x_i-m_B).
\end{aligned}
\]

其中 $m_B$ 是尺度信息，$\ell_B$ 是该尺度下的未归一化质量，不是概率和。实数意义下有

\[
1\le\ell_B\le\lvert B\rvert.
\]

因为每项都不超过 $1$，且至少有一项恰好为 $1$。这条实数界不应直接当作任意浮点实现的误差保证。

### 1.1 为什么不能只保存 ℓ？

两个单元素块 $(0)$ 和 $(10)$，局部指数和都是 $1$，但它们在同一个全局尺度下的贡献显然不同。只保存 $\ell_B$，会丢掉比较这两份贡献所需的基准。

形式上，原始指数和满足

\[
\sum_{i\in B}\exp(x_i)=\exp(m_B)\ell_B.
\]

这只用于解释状态的含义，程序不需要真的计算可能溢出的 $\exp(m_B)$。

## 2. 两块合并：先统一尺度，再相加

设 $A,B$ 是互不重叠的非空块，已经得到各自状态。合并后的最大值为

\[
m=\max(m_A,m_B).
\]

把 $A$ 的局部和换到新尺度：

\[
\begin{aligned}
&\sum_{i\in A}e^{x_i-m}\\
&=\sum_{i\in A}e^{x_i-m_A}e^{m_A-m}\\
&=\ell_A e^{m_A-m}.
\end{aligned}
\]

对 $B$ 同理，因此

\[
\boxed{
\begin{aligned}
S_A\oplus S_B&=(m,\ell),\\
\ell&=\ell_A e^{m_A-m}\\
&\quad+\ell_B e^{m_B-m}.
\end{aligned}
}
\]

两个重标定因子都位于 $(0,1]$，至少一个恰好为 $1$。如果新最大值来自 $B$，那么 $B$ 的尺度不变，$A$ 的旧质量缩小到新基准；并不是修改过去的 logits。

### 2.1 一个能手算的例子

取 $A=(0,0)$、$B=(1,1,1)$。局部状态分别为

\[
S_A=(0,2),\qquad S_B=(1,3).
\]

合并得到

\[
S_{A\cup B}=(1,\;2e^{-1}+3).
\]

在全局最大值 $1$ 下重新看原始输入，前两个指数是 $e^{-1}$，后三个都是 $1$，与合并结果一致。

如果直接把局部的 $2$ 和 $3$ 相加，就会得到错误的分母 $5$。错误不在求和精度，而在于把不同尺度下的质量当成同一种量。

## 3. Online 递推只是每次合并一个新块

若新输入只有一个元素 $x$，它的状态是 $(x,1)$。把它与旧状态合并，即得到

\[
\begin{aligned}
m'&=\max(m,x),\\
\ell'&=\ell e^{m-m'}+e^{x-m'}.
\end{aligned}
\]

第一项把旧质量换到新尺度，第二项加入新元素。这里的右侧必须使用**旧的** $m,\ell$，不能先覆盖 $m$ 再计算重标定因子。

Online normalizer 的逐元素递推及并行合并形式已有明确文献来源，见 Milakov 与 Gimelshein 的 [Online normalizer calculation for softmax，§3–3.1](https://arxiv.org/html/1805.02867v2#S3)。本篇关注它怎样对应到 Error Atlas 的数值实验，不主张这是新算法。

### 3.1 只保存两个数，并不意味着所有概率都能立即输出

合并结束后，$(M,\ell)$ 足够给出最终归一化因子；但它没有保存各个 $x_i$。要生成每个 $p_i$，仍然需要重新访问或保留输入，或者保留足够的中间信息。

如果目标是加权输出，可以额外维护分子 $O$，最终计算 $O/\ell$；那已经是 $(m,\ell,O)$ 的扩展，不属于只维护两个数的 normalizer。

### 3.2 初始化与空块要单独处理

对非空序列，可以直接用第一个元素的 $(x_1,1)$，或第一个非空块的状态初始化，不必在数值代码里先构造无穷大。

有些公式把空状态记为 $(-\infty,0)$，但不能因此对两个空状态直接套用合并式：$-\infty-(-\infty)$ 会产生未定义的差。实现需要显式跳过空块或设定专门分支。

本篇对应的 `BlockFamily` 要求至少一个块且每块质量为正；Fraction 路径也不表示无穷大。因此这里没有实现空块、全 mask 或 NaN 的通用处理。

## 4. 开发记录：从叶子状态到一次实际合并

### 4.1 BlockFamily：先把块内误差隔离出去

[online/pilot.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/pilot.py) 的 `BlockFamily` 不接收任意原始 logit 矩阵，而是定义一种受控输入：第 $b$ 块有 $n_b$ 个完全相同的 FP32 logit $m_b$。

在这个特例中，块内所有平移结果都是零，所以

\[
\ell_b=n_b.
\]

`masses` 要求是 $1\le n_b\le2^{24}$ 的整数，确保这些计数及逐个加 $1$ 的中间结果都能精确表示为 FP32。`leaf_ell` 直接把计数转成 Fraction；它不是先运行了一遍通用块内 softmax。

这一步的目的，是让后续树形比较共享相同且精确的叶子，先观察块间合并。一般块内 logits 不相等时，仍要明确其 exp 与 reduction 算法，不能继续用元素个数代替 $\ell_b$。

### 4.2 Schedule：先规定谁与谁合并

[online/schedules.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/schedules.py) 只描述树的连接，不计算指数或质量。若有 $N$ 个叶子：

- 叶子索引为 $0,\ldots,N-1$。
- 第 $k$ 次合并的结果索引为 $N+k$。
- `nodes[k]` 存两个子节点索引，两个子节点必须已经算好。

例如四个块的顺序链是 `((0,1), (4,2), (5,3))`，相邻配对树是 `((0,1), (2,3), (4,5))`。两者最后的根索引都是 $6$，但求值路径不同。

`check_schedule` 检查叶子数、内部节点数、子节点先于父节点以及子节点不重复使用。一个叶子没有内部合并，根就是叶子 $0$。

### 4.3 merge_reduce：让实数公式落到 FP32 运算

[online/merge.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/merge.py) 的 `merge_reduce` 按 schedule 逐节点读取子状态，再执行：

| 步骤 | 代码中的量 | 实际含义 |
| --- | --- | --- |
| 选择基准 | `m_v = max(m_a, m_b)` | 在给定有限 FP32 值中选最大值 |
| 计算差值 | `fp32_sub(m_a, m_v)` | 差值经过 FP32 舍入 |
| 计算权重 | `exp_impl(delta_a)` | 对实际差值调用指定的 exp 实现 |
| 合并质量 | `fp32_mul`、`fp32_add`，或 `fp32_fma` | 按规定路径得到新质量 |

右孩子也计算自己的差值和权重。默认 `exp_impl` 是 CPU 的 `correctly_rounded_exp`，不是对某个 GPU `expf` 的实测结论。

separate 路径先分别舍入两个乘积，再舍入它们的和。FMA 路径利用至少一侧权重为 $1$，把另一侧乘法与加法融合为一次舍入；代码先检查左权重是否为 $1$，再检查右权重。

这里已从精确的 $\ell_v$ 转到实际的 $\hat\ell_v$。默认算术使用 FP32、RN-even 和渐进下溢；即使输入有限，极端差值或中间量也可能超出有限 FP32 范围，不能把本模型当成覆盖所有异常输入的生产 kernel。

### 4.4 MergeDump：状态是两个量，审计记录不止两个量

算法在一个节点上需要的 normalizer 状态是 $(m,\hat\ell)$；`MergeDump` 则为了重放和核对，保留整次运行的信息。

每个内部节点记录六个 FP32 数：`node_max`、左右 `gap`、左右 `weight` 和 `node_ell`，另有叶子、schedule 与 FMA 设置。

保存 gap 和 weight 是为了分清“差值怎样得到”与“exp 返回了什么”；精确残差、路径权重乘积等分析量则不在 dump 里，之后再从已有记录推导。

`is_well_formed` 检查结构与 FP32 可表示性，**不证明数值确实按递推算出**。因此审计还必须重算节点的 max、gap、weight 和合并结果，不能只看这个函数返回 `True`。

### 4.5 把手算的两个块送进代码

以下例子可在 Error Atlas 的 `topics/softmax/experiments` 目录运行：

~~~python
from fractions import Fraction as F
from online.pilot import BlockFamily
from online.schedules import sequential_chain, balanced_pairwise
from online.merge import merge_reduce
from online.fp32_exp import correctly_rounded_exp
from online.fp32_signed import round_to_fp32

family = BlockFamily((F(0), F(1)), (2, 3))
tree = sequential_chain(2)
dump = merge_reduce(family.leaf_max, family.leaf_ell, tree)

assert dump.node_max == (F(1),)
assert dump.gap_left == (F(-1),)
assert dump.gap_right == (F(0),)
w = correctly_rounded_exp(F(-1))
assert dump.weight_left == (w,)
assert dump.weight_right == (F(1),)
expected = round_to_fp32(round_to_fp32(2 * w) + 3)
assert dump.ell_at(tree.root) == expected
~~~

`expected` 检查的是规定好的 separate 算术路径，不是实数真值 $2e^{-1}+3$。不能因为这条断言通过，就说 exp 和归一化因子没有误差。

## 5. 实数合并等价，不代表浮点结果与树形无关

对互不重叠的块，精确合并得到的总是并集的最大值与该最大值尺度下的指数和。因此实数意义下，改变括号不会改变最终状态；这是从状态定义得到的结合性，不依赖某个实验。

浮点实现则在每次合并中新增舍入。甚至不需要让最大值变化，就能看到差异。

继续使用上面的导入，取四个最大值都为零的块：

~~~python
family = BlockFamily((F(0),) * 4, (2**24, 1, 1, 2))
exact = F(sum(family.masses))
assert exact == 2**24 + 4

for fused in (False, True):
    chain_tree = sequential_chain(4)
    pair_tree = balanced_pairwise(4)
    chain = merge_reduce(family.leaf_max, family.leaf_ell,
                         chain_tree, fused=fused)
    pair = merge_reduce(family.leaf_max, family.leaf_ell,
                        pair_tree, fused=fused)
    assert chain.ell_at(chain_tree.root) == 2**24 + 2
    assert pair.ell_at(pair_tree.root) == exact
~~~

这里所有 gap 都是零、所有 exp 权重都是 $1$，合并退化为普通求和。在 $2^{24}$ 附近，向上相邻 FP32 数的间距为 $2$：

- 顺序链先后加两个 $1$，两次都处在中点并舍回 $2^{24}$，最后加 $2$。
- 相邻配对先算 $2^{24}+1$ 和 $1+2$，分别得到 $2^{24}$ 和 $3$；最后的 $2^{24}+3$ 又在中点，ties-to-even 这次舍到 $2^{24}+4$。

这个构造只说明树形可以改变结果，不能说明 balanced 对任意输入都更准。它也提醒我们：观察到 online 链与树不同，并不足以归因于重标定的新机制，因为普通求和已经能产生差异。

## 6. 技术审计与下一步

本篇以 Error Atlas 的 `17ffd2a` 快照为代码依据，核对重点是：

1. 精确状态始终带着自己的最大值尺度；两块互不重叠，合并前先换基准。
2. `BlockFamily` 的 $\ell_b=n_b$ 只用于等值 logits 的受控块，不冒充通用块内求值。
3. dump 的结构有效性与实际算术自洽性分开检查；CPU 路径不冒充 GPU 实现。
4. 两个可运行例子分别检查重标定路径与无重标定时的树形差异，不把模型一致性当成实数精确性。

[test_online_merge.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_merge.py)、[test_online_schedules.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_schedules.py) 与 [test_online_pilot.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_pilot.py) 的 55 项测试已在起草时运行通过。两个正文例子也已跑通；另以 90 位 Decimal 运算对 100 组输入检查块合并、结合顺序和逐元素递推，并检查空块拒绝、质量上界、单叶根节点及结构有效但算术错误的 dump。这些是限定实现的技术检查，不是 GPU 性能或完整输入域上的正确性证明。

下一篇进入[重标定与合并](/notes/systems/error-analysis/softmax/#merge)：固定实际算出的权重，分清参考值与每个节点新增的舍入，再讨论这些误差怎样传到根。合并拓扑的实验比较留给后续，不在这一篇提前下结论。

原论文的阅读笔记仍保留在 [Online Softmax 原始推导](/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/)，侧重算法背景与访存；本篇作为数值误差地图的状态入口。

返回计算阶段地图：[块内状态](/notes/systems/error-analysis/softmax/#block-state) · [重标定与合并](/notes/systems/error-analysis/softmax/#merge)
