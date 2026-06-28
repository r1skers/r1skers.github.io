---
date: '2026-06-23T10:00:00+09:00'
draft: false
title: 'Problem Set'
summary: "Companion exercises grouped by topic, listed one per entry with a collapsible solution. Consolidated now and split later: a sparse topic gets a short section, and a topic gets its own page once it grows."
description: "A companion problem set for the math notes, grouped by topic and listed problem by problem, with reference solutions; many include a 'prove it again in another language' prompt."
tags: ["Problems", "Exercises"]
categories: ["Crucible"]
aliases:
  - /notes/problem-set/
---

# Problem Set

Companion exercises grouped by topic, listed one per entry, each with a collapsible reference solution. Consolidated now and split later: a sparse topic gets a short section for now; once a topic accumulates a dozen or so problems, or a page has so much math that the first paint lags, it is split into its own page.

> Many problems carry a "prove it again in another language" flavor — re-deriving the same result with a different tool (convexity, geometry, variation…). The point is not the answer but seeing that it is the same thing as something elsewhere.

---

## Optimization and Calculus of Variations

### Maximum entropy via Lagrange multipliers and Jensen's inequality

Let $|\mathcal{X}|=3$. Find the maximum of the entropy

$$
H(p_1,p_2,p_3)=-\sum_{i=1}^3 p_i\ln p_i
$$

subject to $\sum_i p_i=1$; prove via both the method of Lagrange multipliers and Jensen's inequality that it is attained at $p_1=p_2=p_3=\tfrac13$, and appreciate that the two are one thing in two languages.

