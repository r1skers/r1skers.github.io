---
date: '2026-09-08T00:00:00+09:00'
draft: false
title: 'Softmax 指数实现：从单项舍入到概率误差'
summary: "固定平移后的输入，区分指数真值、正确舍入目标与实现输出；再看同一组 exp 误差如何以不同方式进入分子和分母。"
description: "Softmax 的 exp 阶段究竟引入什么误差？从正确舍入、共同误差抵消、差异误差传播与尾部下溢建立独立误差预算。"
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Exponentiation"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 4
math: true
ShowToc: true
softmaxArticle: true
---

[← 返回计算阶段地图 · 指数实现](/notes/systems/error-analysis/softmax/#exp)

## 1. 固定输入后，exp 还剩哪几种误差

[输入表示与平移](/notes/systems/error-analysis/softmax/input-and-shift/)已经把源输入、存储输入与减法舍入分开。本文从平移后的有限 FP32 数开始：

\[
s_i\le0,
\qquad
\max_i s_i=0.
\]

至少一个指数项因此是 $e^0=1$。对每个 $s_i$，需要区分三个对象：

| 对象 | 记号 | 含义 |
| --- | --- | --- |
| 精确指数 | $q_i=e^{s_i}$ | 对实际收到的 $s_i$ 求数学真值 |
| 正确舍入目标 | $q_i^\star=Q_{32}(q_i)$ | 真值按 round-to-nearest、ties-to-even 一次舍入到 FP32 |
| 实现输出 | $\hat q_i=\exp_{\mathrm{impl}}(s_i)$ | 指定库、设备与编译配置实际返回的数 |

实现输出相对真值的偏差可精确拆成

\[
\hat q_i-q_i
=\underbrace{\hat q_i-q_i^\star}_{\text{实现偏离正确舍入目标}}
+\underbrace{q_i^\star-q_i}_{\text{目标格式的舍入}}.
\]

这是恒等式，不是小误差近似。正确舍入也不等于数学上精确：它只表示结果选中了目标格式中应当返回的那个数。反过来，仅凭输入输出都是 FP32，也不能认定一个 `exp` 实现正确舍入。

## 2. 一次 exp 调用不一定只有一次舍入

实数恒等式

\[
s=k\ln2+r,
\qquad
e^s=2^k e^r
\]

提示了常见的实现分层：先做范围约简，把近似集中到较小区间；再用多项式、查表或二者组合近似 $e^r$；最后恢复尺度并处理输出格式、次正规数与归零。各步使用的常数、内部精度、舍入位置和特殊值策略都会影响 $\hat q_i$。

本文不展开某套实现的系数与误差证明，只把整次调用的结果当作可观察量。后续如果引用具体精度结论，必须同时固定库、版本、设备、函数和编译选项；“使用 FP32 exp”本身还不足以定义计算路径。

## 3. 同一组 exp 误差分别进入分子和分母

由于有限 $s_i$ 的精确指数 $q_i>0$，定义

\[
\epsilon_i=\frac{\hat q_i-q_i}{q_i},
\qquad
\hat q_i=q_i(1+\epsilon_i).
\]

这个定义本身也是恒等式。只有在随后采用一阶近似时，才要求 $\epsilon_i$ 足够小；若某项归零，则 $\epsilon_i=-1$，记号仍成立，但小相对误差模型已经失效。

现在暂时让后续求和与除法在实数中精确执行。定义

\[
L=\sum_jq_j,
\qquad
p_i=\frac{q_i}{L},
\qquad
\bar\epsilon=\sum_jp_j\epsilon_j.
\]

分子只使用第 $i$ 项：

\[
\hat q_i=q_i(1+\epsilon_i).
\]

分母则接收所有指数输出的精确和：

\[
L^{(e)}=\sum_j\hat q_j
=L\left(1+\sum_jp_j\epsilon_j\right)
=L(1+\bar\epsilon).
\]

这里的 $\bar\epsilon$ 是 **exp 输出变化给分母带来的相对变化**。程序把这些 $\hat q_j$ 累加成 $\hat L$ 时产生的误差属于[求和归约](/notes/systems/error-analysis/softmax/#reduction)阶段。

以下归一化假设实际指数输出有限、非负且不全为零，因此 $L^{(e)}>0$。只受 exp 误差影响的概率记为

\[
p_i^{(e)}=\frac{\hat q_i}{L^{(e)}}.
\]

于是得到本篇的核心恒等式：

\[
\boxed{
\frac{p_i^{(e)}-p_i}{p_i}
=\frac{\epsilon_i-\bar\epsilon}{1+\bar\epsilon}.
}
\]

它把两条路径分得很清楚：分子承受本项误差 $\epsilon_i$，分母承受所有误差的概率加权平均 $\bar\epsilon$；归一化之后，留下的是二者之差。

若令 $\eta=\|\epsilon\|_\infty\lt1$，则 $|\bar\epsilon|\le\eta$，从而

\[
\left|\frac{p_i^{(e)}-p_i}{p_i}\right|
\le\frac{2\eta}{1-\eta}.
\]

当 $\eta$ 很小时，精确恒等式的一阶形式为

\[
\frac{p_i^{(e)}-p_i}{p_i}
=\epsilon_i-\bar\epsilon+O(\eta^2).
\]

更高阶展开可以通过等效 logit 扰动接回 Softmax Jacobian，留在[概率单纯形上的方向与谱](/notes/systems/error-analysis/softmax/geometry-spectrum/)中讨论。

## 4. 共同误差会消失，差异误差不会

如果所有指数项都乘上同一个正因子，即 $\epsilon_i=c>-1$，那么 $\bar\epsilon=c$，所以

\[
p_i^{(e)}=p_i.
\]

分母确实改变了，概率却完全不变。归一化消掉的是 exp 相对误差的**共同模式**。

如果误差只落在部分分量上，就不会这样抵消。取参考概率

\[
p=\left(\frac23,\frac13\right),
\qquad
\epsilon=(0,a),\quad a>0.
\]

则

\[
\bar\epsilon=\frac a3,
\qquad
p^{(e)}=\left(\frac2{3+a},\frac{1+a}{3+a}\right),
\]

\[
p^{(e)}-p
=\left(-\frac{2a}{3(3+a)},\frac{2a}{3(3+a)}\right).
\]

第一项的 exp 没有误差，其概率仍然下降，因为第二项改变了共同分母。这是隔离传播机制的人为算例，不是对某个实际 exp 库的测量。它说明单看每项误差上限还不够：误差在分量之间是否相关，同样决定最终概率。

## 5. 下溢：从相对误差改看丢失质量

FP32 的最小正正规数与最小正次正规数分别是

\[
n_{\min}=2^{-126},
\qquad
h=2^{-149}.
\]

在正确舍入到 FP32、round-to-nearest、ties-to-even 且保留次正规数的模型中：

| 精确指数边界 | 对应的实数参数 | 含义 |
| --- | --- | --- |
| $e^s=2^{-126}$ | $s=-126\ln2\approx-87.336545$ | 精确值进入次正规量级 |
| $e^s=2^{-149}$ | $s=-149\ln2\approx-103.278930$ | 精确值等于最小正次正规数 |
| $e^s=2^{-150}=h/2$ | $s=-150\ln2\approx-103.972077$ | 零与最小正次正规数的舍入中点 |

因此

\[
Q_{32}(e^s)=0
\quad\Longleftrightarrow\quad
s\le-150\ln2.
\]

等号处 ties-to-even 选择零。这个 $-150\ln2$ 阈值只属于“正确舍入到 FP32、round-to-nearest ties-to-even、保留次正规数”这一指定模型，不是所有 `expf` 实现的通用阈值。实际输入是 FP32 时，还要检查边界两侧具体的可表示数；“$-103$ 非零、$-104$ 为零”只是包围了阈值，并不意味着精确阈值是 $-104$。

次正规区仍有绝对误差界

\[
|q_i^\star-q_i|\le h/2,
\]

但相对误差上界 $h/(2q_i)$ 会随 $q_i$ 变小而增大；一旦归零，相对误差就是 $100\%$。若实现采用 FTZ，把本应返回的次正规结果也冲为零，则属于另一条计算路径，不能与保留次正规数的模型混用。

单项 $100\%$ 的相对误差仍不等于整个分布发生了巨大变化。考虑一个隔离模型：对集合 $T$ 中的指数项置零，其余项保持精确，随后精确归一化。令被删除的参考概率质量为

\[
\tau=\sum_{i\in T}p_i\lt1.
\]

则

\[
p_i^{(e)}=
\begin{cases}
0,&i\in T,\\
p_i/(1-\tau),&i\notin T,
\end{cases}
\]

并且

\[
\|p^{(e)}-p\|_1=2\tau.
\]

决定分布一范数变化的是被删除的**总概率质量**，不是归零项个数。这个恒等式只描述“删除指定项、其余项精确”的模型；实际实现还会近似保留下来的项，不能把它当成整个程序的误差公式。若下游读取尾部概率的对数，零值还会改变计算定义域，应在[下游使用者](/notes/systems/error-analysis/softmax/#consumer)阶段按实际用途判断。


## 参考资料

- [NumPy finfo](https://numpy.org/doc/stable/reference/generated/numpy.finfo.html)：FP32 正规数与次正规数边界。
- [Arm optimized-routines `expf`](https://github.com/ARM-software/optimized-routines/blob/master/math/expf.c)：一个可查阅的范围约简、局部近似与重建实例；不代表所有 `expf` 实现。
- [CUDA Math API：single-precision functions](https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH__SINGLE.html)：具体函数与编译配置需要一并记录。
- [Error Atlas：finite-precision propagation](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md#finite-precision-propagation)：exp、求和与除法的分层误差预算。

返回计算阶段地图：[指数实现](/notes/systems/error-analysis/softmax/#exp) · [求和归约](/notes/systems/error-analysis/softmax/#reduction)
