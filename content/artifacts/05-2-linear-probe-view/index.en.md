---
date: '2026-06-06T00:00:00+09:00'
draft: false
title: "[Artifact-5.2] BERT Linear Probe View — Pilot Note"
summary: "The linear-probe view of the Artifact-5 multi-probe series: train per-layer logistic regression on BERT document-segment representations and compare random-init, clustering, and Fisher geometry — showing that linear decodability and unsupervised alignment are different measurements."
description: "Artifact-5.2 is the linear-probe child artifact of the BERT representation-probes series: reuse the cached layerwise representations from 5.1, measure topic linear separability with per-layer logistic regression and 5-fold cross-validation, pretrained vs random-init, and triangulate against the clustering view."
tags:
  - "BERT"
  - "Representation Geometry"
  - "Machine Learning"
  - "Visual Representation"
categories:
  - "Artifacts"
series:
  - "Representation Geometry"
weight: 52
math: true
---

Source project: [bert-cluster-stability](https://github.com/r1skers/bert-cluster-stability).
This artifact is the complete record of the 5.2 linear-probe view, finished 2026-06. It shares the same cached BERT layerwise representations with 5.1 — only the probe changes.

> **2026-07 closure note:** This page preserves the original pilot record but withdraws the mechanism claim that topic signal mainly lives in a low-variance residual and anisotropy is the unique cause. A later same-sample direction-level audit found that raw centered pretrained L12 has per-PC $\eta^2=0.669$ on PC1; the first 100 PCs contain **82.4%** of variance and **98.7%** of between-class scatter; the Spearman correlation between variance and per-PC $\eta^2$ is **+0.718**. This is exploratory/descriptive attribution, not held-out confirmation, and narrows the account to **leading-subspace spectral rebalancing**.

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

### 4.1 Why random-init is not at the floor: a testable account, not an established mechanism

L0 mean-pooling can be approximated as **a bag of random word vectors**. But the random-init control still uses the pretrained WordPiece tokenizer; mean-pooled random token embeddings can retain lexical cues as high-dimensional random features. L0's 0.38 is therefore consistent with lexical information surviving a random map; it does **not** show that random BERT learned topic organization.

At greater depth, random-init probe accuracy falls while pretrained accuracy rises. That is an observed contrast. Without TF-IDF, an explicit BOW random projection, multiple random seeds, or module interventions, the fall cannot be uniquely attributed to random mixing “destroying” lexical structure.

> Depth produces opposite probe trends in the two models. This suggests that pretraining changes linear accessibility, but it is not yet a causal decomposition of the internal mechanism.

The two curves can be compared through a **descriptive contrast**:

$$
\text{probe gap}(L) = \text{pretrained}(L) - \text{random-init}(L)
$$

The gap widens with depth (L12 ≈ 0.62 − 0.28 = 0.34), but a one-seed difference is not an unbiased causal estimate of “pretraining contribution.”

---

## 5. Versus 5.1: linear decodability ≠ cluster self-organization

This is 5.2's real payoff, and the point of the whole "multi-probe triangulation."

![Legacy exploratory three-view overlay](three_view_synthesis.png)

> **Current status of this figure: legacy exploratory overlay.** It is the 2026-06 curve-shape comparison. Overlaying different metrics after min-max normalization cannot show that they measure one mechanism, nor can a bend in these curves locate where a capability “emerges.”

**Left (pretrained, normalized):** the three curves share a rough early-rise / plateau / late-rise shape. That is an observation worth testing, not emergence evidence.

**Right (random-init, native units):** clustering semantic alignment is low (NMI about 0.06), whereas the supervised probes start near 0.38 and decay. **NMI does not have classification accuracy's `1/20=0.05` chance baseline**; it must not be written as “NMI ≈ chance 0.05.”

Same random-init weights:

- **Unsupervised clustering** gives low topic alignment under this distance / preprocessing / clusterer recipe;
- **The supervised linear probe** shows that labels are linearly predictable from the same representation.

Why the divergence? Strong random-init anisotropy (mean pairwise cosine about 0.97) may affect distance-based clustering, but the current design does not identify it as the unique cause. Clustering and probes differ in objective, metric, covariance weighting, and label usage; random-init may also retain lexical cues through its tokenizer and random word features. The later spectrum audit directly contradicts the claim that the main signal lives in the full spectrum's low-variance tail.

> **The durable conclusion is measurement non-equivalence.** Anisotropy is one candidate contributor; the low-variance tail is not a mechanism established by this experiment.

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

The LDA curve nearly **coincides** with logistic regression. Two regularized linear estimators give similar curves → the layerwise probe trend is robust to these two estimator choices. This still does not show that the model natively uses the information read by the probe.

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
3. Random-init's high start is consistent with lexical / random-feature cues, but no TF-IDF or explicit random-projection control currently identifies the source.
4. **Linear decodability ≠ cluster self-organization**: probe accuracy and clustering NMI are different measurements, are not interchangeable, and do not share a chance baseline.
5. Anisotropy may affect clustering but is not the uniquely identified cause; objective, distance geometry, covariance, and lexical cues may all contribute.
6. Logistic regression and shrinkage LDA nearly agree → the trend is robust to two linear estimator choices, not proof of native model use.
7. The direction-level audit contradicts the low-variance-tail account: pretrained-L12 topic-aligned between scatter is concentrated in leading PCs; whitening is better described as leading-subspace spectral rebalancing.

Short version:

> Across BERT layers, pretrained topic labels become increasingly **linearly decodable**, while random-init remains partly decodable, plausibly from lexical/random-feature cues. Linear readout, clustering alignment, and Fisher geometry give non-equivalent verdicts; the spectrum audit localizes pretrained-L12 class-mean scatter to the leading subspace rather than the low-variance tail.

---

## 9. Current boundaries

- Validated only on 20 Newsgroups; only at the `n=2000` pilot scale, not the full set.
- Only one random seed for the control; `C` fixed, not swept.
- The trends are robust (two probes agree, tight CV bands), but **absolute numbers are pilot-grade**.
- Pooling is still mean-pool; CLS / IDF-weighted alternatives not systematically compared.
- The 2026-07 spectrum attribution uses labels on the same `n=2000` sample. It is a descriptive audit, with neither an independent confirmation split nor a causal whitening intervention.

---

## 10. Open questions after closure

1. Calibrate the lexical/random-feature account with TF-IDF, an explicit BOW random projection, and multiple random-init seeds.
2. Any confirmatory continuation should preregister an independent split, fit PCA / preprocessing on train only, and evaluate once on held-out data.
3. A follow-on project should separate decodability, native behavior, and causal intervention instead of inferring emergence from probe curves.

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

### A.3 Legacy exploratory three-view overlay

```powershell
.\.venv\Scripts\python.exe experiments\synthesis\plot_three_view.py
```

### A.4 2026-07 direction-level spectrum audit

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_spectral_attribution.py
```
