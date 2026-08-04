---
date: '2026-06-22T08:00:00+09:00'
draft: false
title: 'Systems / IO-Aware Attention Part 3: Reproducing and Verifying Online Softmax and Tiled Attention'
summary: "The first two notes read FlashAttention v1 and the original online softmax derivation; this one builds it. I implement naive and tiled+online-softmax attention in numpy, then pin down tiled==naive with an invariant suite. The focus is not the algorithm (covered in the first two notes) but the verification design — block-size invariance is the strongest invariant — plus two numerical insights: error is a precision floor, not an accumulation, and the rebase recurrence has gain≈1. It closes by drawing the boundary: this is only mathematical correctness; hardware performance and low-precision behavior are not yet verified."
description: "A hands-on companion to the IO-aware attention notes: implementing naive and tiled+online-softmax attention in numpy and verifying tiled==naive via an invariant suite. Focuses on verification design (block-size invariance as the strongest invariant) and two numerical insights — error is a precision floor not an accumulation, and the rebase recurrence has gain≈1 — then draws the boundary between mathematical exactness and unverified hardware performance."
tags: ["Systems", "AI Infra", "Attention", "Softmax"]
categories: ["Notes"]
series: ["IO-Aware Attention"]
note_kind: "topic"
aliases:
---

> **Topic dossier:** [IO-Aware Attention](/en/notes/topics/io-aware-attention/)

# Systems / IO-Aware Attention Part 3: Reproducing and Verifying Online Softmax and Tiled Attention

[Part 1](/en/notes/systems/ai-infra/note-systems-io-attn-1-flashattention/) dissects FlashAttention v1; [Part 2](/en/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/) traces back to the original online softmax derivation. This note **builds it and proves it correct**. Concretely: implement two versions of attention in numpy, confirm "tiled==naive" with an invariant suite, and see what running it on real floating point teaches us.

---

# 1. Goals and Division of Labor

Four goals:

1. Write naive attention (standard `softmax(QKᵀ)V`) as the baseline for later experiments
2. Write tiled attention + online softmax, accumulating online block by block
3. Verify tiled == naive **bit-for-bit** (~1e-15 under float64)
4. Produce an error-comparison figure + a rigorous statement of the rebase factor

---

# 2. Three Parts Mapped to Code

## 2.1 naive: the gold standard

The most direct version, corresponding to Algorithm 0 in Part 1: materialize the entire `N×N` intermediate matrix.

```python
def safe_softmax(scores):
    m = np.max(scores, axis=-1, keepdims=True)
    e = np.exp(scores - m)
    return e / np.sum(e, axis=-1, keepdims=True)

def naive_attention(Q, K, V):
    scores = Q @ K.T          # (N, N) —— this is the big matrix FA avoids
    P = safe_softmax(scores)
    return P @ V
```

It is slow and memory-hungry, but it is **correct**. Every tiled result is checked against it.

A small trap: `keepdims=True` cannot be dropped. `np.max(scores, axis=-1)` returns `(N,)`, and broadcasting it against `(N, N)` makes numpy align it to the last axis instead of the row axis — no error, but wrong everywhere. `keepdims=True` gives `(N, 1)`, which broadcasts per row.

## 2.2 online: the 1D (m, ℓ) recurrence

Algorithm 3 from Part 2, extracted on its own:

```python
m = -np.inf
ell = 0.0
for xi in x:
    m_new = max(m, xi)
    ell = ell * np.exp(m - m_new) + np.exp(xi - m_new)
    m = m_new
return m, ell
```

The two initial values are the identity elements of the (max, +) reductions: `m = -inf` is the identity of max (the maximum over an empty set), guaranteeing $\max(-\infty, x_1) = x_1$ so `m` tracks the running max exactly from the first element; `ell = 0` is the identity of addition. Paired, the first step $0 \cdot e^{-\infty} + e^0 = 1$ is clean and produces no NaN.

Mind the order: **compute `m_new` first, use it to rebase the old `ell`, and overwrite `m` last**.

## 2.3 tiled: adding the O accumulator

Lift `(m, ℓ)` to `(m, ℓ, O)`. Start with the single-query-row version to map the recurrence cleanly:

```python
m = -np.inf
ell = 0.0
O = np.zeros_like(q)
for i in range(0, K.shape[0], block_size):
    K_block = K[i:i + block_size]
    V_block = V[i:i + block_size]
    S = q @ K_block.T
    m_tilde = np.max(S)
    P = np.exp(S - m_tilde)        # kept unnormalized
    l_tilde = np.sum(P)
    m_new = max(m, m_tilde)
    ell = ell * np.exp(m - m_new) + l_tilde * np.exp(m_tilde - m_new)
    O   = O   * np.exp(m - m_new) + np.exp(m_tilde - m_new) * (P @ V_block)
    m = m_new
O = O / ell
```

