---
date: '2026-05-20T11:00:00+09:00'
draft: false
title: 'Systems / IO-Aware Attention Part 2: The Original Online Softmax Derivation'
summary: "Milakov & Gimelshein's 2018 NVIDIA tech report starts from the memory-bound bottleneck of large-vocabulary softmax and compares three implementations: naive softmax is two-pass but unsafe, safe softmax adds one pass to avoid overflow, and online softmax merges max and normalizer calculation back into one scan. This is the direct source of FlashAttention v1's rebase trick."
description: "A study note on Milakov & Gimelshein 2018 (arXiv 1805.02867). It compares naive, safe, and online softmax, derives the online normalizer recurrence, explains why it is mathematically equivalent to safe softmax, and follows the paper's fused softmax + top-K extension."
tags: ["Online Softmax", "Softmax", "Memory Bandwidth", "Numerical Stability", "Top-K", "NMT", "AI Infra", "IO-aware"]
categories: ["Crucible"]
aliases:
  - /notes/note-systems-io-attn-2-online-softmax/
---

# Systems / IO-Aware Attention Part 2: The Original Online Softmax Derivation

In the [previous note](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/), I called the blockwise softmax update in FlashAttention v1 a **rebase trick**. This note traces that trick back to its source: Milakov and Gimelshein's 2018 NVIDIA tech report:

