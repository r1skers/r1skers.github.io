---
date: '2026-09-12T00:00:00+09:00'
draft: false
title: 'Softmax Normalization and Division: The Final Rounding'
summary: "Fix the actual numerator and denominator, distinguish exact ratios from division rounding and storage, and follow the Error Atlas implementation."
description: "Direct division, reciprocal multiplication, signed residuals, and FP16/BF16 output storage, with exact examples and code notes."
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Division"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 6
math: true
ShowToc: true
softmaxArticle: true
---

[← Back to the computation map · Normalization and division](/en/notes/systems/error-analysis/softmax/#division)

> Drafted with agent assistance and technically reviewed against Error Atlas. Implementation notes distinguish ordinary probability outputs from online scalar outputs; arithmetic models are not GPU instruction measurements.

## 1. Fix the actual numerator and denominator

[Denominator reduction](/en/notes/systems/error-analysis/softmax/denominator-reduction/) ended with the computed denominator $\hat L$. Now fix it and each numerator $\hat q_i$, without changing exp or summation.

Assume finite nonnegative FP32 $\hat q_i$ and a finite positive FP32 $\hat L$. The local reference is

\[
r_i=\frac{\hat q_i}{\hat L}.
\]

This division is exact over the reals. The reference need not equal the original mathematical probability, and its components need not sum to 1: upstream errors already reside in these operands.

| Object | Notation | Meaning |
| --- | --- | --- |
| Exact ratio | $r_i$ | Exact division of actual operands |
| FP32 division output | $\hat p_i$ | Result of the specified division path |
| Stored output | $\tilde p_i$ | Conversion of $\hat p_i$ to the output format |

Start with one correctly rounded FP32 division, round-to-nearest, ties-to-even, gradual underflow, and no overflow:

\[
\hat p_i=Q_{32}(r_i).
\]

Then distinguish reciprocal multiplication and subsequent storage conversion.

## 2. Exact earlier stages can still end in rounding

For three equal logits, shifted values are zero, exponentials are 1, and the denominator 3 is exactly representable. Division still requires

\[
r_1=r_2=r_3=\frac13.
\]

One third has no finite binary representation. The correctly rounded FP32 value and residual are

\[
\hat p_i=\frac{11184811}{33554432},
\qquad
d_i=\hat p_i-\frac13
=\frac{1}{100663296}.
\]

The exact sum of the three stored outputs is therefore

\[
\sum_i\hat p_i=1+2^{-25}.
\]

Neither exp nor denominator reduction is wrong here. The discrepancy comes from final division rounding.

## 3. Observe the final step locally

Define the absolute-scale signed residual

\[
d_i=\hat p_i-r_i.
\]

It is defined even when $r_i=0$. For $r_i>0$, define relative error:

\[
\delta_i=\frac{d_i}{r_i},
\qquad
\hat p_i=r_i(1+\delta_i).
\]

If the exact ratio is in the FP32 normal range and the stated rounding contract applies, $|\delta_i|\le u$, where $u=2^{-24}$. This is not an automatic guarantee for arbitrary fast-division implementations.

In the subnormal range, consider absolute error. With $h=2^{-149}$, let

\[
\hat q_i=h,\qquad \hat L=2,
\]

The exact ratio is $h/2$, which ties-to-even rounds to zero. A nonzero exponential can therefore become zero only at division. Its absolute error is tiny, but its relative error is $-1$, outside the small $O(u)$ relative-error model.

To connect with the previous stage, define

\[
L_q=\sum_j\hat q_j,\qquad
\eta=\frac{\hat L-L_q}{L_q},\qquad
p_i^{(e)}=\frac{\hat q_i}{L_q}.
\]

For nonzero components,

\[
\frac{\hat p_i}{p_i^{(e)}}
=\frac{1+\delta_i}{1+\eta}.
\]

Reduction contributes a shared factor; division contributes component-specific rounding. Only for small errors is the relative change approximately $-\eta+\delta_i$. The exp budget is not rederived here, and $d_i$ is not the total error against the original Softmax.

## 4. Development notes: one rounding after an exact ratio

### 4.1 Where the code lives

The ordinary prototype [fp32_softmax_summation.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/fp32_softmax_summation.py) ends with

~~~python
denominator = summation(exponentials)
probabilities = exponentials / denominator
~~~

It retains stage outputs so actual operands can be frozen. These lines do not themselves record the exact ratio or residual, nor prove which GPU instructions are used.

Explicit bookkeeping appears in [online/output_reference.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_reference.py). It computes a scalar weighted output $\hat O/\hat\ell$, not a materialized probability vector:

| Ordinary probabilities | Online scalar output | Shared final operation |
| --- | --- | --- |
| Nonnegative $\hat q_i$ | Signed $\hat O$ | Fix the actual numerator |
| $\hat L>0$ | $\hat\ell>0$ | Fix the actual denominator |
| Each probability component | One scalar output | Exact ratio followed by specified rounding |

### 4.2 finish_output: extract the actual state first

`finish_output` first propagates the numerator along an existing merge dump, then extracts root numerator and denominator. For a single leaf there are no internal nodes and the leaf numerator is used.

The function thus does more than division. This article's stage boundary begins after extracting the operands:

~~~python
if denominator <= 0:
    raise ValueError("Output division requires a positive computed denominator")
ratio = numerator / denominator
value = round_to_fp32(ratio)
return ComputedOutput(numerator, denominator, ratio, value, value - ratio)
~~~

Both operands are Fractions, so `ratio` is exact. The rounding function returns a rounded value; `value - ratio` is precisely the newly introduced residual.

The signed routine in [online/fp32_signed.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/fp32_signed.py) locates the grid using the magnitude, performs RN-even, then restores the sign. It follows the earlier oracle's grid logic; a separate long-division implementation is not needed for the exact ratio.

### 4.3 ComputedOutput: retain reference and result separately

Five fields are retained:

| Field | Meaning |
| --- | --- |
| `numerator` | Actual computed numerator |
| `denominator` | Actual computed denominator |
| `before_division_rounding` | Their exact ratio |
| `value` | Final FP32-rounded result |
| `division_residual` | `value - before_division_rounding` |

Existing numerator or denominator errors are not charged again to the division residual.

A single-leaf dump isolates the one-third example. Run from Error Atlas's `topics/softmax/experiments` directory:

~~~python
from fractions import Fraction as F
from online.merge import merge_reduce
from online.schedules import sequential_chain
from online.output_reference import finish_output

dump = merge_reduce((F(0),), (F(3),), sequential_chain(1))
computed = finish_output(dump, (F(1),))

assert computed.before_division_rounding == F(1, 3)
assert computed.value == F(11184811, 33554432)
assert computed.division_residual == F(1, 100663296)
~~~

This is an isolated division fixture, not a claim that the dump is a complete three-class Softmax trace. Numerator $-1$ checks signed rounding; a zero denominator should be rejected.

## 5. Reciprocal multiplication is a different path

If the implementation instead computes

\[
\hat t=Q_{32}(1/\hat L),\qquad
\hat p_i^{(\mathrm{rm})}=Q_{32}(\hat q_i\hat t),
\]

it contains two roundings. For $\hat q_i=5/64$ and $\hat L=3$:

| Path | Exact value of FP32 output |
| --- | --- |
| Direct division, rounded once | $13981013/536870912$ |
| FP32 reciprocal followed by FP32 multiplication | $13981014/536870912$ |

They differ by one FP32 spacing at this magnitude. Check with the existing oracle:

~~~python
from fractions import Fraction as F
from online.fp32_signed import round_to_fp32

q, denominator = F(5, 64), F(3)
direct = round_to_fp32(q / denominator)
via_reciprocal = round_to_fp32(q * round_to_fp32(1 / denominator))
assert direct != via_reciprocal
~~~

These are two prescribed arithmetic models, not an existing GPU division benchmark. `finish_output` implements direct ratio rounding, not reciprocal multiplication.

Without underflow or similar structural complications, write

\[
\hat t=\frac{1}{\hat L}(1+\alpha),\qquad
\hat p_i^{(\mathrm{rm})}
=\hat q_i\hat t(1+\beta_i),
\]

For $r_i>0$,

\[
\frac{\hat p_i^{(\mathrm{rm})}}{r_i}
=(1+\alpha)(1+\beta_i).
\]

For $r_i=0$, use the absolute residual $\hat p_i^{(\mathrm{rm})}-r_i$ instead of this relative ratio.

The reciprocal error $\alpha$ is shared across components; $\beta_i$ is local multiplication error. Track the actual path: a slash in source code does not establish that the implementation rounds only once.

## 6. storage_cast: begin with the actual FP32 result

For subsequent FP16 or BF16 storage, define

\[
\tilde p_i=Q_T(\hat p_i),\qquad
c_i=\tilde p_i-\hat p_i.
\]

Relative to this article's local reference,

\[
\boxed{
\tilde p_i-r_i
=\underbrace{\hat p_i-r_i}_{d_i}
+\underbrace{\tilde p_i-\hat p_i}_{c_i}.
}
\]

This is signed addition, not a requirement that both magnitudes accumulate in the same direction. Nor may $Q_T(r_i)$ replace the actual $Q_T(Q_{32}(r_i))$: skipping the FP32 intermediate changes the path, and double rounding need not equal single rounding.

### 6.1 Three storage branches

`storage_cast` in [online/output_measure.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/output_measure.py) requires a stored FP32 input in $[-2,2]$:

- FP32 returns the original value and bits without another precision conversion.
- FP16 uses `struct.pack(">e", float(value))` to encode binary16 and decodes it to a Fraction.
- BF16 rounds the FP32 bits using discarded bits and retained-bit parity.

Every FP32 value promotes exactly to Python binary64, so the FP16 branch does not first lose information during that promotion. The [struct documentation](https://docs.python.org/3/library/struct.html#format-characters) specifies IEEE binary16 for `e`. The BF16 core is

~~~python
upper = (bits + 0x7fff + ((bits >> 16) & 1)) >> 16
~~~

Discarded low bits below half a step do not carry; above half they do. At `0x8000`, retained-bit parity decides, implementing ties-to-even rather than truncation.

The contract uses gradual underflow and canonical positive zero. It serves the restricted range, not general overflow, NaN, or signed-zero conversion.

### 6.2 One third in different storage formats

Continue with `computed` from §4:

~~~python
from online.output_measure import storage_cast

for dtype in ("fp32", "fp16", "bf16"):
    stored, bits = storage_cast(computed.value, dtype)
    cast_residual = stored - computed.value
    assert stored - F(1, 3) == computed.division_residual + cast_residual
    print(dtype, stored, bits, stored - F(1, 3))
~~~

The results are:

| Storage | Actual stored value | Bits | Stored value minus $1/3$ |
| --- | --- | --- | --- |
| FP32 | $11184811/33554432$ | `3eaaaaab` | $1/100663296$ |
| FP16 | $1365/4096$ | `3555` | $-1/12288$ |
| BF16 | $171/512$ | `3eab` | $1/1536$ |

This is one constructed case, not a universal format ranking. FP16 storage flips the total error's sign. Adding residual magnitudes gives an upper bound on total error magnitude, not the actual signed total.

`record` casts `computed.value` and saves `division_residual`, but `formats.signed_error` compares against the supplied complete output reference interval, not $c_i$. To isolate storage error, calculate `stored - computed.value`. Similar field names do not make local and end-to-end error interchangeable.

## 7. Validation and scope

[test_online_output_reference.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_reference.py) checks negative one third, constant outputs, and rejection of nonpositive denominators. Its other interval tests construct online output references; they are not extra steps of ordinary division.

[test_online_output_measure.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_output_measure.py) checks FP16 comparison, BF16 ties and neighbors, subnormal rounding to zero, and input range. These are implementation checks, not universal GPU, compiler, or input-domain guarantees.

Audit three boundaries:

1. Is division residual always measured against the exact ratio of actual operands?
2. Are direct division and reciprocal multiplication separate models?
3. Does storage conversion start from the actual FP32 result rather than freshly rounding the mathematical reference?

This article does not repeat online numerator propagation or full reference construction, and does not benchmark fast division. The ordinary output has reached its specified storage format. [Downstream use](/en/notes/systems/error-analysis/softmax/#consumer) asks whether these differences matter to a consumer; measurable error is not necessarily harmful for every use.

Back to the map: [Division](/en/notes/systems/error-analysis/softmax/#division) · [Consumers](/en/notes/systems/error-analysis/softmax/#consumer)
