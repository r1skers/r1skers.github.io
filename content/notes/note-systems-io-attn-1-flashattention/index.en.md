---
date: '2026-05-18T20:00:00+09:00'
draft: false
title: 'Systems / IO-Aware Attention Part 1: FlashAttention v1 and Tiling Softmax'
summary: "Starting from the GPU memory hierarchy and arithmetic intensity, this note reframes attention as a memory-bound problem; derives the exact equivalence behind tiling + online softmax's rebase trick; explains recompute in backward; and traces where the $O(N^2 d^2 / M)$ HBM traffic complexity comes from. FA1's ingredients — tiling, online softmax, and recompute — are all old tricks. Its real contribution is redefining the efficiency problem from FLOPs to HBM bandwidth."
description: "A study note on FlashAttention v1 — reframing attention as a memory-bound problem on top of the GPU memory hierarchy, deriving online softmax's rebase trick as mathematically exact, the recompute trade-off for backward, and the $O(N^2 d^2 / M)$ HBM traffic complexity plus its Aggarwal-Vitter lower bound."
tags: ["FlashAttention", "Attention", "Transformer", "GPU", "Memory Hierarchy", "IO-aware", "Online Softmax", "AI Infra"]
categories: ["Crucible"]
---

# Systems / IO-Aware Attention Part 1: FlashAttention v1 and Tiling Softmax

When reading *Attention is All You Need*, attention looks like a clean mathematical formula:

$$
O = \mathrm{softmax}(QK^\top)\, V
$$

At first glance, it is just a couple of matrix multiplications plus a softmax. But once we actually train long-sequence Transformers, attention turns out to be not only slow, but also **extremely memory-hungry** — slightly longer inputs can go straight to OOM.
This note takes that apart.

