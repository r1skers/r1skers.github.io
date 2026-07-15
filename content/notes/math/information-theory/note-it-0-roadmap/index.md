---
date: '2026-07-15T09:30:00+09:00'
draft: false
title: '信息论与信息几何 Part 0：共同基础与两条分支'
summary: "重新整理信息论系列的真实依赖图：熵、联合/条件结构、交叉熵、KL 与互信息构成共同基础；随后分别进入 Shannon 渐近支线与以 Fisher metric、natural gradient、指数族和 Bregman 对偶为核心的信息几何主线。"
description: "信息论与信息几何路线图：共同基础、AEP/典型集的 Shannon 支线、Score/Fisher/KL 局部结构/Natural Gradient/指数族/Legendre 对偶/Bregman 散度的信息几何主线，以及 bits 与 nats 的接口。"
tags: ["Information Theory", "Information Geometry", "Roadmap", "Entropy", "KL Divergence", "Fisher Information"]
categories: ["Crucible"]
---

# 信息论与信息几何 Part 0：共同基础与两条分支

这一组笔记不是一条从熵一路通向信道的直线。更准确地说，它有一组共同基础，并从不同概念处分出两条方向：

    自信息 → 熵 ───────────────→ i.i.d. 序列 + LLN → AEP → 典型集
              │                                         Shannon 支线 S1
              ├→ 联合熵 / 条件熵 ─────────────────────→ 互信息
              │                                          ↑
              └→ H(p) ──────────┐                         │
    交叉熵 H(p,q) ───────────────┴→ KL ────────────────────┘
                                    │
                                    └→ 参数化分布族 → Score → Fisher information
                                                       → KL 局部二阶结构 → Natural Gradient
                                                       → 指数族 → 对偶坐标 → Bregman / KL
                                                                             Information Geometry 主线

AEP 与典型集主要从**熵 + i.i.d. 重复 + 大数定律**长出；information geometry 则从 **KL 在参数化分布族上的微分结构**长出。图中按照 Part 3 的交叉熵分解，把 $H(p)$ 与 $H(p,q)$ 共同接到 KL；也可以绕过交叉熵，直接把 KL 定义为对数似然比在 $p$ 下的期望。互信息是联合/条件熵与 KL 两种语言的汇合点，而不是所有后续方向的单一入口。

---

## 0. 概率论先修接口

这组笔记不重复搭建概率论地基。若相关概念尚未稳定，可按需要回到下面四个接口：

- [**P0：概率论路线图**](/notes/math/probability/note-prob-0-roadmap/)：确认概率基础、渐近理论、统计推断与随机过程之间的整体依赖；
- [**P3：期望、联合分布、条件期望与方差分解**](/notes/math/probability/note-prob-3-expectation-conditioning/)：为熵、条件熵、互信息以及 score 的期望恒等式提供联合与条件结构；
- [**P4：收敛方式、大数定律、中心极限定理与集中不等式**](/notes/math/probability/note-prob-4-limits-concentration/)：为 AEP 中样本平均的依概率收敛提供大数定律；
- [**P5：Likelihood、MLE、MAP、区间、检验与 EM**](/notes/math/probability/note-prob-5-statistical-inference-em/)：为参数化模型、log-likelihood、score、Fisher information 与 information geometry 提供统计推断语境。

它们不是一律必须从头重读：共同基础主要调用 P3，Shannon 渐近支线调用 P4，information geometry 主线则额外调用 P5。

---

## 1. 共同基础

共同基础先把“信息量”“多个变量”“两个分布之间的差异”三件事钉死：

1. [**基础 Part 1：自信息、熵与平均不确定性**](/notes/math/information-theory/note-it-1-entropy-self-information/)

   $$
   \imath_X(x)=-\log_2p_X(x),
   \qquad
   H(X)=\mathbb E[\imath_X(X)].
   $$

2. [**基础 Part 2：联合熵、条件熵与链式法则**](/notes/math/information-theory/note-it-2-joint-conditional-entropy/)

   $$
   H(X,Y)=H(X)+H(Y\mid X).
   $$

3. [**基础 Part 3：交叉熵、KL 散度与互信息**](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)

   $$
   H(p,q)=H(p)+D_{\mathrm{KL}}(p\|q),
   $$

   $$
   I(X;Y)=D_{\mathrm{KL}}(p_{X,Y}\|p_Xp_Y).
   $$

前三篇仍限定在有限离散字母表上。Part 3 是阅读导航上的分叉接口，但真实数学依赖仍应按顶部的图来理解。

---

## 2. Information Geometry 主线

当前重点放在这条线。它不研究“一个信道最多能传多少 bit”，而是研究：

> 当一族概率分布由参数 $\theta$ 描述时，分布空间的局部距离、曲率、坐标与最速下降应如何定义？

主线分为四篇：

