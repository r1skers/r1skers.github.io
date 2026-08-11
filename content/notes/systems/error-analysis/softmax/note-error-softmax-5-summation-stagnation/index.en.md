---
date: '2026-08-11T00:00:00+09:00'
draft: false
title: 'Error Analysis · Softmax 5: How Summation Order Swallows Small Tail Terms'
summary: "In FP32, a positive half-ULP increment may fail to change a running sum at all; changing only the reduction graph can therefore change the result for the same numerators."
description: "Begin with the minimal counterexample q=(1,u,u), scale it into a Softmax-denominator stress case, and use midpoint controls to compare sequential, pairwise, Kahan, and FP64 accumulation."
tags: ["Error Analysis", "Softmax", "Floating Point", "Summation"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 5
---

The previous article derived the first-order Softmax error budget

\[
\frac{\widehat p_i-p_i}{p_i}
\approx
\epsilon_i-\bar\epsilon-\eta+\delta_i.
\]

Here $\eta$ is the summation error in the normalizer. Standard theory says that
sequential summation has a worst-case scale of approximately $O(nu)$, while a
balanced tree has a scale of approximately $O((\log n)u)$.

An error bound does not automatically tell us:

- which input will actually fail;
- where a small term is discarded;
- why a different order can recover the same multiset of values;
- what pairwise summation, Kahan compensation, and a wider accumulator each repair.

This article temporarily removes the rest of Softmax and studies only the FP32
numerators received by the denominator reduction.

## 1. Freeze the Actual Input to the Sum Stage

The Softmax computation graph can be written as

\[
z
\longrightarrow
x=z-\max(z)
\longrightarrow
\widehat q
\longrightarrow
\widehat S
\longrightarrow
\widehat p.
\]

When the reduction is the stage under study, freeze the $\widehat q$ values
actually produced by the exp stage. The local reference is the exact sum of
those stored FP32 values:

\[
S_q=\sum_i\widehat q_i.
\]

If reduction method $M$ returns $\widehat S_M$, define the stage-local errors by

\[
E_M=\widehat S_M-S_q,
\qquad
r_M=\frac{\widehat S_M-S_q}{S_q}.
\]

Input quantization and exp approximation are now frozen rather than attributed
to summation a second time. This follows the same rule as the third article:

> Make each stage responsible only for the new error it introduces.

## 2. Why Half an ULP Fails to Enter the Sum

For FP32,

\[
u=2^{-24},
\qquad
\operatorname{ulp}(1)=2^{-23}=2u.
\]

Therefore $1+u$ lies exactly halfway between $1$ and the next FP32 value. Under
round-to-nearest, ties-to-even, the endpoint with an even trailing significand
is $1$:

\[
\operatorname{RN}_{32}(1+u)=1.
\]

This is not merely a small relative error in the increment. The positive
increment fails to change the stored result at all.

The minimal counterexample is

\[
q=(1,u,u).
\]

Left-to-right summation gives

\[
\operatorname{RN}_{32}
\left(
\operatorname{RN}_{32}(1+u)+u
\right)
=1.
\]

Each $u$ encounters a half-ULP tie and is rounded back to $1$.

If the tail terms are combined first,

\[
\operatorname{RN}_{32}
\left(
1+\operatorname{RN}_{32}(u+u)
\right)
=1+2u.
\]

Now $u+u=2u$ equals one full $\operatorname{ulp}(1)$ and can enter the final
result. The values have not changed; only the reduction graph has changed.

## 3. A Nonzero Tail Need Not Enter the Total

Every $u=2^{-24}$ above is a normal, nonzero, exactly representable FP32 value.
The failure is not that the tail was quantized to zero before the Sum stage. It
comes from the scale of a tail term relative to the current partial sum.

Two failures must therefore be distinguished:

1. **Input-representation loss:** a value becomes zero, or a contrast disappears,
   before it reaches the Sum stage.
2. **Summation stagnation:** the input remains nonzero, but adding it fails to
   change the running sum.

Checking

\[
\widehat q_i\ne0
\]

rules out only the first failure.

## 4. Scale Local Stagnation Into a Measurable Failure

Use the stress case

\[
q=(1,\underbrace{2^{-24},\ldots,2^{-24}}_{2^{20}\text{ terms}}).
\]

The exact stored-input reference is

\[
S_q
=1+2^{20}2^{-24}
=\frac{17}{16}.
\]

A head-first sequential FP32 reduction repeatedly tries to add half an ULP to
$1$ and therefore still returns

\[
\widehat S_{\mathrm{seq}}=1.
\]

It loses the entire tail mass

\[
\frac1{16},
\]

and its absolute relative error is

\[
\left|
\frac{1-\frac{17}{16}}{\frac{17}{16}}
\right|
=\frac1{17}.
\]

Each local step loses only $2^{-24}$, but enough repeated losses become a
visible global bias.

## 5. A Controlled Comparison of Four Reductions

Keep the inputs, reference, and output dtype fixed, and change only the
summation method:

| Candidate | $\widehat S$ | Maximum absolute relative error |
| --- | ---: | ---: |
| sequential FP32 | $1$ | $1/17$ |
| fixed pairwise FP32 | $17/16$ | $0$ |
| Kahan FP32 | $17/16$ | $0$ |
| FP64 accumulator, FP32 output | $17/16$ | $0$ |

### Fixed Pairwise

The current tree first combines tail terms into larger partial sums and then
merges those partial sums with $1$. It therefore recovers the complete tail
mass in this case.

However,

\[
O((\log n)u)
\]

is an error scale associated with tree depth, not a pointwise guarantee that
the method is more accurate for every input. The exact pairing still matters.

### Kahan Compensation

Kahan summation maintains a compensation term that carries low-order
information lost by a previous update into later operations. It recovers the
exact FP32 result in this case.

This does not mean that Kahan is correctly rounded for arbitrary inputs, nor
that it has the lowest cost on parallel hardware.

### FP64 Accumulator

After converting the FP32 inputs into an FP64 accumulator, the tail can build
up inside a wider significand before the result is rounded back to FP32. This
case again returns $17/16$.

The result shows that wider accumulation repairs this failure; it does not tell
us its throughput, register pressure, or energy cost on the target hardware.

## 6. Test the Claim With Rounding-Boundary Controls

The $17/16$ stress case proves that fixed pairwise summation repairs one form of
stagnation, but it is also friendly to a tree reduction. To test the statement
that the exact pairing matters, place the exact sum on both sides of an FP32
rounding boundary.

First use the exactly representable binary tail

\[
t=2^{-34},
\qquad
S_q=1+Nt.
\]

Near $1$, half an ULP is $2^{-24}$. The cases $N=1023,1024,1025$ therefore lie
below the midpoint, exactly on it, and minimally above it:

| $N$ | Correctly rounded FP32 bits | Boundary position |
| ---: | --- | --- |
| $1023$ | `0x3f800000` | below the midpoint |
| $1024$ | `0x3f800000` | tie, rounded down by ties-to-even |
| $1025$ | `0x3f800001` | minimally above the midpoint |

For $N=1025$, head-first sequential FP32 still returns `0x3f800000`, while
tail-first sequential FP32 returns `0x3f800001`. The current fixed pairwise
implementation returns `0x3f800000` under both layouts. Kahan and the FP64
accumulator return the correct `0x3f800001`.

This is a direct counterexample: pairwise summation recovers the reference in
the large stress case but rounds down in a control just above the midpoint. A
shorter tree depth remains useful, but it is not a per-input correct-rounding
guarantee.

Next use a decimal source tail

\[
t_{\mathrm{source}}=10^{-8},
\qquad
\widehat t=\operatorname{RN}_{32}(t_{\mathrm{source}}).
\]

Now two references must be preserved:

\[
S_{\mathrm{source}}=1+Nt_{\mathrm{source}},
\qquad
S_{\mathrm{stored}}=1+N\widehat t.
\]

Their difference is input-quantization error. Reduction error must be measured
against $S_{\mathrm{stored}}$. For $N=5$, the correctly rounded stored sum is
still `0x3f800000`; for $N=6$, it is `0x3f800001`. In the $N=6$ control,
head-first sequential and fixed pairwise summation are not correctly rounded;
tail-first sequential, Kahan, and the FP64 accumulator are.

The boundary family therefore does three jobs:

- it verifies the midpoint and ties-to-even predictions;
- it separates source-input error from reduction error;
- it places an empirical limit on the claim that pairwise summation is more
  accurate.

## 7. Why CPU Prototype Timings Cannot Rank the Methods

Sequential, recursive pairwise, Kahan, and FP64 loops in Python have completely
different interpreter overheads. Their timings do not represent GPU costs for:

- warp- and block-level reduction;
- shared-memory and register use;
- synchronization;
- vectorization;
- accumulator throughput;
- kernel launches and memory traffic.

The current experiment compares numerical results only. It does not use CPU
Python timings to draw performance conclusions.

## 8. What This Article Actually Validates

The evidence now establishes that:

- nonzero FP32 tail terms can stagnate completely at the addition stage;
- the reduction graph can change the result for the same multiset;
- local rounding losses in sequential summation can accumulate into a relative
  error of $1/17$;
- fixed pairwise, Kahan, and the FP64 accumulator recover the reference in the
  $17/16$ stress case;
- midpoint controls provide an input on which fixed pairwise summation is not
  correctly rounded, so a shorter tree cannot be rephrased as “more accurate
  for every input”;
- the decimal-tail control separates source-input quantization from reduction
  error;
- a CPU numerical prototype provides numerical evidence, not a GPU cost ranking.

One more question is required before a mitigation can be selected:

> How much error counts as failure, is repeatability required, and who decides?

Those are properties of a consumer policy, not intrinsic properties of the
reduction method.

The versioned CSV and metadata for the first stress case, together with source
code and tests for the later boundary controls, are preserved in
[Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax/experiments).

---

**Previous:** [Softmax 4: Put exp, Summation, and Division Into the Error Budget](/en/notes/systems/error-analysis/softmax/note-error-softmax-4-floating-point-budget/)

**Next:** [Softmax 6: From Observation to Consumer-Specific Mitigation](/en/notes/systems/error-analysis/softmax/note-error-softmax-6-consumer-specific-mitigation/)