Paper: [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al., 2022)](https://arxiv.org/abs/2205.14135)

---

# Abstract

- **Problem**: Standard attention is slow and memory-hungry on long sequences. The textbook instinct says the problem is $O(N^2 d)$ FLOPs, which motivates approximate methods such as Linformer / Performer that try to reduce FLOPs. But the measured bottleneck is often not raw compute. It is the IO cost of repeatedly moving the intermediate matrix $P = \mathrm{softmax}(QK^\top)$ through HBM.
- **Solution**: Reframe attention as an **IO-aware** problem and make the $N \times N$ intermediate matrix **never land in HBM**. All intermediate states appear only temporarily in SRAM and are discarded immediately after use.
- **Components**:
  1. **GPU memory hierarchy abstraction** = split "GPU memory" into HBM (large and slow) and SRAM (small and fast), then use arithmetic intensity to distinguish compute-bound and memory-bound operations
  2. **Tiling** = split $Q, K, V$ into blocks small enough to fit in SRAM, so each pair of blocks can be processed on chip
  3. **Online softmax + rebase trick** = maintain two row-wise scalars $(m, \ell)$ across blocks, making "blockwise softmax" mathematically identical to "full-row softmax" rather than approximate
  4. **Recompute** = do **not** store $P$ in the forward pass; recompute $P$ block by block in backward — trading FLOPs for memory, but because backward is also heavily memory-bound, the net effect is wall-clock speedup
- **Bottom line**: FA1 did not invent new algorithmic components. Its main contribution is a **perspective**: rewriting attention from a "compute problem" into a "bandwidth problem". The HBM traffic complexity $\Theta(N^2 d^2 / M)$ reaches the lower bound under the Aggarwal-Vitter I/O model; later work such as FA2 / FA3 / PagedAttention improves constants, parallelism, and KV-cache reuse rather than this asymptotic complexity itself.

---

# 1. Background: GPU Memory Hierarchy

Start with the GPU structure.

## 1.1 The Memory Pyramid

Modern GPUs do not have just one kind of "memory". They have a **multi-level memory pyramid**: the higher levels are faster and smaller.

| Level | Capacity | Bandwidth (A100) | Analogy |
| --- | --- | --- | --- |
| Registers | tens per thread | extremely fast | CPU registers |
| **SRAM** (on chip) | 192 KB / SM | ~19 TB/s | CPU L1/L2 cache |
| **HBM** (off chip) | 40-80 GB | 1.5-2.0 TB/s | what we usually call "GPU memory" |

Two numbers matter:

- SRAM is roughly **10x faster** than HBM
- SRAM is **thousands of times smaller** than HBM

One mental model: HBM is the warehouse, large but far away; SRAM is the desk, small but within arm's reach. FA1's entire goal is: **if something can be finished on the desk, do not keep running back to the warehouse**.

## 1.2 Kernel Execution Model

A unit of GPU computation is a **kernel**. The lifecycle of a typical kernel is:

> Load inputs from HBM -> registers/SRAM -> compute -> write outputs to HBM.

In other words, computation first moves data from HBM to SRAM, computes, then writes results back to HBM. SRAM is temporary workspace, not persistent storage. This movement cost is exactly what FA1 targets.

## 1.3 Compute-Bound vs Memory-Bound

Definition:

$$
\text{Arithmetic Intensity} = \frac{\text{arithmetic operations (FLOPs)}}{\text{memory traffic (bytes)}}
$$

Arithmetic intensity asks: how many operations do we do per byte moved? Operations then fall into two rough categories:

| Type | Meaning | Examples |
| --- | --- | --- |
| **Compute-bound** | lots of compute per byte moved; bottleneck is FLOPs | large matmul, large-channel conv |
| **Memory-bound** | little compute per byte moved; bottleneck is HBM bandwidth | softmax, layernorm, dropout, most elementwise and reduction ops |

> The counterintuitive point: the bottleneck of standard attention is often not total FLOPs, but the HBM traffic caused by materialized $N \times N$ intermediate states.

---

# 2. The Bottleneck in Standard Attention

## 2.1 Standard Attention Implementation (Algorithm 0)

The textbook implementation of attention is:

---

**Algorithm 0** &nbsp; Standard Attention Implementation

**Require**: Matrices $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM.

1. Load $Q, K$ by blocks from HBM, compute $S = QK^\top$, write $S$ to HBM.
2. Read $S$ from HBM, compute $P = \mathrm{softmax}(S)$, write $P$ to HBM.
3. Load $P$ and $V$ by blocks from HBM, compute $O = PV$, write $O$ to HBM.
4. Return $O$.

---

Every step explicitly involves reads or writes to HBM. The two intermediate matrices $S$ and $P$ are both $N \times N$, and each has to travel through HBM. Categorized by bottleneck:

| Step | Operation | Bound type |
| --- | --- | --- |
| 1 | $S = QK^\top$ | compute-bound (matmul) |
| 2 | write $S$ back to HBM | pure data movement |
| 3 | read $S$, compute $P = \mathrm{softmax}(S)$, write $P$ | **memory-bound** |
| 4 | read $P$, read $V$, compute $O = PV$ | compute-bound |

Both $S$ and $P$ are $N \times N$. As sequence length grows, these matrices grow quadratically. At $N = 2048$, each one takes 8 MB in fp16, far beyond 192 KB of SRAM.

## 2.2 The Intermediate Matrix $P$

Step 3 is the source of the memory-bound behavior. Softmax is an elementwise + reduction operation: **very little compute** per element, but **large movement cost** because it reads the entire $N \times N$ matrix from HBM and writes another $N \times N$ matrix back. Add mask, dropout, and other steps, and the same $N \times N$ region can be repeatedly read and written.

**A large part of attention's wall-clock time is spent moving this intermediate matrix around, not doing the $QK^\top$ and $PV$ matmuls themselves.**

## 2.3 Why Naive Kernel Fusion Is Not Enough

The usual way to speed up memory-bound operations is **kernel fusion**: merge consecutive operations into one kernel so inputs are loaded once and intermediate values stay in SRAM.

But attention has a blocker: **training backward needs the matrix $P$**. A forward-only fusion is not enough, because backward still needs softmax probabilities. Without a recompute design, the implementation has no choice but to write $P$ back to HBM.

So the problem becomes precise:

> **Can we avoid writing $P$ to HBM in the forward pass while preserving correct backward computation?**

---

# 3. Algorithm: Tiling + Online Softmax + Recompute

FA1 answers this with three pieces:

1. **Tiling**: split $Q, K, V$ into small blocks so one pair of blocks fits in SRAM
2. **Online softmax**: make softmax computable block by block while remaining exactly equivalent to full-row softmax
3. **Recompute**: do not store $P$ in forward; recompute it in backward

In the paper, these pieces are assembled into Algorithm 1:

{{< details summary="Algorithm 1: FlashAttention (from the paper)" >}}

**Require**: Matrices $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM; on-chip SRAM of size $M$.

1. Set block sizes $B_c = \lceil M/(4d) \rceil$, $B_r = \min(\lceil M/(4d) \rceil, d)$.
2. Initialize $O = (0)_{N \times d} \in \mathbb{R}^{N \times d}$, $\ell = (0)_N \in \mathbb{R}^N$, $m = (-\infty)_N \in \mathbb{R}^N$ in HBM.
3. Divide $Q$ into $T_r = \lceil N/B_r \rceil$ blocks $Q_1, \ldots, Q_{T_r}$ of size $B_r \times d$ each; divide $K, V$ into $T_c = \lceil N/B_c \rceil$ blocks $K_1, \ldots, K_{T_c}$ and $V_1, \ldots, V_{T_c}$ of size $B_c \times d$ each.
4. Divide $O$ into $T_r$ blocks $O_1, \ldots, O_{T_r}$ of size $B_r \times d$ each; divide $\ell$ into $T_r$ blocks $\ell_1, \ldots, \ell_{T_r}$ of size $B_r$ each; divide $m$ into $T_r$ blocks $m_1, \ldots, m_{T_r}$ of size $B_r$ each.
5. **for** $1 \le j \le T_c$ **do** &nbsp; *(outer: K/V blocks)*
6. &emsp;&emsp; Load $K_j, V_j$ from HBM to on-chip SRAM.
7. &emsp;&emsp; **for** $1 \le i \le T_r$ **do** &nbsp; *(inner: Q blocks)*
8. &emsp;&emsp;&emsp;&emsp; Load $Q_i, O_i, \ell_i, m_i$ from HBM to on-chip SRAM.
9. &emsp;&emsp;&emsp;&emsp; On chip, compute $S_{ij} = Q_i K_j^\top \in \mathbb{R}^{B_r \times B_c}$.
10. &emsp;&emsp;&emsp;&emsp; On chip, compute $\tilde m_{ij} = \mathrm{rowmax}(S_{ij}) \in \mathbb{R}^{B_r}$, $\tilde P_{ij} = \exp(S_{ij} - \tilde m_{ij}) \in \mathbb{R}^{B_r \times B_c}$ (pointwise), $\tilde \ell_{ij} = \mathrm{rowsum}(\tilde P_{ij}) \in \mathbb{R}^{B_r}$.
11. &emsp;&emsp;&emsp;&emsp; On chip, compute $m_i^{\text{new}} = \max(m_i, \tilde m_{ij}) \in \mathbb{R}^{B_r}$, $\ell_i^{\text{new}} = e^{m_i - m_i^{\text{new}}} \ell_i + e^{\tilde m_{ij} - m_i^{\text{new}}} \tilde \ell_{ij} \in \mathbb{R}^{B_r}$.
12. &emsp;&emsp;&emsp;&emsp; Write $O_i \leftarrow \mathrm{diag}(\ell_i^{\text{new}})^{-1} \left( \mathrm{diag}(\ell_i)\, e^{m_i - m_i^{\text{new}}} O_i + e^{\tilde m_{ij} - m_i^{\text{new}}} \tilde P_{ij} V_j \right)$ to HBM.
13. &emsp;&emsp;&emsp;&emsp; Write $\ell_i \leftarrow \ell_i^{\text{new}}$, $m_i \leftarrow m_i^{\text{new}}$ to HBM.
14. &emsp;&emsp; **end for**
15. **end for**
16. Return $O$.

{{< /details >}}

## 3.1 Goal: Never Materialize $N \times N$ in HBM

**Final goal**: compute $O \in \mathbb{R}^{N \times d}$ while ensuring the intermediate matrices $S = QK^\top$ and $P = \mathrm{softmax}(S)$ never appear in HBM. They exist only temporarily in SRAM and are discarded after use.

Start with block partitioning (Algorithm 1, lines 1 and 3):

> **Require**: $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM; on-chip SRAM of size $M$.
>
> 1. Set block sizes $B_c = \lceil M/(4d) \rceil$, $B_r = \min(\lceil M/(4d) \rceil, d)$.
> 2. Divide $Q$ into $T_r = \lceil N/B_r \rceil$ blocks $Q_1, \ldots, Q_{T_r}$ of size $B_r \times d$ each; divide $K, V$ into $T_c = \lceil N/B_c \rceil$ blocks $K_1, \ldots, K_{T_c}$ and $V_1, \ldots, V_{T_c}$ of size $B_c \times d$ each.

That is, split $Q$ row-wise into $Q_i \in \mathbb{R}^{B_r \times d}$, and split $K, V$ row-wise into $K_j, V_j \in \mathbb{R}^{B_c \times d}$. Each block is small enough to fit in SRAM.

## 3.2 The Obstacle: Softmax Is Not Local

Matmul is naturally blockable:

$$
QK^\top = \begin{bmatrix} Q_1 \\ Q_2 \end{bmatrix} \begin{bmatrix} K_1^\top & K_2^\top \end{bmatrix}
$$

Each output block depends only on the corresponding $Q$ and $K$ blocks.

Softmax is different:

$$
\mathrm{softmax}(x)_i = \frac{e^{x_i - m}}{\sum_j e^{x_j - m}}, \quad m = \max_j x_j
$$

Both the max $m$ and the denominator require the **entire row**. If you only see one block, you know neither the true row max nor the true row sum.

If we directly split along the $K$ dimension, compute $QK^\top$ block by block, and apply local softmax inside each block, the result is **wrong**, because it uses a local max instead of the global row max.

## 3.3 Online Softmax's Rebase Trick

The solution is to maintain **two scalars per row** while scanning blocks:

| Symbol | Meaning |
| --- | --- |
| $m$ | running max — the maximum value seen so far |
| $\ell$ | running sum — the current $\sum e^{x - m}$ under the current $m$ |

Assume the first $j-1$ blocks have been processed and we hold $(m^{(j-1)}, \ell^{(j-1)})$. The local statistics of the new block $j$ are:

$$
\tilde m^{(j)} = \max(x^{(j)}), \qquad \tilde\ell^{(j)} = \sum_{x \in x^{(j)}} e^{x - \tilde m^{(j)}}
$$

Merge them by:

$$
m^{(j)} = \max\!\left(m^{(j-1)},\, \tilde m^{(j)}\right)
$$

$$
\ell^{(j)} = e^{m^{(j-1)} - m^{(j)}} \cdot \ell^{(j-1)} \;+\; e^{\tilde m^{(j)} - m^{(j)}} \cdot \tilde\ell^{(j)}
$$

The second equation is the heart of the trick.

The previous $\ell^{(j-1)}$ was computed using the old max $m^{(j-1)}$:

$$
\ell^{(j-1)} = \sum_{x \in \text{old blocks}} e^{x - m^{(j-1)}}
$$

Now the max may have increased, so the global baseline becomes $m^{(j)}$. We need to rewrite the old sum under the new baseline:

$$
\sum_{x \in \text{old blocks}} e^{x - m^{(j)}} = \sum_{x \in \text{old blocks}} e^{x - m^{(j-1)}} \cdot e^{m^{(j-1)} - m^{(j)}} = \ell^{(j-1)} \cdot e^{m^{(j-1)} - m^{(j)}}
$$

That gives the first term. The second term similarly rebases the new block from its local baseline $\tilde m^{(j)}$ to the global baseline $m^{(j)}$. Together, these factors rewrite sums computed under different baselines into a single shared baseline.

> **This is not an approximation. It is exact.** That is why FA1 is *exact* attention, unlike approximate methods such as Linformer / Performer.

## 3.4 Accumulating the Output $O$

The same rebase idea applies to the output accumulator $O_i$. Whenever a new block arrives, $O_i$ must be rescaled by two kinds of factors:

- $e^{m^{(j-1)} - m^{(j)}}$ rebases exponentials computed under the old max to the new max
- $\ell^{(j-1)} / \ell^{(j)}$ converts partial outputs normalized by the old denominator to the new denominator

The entire trick in Section 3 is one repeated action:

> **Whenever a new block arrives, rescale the old accumulator to the new baseline.**

## 3.5 Backward and Recompute

The forward pass is now handled, but there is still one concern: **backward needs $P$**.

The probability block can be reconstructed as:

$$
P_{ij} = \frac{e^{S_{ij} - m_i}}{\ell_i} = \frac{e^{Q_i K_j^\top - m_i}}{\ell_i}
$$

To recompute $P_{ij}$, we need $Q, K$ (already in HBM) plus each row's $(m_i, \ell_i)$, which is only **two scalars per row**, or $O(N)$ extra storage.

So FA1's strategy is:

- Forward stores only $O$ and $(m_i, \ell_i)$ in HBM
- Backward recomputes $P$ block by block instead of reading it from HBM

This trades FLOPs for memory. At first it looks bad: FA1 backward does one extra $QK^\top$. But **backward itself is heavily memory-bound** in the standard implementation: its bottleneck is moving the $N \times N$ matrix $P$ through HBM. FA1 computes more, but moves less; the net result is that **backward also gets faster in wall-clock time**.

> This "more compute for less memory" trade is one of the central patterns in LLM infrastructure. It shows up again in speculative decoding, PagedAttention, GPTQ, and many other places.

---

# 4. Complexity

## 4.1 Counting: How Many Times Is Each Block Moved?

FA1's loop structure is **K/V outside, Q inside**:

```text
for j = 1..T_c:                    # outer: K/V blocks
    load K_j, V_j                  # once
    for i = 1..T_r:                # inner: Q blocks
        load Q_i, O_i, m_i, l_i    # once per inner iteration
        compute in SRAM
        write back O_i, m_i, l_i
```

where $T_r = N/B_r$ and $T_c = N/B_c$.

| Data | Number of loads | Size per load | Total traffic |
| --- | --- | --- | --- |
| $K_j, V_j$ | $T_c$ | $B_c d$ each | $2 T_c B_c d = 2 N d$ |
| $Q_i$ | $T_c \cdot T_r$ | $B_r d$ | $T_c \cdot N d$ |
| $O_i$ (read + write) | $T_c \cdot T_r \times 2$ | $B_r d$ | $2 T_c \cdot N d$ |

The dominant term is $T_c \cdot N d$; the K/V term is asymptotically smaller in this count.

## 4.2 Dominant Term and Final Formula

From the block-size constraint $B_c = \Theta(M/d)$, because SRAM must hold blocks such as K/V/Q/O, we get:

$$
T_c = \frac{N}{B_c} = \Theta\!\left(\frac{N d}{M}\right)
$$

Plugging this into the dominant term:

$$
T_c \cdot N d = \Theta\!\left(\frac{N d}{M} \cdot N d\right) = \boxed{\Theta\!\left(\frac{N^2 d^2}{M}\right)}
$$

This is FA1's HBM traffic complexity. Compared with standard attention's $\Theta(N^2)$ traffic for the materialized attention matrix (in the common regime $N \gg d$), the IO reduction factor is:

$$
\frac{\text{Standard}}{\text{FA1}} = \frac{N^2}{N^2 d^2 / M} = \boxed{\frac{M}{d^2}}
$$

## 4.3 The $M/d^2$ Factor and Hardware Numbers

Plug in hardware numbers:

| Configuration | $M$ (elements) | $d$ | $M/d^2$ |
| --- | --- | --- | --- |
| A100, fp32 | ~48,000 | 64 | ~12x |
| A100, fp16 | ~96,000 | 64 | ~23x |
| A100, fp16 | ~96,000 | 128 | ~6x |

The paper reports roughly 7.6x wall-clock speedup on BERT-large on A100. The gap between this and the rough theoretical 12-23x comes from engineering constants such as SRAM utilization, scheduling overhead, and secondary K/V movement. **The order of magnitude explains why multi-x speedup is plausible, while actual wall-clock performance still depends on occupancy, scheduling, Tensor Core utilization, and kernel implementation.**

Two useful intuitions:

- **$d^2$ is in the denominator**: larger per-head dimension means smaller speedup. Moving from $d=64$ to $d=128$ reduces the factor by 4x. Multi-head attention's habit of keeping per-head $d$ around 64 happens to make FA1 especially beneficial. This is a form of hardware-algorithm co-design resonance.
- **$M$ is in the numerator**: larger SRAM means larger speedup. This is why FlashAttention gets even stronger on H100 than on A100.

## 4.4 Lower Bound and "Touching the Floor"

FA1 also proves a lower bound based on the classic Aggarwal-Vitter I/O model:

> Any exact attention algorithm needs at least $\Omega(N^2 d^2 / M)$ HBM accesses.

Meaning: **FA1 touches the IO-complexity floor**. Later systems such as FA2 / FA3 / PagedAttention do not improve this asymptotic complexity; they improve **constants**, **parallelism**, **precision**, and **KV-cache reuse**. To truly break this lower bound, we either need to **leave the dense exact attention problem setting**, for example with approximate attention or SSM/RNN-style architectures, or **change the hardware assumptions**.

---

# 5. Wrap-Up

Question: FA1's algorithm contains no brand-new component — tiling, online softmax, and recompute were all known. So what is its contribution?

**Its contribution is the perspective.** It reframes attention as a memory-bound problem; abstracts the GPU as "two-level memory + movement cost"; and assembles ordinary tools into an exact algorithm that reaches the IO-complexity lower bound.

One more point: although the FA1 paper explains everything through GPUs, its lower-bound proof uses the abstract **Aggarwal-Vitter I/O model**, not a GPU-specific model. The same way of thinking applies to any "fast-small + slow-large" memory system: CPU cache vs DRAM, TPU SMEM vs HBM, or local vs remote memory in distributed systems, which is the direction Ring Attention explores.

> **FA1 is not merely an attention accelerator. It is also a template for aligning algorithms with the memory hierarchy.**

## Concept Checklist

- FA1's algorithmic components — **tiling, online softmax, recompute** — are old pieces
- FA1's real contribution is the **perspective**: rewrite attention from a "compute problem" into a "bandwidth problem"
- A GPU is not just one block of "memory"; it is an **HBM (large and slow) + SRAM (small and fast)** hierarchy, and arithmetic intensity tells us whether an op is compute-bound or memory-bound
- Attention has plenty of FLOPs, but the bottleneck is often the repeated HBM movement of the intermediate $P$ matrix
- Naive kernel fusion is not enough because backward needs $P$; this is why FA1 needs recompute as an escape hatch
- **Online softmax's rebase trick is exact**, not a numerical approximation; this separates FA1 from approximate attention methods such as Linformer / Performer
- "More compute for less memory" is a core LLM-infra pattern, extending from FA1 to speculative decoding / PagedAttention / GPTQ
- HBM traffic complexity $\Theta(N^2 d^2 / M)$ touches the Aggarwal-Vitter I/O lower bound; FA2/FA3 improve constants, parallelism, and KV-cache reuse
- Speedup factor $M/d^2$: larger $d$ means less speedup, larger $M$ means more speedup

---
# Note
{{< details summary="Notes" >}}

![Flash Attention 1](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/flash-attention-front.jpg)
![Flash Attention 2](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/flash-attention-back.jpg)

{{< /details >}}
