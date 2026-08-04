---
date: '2026-06-26T10:00:00+09:00'
draft: false
title: 'Problem Set · Real Analysis'
summary: "Companion exercises for the real-analysis notes — starting from the sequences and completeness of Parts 1-2, each problem single-tool, each solution led by a one-line skeleton (which verb to reach for) before the details."
description: "A real-analysis problem set: Cesàro means, fast Cauchy sequences, existence of limsup, uniqueness of subsequential limits, etc., grouped by Part with skeleton-first reference solutions."
tags: ["Exercises", "Real Analysis"]
categories: ["Notes"]
series: ["Problems"]
note_kind: "exercise"
problemPage: true
---

# Problem Set · Real Analysis

Companion exercises for the [real-analysis note series](/en/notes/). Each problem is **single-tool**; each reference solution is led by a one-line **skeleton** (which verb to reach for) before the details. **Try it yourself for a few minutes before expanding.**

{{< problem-map kind="real-analysis" >}}

---

{{% problem-section title="Parts 1–2: Sequences and Completeness" %}}

Companion to [Real Analysis Part 1](/en/notes/math/real-analysis/note-ra-1-convergence-cauchy/) and [Part 2](/en/notes/math/real-analysis/note-ra-2-supremum-completeness/).

{{% problem-exercise title="Cesàro mean: the running average converges to the same limit" %}}

Let $a_n \to a$. Prove

$$
\frac{a_1+a_2+\cdots+a_n}{n}\to a.
$$

