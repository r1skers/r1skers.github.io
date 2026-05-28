---
date: '2026-05-13T10:00:00+09:00'
draft: false
title: 'Real Analysis Part 2: The Supremum Axiom, Monotone Convergence, and the Equivalence Chain of Completeness'
summary: "Starting from the LUB axiom, this note walks the chain through MCT, the nested-interval theorem, Bolzano–Weierstrass, and Cauchy completeness, then uses a bisection argument to push Cauchy + Archimedean back to LUB, closing the equivalence ring on ℝ."
description: "An intermediate real-analysis note on the supremum and LUB axiom, the Archimedean property, the monotone convergence theorem, the nested-interval theorem, the Bolzano–Weierstrass theorem, Cauchy completeness, the equivalence chain of these five statements on ℝ, and the necessity of the Archimedean hypothesis."
tags: ["Real Analysis", "Completeness", "Supremum", "Monotone Convergence", "Bolzano-Weierstrass", "Cauchy Sequence", "Archimedean", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/real-analysis-2-completeness/
---

# Real Analysis Part 2: The Supremum Axiom, Monotone Convergence, and the Equivalence Chain of Completeness

Part 1 left a direction-only result:

$$
\text{convergence} \Longrightarrow \text{Cauchy}.
$$

This direction holds in very general spaces. But the reverse,

$$
\text{Cauchy} \Longrightarrow \text{convergence},
$$

already fails in $\mathbb{Q}$. To salvage it we need some "completeness" property of $\mathbb{R}$.

This note is precisely about that:

$$
\text{LUB axiom}
\to \text{MCT}
\to \text{nested intervals}
\to \text{B–W}
\to \text{Cauchy completeness}
\to \text{LUB axiom}
$$

We push one arrow at a time, and at the end use a bisection construction to bend the chain back to its start, closing the ring. On $\mathbb{R}$ the five statements are **mutually equivalent**; any one of them can be taken as an axiom.

One idea up front:

**Of these five, only Cauchy completeness generalizes to arbitrary spaces.** LUB, MCT, and nested intervals all depend on the order structure; B–W depends on finite-dimensionality. So this equivalence chain is a luxury of $\mathbb{R}$. Once we step into functional analysis, the only one of these we can keep is Cauchy.

A few things worth flagging before we start:
- the supremum is not the "maximum" but the "least upper bound";
- the LUB axiom is the order-theoretic form of completeness of $\mathbb{R}$;
- MCT, nested intervals, B–W, and Cauchy completeness will chain into each other;
- the proofs repeatedly use "tail control + finitely many earlier terms," "take a subsequence as a bridge," and "bisection squeeze";
- the Archimedean property is not completeness itself, but it is an indispensable hypothesis when pushing Cauchy completeness back to LUB.

---

## 1. Supremum and the LUB Axiom

### Definition

Let $S\subseteq \mathbb{R}$, $S\ne\emptyset$.

**Upper bound**: $M$ is an upper bound of $S$ if

$$
\forall x\in S,\ x\le M.
$$

**Supremum (least upper bound)**: $M^\star=\sup S$ if

$$
(\forall x\in S,\ x\le M^\star)\ \land\ (\forall M\text{ upper bound},\ M^\star\le M).
$$

That is, $M^\star$ is itself an upper bound and is the smallest among all upper bounds. Symmetrically we have the **infimum** $\inf S$.

### Equivalent characterization

$M^\star=\sup S$ is equivalent to

$$
(\forall x\in S,\ x\le M^\star)\ \land\ (\forall \varepsilon \gt 0,\ \exists x\in S,\ x \gt M^\star-\varepsilon).
$$

The second condition is the entry point of every proof that follows:

**Push $M^\star$ down by any $\varepsilon$ and an element of $S$ immediately pops up below.**

### The LUB axiom

**LUB axiom**:

$$
\forall S\subseteq\mathbb{R},\ (S\ne\emptyset\ \land\ S \text{ has an upper bound})\Rightarrow \sup S\in\mathbb{R}.
$$

This is what distinguishes $\mathbb{R}$ from $\mathbb{Q}$. In $\mathbb{Q}$ take

$$
S=\{x\in\mathbb{Q}:x^2 \lt 2\}.
$$

$S$ has an upper bound (say $2$), but $\sup S=\sqrt 2\notin\mathbb{Q}$, so the LUB axiom fails.

---

## 2. The Archimedean Property

**Claim**:

$$
\forall x\in\mathbb{R},\ x \gt 0,\ \exists n\in\mathbb{N},\ n \gt x.
$$

That is, $\mathbb{N}$ is unbounded above in $\mathbb{R}$.

{{< details summary="Proof: the Archimedean property" >}}

Argue by contradiction. Suppose $\mathbb{N}$ is bounded above in $\mathbb{R}$.

By the LUB axiom, $M^\star=\sup\mathbb{N}$ exists.

By the equivalent characterization, taking $\varepsilon=1$, there is $n\in\mathbb{N}$ with

$$
n \gt M^\star-1.
$$

But $n+1$ is still a natural number, and

$$
n+1 \gt M^\star,
$$

contradicting that $M^\star$ is an upper bound.

Hence $\mathbb{N}$ is unbounded above in $\mathbb{R}$.

{{< /details >}}

**Corollary 1**:

$$
\forall \varepsilon \gt 0,\ \exists n\in\mathbb{N},\ \frac{1}{n} \lt \varepsilon.
$$

**Corollary 2**:

$$
\forall x\in\mathbb{R},\ \exists!\, n\in\mathbb{Z},\ n\le x \lt n+1.
$$

That is, the floor function $\lfloor x\rfloor$ is always well-defined ($\exists!$ stands for "exists uniquely").

A point worth getting right:

**The Archimedean property does not distinguish $\mathbb{R}$ from $\mathbb{Q}$.** $\mathbb{Q}$ is also Archimedean, so this property is not the heart of completeness. What it does instead is glue $\varepsilon$ and $N$ together in proofs—essentially every $\varepsilon$-$N$ proof secretly uses it (e.g., picking $N\gt 1/\varepsilon$).

In §10 we will see its other role: in a world without LUB, the Archimedean property is the **extra hypothesis** that Cauchy completeness needs to imply LUB.

---

## 3. The Monotone Convergence Theorem (MCT)

**Claim**: if $(a_n)$ is monotone increasing (i.e. $\forall n,\ a_{n+1}\ge a_n$) and bounded above, then

$$
a_n\to\sup_{n\in\mathbb{N}} a_n.
$$

{{< details summary="Proof: monotone and bounded ⇒ convergent" >}}

Let

$$
M^\star=\sup_{n\in\mathbb{N}} a_n.
$$

Since $\{a_n\}$ is nonempty and bounded above, $M^\star\in\mathbb{R}$ exists by the LUB axiom.

Take any $\varepsilon\gt 0$. By the $\sup$ characterization, $\exists N$ such that

$$
a_N \gt M^\star-\varepsilon.
$$

By monotonicity, when $n\ge N$, $a_n\ge a_N$, so

$$
M^\star-\varepsilon \lt a_n\le M^\star,
$$

i.e.

$$
|a_n-M^\star| \lt \varepsilon.
$$

Therefore $a_n\to M^\star$.

{{< /details >}}

**Symmetric version**: a monotone decreasing sequence bounded below converges to its $\inf$.

The structure of this theorem is extremely simple: assemble the ordering information (monotone) and the size information (bounded), and convergence falls out for free. It will be the direct tool behind the nested-interval theorem and B–W.

---

## 4. The Nested-Interval Theorem

**Claim**: suppose

$$
[a_1,b_1]\supseteq[a_2,b_2]\supseteq\cdots,\qquad b_n-a_n\to 0.
$$

Then (where $\exists!$ is the "exists uniquely" notation; see §2 Corollary 2)

$$
\exists!\, x^\star\in\mathbb{R},\ \bigcap_{n=1}^\infty[a_n,b_n]=\{x^\star\}.
$$

{{< details summary="Proof: nested intervals" >}}

By the nesting,

$$
a_1\le a_2\le\cdots\le b_2\le b_1,
$$

so $(a_n)$ is monotone increasing and bounded above by $b_1$, and $(b_n)$ is monotone decreasing and bounded below by $a_1$.

By MCT,

$$
a_n\to a^\star,\qquad b_n\to b^\star.
$$

Taking limits in $a_n\le b_n$ gives $a^\star\le b^\star$.

By the hypothesis $b_n-a_n\to 0$, taking limits on both sides gives $b^\star-a^\star=0$, so $a^\star=b^\star$.

Let $x^\star=a^\star=b^\star$.

**$x^\star$ lies in every interval**: since $a_n$ increases to $x^\star$, $a_n\le x^\star$; similarly $x^\star\le b_n$. So $x^\star\in[a_n,b_n]$.

**Uniqueness**: if $y\in\bigcap_n [a_n,b_n]$, then $\forall n$,

$$
|y-x^\star|\le b_n-a_n.
$$

The right side $\to 0$, so $y=x^\star$.

{{< /details >}}

The point of the nested-interval theorem is that it is a bridge between LUB and B–W:

**It rewrites "existence of a bounded set's bound" into a geometric "nested intervals of length → 0" object, which makes it easy to extract a convergent subsequence afterwards.**

---

## 5. Subsequences

If $n_1 \lt n_2 \lt n_3 \lt \cdots$ is a strictly increasing sequence of natural numbers, then

$$
(a_{n_k})_{k=1}^\infty
$$

is called a **subsequence** of $(a_n)$.

**Basic fact**:

$$
a_n\to a\ \Longrightarrow\ \forall \text{ subsequence } (a_{n_k}),\ a_{n_k}\to a.
$$

{{< details summary="Proof: a subsequence of a convergent sequence converges to the same limit" >}}

Since $n_1 \lt n_2 \lt \cdots$ is a strictly increasing sequence of natural numbers, by induction $n_k\ge k$.

Take any $\varepsilon\gt 0$. Since $a_n\to a$, $\exists N$ such that $\forall n\ge N$,

$$
|a_n-a| \lt \varepsilon.
$$

When $k\ge N$, $n_k\ge k\ge N$, so

$$
|a_{n_k}-a| \lt \varepsilon.
$$

Therefore $a_{n_k}\to a$.

{{< /details >}}

Note that a subsequence **only moves forward**; you cannot jump back. This monotone-increasing index is the silent prerequisite of every subsequence operation later on.

---

## 6. The Monotone Subsequence Lemma

**Claim**:

$$
\forall \text{ real sequence } (a_n),\ \exists \text{ monotone subsequence } (a_{n_k}).
$$

The lemma looks innocuous, but it is the key to a clean proof of B–W.

{{< details summary="Proof: monotone subsequence lemma (peak-term classification)" >}}

Call $a_m$ a **peak term** of $(a_n)$ if

$$
\forall n \gt m,\ a_n\le a_m.
$$

That is, $a_m$ is at least as large as every later term.

Split by how many peak terms there are:

**Case 1: infinitely many peak terms.**

List the indices of all peak terms in order: $m_1 \lt m_2 \lt m_3 \lt \cdots$.

By the definition of a peak, $m_2 \gt m_1$ implies $a_{m_2}\le a_{m_1}$, and so on, giving

$$
a_{m_1}\ge a_{m_2}\ge a_{m_3}\ge\cdots
$$

This is a monotone (non-increasing) subsequence.

**Case 2: only finitely many peak terms.**

Let $M$ be the index of the last peak term. Starting from $n_1=M+1$, every term is **not** a peak.

$a_{n_1}$ is not a peak, so $\exists n_2 \gt n_1$ with $a_{n_2} \gt a_{n_1}$.

$a_{n_2}$ is also not a peak, so $\exists n_3 \gt n_2$ with $a_{n_3} \gt a_{n_2}$.

Continuing by induction, we obtain a strictly increasing subsequence

$$
a_{n_1}\lt a_{n_2}\lt a_{n_3}\lt \cdots
$$

Both cases yield a monotone subsequence.

{{< /details >}}

What stands out about this proof:

**It uses no boundedness and no metric structure. It only uses "any two elements are comparable," so it is essentially a lemma about orders.**

This is exactly why B–W has to be reproved in a general metric space (using compactness / total boundedness / etc.) — the lemma above does not transfer.

---

## 7. The Bolzano–Weierstrass Theorem

**Claim**:

$$
\forall \text{ bounded real sequence } (a_n),\ \exists \text{ convergent subsequence } (a_{n_k}).
$$

{{< details summary="Proof: B–W" >}}

Let $(a_n)$ be bounded.

By the monotone subsequence lemma (§6), $\exists$ a monotone subsequence $(a_{n_k})$.

The subsequence inherits boundedness from $(a_n)$.

By MCT (or its symmetric version), $(a_{n_k})$ is monotone and bounded $\Rightarrow$ convergent.

{{< /details >}}

Three lines, but every line uses an earlier result:

- the monotone subsequence lemma (§6) lets us extract a monotone subsequence;
- MCT (§3) guarantees that a monotone bounded subsequence converges;
- MCT itself came from the LUB axiom.

So B–W is the composite of LUB → MCT → monotone subsequence.

The significance of B–W is not just technical. It is the **embryo of compactness**:

**A bounded set "cannot escape." No matter how you sample a sequence from it, you can always squeeze out a convergent subsequence.**

This idea generalizes to "sequential compactness" in metric spaces and to "compactness via open covers" in topological spaces. Everything in functional analysis about compact operators or compact embeddings traces back to the spirit of this theorem.

---

## 8. Cauchy Completeness

Now that the chain LUB → MCT → nested intervals → B–W is in place, the final relay leg goes to Cauchy completeness.

Recall the definition of a Cauchy sequence from Part 1:

$$
(a_n)\text{ is Cauchy}\ \iff\ \forall\varepsilon \gt 0,\ \exists N,\ \forall m,n\ge N,\ |a_n-a_m| \lt \varepsilon.
$$

**Claim (Cauchy completeness)**:

$$
\forall \text{ Cauchy sequence } (a_n)\subseteq\mathbb{R},\ \exists a\in\mathbb{R},\ a_n\to a.
$$

The proof is three steps, each using a tool we built earlier.

{{< details summary="Proof: Cauchy completeness (three steps)" >}}

**Step 1: a Cauchy sequence is bounded.**

Take $\varepsilon=1$. By the Cauchy condition, $\exists N$ such that $\forall n,m\ge N$,

$$
|a_n-a_m| \lt 1.
$$

In particular, taking $m=N$, $\forall n\ge N$,

$$
|a_n|=|(a_n-a_N)+a_N|\le|a_n-a_N|+|a_N| \lt 1+|a_N|.
$$

Let

$$
M=\max\{|a_1|,\ldots,|a_{N-1}|,1+|a_N|\}.
$$

Then $\forall n,\ |a_n|\le M$.

(The structure is exactly the boundedness-of-convergent-sequences proof from Part 1 §6: tail is controlled by the condition, finitely many earlier terms are absorbed by a maximum.)

**Step 2: extract a convergent subsequence via B–W.**

By §7, $(a_n)$ bounded $\Rightarrow$ $\exists$ a convergent subsequence

$$
a_{n_k}\to a.
$$

**Step 3: pull the whole sequence over with the Cauchy condition.**

Take any $\varepsilon\gt 0$.

By the Cauchy condition, $\exists N_1$ such that $\forall m,n\ge N_1$,

$$
|a_n-a_m| \lt \frac{\varepsilon}{2}.
$$

By convergence of the subsequence, $\exists k$ large enough that $n_k\ge N_1$ and

$$
|a_{n_k}-a| \lt \frac{\varepsilon}{2}.
$$

Then $\forall n\ge N_1$ (and note $n_k\ge N_1$ too, so the Cauchy condition applies):

$$
\begin{aligned}
|a_n-a|
&=|(a_n-a_{n_k})+(a_{n_k}-a)|\\
&\le|a_n-a_{n_k}|+|a_{n_k}-a|\\
&\lt \frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

Therefore $a_n\to a$.

{{< /details >}}

The key trick in Step 3 deserves its own headline:

**$a_{n_k}$ wears two hats at once: it is both a term of the original sequence and a term of the subsequence.**

- As an original term: the Cauchy condition gives $|a_n-a_{n_k}|$ small;
- As a subsequence term: convergence of the subsequence gives $|a_{n_k}-a|$ small.

It serves as the two ends of a bridge connecting "any two terms are close" to "approaching the limit." This trick of using the same object in two roles will reappear constantly in functional analysis (e.g., in dual spaces an element is at once a function and a functional).

This completes

$$
\text{LUB}\to\text{MCT}\to\text{nested intervals}\to\text{B–W}\to\text{Cauchy completeness}.
$$

The chain runs one way. Now we need to bend it back to the start.

---

## 9. Closing the Ring: Cauchy + Archimedean ⇒ LUB

To call the five statements "equivalent," we need the reverse: from Cauchy completeness back to LUB.

**This step is not free**: it requires the Archimedean property as an extra hypothesis. The reason is left to §10.

**Claim**: let $F$ be an Archimedean ordered field; then

$$
(\forall\text{ Cauchy sequence } (a_n)\subseteq F,\ \exists a\in F,\ a_n\to a)\ \Longrightarrow\ \text{LUB axiom holds in }F.
$$

The proof is by **bisection construction**: we squeeze the candidate $\sup S$ — whose existence we do not yet know — between a pair of closed intervals, and use Cauchy completeness to certify that it actually exists.

{{< details summary="Proof: building sup by bisection" >}}

Let $S\ne\emptyset$ be bounded above.

**Initialization**:

Pick any $s_0\in S$ and let

$$
a_0=s_0-1,\qquad b_0=\text{some upper bound of }S.
$$

Note that $a_0 \lt s_0\in S$, so $a_0$ is **not** an upper bound of $S$ (there is an element of $S$ above it); meanwhile $b_0$ is an upper bound.

**Inductive step**:

Suppose we have a closed interval $[a_n,b_n]$ such that

- $a_n$ is **not** an upper bound of $S$;
- $b_n$ **is** an upper bound of $S$.

Take the midpoint $m_n=(a_n+b_n)/2$ and split into two cases:

- if $m_n$ is an upper bound: let $a_{n+1}=a_n$, $b_{n+1}=m_n$;
- if $m_n$ is not an upper bound: let $a_{n+1}=m_n$, $b_{n+1}=b_n$.

Either case preserves the invariant, and

$$
b_{n+1}-a_{n+1}=\frac{b_n-a_n}{2},
$$

so

$$
b_n-a_n=\frac{b_0-a_0}{2^n}.
$$

**The Archimedean property enters here**: to conclude $b_n-a_n\to 0$ from this, we need $1/2^n\to 0$, i.e. $2^n$ unbounded. This is exactly the Archimedean property (combined with $2^n\ge n$ and Corollary 1).

**$(a_n)$ is Cauchy**: $(a_n)$ is monotone increasing (each step either stays put or jumps to the midpoint) and bounded above by $b_0$. For $\forall m\ge n$,

$$
|a_m-a_n|=a_m-a_n\le b_n-a_n=\frac{b_0-a_0}{2^n}\to 0.
$$

So $(a_n)$ is Cauchy.

**Take limits**:

By Cauchy completeness, $a_n\to\alpha$. Since $b_n-a_n\to 0$, $b_n\to\alpha$ as well.

**$\alpha=\sup S$**:

- **$\alpha$ is an upper bound**: $\forall s\in S$, every $b_n$ is an upper bound, so $s\le b_n$. Taking limits gives $s\le\alpha$.

- **$\alpha$ is the least upper bound**: suppose $\beta \lt \alpha$ is also an upper bound. Since $a_n\to\alpha$, $\exists n$ with $a_n \gt \beta$. But $a_n$ is not an upper bound of $S$, so $\exists s\in S$ with $s \gt a_n \gt \beta$, contradicting that $\beta$ is an upper bound.

Therefore $\alpha=\sup S$, and the LUB axiom holds.

{{< /details >}}

Done. The ring is closed:

$$
\text{LUB}\Rightarrow\text{MCT}\Rightarrow\text{nested intervals}\Rightarrow\text{B–W}\Rightarrow\text{Cauchy}\Rightarrow\text{LUB}.
$$

On $\mathbb{R}$, the five statements are equivalent.

---

## 10. Why the Archimedean Hypothesis Cannot Be Dropped

In the proof of §9 the Archimedean property appears at exactly one spot: **deducing $b_n-a_n\to 0$ from $b_n-a_n=(b_0-a_0)/2^n$.**

What happens without the Archimedean property? One can construct an **ordered field** $F$ in which:

- there exists an "infinitesimal" $\eta \gt 0$ such that $\forall n\in\mathbb{N},\ n\eta \lt 1$ (Archimedean fails);
- every Cauchy sequence converges (Cauchy complete);
- but the LUB axiom fails.

**Abstract argument**: in any non-Archimedean ordered field $F$, take the embedded standard naturals

$$
\mathbb{N}\hookrightarrow F.
$$

Then $\mathbb{N}$ **has an upper bound** in $F$ (take any "infinite" element $\omega\in F$, i.e. $\forall n\in\mathbb{N},\ n \lt \omega$), but it **has no supremum**:

- for any "infinite" candidate $\alpha$, $\alpha-1$ is still infinite and still an upper bound of $\mathbb{N}$, so $\alpha$ is not the least upper bound;
- for any "finite" candidate $\alpha$, some standard natural number exceeds it, so $\alpha$ is not even an upper bound.

For concrete constructions, see the hyperreals ${}^*\mathbb{R}$ or formal Laurent series fields $\mathbb{R}(\!(t)\!)$, etc.; we will not unfold them here.

So the strictly correct statement is:

> At the level of **ordered fields**, "LUB axiom" is equivalent to "Archimedean property + Cauchy completeness." Cauchy completeness alone is not enough.

$\mathbb{R}$ is Archimedean by default, so in everyday usage "complete" and "Cauchy complete" are interchangeable. But when claiming "five equivalent statements," remember this hidden prerequisite.

More importantly, this gives the punchline:

**Cauchy completeness is the only one of the five that genuinely transfers beyond order structure.** "Completeness" in metric spaces, normed spaces, and Banach spaces always refers to Cauchy completeness. LUB, MCT, the nested-interval theorem, and B–W have no direct analogues in those settings.

This is exactly why Part 1 ended by singling out Cauchy: among the many characterizations of $\mathbb{R}$, it is **the only one that is inherited into the functional-analytic world**.

---

## 11. Completeness as the Next Stop

By now the full picture of the completeness equivalence chain is closed:

$$
\underbrace{\text{LUB}\to\text{MCT}\to\text{nested intervals}\to\text{B–W}\to\text{Cauchy}}_{\text{§1–§8}}
\;\xrightarrow{\;+\text{Archimedean}\;}\;
\underbrace{\text{LUB}}_{\text{§9}}.
$$

This chain is beautiful on $\mathbb{R}$, but in more general spaces much of it will lose its shape:

- a **Banach space** is a complete normed space, where "complete" specifically means Cauchy $\Rightarrow$ convergent;
- a **Hilbert space** is a complete inner-product space;
- the Banach fixed-point theorem, Galerkin approximation, and the convergence proofs of iterative algorithms all rely on some form of Cauchy completeness;
- LUB, MCT, and B–W all need to be re-examined in infinite dimensions. A canonical counterexample is the unit ball in $\ell^2$: it is closed and bounded, but **not sequentially compact**, because the orthonormal sequence $e_n$ has no convergent subsequence.

This is the essential rift between infinite-dimensional and finite-dimensional spaces.

The next stop is to lift these concepts out of $\mathbb{R}$ and into **metric spaces**.

There we will meet convergence, Cauchy, completeness, and compactness all over again, but their definitions will be rewritten in the language of $d(x,y)$. Completeness will survive there; B–W will reappear as "sequential compactness" and will partially fail, which then exposes phenomena unique to infinite-dimensional spaces.

---

## Summary

This note organized the equivalence chain of completeness on $\mathbb{R}$:

1. The LUB axiom guarantees that every nonempty bounded-above set has a supremum; this is the root distinction between $\mathbb{R}$ and $\mathbb{Q}$.
2. The Archimedean property makes the $\varepsilon$-$N$ language workable, in particular ensuring $1/n\to 0$ and that bisection-interval lengths tend to $0$.
3. The LUB axiom implies the monotone convergence theorem: monotone + bounded $\Rightarrow$ convergent.
4. MCT implies the nested-interval theorem: closed nested intervals with lengths $\to 0$ squeeze out a unique common point.
5. The monotone subsequence lemma plus MCT implies Bolzano–Weierstrass: every bounded real sequence has a convergent subsequence.
6. B–W implies Cauchy completeness: a Cauchy sequence is first bounded, then yields a convergent subsequence, and finally the Cauchy condition pulls the whole sequence to the same limit.
7. Cauchy completeness plus the Archimedean property gives back LUB by bisection, so the equivalence ring is closed.
8. In more general spaces, the survivor is Cauchy completeness; this is the core meaning of "complete" in Banach spaces and Hilbert spaces.
