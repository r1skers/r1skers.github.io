---
date: '2026-06-06T00:00:00+09:00'
draft: false
title: "[Artifact-5.2] BERT Linear Probe View — Pilot Note"
summary: "The linear-probe view of the Artifact-5 multi-probe series: train per-layer logistic regression on BERT document-segment representations to measure how linearly decodable topic information is across layers, against a random-init control and against the 5.1 clustering view — finding that a supervised linear probe reads topic information that unsupervised clustering cannot."
description: "Artifact-5.2 is the linear-probe child artifact of the BERT representation-probes series: reuse the cached layerwise representations from 5.1, measure topic linear separability with per-layer logistic regression and 5-fold cross-validation, pretrained vs random-init, and triangulate against the clustering view."
tags:
  - "Artifact"
  - "BERT"
  - "Linear Probe"
  - "Representation Analysis"
  - "Logistic Regression"
  - "20 Newsgroups"
categories:
  - "Artifacts"
weight: 52
math: true
---

Source project: local repo `D:\Dev\repos\bert-cluster-stability` (now on GitHub).
This artifact is the complete record of the 5.2 linear-probe view, finished 2026-06. It shares the same cached BERT layerwise representations with 5.1 — only the probe changes.

## 1. Goal

5.1 used **unsupervised clustering** as a probe, asking whether topic-aligned structure *self-organizes* in BERT representations. 5.2 asks a different question — with a **supervised linear probe**:

> **In the numbers BERT turns a document into at layer L, can "which topic it belongs to" be read out easily by a linear classifier?**

More compactly:

**Is topic information arranged into a "linearly readable" geometry, and how does that readability change across layers?**

Current conclusion:

> Pretrained BERT arranges topic information into an increasingly linearly-readable geometry across depth (strongest at L12). But linear decodability is a *low bar* — **even random-init BERT sits well above chance**, and its readability *decays* across layers, the opposite of the pretrained *rise*.

---

## 2. Setup

### 2.1 Data and models (identical to 5.1, cache reused)

| Item | Value |
|---|---|
| Dataset | 20 Newsgroups (remove headers/footers/quotes; drop very short docs) |
| Pilot sample | `n_docs=2000`, `sample_seed=42` |
| Granularity | document segment, first 512 WordPiece tokens, mean-pool over non-padding |
| Main model | `bert-base-uncased` |
| Control | same architecture, random init, `seed=1` |
| Probed layers | embedding layer 0 + encoder layers 1..12 = 13 |
| Cache shape | `(2000, 13, 768)` |

**Key point: embeddings are read straight from 5.1's `outputs/cache/*.npz`; 5.2 runs no BERT forward pass.** This is also why 5.2 / 5.3 can run in parallel — all three views share one representation and only swap the probe.

### 2.2 Probe and protocol

| Item | Value |
|---|---|
| Probe | multinomial logistic regression |
| Preprocessing | `StandardScaler` (inside the Pipeline, **fit on the training fold only**) |
| Evaluation | 5-fold StratifiedKFold CV, report mean ± std |
| Primary metric | accuracy (secondary: macro-F1) |
| Baselines | chance = 1/20 = 0.05; majority ≈ 0.06 |
| Regularization | `C=1.0` (fixed) |

---

## 3. Why a "linear" probe

This section answers an easily-skipped question that decides what the whole thing means: why must the probe be **linear**, and **weak**?

A linear classifier's decision rule is a single thing — multiply a point's 768 coordinates by weights, sum, add a bias:

$$
w_1 x_1 + w_2 x_2 + \dots + w_{768} x_{768} + b \;\gtrless\; 0
$$

Its boundary (the `=0` surface) is geometrically **always a hyperplane (flat)** — there is no $x^2$, no $x_i x_j$, so it **mathematically cannot bend**.

So there are two cases:

- **A flat plane already separates them** → topic information is **out in the open, easy to read**. ✅ This is what we want to measure.
- **Only a curved surface separates them** → the information is there, but **tangled and buried**.

We **deliberately use only a flat probe**, because we measure "**how easy to read**," not "**whether it exists at all**." Swap in a strong probe (MLP, kernels) and even if it digs out tangled information, what you measured is the **probe's power**, not the **tidiness of the representation's geometry**.

