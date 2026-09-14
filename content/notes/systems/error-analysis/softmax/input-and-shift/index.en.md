---
date: '2026-09-07T00:00:00+09:00'
draft: false
title: 'Softmax Input Representation and Shifting: What Happens Before exp'
summary: "Quantization can irreversibly change class differences; subtract-max improves exponential dynamic range, while subtraction error must be distinguished from normalized probability error."
description: "What do the two steps before exp — quantization and shifting — each change? Understanding Softmax's input stage through floating-point spacing, ties-to-even, and Sterbenz exactness."
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Input Quantization", "Numerical Stability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 3
math: true
ShowToc: true
softmaxArticle: true
---

[← Back to the computation-stage map](/en/notes/systems/error-analysis/softmax/#input)

## 1. A Probability That Should Not Depend on a Common Offset

Consider just two logits:

\[
x(M)=(M+1,M).
\]

Their difference is always 1. The first component of exact Softmax is

\[
p_1
=\frac{e^{M+1}}{e^{M+1}+e^M}
=\frac{1}{1+e^{-1}}
\approx0.7310585786.
\]

So changing the common offset $M$ should not change the exact answer. This example shrinks the problem to its smallest form: **if the program's output changes with $M$, at which step does the change happen?**

This article follows the two steps before $\exp$: converting the input to FP32 (§1–§5), and the subtract-max that follows (§6). Exponentiation, summation, and division appear here only to observe the consequences of those two steps; their own error budgets belong to their own stages.

## 2. Three Objects to Keep Separate

Let $Q_{32}$ denote quantization to FP32 under round-to-nearest, ties-to-even; let $s$ denote exact Softmax; and let $A_{32}$ denote the FP32 program that runs Softmax on the stored input. These must be recorded separately:

| Object | Notation | Meaning here |
| --- | --- | --- |
| Source input | $x$ | the $(M+1,M)$ we mathematically intend to hand the operator |
| Stored input | $\hat{x}=Q_{32}(x)$ | the FP32 numbers the program actually receives |
| Program output | $\hat{p}=A_{32}(\hat{x})$ | the probabilities obtained by continuing in floating point from the stored input |

The total output error then splits exactly:

\[
\hat{p}-s(x)=
\underbrace{\hat{p}-s(\hat{x})}_{\text{evaluation error on the stored input}}
+
\underbrace{s(\hat{x})-s(x)}_{\text{propagation of input representation error}}.
\]

This is an identity obtained by adding and subtracting the same $s(\hat{x})$, not a first-order approximation. The first term fixes the input at $\hat{x}$; the second compares the exact results of two different inputs.

To decide whether the error has already occurred at the input stage, look first at the stored difference

\[
\hat{d}=\hat{x}_1-\hat{x}_2.
\]

For the three boundary cases below, this subtraction is itself exact. If $\hat{d}$ has already gone from 1 to 0, we have an observation point closer to the source of the error than the final probabilities.

## 3. Why the Boundary Appears at $2^{24}$

An FP32 normal number carries 24 significant binary digits: 23 stored explicitly plus one implicit leading bit. Within the positive interval $[2^e,2^{e+1})$, the spacing between adjacent representable numbers is

\[
\Delta_e=2^{e-23}.
\]

That is the spacing *within* the interval; at a power-of-two boundary the spacing differs on the two sides. The ULP column in the table below means the distance from a positive $M$ upward to the next representable number. NumPy exposes the format parameters through [finfo](https://numpy.org/doc/stable/reference/generated/numpy.finfo.html) and the spacing at these positions through [spacing](https://numpy.org/doc/stable/reference/generated/numpy.spacing.html).

At $M=2^{23}$ the upward spacing is 1, both $M$ and $M+1$ are exactly representable, and the stored difference is still 1.

At $M=2^{24}$ the adjacent FP32 numbers upward are

\[
M,\qquad M+2.
\]

The source value $M+1$ sits exactly at their midpoint. Ties-to-even selects **the candidate whose significand has an even last bit**; here that is $M$, so

\[
Q_{32}(M+1)=M,\qquad Q_{32}(M)=M,
\qquad \hat{d}=0.
\]

Both integer endpoints are even in decimal, so the rule cannot be understood as merely "round to an even integer."

At $M=2^{25}$ the upward spacing is 4, $M+1$ is closer to $M$, and it still rounds to $M$.

One boundary must be preserved: **this does not mean every unit difference above $2^{24}$ collapses to zero.** Take $M=2^{24}+2$: then $M+1$ lies at the midpoint of $M$ and $M+2$, ties-to-even picks the upper endpoint this time, and the stored difference becomes 2. The original unit difference is still lost, but the distortion runs the other way. The same source difference can therefore produce different stored differences depending on where it falls on the floating-point grid.

## 4. How the Exact Answer Changes Once the Input Difference Is Lost

The quantized input can still be handed to exact Softmax. For two components only their difference matters:

\[
s_1(\hat{x})=\frac{1}{1+e^{-\hat{d}}}=\sigma(\hat{d}).
\]

The exact answer for the source input is always $\sigma(1)$; the exact answer for the stored input varies with $\hat{d}$. The bias that input representation induces in the first probability is therefore

\[
s_1(\hat{x})-s_1(x)=\sigma(\hat{d})-\sigma(1).
\]

Substituting the rounding results of the previous section gives the table below. These are **exact mathematical results for the stored input**; the decimals are shown approximately, and no floating-point rounding from exp, summation, or division has been added yet.

| $M$ | Upward ULP | $\hat{d}$ | $s_1(\hat{x})$ | Absolute probability error from input representation |
| --- | ---: | ---: | --- | --- |
| $2^{23}$ | 1 | 1 | $\sigma(1)\approx0.731058579$ | 0 |
| $2^{24}$ | 2 | 0 | $1/2$ | $\sigma(1)-1/2\approx0.231058579$ |
| $2^{25}$ | 4 | 0 | $1/2$ | $\sigma(1)-1/2\approx0.231058579$ |

At $M=2^{24}$ the quantized input becomes $(M,M)$. Applying subtract-max, the subsequent mathematical path is

\[
(M,M)\longrightarrow(0,0)
\longrightarrow(1,1)
\longrightarrow(0.5,0.5).
\]

Even a program that computes this stored input perfectly still differs from the source input's answer by about 0.231. Explaining this bias requires no instability in the evaluation code; the change in input representation is sufficient on its own.

## 5. The Order of Operations Decides What Information Survives

Centering first in higher precision, then converting to FP32:

\[
(M+1,M)\longrightarrow(0,-1)
\longrightarrow Q_{32}(0,-1)=(0,-1).
\]

Quantizing first and centering afterwards gives, at $M=2^{24}$:

\[
(M+1,M)\longrightarrow(M,M)
\longrightarrow(0,0).
\]

So the shift invariance of exact Softmax has not failed; what changed is the input entering the mathematical map.

Casting the already-quantized $(M,M)$ up to FP64 still leaves a difference of zero. Later computation in higher precision can only use the information that survives. Reordering centering and conversion preserves the difference only when a more accurate input is still available before the lossy conversion.

This example also explains why looking at the overall relative error of the logits is misleading. At $M=2^{24}$,

\[
\|\hat{x}-x\|_2=1,\qquad
\frac{\|\hat{x}-x\|_2}{\|x\|_2}
\approx\frac{1}{\sqrt{2}\,M}
\approx4.2\times10^{-8},
\]

yet the difference went from 1 to 0, a 100% error relative to the source difference. A large common offset makes the overall relative error look tiny; diagnosis also has to look at the class differences Softmax actually uses.

## 6. What the Shift Itself Costs

<p class="atlas-return"><a href="/en/notes/systems/error-analysis/softmax/#shift">← This section corresponds to "Maximum and shifting" on the computation-stage map</a></p>

Fix finite, non-NaN FP32 stored inputs and set $m=\max_i\hat{x}_i$. Separate the exact difference from the computed subtraction:

\[
t_i=\hat{x}_i-m,\qquad
s_i=\mathrm{fl}(t_i)=t_i+\delta_i.
\]

This section assumes round-to-nearest, ties-to-even, gradual underflow, and no subtraction overflow. The error $\delta_i$ belongs only to this subtraction. To isolate it, exponentiation, summation, and division below are all exact.

### Why subtract-max is still necessary

For $\hat{x}=(1000,999)$, direct exponentiation produces intermediates beyond the FP32 range; shifting gives $(0,-1)$. In general, $s_i\le0$, with at least one exact zero. Exact exponential terms are therefore at most $1$, with at least one equal to $1$. This removes **positive overflow in the exponential stage**. It neither recovers differences already lost during quantization nor makes every subsequent operation error-free.

### When subtraction is exact

The maximum is an existing input. For finite, non-NaN inputs, max uses comparison and selection without arithmetic rounding; a parallel comparison tree does not change this fact.

[Sterbenz's lemma](https://toccata.gitlabpages.inria.fr/toccata/gallery/Sterbenz.fr.html) gives a sufficient condition for exact subtraction. For same-sign, nonzero floating-point numbers, a form covering either sign is

\[
\frac{|b|}{2}\le|a|\le2|b|
\quad\Longrightarrow\quad
\mathrm{fl}(a-b)=a-b.
\]

Gradual underflow is retained here; this guarantee must not be transferred to arbitrary FTZ modes. Subtracting zero or equal operands is also exact. For nonzero $m$, the condition $|\hat{x}_i-m|\le|m|/2$ is sufficient to enter the region above.

Thus, with fixed class differences and a sufficiently large common offset that has not overflowed, nearby stored values can subtract exactly even after quantization has destroyed their difference. In the $M=2^{24}$ example of §4, **input representation changes the first probability by about $0.231$, while shifting adds exactly zero error.** This compares two effects in one example; it does not rank them for arbitrary inputs.

Failure to satisfy Sterbenz's condition does not prove inexactness, nor imply a large difference. Other cases need their actual rounding analyzed.

### How one exponential receives subtraction error

Let $u=2^{-24}$. If the nonzero exact difference has $|t_i|\in[2^e,2^{e+1})$ in the normal range and subtraction does not overflow,

\[
|\delta_i|\le2^e u.
\]

The binade describes $|t_i|$, not the nonpositive $t_i$. If the exact difference of two FP32 values falls in the subnormal range, it remains an integer multiple of $2^{-149}$ and is exactly representable under gradual underflow.

For subsequent exact exponentiation,

\[
\frac{e^{s_i}-e^{t_i}}{e^{t_i}}
=e^{\delta_i}-1,\qquad
|e^{\delta_i}-1|\le e^{|\delta_i|}-1.
\]

Approximating this relative change by $\delta_i$ requires small $|\delta_i|$.

Define $p_i=e^{t_i}/L$, where $L=\sum_j e^{t_j}\ge1$. Since $t_i\le0$,

\[
p_i\le e^{t_i}
\quad\Longrightarrow\quad
|t_i|\le-\ln p_i.
\]

A lower bound on the **exact reference probability** therefore limits the error of an individual term:

| Known condition | Upper bound on $\lvert t_i\rvert$ | Bound $a$ on $\lvert\delta_i\rvert$ | Relative-change bound for one exponential |
| --- | ---: | ---: | --- |
| $p_i\ge10^{-1}$ | $\ln 10\approx2.303$ | $2u$ | $e^{2u}-1$ |
| $p_i\ge10^{-3}$ | $3\ln 10\approx6.908$ | $4u$ | $e^{4u}-1$ |
| $p_i\ge10^{-6}$ | $6\ln 10\approx13.816$ | $8u$ | $e^{8u}-1$ |
| $p_i\ge10^{-14}$ | $14\ln 10\approx32.236$ | $32u$ | $e^{32u}-1$ |

These are not relative-error bounds on normalized probabilities, nor a universal cap for tail terms. The exponential implementation's underflow threshold belongs to the next stage; two sampled arguments do not establish its exact cutoff.

### Normalization changes the denominator too

With only subtraction rounding introduced, write the exactly normalized output as

\[
p_i^{(s)}=\frac{e^{s_i}}{\sum_j e^{s_j}}.
\]

Comparison with the exact-shift result gives the identity

\[
\boxed{
\frac{p_i^{(s)}}{p_i}
=\frac{e^{\delta_i}}{\sum_j p_j e^{\delta_j}}.
}
\]

Consequently, for small perturbations,

\[
\frac{p_i^{(s)}-p_i}{p_i}
=\delta_i-\sum_j p_j\delta_j
+O(\|\delta\|_\infty^2).
\]

Subtraction errors enter both individual numerators and the shared denominator. Knowing only $\delta_i$ is insufficient: even an exactly subtracted component can change probability because other terms changed.

For a non-asymptotic bound, set $D=\max_j\delta_j-\min_j\delta_j$. Then

\[
e^{-D}\le\frac{p_i^{(s)}}{p_i}\le e^D,
\qquad
|p_i^{(s)}-p_i|\le p_i(e^D-1).
\]

A common $\delta_i=c$ cancels completely; differences between the errors affect normalization. To first order, this is the previous article's Jacobian action: subtract the probability-weighted mean.

## 7. Boundaries

Three effects are separate: quantization changes the input; subtract-max improves exponential dynamic range; subtraction rounding changes probabilities through both numerators and denominator. Nearby values may subtract exactly, but shifting is not error-free for arbitrary inputs.

The specific $2^{24}$ boundary follows from FP32 precision and the chosen unit difference; it does not transfer directly to another dtype or difference. Whether pre-centering preserves information depends on the precision available before the lossy conversion.

Finite inputs alone do not ensure finite differences: with $(-F_{\max},F_{\max})$, subtracting the maximum from the minimum overflows to $-\infty$, outside the finite-$\delta_i$ budget above. NaNs, infinite inputs, FTZ, mixed precision, and subtraction overflow require separate treatment.

Blockwise max comparisons can still be exact. Online Softmax differs by maintaining states with local maxima and rescaling them during merging, not because parallel comparisons round. That belongs to the [online path](/en/notes/systems/error-analysis/softmax/#online-softmax).

The next stage, [exponentiation](/en/notes/systems/error-analysis/softmax/#exp), fixes the finite $s_i\le0$ obtained here and uses $e^{s_i}$ as its reference. It then measures the implementation's newly introduced error without charging the shift error to exp a second time.

## References

- [NumPy finfo](https://numpy.org/doc/stable/reference/generated/numpy.finfo.html), [spacing](https://numpy.org/doc/stable/reference/generated/numpy.spacing.html), and [nextafter](https://numpy.org/doc/stable/reference/generated/numpy.nextafter.html): the interfaces used here for format parameters, spacing, and grid traversal. Sterbenz's lemma appears in any standard text on floating-point arithmetic.
- [Error Atlas: input representation boundary audit](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/early_experiments.md#boundary-audit): the relationship between quantization order and centering.
- [Error Atlas: finite-precision propagation](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md#finite-precision-propagation): the research notes start their error budget "once subtract-max is done and nothing has underflowed"; §6 supplies exactly the subtraction that precedes it.
- [Why error has direction](/en/notes/systems/error-analysis/softmax/directional-error/) and [Direction and spectrum on the probability simplex](/en/notes/systems/error-analysis/softmax/geometry-spectrum/): the separation of problem conditioning from algorithmic stability, and the origin of $\|J_s\|_2\le1/2$.

Back to the computation-stage map: [input representation](/en/notes/systems/error-analysis/softmax/#input) · [maximum and shifting](/en/notes/systems/error-analysis/softmax/#shift)