*See also: [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/) · [Knowledge map · Entropy](https://r1skers.github.io/r1skers-knowledge-map/?map=probability&node=%E7%86%B5)*

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

### Optimal code length via Lagrange multipliers (minimum expected length = entropy)

Given a source distribution $p=(p_1,\dots,p_n)$, assign each symbol a binary prefix code with length $l_i$. Any uniquely decodable code satisfies the **Kraft inequality** $\sum_i 2^{-l_i}\le 1$. Find the lengths minimizing the expected code length $\bar L=\sum_i p_i l_i$ (relaxing $l_i$ to reals), prove the minimum equals the entropy $H(p)=-\sum_i p_i\log_2 p_i$; then give the same result in another language via the Gibbs / KL inequality, and note the gap caused by integrality.

*See also: [The Lagrangian Function and the Lagrange Operator](/en/notes/math/optimization-variation/note-opt-lagrangian/) · [Knowledge map · Entropy](https://r1skers.github.io/r1skers-knowledge-map/?map=probability&node=%E7%86%B5)*

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

---

## The Pigeonhole Principle

### Five lattice points force an integer midpoint

Take any 5 lattice points in the plane (integer coordinates). Prove that some two of them have a midpoint that is also a lattice point.

{{< details summary="Reference solution" >}}

The midpoint $\big(\tfrac{x_1+x_2}{2},\tfrac{y_1+y_2}{2}\big)$ of $(x_1,y_1),(x_2,y_2)$ is a lattice point iff

$$
x_1\equiv x_2 \pmod 2 \ \text{and}\ y_1\equiv y_2 \pmod 2,
$$

i.e. the two coordinates match in parity **separately**. Label each point by its parity

$$
(x\bmod 2,\ y\bmod 2)\in\{(0,0),(0,1),(1,0),(1,1)\},
$$

4 values in all. Five points into 4 labels, pigeonhole $\Rightarrow$ two share a label $\Rightarrow$ their midpoint is a lattice point. $\blacksquare$

**Bound is tight.** Four points, one per class (e.g. $(0,0),(1,0),(0,1),(1,1)$), have no integer midpoint, so 5 cannot be reduced. In general, guaranteeing an integer midpoint among $d$-dimensional lattice points needs $2^d+1$ points.

{{< /details >}}

### A consecutive subsum divisible by n

Given $n$ integers $a_1,\dots,a_n$ (repeats allowed, any sign). Prove that some **consecutive** block $a_{i+1}+a_{i+2}+\cdots+a_j$ is divisible by $n$.

{{< details summary="Reference solution" >}}

Let the prefix sums be $S_0=0,\ S_k=a_1+\cdots+a_k\ (1\le k\le n)$; a consecutive block is exactly a difference of two prefix sums,

$$
a_{i+1}+\cdots+a_j=S_j-S_i.
$$

There are $n+1$ prefix sums $S_0,S_1,\dots,S_n$, but only $n$ residues $\{0,1,\dots,n-1\}$ mod $n$. Pigeonhole $\Rightarrow$ there exist $i\lt j$ with $S_i\equiv S_j\pmod n$, hence

$$
a_{i+1}+\cdots+a_j=S_j-S_i\equiv 0\pmod n. \qquad\blacksquare
$$

**$S_0$ is indispensable.** Without it only $n$ prefix sums remain for $n$ residues, and the pigeonhole fails; also $S_0$ covers the blocks starting from $a_1$ — if some $S_k\equiv 0$, the partner it collides with is $S_0$, giving $a_1+\cdots+a_k$.

{{< /details >}}

### From {1,…,2n}, n+1 numbers force a divisibility

Pick $n+1$ numbers from $\{1,2,\dots,2n\}$. Prove that one of them divides another.

{{< details summary="Reference solution" >}}

Every positive integer factors uniquely as $a=2^{k}\cdot m$ ($m$ odd, all factors of 2 stripped out); call $m$ the **odd part** of $a$ and use it as the label. The odd numbers in $\{1,\dots,2n\}$ are exactly $1,3,\dots,2n-1$, i.e. $n$ of them, so there are at most $n$ labels. $n+1$ numbers into $n$ odd parts, pigeonhole $\Rightarrow$ there are $a\ne b$ with the same odd part:

$$
a=2^{s}m,\quad b=2^{t}m,\quad s\lt t
\ \Longrightarrow\
b=2^{\,t-s}\cdot a,\ \text{so } a\mid b. \qquad\blacksquare
$$

Why the odd part works while a residue does not: the target $a\mid b$ is a multiplicative relation, so the label must reflect multiplicative structure.

**Bound is tight.** $\{n+1,\dots,2n\}$ has $n$ numbers, pairwise non-dividing (doubling the smallest already exceeds $2n$), so $n$ numbers can avoid it; $n+1$ cannot be reduced.

**Poset view.** The chains $\{m,2m,4m,\dots\}$ ($m$ odd) form a **chain cover** of the divisibility order; the upper half $\{n+1,\dots,2n\}$ is an **antichain** of length $n$. By **Dilworth's theorem** (minimum chain cover = maximum antichain = width), the width is exactly $n$, and the claim is "width $n$ cannot hold $n+1$ pairwise-incomparable elements."

**Weak corollary.** Primes do not divide one another, so they form an antichain, giving $\pi(2n)\le n$; this is very loose — the true value is $\pi(2n)\sim 2n/\ln(2n)$ (prime number theorem).

{{< /details >}}

### Monotone subsequences (Erdős–Szekeres)

Given $n^2+1$ **distinct** reals in a row. Prove there is a **subsequence** of length $n+1$ (increasing indices, not necessarily consecutive) that is strictly increasing or strictly decreasing.

{{< details summary="Reference solution" >}}

Label each term $a_i$ with a pair $(x_i,y_i)$: $x_i$ is the length of the longest **strictly increasing** subsequence ending at $a_i$, and $y_i$ the longest **strictly decreasing** one ending at $a_i$.

**By contradiction.** Suppose there is no monotone subsequence of length $n+1$. Then every $x_i,y_i\in\{1,\dots,n\}$, so the labels lie in an $n\times n$ grid — $n^2$ values.

**The labels are distinct.** Take $i\lt j$; since $a_i\ne a_j$: if $a_i\lt a_j$, appending $a_j$ to the longest increasing subsequence ending at $a_i$ gives $x_j\ge x_i+1$; if $a_i\gt a_j$, likewise $y_j\ge y_i+1$. Either way one coordinate strictly increases, so $(x_i,y_i)\ne(x_j,y_j)$. (Distinctness of the reals is used exactly here, guaranteeing one side can always be extended.)

So $n^2+1$ distinct labels must fit into $n^2$ values — pigeonhole contradiction. Hence a monotone subsequence of length $n+1$ exists. $\blacksquare$

**By hand ($n=2$).** The sequence $3,1,4,2,5$ has labels $(1,1),(1,2),(2,1),(2,2)$, exactly filling the $2\times 2$ grid; the 5th term $5$ has no available label and is forced to $x=3$, corresponding to the increasing subsequence $3,4,5$.

**Bound is tight.** Arrange $\{1,\dots,n^2\}$ as $n$ decreasing blocks with increasing block-heads ($n=2$: $2,1,4,3$); the longest monotone subsequence is only $n$, so $n^2+1$ cannot be reduced.

{{< /details >}}
