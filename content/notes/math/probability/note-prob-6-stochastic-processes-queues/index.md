---
date: '2026-07-15T13:30:00+09:00'
draft: false
title: '概率论 Part 6：随机过程、Markov 链、排队与尾延迟'
summary: "把随机变量扩展为按时间索引的随机变量族，建立 Bernoulli 与 Poisson 过程、Markov 链和平稳分布，再从样本路径证明 Little's Law，并用尾分布与分位数刻画重尾和 tail latency。"
description: "随机过程基础：有限维分布、Bernoulli process、Poisson process、Markov chain、Chapman–Kolmogorov 方程、平稳分布、M/M/1、Little's Law、regular variation、重尾与高分位尾延迟。"
tags: ["Probability Theory", "Stochastic Process", "Poisson Process", "Markov Chain", "Stationary Distribution", "Queueing Theory", "Little's Law", "Heavy Tail", "Tail Latency", "Proof"]
categories: ["Crucible"]
math: true
---

# 概率论 Part 6：随机过程、Markov 链、排队与尾延迟

> 前几篇研究有限个随机变量。本篇把对象换成按时间索引的随机变量族 $\{X_t:t\in T\}$。离散时间与连续时间、离散状态与一般状态是两组不同选择；每一节都会明确当前范围。

本篇的链条是

$$
\{X_t\}_{t\in T}
\longrightarrow
\text{Bernoulli / Poisson process}
\longrightarrow
\text{Markov chain}
\longrightarrow
\text{queueing}
\longrightarrow
\text{heavy tail 与高分位延迟}.
$$

---

## 1. 随机过程与有限维分布

**定义（随机过程）**：在同一个概率空间 $(\Omega,\mathcal F,P)$ 上，一族由索引集 $T$ 标记的随机变量

$$
X=\{X_t:t\in T\}
$$

称为随机过程。

- 固定 $t$，$X_t$ 是一个随机变量；
- 固定 $\omega$，映射 $t\mapsto X_t(\omega)$ 称为一条样本路径；
- $T=\mathbb N_0$ 时是离散时间过程；$T=[0,\infty)$ 时是连续时间过程。

**定义（有限维分布）**：对任意 $t_1,\ldots,t_n\in T$，随机向量

$$
(X_{t_1},\ldots,X_{t_n})
$$

的联合分布称为过程的一组有限维分布。

有限维分布必须满足置换一致性与边缘一致性。反过来，从一族一致的有限维分布构造整个路径空间上的过程，需要 **Kolmogorov extension theorem**。该定理依赖乘积 $\sigma$-代数与测度扩张，是本篇的外部依赖；后面各过程直接从已存在的随机变量族出发。

---

## 2. Bernoulli process

**定义**：若

$$
X_1,X_2,\ldots
\overset{\mathrm{i.i.d.}}{\sim}
\operatorname{Bernoulli}(p),
$$

则 $\{X_n\}_{n\ge1}$ 称为参数 $p$ 的 Bernoulli process。

累计计数为

$$
S_n=\sum_{k=1}^nX_k.
$$

由 Part 2 已证的独立 Bernoulli 和定理，

$$
S_n\sim\operatorname{Binomial}(n,p).
$$

首次成功时间

$$
T_1=\inf\{n\ge1:X_n=1\}
$$

满足

$$
P(T_1=k)
=
P(X_1=0,\ldots,X_{k-1}=0,X_k=1)
=(1-p)^{k-1}p,
$$

所以

$$
T_1\sim\operatorname{Geometric}(p).
$$

这把一次 Bernoulli 分布、累计 Binomial 计数和 Geometric 等待时间放进同一个离散时间过程。

---

## 3. Poisson process

**定义（齐次 Poisson process）**：计数过程 $\{N(t):t\ge0\}$ 若满足

1. $N(0)=0$ a.s.，且样本路径取非负整数、右连续、每次跳跃大小为 $1$；
2. 不相交时间区间上的增量相互独立；
3. 对 $0\le s<t$，

$$
N(t)-N(s)
\sim
\operatorname{Poisson}(\lambda(t-s)),
$$

则称它是速率 $\lambda>0$ 的齐次 Poisson process。

第三条立即给出

$$
N(t)\sim\operatorname{Poisson}(\lambda t),
$$

以及

$$
\mathbb E[N(t)]=\operatorname{Var}(N(t))=\lambda t.
$$

