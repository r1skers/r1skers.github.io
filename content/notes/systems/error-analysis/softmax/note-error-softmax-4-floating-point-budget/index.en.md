---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: 'Error Analysis · Softmax 4: Putting exp, Summation, and Division Into the Error Budget'
summary: "Normalization removes the common mode of relative exp error but propagates differential error to every probability; summation and division introduce additional error directions."
description: "A step-by-step first-order floating-point error budget for Softmax, including probability-mass drift, underflow boundaries, and the theoretical difference between sequential and tree summation."
tags: ["Error Analysis", "Softmax", "Floating Point", "Numerical Stability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 4
---

Subtract-max removes positive overflow, but it does not make exp, summation, or division exact. This note introduces error one stage at a time along the actual computation graph:

\[
x_i=z_i-\max_jz_j
\longrightarrow
q_i=e^{x_i}
\longrightarrow
S=\sum_iq_i
\longrightarrow
p_i=\frac{q_i}{S}.
\]

To isolate the role of each stage, begin with explicit assumptions:

- the shifted logits $x_i\le0$ are already given;
- underflow does not occur yet;
- each stage satisfies the standard small-relative-error model;
- sources are separated first and combined afterward.

## 1. How exp Error Enters the Normalizer

Model the $i$th exponential as

\[
\widehat q_i=q_i(1+\epsilon_i).
\]

The absolute normalizer error is

\[
\Delta S
=\sum_jq_j\epsilon_j.
\]

Dividing by

\[
S=\sum_jq_j
\]

gives the relative error

\[
\frac{\Delta S}{S}
=\sum_j\frac{q_j}{S}\epsilon_j
=\sum_jp_j\epsilon_j.
\]

Define

\[
\bar\epsilon=\sum_jp_j\epsilon_j.
\]

This is the probability-weighted mean of the relative exp errors. High-probability components contribute more to the denominator error. The structure is probabilistic, but the quantity itself is not entropy.

## 2. Normalization Removes the Common Mode

Assume for the moment that summation and division are exact. Then

\[
\widehat S=S(1+\bar\epsilon)
\]

and

\[
\widehat p_i
=p_i\frac{1+\epsilon_i}{1+\bar\epsilon}.
\]

Therefore

\[
\boxed{
\frac{\widehat p_i-p_i}{p_i}
=\frac{\epsilon_i-\bar\epsilon}{1+\bar\epsilon}.
}
\]

For sufficiently small errors,

\[
\frac{\widehat p_i-p_i}{p_i}
\approx\epsilon_i-\bar\epsilon.
\]

If every $\epsilon_i=c$, then $\bar\epsilon=c$ and the final probabilities are exact. Normalization does not remove every exp error; it removes only their common relative component. Differences between components remain.

This result reconnects directly to the Jacobian. Since

\[
q_i(1+\epsilon_i)
=\exp\left(x_i+\log(1+\epsilon_i)\right),
\]

a relative exp error is equivalent to the logit perturbation

\[
\Delta x_i=\log(1+\epsilon_i)
\approx\epsilon_i.
\]

Hence

\[
\Delta p\approx J_s\Delta x,
\]

which reproduces $\epsilon_i-\bar\epsilon$ componentwise. A common exp error corresponds to a nonzero common-shift vector. The input perturbation is not zero; the Jacobian maps it to zero.

## 3. Summation Error Enters Only the Denominator

Now isolate a relative summation error

\[
\widehat S=S(1+\eta).
\]

If the numerator and division are exact,

\[
\frac{\widehat p_i}{p_i}
=\frac{1}{1+\eta}.
\]

When $\eta>0$, every probability is biased downward, and

\[
\sum_i\widehat p_i
=\frac{1}{1+\eta}
\ne1.
\]

This differs from a common exp error. The latter appears in both numerator and denominator and cancels; the summation error is attached only to the denominator.

## 4. Every Division Has Its Own Rounding

Let the final division satisfy

\[
\operatorname{fl}\left(\frac{\widehat q_i}{\widehat S}\right)
=\frac{\widehat q_i}{\widehat S}(1+\delta_i).
\]

Combining the three stages gives

\[
\frac{\widehat p_i}{p_i}
=\frac{(1+\epsilon_i)(1+\delta_i)}
{(1+\bar\epsilon)(1+\eta)}.
\]

Keeping only first-order terms produces the central error budget:

\[
\boxed{
\frac{\widehat p_i-p_i}{p_i}
\approx
\epsilon_i-\bar\epsilon-\eta+\delta_i.
}
\]

The four terms have distinct origins:

- $\epsilon_i$: local relative error in the $i$th exp;
- $-\bar\epsilon$: normalization removing the common exp mode;
- $-\eta$: normalizer summation error;
- $+\delta_i$: rounding in the $i$th final division.

“First order” means discarding products such as $\epsilon_i\eta$ and $\delta_i\eta$, which are $O(u^2)$. It does not mean setting every small quantity to zero.

## 5. From the Expression to a Worst-Case Bound

Suppose exp satisfies

\[
|\epsilon_i|\le\alpha u.
\]

Then

\[
|\bar\epsilon|\le\alpha u.
\]

More precisely,

\[
\epsilon_i-\bar\epsilon
=\sum_{j\ne i}p_j(\epsilon_i-\epsilon_j),
\]

so

\[
|\epsilon_i-\bar\epsilon|
\le2(1-p_i)\alpha u.
\]

For sequential summation of $n$ positive values, the standard relative bound is

\[
|\eta|\le\gamma_{n-1},
\qquad
\gamma_{n-1}
=\frac{(n-1)u}{1-(n-1)u}
\approx(n-1)u.
\]

If basic division satisfies $|\delta_i|\le u$, the triangle inequality gives

\[
\left|
\frac{\widehat p_i-p_i}{p_i}
\right|
\lesssim
2(1-p_i)\alpha u+\gamma_{n-1}+u.
\]

This is a safe bound obtained by aligning all sources with their worst possible signs. It is not a pointwise prediction of the error observed in every run.

## 6. Sequential Versus Tree Summation

Sequential summation has a dependency chain of length $n-1$, giving a worst-case scale of $O(nu)$. In a balanced tree, each value crosses only about $\lceil\log_2n\rceil$ rounding layers, so the theoretical scale becomes

\[
O((\log_2n)u).
\]

For FP32 and $n=1000$, with $u\approx6\times10^{-8}$:

- the sequential bound is approximately $999u\approx6\times10^{-5}$;
- a ten-level tree gives approximately $10u\approx6\times10^{-7}$.

Not every input attains the bound. If all $q_i=1$, FP32 may accumulate the integer partial sums exactly while $n \lt 2^{24}$, hiding the mechanism entirely. A more diagnostic construction is

\[
q=(1,u,u,\ldots,u).
\]

With $1$ first, subsequent small terms may be rounded away one at a time. Combining the small terms before adding them to $1$ is more likely to preserve them. This comparison is currently a theoretical prediction and an experimental design, not yet a registered result in Error Atlas.

## 7. Why a Probability Sum of 1 Is Not Enough

Multiplying the relative error by $p_i$ gives

\[
\Delta p_i
\approx
p_i(\epsilon_i-\bar\epsilon-\eta+\delta_i).
\]

Summing over all components,

\[
\boxed{
\sum_i\widehat p_i-1
\approx
-\eta+\sum_i p_i\delta_i.
}
\]

Differential exp errors do not appear in the total-mass defect because they redistribute probability between classes. Summation and division can instead move the result off the probability simplex.

Therefore

\[
\widehat p=p
\Longrightarrow
\sum_i\widehat p_i=1,
\]

but

\[
\sum_i\widehat p_i=1
\not\Longrightarrow
\widehat p=p.
\]

Component errors can cancel one another, and $-\eta$ can also cancel the probability-weighted division error accidentally. A sum of $1$ is a necessary check, not a sufficient proof.

## 8. Underflow Abruptly Invalidates the Small-Error Model

Mathematically, $q_i=e^{x_i}>0$, but floating-point evaluation may produce

\[
\widehat q_i=0.
\]

The formal relative error is

\[
\epsilon_i
=\frac{0-q_i}{q_i}
=-1.
\]

It is still defined, but it is no longer an $O(u)$ quantity, so the previous first-order derivation no longer applies. If the true probability is $10^{-40}$ and the computed probability is $0$, the absolute error is $10^{-40}$ while the componentwise relative error has magnitude $1$.

This conflict cannot be resolved by labeling the algorithm simply “stable” or “unstable.” The downstream metric must be stated:

- an overall absolute norm;
- relative error in a tiny component;
- argmax;
- or $\log p_i$ and cross-entropy.

## 9. Evidence Boundaries for This Pass

| Conclusion | Current evidence |
| --- | --- |
| Normalization removes common relative exp error | Exact algebra and the Jacobian interpretation |
| First-order budget $\epsilon_i-\bar\epsilon-\eta+\delta_i$ | Standard floating-point error-model derivation |
| Sequential $O(nu)$ versus tree $O(\log n\,u)$ summation | Theoretical bounds; experiment still pending |
| Loss of a unit logit difference at $2^{24}$ | Reproducible FP32 experiment, tests, CSV, and metadata |
| Componentwise relative error can reach $100\%$ under underflow | Boundary counterexample; consumer-dependent mitigation remains to be organized |

The next stage should not add more error formulas. It should construct a failure--metric/consumer--mitigation decision chain, then test tree reduction, mixed precision, fast exp, kernel fusion, and nondeterministic summation order in a GPU implementation.

---

**This first Topic pass is complete:** [Return to the Softmax parent page](/en/notes/systems/error-analysis/softmax/)