*See also: [Real Analysis Part 1 · Boundedness of convergent sequences](/en/notes/math/real-analysis/note-ra-1-convergence-cauchy/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Skeleton**: control the tail + cover the finitely many head terms (a transplant of the Part 1 §6 pattern).

Reduce: let $b_n=a_n-a$, so $b_n\to 0$; it suffices to show $\frac1n\sum_{k=1}^n b_k\to 0$.

Take any $\varepsilon>0$. Since $b_n\to 0$, there is $N$ with $|b_n|\lt\varepsilon/2$ for $n>N$. Split the sum into the **first $N$ terms** and the **rest**:

$$
\left|\frac1n\sum_{k=1}^n b_k\right|
\le \underbrace{\frac1n\sum_{k=1}^N |b_k|}_{\text{finite head}}
+\underbrace{\frac1n\sum_{k=N+1}^n |b_k|}_{\text{controlled tail}}.
$$

**Tail**: $n-N$ terms, each $\lt\varepsilon/2$, so $\lt\frac{n-N}{n}\cdot\frac\varepsilon2\lt\frac\varepsilon2$.

**Head**: $C:=\sum_{k=1}^N|b_k|$ is a **fixed constant** ($N$ is fixed), so $\frac Cn\to 0$; take $n>2C/\varepsilon$ to make it $\lt\varepsilon/2$.

Thus for $n>\max(N,\,2C/\varepsilon)$ the two pieces total $\lt\varepsilon$. $\blacksquare$

**Key**: the head is a "fixed finite sum $\div\ n\to\infty$," which vanishes on its own; the tail is pinned down by convergence. This is the same vein as Part 1's "convergence controls the tail, finitely many head terms are covered separately" — **new statement, same verb**.

{{< /details >}}

{{% problem-exercise title="Fast Cauchy: consecutive differences bounded by a geometric series" %}}

Suppose $(a_n)$ satisfies $|a_{n+1}-a_n|\le \dfrac{1}{2^n}$ for all $n$. Prove that $(a_n)$ converges.

*See also: [Real Analysis Part 1 · Cauchy sequences](/en/notes/math/real-analysis/note-ra-1-convergence-cauchy/) · [Part 2 · Cauchy completeness](/en/notes/math/real-analysis/note-ra-2-supremum-completeness/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Skeleton**: you don't know the limit → don't prove convergence directly, prove it is **Cauchy** → lean on completeness.

For $m>n$, use the triangle inequality to split the large-gap difference into a chain of consecutive differences:

$$
|a_m-a_n|\le\sum_{k=n}^{m-1}|a_{k+1}-a_k|\le\sum_{k=n}^{m-1}\frac1{2^k}
\lt\sum_{k=n}^{\infty}\frac1{2^k}=\frac{1}{2^{n-1}}.
$$

Take any $\varepsilon>0$, choose $N$ with $2^{1-N}\lt\varepsilon$; then for $m>n\ge N$, $|a_m-a_n|\lt2^{1-n}\le 2^{1-N}\lt\varepsilon$. So $(a_n)$ is Cauchy.

By **completeness** of $\mathbb R$ (Part 2 §8), Cauchy $\Rightarrow$ convergent. $\blacksquare$

**Key**: "must prove convergence without knowing the limit" is the signature trigger for the Cauchy criterion. Summable consecutive differences (geometric series) $\Rightarrow$ controllable gap differences $\Rightarrow$ Cauchy. Replacing $1/2^n$ with any $c_n$ satisfying $\sum c_n\lt\infty$ works just the same.

{{< /details >}}

{{% problem-exercise title="Existence of limsup: the sequence of suprema converges" %}}

Let $(a_n)$ be bounded, and define $b_n=\sup\{a_n,a_{n+1},a_{n+2},\dots\}=\sup_{k\ge n}a_k$. Prove that $(b_n)$ converges. (Its limit is $\limsup_n a_n$.)

*See also: [Real Analysis Part 2 · Monotone Convergence Theorem](/en/notes/math/real-analysis/note-ra-2-supremum-completeness/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Skeleton**: assemble "monotone + bounded" → MCT.

**Bounded**: $(a_n)$ is bounded, say $|a_k|\le M$. Each $b_n$ is the sup of a bounded set, so $b_n\in\mathbb R$ and $|b_n|\le M$ — $(b_n)$ is bounded.

**Monotone**: $b_{n+1}=\sup_{k\ge n+1}a_k$ is a sup over a **smaller set** than $b_n$ (missing the term $a_n$). The sup over a subset is $\le$ the sup over the superset, so

$$
b_{n+1}\le b_n\quad\forall n,
$$

i.e. $(b_n)$ is **monotonically decreasing**.

Decreasing + bounded below $\Rightarrow$ convergent by MCT (the symmetric version, Part 2 §3). This limit is $\limsup_n a_n$. $\blacksquare$

**Key**: the monotonicity of the sup-sequence relies not on $(a_n)$ being monotone but on "the set we take the sup over shrinking step by step." This is the root of the existence of $\limsup/\liminf$ — every bounded sequence has a $\limsup$, however wildly it itself oscillates.

{{< /details >}}

{{% problem-exercise title="Unique subsequential limit ⇒ the whole sequence converges" %}}

Let $(a_n)$ be bounded, and suppose **every convergent subsequence converges to the same limit $L$**. Prove that $a_n\to L$.

*See also: [Real Analysis Part 2 · Bolzano–Weierstrass](/en/notes/math/real-analysis/note-ra-2-supremum-completeness/)*

{{% /problem-exercise %}}

{{< details summary="Reference solution" >}}

**Skeleton**: contradiction + squeeze via B–W on the "clingy" subsequence.

By contradiction: suppose $a_n\not\to L$. Then there is $\varepsilon_0>0$ such that, no matter how large $N$ is, some $n>N$ has $|a_n-L|\ge\varepsilon_0$. Extract these indices one by one to get a subsequence $(a_{n_j})$ with

$$
|a_{n_j}-L|\ge\varepsilon_0\quad\forall j.
$$

$(a_{n_j})$ is bounded (subsequence of a bounded sequence), so by **B–W** (Part 2 §7) it has a convergent sub-subsequence $a_{n_{j_i}}\to L'$.

This is simultaneously a **convergent subsequence of the original sequence**, so by hypothesis $L'=L$. But taking the limit in $|a_{n_{j_i}}-L|\ge\varepsilon_0$ gives $|L'-L|\ge\varepsilon_0>0$, i.e. $L'\ne L$. Contradiction.

Hence $a_n\to L$. $\blacksquare$

**Key**: "negate convergence" = extract a subsequence staying at least $\varepsilon_0$ away from $L$. Boundedness buys the B–W ticket, and the convergent subsequence B–W forces out collides with the hypothesis. **Boundedness is indispensable** — for an unbounded sequence (e.g. $a_n=n$) there are no convergent subsequences, so the hypothesis holds vacuously while the conclusion fails.

{{< /details >}}

{{% /problem-section %}}