令首次到达时间

$$
T_1=\inf\{t\ge0:N(t)\ge1\}.
$$

**命题**：

$$
T_1\sim\operatorname{Exponential}(\lambda).
$$

{{< details summary="证明：零到达概率给出指数等待时间" >}}

对 $t\ge0$，事件 $\{T_1>t\}$ 等价于区间 $[0,t]$ 内没有到达，即 $\{N(t)=0\}$。因此

$$
P(T_1>t)
=
P(N(t)=0)
=
e^{-\lambda t}.
$$

这正是 $\operatorname{Exponential}(\lambda)$ 的生存函数。

{{< /details >}}

**定理（Poisson interarrival structure）**：若

$$
T_n=\inf\{t:N(t)\ge n\},
\qquad
W_n=T_n-T_{n-1},
$$

则 $W_1,W_2,\ldots$ i.i.d. 且服从 $\operatorname{Exponential}(\lambda)$。反过来，用 i.i.d. exponential interarrival times 定义 $T_n$ 和 $N(t)=\max\{n:T_n\le t\}$，得到 Poisson process。

**外部依赖**：从确定时刻的独立平稳增量推进到随机到达时刻后的“重新开始”，需要 stopping time 上的 strong Markov property，或需要对联合到达时间密度作完整计算；反向构造则要证明计数增量为独立 Poisson。当前只完整证明首次等待时间，以上等价结构作为标准 Poisson-process 定理引用。

---

## 4. 离散时间 Markov chain

本节限定状态空间 $S$ 有限或可数，时间为 $n\in\mathbb N_0$。令

$$
\mathcal F_n=\sigma(X_0,\ldots,X_n).
$$

**定义（Markov property）**：若存在一族 stochastic kernels $P_n(i,j)$，使对每个 $j\in S$，

$$
P(X_{n+1}=j\mid\mathcal F_n)
=
P_n(X_n,j)
\quad\text{a.s.},
$$

则称 $(X_n)$ 为 Markov chain。这里 kernel 的每一行都必须是定义在整个状态空间上的概率分布：

$$
P_n(i,j)\ge0,
\qquad
\sum_{j\in S}P_n(i,j)=1.
$$

这一定义不会在 $P(X_n=i)=0$ 时对零概率事件作条件化。对任何有正概率且以 $i$ 结尾的历史，它蕴含熟悉的等式

$$
P(X_{n+1}=j\mid X_n=i,\ldots,X_0=i_0)
=
P_n(i,j).
$$

若 $P_n$ 不依赖 $n$，称链为 time-homogeneous，并把共同 kernel 写成转移矩阵

$$
P_{ij}=P(i,j).
$$

把初始分布取为点质量 $\delta_i$ 时所得链的概率律记为 $\mathbb P_i$，并定义 $n$ 步转移概率

$$
P_{ij}^{(n)}=\mathbb P_i(X_n=j).
$$

特别地 $P^{(0)}=I$ 且 $P^{(1)}=P$。

当某个给定初始分布满足 $P(X_0=i)>0$ 时，它也等于 $P(X_n=j\mid X_0=i)$；基本定义则不依赖这个条件事件是否有正概率。

### Chapman–Kolmogorov 方程

**定理**：对 $m,n\ge0$，

$$
P_{ij}^{(m+n)}
=
\sum_{k\in S}P_{ik}^{(m)}P_{kj}^{(n)}.
$$

因此矩阵形式为

$$
P^{(m+n)}=P^{(m)}P^{(n)},
$$

特别地 $P^{(n)}=P^n$。

{{< details summary="证明：迭代转移 kernel 并在中间状态上求和" >}}

先由 Markov property 与 tower property 对 $n$ 归纳，可得

$$
P(X_{m+n}=j\mid\mathcal F_m)
=
P_{X_mj}^{(n)}
\quad\text{a.s.}
$$

$n=0$ 时这是 $P^{(0)}=I$，$n=1$ 时就是 Markov property。若对某个 $n\ge1$ 成立，则再条件化一步并使用 tower property，得到

$$
\begin{aligned}
P(X_{m+n+1}=j\mid\mathcal F_m)
&=\mathbb E[P_{X_{m+n}j}\mid\mathcal F_m]\\
&=\sum_{\ell\in S}P_{X_m\ell}^{(n)}P_{\ell j}
=P_{X_mj}^{(n+1)}.
\end{aligned}
$$

