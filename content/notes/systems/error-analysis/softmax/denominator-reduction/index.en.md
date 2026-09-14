---
date: '2026-09-09T00:00:00+09:00'
draft: false
title: 'Softmax Denominator Reduction: Where Accumulation Error Comes From'
summary: "Freeze exponential outputs and trace addition rounding, total error, and the effects of summation order on the denominator and probabilities."
description: "A minimal (1,u,u) example, exact references, local residuals, FP32 oracle implementation notes, and conditional tree-depth bounds."
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Summation"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 5
math: true
ShowToc: true
softmaxArticle: true
---

[← Back to the computation map · Denominator reduction](/en/notes/systems/error-analysis/softmax/#reduction)

> This article tracks only error introduced by addition. The implementation notes in §4 follow fp32_oracle.py, were drafted with agent assistance, and were read and revised by the author.

## 1. Fix the exponential outputs

The [exponentiation article](/en/notes/systems/error-analysis/softmax/exponentiation/) explained how exp errors enter the numerator and denominator, with exact denominator summation. Now freeze the actual FP32 outputs $\hat q_i$ and replace only summation with floating-point evaluation.

Assume finite, nonnegative values, not all zero. Distinguish:

| Object | Notation | Meaning |
| --- | --- | --- |
| Exact sum | $L_q=\sum_i\hat q_i$ | Exact addition of stored values |
| Correctly rounded target | $L_q^\star=Q_{32}(L_q)$ | One FP32 rounding of the exact sum |
| Reduction output | $\hat L_G=\operatorname{reduce}_G(\hat q)$ | Stepwise evaluation along a specific addition tree $G$ |

The stage error is

\[
E_G=\hat L_G-L_q,\qquad
\eta_G=\frac{E_G}{L_q}.
\]

The reference is $\sum_i\hat q_i$, not $\sum_i e^{s_i}$. Exponential error belongs to the previous stage and must not be charged to reduction again.

Nor do numerator and denominator call exp independently here: the numerator uses $\hat q_i$ and the denominator sums the same values. Its additional error comes from addition.

Assume FP32 round-to-nearest, ties-to-even, gradual underflow, and no intermediate overflow. Mixed precision, extra output casts, and FTZ require separate paths.

## 2. Why can a nonzero term fail to change the sum?

Let

\[
u=2^{-24},\qquad
\operatorname{ulp}(1)=2^{-23}=2u.
\]

The value $1+u$ lies halfway between $1$ and the next FP32 number. Ties-to-even chooses $1$:

\[
\operatorname{RN}_{32}(1+u)=1.
\]

The term $u$ is exactly representable and has not underflowed. It disappears when added to $1$.

Now fix the reduction input:

\[
\hat q=(1,u,u),\qquad L_q=1+2u.
\]

This is a directly constructed reduction input; no exp implementation is required to produce it. Change only the parentheses:

| Addition order | First step | Final result | $E_G$ |
| --- | --- | --- | --- |
| Large term first: $(1+u)+u$ | $1+u$ rounds to $1$ | $1$ | $-2u$ |
| Small terms first: $1+(u+u)$ | $u+u=2u$, exactly | $1+2u$ | $0$ |

The first path loses half an ULP twice. The second combines the small terms into a full ULP that survives.

A nonzero tail term need not change the partial sum. Positive summation does not always underestimate: rounding can go either way. The negative error here follows from these particular midpoints and ties-to-even.

## 3. Record the amount introduced by each addition

For sequential summation, write

\[
\hat a_1=\hat q_1,\qquad
\hat a_k=\operatorname{RN}_{32}(\hat a_{k-1}+\hat q_k).
\]

Define the local residual

\[
\rho_k=\hat a_k-(\hat a_{k-1}+\hat q_k).
\]

The parentheses contain the exact sum of the actual operands. This residual records only newly introduced rounding, without recounting earlier errors. Its sign is computed minus exact.

Rearranging,

\[
\hat a_k=\hat a_{k-1}+\hat q_k+\rho_k,
\]

and substituting recursively gives

\[
\boxed{
E_{\mathrm{seq}}
=\hat a_n-\sum_i\hat q_i
=\sum_{k=2}^{n}\rho_k.
}
\]

This is exact, not first order. The two residuals in the first $(1,u,u)$ path are both $-u$, totaling $-2u$.

The same argument applies to a binary addition tree. Define each internal residual against the exact sum of its actual child outputs. Intermediate terms telescope:

\[
\boxed{
E_G=\sum_{v\in\operatorname{internal}(G)}\rho_v.
}
\]

Consequently,

\[
|E_G|\le\sum_v|\rho_v|.
\]

The signed sum gives actual error; the sum of magnitudes discards cancellation. These are different observations.

Changing the tree changes partial sums and therefore the residuals. A residual is not an input-specific label independent of order. Recomputing its reference sum in the same low precision may incorrectly produce zero; auditing needs exact arithmetic or a separately justified error-extraction method.

## 4. Development notes: make rounding rules inspectable

The main source is [rewrite/fp32_oracle.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/rewrite/fp32_oracle.py). The three core functions were studied and rewritten. These notes follow current implementation dependencies, not a reconstruction of historical commit or debugging order.

### 4.1 Simulating FP32

The oracle accepts stored nonnegative FP32 leaves and an explicit addition tree. It returns node values and rounding residuals. It neither quantizes inputs nor reruns exp.

Internally, `Fraction` stores leaves, nodes, and residuals exactly. Fraction provides exact bookkeeping; `round_to_fp32` imposes FP32 rounding. Adding all leaves as Fractions and rounding only at the root would compute the correctly rounded target, not the actual tree.

For example:

~~~python
from fractions import Fraction

u = Fraction(1, 2**24)
values = (Fraction(1), u, u)
~~~

All three values are exactly representable in FP32. For existing NumPy FP32 input, exact promotion to Python float followed by `Fraction.from_float` preserves the stored value. Reconstructing from pre-quantization decimal text would change the reference input.

### 4.2 round_to_fp32: return an exact value to the FP32 grid

This function accepts a nonnegative rational and returns the rounded value, still as a Fraction. It does not call hardware floating-point addition or construct a NumPy FP32 object.

It rejects negative values and handles zero separately. For a positive value it needs

\[
e=\lfloor\log_2(\mathrm{value})\rfloor.
\]

Instead of floating-point log2, it estimates the exponent from numerator and denominator bit lengths and corrects it using an exact comparison:

~~~python
e = value.numerator.bit_length() - value.denominator.bit_length()

def pow2(k: int) -> Fraction:
    return Fraction(1 << k, 1) if k >= 0 else Fraction(1, 1 << -k)

if value < pow2(e):
    e -= 1
~~~

The estimate is at most one exponent too high, so one correction suffices. The helper also uses only integer and rational arithmetic.

Next choose the grid spacing:

~~~python
if e < -126:
    quantum = pow2(-149)
else:
    quantum = pow2(e - 23)
~~~

Normal spacing changes with magnitude; subnormal spacing remains $2^{-149}$. Convert the value into a grid coordinate, round that coordinate to the nearest integer, and restore the scale:

~~~python
s = value / quantum
s_rounded = round(s)
result = Fraction(s_rounded) * quantum
~~~

Here `s` is an internal grid coordinate. The [Fraction documentation](https://docs.python.org/3/library/fractions.html#fractions.Fraction.__round__) specifies nearest-integer rounding with ties to even when no second argument is supplied. The midpoint decision is exact on a Fraction, not on a float conversion.

For $1+u$, the spacing is $2u$ and the coordinate is $2^{23}+1/2$. The lower coordinate is even, so the result is $1$. A carry in the rounded coordinate naturally enters the next binade; crossing a binade is not itself overflow. Finally:

~~~python
if result > MAX_FINITE:
    raise OverflowError("Rounded result exceeds maximum finite FP32 value.")
~~~

The check applies to the rounded result. Overflow raises an exception; the module does not model infinity results, exception flags, or other rounding modes.

### 4.3 is_stored_fp32: guard the input boundary

The rounding function accepts arbitrary nonnegative rationals, but reduction leaves must already be FP32. The guard separates these contracts:

~~~python
if value < 0:
    return False
try:
    return round_to_fp32(value) == value
except OverflowError:
    return False
~~~

If rounding changes a value, it is not a stored FP32 value. Thus $1/3$ is rejected while $u=2^{-24}$ is accepted. The guard does not silently quantize $1/3$ before inserting it into the tree, preserving the reference input.

Fraction input is assumed. Type annotations are not comprehensive runtime validation for arbitrary Python objects, NaNs, or infinities.

### 4.4 Tree: represent parentheses as data

`Tree` has a leaf count and pairs of child indices. Leaves begin at $0$; internal node $k$ has index `leaf_count + k`.

For three leaves the internal indices are $3$ and $4$:

~~~python
from rewrite.fp32_oracle import Tree

head_first = Tree(leaf_count=3, nodes=((0, 1), (3, 2)))
tail_first = Tree(leaf_count=3, nodes=((1, 2), (0, 3)))
~~~

The first tree adds leaves 0 and 1 into node 3, then adds node 3 to leaf 2 into node 4, rounding at both steps. The second first combines leaves 1 and 2, then adds their rounded output to leaf 0. Only dependencies change.

Nodes are evaluated in list order and may refer only to leaves or earlier nodes. The last internal node is the root. A single-leaf tree has no internal addition and its leaf is the root.

Boundary: the rewritten `Tree` is a data container, not a complete structural validator. This article assumes every non-root node is used exactly once, without omitted or duplicated leaves. Otherwise the residual identity does not apply directly. The older [BinaryReductionGraph](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/summation_graph_predictor.py) has structural validation; those guarantees do not automatically transfer to the rewrite.

### 4.5 reduce_tree: three operations per node

After checking leaf count and representability, `reduce_tree` evaluates the node list. A child index below the leaf count selects an input; other indices select previously computed node values.

The core is

~~~python
exact_sum = left_value + right_value
rounded_sum = round_to_fp32(exact_sum)
delta = rounded_sum - exact_sum

node_values.append(rounded_sum)
deltas.append(delta)
~~~

Distinguish:

- `exact_sum`: the exact sum of the actual child outputs, not of every leaf below this node.
- `rounded_sum`: this node's FP32 value, passed to its parent.
- `delta`: computed minus this local exact sum, corresponding to $\rho_v$.

Passing `exact_sum` upward would skip required rounding. Reversing the subtraction would change the sign convention.

After all nodes, the code separately sums original leaves exactly and subtracts that reference from the root. A single leaf returns its own value with zero total error.

### 4.6 Trace: results and their explanation

`Trace` retains:

| Field | Observation |
| --- | --- |
| `values` | Actual leaf inputs |
| `node_values` | Rounded internal outputs |
| `deltas` | Newly introduced signed residuals |
| `exact_sum` | Exact leaf sum $L_q$ |
| `error` | Root output minus $L_q$ |

Run this example from Error Atlas's `topics/softmax/experiments` directory:

~~~python
from fractions import Fraction
from rewrite.fp32_oracle import Tree, reduce_tree, round_to_fp32

u = Fraction(1, 2**24)
values = (Fraction(1), u, u)
trees = {
    "head-first": Tree(3, ((0, 1), (3, 2))),
    "tail-first": Tree(3, ((1, 2), (0, 3))),
}

for name, tree in trees.items():
    trace = reduce_tree(values, tree)
    root = trace.node_values[-1]  # Both trees in this example have internal nodes
    target = round_to_fp32(trace.exact_sum)
    assert trace.error == sum(trace.deltas, Fraction(0))
    print(name, trace.node_values, trace.deltas, trace.error, root == target)
~~~

Its output is:

| Path | Node outputs | Residuals | Total error | Correctly rounded target reached |
| --- | --- | --- | --- | --- |
| head-first | $(1,1)$ | $(-u,-u)$ | $-2u$ | No |
| tail-first | $(2u,1+2u)$ | $(0,0)$ | $0$ | Yes |

This is the complete code path for §2. The residual-sum assertion belongs to the example and tests, not `reduce_tree` itself. Relative error and the correct-rounding flag are also computed by callers, not stored separately in Trace. All-zero leaves are accepted by the oracle, but then $E_G/L_q$ is undefined and outside this article's nonzero-denominator setting.

### 4.7 Validation

Keep three checks separate.

First, internal identities: `trace.error == sum(trace.deltas)` detects inconsistent bookkeeping, but cannot independently prove correct rounding. An incorrect rounding rule may preserve the same telescoping structure.

Second, implementation comparison: [rewrite tests](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_rewrite_fp32_oracle.py) include selected rounding boundaries and compare the rewrite with the older oracle node by node. A separate [hardware differential test](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_oracle_hardware_differential.py) compares the older oracle against NumPy FP32 additions on the same tree. These are distinct comparisons; the rewrite tests do not directly perform all hardware validation.

Third, output accuracy: compare the root with $Q_{32}(L_q)$. A simulator can accurately reproduce a non-correctly-rounded result, passing the second check while failing the third, as in the head-first example.

Differential results apply within shared contracts. The older oracle rejects exact pre-rounding values above maximum finite FP32; the rewrite checks the rounded result. Their overflow-edge contracts differ, so sample agreement does not establish equivalence over all rational inputs.

## 5. Bounds without per-node traces

The residual identity measures a particular tree. Without its residuals, use a conditional worst-case depth bound.

Assume the standard single-addition model

\[
\operatorname{fl}(a+b)=(a+b)(1+\theta),
\qquad |\theta|\le u.
\]

For same-format nonnegative inputs, gradual underflow, and no overflow, a sum in the subnormal range lies on the FP32 subnormal grid and is exactly representable. This observation does not extend to FTZ.

An early term in sequential summation passes through at most $n-1$ additions. Define

\[
\gamma_d=\frac{du}{1-du},\qquad du\lt1.
\]

With at most $d$ rounding factors on each input-to-root path,

\[
\hat L_G=\sum_i\hat q_i(1+\xi_i),
\qquad |\xi_i|\le\gamma_d.
\]

Nonnegative inputs give $\sum_i|\hat q_i|=L_q$, so

\[
|E_G|\le\gamma_d L_q,\qquad
|\eta_G|\le\gamma_d.
\]

Use $d=n-1$ for sequential summation or the maximum leaf-to-root depth for a binary tree. A balanced tree reduces it to $\lceil\log_2n\rceil$. This is the classical path-factor analysis; see [Higham, The Accuracy of Floating Point Summation](https://nhigham.com/wp-content/uploads/2023/10/high93s.pdf).

For $n=1024$:

| Path | Maximum depth $d$ | Worst-case relative bound |
| --- | ---: | --- |
| Sequential FP32 | $1023$ | $\gamma_{1023}\approx6.10\times10^{-5}$ |
| Balanced binary FP32 | $10$ | $\gamma_{10}\approx5.96\times10^{-7}$ |

Both perform 1023 additions. The improvement concerns rounding depth per input, not the total number of additions.

A bound is not an input-by-input ranking. A shallower tree need not always be more accurate or correctly rounded. A nonzero bound also does not imply nonzero actual error: summing 1024 ones has exactly representable integer partial sums.

## 6. How denominator error changes probabilities

Keep $\hat q$ fixed and temporarily divide exactly:

\[
p_i^{(e)}=\frac{\hat q_i}{L_q},
\qquad
p_i^{(r)}=\frac{\hat q_i}{\hat L_G}.
\]

The first output includes fixed upstream errors; the second adds reduction error. Since $\hat L_G=L_q(1+\eta_G)$,

\[
p_i^{(r)}=\frac{p_i^{(e)}}{1+\eta_G}.
\]

For $\hat L_G>0$,

\[
p_i^{(r)}-p_i^{(e)}
=-p_i^{(e)}\frac{\eta_G}{1+\eta_G},
\]

and

\[
\sum_i p_i^{(r)}=\frac{1}{1+\eta_G}.
\]

An overestimated denominator shrinks every nonzero component; an underestimated denominator enlarges them. These are exact relations. Relative change is approximately $-\eta_G$ only for small $|\eta_G|$.

Unlike a common exp factor that enters both numerator and denominator and cancels, newly introduced reduction error affects only the denominator.

In the head-first $(1,u,u)$ path, $\hat L_G=1$. Exact division therefore produces components whose sum is $1+2u$, already exposing the denominator error without division rounding.

A further FP32 reduction used to check the probability sum may round away this discrepancy. “The program reports a sum of 1” cannot replace independent comparison with $L_q$.

## 7. Summary

- Each addition rounds the exact sum of its actual operands.
- Signed residuals sum to actual error; $\gamma_d$ gives a conditional depth-based worst-case bound.
- Reduction error affects only the shared denominator and thus jointly scales nonzero outputs.

Nonzero error and failure to round correctly are different. Even if $\hat L_G=L_q^\star$, the error $\hat L_G-L_q$ is nonzero when the exact sum is unrepresentable. Audit both quantities separately.

The [summation-stagnation experiment](/en/notes/systems/error-analysis/softmax/summation-stagnation/) amplifies the minimal example and compares pairwise, Kahan, and wider accumulators. Error Atlas's [reduction-tree notes](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md) develop per-node residuals into exact analysis on explicit graphs.

The identity here covers pure binary addition trees using each leaf once, not online rescaling multiplications, compensated algorithms, or arbitrary GPU instruction graphs. A fixed tree helps reproducibility, not necessarily accuracy.

Next, [normalization and division](/en/notes/systems/error-analysis/softmax/#division) fixes both actual numerators and denominator to isolate division, reciprocal multiplication, and output conversion.

Back to the map: [Reduction](/en/notes/systems/error-analysis/softmax/#reduction) · [Division](/en/notes/systems/error-analysis/softmax/#division)
