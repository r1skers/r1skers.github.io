---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: 'Softmax Stable Evaluation: subtract-max, log-sum-exp, and Their Limits'
summary: "Subtract-max removes positive overflow but not tail underflow; materializing a probability before taking its log breaks an analytic cancellation; conditioning and stability must be asked separately."
description: "What naive Softmax, stable log-sum-exp, and fused cross-entropy each fix, and what each leaves behind."
tags: ["Error Analysis", "Softmax", "Numerical Stability", "Floating Point"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 99
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
\dfrac{e^d}{1+e^d},&d\lt0.
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

---

**Moved out of this article:** input quantization, the $2^{24}$ boundary, and the split of total error by source now live in [Input representation and shifting](/en/notes/systems/error-analysis/softmax/input-and-shift/), which carries the fuller derivation, the ties-to-even counterexample, and a bound on the shift's own rounding. The complete FP32 boundary experiment, tests, CSV, and closed-book rewrite are preserved in [Error Atlas](https://github.com/r1skers/error-atlas/tree/17ffd2a/topics/softmax/experiments).

**Next:** [Putting exp, Summation, and Division Into the Error Budget](/en/notes/systems/error-analysis/softmax/error-budget/)