现在在初始律 $\mathbb P_i$ 下取期望，并按 $X_m$ 的值求和：

$$
P_{ij}^{(m+n)}
=
\sum_{k\in S}
P_{ik}^{(m)}P_{kj}^{(n)}.
$$

整个论证只使用 kernel 的 a.s. 条件期望恒等式，没有对零概率中间状态作条件化。

{{< /details >}}

若初始分布是行向量 $\mu_0$，则

$$
\mu_n=\mu_0P^n.
$$

---

## 5. 平稳分布

**定义**：状态空间上的概率分布 $\pi$ 若满足

$$
\pi=\pi P,
$$

则称为 Markov chain 的平稳分布。若 $X_0\sim\pi$，则对每个 $n$，

$$
X_n\sim\pi P^n=\pi.
$$

### 有限状态链总存在平稳分布

**定理**：若 $S$ 有限，则任意转移矩阵 $P$ 至少有一个平稳分布。

{{< details summary="证明：Cesàro 平均与有限维紧性" >}}

任取初始分布 $\mu$，定义 Cesàro 平均

$$
\bar\mu_n
=
\frac1n\sum_{k=0}^{n-1}\mu P^k.
$$

每个 $\bar\mu_n$ 都在有限维概率单纯形

$$
\Delta_S=\left\{x_i\ge0:\sum_ix_i=1\right\}
$$

中。$\Delta_S$ 闭且有界，因此紧。存在子列 $\bar\mu_{n_r}\to\pi\in\Delta_S$。

另一方面，

$$
\begin{aligned}
\bar\mu_nP-\bar\mu_n
&=\frac1n\sum_{k=0}^{n-1}(\mu P^{k+1}-\mu P^k)\\
&=\frac{\mu P^n-\mu}{n}.
\end{aligned}
$$

右侧每个坐标的绝对值至多 $1/n$，所以趋于零。沿收敛子列取极限，并利用矩阵乘法连续性：

$$
\pi P-\pi=0.
$$

因此 $\pi$ 平稳。

{{< /details >}}

**外部依赖（遍历收敛）**：有限状态链若不可约且非周期，则平稳分布唯一，且对任意初始分布 $\mu$，

$$
\mu P^n\to\pi.
$$

完整证明依赖有限 Markov chain 的 communication classes、period decomposition 与 Perron–Frobenius / coupling 等工具。上面的存在性证明没有推出唯一性或 $P^n$ 收敛，因此遍历定理在这里明确列为外部依赖。

---

## 6. Queueing system 的计数恒等式

设 $A(t)$、$D(t)$ 分别为 $[0,t]$ 内累计到达和离开数，$N(t)$ 为时刻 $t$ 的系统内任务数。在无丢弃、逐个到达离开的模型中，

$$
N(t)=N(0)+A(t)-D(t).
$$

若第 $i$ 个任务的到达与离开时刻为 $a_i,d_i$，其系统停留时间为

$$
W_i=d_i-a_i.
$$

对有限时间窗 $[0,T]$，系统内人数曲线下面积满足精确的样本路径恒等式

$$
\int_0^TN(t)\,dt
=
\sum_i
\left|[a_i,d_i)\cap[0,T]\right|,
$$

其中 $|\cdot|$ 表示区间长度。等式只是把积分中的求和次序交换：每个任务在系统内存在的每一单位时间，都给 $N(t)$ 贡献 $1$。

---

## 7. Little's Law

**定理（样本路径版本）**：假设一个稳定系统满足

$$
\frac{A(T)}T\to\lambda\in(0,\infty),
$$

$$
\frac1{A(T)}\sum_{i=1}^{A(T)}W_i\to W<\infty,
$$

$$
\frac1T\int_0^TN(t)\,dt\to L<\infty.
$$

再假设跨越时间窗边界的任务所造成的截断差满足

$$
\frac1T
\left|
\int_0^TN(t)\,dt
-
\sum_{i=1}^{A(T)}W_i
\right|
\to0.
$$

则

$$
L=\lambda W.
$$

{{< details summary="证明：人数曲线面积的双重计数" >}}

由边界项假设，

$$
\frac1T\int_0^TN(t)\,dt
=
\frac1T\sum_{i=1}^{A(T)}W_i+o(1).
$$

把右侧分解为

