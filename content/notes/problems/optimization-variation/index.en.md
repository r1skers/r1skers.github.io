---
date: '2026-06-23T10:00:00+09:00'
draft: false
title: 'Problem Set · Optimization and Calculus of Variations'
summary: "Companion exercises for the optimization notes — Lagrange multipliers, maximum entropy, softmax, convex duality; mostly 'one thing in two languages' (one says where it is attained, the other why you cannot go lower)."
description: "An optimization / calculus-of-variations problem set: maximum entropy via Lagrange multipliers and Jensen/Gibbs/KL, optimal code length, the Gaussian as max-entropy, softmax and convex duality, with reference solutions."
tags: ["Problems", "Exercises", "Optimization", "Calculus of Variations"]
categories: ["Crucible"]
problemPage: true
---

# Problem Set · Optimization and Calculus of Variations

Companion exercises for [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/). Most carry a "prove it again in another language" flavor — Lagrange says "where it is attained," convexity / KL says "why you cannot go lower."

{{< problem-map kind="optimization" >}}

---

{{% problem-section title="Lagrange Multipliers and Maximum Entropy" %}}

{{% problem-exercise title="Maximum entropy via Lagrange multipliers and Jensen's inequality" %}}

Let $|\mathcal{X}|=3$. Find the maximum of the entropy

$$
H(p_1,p_2,p_3)=-\sum_{i=1}^3 p_i\ln p_i
$$

subject to $\sum_i p_i=1$; prove via both the method of Lagrange multipliers and Jensen's inequality that it is attained at $p_1=p_2=p_3=\tfrac13$, and appreciate that the two are one thing in two languages.

