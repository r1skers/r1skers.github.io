---
date: '2026-06-23T10:00:00+09:00'
draft: false
title: 'Problem Set · Miscellaneous'
summary: "Odds and ends not yet worth their own page — currently one pigeonhole set: integer midpoints, consecutive subsums, divisibility pairs, Erdős–Szekeres monotone subsequences, all the 'count + compare' pattern."
description: "A combinatorics / discrete problem set: four classic pigeonhole problems (integer midpoint, consecutive subsum divisible by n, a divisibility pair among n+1 of {1..2n}, Erdős–Szekeres monotone subsequences), with reference solutions."
tags: ["Exercises"]
categories: ["Notes"]
series: ["Problems"]
note_kind: "exercise"
problemPage: true
---

# Problem Set · Miscellaneous

Odds and ends that have not yet accumulated enough for their own page. They get split out once they grow.

{{< problem-map kind="misc" >}}

---

{{% problem-section title="The Pigeonhole Principle" %}}

A set of "count the set size first, then compare the range" classics — **make the pigeons, make the holes, count.**

{{% problem-exercise title="Five lattice points force an integer midpoint" %}}

Take any 5 lattice points in the plane (integer coordinates). Prove that some two of them have a midpoint that is also a lattice point.

{{% /problem-exercise %}}

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

{{% problem-exercise title="A consecutive subsum divisible by n" %}}

Given $n$ integers $a_1,\dots,a_n$ (repeats allowed, any sign). Prove that some **consecutive** block $a_{i+1}+a_{i+2}+\cdots+a_j$ is divisible by $n$.

{{% /problem-exercise %}}

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

{{% problem-exercise title="From {1,…,2n}, n+1 numbers force a divisibility" %}}

Pick $n+1$ numbers from $\{1,2,\dots,2n\}$. Prove that one of them divides another.

{{% /problem-exercise %}}

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

{{% problem-exercise title="Monotone subsequences (Erdős–Szekeres)" %}}

Given $n^2+1$ **distinct** reals in a row. Prove there is a **subsequence** of length $n+1$ (increasing indices, not necessarily consecutive) that is strictly increasing or strictly decreasing.

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

Label each term $a_i$ with a pair $(x_i,y_i)$: $x_i$ is the length of the longest **strictly increasing** subsequence ending at $a_i$, and $y_i$ the longest **strictly decreasing** one ending at $a_i$.

**By contradiction.** Suppose there is no monotone subsequence of length $n+1$. Then every $x_i,y_i\in\{1,\dots,n\}$, so the labels lie in an $n\times n$ grid — $n^2$ values.

**The labels are distinct.** Take $i\lt j$; since $a_i\ne a_j$: if $a_i\lt a_j$, appending $a_j$ to the longest increasing subsequence ending at $a_i$ gives $x_j\ge x_i+1$; if $a_i\gt a_j$, likewise $y_j\ge y_i+1$. Either way one coordinate strictly increases, so $(x_i,y_i)\ne(x_j,y_j)$. (Distinctness of the reals is used exactly here, guaranteeing one side can always be extended.)

So $n^2+1$ distinct labels must fit into $n^2$ values — pigeonhole contradiction. Hence a monotone subsequence of length $n+1$ exists. $\blacksquare$

**By hand ($n=2$).** The sequence $3,1,4,2,5$ has labels $(1,1),(1,2),(2,1),(2,2)$, exactly filling the $2\times 2$ grid; the 5th term $5$ has no available label and is forced to $x=3$, corresponding to the increasing subsequence $3,4,5$.

**Bound is tight.** Arrange $\{1,\dots,n^2\}$ as $n$ decreasing blocks with increasing block-heads ($n=2$: $2,1,4,3$); the longest monotone subsequence is only $n$, so $n^2+1$ cannot be reduced.

{{< /details >}}

{{% /problem-section %}}