> **The probe's "weakness" is by design**: it makes the measurement reflect only "how linearly accessible topic information is arranged," not "whether the information exists."

### 3.1 What the probe does (inner-product view)

Per-layer logistic regression trains, for each of the 20 topics, a **detector** $w_k$ (a 768-dim direction arrow). A point $x$'s topic score = the **inner product of point and detector**:

$$
\text{score}_k = \langle x, w_k\rangle + b_k = \|x\|\,\|w_k\|\cos\theta + b_k
$$

A large inner product = the point aligns with $w_k$'s direction = it looks like topic k. The 20 scores are one matrix multiply `coef_ @ x` (`coef_` has shape `(20, 768)`); take the max as the prediction. The fraction of held-out points predicted correctly is that layer's accuracy.

(This "inner product = alignment" primitive is the same $QK^\top$ as in the Transformer — attention measures word-to-word alignment, the probe measures point-to-topic-direction alignment.)

---

## 4. Main result: accuracy(L)

Fixed protocol, sweeping 13 layers, pretrained vs random-init:

![Linear-probe accuracy per layer](linear_probe_accuracy.png)

Observations (5-fold CV accuracy, chance = 0.05):

| Model | L0 | Middle (L4–9) | L12 | Shape |
|---|---:|---:|---:|---|
| pretrained | 0.563 | ~0.58 plateau | **0.623** | low start → mid plateau → late rise |
| random-init | **0.380** | ~0.31 | 0.275 | high start → **monotone decay** |

Two things worth noting:

1. **The pretrained curve rises with depth**, ticking up again at L10–L12, strongest at L12 — echoing the "late-layer boost" of 5.1's clustering NMI.
2. **The random-init curve decays in reverse**, but stays **well above chance (0.05)** throughout.

### 4.1 Why random-init is not at the floor, and why it decays

L0 is the embedding layer's mean-pool ≈ **a bag of word vectors ≈ a random projection of BOW**. 20NG's BOW is already linearly separable, so **random weights get 0.38 at L0** — this readability is **a free gift of the architecture, not learned**.

Going deeper, random nonlinear mixing **destroys** that linear readability layer by layer → decay. Pretraining does the opposite — it **builds** topic geometry layer by layer → rise.

> Depth does **opposite things** to the two models: pretraining constructs topic structure, random-init destroys the input-side lexical structure.

So what truly attributes to "learning" is not pretrained's absolute value, but:

$$
\text{pretraining contribution}(L) \approx \text{pretrained}(L) - \text{random-init}(L)
$$

and this gap widens with depth (L12 ≈ 0.62 − 0.28 = 0.34).

---

## 5. Versus 5.1: linear decodability ≠ cluster self-organization

This is 5.2's real payoff, and the point of the whole "multi-probe triangulation."

![Three-view synthesis](three_view_synthesis.png)

**Left (pretrained, normalized)**: min-max normalize each view, compare shapes — 5.1 clustering / 5.2 logreg / 5.3 LDA **broadly agree on where in depth topic information emerges** (early rise — mid plateau — strong late rise); clustering is most depth-dependent, the two supervised probes nearly overlap. → the three views **corroborate on shape**.

**Right (random-init, native units)**: the core divergence. **Clustering floors (NMI ≈ 0.06 ≈ chance), but the supervised probes sit at ~0.38 and decay with depth.**

Same random-init weights:

- **Unsupervised clustering** says "there is no topic structure at all";
- **The supervised linear probe** says "there is, and quite a lot."

Why the divergence? Back to 5.1's geometric account: random-init representations are **extremely anisotropic** (a narrow cone, mean pairwise cosine ≈ 0.97). Unsupervised clustering is dragged toward this cone's dominant direction and can only make a topic-irrelevant trivial cut; but the topic signal **lives all along in the low-variance residual**, and the supervised probe, with labels as a teacher, **drills straight into the residual to find the discriminative direction**, bypassing the dominant axis.

> **Clustering is a victim of anisotropy; the linear probe is nearly immune to it** (logistic regression can absorb an invertible linear distortion into its weights).

In other words:

> **"Linearly decodable" and "self-organizes into clusters" are decoupled. A single probe would draw the wrong conclusion ("random-init has no topic information"); only multiple probes in contrast reveal the truth.**

---

## 6. 5.3 LDA corroboration: two supervised optima agree

