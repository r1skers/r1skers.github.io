---
date: '2026-07-15T13:15:00+09:00'
draft: false
title: '概率论 Part 5：Likelihood、MLE、MAP、区间、检验与 EM'
summary: "在受支配统计模型中定义 likelihood、MLE 与 MAP，以覆盖率和功效严格定义区间与检验，再由 ELBO–KL 恒等式推出 EM 的 E/M 两步和似然单调性。"
description: "统计推断基础：统计模型、likelihood、MLE、MAP、置信集覆盖率、pivot 构造、假设检验、p-value、Neyman–Pearson 引理、隐变量模型、ELBO 与 EM 单调性证明。"
tags: ["Statistics", "Likelihood", "Maximum Likelihood", "MAP", "Confidence Interval", "Hypothesis Testing", "Neyman-Pearson", "EM Algorithm", "Proof"]
categories: ["Crucible"]
math: true
---

# 概率论 Part 5：Likelihood、MLE、MAP、区间、检验与 EM

> 前四篇从给定概率模型推出随机变量的分布与渐近规律。统计推断把方向反过来：观测已经出现，模型族 $\{P_\theta\}$ 已给定，目标是从数据约束未知的 $\theta$。本篇限定在有限维参数模型，并在使用密度时明确指定共同支配测度。

本篇的链条是

$$
\{P_\theta:\theta\in\Theta\}
\longrightarrow
L(\theta;x)
\longrightarrow
\mathrm{MLE}/\mathrm{MAP}
\longrightarrow
\text{区间与检验}
\longrightarrow
\text{隐变量与 EM}.
$$

---

## 1. 统计模型、样本与估计量

**定义（统计模型）**：在可测样本空间 $(\mathcal X,\mathcal A)$ 上，一族由参数 $\theta\in\Theta$ 索引的概率测度

$$
\mathcal P=\{P_\theta:\theta\in\Theta\}
$$

称为统计模型。

观测随机变量记为 $X$，观测值记为 $x$。若有 i.i.d. 样本，写作

$$
X_1,\ldots,X_n\overset{\mathrm{i.i.d.}}{\sim}P_\theta,
\qquad
x_{1:n}=(x_1,\ldots,x_n).
$$

**定义（估计量）**：从样本空间到参数或决策空间的可测函数

$$
T:\mathcal X^n\to\mathcal D
$$

称为统计量；若用于估计参数，则称为估计量。随机对象是 $T(X_{1:n})$，数据给定后得到实现值 $T(x_{1:n})$。

---

## 2. Likelihood 与 log-likelihood

假设模型族被同一个 $\sigma$-有限测度 $\nu$ 支配：

$$
P_\theta\ll\nu,
\qquad
p_\theta=\frac{dP_\theta}{d\nu}.
$$

离散模型可取 counting measure，通常的连续密度模型可取 Lebesgue measure。

**定义（likelihood）**：固定观测 $x$ 后，

$$
L(\theta;x)=p_\theta(x)
$$

作为 $\theta$ 的函数称为 likelihood。对应的 log-likelihood 为

$$
\ell(\theta;x)=\ln p_\theta(x).
$$

全文约定 $\ln0=-\infty$，所以 log-likelihood 是 extended-real-valued function。为排除整个模型都不给当前观测正密度的退化情况，以下讨论固定 $x$ 时假设至少存在一个 $\theta_0\in\Theta$ 使 $L(\theta_0;x)>0$。

对 i.i.d. 样本，乘积测度给出

$$
L(\theta;x_{1:n})
\mathrel{=}
\prod_{i=1}^np_\theta(x_i),
$$

所以

$$
\ell(\theta;x_{1:n})
\mathrel{=}
\sum_{i=1}^n\ln p_\theta(x_i).
$$

后文与 information geometry 一致，likelihood 微分一律使用自然对数。

---

## 3. 最大似然估计

**定义（MLE）**：最大似然估计的取值集合为

