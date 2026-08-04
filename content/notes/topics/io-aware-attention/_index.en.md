---
title: "Topic Dossier: IO-Aware Attention"
description: "A single reading path for Softmax structure, IO-aware algorithms, tiled reproduction, and approximation error."
summary: "From Online Softmax to FlashAttention, numerical error, and sparse-attention error."
categories: ["Notes"]
tags: ["AI Infra", "Attention", "Softmax"]
series: ["IO-Aware Attention"]
note_kind: "topic-index"
---

This dossier asks one central question: **how can attention be computed efficiently and credibly without materializing the full attention matrix?**

## 1. The systems problem

[FlashAttention v1 and tiling-softmax](/en/notes/systems/ai-infra/note-systems-io-attn-1-flashattention/) reframes attention around HBM traffic and explains how tiling, online normalization, and recomputation form the complete algorithm.

## 2. The algorithmic source

[The original Online Softmax derivation](/en/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/) compares naive, safe, and online evaluation orders and derives the running-max and normalizer recurrence.

## 3. Reproduction and validation

[Reproducing online softmax and tiled attention](/en/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/) uses the naive result as a reference and validates the implementation with block-size and component invariants. It is the experimental chapter of this topic, not a separate research thread.

## 4. Two distinct error branches

- The Softmax topic in [Error Analysis](/en/notes/systems/error-analysis/) studies operation-level numerical error from exp, accumulation, division, casting, and evaluation order.
- [Artifact 6: Value-Aware Sparse Attention](/en/artifacts/06-value-aware-sparse-attention/) studies attention-output approximation error caused by sparse pruning.

The first asks how floating-point evaluation changes the same mathematical Softmax; the second asks how deliberately removing attention entries changes the output.