$$
\frac1T\sum_{i=1}^{A(T)}W_i
=
\frac{A(T)}T
\left(
\frac1{A(T)}\sum_{i=1}^{A(T)}W_i
\right).
$$

分别取极限，得到

$$
L=\lambda W.
$$

{{< /details >}}

Little's Law 的核心是样本路径上的面积恒等式。具体随机模型的作用是验证长期平均和边界可忽略条件，而不是改变 $L=\lambda W$ 这条双重计数关系。

---

## 8. M/M/1 的平稳分布与平均等待

M/M/1 是连续时间 birth–death chain：

- 到达过程是速率 $\lambda>0$ 的 Poisson process；
- 服务时间 i.i.d. $\operatorname{Exponential}(\mu)$，其中 $\mu>0$；
- 到达过程与服务时间序列相互独立；
- 单个服务器，采用不预知尚未完成服务需求的工作保持规则；
- 状态 $N(t)\in\mathbb N_0$ 是系统内任务数。

Poisson process 的独立增量与指数分布的无记忆性说明：给定当前状态，从 $n$ 到 $n+1$ 的速率是 $\lambda$；从 $n\ge1$ 到 $n-1$ 的速率是 $\mu$。因此 $N(t)$ 是 birth–death CTMC。它在任一状态的总跳率不超过 $\lambda+\mu$，所以不会在有限时间内发生无限多次跳跃。令

$$
\rho=\frac\lambda\mu.
$$

**定理**：若 $\rho<1$，平稳分布为

$$
\pi_n=(1-\rho)\rho^n,
\qquad n\ge0.
$$

若 $\rho\ge1$，不存在平稳概率分布。

{{< details summary="证明：local balance 与几何级数归一化" >}}

任意平稳分布都必须满足相邻状态之间的 local balance 方程

$$
\pi_n\lambda=\pi_{n+1}\mu.
$$

这是因为对集合 $\{0,1,\ldots,n\}$ 作平稳流量守恒时，跨越其边界的流只有 $n\to n+1$ 与 $n+1\to n$。因此

$$
\pi_{n+1}=\rho\pi_n,
$$

递推得到

$$
\pi_n=\rho^n\pi_0.
$$

要使总概率为 $1$，必须有

$$
1=\pi_0\sum_{n=0}^\infty\rho^n.
$$

几何级数有限当且仅当 $\rho<1$，此时 $\pi_0=1-\rho$。local balance 蕴含完整 global balance，因此该分布满足连续时间链的平稳方程 $\pi Q=0$。

若 $\rho\ge1$，$\sum_n\rho^n$ 发散，不能归一化成概率分布。

{{< /details >}}

平稳平均系统人数为

$$
L
=
\sum_{n=0}^\infty n(1-\rho)\rho^n
=
\frac\rho{1-\rho}.
$$

由 Little's Law，

$$
W=\frac L\lambda
=
\frac1{\mu-\lambda}.
$$

服务器忙碌概率为

$$
P(N\ge1)=1-\pi_0=\rho.
$$

因此平均排队人数（不含正在服务者）为

$$
L_q=L-\rho=\frac{\rho^2}{1-\rho},
$$

再次使用 Little's Law 得到

$$
W_q=\frac{L_q}\lambda
=
\frac\rho{\mu-\lambda}.
$$

这些公式的平稳解释依赖 $\rho<1$；当 $\lambda\uparrow\mu$ 时，分母 $\mu-\lambda$ 把平均人数与等待时间推向无穷。

---

## 9. 尾分布、重尾与矩

对非负随机变量 $X$，定义生存函数或尾分布

$$
\overline F(x)=P(X>x).
$$

**定义（regularly varying tail）**：若存在 $\alpha>0$ 与 slowly varying function $L$，使

$$
\overline F(x)=x^{-\alpha}L(x),
$$

其中对每个 $c>0$，

$$
\frac{L(cx)}{L(x)}\to1,
$$

则称 $X$ 的尾部以指数 $-\alpha$ 正则变化。这是一类标准重尾分布。

**命题（tail integral formula）**：对 $r>0$，

$$
\mathbb E[X^r]
=
r\int_0^\infty x^{r-1}P(X>x)\,dx,
$$

允许两侧取 $+\infty$。

{{< details summary="证明：用 Tonelli 交换尾部积分" >}}

逐点有