$$
\widehat\Theta_{\mathrm{MLE}}(x)
\mathrel{=}
\operatorname*{arg\,max}_{\theta\in\Theta}L(\theta;x)
\mathrel{=}
\operatorname*{arg\,max}_{\theta\in\Theta}\ell(\theta;x).
$$

这里第二个等号来自 extended logarithm 在 $[0,\infty)$ 上严格单调；上述正 likelihood 假设保证 $\ell(\cdot;x)$ 不恒等于 $-\infty$。

若最大点唯一，记为 $\hat\theta_{\mathrm{MLE}}$。一般模型中最大值可能不被达到或不唯一，因此 argmax 应先理解为集合值对象；存在唯一性需要由参数空间紧性、上半连续性、严格凹性或模型的其他结构另行保证。

若 $\Theta$ 是开集、$\ell$ 可微且最大点位于内部，则一阶必要条件是

$$
\nabla_\theta\ell(\hat\theta;x)=0.
$$

但驻点只是候选点；要推出全局最大还需要凹性或全局比较。

### 渐近性质的依赖边界

在可识别、正则、有限维的 i.i.d. 模型中，MLE 常满足一致性和渐近正态性：

$$
\hat\theta_n\xrightarrow{P}\theta_0,
$$

$$
\sqrt n(\hat\theta_n-\theta_0)
\xrightarrow{d}
\mathcal N(0,I(\theta_0)^{-1}).
$$

**外部依赖**：一致性通常需要 uniform law of large numbers、模型可识别性和 argmax theorem；渐近正态性需要 score 的 CLT、Hessian 的 LLN、Taylor 展开以及 Fisher information 非奇异。这些条件不能压缩成“样本够大”四个字，本篇不证明这一整套 M-estimation 理论。Fisher information 的微分结构见 [信息几何 G1](/notes/math/information-geometry/note-ig-1-score-fisher/)。

---

## 4. 最大后验估计

现在把参数本身放在概率空间上。设先验分布 $\Pi$ 相对于参数空间上的支配测度 $m$ 有密度 $\pi(\theta)$。若

$$
0\lt\int_\Theta L(\vartheta;x)\pi(\vartheta)\,m(d\vartheta)\lt\infty,
$$

Bayes 公式给出后验密度

$$
\pi(\theta\mid x)
\mathrel{=}
\frac{L(\theta;x)\pi(\theta)}
{\int_\Theta L(\vartheta;x)\pi(\vartheta)\,m(d\vartheta)}.
$$

**定义（MAP）**：

$$
\widehat\Theta_{\mathrm{MAP}}(x)
\mathrel{=}
\operatorname*{arg\,max}_{\theta\in\Theta}
\pi(\theta\mid x).
$$

分母与 $\theta$ 无关，所以等价地

$$
\widehat\Theta_{\mathrm{MAP}}(x)
\mathrel{=}
\operatorname*{arg\,max}_{\theta\in\Theta}
\left[\ell(\theta;x)+\ln\pi(\theta)\right].
$$

MAP 是后验密度的众数；完整 Bayesian inference 的对象则是整个后验概率测度。密度众数还依赖参数化和参考测度，因此若需要坐标不变的点决策，应从明确的损失函数与 Bayes risk 出发；完整统计决策理论不属于本篇范围。

---

## 5. 置信集：覆盖率是随机区间的性质

**定义（置信集）**：随机集合 $C(X)\subseteq\Theta$ 若满足对每个 $\theta\in\Theta$，

$$
P_\theta(\theta\in C(X))\ge1-\alpha,
$$

则称 $C$ 是覆盖率至少为 $1-\alpha$ 的置信集。若 $\Theta\subseteq\mathbb R$ 且 $C(X)$ 是区间，则称为置信区间。

覆盖概率由抽样分布 $P_\theta$ 计算；参数 $\theta$ 在频率学派模型中是固定索引，随机性来自样本和由样本生成的集合 $C(X)$。

### Pivot 构造

**定理（由 pivot 构造置信集）**：设 $T_\theta(X)$ 的分布不依赖 $\theta$。若存在可测集合 $A$ 满足

$$
P_\theta(T_\theta(X)\in A)=1-\alpha
\quad\text{对所有 }\theta,
$$

