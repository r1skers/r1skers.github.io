---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: 'Taylor Expansion: From Remainders to Error Control'
summary: "The first complete error-analysis topic: begin with a Taylor remainder and proceed to bounds, propagation, numerical stability, and optimal step size."
description: "A full pass through error definition, representation, estimation, propagation, control, and experimental verification using Taylor expansion."
tags: ["Error Analysis", "Numerical Analysis", "Taylor Expansion"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "topic-index"
weight: 1
---

Taylor expansion is often presented as a formula that turns a function into a polynomial:

\[
f(x)=
\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k
+R_n(x).
\]

From the perspective of error analysis, however, the real protagonist is \(R_n(x)\). It lets us ask a complete sequence of questions:

- What is the error object?
- How much information does each remainder formula preserve?
- What do \(O\), \(o\), and a numerical bound actually tell us?
- Why can an always-valid bound still be useless?
- How does an error propagate into the next computation?
- How do order, step size, stable representations, and sample size control total error?

## Route Through the Topic

### 1. Fix the Error Vocabulary

[First Define the Error: \(R\), \(O\), \(o\), and Bounds](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/) separates the exact remainder, absolute error, asymptotic order, and computable bound. Big-\(O\) and little-\(o\) are not upper and lower limits; they are different asymptotic comparisons.

### 2. Compare Three Remainder Forms

[Lagrange, Integral, and Peano Remainders](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-2-remainder-forms/) compares an unknown intermediate point, a weighted interval integral, and a local asymptotic statement.

### 3. Ask Whether a Bound Is Useful, Not Only Valid

[Why a Correct Bound Can Still Be Unconvincing](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/) uses \(1/(1-x)\) to show how a legal Lagrange bound can miss exponential convergence after a supremum discards positional structure.

### 4. Put the Error Into a Computation

[How Errors Propagate: Sensitivity, Conditioning, and Stability](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/) begins with

\[
\Delta y\approx f'(x)\Delta x
\]

without treating it as a global law. It then separates problem sensitivity from algorithmic error and uses \(e^h-1\) versus \(\operatorname{expm1}(h)\) to explain cancellation.

### 5. Control Deterministic Error

[From Step Size to Richardson Extrapolation](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/) turns a Taylor leading term into observed order, extrapolation, and a finite-difference error budget.

### 6. Add Random Noise to the Same Budget

[Putting Noise Into the Error Budget](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-6-statistical-noise/) validates the bias--variance decomposition for a noisy central difference, separates the inner sample size \(N\) from the outer Monte Carlo count \(M\), and derives the optimal step size.

## The Result Is a Workflow, Not One Formula

\[
\boxed{
\text{define reference and metric}
\rightarrow
\text{list sources}
\rightarrow
\text{find a leading term or bound}
\rightarrow
\text{analyze propagation}
\rightarrow
\text{build a total-error model}
\rightarrow
\text{predict and verify}
}
\]

Taylor expansion is only the first stop. The mathematical object will change when the project reaches Softmax, low-precision arithmetic, and CPU--GPU systems, but this sequence of questions remains.

---

**Start reading:** [Taylor 1: First Define \(R\), \(O\), \(o\), and Error Bounds](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/)
