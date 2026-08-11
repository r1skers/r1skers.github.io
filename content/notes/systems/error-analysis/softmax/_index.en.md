---
date: '2026-08-04T00:10:00+09:00'
draft: false
title: 'Softmax: From Directional Error to Finite Precision'
summary: "A route from directional propagation through stable evaluation and an operation-level error budget to summation stagnation and a first consumer-specific mitigation case."
description: "Use Softmax to connect conditioning, algorithmic stability, input-representation error, summation stagnation, and consumer-specific mitigation."
tags: ["Error Analysis", "Numerical Analysis", "Softmax", "Floating Point"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "topic-index"
weight: 2
---

Softmax is often compressed into one formula:

\[
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
\]

From the perspective of error analysis, however, that formula quickly separates into several different questions:

- Why can equal-size logit perturbations have different effects in different directions?
- Why do the probabilities remain unchanged when every logit receives the same shift?
- Why does subtract-max prevent overflow but fail to restore an input difference that has already been lost?
- How do exp, accumulation of the normalizer, and final division each enter the probability error?
- Why does a probability sum of exactly $1$ still fail to prove that every component is correct?
- After finding a summation failure, why can we not immediately declare a tree, Kahan, or a wider accumulator to be better?

This pass does not begin with the Softmax formula itself. It first returns to a minimal two-dimensional linear map, establishes that error has a direction, and then moves through Jacobians, singular values, the probability simplex, the finite-precision computation graph, summation stagnation, and consumer-specific mitigation.

## Route Through the Topic

### 1. Why Error Has a Direction

[From a Two-Dimensional Linear Map to Jacobians and Singular Values](/en/notes/systems/error-analysis/softmax/note-error-softmax-1-directional-jacobian/) begins with $A=\operatorname{diag}(3,0.5)$, separates the operator norm from the full singular-value information and singular directions, and then uses a nonlinear example with an $h^2$ remainder to show that a Jacobian is only a position-dependent local propagator.

### 2. Which Directions Make Softmax Sensitive

[The Softmax Jacobian: Directions and Spectrum on the Probability Simplex](/en/notes/systems/error-analysis/softmax/note-error-softmax-2-geometry-spectrum/) derives

\[
J_s=\operatorname{diag}(p)-pp^T
\]

and interprets the matrix action as “subtract the probability-weighted mean, then scale by the component probabilities.” Three-class examples show isotropy at the uniform point, directional splitting at a nonuniform point, and the distinction between the local value $3/8$ and the global bound $1/2$.

### 3. Why Mathematical Equivalence Does Not Imply Numerical Stability

[From Subtract-Max to FP32 Input Quantization](/en/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/) compares naive Softmax, subtract-max, log-sum-exp, and fused cross-entropy. An FP32 experiment near $2^{24}$ then separates “Softmax evaluated the input incorrectly” from “the input had already changed before Softmax began.”

### 4. Put Every Rounding Step Into the Budget

[How exp, Summation, and Division Enter the Final Probability](/en/notes/systems/error-analysis/softmax/note-error-softmax-4-floating-point-budget/) starts from

\[
\widehat q_i=q_i(1+\epsilon_i)
\]

and derives a first-order budget for exp, summation, and division. It explains why normalization removes a common relative error, which errors move the result off the probability simplex, and why underflow abruptly invalidates the small-relative-error model.

### 5. How Summation Order Swallows Small Tail Terms

[How Summation Order Swallows Small Tail Terms](/en/notes/systems/error-analysis/softmax/note-error-softmax-5-summation-stagnation/) freezes the FP32 numerators received by the Sum stage. It begins with $q=(1,u,u)$, scales the half-ULP stagnation mechanism into a measurable stress case, and then uses binary and decimal midpoint controls to separate input quantization from reduction error. The controls also provide a concrete input on which the fixed pairwise implementation is not correctly rounded.

### 6. From Observation to Consumer-Specific Mitigation

[From Observation to Consumer-Specific Mitigation](/en/notes/systems/error-analysis/softmax/note-error-softmax-6-consumer-specific-mitigation/) separates raw observations, policy-free summaries, consumer policies, and assessments. The same summary is evaluated under a tolerance policy and a correct-rounding policy, showing that a result can pass a consumer tolerance without being correctly rounded. The article then builds a failure--consumer--metric--tolerance--mitigation chain for the input, exp, sum, and division stages.

## The Boundaries Established in This Pass

These notes repeatedly separate three questions:

- **Problem conditioning:** how exact Softmax responds to input perturbations, described by its Jacobian and spectrum.
- **Algorithmic stability:** how much additional error a floating-point evaluation path introduces through exp, summation, and division.
- **Input representation error:** whether low-precision quantization has already changed the logits before Softmax sees them.

All three can occur in one computation, but they cannot be summarized by the single phrase “Softmax is numerically unstable.”

This pass contains a reproducible FP32 input-quantization experiment, a first versioned summation-stress artifact, midpoint boundary controls, and a first consumer-specific failure-to-mitigation chain. GPU reduction graphs and the accuracy--cost frontier on target hardware have not yet been measured.

Derivations, source code, tests, CSV data, and metadata are preserved in [Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax).

---

**Start reading:** [Softmax 1: Why Error Has a Direction](/en/notes/systems/error-analysis/softmax/note-error-softmax-1-directional-jacobian/)