则

$$
C(X)=\{\theta:T_\theta(X)\in A\}
$$

是精确覆盖率 $1-\alpha$ 的置信集。

{{< details summary="证明：反演 pivot 得到覆盖率" >}}

对任意固定 $\theta$，事件

$$
\{\theta\in C(X)\}
$$

按 $C$ 的定义正好等于

$$
\{T_\theta(X)\in A\}.
$$

所以

$$
P_\theta(\theta\in C(X))
\mathrel{=}
P_\theta(T_\theta(X)\in A)
=1-\alpha.
$$

{{< /details >}}

若 pivot 只在渐近意义下具有参数无关分布，则由它得到的是渐近置信集；有限样本覆盖率需要单独误差控制。

---

## 6. 假设检验

把参数空间拆成互不相交的两部分：

$$
H_0:\theta\in\Theta_0,
\qquad
H_1:\theta\in\Theta_1.
$$

**定义（随机化检验）**：可测函数

$$
\varphi:\mathcal X\to[0,1]
$$

称为检验。观测 $x$ 后，以概率 $\varphi(x)$ 拒绝 $H_0$。非随机化检验取值只在 $\{0,1\}$。

检验在参数 $\theta$ 下的拒绝概率为

$$
\beta_\varphi(\theta)=\mathbb E_\theta[\varphi(X)],
$$

称为 power function。其 size 为

$$
\sup_{\theta\in\Theta_0}\beta_\varphi(\theta).
$$

若 size 不超过 $\alpha$，则称为 level-$\alpha$ 检验。

### p-value 的校准定义

**定义（valid p-value）**：统计量 $p(X)\in[0,1]$ 若对每个 $u\in[0,1]$ 与每个 $\theta\in\Theta_0$ 满足

$$
P_\theta(p(X)\le u)\le u,
$$

则称 $p(X)$ 是对 $H_0$ 有效的 p-value。

**命题**：规则

$$
\varphi_\alpha(X)=\mathbf1_{\{p(X)\le\alpha\}}
$$

是 level-$\alpha$ 检验。

{{< details summary="证明：有效 p-value 控制一类错误" >}}

对任意 $\theta\in\Theta_0$，

$$
\mathbb E_\theta[\varphi_\alpha(X)]
\mathrel{=}
P_\theta(p(X)\le\alpha)
\le\alpha.
$$

对 $\Theta_0$ 取上确界仍不超过 $\alpha$。

{{< /details >}}

---

## 7. Neyman–Pearson 引理

考虑 simple-vs-simple 假设：

$$
H_0:P=P_0,
\qquad
H_1:P=P_1,
$$

其中二者相对于共同测度 $\nu$ 的密度为 $f_0,f_1$。

**定理（Neyman–Pearson）**：假设存在 $k\ge0$ 与 $\gamma\in[0,1]$，使检验

$$
\varphi^*(x)
\mathrel{=}
\mathbf1_{\{f_1(x)>kf_0(x)\}}
+
\gamma\mathbf1_{\{f_1(x)=kf_0(x)\}}
$$

满足 $\mathbb E_0[\varphi^*]=\alpha$。则对任意满足 $\mathbb E_0[\varphi]\le\alpha$ 的检验 $\varphi$，

$$
\mathbb E_1[\varphi]
\le
\mathbb E_1[\varphi^*].
$$

即 likelihood-ratio 检验在所有 level-$\alpha$ 检验中对 $P_1$ 功效最大。

{{< details summary="证明：Neyman–Pearson 引理" >}}

逐点有

$$
(\varphi-\varphi^*)(f_1-kf_0)\le0.
$$

因为当 $f_1>kf_0$ 时 $\varphi^*=1$，故 $\varphi-\varphi^*\le0$；当 $f_1\lt kf_0$ 时 $\varphi^*=0$，故 $\varphi-\varphi^*\ge0$；在等号集合上第二因子为零。

积分得到