[Online normalizer calculation for softmax (Milakov & Gimelshein, 2018)](https://arxiv.org/abs/1805.02867)

The paper is short, only eight pages, and the target is direct: **reduce global memory accesses in softmax**. The original setting is not attention. It is the output-layer softmax in NMT / large-vocabulary language models. Vocabulary size $V$ can be $10\text{K}$ to $100\text{K}$, every decode step needs a full vocabulary softmax, and the next stage often needs top-K. The compute is not heavy, but the data movement is.

My compressed reading of the paper is:

> Merge the two scans in safe softmax, "find max" and "compute normalizer", into one online normalizer scan.

---

# Abstract

- **Problem**: Naive softmax scans data twice, but $e^{x_i}$ can overflow. Safe softmax uses max-subtract to fix numerical stability, but needs three scans. For large-vocabulary softmax, that extra global-memory pass becomes a real bottleneck.
- **Method**: Maintain two quantities online: running max $m_i$ and running normalizer $d_i$. Whenever a new element changes the max, rescale the old normalizer to the new baseline using $e^{m_\text{old}-m_\text{new}}$.
- **Result**: Full softmax still needs a second pass to write outputs, but the normalizer calculation goes from two scans to one. Safe softmax therefore returns from `3 reads + 1 write` to `2 reads + 1 write`.
- **Extension**: Fuse online softmax with top-K. Since top-K only needs the largest $K$ probabilities, the full length-$V$ probability vector does not need to be written to global memory and read back.
- **Relation to FA1**: FlashAttention generalizes this one-dimensional online normalizer to two-dimensional attention blocks. Algorithm 3's rebase factor is the prototype of the $(m,\ell)$ blockwise update in FlashAttention.

---

# 1. Softmax Is Memory-Bound

For a vector $x \in \mathbb{R}^V$, softmax is:

$$
y_i = \frac{e^{x_i}}{\sum_{j=1}^{V} e^{x_j}}
$$

The arithmetic is not large: each element needs an exponential, an addition or a division. The real issue is repeatedly scanning a length-$V$ vector.

If $V$ is 50K and a batch contains many rows, scanning each row multiple times quickly makes memory bandwidth the bottleneck. The paper frames this clearly from the beginning: **softmax is a memory-bound operation**.

The three algorithms below are really answering one question:

```text
To compute the same softmax, how many times do we read/write global memory?
```

---

# 2. Three Softmax Algorithms

The paper is organized around this comparison:

| Algorithm | Scan structure | Numerically safe | Global memory accesses per element |
|---|---|---|---|
| **Alg 1** naive softmax | normalizer pass + output pass | no | 2 reads + 1 write |
| **Alg 2** safe softmax | max pass + normalizer pass + output pass | yes | 3 reads + 1 write |
| **Alg 3** online normalizer | online normalizer pass + output pass | yes | 2 reads + 1 write |

Alg 3 does not mean the entire softmax takes only one scan. Producing all outputs $y$ still requires a second pass, because the final $m_V$ and $d_V$ are known only after the first pass finishes.

What it actually removes is the extra pass in safe softmax:

```text
safe:
  pass 1: find max
  pass 2: compute denominator
  pass 3: write output

online:
  pass 1: compute max and denominator together
  pass 2: write output
```

## 2.1 Algorithm 1: Naive Softmax

Start directly from the definition:

$$
d_V = \sum_{j=1}^{V} e^{x_j}, \qquad
y_i = \frac{e^{x_i}}{d_V}
$$

Pseudocode:

```text
d = 0
for j = 1..V:
    d = d + exp(x_j)

for i = 1..V:
    y_i = exp(x_i) / d
```

This reads $x$ twice:

- first pass reads $x_j$ and accumulates the normalizer $d$
- second pass reads $x_i$ again and writes $y_i$

So each element does:

```text
read x once
read x again
write y once
```

That is `2 reads + 1 write`.

The problem is that it is unsafe. In fp32, $\exp(x)$ overflows around $x > 88$. If one logit is large enough, $e^{x_i}$ becomes `inf`, and the denominator $d$ is broken.

## 2.2 Algorithm 2: Safe Softmax

The standard fix is max-subtract:

$$
m = \max_j x_j
$$

$$
y_i
= \frac{e^{x_i - m}}{\sum_{j=1}^{V} e^{x_j - m}}
$$

This is mathematically equivalent to naive softmax, because both numerator and denominator are divided by $e^m$:

$$
\begin{aligned}
\frac{e^{x_i}}{\sum_j e^{x_j}}
&=
\frac{e^{x_i}/e^m}{\sum_j e^{x_j}/e^m} \\
&=
\frac{e^{x_i-m}}{\sum_j e^{x_j-m}}
\end{aligned}
$$

The benefit is:

$$
x_i - m \le 0
$$

so:

$$
e^{x_i - m} \le 1
$$

Overflow disappears.

The cost is one extra scan:

```text
m = -inf
for j = 1..V:
    m = max(m, x_j)

d = 0
for j = 1..V:
    d = d + exp(x_j - m)

for i = 1..V:
    y_i = exp(x_i - m) / d
```

Each element now does:

```text
read x for max
read x for denominator
read x for output
write y
```

That is `3 reads + 1 write`.

This is what the paper wants to remove: **the extra global-memory read paid for numerical safety**.

## 2.3 Algorithm 3: Online Normalizer

Alg 3's idea is neat: do not compute the full $m$ first and then compute the full $d$. Instead, scan once while maintaining "the max seen so far" and "the normalizer under the current max baseline".

After processing the first $i$ elements, define:

$$
m_i = \max(x_1, \ldots, x_i)
$$

$$
d_i = \sum_{j=1}^{i} e^{x_j - m_i}
$$

When a new element $x_i$ arrives, update the max first:

$$
m_i = \max(m_{i-1}, x_i)
$$

Then update the normalizer:

$$
d_i = e^{m_{i-1} - m_i} d_{i-1} + e^{x_i - m_i}
$$

This second equation is the heart of the paper.

The old $d_{i-1}$ was computed under the old baseline $m_{i-1}$:

$$
d_{i-1} = \sum_{j=1}^{i-1} e^{x_j - m_{i-1}}
$$

Now the max may become $m_i$. If the baseline changes, the old normalizer must be rebased:

$$
\begin{aligned}
\sum_{j=1}^{i-1} e^{x_j - m_i}
&=
\sum_{j=1}^{i-1} e^{x_j - m_{i-1}} e^{m_{i-1}-m_i} \\
&=
e^{m_{i-1}-m_i} d_{i-1}
\end{aligned}
$$

Then add the new element's contribution under the new baseline:

$$
e^{x_i - m_i}
$$

That gives the recurrence.

Pseudocode:

```text
m = -inf
d = 0
for i = 1..V:
    m_new = max(m, x_i)
    d = d * exp(m - m_new) + exp(x_i - m_new)
    m = m_new

for i = 1..V:
    y_i = exp(x_i - m) / d
```

The first pass obtains the final $m_V$ and $d_V$ together. The second pass writes the output. Numerical safety comes from max-subtract, and memory traffic returns to naive softmax's `2 reads + 1 write`.

---

# 3. Theorem 1: Why It Is Equivalent

Theorem 1 proves that after Alg 3 scans all $V$ elements, the resulting $m_V$ and $d_V$ match the max and normalizer computed by safe softmax.

More directly:

> Online normalizer is not an approximation. It is the same safe-softmax normalizer computed in a different scan order.

An induction proof is enough.

Assume that after $i-1$ elements:

$$
m_{i-1} = \max(x_1,\ldots,x_{i-1})
$$

$$
d_{i-1} = \sum_{j=1}^{i-1} e^{x_j - m_{i-1}}
$$

Now process $x_i$.

**Case A: $x_i \le m_{i-1}$**

The max does not change:

$$
m_i = m_{i-1}
$$

The rebase factor is $1$:

$$
e^{m_{i-1}-m_i} = 1
$$

So:

$$
d_i = d_{i-1} + e^{x_i-m_i}
$$

This simply adds the new element.

**Case B: $x_i > m_{i-1}$**

The new element becomes the new max:

$$
m_i = x_i
$$

The recurrence becomes:

$$
d_i = e^{m_{i-1}-x_i} d_{i-1} + 1
$$

Expand $d_{i-1}$:

$$
\begin{aligned}
e^{m_{i-1}-x_i} d_{i-1}
&=
e^{m_{i-1}-x_i}
\sum_{j=1}^{i-1} e^{x_j-m_{i-1}} \\
&=
\sum_{j=1}^{i-1} e^{x_j-x_i}
\end{aligned}
$$

The new element contributes:

$$
1 = e^{x_i-x_i}
$$

Therefore:

$$
d_i = \sum_{j=1}^{i} e^{x_j-m_i}
$$

The induction holds.

One wording detail matters: in exact arithmetic, the two are mathematically equivalent. In real floating-point implementation, the changed operation order may affect the last few bits. So the stable phrase is **mathematically equivalent**, not strictly bitwise identical.

---

# 4. Experiments: Bandwidth Utilization

The paper benchmarks cuDNN softmax, safe softmax, online softmax, and fused softmax + top-K on P100 / V100 across different batch sizes and vocabulary sizes.

The result matches the memory-bound intuition:

- **Small $V$**: gains are limited. With short vectors, kernel launch, scheduling, and instruction overhead matter more, so removing one data pass may not dominate.
- **Large $V$**: online softmax helps more. The larger $V$ gets, the more global-memory traffic dominates, and the more valuable one less read becomes.

In element-access terms, safe softmax does:

```text
3 reads + 1 write = 4V element accesses
```

Online softmax does:

```text
2 reads + 1 write = 3V element accesses
```

That is roughly one quarter fewer element-level global-memory accesses.

This also explains why the paper reports softmax alone at up to about 1.3x speedup rather than an order-of-magnitude jump. It does not change the softmax math, and it still writes $V$ probabilities. It just removes one clear redundant pass.

---

# 5. Fused Softmax + Top-K

## 5.1 top-K

In NMT beam search or LM sampling, softmax is often followed not by "give me the full probability vector", but by:

```text
give me the K tokens with the largest probabilities
```

A traditional pipeline looks like:

```text
Kernel A: safe softmax
  read logits several times
  write all V probabilities to global memory

Kernel B: top-K
  read all V probabilities from global memory
  write K selected results
```

The full length-$V$ probability vector is written once and read once.

That is wasteful for top-K, because only $K$ results survive.

## 5.2 The Fusion Key

Softmax is monotonic:

$$
x_a > x_b
\quad\Longleftrightarrow\quad
\frac{e^{x_a-m}}{d} > \frac{e^{x_b-m}}{d}
$$

So the top-K probabilities correspond to the top-K logits. We do not need to compute every probability before sorting; we can maintain top-K logits while scanning logits.

The fused structure is:

```text
Pass 1:
  scan logits x
  update online (m, d)
  update a size-K top-K buffer / min-heap over logits

Pass 2:
  normalize only those K selected logits
  write K probabilities and indices
```

Now:

```text
the full V-length probability vector never lands in global memory
```

This is the bigger payoff in the paper. The arXiv abstract reports softmax alone up to 1.3x, while Softmax+TopK combined and fused reaches up to 5x.

## 5.3 Controlling K

Fusion has conditions.

The top-K intermediate state must live in on-chip resources; otherwise, maintaining top-K through global memory would eat the benefit. As K grows, the top-K buffer / heap uses more shared memory or registers, which can reduce occupancy and squeeze the main softmax computation.

The paper's empirical conclusion is:

> When K is small enough, fusion pays off. When K is too large, on-chip resource pressure can outweigh the saved global-memory round trip.

---

# 6. Numerical Stability

## 6.1 Safe Softmax in fp32

The maximum finite fp32 value is roughly:

$$
3.4 \times 10^{38}
$$

Corresponding to:

$$
\log(3.4 \times 10^{38}) \approx 88
$$

So in naive softmax, once $x_i > 88$, $e^{x_i}$ may overflow.

Safe softmax subtracts the max and guarantees:

$$
x_i - m \le 0
$$

Therefore:

$$
e^{x_i-m} \le 1
$$

Overflow disappears.

The underflow side is also easy to interpret: if some $x_i$ is much smaller than the max, then $e^{x_i-m}$ may underflow to 0. But such terms would have contributed almost nothing to the softmax distribution anyway, so this is usually benign.

## 6.2 The Mixed-Precision Reality

The original paper mostly discusses fp32. In the later Transformer / FlashAttention setting, mixed precision also matters.

The maximum finite fp16 value is $65{,}504$, and the exponential safe window is only:

$$
\log(65504) \approx 11
$$

This is much narrower than fp32's 88. In real training and inference implementations, softmax often uses fp32 accumulators or dedicated mixed-precision paths instead of doing everything in raw fp16.

This is why the softmax part of attention kernels receives special care: it is both memory-bound and numerical-sensitive.

## 6.3 Rebase Factor Underflow

The rebase factor in online softmax is:

$$
e^{m_{i-1}-m_i}
$$

Since $m_i \ge m_{i-1}$, the exponent is always non-positive, so it cannot overflow.

It may underflow. For example, if the new max is much larger than the old max:

$$
m_i - m_{i-1} \gg 0
$$

then:

$$
e^{m_{i-1}-m_i}
$$

may become 0.

This is usually benign mathematically: under the new max baseline, the old terms are already tiny. In other words, rebase-factor underflow means "the old probability mass is too small relative to the new max", not that the softmax algorithm has failed.

---

# 7. Relation to FlashAttention

This paper handles one-dimensional vector softmax:

```text
scan x_1, x_2, ..., x_V
maintain m and d
```

FlashAttention handles two-dimensional attention blocks:

```text
scan K/V blocks
maintain row-wise m and l for each Q block
```

The correspondence is almost direct:

| Online softmax | FlashAttention |
|---|---|
| new element $x_i$ | new score block $S_{ij} = Q_i K_j^\top$ |
| running max $m_i$ | row-wise running max $m_i$ |
| running normalizer $d_i$ | row-wise running sum $\ell_i$ |
| rebase $e^{m_\text{old}-m_\text{new}}$ | same rebase factor |
| finally write $y_i$ | update output block $O_i$ along the way |

The difference is that FlashAttention must update not only the denominator, but also the partial output $O = PV$. That makes FA1's formula look more complicated, but the heart is still the online normalizer from this paper.

---

# 8. Wrap-Up

Milakov & Gimelshein solved a small problem with a very clean idea:

> If a reduction's baseline can change, maintain a running state and rebase the old state whenever the baseline changes.

For softmax, the changing baseline is the max; the running state is the normalizer. This turns safe softmax from three scans back into two scans, directly reducing global memory traffic in large-vocabulary settings.

More importantly, it gave FlashAttention a ready-made mathematical component: once row-wise max and normalizer can be maintained online, softmax no longer has to depend on a fully materialized matrix.

## Concept Checklist

- Naive softmax: two scans, but $e^{x_i}$ may overflow
- Safe softmax: subtract max, numerically safe, but needs three scans
- Online normalizer: maintain $m$ and $d$ together in one pass; full softmax returns to two scans
- Rebase factor $e^{m_\text{old}-m_\text{new}}$: rewrites the old normalizer under the new max baseline
- Theorem 1 says online normalizer and safe normalizer are mathematically equivalent, not approximate
- Softmax alone gives limited but stable gains; Softmax + Top-K fusion gives larger gains by avoiding full probability-vector materialization
- Top-K fusion is good for small K; too-large K creates on-chip resource pressure
- fp32 max-subtract mostly solves overflow; mixed precision still needs special care
- FlashAttention generalizes this one-dimensional online softmax into two-dimensional block-wise attention

---

# Personal Notes

{{< details summary="Notes" >}}

![Online Softmax 1](/notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/online-softmax-back.jpg)
![Online Softmax 2](/notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/online-softmax-front.jpg)

{{< /details >}}
