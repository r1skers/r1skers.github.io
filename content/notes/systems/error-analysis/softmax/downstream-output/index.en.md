---
date: '2026-09-13T00:00:00+09:00'
draft: false
title: 'Softmax Downstream Use: How Error Reaches Weighted Outputs'
summary: "Trace probability error into scalar weighted outputs, distinguish cancellation and storage, and follow Error Atlas probes and measurements."
description: "Weighted-output error identities, constant-V controls, signed probes, real-reference intervals, and FP32 versus low-precision storage evidence."
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Attention"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 7
math: true
ShowToc: true
softmaxArticle: true
---

[← Back to the computation map · Downstream consumers](/en/notes/systems/error-analysis/softmax/#consumer)

> Drafted with agent assistance and technically reviewed against Error Atlas. Development notes follow existing code dependencies, not a day-by-day history. Source explain-backs and implementation limits are distinguished. This article covers scalar weighted outputs, not complete attention, loss, or model-quality experiments.

## 1. Does probability error necessarily harm the output?

The [previous article](/en/notes/systems/error-analysis/softmax/normalization-division/) ended with actual probabilities and their storage values. Now fix a use such as attention:

\[
y=\sum_i p_iV_i.
\]

Here $p$ is the exact Softmax distribution and each $V_i$ is a given finite scalar. It can represent one attention-output coordinate, but we hold $V$ fixed and exclude its generation or quantization error.

Let the consumer receive $\tilde p_i=p_i+\Delta p_i$. If weighted summation is temporarily exact, write its result as $y_{\tilde p}$. Then

\[
\boxed{y_{\tilde p}-y=\sum_i\Delta p_iV_i.}
\]

How error reaches the output depends on the relationship between $\Delta p$ and $V$, not only on an individual probability error.

For $p=(1/2,1/2)$ and $\Delta p=(\varepsilon,-\varepsilon)$, with $0\lt\varepsilon\lt1/2$:

- $V=(1,1)$ gives zero output error.
- $V=(1,-1)$ turns the same probability error into $2\varepsilon$ of output error.

Smaller denominator error, smaller probability error, and smaller error in a particular consumer are not equivalent without further conditions.

### 1.1 Does the constant direction really disappear?

For any constant $c$,

\[
\sum_i\Delta p_iV_i
=\sum_i\Delta p_i(V_i-c)+c\sum_i\Delta p_i.
\]

If the exact sum of actual probabilities is still 1, then $\sum_i\Delta p_i=0$ and the constant part disappears. Otherwise the second term remains. The three-way example in the previous article shows that stored probabilities need not sum exactly to 1.

Actual weighted summation adds multiplication and accumulation errors. Define $a=\hat y-y_{\tilde p}$; then

\[
\hat y-y=\sum_i\Delta p_iV_i+a.
\]

This separates incoming probability error from arithmetic introduced by the consumer, without assuming the latter is zero.

## 2. A fused output need not materialize probabilities

Another path maintains a weighted numerator and denominator and divides only at the end:

\[
O_*=\sum_i q_iV_i,\qquad
\ell_*=\sum_iq_i,\qquad
y=\frac{O_*}{\ell_*},
\]

Here $q_i=\exp(x_i-M)$, $M=\max_i x_i$, and all reference quantities are evaluated exactly.

Both ordinary and online/tiled evaluation can use this organization. They share a mathematical target, not necessarily intermediate rounding. This article uses Error Atlas's online scalar implementation as a concrete example, not as code for first storing probabilities and then evaluating $PV$.

Write actual operands as

\[
\hat O=O_*+\Delta O,\qquad
\hat\ell=\ell_*+\Delta\ell>0.
\]

Before final division rounding, the exact error identity is

\[
\boxed{
\frac{\hat O}{\hat\ell}-y
=\frac{\Delta O-y\Delta\ell}{\hat\ell}.
}
\]

Denominator error enters jointly with numerator error. The two terms can cancel or reinforce. Adding division residual $d$ and storage residual $c_{\mathrm{store}}$ gives

\[
\tilde y-y
=\frac{\Delta O-y\Delta\ell}{\hat\ell}
+d+c_{\mathrm{store}}.
\]

The residual definitions are those of the preceding article; their implementation is not repeated here.

### 2.1 Why check V = 1 first?

Mathematically, all $V_i=1$ implies $O_*=\ell_*$ and $y=1$. The floating-point implementation needs matching numerator and denominator arithmetic to reproduce that result.

In this controlled implementation, the leaf numerator equals the leaf denominator for $V=1$. Each merge reuses the same weights, branches, and rounding, so check at every node:

\[
\hat O_v=\hat\ell_v.
\]

With a valid positive final denominator, $\hat O/\hat\ell=1$, and final division and supported storage are exact. The output can thus be exact even when the denominator differs from its reference.

This is neither a universal guarantee for arbitrary constant $V$ nor a guarantee for materialized probabilities. If each $p_i$ is rounded first, the exact sum of stored values need not be 1. A subsequent floating-point sum for $V=1$ may nevertheless round back to 1. These observations must not be conflated.

## 3. Development notes: fix V, then reuse the existing path

Start with [online/output_probe.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_probe.py): choose probes and leaves, propagate the numerator, then connect [output_reference.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_reference.py) and [output_measure.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_measure.py).

### 3.1 probe_values: change values, not the probability problem

`BlockFamily` is a controlled input: block $b$ contains $n_b$ identical logits $m_b$ and uses a constant value $V_b$. A probe changes only $V_b$, not logits, masses, or the merge graph.

| Probe | Choice of V | Observation |
| --- | --- | --- |
| `zero` | All zero | Zero-output control |
| `one` | All one | Numerator/denominator path consistency |
| `max_block` | One at the first maximum-logit block in original order, zero elsewhere | That block's total probability mass |
| `first_block` | One at the first block, zero elsewhere | Mass at a fixed position |
| `alternating_sign` | Alternating +1 and −1 in original block order | Difference of group masses and signed cancellation |

Maximum ties are resolved before evaluating trees, not independently by each tree. `first_block` does not necessarily select a small tail-probability block; it selects a position.

The source clarifies the central semantic point: V is a value, not a probability. An indicator probe's output measures the selected block's probability mass; V should not first be normalized as if it were a probability vector.

### 3.2 leaf_numerators: do not multiply by probability twice

Within each block's own maximum scale, every exponential is $\exp(m_b-m_b)=1$, so

\[
\ell_b=n_b,\qquad O_b=n_bV_b.
\]

The code is

~~~python
result = tuple(Fraction(n) * v for n, v in zip(family.masses, values))
~~~

There is no global probability or early $\exp(m_b-M)$ factor here. Subsequent merging connects the different local scales.

The function accepts $\{0,\pm1/2,\pm1\}$ and checks that the leaf results are stored FP32 values. The five probes above use only $0,\pm1$. This isolates later propagation; it is not a general intra-block dot-product implementation.

### 3.3 propagate_numerator: reuse weights instead of recomputing exp

`MergeDump` already stores child indices and actual rounded weights. Numerator propagation reads them without recalculating max, gaps, or exp.

The separate branch performs two FP32 multiplications and then one FP32 addition:

~~~python
p_a, _ = fp32_mul(o_a, w_a)
p_b, _ = fp32_mul(o_b, w_b)
o_v, _ = fp32_add(p_a, p_b)
~~~

The FMA branch follows the denominator's branch order: test whether the left weight is 1, then the right weight, and fuse the other side's multiplication with addition. Do not select the branch based on the sign or magnitude of $O$: rescaling is determined by the weights.

The source explain-back clarifies that $O$ may be negative because V may be negative; $O$ itself is not an error. For $V=1$, the equal node quantities are mass in that node's maximum scale, not an ordinary sum of all descendant leaf masses.

### 3.4 A control: inspect every node, not just the final 1

Run from Error Atlas's `topics/softmax/experiments` directory:

~~~python
from fractions import Fraction as F
from online.pilot import BlockFamily
from online.merge import merge_reduce
from online.schedules import sequential_chain, balanced_pairwise
from online.output_probe import probe_values, leaf_numerators, propagate_numerator
from online.output_reference import finish_output, reference_output
from online.output_measure import record

family = BlockFamily(tuple(map(F, (-3, 0, -1, -2))), (32,) * 4)
values = probe_values(family, "one")
leaves = leaf_numerators(family, values)
reference = reference_output(family, values)
assert reference.output == (F(1), F(1))

for tree in (sequential_chain(4), balanced_pairwise(4)):
    for fused in (False, True):
        dump = merge_reduce(family.leaf_max, family.leaf_ell, tree, fused=fused)
        assert propagate_numerator(dump, leaves) == dump.node_ell
        computed = finish_output(dump, leaves)
        assert computed.value == 1
        assert computed.division_residual == 0
        measured = record(computed, reference, max(map(abs, values)))
        assert all(row["abs_error"] == (0, 0)
                   for row in measured["formats"].values())
~~~

This checks path consistency; it does not assume this fixture has a large denominator error. Nonconstant probes still need separate tests. Passing `one` does not prove correctness over all inputs.

## 4. References and metrics when outputs can be zero

### 4.1 reference_output: not another floating-point implementation

The block model's real reference is

\[
O_*=\sum_b n_bV_b\exp(m_b-M),\qquad
\ell_*=\sum_b n_b\exp(m_b-M).
\]

`numerator_interval` uses exact Fraction gaps and real-exp intervals. Reusing rounded dump gaps or exp outputs would contaminate the reference with the implementation under test.

Negative coefficients $n_bV_b$ reverse interval endpoints. `quotient_interval` examines all four endpoint quotients for a signed numerator and strictly positive denominator. It returns a conservative enclosure, not necessarily the tightest bound retaining correlation.

For constant $V=v$, use $O_*=v\ell_*$ to return $[v,v]$ directly. Independent interval division does not automatically recover this mathematical correlation. It also does not imply floating-point exactness for arbitrary $v$.

### 4.2 record: normalize by V's scale, not by y

`alternating_sign` can produce outputs near zero or exactly zero. Relative error is undefined at zero; near zero it remains defined but can be extremely sensitive to small absolute error.

`output_runner.py` passes $s=\max_b\lvert V_b\rvert$ to `record`. For $s>0$, it records

\[
\frac{\lvert\tilde y-y\rvert}{s}.
\]

This is absolute error normalized by input-value scale, not relative error against $y$. For `zero`, $s=0$ and the normalized field is `None`; raw output and absolute error remain available.

Given reference interval $[y_-,y_+]$, the signed-error interval is $[\tilde y-y_+,\tilde y-y_-]$. It is a numerical enclosure, not a statistical confidence interval.

### 4.3 One-sided substitutions are diagnostics

`record` also retains denominator-only and numerator-only substituted ratios:

\[
\frac{O_*}{\hat\ell},\qquad
\frac{\hat O}{\ell_*}.
\]

They ask what changing one side alone would do. They are neither actual outputs nor deployable algorithms. Adding their absolute errors does not produce a real error budget, because the actual output contains the numerator–denominator coupling in §2.

## 5. Different output, smaller error, and equal storage are distinct

`paired` compares chain and balanced runs sharing input, probe, and FMA setting. It first compares actual stored bits, then output differences and absolute-error differences.

Define

\[
D=\lvert e_{\mathrm{chain}}\rvert-\lvert e_{\mathrm{balanced}}\rvert.
\]

Only a wholly positive enclosure of $D$ certifies that chain has larger absolute error in that pair. An interval crossing zero cannot be ranked by its midpoint. Equal stored values sharing the same reference have equal errors; the code sets $D=[0,0]$ directly instead of introducing artificial width through independent interval subtraction.

### 5.1 What the saved experiment establishes

The [scalar-output diagnostic notes](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/online_scalar_output_v1.md) and [frozen bundle](https://github.com/r1skers/error-atlas/tree/17ffd2a/topics/softmax/experiments/online/runs/scalar_output_v1) document a post-hoc diagnostic on 64 existing input families. Restricting to three nonconstant probes and two FMA settings gives $64\times3\times2=384$ online tree pairs:

| Final format | Pairs with different chain/balanced output bits |
| --- | --- |
| FP32 | 332 / 384 |
| FP16 | 0 / 384 |
| BF16 | 0 / 384 |

In FP32, chain had larger absolute error in 266 pairs and balanced in 66. This proves neither universal balanced superiority nor universal irrelevance of improvements after low-precision storage. These particular actual FP32 values cast into identical low-precision rounding cells.

Equal storage does not mean zero reference error. Both trees may share an inaccurate stored value. Other inputs may cross a midpoint and produce different storage. Comparing an error to a dtype's unit roundoff is not enough to infer equal casts; perform the conversion and comparison.

Pairs share inputs and probes; they are not 384 independent random samples. These numbers come from the existing frozen study, not a new large experiment for this article. Complete attention, GPU cost, and model quality remain outside the evidence.

## 6. Audit order and scope

Follow the code dependencies:

1. `probe_values` and `leaf_numerators`: does V retain its value semantics, and are global weights absent from local initialization?
2. `propagate_numerator`: are actual weights and separate/FMA paths preserved, with nodewise $V=1$ checks?
3. `reference_output`: are real references, negative coefficients, and constant-V correlation handled?
4. `record` and `paired`: do casts begin with actual FP32 outputs, and are reference error, output difference, and bits distinguished?

[Probe tests](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_probe.py) cover selection, initialization, saved weights, signed cancellation, and FMA boundaries. [Reference tests](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_reference.py) and [measurement tests](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_measure.py) cover intervals, division, and storage bookkeeping.

This answers how error reaches this consumer. Acceptance additionally needs application-owned metrics, tolerances, and cost constraints; see [assessment and mitigation](/en/notes/systems/error-analysis/softmax/consumer-mitigation/).

Block states, rescaling, and merge topology remain in the [online branch](/en/notes/systems/error-analysis/softmax/#online-softmax). This article borrows its scalar implementation without repeating the complete online algorithm.

Back to the map: [Consumers](/en/notes/systems/error-analysis/softmax/#consumer) · [Online evaluation](/en/notes/systems/error-analysis/softmax/#online-softmax)
