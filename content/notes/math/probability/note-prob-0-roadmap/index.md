---
date: '2026-07-15T12:00:00+09:00'
draft: false
title: '概率论 Part 0：从概率空间到统计推断与随机过程'
summary: "以概率空间为共同起点，依次建立随机变量、分布、期望与条件结构，再分流到极限定理、统计推断、随机过程以及信息论。"
description: "概率论系列路线图：概率空间、事件、随机变量、联合与条件结构、收敛和集中、统计推断、EM、随机过程、Markov 链、排队论，以及与信息论和信息几何的接口。"
tags: ["Mathematics", "Probability Theory"]
categories: ["Notes"]
series: ["Probability and Statistics"]
note_kind: "foundation"
math: true
---

# 概率论 Part 0：从概率空间到统计推断与随机过程

这一组笔记把概率论作为数学正文来写，而不是把概念压缩成一组彼此独立的卡片。共同主干是

$$
\begin{aligned}
(\Omega,\mathcal F,P)
&\longrightarrow \text{事件与条件概率}
\longrightarrow \text{随机变量与分布}\\
&\longrightarrow \text{期望、联合分布与条件期望}.
\end{aligned}
$$

主干完成后分成三条线：

$$
\begin{array}{rcl}
\text{渐近线}&:&\text{收敛方式}\to\text{LLN / CLT}\to\text{集中不等式},\\
\text{推断线}&:&\text{likelihood}\to\text{MLE / MAP}\to\text{区间、检验与 EM},\\
\text{过程线}&:&\{X_t\}\to\text{Poisson / Markov}\to\text{queueing 与 tail latency}.
\end{array}
$$

信息论不再塞进概率地图里，而是从这条主干上接出独立系列：熵需要离散分布与期望，AEP 需要 i.i.d. 样本和大数定律，information geometry 则从参数化分布族、likelihood 与 KL 的微分结构继续向前。

---

## 1. 统一约定与严格性边界

除非某一节另行限定，概率空间均记为

$$
(\Omega,\mathcal F,P),
$$

其中 $\mathcal F$ 是 $\Omega$ 上的 $\sigma$-代数，$P$ 是概率测度。实随机变量是可测映射

$$
X:(\Omega,\mathcal F)\to(\mathbb R,\mathcal B(\mathbb R)).
$$

期望统一理解为 Lebesgue 积分：

$$
\mathbb E[X]=\int_\Omega X\,dP.
$$

因此，本系列的测度论依赖是：

- [实分析 Part 6：测度空间与 Lebesgue 积分](/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral/)；
- [实分析 Part 7：收敛定理与 $L^p$ 空间](/notes/math/real-analysis/note-ra-7-convergence-theorems-lp/)。

每篇会明确区分以下范围：

- **一般概率空间**：只使用可测性、积分和条件期望；
- **离散情形**：使用概率质量函数与可数求和；
- **绝对连续情形**：使用相对于 Lebesgue 测度的密度与积分；
- **有限状态或有限参数维数**：需要紧性、矩阵或有限维微分结构时单独声明。

Radon–Nikodym 定理、Kolmogorov 强大数定律、Lindeberg–Lévy 中心极限定理、Neyman–Pearson 引理以外的完整统计决策理论、Markov 链遍历定理等高级结果，不会用一句“显然”代替证明。若本系列使用但不在篇内证明，会标成“外部依赖”，并说明它承担哪一步。

---

## 2. 六篇正文

### Part 1：概率空间与事件代数

[概率论 Part 1：概率空间、条件概率、独立性与 Bayes](/notes/math/probability/note-prob-1-probability-space-events/)

从 $\sigma$-代数和概率测度出发，证明补事件公式、单调性、可数次可加性的连续性结果，再定义条件概率、独立性、全概率公式和 Bayes 公式。

### Part 2：随机变量与分布

[概率论 Part 2：随机变量、CDF 与常见分布族](/notes/math/probability/note-prob-2-random-variables-distributions/)

