---
date: '2026-05-03T10:00:00+09:00'
draft: false
title: 'Real Analysis Part 1: Convergence, Uniqueness, Boundedness, and Cauchy Sequences'
summary: "Starting from the epsilon-N definition of sequence limits, this note organizes the basic language of real-analysis proofs and moves through uniqueness of limits, boundedness of convergent sequences, and Cauchy sequences."
description: "An introductory real-analysis note on epsilon-N proofs, sequence convergence, uniqueness of limits, boundedness of convergent sequences, and the definition and intuition of Cauchy sequences."
tags: ["Real Analysis", "Epsilon-N", "Sequence", "Convergence", "Cauchy Sequence", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/real-analysis-1-epsilon-n-and-cauchy-sequences/
  - /notes/note-ra-1-convergence-cauchy/
---

# Real Analysis Part 1: Convergence, Uniqueness, Boundedness, and Cauchy Sequences

This note begins my study of real analysis. The first chain I want to make clear is:

$$
\text{sequence limit} \longrightarrow \text{uniqueness} \longrightarrow \text{boundedness} \longrightarrow \text{Cauchy sequence}
$$

The basic tools are:
- the language of $\varepsilon$-$N$ proofs;
- how to choose $N$ from an error requirement;
- the triangle inequality;
- the idea that convergence controls the tail, while finitely many earlier terms can be bounded separately;
- the relation between convergence and Cauchy sequences.

---

## 1. The Strict Definition of a Sequence Limit

A sequence $(a_n)$ converges to $a$, written as

$$
a_n \to a,
$$

if:

$$
\forall \varepsilon>0,\ \exists N,\ \forall n\ge N,\ |a_n-a|<\varepsilon.
$$

In words:

**No matter how small an error range $\varepsilon$ is chosen, there is always some position $N$ such that after $N$, every $a_n$ lies inside the $\varepsilon$-neighborhood of $a$.**

---

## 2. First Example: $\frac{1}{n}\to 0$

{{< details summary="Proof: work backward from the target error to N" >}}

$$
\frac{1}{n}\to 0.
$$

By definition, we need to prove:

$$
\forall \varepsilon>0,\ \exists N,\ \forall n\ge N,\ \left|\frac{1}{n}-0\right|<\varepsilon.
$$

That means we want

$$
\frac{1}{n}<\varepsilon.
$$

Work backward from the target inequality:

$$
n>\frac{1}{\varepsilon}.
$$

So we only need to choose a natural number $N$ such that

$$
N>\frac{1}{\varepsilon}.
$$

Then when $n\ge N$,

$$
n\ge N>\frac{1}{\varepsilon},
$$

and therefore

$$
\frac{1}{n}<\varepsilon.
$$

So

$$
\left|\frac{1}{n}-0\right|<\varepsilon.
$$

Hence

$$
\frac{1}{n}\to 0.
$$

{{< /details >}}

This example shows the basic pattern of an $\varepsilon$-$N$ proof:

**First look at what condition the target error requires, then work backward to decide how $N$ should be chosen.**

---

## 3. Limit of a Constant Multiple

Claim:

If

$$
a_n\to a,
$$

then

$$
2a_n\to 2a.
$$

{{< details summary="Proof: limit of a constant multiple" >}}

Take any $\varepsilon>0$.

Since $a_n\to a$, for the positive number $\varepsilon/2>0$, there exists a natural number $N$ such that when $n\ge N$,

$$
|a_n-a|<\frac{\varepsilon}{2}.
$$

Then when $n\ge N$,

$$
|2a_n-2a|
=2|a_n-a|
<2\cdot\frac{\varepsilon}{2}
=\varepsilon.
$$

Therefore

$$
2a_n\to 2a.
$$

{{< /details >}}

---

## 4. Limit of a Sum: the Triangle Inequality

Claim:

If

$$
a_n\to a,\qquad b_n\to b,
$$

then

$$
a_n+b_n\to a+b.
$$

{{< details summary="Proof: limit of a sum" >}}

Take any $\varepsilon>0$.

Since $a_n\to a$, there exists $N_1$ such that when $n\ge N_1$,

$$
|a_n-a|<\frac{\varepsilon}{2}.
$$

Since $b_n\to b$, there exists $N_2$ such that when $n\ge N_2$,

$$
|b_n-b|<\frac{\varepsilon}{2}.
$$

Choose

$$
N=\max(N_1,N_2).
$$

Then when $n\ge N$, we have both $n\ge N_1$ and $n\ge N_2$, so both error controls hold at the same time.

Thus

$$
\begin{aligned}
|(a_n+b_n)-(a+b)|
&=|(a_n-a)+(b_n-b)|\\
&\le |a_n-a|+|b_n-b|\\
&<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

Therefore

$$
a_n+b_n\to a+b.
$$

{{< /details >}}

---

## 5. Limit of Absolute Values

Claim:

If

$$
a_n\to a,
$$

then

$$
|a_n|\to |a|.
$$

We use the reverse triangle inequality:

$$
\big||x|-|y|\big|\le |x-y|.
$$

{{< details summary="Proof: reverse triangle inequality and absolute-value limits" >}}

First prove this inequality.

By the triangle inequality,

$$
|x|=|(x-y)+y|\le |x-y|+|y|,
$$

so

$$
|x|-|y|\le |x-y|.
$$

Switching $x$ and $y$, we also get

$$
|y|-|x|\le |y-x|=|x-y|.
$$

Therefore both the positive and negative sides of $|x|-|y|$ are controlled by $|x-y|$, so

$$
\big||x|-|y|\big|\le |x-y|.
$$

Now prove the original claim.

Take any $\varepsilon>0$. Since $a_n\to a$, there exists $N$ such that when $n\ge N$,

$$
|a_n-a|<\varepsilon.
$$

Thus when $n\ge N$,

$$
\big||a_n|-|a|\big|
\le |a_n-a|
<\varepsilon.
$$

Therefore

$$
|a_n|\to |a|.
$$

{{< /details >}}

---

## 6. Every Convergent Sequence Is Bounded

Claim:

If

$$
a_n\to a,
$$

then the sequence $(a_n)$ is bounded.

That is, there exists a constant $M>0$ such that for every $n$,

$$
|a_n|\le M.
$$

{{< details summary="Proof: convergent sequences are bounded" >}}

Since $a_n\to a$, choose the error requirement $\varepsilon=1$. Then there exists $N$ such that when $n\ge N$,

$$
|a_n-a|<1.
$$

Thus when $n\ge N$,

$$
|a_n|
=|(a_n-a)+a|
\le |a_n-a|+|a|
<1+|a|.
$$

This shows that the tail, starting from the $N$-th term, is bounded.

The finitely many earlier terms

$$
a_1,a_2,\ldots,a_{N-1}
$$

can be covered by one maximum value. Let

$$
M=\max\{|a_1|,\ldots,|a_{N-1}|,1+|a|\}.
$$

Then:

- if $n<N$, by the definition of $M$, $|a_n|\le M$;
- if $n\ge N$, then $|a_n|<1+|a|\le M$.

So for every $n$,

$$
|a_n|\le M.
$$

Therefore $(a_n)$ is bounded.

{{< /details >}}

This proof pattern is very important:

**Convergence controls the tail directly, and the finitely many earlier terms are bounded separately by a maximum.**

There is a completely similar version in normed spaces: if $x_n\to x$, then $(x_n)$ is bounded. The proof only replaces absolute value with norm.

---

## 7. Uniqueness of Limits

Claim:

If

$$
a_n\to a
$$

and

$$
a_n\to b,
$$

then

$$
a=b.
$$

{{< details summary="Proof: uniqueness of limits" >}}

Take any $\varepsilon>0$.

Since $a_n\to a$, there exists $N_1$ such that when $n\ge N_1$,

$$
|a_n-a|<\frac{\varepsilon}{2}.
$$

Since $a_n\to b$, there exists $N_2$ such that when $n\ge N_2$,

$$
|a_n-b|<\frac{\varepsilon}{2}.
$$

Choose

$$
N=\max(N_1,N_2).
$$

When $n\ge N$, both estimates hold. Therefore

$$
\begin{aligned}
|a-b|
&=|a-a_n+a_n-b|\\
&\le |a-a_n|+|a_n-b|\\
&<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

So for every $\varepsilon>0$,

$$
|a-b|<\varepsilon.
$$

Since $|a-b|\ge 0$, this can only mean

$$
|a-b|=0.
$$

Hence

$$
a=b.
$$

{{< /details >}}

---

## 8. Cauchy Sequences

Ordinary convergence first names the limit:

$$
a_n\to a.
$$

A Cauchy sequence does not name the limit first. Instead, it asks:

**Do the terms in the tail of the sequence get closer and closer to each other?**

Definition:

A sequence $(a_n)$ is a Cauchy sequence if

$$
\forall \varepsilon>0,\ \exists N,\ \forall m,n\ge N,\ |a_n-a_m|<\varepsilon.
$$

Notice that we are comparing any two terms in the tail:

$$
|a_n-a_m|.
$$

We are not comparing one term with a known limit.

---

## 9. Every Convergent Sequence Is Cauchy

Claim:

If

$$
a_n\to a,
$$

then $(a_n)$ is a Cauchy sequence.

{{< details summary="Proof: every convergent sequence is Cauchy" >}}

Take any $\varepsilon>0$.

Since $a_n\to a$, for $\varepsilon/2>0$, there exists $N$ such that when $k\ge N$,

$$
|a_k-a|<\frac{\varepsilon}{2}.
$$

Thus when $m,n\ge N$,

$$
|a_n-a|<\frac{\varepsilon}{2},
\qquad
|a_m-a|<\frac{\varepsilon}{2}.
$$

Use $a$ as a bridge:

$$
\begin{aligned}
|a_n-a_m|
&=|a_n-a+a-a_m|\\
&\le |a_n-a|+|a_m-a|\\
&<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

Therefore $(a_n)$ is a Cauchy sequence.

{{< /details >}}

This claim says:

$$
\text{convergence} \Longrightarrow \text{Cauchy}.
$$

In other words, if a sequence truly converges to some limit, then its tail must become internally stable.

---

## 10. Completeness as the Next Stop

So far, we have obtained a clear direction:

$$
\text{convergence} \Longrightarrow \text{Cauchy}.
$$

This direction holds in very general spaces and does not require extra assumptions.

But the reverse direction,

$$
\text{Cauchy} \Longrightarrow \text{convergence},
$$

is not always true.

This is exactly the problem that completeness addresses.

Roughly speaking:

- in $\mathbb{R}$, every Cauchy sequence converges;
- in $\mathbb{Q}$, a Cauchy sequence may fail to converge to a rational number;
- a Banach space is a complete normed space;
- a Hilbert space is a complete inner-product space.

So completeness can be understood as:

**If an approximation process is already internally stable enough, then it actually lands on some object inside the space.**

This will be one of the most important ideas when moving later into Banach spaces and Hilbert spaces.

---

## Summary

This note organized the basic chain of real-analysis proofs:

1. The $\varepsilon$-$N$ definition turns "getting closer and closer" into a verifiable statement.
2. Limits of constant multiples and sums train the habit of distributing error.
3. Limits of absolute values rely on the reverse triangle inequality.
4. Boundedness of convergent sequences relies on "tail control + finitely many earlier terms."
5. Uniqueness of limits relies on using the same $a_n$ as a bridge.
6. Every convergent sequence is Cauchy, meaning convergence brings internal stability in the tail.
7. Whether every Cauchy sequence must converge is exactly the question answered by completeness.
