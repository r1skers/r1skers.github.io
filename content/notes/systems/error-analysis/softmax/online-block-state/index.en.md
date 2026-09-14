---
date: '2026-09-13T00:00:00+09:00'
draft: false
title: 'Online Softmax Block State: Carrying (m, ℓ) Forward'
summary: "Derive block merging and online recurrence from local maxima and normalizers, then follow BlockFamily, Schedule, and MergeDump in Error Atlas."
description: "Local state, scale conversion, information limits, and real versus FP32 merging, with runnable rescaling and summation-order examples."
author: "r1skers"
tags: ["Error Analysis", "Softmax", "Floating Point", "Online Softmax"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 8
math: true
ShowToc: true
softmaxArticle: true
---

[← Back to the computation map · Block state](/en/notes/systems/error-analysis/softmax/#block-state)

> Drafted with agent assistance and technically reviewed against Error Atlas. Development notes follow existing source dependencies; they do not fill in unwritten explain-backs or present CPU arithmetic as GPU measurements. This article covers normalizer state only; see [downstream use](/en/notes/systems/error-analysis/softmax/downstream-output/) for output extensions.

## 1. How do we retain a sum before knowing the final maximum?

Ordinary stable evaluation first finds the global maximum $M$, then forms

\[
\begin{aligned}
\ell&=\sum_i\exp(x_i-M),\\
p_i&=\frac{\exp(x_i-M)}{\ell}.
\end{aligned}
\]

When reading blocks incrementally, later data may introduce a larger maximum. Previously accumulated exponential mass cannot simply be added at its old scale.

Retain two quantities: the maximum defining the sum's scale, and the exponential sum at that scale.

Assume nonempty blocks with finite real logits. Define the exact state of block $B$:

\[
\begin{aligned}
S_B&=(m_B,\ell_B),\\
m_B&=\max_{i\in B}x_i,\\
\ell_B&=\sum_{i\in B}\exp(x_i-m_B).
\end{aligned}
\]

The maximum $m_B$ provides scale information. The quantity $\ell_B$ is unnormalized mass at that scale, not a sum of probabilities. In real arithmetic,

\[
1\le\ell_B\le\lvert B\rvert.
\]

Every term is at most 1 and at least one term equals 1. This real bound is not automatically an error guarantee for arbitrary floating-point implementations.

### 1.1 Why not store only ℓ?

Single-element blocks $(0)$ and $(10)$ both have local exponential sum 1, yet their contributions in a common global scale differ. Retaining only $\ell_B$ loses the reference scale needed to compare them.

Formally,

\[
\sum_{i\in B}\exp(x_i)=\exp(m_B)\ell_B.
\]

This explains the state; the program need not actually evaluate the potentially overflowing $\exp(m_B)$.

## 2. Merge two blocks: align scales, then add

Let $A$ and $B$ be disjoint nonempty blocks with known states. Their merged maximum is

\[
m=\max(m_A,m_B).
\]

Express A's mass in the new scale:

\[
\begin{aligned}
&\sum_{i\in A}e^{x_i-m}\\
&=\sum_{i\in A}e^{x_i-m_A}e^{m_A-m}\\
&=\ell_A e^{m_A-m}.
\end{aligned}
\]

The same calculation applies to B, giving

\[
\boxed{
\begin{aligned}
S_A\oplus S_B&=(m,\ell),\\
\ell&=\ell_A e^{m_A-m}\\
&\quad+\ell_B e^{m_B-m}.
\end{aligned}
}
\]

Both rescaling factors lie in $(0,1]$, and at least one equals 1. If B supplies the new maximum, its scale is unchanged while A's old mass shrinks into the new reference scale. Earlier logits themselves are not modified.

### 2.1 A hand-checkable example

Let $A=(0,0)$ and $B=(1,1,1)$. Their states are

\[
S_A=(0,2),\qquad S_B=(1,3).
\]

Merging gives

\[
S_{A\cup B}=(1,\;2e^{-1}+3).
\]

Under the global maximum 1, the first two exponentials are $e^{-1}$ and the last three are 1, agreeing with the merged state.

Adding the local masses 2 and 3 directly would incorrectly give 5. That is a scale mismatch, not a summation-precision problem.

## 3. Online recurrence merges one new block at a time

A new single element $x$ has state $(x,1)$. Merging it with the old state yields

\[
\begin{aligned}
m'&=\max(m,x),\\
\ell'&=\ell e^{m-m'}+e^{x-m'}.
\end{aligned}
\]

The first term rescales old mass and the second adds the new element. The right side must use the old $m,\ell$; overwriting m before forming the rescaling factor is incorrect.

The sequential recurrence and parallel merge have established provenance: [Milakov and Gimelshein, Online normalizer calculation for softmax, §3–3.1](https://arxiv.org/html/1805.02867v2#S3). This article maps the algorithm to Error Atlas's numerical experiments, not to a claim of a new algorithm.

### 3.1 Two numbers do not immediately recover all probabilities

The final $(M,\ell)$ suffices for the normalizer but does not retain individual $x_i$. Producing every $p_i$ still requires revisiting or retaining inputs, or retaining sufficient intermediate information.

A weighted-output consumer can additionally maintain numerator $O$ and finish with $O/\ell$. That is the $(m,\ell,O)$ extension, not a two-number normalizer.

### 3.2 Initialization and empty blocks need explicit handling

Initialize a nonempty sequence from $(x_1,1)$ or its first nonempty block, avoiding infinities in the numerical implementation.

Some formulas represent the empty state by $(-\infty,0)$. Applying the merge formula directly to two such states is invalid because $-\infty-(-\infty)$ is undefined. Implementations must skip empty blocks or provide explicit branches.

The corresponding `BlockFamily` requires at least one block and positive mass in every block. Fraction does not represent infinity. This implementation does not provide general empty-block, fully masked, or NaN handling.

## 4. Development notes: from leaves to an actual merge

### 4.1 BlockFamily: isolate intra-block error first

`BlockFamily` in [online/pilot.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/pilot.py) does not accept an arbitrary raw logit matrix. It describes controlled blocks: block $b$ contains $n_b$ identical FP32 logits $m_b$.

All intra-block shifted logits are zero, so

\[
\ell_b=n_b.
\]

`masses` must contain integers $1\le n_b\le2^{24}$. These counts and the intermediate values formed by successively adding 1 are exactly representable in FP32. `leaf_ell` directly converts counts to Fractions; it does not first run a general block Softmax.

This makes graph comparisons share exact leaves while isolating inter-block merging. For unequal logits inside a block, exp and reduction must be specified explicitly; the element count cannot stand in for $\ell_b$.

### 4.2 Schedule: determine what merges with what

[online/schedules.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/schedules.py) describes connectivity, not arithmetic. For N leaves:

- Leaf indices are $0,\ldots,N-1$.
- Merge k produces node $N+k$.
- `nodes[k]` stores two already-evaluated child indices.

For four blocks, a chain is `((0,1), (4,2), (5,3))`; adjacent pairing is `((0,1), (2,3), (4,5))`. Both root indices are 6, but their paths differ.

`check_schedule` validates leaf count, internal-node count, child-before-parent order, and absence of repeated child use. A single leaf has no internal merge; leaf 0 is the root.

### 4.3 merge_reduce: turn the real formula into FP32 operations

`merge_reduce` in [online/merge.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/merge.py) reads child states in schedule order and performs:

| Step | Code quantity | Meaning |
| --- | --- | --- |
| Choose scale | `m_v = max(m_a, m_b)` | Select among given finite FP32 values |
| Form gap | `fp32_sub(m_a, m_v)` | Round the difference to FP32 |
| Form weight | `exp_impl(delta_a)` | Evaluate the specified exp on the actual gap |
| Merge mass | `fp32_mul`, `fp32_add`, or `fp32_fma` | Produce new mass through the specified path |

The right child also has its own gap and weight. Default `exp_impl` is the CPU `correctly_rounded_exp`, not a measurement of a GPU expf.

The separate path rounds two products and then their sum. The FMA path uses a weight equal to 1 and fuses the other side's multiplication with addition into one rounding. It checks the left weight first, then the right.

We have moved from exact $\ell_v$ to computed $\hat\ell_v$. Default arithmetic is FP32, RN-even, with gradual underflow. Finite inputs can still have extreme differences or intermediate results outside finite FP32 range. This model is not a production kernel covering every exceptional input.

### 4.4 MergeDump: two state variables, more audit data

The normalizer state at one node is $(m,\hat\ell)$. `MergeDump` additionally preserves the whole run for replay and inspection.

Each internal node stores six FP32 values: its maximum, two gaps, two weights, and its mass. Leaves, schedule, and FMA configuration are also retained.

Gaps separate how subtraction was evaluated from what exp returned. Exact residuals and products of path weights are analysis quantities derived later, not dump fields.

`is_well_formed` checks structure and FP32 representability, not arithmetic correctness. Auditing must also recompute maxima, gaps, weights, and merged values. A True return alone is insufficient.

### 4.5 Run the two-block example

Run from Error Atlas's `topics/softmax/experiments` directory:

~~~python
from fractions import Fraction as F
from online.pilot import BlockFamily
from online.schedules import sequential_chain, balanced_pairwise
from online.merge import merge_reduce
from online.fp32_exp import correctly_rounded_exp
from online.fp32_signed import round_to_fp32

family = BlockFamily((F(0), F(1)), (2, 3))
tree = sequential_chain(2)
dump = merge_reduce(family.leaf_max, family.leaf_ell, tree)

assert dump.node_max == (F(1),)
assert dump.gap_left == (F(-1),)
assert dump.gap_right == (F(0),)
w = correctly_rounded_exp(F(-1))
assert dump.weight_left == (w,)
assert dump.weight_right == (F(1),)
expected = round_to_fp32(round_to_fp32(2 * w) + 3)
assert dump.ell_at(tree.root) == expected
~~~

The assertion checks the specified separate arithmetic path, not the real value $2e^{-1}+3$. Passing it does not establish zero exp or normalizer error.

## 5. Real associativity does not make floating-point results tree-independent

For disjoint blocks, exact merging returns the maximum and scaled exponential sum of their union. Changing parentheses therefore leaves the exact final state unchanged. This associativity follows from the state definition, not an experiment.

Floating-point evaluation introduces rounding at every merge. The maximum need not even change for tree-dependent differences to appear.

Continue with the imports above and use four blocks with maximum zero:

~~~python
family = BlockFamily((F(0),) * 4, (2**24, 1, 1, 2))
exact = F(sum(family.masses))
assert exact == 2**24 + 4

for fused in (False, True):
    chain_tree = sequential_chain(4)
    pair_tree = balanced_pairwise(4)
    chain = merge_reduce(family.leaf_max, family.leaf_ell,
                         chain_tree, fused=fused)
    pair = merge_reduce(family.leaf_max, family.leaf_ell,
                        pair_tree, fused=fused)
    assert chain.ell_at(chain_tree.root) == 2**24 + 2
    assert pair.ell_at(pair_tree.root) == exact
~~~

All gaps are zero and all exp weights are 1, reducing merging to ordinary summation. Above $2^{24}$ the adjacent FP32 spacing is 2:

- The chain adds 1 twice. Each addition is a midpoint that rounds back to $2^{24}$, then it adds 2.
- Adjacent pairing first evaluates $2^{24}+1$ and $1+2$, giving $2^{24}$ and 3. Their sum $2^{24}+3$ is another midpoint, this time rounding to $2^{24}+4$ under ties-to-even.

This example establishes possible tree dependence, not universal superiority of balanced evaluation. It also shows why an online chain/tree difference alone cannot establish a new rescaling mechanism: ordinary addition already produces differences.

## 6. Technical audit and next step

The code reference is Error Atlas snapshot `17ffd2a`. The audit checks:

1. Exact states retain their maximum scale, and disjoint blocks are rescaled before addition.
2. $\ell_b=n_b$ is confined to controlled equal-logit blocks, not general block evaluation.
3. Dump structural validity and arithmetic consistency are checked separately; CPU results are not represented as GPU evidence.
4. The two runnable examples check a rescaling path and tree dependence without rescaling, separating model agreement from real exactness.

The 55 tests in [test_online_merge.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_merge.py), [test_online_schedules.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_schedules.py), and [test_online_pilot.py](https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/tests/test_online_pilot.py) passed when this article was drafted. Both examples passed. Additional 90-digit Decimal checks covered 100 input groups, block merging, association, and elementwise recurrence, alongside empty-block rejection, mass limits, single-leaf roots, and structurally valid but arithmetically incorrect dumps. These checks concern a bounded implementation, not GPU performance or correctness over the entire input domain.

Next comes [rescaling and merging](/en/notes/systems/error-analysis/softmax/#merge): freeze computed weights, separate reference values from newly introduced node rounding, and follow errors to the root. Experimental topology comparisons remain for a later article.

The existing [Online Softmax reading note](/en/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/) retains the algorithm and memory-access background. This article serves as the numerical atlas's state entry point.

Back to the map: [Block state](/en/notes/systems/error-analysis/softmax/#block-state) · [Rescale / merge](/en/notes/systems/error-analysis/softmax/#merge)
