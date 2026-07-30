---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: 'Error Analysis · Taylor 4: How Errors Propagate'
summary: "Output error is approximately sensitivity times input error, but only as a local first-order model; a complete analysis also separates conditioning, stability, correlation, and floating-point evaluation paths."
description: "Taylor linearization as an error-propagation model, with conditioning, numerical stability, cancellation, and correlated errors."
tags: ["Error Analysis", "Error Propagation", "Conditioning", "Numerical Stability"]
categories: ["Notes"]
weight: 4
---

The previous notes asked how large one approximation error is. Now let that approximation enter another computation:

\[
x\longrightarrow y=f(x).
\]

Perturbing \(x\) to \(x+\Delta x\) gives

\[
f(x+\Delta x)-f(x)
=f'(x)\Delta x+O(\Delta x^2).
\]

For a sufficiently small perturbation,

\[
\boxed{\Delta y\approx f'(x)\Delta x.}
\]

This is the origin of “output error is approximately sensitivity times input error.”

## 1. It Is Not a Global Linear Law

The formula is:

- **local**: \(\Delta x\) must be small;
- **first order**: \(O(\Delta x^2)\) has been omitted;
- **position-dependent**: \(f'(x)\) changes with \(x\).

A rigorous interval bound is

\[
|\Delta y|
\le
\sup_{\xi\in I}|f'(\xi)|\,|\Delta x|,
\]

but the supremum can again be valid and loose.

The metric matters as well. Absolute sensitivity is described by \(|f'(x)|\). When \(x\ne0\) and \(f(x)\ne0\), the local relative condition number is

\[
\kappa_{\mathrm{rel}}(x)=
\left|\frac{x f'(x)}{f(x)}\right|.
\]

One function can have different sensitivity conclusions under different error metrics.

## 2. Errors Through a Computational Chain

For

\[
x\longrightarrow y=f(x)\longrightarrow z=g(y),
\]

an input perturbation propagates as

\[
\Delta z
\approx
g'(f(x))f'(x)\Delta x.
\]

If the two stages also introduce local errors \(\eta_f,\eta_g\), then

\[
\Delta z
\approx
g'(f(x))
\bigl(f'(x)\Delta x+\eta_f\bigr)
+\eta_g.
\]

Attribution must therefore record where an error was created, which downstream sensitivities it crossed, whether sources are correlated, and whether they cancel or reinforce.

For vector maps, the scalar derivative becomes a Jacobian:

\[
\Delta\mathbf y
\approx
J_f(\mathbf x)\Delta\mathbf x.
\]

This is the bridge from Taylor analysis to the later Softmax topic.

## 3. Conditioning and Stability Answer Different Questions

- **Conditioning** describes the sensitivity of the mathematical problem to input perturbations.
- **Stability** describes whether a particular algorithm introduces substantially more error than the problem itself requires.

A well-conditioned problem can be ruined by an unstable implementation. A stable algorithm cannot remove sensitivity intrinsic to an ill-conditioned problem.

## 4. \(e^h-1\): A Benign Problem With an Unstable Evaluation Path

Near zero,

\[
e^h-1\approx h.
\]

The mathematical function is not ill-conditioned. The naive evaluation path is the problem:

1. compute \(e^h\), a number of scale \(O(1)\);
2. subtract the integer \(1\);
3. retain a signal of scale \(O(h)\).

The \(O(u)\) absolute rounding error inherited from \(e^h\) does not shrink with the resulting signal. Its relative effect becomes

\[
O\!\left(\frac{u}{h}\right).
\]

\(\operatorname{expm1}(h)\) computes the small quantity directly and avoids constructing two nearby \(O(1)\) values first.

\[
\boxed{\text{Algebraic equivalence does not imply floating-point equivalence.}}
\]

## 5. Multiple Sources Can Cancel Through Correlation

The central difference

\[
D_hf(0)=\frac{f(h)-f(-h)}{2h}
\]

uses symmetry to cancel even powers in the Taylor expansions, raising the truncation order from one to two.

If the two observations contain errors \(\varepsilon_+,\varepsilon_-\), their propagated contribution is

\[
\frac{\varepsilon_+-\varepsilon_-}{2h}.
\]

If both have standard deviation \(\sigma\) and correlation \(\rho\), then

\[
\operatorname{Var}(D_h)=
\frac{\sigma^2(1-\rho)}{2h^2}.
\]

Therefore:

- \(\rho\gt0\): common-mode noise partially cancels;
- \(\rho=0\): independent variances add;
- \(\rho\lt0\): opposite noise is amplified;
- smaller \(h\): remaining noise is amplified by \(1/h\).

A complete propagation statement must specify local versus global behavior, absolute versus relative error, deterministic versus random sources, correlation, and the actual floating-point evaluation order.

---

**Next:** [Taylor 5: From Step Size to Richardson Extrapolation](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/)

