---
date: '2026-09-09T00:00:00+09:00'
draft: false
title: 'Softmax 分母归约：累加误差从哪里来'
summary: "固定指数阶段实际输出的数，追踪每次加法的舍入、总误差的量化，以及求和顺序对分母和概率的影响。"
description: "从 (1,u,u) 的最小算例出发，区分精确和与正确舍入目标，用局部残差和树深误差界理解 Softmax 分母归约。"
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Summation"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 5
math: true
ShowToc: true
softmaxArticle: true
---

[← 返回计算阶段地图 · 分母归约](/notes/systems/error-analysis/softmax/#reduction)

> 本篇只追踪加法新增的误差。§4 以 fp32_oracle.py 为主线整理实现说明，由 agent 协助起草，经作者阅读修订与技术核对。

## 1. 固定指数输出

[指数篇](/notes/systems/error-analysis/softmax/exponentiation/)讨论了同一组 exp 误差如何进入分子和分母，但其中的分母求和仍然是精确的。现在固定 exp 实际返回的 FP32 数 $\hat q_i$，只把求和换成浮点计算。

假设这些数有限、非负且不全为零。需要分清：

| 对象 | 记号 | 含义 |
| --- | --- | --- |
| 精确和 | $L_q=\sum_i\hat q_i$ | 对已经存储的数精确相加 |
| 正确舍入目标 | $L_q^\star=Q_{32}(L_q)$ | 精确和一次舍入到 FP32 |
| 归约输出 | $\hat L_G=\operatorname{reduce}_G(\hat q)$ | 沿具体加法树 $G$ 逐步计算的结果 |

本阶段的误差定义为

\[
E_G=\hat L_G-L_q,\qquad
\eta_G=\frac{E_G}{L_q}.
\]

参考值是 $\sum_i\hat q_i$，不是 $\sum_i e^{s_i}$。exp 已经产生的偏差属于上一阶段，不能再次算给归约。

这里也不是“分子和分母各调用了一次 exp”：本篇假设分子使用 $\hat q_i$，分母累加的是**同一组** $\hat q_i$。分母新增的误差来自加法。

以下默认每个加法都在 FP32 中按 round-to-nearest、ties-to-even 舍入，保留次正规数，且中间结果不溢出。混合精度、额外输出转换和 FTZ 需要另写计算路径。

## 2. 一个非零项，为什么加进去没有变化

令

\[
u=2^{-24},\qquad
\operatorname{ulp}(1)=2^{-23}=2u.
\]

$1+u$ 恰好在 $1$ 与下一个 FP32 数之间。ties-to-even 选择 $1$，所以

\[
\operatorname{RN}_{32}(1+u)=1.
\]

$u$ 本身完全可表示，也没有下溢；丢失发生在它与 $1$ 相加时。

现在把归约输入固定为

\[
\hat q=(1,u,u),\qquad L_q=1+2u.
\]

这是直接构造的归约输入，不要求某个 exp 实现恰好生成它。保持输入不变，只改括号：

| 加法顺序 | 第一步 | 最终结果 | $E_G$ |
| --- | --- | --- | --- |
| 先加大项：$(1+u)+u$ | $1+u$ 舍为 $1$ | $1$ | $-2u$ |
| 先合并小项：$1+(u+u)$ | $u+u=2u$，精确 | $1+2u$ | $0$ |

第一条路径两次都把半个 ULP 舍掉；第二条路径先让两个小项合成一个完整 ULP，最终可以进入结果。

因此，**尾项非零不等于它能改变部分和**。也不是正数相加必然低估：舍入可以向上或向下；本例的负误差来自具体的中点位置和 ties-to-even 规则。

## 3. 把每次加法丢掉的量记下来

先看顺序求和。令

\[
\hat a_1=\hat q_1,\qquad
\hat a_k=\operatorname{RN}_{32}(\hat a_{k-1}+\hat q_k).
\]

定义第 $k$ 次加法的残差

\[
\rho_k=\hat a_k-(\hat a_{k-1}+\hat q_k).
\]

右边括号内是**实际操作数的精确和**；$\rho_k$ 只记这一步新增的舍入，不把之前的错误重复算进来。残差的符号约定是“计算值减精确值”。

把定义改写为

\[
\hat a_k=\hat a_{k-1}+\hat q_k+\rho_k,
\]

逐层代回去，就得到

\[
\boxed{
E_{\mathrm{seq}}
=\hat a_n-\sum_i\hat q_i
=\sum_{k=2}^{n}\rho_k.
}
\]

这是精确恒等式，不是一阶近似。在 $(1,u,u)$ 的第一条路径中，两次残差都是 $-u$，总误差就是 $-2u$。

二叉加法树也一样：对每个内部节点，以两个**实际子节点输出**的精确和定义残差。把整棵树展开，中间项消去，留下

\[
\boxed{
E_G=\sum_{v\in\operatorname{internal}(G)}\rho_v.
}
\]

因此还可以记录

\[
|E_G|\le\sum_v|\rho_v|.
\]

有符号和给出实际误差；绝对值之和则忽略了正负抵消。二者回答的问题不同。

要注意，换一棵树会改变节点收到的部分和，也会改变各个 $\rho_v$。残差并不是每个输入自带、与求和顺序无关的标签。用同一低精度加法重新计算残差括号里的和，也可能把残差算成零；审计时需要精确算术或另有保证的误差提取方法。

## 4. 开发记录：把舍入规则写成可检查的程序

接下来落实成程序。

以 [rewrite/fp32_oracle.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/rewrite/fp32_oracle.py) 为主线。三个核心函数已学习并重写，以下依据当前实现整理开发说明，按依赖关系展开，不代表历史提交或调试发生的先后顺序。

### 4.1 模拟 FP32

oracle 接收已经存储的非负 FP32 叶子与一棵明确的加法树，输出各节点的 FP32 数值以及舍入残差。不负责输入量化，也不重新执行 exp。

内部使用 `Fraction`，是为了精确保存叶子、节点值和残差。**Fraction 负责记账，`round_to_fp32` 负责施加 FP32 舍入规则。** 如果一直用 Fraction 加到根节点、最后才舍入一次，算出来的是正确舍入目标，而不是实际加法树的结果。

大致如下：

~~~python
from fractions import Fraction

u = Fraction(1, 2**24)
values = (Fraction(1), u, u)
~~~

这三个数都可精确表示为 FP32。若输入来自已有的 NumPy FP32 数，可以先精确转成 Python float，再用 `Fraction.from_float` 保存其值；不能从量化前的十进制文本重新构造另一个参考输入。

### 4.2 round_to_fp32：把精确值放回 FP32 网格

这个函数接收非负有理数，返回舍入后的数值，返回类型仍然是 Fraction。不调用硬件浮点加法，不生成 NumPy FP32 对象。

实现先拒绝负数、单独返回零。对正数，需要找到

\[
e=\lfloor\log_2(\mathrm{value})\rfloor.
\]

代码没有调用浮点 `log2`，而是利用分子、分母的二进制位数估计，再做一次精确比较：

~~~python
e = value.numerator.bit_length() - value.denominator.bit_length()

def pow2(k: int) -> Fraction:
    return Fraction(1 << k, 1) if k >= 0 else Fraction(1, 1 << -k)

if value < pow2(e):
    e -= 1
~~~

位数差给出的候选指数至多高一档，因此这次校正足够。`pow2` 在这里也只做整数与有理数运算，不提前引入近似值。

确定数量级后，选择格点间距：

~~~python
if e < -126:
    quantum = pow2(-149)
else:
    quantum = pow2(e - 23)
~~~

正规区的间距随数量级改变；次正规区则固定在 $2^{-149}$。随后将原值换成格点编号，取最近的整数编号，再乘回间距：

~~~python
s = value / quantum
s_rounded = round(s)
result = Fraction(s_rounded) * quantum
~~~

 `s` 是函数内部的格点坐标，[Python 的 Fraction 文档](https://docs.python.org/3/library/fractions.html#fractions.Fraction.__round__)规定，无第二参数的 `round` 返回最近整数，中点时取偶。因此使用的是 **Fraction 上精确的中点判断**，而不是先把 `s` 转成 float。

以 $1+u$ 为例，间距是 $2u$，格点编号为 $2^{23}+1/2$；下端编号为偶数，因此返回 $1$。若编号舍入后发生进位，乘回间距就自然进入下一个 binade。跨 binade 本身不是溢出；函数最后检查：

~~~python
if result > MAX_FINITE:
    raise OverflowError("Rounded result exceeds maximum finite FP32 value.")
~~~

这里比较的是舍入后的结果。模块对溢出采用抛异常的合同，不模拟返回无穷大、异常标志或其他舍入模式。

### 4.3 is_stored_fp32：入口检查

舍入函数允许接收任意非负有理数，但归约的叶子必须已经是 FP32。`is_stored_fp32` 就是两者之间的入口检查：

~~~python
if value < 0:
    return False
try:
    return round_to_fp32(value) == value
except OverflowError:
    return False
~~~

如果舍入会改变数值，说明它不是一个已经存储的 FP32 数。例如 $1/3$ 会被拒绝，$u=2^{-24}$ 会被接受。函数没有把 $1/3$ 自动转换成一个邻近 FP32 数再送入树里；这样，归约误差的参考对象才能保持不变。

这里默认传入 Fraction。类型注解不是完整的运行时类型校验，也不能把“检查 stored FP32”理解成已经处理了任意 Python 对象、NaN 和无穷输入。

### 4.4 Tree：把括号位置变成数据

`Tree` 用两个字段描述一棵树：`leaf_count` 是叶子数，`nodes` 是内部节点的左右孩子编号。叶子从 $0$ 开始编号，第 $k$ 个内部节点的编号是 `leaf_count + k`。

对于三个叶子，内部节点依次编号为 $3、4$：

~~~python
from rewrite.fp32_oracle import Tree

head_first = Tree(leaf_count=3, nodes=((0, 1), (3, 2)))
tail_first = Tree(leaf_count=3, nodes=((1, 2), (0, 3)))
~~~

第一棵树先把叶子 0、1 相加并舍入，结果存入节点 3；再把节点 3 的输出与叶子 2 相加并舍入，结果存入节点 4。第二棵树先把叶子 1、2 相加并舍入，结果存入节点 3；再把叶子 0 与节点 3 的输出相加并舍入，结果存入节点 4。两者使用同一组叶子，只改变依赖关系。

内部节点按列表顺序执行，因此只能引用叶子或更早的内部节点；最后一个内部节点是根。仅有一个叶子时，没有内部加法，根就是该叶子。

**边界：** 重写版 `Tree` 只是数据容器，不完整检查树的合法性。本文假设每个非根节点恰好被使用一次、没有遗漏或重复叶子；否则不能直接使用残差和恒等式。旧版 [BinaryReductionGraph](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/summation_graph_predictor.py) 有对应的结构校验，不能把旧版的保证自动算给重写版。

### 4.5 reduce_tree：做三件事

`reduce_tree` 先检查叶子数量与可表示性，然后沿 `tree.nodes` 依次求值。孩子编号小于 `leaf_count` 时，从原始叶子中取值；否则，从已经计算出的 `node_values` 中取值。

拿到两个孩子后，核心就是：

~~~python
exact_sum = left_value + right_value
rounded_sum = round_to_fp32(exact_sum)
delta = rounded_sum - exact_sum

node_values.append(rounded_sum)
deltas.append(delta)
~~~

这里必须分清三个对象：

- `exact_sum`：两个**实际孩子输出**的精确和，不是这棵子树全部叶子的精确和。
- `rounded_sum`：本节点的 FP32 数值；下一层继续使用它。
- `delta`：计算值减本次精确和，对应正文中的 $\rho_v$。

如果下一层误用了 `exact_sum`，就跳过了该有的舍入；如果残差改成 `exact_sum - rounded_sum`，就改变了整篇的符号约定。

所有节点执行后，代码另外计算原始叶子的精确和，用根节点输出减去它得到总误差。只有一个叶子、没有内部节点时，直接返回该叶子的值，总误差为零。

### 4.6 Trace：结果与解释

`Trace` 保存最终结果，还保留检查计算路径所需的信息：

| 字段 | 对应的观察量 |
| --- | --- |
| `values` | 实际收到的叶子值 |
| `node_values` | 各内部节点舍入后的输出 |
| `deltas` | 各内部节点新增的有符号残差 |
| `exact_sum` | 叶子精确和 $L_q$ |
| `error` | 根节点输出减 $L_q$ |

下面的例子在 Error Atlas 的 `topics/softmax/experiments` 目录下运行：

~~~python
from fractions import Fraction
from rewrite.fp32_oracle import Tree, reduce_tree, round_to_fp32

u = Fraction(1, 2**24)
values = (Fraction(1), u, u)
trees = {
    "head-first": Tree(3, ((0, 1), (3, 2))),
    "tail-first": Tree(3, ((1, 2), (0, 3))),
}

for name, tree in trees.items():
    trace = reduce_tree(values, tree)
    root = trace.node_values[-1]  # 本例两棵树均有内部节点
    target = round_to_fp32(trace.exact_sum)
    assert trace.error == sum(trace.deltas, Fraction(0))
    print(name, trace.node_values, trace.deltas, trace.error, root == target)
~~~

输出中的分数可整理为：

| 路径 | 节点输出 | 节点残差 | 总误差 | 命中正确舍入目标 |
| --- | --- | --- | --- | --- |
| head-first | $(1,1)$ | $(-u,-u)$ | $-2u$ | 否 |
| tail-first | $(2u,1+2u)$ | $(0,0)$ | $0$ | 是 |

这就是 §2 的算例在代码中的完整路径。`reduce_tree` 本身没有执行上面的残差和断言；断言由示例和测试负责。`Trace` 也没有单独存相对误差和正确舍入标志，需要由调用方用既有字段计算。若叶子全为零，oracle 可以返回零结果，但此时相对误差 $E_G/L_q$ 未定义，不属于本文的非零分母场景。

### 4.7 验证

开发记录最后需要分开三层检查，而不是只留一个“通过”。

第一层是**内部恒等式**：检查 `trace.error == sum(trace.deltas)`。它能发现记账不一致，但不能独立证明舍入规则正确——一个使用错误舍入规则的程序，也可能保持同样的望远镜消去结构。

第二层是**实现对照**：[重写测试](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_rewrite_fp32_oracle.py)包含手选舍入边界，并逐节点比较重写版与旧 oracle 的输出、残差和总误差。另一个[硬件差分测试](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_oracle_hardware_differential.py)将旧 oracle 与同一棵树上的 NumPy FP32 加法比较。二者是不同的对照关系，不应写成重写测试直接完成了全部硬件验证。

第三层是**结果准确性**：比较根节点输出与 $Q_{32}(L_q)$。模拟器准确复现了一个不正确舍入的结果，仍然可能在第二层通过、第三层失败；head-first 算例正是这种情况。

差分测试要在双方共同支持的范围内解释。旧 oracle 在精确待舍入值超过最大有限 FP32 时便拒绝；重写版则检查舍入后的结果。两者在溢出边缘的合同并不完全相同，不能把样本上的一致扩展成所有有理数输入上的等价。

## 5. 没有逐节点记录时，怎样给出误差界

前面的残差恒等式与 oracle 回答“这棵树的误差是多少”。如果还不知道具体残差，可以先用加法次数和树深给一个最坏界。

采用标准的单次加法相对误差模型

\[
\operatorname{fl}(a+b)=(a+b)(1+\theta),
\qquad |\theta|\le u.
\]

在本篇同格式、非负输入、渐进下溢且不溢出的设置中，次正规范围内的和若出现，仍落在 FP32 次正规网格上，可以精确表示；不能把这一点直接推广到 FTZ。

顺序求和中，最早进入的项最多经过 $n-1$ 次加法。定义

\[
\gamma_d=\frac{du}{1-du},\qquad du\lt1.
\]

每个输入沿路径累积至多 $d$ 个舍入因子，得到

\[
\hat L_G=\sum_i\hat q_i(1+\xi_i),
\qquad |\xi_i|\le\gamma_d.
\]

由于输入非负，$\sum_i|\hat q_i|=L_q$，所以

\[
|E_G|\le\gamma_d L_q,\qquad
|\eta_G|\le\gamma_d.
\]

对顺序求和可取 $d=n-1$；对最大叶到根深度为 $d$ 的二叉加法树，使用对应的 $d$。平衡树可将它降至 $\lceil\log_2 n\rceil$。这是经典求和误差分析的路径因子界，见 [Higham：The Accuracy of Floating Point Summation](https://nhigham.com/wp-content/uploads/2023/10/high93s.pdf)。

以 $n=1024$ 为例：

| 路径 | 最大深度 $d$ | 相对误差最坏界 |
| --- | ---: | --- |
| 顺序 FP32 累加 | $1023$ | $\gamma_{1023}\approx6.10\times10^{-5}$ |
| 平衡二叉 FP32 归约 | $10$ | $\gamma_{10}\approx5.96\times10^{-7}$ |

两种方法都做 $1023$ 次加法。树形方法改善的不是总加法次数，而是**单个输入到最终结果经过的舍入层数**。

这只是上界，不是逐输入排名。树浅不保证每次都更准，也不保证正确舍入；反过来，上界非零也不意味着实际误差非零。例如累加 $1024$ 个 $1$，这些整数部分和在 FP32 中都可以精确表示。

## 6. 分母算偏后，概率会怎样变化

仍然冻结 $\hat q$，并暂时让最终除法精确。定义两个输出：

\[
p_i^{(e)}=\frac{\hat q_i}{L_q},
\qquad
p_i^{(r)}=\frac{\hat q_i}{\hat L_G}.
\]

前者只包含已经固定的 exp 等上游误差，后者再加入归约误差。因为 $\hat L_G=L_q(1+\eta_G)$，

\[
p_i^{(r)}=\frac{p_i^{(e)}}{1+\eta_G}.
\]

只要 $\hat L_G>0$，就有

\[
p_i^{(r)}-p_i^{(e)}
=-p_i^{(e)}\frac{\eta_G}{1+\eta_G},
\]

以及

\[
\sum_i p_i^{(r)}=\frac{1}{1+\eta_G}.
\]

所以，分母偏大时，非零分量一起偏小；分母偏小时，它们一起偏大。这里给的是精确关系；只有在 $|\eta_G|$ 很小时，相对变化才近似为 $-\eta_G$。

这和上一篇的共同 exp 误差有一个关键区别：**共同 exp 因子同时进入分子和分母，可以约掉；归约新增的误差只进入分母，没有对应的分子因子可消除。**

在 $(1,u,u)$ 的先加大项路径中，$\hat L_G=1$，所以精确除法得到的三个分量之和是 $1+2u$，而不是 $1$。这已经能显示分母误差的后果，不需要再叠加除法舍入。

程序若在检查概率和时又做一次 FP32 归约，还可能把这个偏差再次舍掉。因此“程序算出来的概率和等于 $1$”不能替代对 $L_q$ 的独立比较。

## 7. 总结

到这里可以归纳出三个要点：

- **误差从哪来**：每个加法节点对实际操作数的精确和进行一次舍入。
- **误差有多大**：逐节点残差的有符号和给出实际误差；树深对应的 $\gamma_d$ 给出带条件的最坏界。
- **误差往哪去**：归约误差只改变共同分母，因而对非零输出产生共同缩放。

“有误差”与“没能正确舍入”还要分开。即使 $\hat L_G=L_q^\star$，只要精确和本来不能表示，$\hat L_G-L_q$ 仍然非零。审计时应该分别检查实际误差 $E_G$ 和是否命中正确舍入目标，不能混成一个判断。

现有的[求和停滞实验](/notes/systems/error-analysis/softmax/summation-stagnation/)继续放大了 $(1,u,u)$ 的机制，并比较具体的 pairwise、Kahan 和更宽累加器。Error Atlas 的 [reduction-tree 研究记录](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md)则把逐节点残差发展成显式图上的精确分析。

本篇的残差恒等式针对每个叶子使用一次的纯二叉加法树，不直接覆盖 online Softmax 的重缩放乘法、补偿算法或任意 GPU 指令图。固定求和树有助于复现，但可复现也不等于结果准确。

下一阶段的[归一化与除法](/notes/systems/error-analysis/softmax/#division)会进一步固定 $\hat q_i$ 和 $\hat L_G$，只分析实际除法、倒数乘法或输出转换新增的误差。这里先停在分母。

返回计算阶段地图：[分母归约](/notes/systems/error-analysis/softmax/#reduction) · [归一化与除法](/notes/systems/error-analysis/softmax/#division)