把随机结果推送到 $\mathbb R$，建立分布与 CDF；随后分别刻画离散分布、绝对连续分布和 Bernoulli、Binomial、Geometric、Poisson、Uniform、Exponential、Normal 等分布族。

### Part 3：积分、联合结构与条件化

[概率论 Part 3：期望、联合分布、条件期望与方差分解](/notes/math/probability/note-prob-3-expectation-conditioning/)

把期望定义为积分，建立 LOTUS、方差与协方差；从联合分布推出边缘和条件分布，再用 $\sigma$-代数定义条件期望，证明塔律、全期望与全方差公式。

### Part 4：渐近与有限样本控制

[概率论 Part 4：收敛方式、大数定律、中心极限定理与集中不等式](/notes/math/probability/note-prob-4-limits-concentration/)

区分几乎必然、依概率、$L^p$ 与依分布收敛；证明 Markov、Chebyshev、弱大数定律、Hoeffding 与 Chernoff 方法，并明确强大数定律和 CLT 的外部证明依赖。

### Part 5：统计推断

[概率论 Part 5：Likelihood、MLE、MAP、区间、检验与 EM](/notes/math/probability/note-prob-5-statistical-inference-em/)

在受支配参数模型中定义 likelihood、MLE 与 MAP；用覆盖率定义置信区间，用一类错误与功效定义检验；最后从 ELBO 恒等式证明 EM 的似然单调性。

### Part 6：随机过程

[概率论 Part 6：随机过程、Markov 链、排队与尾延迟](/notes/math/probability/note-prob-6-stochastic-processes-queues/)

从有限维分布与样本路径开始，建立 Bernoulli process、Poisson process、离散时间 Markov chain 和平稳分布，再证明 Little's Law 的样本路径版本，并把重尾与高分位 tail latency 写成精确的尾分布语言。

---

## 3. 与信息论和信息几何的接口

概率主干到信息论的最小依赖是

$$
\text{Part 2 的离散分布}
+
\text{Part 3 的期望与联合结构}
\longrightarrow
H(X),\ H(X,Y),\ H(Y\mid X).
$$

对应入口是：

- [信息论 Part 1：自信息、熵与平均不确定性](/notes/math/information-theory/note-it-1-entropy-self-information/)；
- [信息论 Part 2：联合熵、条件熵与链式法则](/notes/math/information-theory/note-it-2-joint-conditional-entropy/)。

AEP 的概率依赖则是

$$
\text{i.i.d. 乘积结构}
+
\text{Part 4 的弱大数定律}
\longrightarrow
-\frac1n\log p(X^n)\xrightarrow{P}H(X).
$$

对应入口是 [Shannon 支线 S1：AEP、典型集与熵的渐近意义](/notes/math/information-theory/note-it-4-aep-typical-set/)。

统计推断到信息几何的接口是

$$
p_\theta(x)
\longrightarrow
\ell(\theta;x)=\ln p_\theta(x)
\longrightarrow
\nabla_\theta\ell
\longrightarrow
\text{Fisher information}.
$$

对应入口是 [信息几何 G1：Score Function 与 Fisher Information](/notes/math/information-geometry/note-ig-1-score-fisher/)。

---

## 4. 推荐顺序

若目标是完整概率主干，顺序为

$$
P1\to P2\to P3\to P4\to P5,
$$

再从 $P3$ 进入 $P6$。若目标是 information geometry，可采用

$$
P1\to P2\to P3\to P5\to G1\to G2\to G3\to G4.
$$

若目标是 Shannon 渐近结构，则采用

$$
P1\to P2\to P3\to P4\to \text{信息论 Part 1--3}\to \text{AEP}.
$$

本系列的正文以定义、命题、定理和证明为单位；路线图只承担依赖导航，不重复保存第二份概念正文。

[开始阅读：概率论 Part 1——概率空间、条件概率、独立性与 Bayes](/notes/math/probability/note-prob-1-probability-space-events/)
