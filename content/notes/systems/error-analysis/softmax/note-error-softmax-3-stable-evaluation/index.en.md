---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: 'Error Analysis · Softmax 3: Why Mathematical Equivalence Does Not Imply Numerical Stability'
summary: "Subtract-max eliminates positive exponential overflow but cannot restore a logit difference lost before quantization; problem conditioning, algorithmic stability, and input representation must remain separate."
description: "Naive Softmax, stable log-sum-exp, fused cross-entropy, and an FP32 boundary experiment near 2^24 that isolates input quantization."
tags: ["Error Analysis", "Softmax", "Numerical Stability", "Floating Point"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 3
---

Exact Softmax is shift-invariant:

\[
s(z+c\mathbf1)=s(z).
\]

Both numerator and denominator acquire the same factor $e^c$, which cancels. This simple identity provides the standard stable evaluation form, but it also exposes a boundary: mathematical invariance does not guarantee that low-precision storage has preserved the relevant information.

## 1. Why the Direct Formula Creates Meaningless Large Intermediates

Take

\[
z=(1000,999).
\]

The exact probability depends only on the difference $1$, so the first component is approximately

\[
\sigma(1)\approx0.731.
\]

Directly evaluating

\[
\frac{e^{1000}}{e^{1000}+e^{999}}
\]

first creates intermediates outside the range of common floating-point formats. The final answer is benign, but the path may produce $\infty/\infty$ and NaN.

Let

\[
m=\max_i z_i.
\]

Shift invariance gives

\[
p_i
=\frac{e^{z_i-m}}{\sum_j e^{z_j-m}}.
\]

Every exponential input now satisfies

\[
z_i-m\le0.
\]

The largest exponential is exactly $e^0=1$, positive overflow disappears, and the denominator contains at least one $1$. The mathematical problem has not changed; only the evaluation path has been replaced by one with a controlled dynamic range.

## 2. Subtract-Max Still Allows Tail Underflow

If some $z_i-m$ is a large negative number, $e^{z_i-m}$ may still underflow to zero. The first question must then be the metric and downstream consumer:

- for argmax or an overall absolute error, losing an extremely small tail probability may be harmless;
- for the componentwise relative error, $p_i\to0$ can become a $100\%$ error;
- if the next step needs $\log p_i$, zero becomes $-\infty$.

Subtract-max solves positive overflow. It does not solve every numerical issue associated with Softmax.

## 3. Do Not Materialize a Probability Before Taking Its Log

For a one-hot target, cross-entropy is

\[
L=-\log p_y
=\log\sum_i e^{z_i}-z_y.
\]

If $p_y$ is computed first, it may already have underflowed to zero. A stable form preserves the analytic cancellation:

\[
\boxed{
L=(m-z_y)+\log\sum_i e^{z_i-m}.
}
\]

Its gradient is

\[
\nabla_zL=p-y,
\]

and its Hessian is the Softmax Jacobian

\[
\nabla_z^2L=J_s.
\]

Computing Softmax and then taking a logarithm separates factors that could have canceled symbolically before floating-point discretization. Fused cross-entropy or log-softmax preserves that cancellation.

The binary sigmoid follows the same principle. Let $d=z_1-z_2$ and branch by sign:

\[
\sigma(d)=
\begin{cases}
\dfrac{1}{1+e^{-d}},&d\ge0,\\[6pt]
\dfrac{e^d}{1+e^d},&d<0.
\end{cases}
\]

Both branches evaluate only nonpositive exponentials.

## 4. Conditioning and Stability Cannot Be Collapsed Into One Word

Exact Softmax satisfies

\[
\|s(z')-s(z)\|_2
\le\frac12\|z'-z\|_2.
\]

The mathematical map is therefore well-conditioned in the absolute $2$-norm. This does not prove that an implementation is stable: naive Softmax can still overflow at $z=(1000,999)$.

The two questions are:

- **Problem conditioning:** how much does the exact output change when the input truly changes?
- **Algorithmic stability:** for a fixed input, how far is the floating-point output from the exact result?

The bound $\|J_s\|_2\le1/2$ answers the first question. Overflow, exponential approximation, summation, and division rounding answer the second.

## 5. A Stable Formula Is Not a Time Machine

Consider the mathematical input

\[
z(M)=(M+1,M).
\]

Exact Softmax always sees a difference of $1$, so the first probability is always approximately $0.7310586$. Now store the logits in FP32 before applying subtract-max. The experiment observes

\[
M=2^{23}
\Rightarrow
\widehat z_1-\widehat z_2=1,
\qquad
\widehat p_1\approx0.7310586,
\]

but

\[
M=2^{24}
\Rightarrow
\widehat z_1-\widehat z_2=0,
\qquad
\widehat p_1=0.5.
\]

Near $2^{24}$, adjacent FP32 numbers are already spaced by $2$. The unit difference is erased before subtract-max begins. The stable algorithm can only evaluate

\[
s(2^{24},2^{24})=(0.5,0.5)
\]

faithfully.

If $Q$ denotes FP32 quantization, then in general

\[
Q(z-m\mathbf1)
\ne
Q(z)-\max(Q(z))\mathbf1.
\]

Centering in higher precision before converting to low precision can preserve the difference. Centering after quantization cannot reconstruct information that has disappeared.

## 6. Total Error Must Be Split by Source

Let $z$ be the intended input, $\widetilde z$ the stored input, and $\widehat p$ the final program output. Then

\[
\widehat p-s(z)=
\underbrace{\widehat p-s(\widetilde z)}_{\text{evaluation error}}
+
\underbrace{s(\widetilde z)-s(z)}_{\text{propagated input-quantization error}}.
\]

In the $2^{24}$ experiment, the first term is small: the stable algorithm correctly evaluates the stored logits. The second term creates the dominant discrepancy.

This also shows why the overall relative error of the raw logits can be a poor metric. A huge common offset makes

\[
\frac{\|\widetilde z-z\|}{\|z\|}
\]

look tiny even after the contrast that Softmax actually uses has suffered a $100\%$ error. Better diagnostic objects are pairwise logit differences or centered logits:

\[
Pz,
\qquad
P=I-\frac1K\mathbf1\mathbf1^T.
\]

The conclusion is

\[
\boxed{
\text{A stable algorithm can avoid creating a new disaster, but it cannot restore information lost at the input stage.}
}
\]

The complete FP32 boundary experiment, tests, CSV, metadata, and closed-book rewrite are preserved in [Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax/experiments).

---

**Next:** [Softmax 4: Putting exp, Summation, and Division Into the Error Budget](/en/notes/systems/error-analysis/softmax/note-error-softmax-4-floating-point-budget/)