$$
X^r
=
\int_0^{X^r}du
=
\int_0^\infty\mathbf1_{\{u<X^r\}}\,du.
$$

被积函数非负，Tonelli 定理给出

$$
\mathbb E[X^r]
=
\int_0^\infty P(X^r>u)\,du.
$$

作换元 $u=x^r$、$du=rx^{r-1}dx$，得到

$$
\mathbb E[X^r]
=
r\int_0^\infty x^{r-1}P(X>x)\,dx.
$$

{{< /details >}}

**定理（正则变化尾部的矩阈值）**：若

$$
P(X>x)=x^{-\alpha}L(x),
$$

则

$$
r<\alpha\Longrightarrow\mathbb E[X^r]<\infty,
$$

$$
r>\alpha\Longrightarrow\mathbb E[X^r]=\infty.
$$

边界 $r=\alpha$ 是否有限取决于 $L$。

**外部依赖**：把 slowly varying $L$ 夹在任意小的幂 $x^{\pm\varepsilon}$ 之间，需要 Potter bounds（或 Karamata theory）。配合上面的 tail integral formula 即可比较 $x^{r-1-\alpha\pm\varepsilon}$ 的可积性。当前系列没有建立 regular variation 理论，因此矩阈值定理明确引用这一依赖。

---

## 10. Tail latency 与最大值放大

**定义（分位数）**：随机变量 $X$ 的 $p$-分位数定义为广义逆

$$
q_p(X)
=
\inf\{t:F_X(t)\ge p\},
\qquad p\in(0,1).
$$

tail latency 通常指 $p$ 接近 $1$ 时的 $q_p$，例如 $p=0.95,0.99,0.999$。它由整个尾分布决定，而不只由 $\mathbb E[X]$ 决定。

设 $X_1,\ldots,X_m$ 相互独立且同分布，令

$$
M_m=\max_{1\le i\le m}X_i.
$$

**命题（fan-out 最大值分布）**：

$$
F_{M_m}(t)=F_X(t)^m,
$$

因此

$$
q_p(M_m)=q_{p^{1/m}}(X).
$$

{{< details summary="证明：独立分支的最大值分布" >}}

事件 $\{M_m\le t\}$ 等价于所有分支都不超过 $t$：

$$
\{M_m\le t\}
=
\bigcap_{i=1}^m\{X_i\le t\}.
$$

由独立性，

$$
P(M_m\le t)
=
\prod_{i=1}^mP(X_i\le t)
=F_X(t)^m.
$$

再用广义逆定义：

$$
\begin{aligned}
q_p(M_m)
&=\inf\{t:F_X(t)^m\ge p\}\\
&=\inf\{t:F_X(t)\ge p^{1/m}\}\\
&=q_{p^{1/m}}(X).
\end{aligned}
$$

{{< /details >}}

即使没有独立性，union bound 仍给出

$$
P(M_m>t)
=
P\!\left(\bigcup_{i=1}^m\{X_i>t\}\right)
\le
\sum_{i=1}^mP(X_i>t).
$$

因此 tail latency 的数学入口是生存函数、高分位数、最大值分布和依赖结构；平均延迟只是其中一个积分摘要。

---

## 总结

随机过程用有限维联合分布和样本路径组织时间结构。Bernoulli process 把 Binomial 计数与 Geometric 等待时间连起来；Poisson process 把 Poisson 增量与 Exponential 等待时间连起来；Markov chain 用

$$
P^{(m+n)}=P^{(m)}P^{(n)}
$$

把多步演化压成矩阵乘法，并以 $\pi=\pi P$ 定义平稳分布。

排队部分的中心不是某个孤立公式，而是样本路径面积的双重计数：

$$
L=\lambda W.
$$

重尾和 tail latency 则由

$$
\overline F(t)=P(X>t),
\qquad
q_p=F^{-1}(p)
$$

统一描述；在并行 fan-out 下，最大值把单分支的 $p$-分位推到 $p^{1/m}$ 所对应的更深尾部。

[返回：概率论 Part 3——期望、联合分布、条件期望与方差分解](/notes/math/probability/note-prob-3-expectation-conditioning/)

[返回上一编号：概率论 Part 5——Likelihood、MLE、MAP、区间、检验与 EM](/notes/math/probability/note-prob-5-statistical-inference-em/)

[返回：概率论路线图](/notes/math/probability/note-prob-0-roadmap/)
