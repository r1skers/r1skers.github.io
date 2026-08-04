---
title: "Topic Dossier: IO-Aware Attention"
description: "A single reading path for Softmax structure, IO-aware algorithms, tiled reproduction, and operation-level numerical error."
summary: "From Online Softmax to FlashAttention and errors from exp, accumulation, and division."
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

## 4. Error-analysis interface

The Softmax topic in [Error Analysis](/en/notes/systems/error-analysis/) studies operation-level numerical error from exp, accumulation, division, casting, and evaluation order: how different floating-point evaluation paths shift the same mathematical Softmax.
