---
date: '2026-09-08T00:00:00+09:00'
draft: false
title: 'Softmax Exponentiation: From Individual Rounding to Probability Error'
summary: "Fix shifted inputs, separate exact exponentials from rounded targets and implementation outputs, and trace their shared numerator and denominator effects."
description: "Correct rounding, common-mode cancellation, differential error propagation, and tail underflow in the Softmax exp stage."
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Exponentiation"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 4
math: true
ShowToc: true
softmaxArticle: true
---

[← Back to the computation map · Exponentiation](/en/notes/systems/error-analysis/softmax/#exp)

## 1. What remains after fixing the input?

[Input representation and shifting](/en/notes/systems/error-analysis/softmax/input-and-shift/) separated source inputs, stored inputs, and subtraction rounding. This article starts from finite, shifted FP32 values:

\[
s_i\le0,
\qquad
\max_i s_i=0.
\]

At least one exponential is therefore $e^0=1$. For each $s_i$, distinguish three objects:

| Object | Notation | Meaning |
| --- | --- | --- |
| Exact exponential | $q_i=e^{s_i}$ | The mathematical value for the actual input $s_i$ |
| Correctly rounded target | $q_i^\star=Q_{32}(q_i)$ | One FP32 rounding, round-to-nearest, ties-to-even |
| Implementation output | $\hat q_i=\exp_{\mathrm{impl}}(s_i)$ | The value returned by a specified library, device, and build configuration |

The error relative to the exact value splits exactly:

\[
\hat q_i-q_i
=\underbrace{\hat q_i-q_i^\star}_{\text{implementation deviation}}
+\underbrace{q_i^\star-q_i}_{\text{format rounding}}.
\]

This is an identity, not a small-error approximation. Correct rounding does not mean mathematical exactness: it means selecting the required value in the target format. Conversely, FP32 inputs and outputs alone do not establish that an exp implementation is correctly rounded.

## 2. One exp call need not mean one rounding

The real identity

\[
s=k\ln2+r,
\qquad
e^s=2^k e^r
\]

suggests a common implementation structure: reduce the argument to a small interval, approximate $e^r$ with a polynomial, a table, or both, then reconstruct the scale and handle the output format, subnormals, and zero. Constants, internal precision, rounding sites, and exceptional-value handling all affect $\hat q_i$.

This article does not prove the coefficients or accuracy of a particular implementation. It treats the complete call as observable. Any implementation-specific accuracy claim must identify the library, version, device, function, and compiler options. “FP32 exp” alone is not a computational contract.

## 3. The same exp errors enter numerator and denominator differently

Finite $s_i$ implies $q_i>0$, so define

\[
\epsilon_i=\frac{\hat q_i-q_i}{q_i},
\qquad
\hat q_i=q_i(1+\epsilon_i).
\]

This is also an identity. Small $\epsilon_i$ is required only when using a first-order approximation later. If an output becomes zero, $\epsilon_i=-1$: the notation remains valid, but the small-relative-error model fails.

Temporarily evaluate subsequent summation and division exactly. Define

\[
L=\sum_jq_j,
\qquad
p_i=\frac{q_i}{L},
\qquad
\bar\epsilon=\sum_jp_j\epsilon_j.
\]

The numerator uses only term $i$:

\[
\hat q_i=q_i(1+\epsilon_i).
\]

The denominator receives the exact sum of all exponential outputs:

\[
L^{(e)}=\sum_j\hat q_j
=L\left(1+\sum_jp_j\epsilon_j\right)
=L(1+\bar\epsilon).
\]

Here $\bar\epsilon$ is the relative denominator change caused by changes in the exp outputs. Additional error from accumulating these values into $\hat L$ belongs to [denominator reduction](/en/notes/systems/error-analysis/softmax/#reduction).

For normalization, assume the actual exponential outputs are finite, nonnegative, and not all zero, so $L^{(e)}>0$. Write the probabilities affected only by exp error as

\[
p_i^{(e)}=\frac{\hat q_i}{L^{(e)}}.
\]

The central identity is

\[
\boxed{
\frac{p_i^{(e)}-p_i}{p_i}
=\frac{\epsilon_i-\bar\epsilon}{1+\bar\epsilon}.
}
\]

The numerator receives its own error $\epsilon_i$; the denominator receives the probability-weighted mean $\bar\epsilon$. Normalization leaves their difference.

For $\eta=\|\epsilon\|_\infty\lt1$, we have $|\bar\epsilon|\le\eta$, hence

\[
\left|\frac{p_i^{(e)}-p_i}{p_i}\right|
\le\frac{2\eta}{1-\eta}.
\]

When $\eta$ is small, the first-order form is

\[
\frac{p_i^{(e)}-p_i}{p_i}
=\epsilon_i-\bar\epsilon+O(\eta^2).
\]

Higher-order expansions connect to the Softmax Jacobian through an equivalent logit perturbation; see [directions and spectrum on the probability simplex](/en/notes/systems/error-analysis/softmax/geometry-spectrum/).

## 4. Common error cancels; differential error does not

If every exponential is multiplied by the same positive factor, $\epsilon_i=c>-1$. Then $\bar\epsilon=c$, giving

\[
p_i^{(e)}=p_i.
\]

The denominator changes, but the probabilities do not. Normalization removes the common mode of the exponential relative errors.

Errors confined to some components do not cancel this way. Consider

\[
p=\left(\frac23,\frac13\right),
\qquad
\epsilon=(0,a),\quad a>0.
\]

Then

\[
\bar\epsilon=\frac a3,
\qquad
p^{(e)}=\left(\frac2{3+a},\frac{1+a}{3+a}\right),
\]

\[
p^{(e)}-p
=\left(-\frac{2a}{3(3+a)},\frac{2a}{3(3+a)}\right).
\]

The first exponential is exact, yet its probability falls because the second term changes the common denominator. This is a constructed propagation example, not a measurement of an exp library. Per-term error bounds are not enough: correlations between errors also matter.

## 5. Underflow: track lost mass instead of small relative error

The smallest positive normal and subnormal FP32 values are

\[
n_{\min}=2^{-126},
\qquad
h=2^{-149}.
\]

Under correctly rounded FP32, round-to-nearest, ties-to-even, with gradual underflow:

| Exact exponential boundary | Real argument | Meaning |
| --- | --- | --- |
| $e^s=2^{-126}$ | $s=-126\ln2\approx-87.336545$ | The exact value reaches the normal/subnormal scale boundary |
| $e^s=2^{-149}$ | $s=-149\ln2\approx-103.278930$ | The exact value equals the smallest positive subnormal |
| $e^s=2^{-150}=h/2$ | $s=-150\ln2\approx-103.972077$ | The rounding midpoint between zero and the smallest subnormal |

Thus

\[
Q_{32}(e^s)=0
\quad\Longleftrightarrow\quad
s\le-150\ln2.
\]

At equality, ties-to-even chooses zero. This threshold belongs to this specific rounding and underflow model, not every `expf` implementation. With FP32 inputs, inspect the representable arguments on either side. “Nonzero at −103, zero at −104” brackets the threshold; it does not make −104 the exact threshold.

In the subnormal range the absolute bound remains

\[
|q_i^\star-q_i|\le h/2,
\]

but the relative bound $h/(2q_i)$ grows as $q_i$ shrinks. Rounding to zero produces 100% relative error. Flushing otherwise-subnormal outputs to zero is a different path and must not be mixed with gradual underflow.

A 100% relative error in one term still need not greatly change the distribution. In an isolated model, set exponential terms in $T$ to zero, keep the others exact, and normalize exactly. Let the removed reference probability mass be

\[
\tau=\sum_{i\in T}p_i\lt1.
\]

Then

\[
p_i^{(e)}=
\begin{cases}
0,&i\in T,\\
p_i/(1-\tau),&i\notin T,
\end{cases}
\]

and

\[
\|p^{(e)}-p\|_1=2\tau.
\]

The distribution's one-norm change depends on total removed probability mass, not the number of zeroed terms. This identity applies only to the specified deletion model. Real implementations also approximate surviving terms. A consumer taking logarithms of tail probabilities additionally encounters a domain change at zero; assess that under the actual [downstream use](/en/notes/systems/error-analysis/softmax/#consumer).

## References

- [NumPy finfo](https://numpy.org/doc/stable/reference/generated/numpy.finfo.html): FP32 normal and subnormal limits.
- [Arm optimized-routines expf](https://github.com/ARM-software/optimized-routines/blob/master/math/expf.c): one inspectable example of range reduction, local approximation, and reconstruction, not a universal expf implementation.
- [CUDA Math API: single-precision functions](https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH__SINGLE.html): record the particular function and compiler configuration.
- [Error Atlas: finite-precision propagation](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md#finite-precision-propagation): the separate exp, summation, and division budgets.

Back to the map: [Exponentiation](/en/notes/systems/error-analysis/softmax/#exp) · [Reduction](/en/notes/systems/error-analysis/softmax/#reduction)