$$
\mathbb E_1[\varphi]-\mathbb E_1[\varphi^*]
\le
k\bigl(\mathbb E_0[\varphi]-\mathbb E_0[\varphi^*]\bigr).
$$

右侧不超过

$$
k(\alpha-\alpha)=0,
$$

所以 $\mathbb E_1[\varphi]\le\mathbb E_1[\varphi^*]$。

{{< /details >}}

选择 $k,\gamma$ 使 size 恰为 $\alpha$ 的存在性依赖 likelihood ratio 在 $P_0$ 下的分布；有原子时边界随机化 $\gamma$ 用来补齐精确 size。

---

## 8. 区间与检验的反演关系

设对每个 $\theta_0\in\Theta$，$\varphi_{\theta_0}(X)\in\{0,1\}$ 是检验点假设 $H_0:\theta=\theta_0$ 的非随机化 level-$\alpha$ 检验。定义所有未被拒绝参数组成的集合

$$
C(X)=\{\theta_0:\varphi_{\theta_0}(X)=0\}.
$$

**命题**：$C(X)$ 是覆盖率至少 $1-\alpha$ 的置信集。

{{< details summary="证明：反演检验得到置信集" >}}

对真实参数 $\theta$，

$$
\begin{aligned}
P_\theta(\theta\in C(X))
&=P_\theta(\varphi_\theta(X)=0)\\
&=1-P_\theta(\varphi_\theta(X)=1)\\
&\ge1-\alpha.
\end{aligned}
$$

{{< /details >}}

因此置信集与一族点假设检验不是两个孤立构造，而是同一个接受域结构的两种读取方式。

---

## 9. 隐变量模型

设 $X$ 可观测，$Z$ 不可观测，联合模型相对于共同测度具有密度

$$
p_\theta(x,z).
$$

观测数据密度由边缘化得到：

$$
p_\theta(x)
\mathrel{=}
\int p_\theta(x,z)\,\nu(dz),
$$

离散 $Z$ 时积分换成求和。观测 log-likelihood 为

$$
\ell(\theta;x)
\mathrel{=}
\ln\int p_\theta(x,z)\,\nu(dz).
$$

对数位于边缘化积分外部，这使直接最大化通常不能分解。EM 的做法是引入 $Z$ 上的辅助分布 $q$，把这层“log of integral”改写成一条精确的 ELBO–KL 恒等式。

---

## 10. ELBO 恒等式

固定观测 $x$，假设 $p_\theta(x)>0$。后验密度为

$$
p_\theta(z\mid x)
\mathrel{=}
\frac{p_\theta(x,z)}{p_\theta(x)}.
$$

取任意满足所需绝对连续性与可积性的概率密度 $q(z)$。定义

$$
\mathcal L(q,\theta)
\mathrel{=}
\mathbb E_q[\ln p_\theta(x,Z)]
\mathbin{-}
\mathbb E_q[\ln q(Z)].
$$

第二项的负号使它等于 $q$ 的 entropy；$\mathcal L$ 称为 evidence lower bound。

**定理（ELBO–KL decomposition）**：

$$
\ln p_\theta(x)
\mathrel{=}
\mathcal L(q,\theta)
+
D_{\mathrm{KL}}\!\left(q\|p_\theta(\cdot\mid x)\right).
$$

{{< details summary="证明：ELBO–KL 恒等式" >}}

由后验公式，

$$
\ln p_\theta(z\mid x)
\mathrel{=}
\ln p_\theta(x,z)-\ln p_\theta(x).
$$

代入 KL：

$$
\begin{aligned}
D_{\mathrm{KL}}(q\|p_\theta(\cdot\mid x))
&=\mathbb E_q\!\left[
\ln\frac{q(Z)}{p_\theta(Z\mid x)}
\right]\\
&=\mathbb E_q[\ln q(Z)]
-\mathbb E_q[\ln p_\theta(x,Z)]
+\ln p_\theta(x)\\
&=\ln p_\theta(x)-\mathcal L(q,\theta).
\end{aligned}
$$

移项即得结论。

{{< /details >}}

由 KL 非负，

$$
\mathcal L(q,\theta)\le\ln p_\theta(x),
$$