5.2 (logistic regression, convex optimum) and 5.3 (Fisher LDA, Gaussian analytical optimum) run the **same harness**, only the estimator changes.

![LDA accuracy per layer](lda_probe_accuracy.png)

| Model | L0 | L12 |
|---|---:|---:|
| LDA pretrained | 0.597 | 0.636 |
| LDA random-init | 0.372 | 0.283 |

The LDA curve nearly **coincides** with logistic regression. Two linear optima from completely different starting points (one by gradient correction, one by an analytic within/between-scatter solution) give the same curve → **this `separability(L)` is not a byproduct of one classifier; it is a real property of the representation.**

(Implementation note: in high dimensions `S_W` (768×768) estimated from ~1600 samples is near-singular, so LDA uses `lsqr + auto shrinkage`. A small footnote in itself — the "analytical optimum" **also needs regularization** in high dimensions, the same thing as logistic regression's `C` in another guise.)

---

## 7. How to read "linearly decodable" — three precise boundaries

To avoid overclaiming, three wordings must be tightened:

1. **It is "linearly separable / decodable," not "a linear relationship."** y is 20 categories, not a continuous value; the question is "can a hyperplane read it out," not Pearson correlation.
2. **It measures the geometric arrangement of information, not whether the information exists.** Accuracy 0.62 does not mean BERT only "knows" 62% of the topic — it says this much of the topic information is **linearly reachable**; a nonlinear probe might dig out more. This is a statement about **representational geometry**.
3. **Subtract the control.** Linear decodability is a low bar (mostly a free gift of the architecture); pretraining's contribution hides in the `pretrained − random` gap.

---

## 8. Conclusions

The pilot collapses to six points:

1. In pretrained BERT, topic linear decodability **rises with depth**, strongest at L10–L12 (L12 acc ≈ 0.62 vs chance 0.05).
2. Random-init BERT's linear decodability is **well above chance throughout** but **decays with depth** — opposite to pretrained.
3. Random-init's high L0 ≈ a random projection of BOW; the readability is mostly **a free architectural gift**, with pretraining's contribution in the `pretrained − random` gap, widening with depth.
4. **Linear decodability ≠ cluster self-organization**: a supervised linear probe reads topic information that unsupervised clustering cannot (on random-init, clustering floors while the probe is well above chance).
5. The geometric root of the divergence is anisotropy — clustering is its victim, the linear probe nearly immune.
6. Logistic regression and Fisher LDA, two supervised optima, give nearly the same curve → the result is not an artifact of one estimator.

Short version:

> Across BERT layers, topic information becomes increasingly **linearly decodable** in pretrained BERT (peaking at L12), but linear decodability is decoupled from unsupervised cluster structure: a linear probe reads topic information well above chance even from random-init BERT — information that clustering, derailed by anisotropy, cannot see at all.

---

## 9. Current boundaries

- Validated only on 20 Newsgroups; only at the `n=2000` pilot scale, not the full set.
- Only one random seed for the control; `C` fixed, not swept.
- The trends are robust (two probes agree, tight CV bands), but **absolute numbers are pilot-grade**.
- Pooling is still mean-pool; CLS / IDF-weighted alternatives not systematically compared.

---

## 10. Next steps

1. The three-view synthesis figure is done (§5); next is to write it into the **umbrella synthesis + SOP paragraph**.
2. Scale to full 20NG (narrow scope, to confirm the main effect) if time allows.
3. A standalone writeup of the 5.3 Fisher view (geometric explanation of the random-init decay).

---

## Appendix: reproduction

Embeddings reuse 5.1's cached `outputs/cache/*.npz` (if absent, first run `experiments\extract_embeddings.py`).

### A.1 Logistic-regression probe (5.2)

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_linear_probe.py
.\.venv\Scripts\python.exe experiments\probe\plot_linear_probe.py
```

### A.2 Fisher LDA probe (5.3, same harness)

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_linear_probe.py --probe lda --output outputs/tables/probe/lda_probe.csv
.\.venv\Scripts\python.exe experiments\probe\plot_linear_probe.py --csv outputs/tables/probe/lda_probe.csv --filename lda_probe_accuracy.png
```

### A.3 Three-view synthesis figure

```powershell
.\.venv\Scripts\python.exe experiments\synthesis\plot_three_view.py
```
