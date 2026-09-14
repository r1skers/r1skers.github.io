---
date: '2026-09-07T00:00:00+09:00'
draft: false
title: 'Softmax 输入表示与平移：exp 之前发生了什么'
summary: "量化可能不可逆地改变类间差值；subtract-max 改善指数动态范围，其减法误差则需与归一化后的概率误差分开分析。"
description: "exp 之前的两步 —— 量化与平移 —— 各自改变了什么？从浮点间距、ties-to-even 与 Sterbenz 精确性理解 Softmax 的输入阶段。"
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Input Quantization", "Numerical Stability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 3
math: true
ShowToc: true
softmaxArticle: true
---

[← 返回计算阶段地图](/notes/systems/error-analysis/softmax/#input)

## 1. 一个应该与共同偏移无关的概率

先只考虑两个 logits：

\[
x(M)=(M+1,M).
\]

两者的差始终是 1。精确 Softmax 的第一分量为

\[
p_1
=\frac{e^{M+1}}{e^{M+1}+e^M}
=\frac{1}{1+e^{-1}}
\approx0.7310585786.
\]

因此，改变共同偏移 $M$ 不应该改变精确答案。这个算例把问题缩得很小：**如果程序输出随 $M$ 改变，变化究竟发生在哪一步？**

本文追踪 $\exp$ 之前的两步：输入转成 FP32（§1–§5），以及随后的 subtract-max（§6）。指数、求和与除法在这里只用于观察前两步的后果，各自的误差预算留在对应阶段讨论。

## 2. 先区分三个对象

令 $Q_{32}$ 表示按 round-to-nearest、ties-to-even 规则量化到 FP32，$s$ 表示精确 Softmax，$A_{32}$ 表示对存储输入执行 Softmax 的 FP32 程序。需要分开记录：

| 对象 | 记号 | 本文中的含义 |
| --- | --- | --- |
| 源输入 | $x$ | 数学上希望交给算子的 $(M+1,M)$ |
| 存储输入 | $\hat{x}=Q_{32}(x)$ | 程序真正收到的 FP32 数 |
| 程序输出 | $\hat{p}=A_{32}(\hat{x})$ | 在存储输入上继续浮点求值得到的概率 |

这样，总输出误差可以精确拆成

\[
\hat{p}-s(x)=
\underbrace{\hat{p}-s(\hat{x})}_{\text{对存储输入的求值误差}}
+
\underbrace{s(\hat{x})-s(x)}_{\text{输入表示误差的传播}}.
\]

这是加减同一个 $s(\hat{x})$ 得到的恒等式，不是一阶近似。第一项把输入固定为 $\hat{x}$，第二项比较两组输入的精确结果。

为了判断误差是否已经发生在输入阶段，先考察存储差值

\[
\hat{d}=\hat{x}_1-\hat{x}_2.
\]

对下文列出的三个边界算例，这个减法本身是精确的。如果 $\hat{d}$ 已经从 1 变成 0，就有了比最终概率更靠近误差来源的观察点。

## 3. 为什么边界出现在 $2^{24}$

FP32 正规数有 24 位有效二进制数字，其中 23 位显式存储，另有 1 位隐含前导位。在正数区间 $[2^e,2^{e+1})$ 内，相邻可表示数的间距为

\[
\Delta_e=2^{e-23}.
\]

这里说的是该区间内的间距；在二次幂边界，两侧的间距并不相同。本文表格的 ULP 指从正数 $M$ 向上到下一个可表示数的距离。NumPy 用 [finfo](https://numpy.org/doc/stable/reference/generated/numpy.finfo.html) 描述格式参数，用 [spacing](https://numpy.org/doc/stable/reference/generated/numpy.spacing.html) 查询这些位置的间距。

当 $M=2^{23}$ 时，向上的间距为 1，$M$ 与 $M+1$ 都可精确表示，存储差值仍为 1。

当 $M=2^{24}$ 时，向上的相邻 FP32 数是

\[
M,\qquad M+2.
\]

源数 $M+1$ 正好位于二者中点。ties-to-even 选择的是**有效数最低位为偶数的候选**；这里是 $M$，因此

\[
Q_{32}(M+1)=M,\qquad Q_{32}(M)=M,
\qquad \hat{d}=0.
\]

两个整数端点在十进制下都是偶数，所以不能只靠“舍入到偶数整数”理解这条规则。

当 $M=2^{25}$ 时，向上间距为 4，$M+1$ 离 $M$ 更近，仍然舍入到 $M$。

还有一个需要保留的边界：**不能据此说所有大于 $2^{24}$ 的单位差都会变成零。** 例如取 $M=2^{24}+2$，则 $M+1$ 位于 $M$ 与 $M+2$ 的中点，这次 ties-to-even 选上端点，存储差值变成 2。它仍然失去了原来的单位差，但失真方向不同。这说明相同的源差值，也会因它落在浮点网格上的位置不同而产生不同的存储差值。

## 4. 输入差值丢失后，精确答案怎样改变

量化后的输入仍然可以交给精确 Softmax。对于两个分量，只需要它们的差值：

\[
s_1(\hat{x})=\frac{1}{1+e^{-\hat{d}}}=\sigma(\hat{d}).
\]

源输入的精确答案始终为 $\sigma(1)$；存储输入的精确答案则随 $\hat{d}$ 改变。因此，输入表示对第一概率造成的偏差是

\[
s_1(\hat{x})-s_1(x)=\sigma(\hat{d})-\sigma(1).
\]

把上一节的舍入结果代入，就能得到下表。这里列的是**对存储输入的精确数学结果**，小数只作近似显示，还没有加入 exp、求和或除法的浮点舍入。

| $M$ | 向上 ULP | $\hat{d}$ | $s_1(\hat{x})$ | 输入表示造成的概率绝对误差 |
| --- | ---: | ---: | --- | --- |
| $2^{23}$ | 1 | 1 | $\sigma(1)\approx0.731058579$ | 0 |
| $2^{24}$ | 2 | 0 | $1/2$ | $\sigma(1)-1/2\approx0.231058579$ |
| $2^{25}$ | 4 | 0 | $1/2$ | $\sigma(1)-1/2\approx0.231058579$ |

在 $M=2^{24}$ 时，量化后的输入成为 $(M,M)$。对它执行 subtract-max，后续的数学路径为

\[
(M,M)\longrightarrow(0,0)
\longrightarrow(1,1)
\longrightarrow(0.5,0.5).
\]

程序即使完全正确地计算了这个存储输入，仍然会与源输入的答案相差约 0.231。这一偏差不需要借助求值程序的不稳定性来解释，输入表示的变化本身就足以产生它。

## 5. 两种操作顺序影响保留的信息

在高精度中先中心化，再转成 FP32：

\[
(M+1,M)\longrightarrow(0,-1)
\longrightarrow Q_{32}(0,-1)=(0,-1).
\]

而先量化，再中心化，在 $M=2^{24}$ 时得到：

\[
(M+1,M)\longrightarrow(M,M)
\longrightarrow(0,0).
\]

因此，精确 Softmax 的平移不变性没有失效；发生变化的是进入数学映射的输入。

把已经量化好的 $(M,M)$ 再转成 FP64，差值仍然是零。更高精度的后续计算只能使用现存的信息。只有在有损转换前还能取得更精确的输入时，改变中心化和转换的顺序才可能保住差值。

这个例子也解释了为什么单看 logits 的整体相对误差容易误判。在 $M=2^{24}$ 时，

\[
\|\hat{x}-x\|_2=1,\qquad
\frac{\|\hat{x}-x\|_2}{\|x\|_2}
\approx\frac{1}{\sqrt{2}\,M}
\approx4.2\times10^{-8},
\]

但差值从 1 变成 0，相对源差值的误差是 100%。共同偏移让整体相对误差显得很小；诊断时还需要观察 Softmax 真正使用的类间差值。

## 6. 平移自己要花多少

<p class="atlas-return"><a href="/notes/systems/error-analysis/softmax/#shift">← 本节对应计算阶段地图的「最大值与平移」</a></p>

上一节把中心化当成一个数学操作。现在固定有限、非 NaN 的 FP32 存储输入，取 $m=\max_i\hat{x}_i$，区分精确差值与实际减法结果：

\[
t_i=\hat{x}_i-m,\qquad
s_i=\mathrm{fl}(t_i)=t_i+\delta_i.
\]

本节采用 round-to-nearest、ties-to-even 与渐进下溢，并假设减法不溢出。$\delta_i$ 只记录这一次减法的误差；为隔离它，后续指数、求和与除法暂时全部精确计算。

### 为什么仍然需要 subtract-max

对 $\hat{x}=(1000,999)$，直接求指数会产生超出 FP32 范围的中间量；平移后则是 $(0,-1)$。一般地，$s_i\le0$，且至少一个为精确的零。因此精确指数项都不超过 $1$，至少一个等于 $1$。它消除了**指数阶段的正向溢出**，但没有恢复量化前已经丢失的差值，也没有自动保证后续所有运算都无误差。

### 哪些减法是精确的

$m$ 是已有输入中的一个数。有限、非 NaN 输入上的 max 只做比较和选择，不引入算术舍入；换成并行比较树也不改变这一点。

[Sterbenz 引理](https://toccata.gitlabpages.inria.fr/toccata/gallery/Sterbenz.fr.html)给出减法精确的充分条件。对同号非零浮点数，可以写成同时适用于正、负数的形式：

\[
\frac{|b|}{2}\le|a|\le2|b|
\quad\Longrightarrow\quad
\mathrm{fl}(a-b)=a-b.
\]

这里保留渐进下溢；不能直接把结论搬到任意 FTZ 模式。减去零、两个数相等等情况也直接精确。对非零 $m$，$|\hat{x}_i-m|\le|m|/2$ 是落入上述条件的一个充分条件。

因此，在固定类间差值、共同偏移足够大而且仍未溢出的情形，存储数即使已经丢失差值，随后相近数相减仍可完全精确。§4 的 $M=2^{24}$ 算例就是如此：**输入表示使第一概率偏离约 $0.231$，平移新增的误差则恰好为零。** 这是同一算例中的比较，不是任意输入上两类误差大小的排序。

不满足 Sterbenz 条件不等于减法一定不精确，也不意味着差值一定很大。其他情形需要按实际舍入分析。

### 单个指数项怎样接收减法误差

设 $u=2^{-24}$。当非零精确差值的绝对值满足 $|t_i|\in[2^e,2^{e+1})$、位于正规数范围且减法不溢出时，

\[
|\delta_i|\le2^e u.
\]

注意 binade 描述的是 $|t_i|$，不是非正的 $t_i$ 本身。若两个 FP32 数的精确差落在次正规范围，它仍是 $2^{-149}$ 的整数倍，在渐进下溢下可精确表示。

对后续的精确指数，有

\[
\frac{e^{s_i}-e^{t_i}}{e^{t_i}}
=e^{\delta_i}-1,\qquad
|e^{\delta_i}-1|\le e^{|\delta_i|}-1.
\]

只有在 $|\delta_i|$ 很小时，才可把这个相对变化近似成 $\delta_i$。

令 $p_i=e^{t_i}/L$，$L=\sum_j e^{t_j}\ge1$。由于 $t_i\le0$，

\[
p_i\le e^{t_i}
\quad\Longrightarrow\quad
|t_i|\le-\ln p_i.
\]

这给出了按**精确参考概率下限**限制单项误差的方法：

| 已知条件 | $\lvert t_i\rvert$ 的上限 | $\lvert\delta_i\rvert$ 的上界 $a$ | 单个指数项的相对变化上界 |
| --- | ---: | ---: | --- |
| $p_i\ge10^{-1}$ | $\ln 10\approx2.303$ | $2u$ | $e^{2u}-1$ |
| $p_i\ge10^{-3}$ | $3\ln 10\approx6.908$ | $4u$ | $e^{4u}-1$ |
| $p_i\ge10^{-6}$ | $6\ln 10\approx13.816$ | $8u$ | $e^{8u}-1$ |
| $p_i\ge10^{-14}$ | $14\ln 10\approx32.236$ | $32u$ | $e^{32u}-1$ |

这些不是归一化后概率的相对误差上界，也不构成所有尾部项的统一封顶。指数实现的下溢阈值属于下一阶段，不能用两个采样点把它当作精确截断点。

### 归一化还会改变分母

只引入平移舍入、其余运算精确时，记输出为

\[
p_i^{(s)}=\frac{e^{s_i}}{\sum_j e^{s_j}}.
\]

与精确平移结果比较，得到恒等式

\[
\boxed{
\frac{p_i^{(s)}}{p_i}
=\frac{e^{\delta_i}}{\sum_j p_j e^{\delta_j}}.
}
\]

所以小扰动下的相对变化为

\[
\frac{p_i^{(s)}-p_i}{p_i}
=\delta_i-\sum_j p_j\delta_j
+O(\|\delta\|_\infty^2).
\]

减法误差不仅进入自己的分子，还通过所有项改变共同分母。单看 $\delta_i$ 不够；即使某项减法精确，它的概率也可能因其他项改变而变化。

若需要不依赖一阶近似的界，令 $D=\max_j\delta_j-\min_j\delta_j$，则

\[
e^{-D}\le\frac{p_i^{(s)}}{p_i}\le e^D,
\qquad
|p_i^{(s)}-p_i|\le p_i(e^D-1).
\]

共同的 $\delta_i=c$ 会完全抵消；真正影响归一化结果的是它们之间的差异。这与前一篇 Jacobian 的“减去概率加权平均”在一阶上是同一件事。

## 7. 边界

本文分开了三件事：量化改变输入；subtract-max 改善指数的动态范围；减法舍入通过分子与分母共同影响概率。相近数相减可精确，但不能概括为平移在任意输入上都不产生误差。

具体的 $2^{24}$ 边界来自 FP32 有效位数与这里选择的单位差，不能直接搬到其他 dtype 或其他差值。预中心化能否保留信息，也取决于有损转换前还能取得多少精度。

有限输入本身还不足以保证有限差值：取输入 $(-F_{\max},F_{\max})$，最小项减去最大项会溢出为 $-\infty$，不再适用本节的有限 $\delta_i$ 预算。NaN、无穷输入、FTZ、混合精度和这类减法溢出均需另行处理。

分块 max 的比较本身仍可精确；online Softmax 的不同之处是使用局部最大值维护状态，并在合并时重新缩放，不是“并行比较会舍入”。那部分留到 [online 路径](/notes/systems/error-analysis/softmax/#online-softmax)讨论。

下一阶段的[指数实现](/notes/systems/error-analysis/softmax/#exp)固定本节得到的有限 $s_i\le0$，以 $e^{s_i}$ 为参考，分析实现自身新增的误差。这样不会把已经计入的平移误差再次算给 exp。

## 参考资料

- [NumPy finfo](https://numpy.org/doc/stable/reference/generated/numpy.finfo.html)、[spacing](https://numpy.org/doc/stable/reference/generated/numpy.spacing.html) 与 [nextafter](https://numpy.org/doc/stable/reference/generated/numpy.nextafter.html)：浮点格式参数、间距与网格遍历的查询接口。Sterbenz 引理见任一标准浮点算术教材。
- [Error Atlas：输入表示边界说明](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/early_experiments.md#boundary-audit)：量化顺序与中心化的关系。
- [Error Atlas：finite-precision propagation](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md#finite-precision-propagation)：研究记录中的误差预算是"在 subtract-max 已完成、没有下溢"的前提下起算的；§6 补的正是它之前的那一次减法。
- [误差为什么有方向](/notes/systems/error-analysis/softmax/directional-error/)与[概率单纯形上的方向与谱](/notes/systems/error-analysis/softmax/geometry-spectrum/)：问题条件性与算法稳定性的区分，以及 $\|J_s\|_2\le1/2$ 的来源。

返回计算阶段地图：[输入表示](/notes/systems/error-analysis/softmax/#input) · [最大值与平移](/notes/systems/error-analysis/softmax/#shift)
