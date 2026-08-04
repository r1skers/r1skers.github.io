---
date: '2026-07-02T13:30:00+09:00'
draft: false
title: "[Artifact-6.1] Formulas and Phenomenon Observation"
summary: "The first stage of Artifact-6: derive and verify the sparse-attention pruning identity ‖o−õ‖=δ‖μ_R−μ_S‖, map entropy regimes with q_scale, compare fixed-k / dropped-mass / restricted oracle at matched budget, and show why top-k-by-probability is not set-optimal."
description: "Stage 0 to v1 of the value-aware sparse attention project: softmax as entropy-regularized optimization, exact pruning-error decomposition, synthetic q_scale regimes, matched-budget allocation, and the boundary of the restricted oracle."
tags:
  - "Attention"
  - "Sparse Attention"
  - "Error Analysis"
  - "Numerical Analysis"
categories:
  - "Artifacts"
series:
  - "Value-Aware Sparse Attention"
weight: 61
math: true
---

Project repository:
[value-aware-sparse-attention](https://github.com/r1skers/value-aware-sparse-attention).

This first note covers the synthetic stage of the project: `N=128`, `d=64`,
iid Gaussian `Q,K,V`, float64, no GPU. The purpose is not to claim a new
theory, but to turn the error decomposition into a working measurement
instrument.

## 1. Softmax as Entropy-Regularized Optimization

For logits $z$, softmax can be derived as the solution of

$$
p^\*=\arg\max_{p\in\Delta}\langle p,z\rangle+\tau H(p).
$$

The Lagrange multiplier calculation gives

$$
p_i=\frac{e^{z_i/\tau}}{\sum_j e^{z_j/\tau}}.
$$

This matters experimentally because $\tau$ controls entropy. In the scripts I
use `q_scale` to scale the query vectors, equivalently scaling the logits and
sweeping attention from nearly uniform to nearly one-hot.

## 2. The Pruning Error Decomposition

For one attention row,

$$
o=\sum_{i=1}^{n}p_iv_i.
$$

Split token indices into retained set $S$ and dropped set $R$:

$$
m=\sum_{i\in S}p_i,\qquad \delta=\sum_{i\in R}p_i=1-m.
$$

After pruning, the retained weights are renormalized:

$$
\tilde o=\frac{1}{m}\sum_{i\in S}p_iv_i.
$$

Define the retained and dropped value centroids

$$
\mu_S=\frac{1}{m}\sum_{i\in S}p_iv_i,\qquad
\mu_R=\frac{1}{\delta}\sum_{i\in R}p_iv_i.
$$

Then

$$
\tilde o=\mu_S,\qquad o=m\mu_S+\delta\mu_R.
$$

Therefore

$$
o-\tilde o
=m\mu_S+\delta\mu_R-\mu_S
=\delta(\mu_R-\mu_S),
$$

and

$$
\boxed{\|o-\tilde o\|=\delta\|\mu_R-\mu_S\|}.
$$

This is an exact identity, not an upper bound. The code verifies it to
floating-point precision on every row.

## 3. What the Identity Says

The error has two factors:

```text
error = dropped mass × value centroid displacement
```

Entropy can tell us something about the distribution of `p`, and therefore
about possible dropped mass. But entropy has no direct access to the location
of the dropped value centroid.

That is the move from a vague statement ("entropy may be insufficient") to a
testable claim:

> Entropy-only pruning can fail when the value geometry term dominates.

## 4. Regime Sweep

The `q_scale` sweep creates a clean entropy axis:

```text
low q_scale  -> diffuse / high entropy
high q_scale -> sharp / low entropy
```

The observed pattern is a regime shift:

- diffuse regimes: centroid displacement explains the row error;
- sharp regimes: dropped mass explains the row error;
- entropy itself is never the strongest predictor, but works as a regime
  indicator.

This gives the project its first map: value information matters most exactly
where attention is diffuse and dropped mass loses row-level resolution.

## 5. Matched-Budget Allocation

The next question is not just predictor correlation, but allocation quality:
given the same total retained-token budget, which signal allocates `k` better?

The comparison uses:

```text
fixed-k
dropped-mass adaptive
restricted oracle
```

The restricted oracle chooses the best row-wise `k` inside the
top-k-by-probability family. It is an offline yardstick, not a deployable rule.

The result is regime-dependent:

- in sharp regimes, dropped mass nearly matches the restricted oracle;
- in high-entropy regimes, dropped mass is useless or harmful;
- the remaining gap is where value geometry is needed.

## 6. Top-k-by-Probability Is Not Set-Optimal

The identity holds for any retained set $S$, not only for the top-k by
probability. But all current methods, including the restricted oracle, stay
inside the top-k-by-probability family.

A one-swap diagnostic shows that replacing a single retained token can reduce
error, especially in high-entropy regimes. This means:

```text
restricted oracle != global subset oracle
```

Any measured "value of V" inside the top-k family is therefore a lower bound on
the value of full value-aware subset selection.

## 7. Takeaway

Stage 0/v1 turns pruning error into a measurable object:

```text
local error = dropped probability mass × value centroid displacement
```

The main empirical lesson is:

> Q,K-only dropped-mass control is strong in sharp attention, but value geometry
> becomes necessary in diffuse attention.

The next stage asks whether the value-side term can be estimated cheaply enough
to be useful without scanning the dropped V vectors per query row.