*See also: [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/) · [Information Theory Part 1 · Self-information and entropy](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Lagrange language (find the stationary point).** We want to maximize the entropy $H=-\sum_{i=1}^3 p_i\ln p_i$ subject to $p_1+p_2+p_3=1$, which we first write as $g(p)=\sum_i p_i-1=0$. Build the Lagrangian

$$
L(p_1,p_2,p_3,\lambda)=-\sum_{i=1}^3 p_i\ln p_i+\lambda\Big(\sum_{i=1}^3 p_i-1\Big),
$$

i.e. "new function = the entropy to maximize $+\ \lambda\times$ the constraint."

Differentiate with respect to each $p_i$. Looking at a single term $-p_i\ln p_i$:

$$
\frac{d}{dp_i}\big(-p_i\ln p_i\big)=-(\ln p_i+1),
$$

so

$$
\frac{\partial L}{\partial p_i}=-(\ln p_i+1)+\lambda=0
\ \Longrightarrow\
\ln p_i=\lambda-1
\ \Longrightarrow\
p_i=e^{\lambda-1}.
$$

The right side is independent of $i$, so $p_1=p_2=p_3$. Substituting into the constraint $\sum_i p_i=1$:

$$
3\,e^{\lambda-1}=1\ \Longrightarrow\ p_i=\tfrac13,\qquad H_{\max}=\ln 3.
$$

$H$ is concave (each $-p\ln p$ is concave) and the constraint is linear, so this unique stationary point is the global maximum.

**Jensen language (a global inequality).** Write $H$ as an expectation and apply Jensen to the concave function $\ln$ ($\mathbb{E}[\ln X]\le\ln\mathbb{E}[X]$, with $X=1/p_i$ under the distribution $p$):

$$
H(p)=\sum_i p_i\ln\frac{1}{p_i}
=\mathbb{E}\!\left[\ln\frac{1}{p_i}\right]
\le\ln\mathbb{E}\!\left[\frac{1}{p_i}\right]
=\ln\Big(\sum_i p_i\cdot\frac{1}{p_i}\Big)
=\ln 3,
$$

with equality iff $1/p_i$ is constant, i.e. $p_i=\tfrac13$.

**The two languages.** Lagrange is the "stationarity language" — solving the first-order condition on the constraint manifold to find the balance point; Jensen is the "convexity language" — using the concavity of $\ln$ to hand you the global upper bound $\ln 3$ directly, with equality pinning down the optimum. Because the unique stationary point of a "concave objective + convex feasible set" must be the global optimum, the two paths necessarily agree at $p_i=\tfrac13$: the former tells you "where it is attained," the latter "why it cannot be larger."

{{< /details >}}

{{% problem-exercise title="Optimal code length via Lagrange multipliers (minimum expected length = entropy)" %}}

Given a source distribution $p=(p_1,\dots,p_n)$, assign each symbol a binary prefix code with length $l_i$. Any uniquely decodable code satisfies the **Kraft inequality** $\sum_i 2^{-l_i}\le 1$. Find the lengths minimizing the expected code length $\bar L=\sum_i p_i l_i$ (relaxing $l_i$ to reals), prove the minimum equals the entropy $H(p)=-\sum_i p_i\log_2 p_i$; then give the same result in another language via the Gibbs / KL inequality, and note the gap caused by integrality.

*See also: [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/) · [Information Theory Part 1 · Self-information and entropy](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Lagrange language (find the stationary point).** At the optimum Kraft is tight, $\sum_i 2^{-l_i}=1$. Write the expected length as $\bar L=\sum_i p_i l_i$ (it is *not* the same object as the Lagrangian $L$ below). Build

$$
L(l_1,\dots,l_n,\lambda)=\sum_i p_i l_i+\lambda\Big(\sum_i 2^{-l_i}-1\Big).
$$

Differentiate with respect to $l_i$ (using $\frac{d}{dl}2^{-l}=-\ln 2\cdot 2^{-l}$):

$$
\frac{\partial L}{\partial l_i}=p_i-\lambda\ln 2\cdot 2^{-l_i}=0
\ \Longrightarrow\
2^{-l_i}=\frac{p_i}{\lambda\ln 2}.
$$

Substituting into $\sum_i 2^{-l_i}=1$ and using $\sum_i p_i=1$ gives $\lambda\ln 2=1$, so

$$
2^{-l_i}=p_i\ \Longrightarrow\ l_i^*=-\log_2 p_i,
\qquad
\bar L_{\min}=\sum_i p_i(-\log_2 p_i)=H(p).
$$

**Gibbs / KL language (a global inequality).** For any Kraft-feasible code, let $c=\sum_i 2^{-l_i}\le 1$ and $q_i=2^{-l_i}/c$ (a distribution). Then

$$
\bar L-H(p)=\sum_i p_i\log_2\frac{p_i}{2^{-l_i}}
=\underbrace{\sum_i p_i\log_2\frac{p_i}{q_i}}_{=\,D(p\,\|\,q)\,\ge\,0}-\log_2 c\ \ge\ 0,
$$

since the KL divergence $D(p\,\|\,q)\ge 0$ (Gibbs) and $\log_2 c\le 0$. Equality holds iff $p=q$ and $c=1$, i.e. $2^{-l_i}=p_i$, $l_i=-\log_2 p_i$ — the same optimum as Lagrange.

**The two languages.** Lagrange solves the first-order condition and pins down the optimal lengths $l_i^*=-\log_2 p_i$ directly; Gibbs/KL uses nonnegativity of divergence to hand you the global lower bound $\bar L\ge H$, with equality marking the optimum. One says "where it is attained," the other "why you cannot go below it" — the same pattern as E1.

**The integer reality (don't be fooled).** $l_i^*=-\log_2 p_i$ is generally **not an integer**, yet real code lengths must be positive integers. So "$\bar L=H$" is attained exactly only when every $p_i$ is a power of $1/2$ (dyadic); in general one rounds up, and the Shannon code $l_i=\lceil-\log_2 p_i\rceil$ gives

$$
H(p)\le \bar L\lt H(p)+1.
$$

That is: Lagrange solves the **continuous relaxation** of the integer problem; entropy is the unbeatable lower bound, approachable (arbitrarily closely with block coding) but not always attained exactly.

{{< /details >}}

{{% problem-exercise title="The Gaussian as a maximum-entropy distribution (Lagrange multipliers and Gibbs)" %}}

Among all continuous probability densities with mean $\mu$ and variance $\sigma^2$, maximize the differential entropy $h[p]=-\int p\ln p\,dx$. Prove, both via Lagrange multipliers (a variation on the density) and via Gibbs' inequality, that the maximum-entropy distribution is the Gaussian $\mathcal N(\mu,\sigma^2)$, and appreciate that the two are one thing in two languages.

*See also: [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/) · [Information Theory Part 1 · Self-information and entropy](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Lagrange language (variation, find the stationary point).** Attach a multiplier to each of the three constraints $\int p\,dx=1$, $\int xp\,dx=\mu$, $\int(x-\mu)^2p\,dx=\sigma^2$, forming the functional

$$
L[p]=-\int p\ln p\,dx+\lambda_0\Big(\int p\,dx-1\Big)+\lambda_1\Big(\int xp\,dx-\mu\Big)+\lambda_2\Big(\int(x-\mu)^2p\,dx-\sigma^2\Big).
$$

Take the variation $\delta L/\delta p=0$ (differentiate the integrand pointwise with respect to $p$; with no $p'$ term, the Euler–Lagrange equation reduces to a pointwise condition):

$$
-\ln p(x)-1+\lambda_0+\lambda_1 x+\lambda_2(x-\mu)^2=0
\ \Longrightarrow\
p(x)=\exp\!\big(\lambda_0-1+\lambda_1 x+\lambda_2(x-\mu)^2\big).
$$

The right side is $\exp(\text{quadratic in }x)$, necessarily a Gaussian. The three constraints (normalization + mean + variance) fix the constants to $\lambda_1=0,\ \lambda_2=-\tfrac{1}{2\sigma^2}$, i.e.

$$
p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{(x-\mu)^2}{2\sigma^2}\Big)=\mathcal N(\mu,\sigma^2).
$$

(Differential entropy is concave and the constraints are linear, so this unique stationary point is the global maximum.)

**Gibbs language (a global inequality).** Let $g=\mathcal N(\mu,\sigma^2)$. For any density $p$ with the same mean $\mu$ and variance $\sigma^2$, the KL divergence is nonnegative:

$$
0\le D(p\,\|\,g)=\int p\ln\frac{p}{g}\,dx=-h(p)-\int p\ln g\,dx
\ \Longrightarrow\
h(p)\le-\int p\ln g\,dx.
$$

Key: $\ln g(x)=-\tfrac12\ln(2\pi\sigma^2)-\tfrac{(x-\mu)^2}{2\sigma^2}$ is quadratic in $x$, so $-\int p\ln g$ **depends on $p$ only through its normalization and second moment**, which match those of $g$:

$$
-\int p\ln g\,dx=\tfrac12\ln(2\pi\sigma^2)+\frac{1}{2\sigma^2}\underbrace{\int p\,(x-\mu)^2\,dx}_{=\sigma^2}=\tfrac12\ln(2\pi e\sigma^2)=h(g).
$$

Hence $h(p)\le h(g)$, with equality iff $p=g$. The maximum differential entropy is $h_{\max}=\tfrac12\ln(2\pi e\sigma^2)$.

**The two languages.** Lagrange solves the variational first-order condition and pins down the **shape** of the optimum ($\exp$ of a quadratic = Gaussian); Gibbs uses nonnegativity of KL plus "the cross-entropy with a Gaussian sees only the second moment" to hand you the **global upper bound** $h\le h(g)$, with equality marking the optimum. One says "what it looks like," the other "why nothing beats it" — the same pattern as E1, only here lifted from finite dimensions to a **variation on the density** (§8 of the note).

**Two details.** ① This is **differential** entropy (continuous): it can be negative and is not coordinate-invariant, but the relative statement "maximal given the moments" is clean; ② the constraint must fix **both** mean and variance — the Gibbs step relies precisely on $p,g$ sharing both moments.

{{< /details >}}

<a id="softmax-maximum-entropy"></a>

{{% problem-exercise title="softmax as a maximum-entropy distribution (Lagrange multipliers and convex duality)" %}}

$n$ outcomes, each with a "score" $z_i$. Maximize the entropy $H(p)=-\sum_i p_i\ln p_i$ subject to a fixed expected score $\sum_i p_i z_i$. Prove via Lagrange multipliers that the maximum-entropy distribution is the softmax $p_i=e^{\beta z_i}/\sum_j e^{\beta z_j}$; then, in the language of convex duality, see softmax as the gradient of log-sum-exp.

*See also: [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/) · [Information Theory Part 1 · Self-information and entropy](/notes/math/information-theory/note-it-1-entropy-self-information/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Lagrange language (find the stationary point).** Constraints $\sum_i p_i=1$ and $\sum_i p_i z_i=\bar z$. The Lagrangian is

$$
L=-\sum_i p_i\ln p_i+\lambda\Big(\sum_i p_i-1\Big)+\beta\Big(\sum_i p_i z_i-\bar z\Big).
$$

Set the partial derivatives to zero:

$$
\frac{\partial L}{\partial p_i}=-\ln p_i-1+\lambda+\beta z_i=0
\ \Longrightarrow\
p_i=e^{\lambda-1+\beta z_i}\propto e^{\beta z_i}.
$$

Normalizing gives

$$
p_i=\frac{e^{\beta z_i}}{\sum_j e^{\beta z_j}}=\operatorname{softmax}(\beta z)_i.
$$

The multiplier $\beta$ (the "inverse temperature") is set by the expected-score constraint $\bar z$: $\beta\to 0$ returns the uniform distribution, $\beta\to\infty$ concentrates on the largest $z_i$ (the hard argmax).

**Convex-duality language (softmax is $\nabla$ log-sum-exp).** An equivalent phrasing: treat the entropy as a regularizer and do entropy-regularized linear maximization over the simplex $\Delta$,

$$
\max_{p\in\Delta}\ \langle p,z\rangle+\tfrac1\beta H(p).
$$

The same Lagrange step (normalization constraint) yields the same $p=\operatorname{softmax}(\beta z)$, and the optimal value is exactly

$$
\tfrac1\beta\ln\sum_i e^{\beta z_i}=\tfrac1\beta\operatorname{LSE}(\beta z),
\qquad
\nabla\operatorname{LSE}(z)=\operatorname{softmax}(z).
$$

Log-sum-exp is the **convex conjugate** of negative entropy on the simplex, and softmax is the gradient of that convex potential.

**Two views.** Lagrange: max-entropy plus the expected-score constraint solves directly for the $e^{\beta z}$ shape; convex duality: softmax is the gradient of LSE, and LSE is the conjugate of negative entropy.

{{< /details >}}

{{% /problem-section %}}