且在允许的支撑条件下，等号成立当且仅当

$$
q(z)=p_\theta(z\mid x)
\quad\text{a.e.}
$$

这里的 KL 使用自然对数，单位为 nats。其非负性见 [信息论 Part 3](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)；由 bits 切换到 nats 只乘正数 $\ln2$，不改变非负性与零点。

---

## 11. EM 算法与似然单调性

给定当前参数 $\theta^{(t)}$，EM 定义两步：

**E-step**：

$$
q^{(t)}(z)
\mathrel{=}
p_{\theta^{(t)}}(z\mid x).
$$

此时 ELBO 在当前参数处贴住观测 log-likelihood：

$$
\mathcal L(q^{(t)},\theta^{(t)})
\mathrel{=}
\ell(\theta^{(t)};x).
$$

**M-step**：选择

$$
\theta^{(t+1)}
\in
\operatorname*{arg\,max}_\theta
\mathcal L(q^{(t)},\theta).
$$

因为 $q^{(t)}$ 固定时 entropy 项与 $\theta$ 无关，这等价于最大化

$$
Q(\theta\mid\theta^{(t)})
\mathrel{=}
\mathbb E_{Z\mid x,\theta^{(t)}}
[\ln p_\theta(x,Z)].
$$

**定理（EM 的观测似然单调性）**：只要 E/M 两步定义良好且 M-step 不降低目标，就有

$$
\ell(\theta^{(t+1)};x)
\ge
\ell(\theta^{(t)};x).
$$

{{< details summary="证明：EM 每步不降低观测 log-likelihood" >}}

ELBO 是 log-likelihood 下界，所以

$$
\ell(\theta^{(t+1)};x)
\ge
\mathcal L(q^{(t)},\theta^{(t+1)}).
$$

M-step 不降低 ELBO，因此

$$
\mathcal L(q^{(t)},\theta^{(t+1)})
\ge
\mathcal L(q^{(t)},\theta^{(t)}).
$$

E-step 使当前参数处的 KL 为零，所以

$$
\mathcal L(q^{(t)},\theta^{(t)})
\mathrel{=}
\ell(\theta^{(t)};x).
$$

把三式串联：

$$
\ell(\theta^{(t+1)};x)
\ge
\mathcal L(q^{(t)},\theta^{(t+1)})
\ge
\mathcal L(q^{(t)},\theta^{(t)})
\mathrel{=}
\ell(\theta^{(t)};x).
$$

{{< /details >}}

单调性只保证标量序列 $\ell(\theta^{(t)};x)$ 不下降。要进一步保证参数序列收敛、极限点是 stationary point，或收敛到全局最大值，需要紧性、连续可微性、level-set 有界性与目标几何等额外条件。相应的 EM 收敛定理是外部依赖；当前证明没有作出这些更强结论。

---

## 总结与接口

在受支配模型中，likelihood 把观测固定、把参数留作变量：

$$
L(\theta;x)=p_\theta(x).
$$

MLE 最大化数据项，MAP 最大化数据项与先验项之和；置信集由重复抽样覆盖率校准，检验由 size 与 power 校准。隐变量模型中，

$$
\ln p_\theta(x)
\mathrel{=}
\mathcal L(q,\theta)
+D_{\mathrm{KL}}(q\|p_\theta(\cdot\mid x))
$$

把 EM 的两步和似然单调性压进同一条恒等式。

从这里沿 $\nabla_\theta\ell$、Fisher information 和 KL 的局部二阶结构继续，就是 [信息几何 G1：Score Function 与 Fisher Information](/notes/math/information-geometry/note-ig-1-score-fisher/)。

[返回：概率论 Part 4——收敛方式、大数定律、中心极限定理与集中不等式](/notes/math/probability/note-prob-4-limits-concentration/)

[继续另一支线：概率论 Part 6——随机过程、Markov 链、排队与尾延迟](/notes/math/probability/note-prob-6-stochastic-processes-queues/)

[返回：概率论路线图](/notes/math/probability/note-prob-0-roadmap/)