The `O` line and the `ell` line have **exactly the same structure**, because they are the same weighted sum: $\ell = \sum_j e^{x_j-m}$ and $O = \sum_j e^{x_j-m}\,V_j$ — one without $V$, one with $V$ ($\ell$ is just $O$ at $V\equiv 1$). When the baseline changes they naturally rescale with the **same pair** of rebase factors.

Two things to get right:

- **Keep `P` unnormalized** (do not divide by `l_tilde` inside the block). All normalization is handed to $\ell$ and divided **once at the end**. Dividing early double-normalizes, breaks the math, and the block-size invariance test will fail.
- **Divide by $\ell$ only once, at the end.** Dividing per block is an equivalent alternative (line 12 of FA1's Algorithm 1 in Part 1, with $\operatorname{diag}(\ell_\text{new})^{-1}$), but does more divisions and adds one more amplification source. The end-divide form (FA2 style) is cleaner.

Lifting to the full Q-block version just turns the scalars $m, \ell$ into per-row vectors and $O$ into a matrix; the logic is unchanged — except the `keepdims` trap from 2.1 returns, this time lifting `(N,)` `m_tilde` to `(N, 1)` via `[:, None]` to align with the `(N, b)` `S`.

---

# 3. Verification Design

## 3.1 Block-size invariance (the one I care about most)

For one fixed `Q, K, V`, run `block_size ∈ {1, 2, 3, 5, 7, 11, N}` and require **pairwise-equal results**.

```python
ref = tiled_attention(Q, K, V, block_size=N)   # single block == no tiling
for bs in (1, 2, 3, 5, 7, 11):
    assert np.allclose(tiled_attention(Q, K, V, bs), ref, atol=1e-13)
```

This is more fundamental than "tiled==naive". It directly tests **partition-independence** — the result does not move no matter how you tile. And partition-independence is exactly the empirical evidence that FA is *exact* attention rather than an approximation: if tiling were an approximation (like Linformer/Performer), more blocks would mean more error; the fact that it does not move shows tiling only reorders the computation, leaving the math untouched.

## 3.2 Component invariants

Beyond the final `O`, assert the intermediate quantities separately:

- `m_final` == the global rowmax
- `ell_final` == the true denominator $\sum_j e^{x_j - m_\text{final}}$

These two verify independently that `(m, ℓ)` does converge to the correct end-state values, instead of hoping "if O is right, those two are probably right too".

## 3.3 Numerical stability stress

Scale up the logits (`scale=30`) and watch the unsafe naive (no max-subtract) overflow straight to `inf` via `exp`, while the online/tiled path stays finite and correct. This echoes the fp32 safety window (≈88) from Part 2 §6.

---

# 4. Two Numerical Insights

The first two notes cover the algorithm; here is **what running it on real floating point reveals**.

## 4.1 Error is a precision floor, not an accumulation

tiled and naive are bit-for-bit equal under **exact arithmetic** (that is what block-size invariance proves), so in theory the error is **0**. But in practice it is not — because **floating-point addition is not associative**: naive subtracts the global max and adds the whole row at once, while tiled adds block by block with rebases. **Same sum, different addition order**, so the last bits drift.

The drift scale equals the dtype's machine epsilon ε:

| dtype | mantissa bits | ε | error floor |
|---|---|---|---|
| float64 | 52 | ≈ 2.2e-16 | ~1e-15 |
| float32 | 23 | ≈ 1.2e-7 | ~1e-6 |

ε is set by the **mantissa bits** and the overflow window by the **exponent bits** — both come from the IEEE 754 bit layout. For the full breakdown, see the knowledge-map node [Floating Point and Mixed Precision](https://r1skers.github.io/r1skers-knowledge-map/?map=ai-infra&node=%E6%B5%AE%E7%82%B9%E4%B8%8E%E6%B7%B7%E5%90%88%E7%B2%BE%E5%BA%A6).

Plotting the error against block_size:

![Error vs block_size: fp64 and fp32 lines are both flat, pinned at ~1e-15 and ~1e-6](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/error_vs_blocksize.png)

What matters is not the gap between the two lines (that is just fp32 having ~9 fewer decimal digits than fp64), but that **both lines are flat** — error does not grow with block_size. That is the evidence of exactness: more blocks still add the same sum, only in a different order, and the rounding error is capped by ε rather than diverging. If it accumulated, the line would climb.

So the figure also says: **error = precision floor (set by dtype), not approximation error (set by the number of blocks).** This is also why the tests use `atol=1e-13` rather than `==` — mathematically equal, but not bitwise identical.

## 4.2 Gain ≈ 1: subtracting the running max locks three properties

Error does not "accumulate" — not because the algorithm **shrinks** it (nothing can go below ε), but because the algorithm does not **amplify** it.

An analogy: hardware rounding is a **fixed noise floor** (ε). An ill-conditioned algorithm acts like an amplifier with gain ≫ 1 that blows the floor noise into large error; a well-conditioned algorithm has gain ≈ 1 and passes it through untouched, so the error stays on the floor.

Mapping this back onto the recurrence, you find that "subtracting the running max" — **one single action** — locks three non-amplifying properties at once:

$$ m_\text{new} = \max(m, \tilde m) \;\Longrightarrow\; \text{all exponents} \le 0 \;\Longrightarrow\; \text{all } e^{(\cdot)} \in (0, 1] $$

From this:

- **rebase factor $e^{m-m_\text{new}} \le 1$** —— shrinks only, never amplifies (property: no amplification)
- **$\tilde P = e^{S-\tilde m} \le 1$ and all positive** —— no subtraction of large nearly-equal numbers when forming weights, no catastrophic cancellation
- **$\ell \ge 1$** (the global-max term contributes a floor of $e^0 = 1$) —— the final $O/\ell$ never divides by a tiny number and blows up

The sign of the exponent is decided here too: it is $m_\text{old} - m_\text{new}$ (≤ 0, shrink) and not the reverse (≥ 0, amplify) —— **the sign is the gain direction**; flip it and "shrink" becomes "amplify".

Seen in reverse it is even clearer; the two "do-not-write-it-this-way" warnings in 2.3 correspond to:

- **Dropping the max-subtract** (raw `exp(S)`): exponents can exceed 0, `exp` overflows, gain blows up.
- **Dividing by `l_tilde` early inside the block**: equivalent to dividing by a **local, possibly tiny** $\tilde\ell$ before the denominator is fully assembled, breaking the "denominator ≥ 1" property.

So the order "subtract the running max + divide by the global ℓ only at the end" is itself the design that pins the gain at 1 — **the formula and numerical stability are two sides of the same thing**, not two separate things to memorize.

---

# 5. The Boundary: Mathematical Correctness ≠ Hardware Verification

There is an easy place to fool yourself here. Two axes: **correctness** and **performance**.

**Already verified:**

- **Algorithm-level correctness**: tiled == naive in exact arithmetic, nailed by the invariant suite + block-size invariance.
- **The real fp32/64 rounding floor**: numpy is also real IEEE-754 on a real FPU, so the 1e-15 / 1e-6 is genuine machine rounding error, not a simulation.

**Not yet verified:**

1. **Performance gains.** numpy abstracts the memory hierarchy away entirely — you cannot see whether SRAM/cache actually fits, whether data movement actually drops, whether wall-clock actually improves. The "tile → fit in fast memory → speed up" payoff is **completely unverified** in numpy.
2. **The numerical behavior of a real low-precision fused kernel.** This uses fp32/fp64. A real attention kernel runs on fp16/bf16 + an fp32 accumulator, plus a hardware-approximated `exp` and a specific FMA rounding order — all behaviors the numpy version cannot see.

In other words, what is proven here is **algebraic exactness**, not performance. Its value is as a **judge**: when I later write a C / SIMD version, I check "did I optimize it correctly?" against it, the same role as naive.

The two holes left unfilled above — real memory, real low precision — are **Part 4** (planned): a C inner loop touching memory movement for the first time, and AVX2 to measure real bandwidth.

---

# 6. Summary

- **tiling** handles "fitting" (slicing `N×N` into narrow strips that fit in fast memory)
- **online softmax** handles "still correct after slicing" (rebase stitches local statistics back into the exact global result)
- **error is a floor, not an accumulation** (algorithm gain ≈ 1, rounding is not amplified)

Correctness is verified; performance verification waits for the hardware phase.

## Concept checklist

- naive attention = textbook Algorithm 0, materializes the entire N×N, serves as the gold standard
- online softmax's (m, ℓ) recurrence: the update order is compute m_new → rebase old ℓ → overwrite m
- `m = -inf` / `ell = 0` are the identity elements of the (max, +) reductions; paired, they keep the first step NaN-free
- the only new thing in tiled is the O accumulator; O and ℓ share the same pair of rebase factors (ℓ is O at V≡1)
- P̃ stays unnormalized; normalization (divide by ℓ) happens only once, at the end
- **Block-size invariance** is the strongest invariant: partition-independence ⟹ exact, not approximate
- error is a **precision floor** (set by the dtype's ε, fp64~1e-15 / fp32~1e-6), not approximation error (set by the number of blocks)
- floating-point error does not "accumulate" because the algorithm has **gain≈1**: subtracting the running max ⟹ factors≤1, P̃≤1, ℓ≥1 all hold at once
- boundary: mathematical correctness + real rounding floor are proven; performance gains and low-precision fused-kernel behavior are not
- the numpy version is the gold standard for a future C/SIMD version
