---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: 'Error Analysis: From Approximation to Reliable Computation'
summary: "A long-running, topic-driven study of how errors are defined, introduced, propagated, estimated, controlled, and traded against computational cost."
description: "A reproducible approach to error analysis built from concrete mathematical objects and computing systems."
tags: ["Error Analysis", "Numerical Analysis", "Reliability"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 1
---

Error is not merely “how far the answer is from the truth.” A complete error analysis keeps asking:

\[
\text{definition}
\rightarrow
\text{source}
\rightarrow
\text{propagation}
\rightarrow
\text{estimation}
\rightarrow
\text{control}
\rightarrow
\text{accuracy--cost tradeoff}.
\]

This series does not begin by trying to write an encyclopedia of error theory. It enters through concrete topics. Every topic repeats the same research cycle:

1. define the reference, approximation, and metric;
2. separate truncation, input, roundoff, measurement, and other sources;
3. derive an exact representation, asymptotic order, or valid bound;
4. track how a computation amplifies, attenuates, or cancels the error;
5. identify controllable parameters and construct an accuracy--cost model;
6. test the derivation with reproducible experiments and record residuals the theory does not explain.

## Topic Map

### Topic 1: Taylor Expansion

[Taylor Expansion: From Remainders to Error Control](/en/notes/systems/error-analysis/taylor-expansion/) completes the first pass:

\[
\text{remainder}
\rightarrow
\text{representation}
\rightarrow
\text{order and bound}
\rightarrow
\text{bound quality}
\rightarrow
\text{propagation}
\rightarrow
\text{control and optimal step size}.
\]

It is an ideal first specimen: the formulas are transparent, yet they lead naturally into floating-point arithmetic, cancellation, finite differences, MSE, and Monte Carlo validation.

### Topic 2: Softmax

The current Softmax pass is archived as [Softmax: From Directional Error to Finite Precision](/en/notes/systems/error-analysis/softmax/). It begins with directional error in a two-dimensional linear map, proceeds through Jacobians, singular values, and the probability simplex, then follows subtract-max, exp, normalizer summation, division, and input quantization through the floating-point computation graph. It also establishes a first controlled failure--consumer--metric--tolerance--mitigation case. GPU reduction, mixed precision, and blockwise implementations remain for a later systems pass; related algorithms and reproductions are also collected in the [IO-Aware Attention dossier](/en/notes/topics/io-aware-attention/).

## Project and Evidence

Derivations, source code, tests, CSV files, metadata, and figures live in [Error Atlas](https://github.com/r1skers/error-atlas). The blog compresses one research pass into a readable argument; the repository preserves evidence that can be rerun and audited.

---

**Enter the first topic:** [Taylor Expansion: From Remainders to Error Control](/en/notes/systems/error-analysis/taylor-expansion/)