1. [**G1：Score Function 与 Fisher Information**](/notes/math/information-geometry/note-ig-1-score-fisher/)

   $$
   s_\theta(x)=\nabla_\theta\ln p_\theta(x),
   \qquad
   G(\theta)=\mathbb E_\theta[s_\theta s_\theta^\top].
   $$

2. [**G2：KL 的局部二阶结构与 Natural Gradient**](/notes/math/information-geometry/note-ig-2-kl-natural-gradient/)

   $$
   D_{\mathrm{KL}}(p_\theta\|p_{\theta+\Delta})
   \mathrel{=}
   \frac12\Delta^\top G(\theta)\Delta
   +o(\|\Delta\|^2),
   $$

   $$
   \widetilde\nabla L=G^{-1}\nabla L.
   $$

3. [**G3：指数族、Log-partition 与 Expectation Parameter**](/notes/math/information-geometry/note-ig-3-exponential-family/)

   $$
   \eta=\nabla A(\theta),
   \qquad
   G(\theta)=\nabla^2A(\theta).
   $$

4. [**G4：Legendre 对偶、Bregman 散度与 KL**](/notes/math/information-geometry/note-ig-4-dual-bregman/)

   $$
   D_{\mathrm{KL}}(p_\theta\|p_{\theta'})
   \mathrel{=}
   B_A(\theta'\|\theta)
   \mathrel{=}
   B_{A^*}(\eta\|\eta').
   $$

这一阶段停在 dually-flat exponential-family geometry 的势函数入口：已经证明对偶坐标、互逆 Hessian 与 KL--Bregman 对应，但只预告 $e/m$-connections 的标准结论，不在当前范围内定义或证明其平坦性。一般 statistical manifold、$\alpha$-connections 与更完整的微分几何结构也暂不展开。

---

## 3. Shannon 渐近支线

现阶段只保留一篇已经闭合的渐近基础：

- [**Shannon 支线 S1：AEP、典型集与熵的渐近意义**](/notes/math/information-theory/note-it-4-aep-typical-set/)

  $$
  -\frac1n\log_2p(X^n)\xrightarrow{P}H(X),
  $$

  $$
  |A_\epsilon^{(n)}|\approx2^{nH(X)}
  \quad\text{（指数尺度）}.
  $$

这篇说明熵如何控制高概率长序列集合的指数规模，并保留它对确定性定长块码最直接的计数 converse。完整信源编码理论、信道容量、信道编码与 rate-distortion 暂不继续展开。

---

## 4. Bits 与 nats：两条线的单位接口

共同基础和 Shannon 支线使用

$$
\log=\log_2,
$$

因此熵与 KL 以 bits 计。

information geometry 主线为了让 score、Fisher information 与 KL Hessian 的标准恒等式不携带额外常数，统一改用自然对数

$$
\ln,
$$

因此 KL 以 nats 计。二者满足

$$
D_{\mathrm{KL}}^{(\mathrm{nats})}
=(\ln2)\,
D_{\mathrm{KL}}^{(\mathrm{bits})},
$$

或者

$$
D_{\mathrm{KL}}^{(\mathrm{bits})}
=\frac{D_{\mathrm{KL}}^{(\mathrm{nats})}}{\ln2}.
$$

正的全局常数不会改变 natural-gradient 的方向，但会改变度量尺度与相应步长，因此各篇必须明确使用哪一种对数。

---

## 5. 两种 “Fisher geometry” 必须分开

这里的 Fisher 指 **Fisher information matrix**

$$
G(\theta)
=\mathbb E_\theta
\left[
\nabla_\theta\ln p_\theta(X)
\nabla_\theta\ln p_\theta(X)^\top
\right],
$$

它来自参数化概率模型的局部统计几何。

博客 Artifact 5.3 中的 “Fisher 几何” 指 Fisher discriminant / LDA 的类内与类间散布准则。二者共享 Fisher 的名字，但研究对象和矩阵都不同，后续不混用。

---

## 阅读顺序

若希望完整保留共同基础中的两种语言，推荐顺序为：

$$
\text{基础 1}
\to
\text{基础 2}
\to
\text{基础 3}
\to
G1
\to
G2
\to
G3
\to
G4.
$$

Shannon S1 在基础 Part 1 与 Part 2 之后即可独立于 Part 3 阅读；其中块熵可加性使用 Part 2 的多变量链式法则，而 AEP 本身直接来自 Part 1 自信息的大数定律。相应的支线路线是

$$
\text{基础 1}
\to
\text{基础 2}
\to
S1.
$$

若只按 information geometry 的最小数学依赖阅读，则可以采用更短的路线：

$$
\text{基础 1}
\to
\text{基础 3 的交叉熵与 KL 部分}
\to
G1
\to
G2
\to
G3
\to
G4.
$$

基础 Part 2 与 Part 3 后半的互信息并不是 G1–G4 的前置条件；它们保留在完整顺序中，是因为联合/条件分布与互信息仍是信息论的共同语言。
