---
date: '2026-06-06T00:00:00+09:00'
draft: false
title: "[Artifact-5.3] BERT Fisher View — Pilot Note"
summary: "The Fisher view of the Artifact-5 multi-probe series: compare an LDA linear probe with the Fisher trace ratio η²=tr(S_B)/tr(S_T). Their random-init divergence establishes measurement non-equivalence; a later spectrum audit rejects the initial low-variance-tail unifying account."
description: "Artifact-5.3 reuses cached representations to compare an LDA classifier, Fisher trace geometry, and direction-level PCA attribution. Its scientific closure centers measurement non-equivalence and leading-subspace spectral rebalancing."
tags:
  - "Artifact"
  - "BERT"
  - "Fisher Discriminant"
  - "LDA"
  - "Representation Analysis"
  - "20 Newsgroups"
categories:
  - "Artifacts"
weight: 53
math: true
---

Source project: [bert-cluster-stability](https://github.com/r1skers/bert-cluster-stability).
This artifact is the complete record of the 5.3 Fisher view, finished 2026-06. It shares the same cached BERT layerwise representations with 5.1 / 5.2 — only the probe changes.

> **2026-07 closure note:** This page originally treated “low aggregate η² + high probe accuracy” as unique evidence that topic signal lives in low-variance directions. A later same-sample direction-level audit tested that account directly: on raw centered pretrained L12, PC1 has per-PC $\eta^2=0.669$; the first 100 PCs hold **82.4%** of variance but **98.7%** of between-class scatter; the Spearman correlation between PC variance and per-PC $\eta^2$ is **+0.718**. The low-variance-tail unifying hypothesis is therefore rejected and retired. What remains is **measurement non-equivalence + leading-subspace spectral rebalancing**. These attributions are exploratory/descriptive, not held-out confirmation.

## 1. Positioning: same representation, third ruler

5.1 uses unsupervised clustering, 5.2 uses logistic regression, 5.3 uses **Fisher / LDA**. The three are relatives in one table — laid out by "**generative vs discriminative**" and "**uses labels or not**":

| | Unsupervised (no labels) | Supervised (labels) |
|---|---|---|
| **Generative** (model each class's cloud $p(x\mid c)$, then Bayes) | **GMM clustering** (used in 5.1) | **LDA** (5.3) / QDA |
| **Discriminative** (ignore cloud shape, draw the boundary $p(c\mid x)$) | — | **Logistic regression** (5.2) |

**A clarification about labels** (across all three views): the topic labels are **built into the 20 Newsgroups dataset** (which newsgroup a post was sent to = its true topic), not "computed" by any method. All three rulers **hold the same true labels from the start**; they differ only in usage:

- **5.1 clustering**: groups **without looking** at labels (blind), then scores with labels (NMI) afterward.
- **5.2 / 5.3**: use labels **face-up, throughout**.

> In one line: 5.1 does the puzzle with the answer key face-down then checks it; 5.2 / 5.3 do it with the answer key face-up.

5.3's unique contribution is not “another supervised linear classifier,” but that **Fisher provides a classifier-independent descriptive geometry scalar**. This separates aggregate geometry from predictive readout. Their divergence establishes that the measurements are not interchangeable, but does not uniquely identify a hidden mechanism.

---

## 2. What the Fisher geometry η² is (intuition first)

### 2.1 A signal-to-noise ratio

Group each layer's points into 20 piles by true topic, and look at two things:

- **Within-pile fatness** $S_W$ (noise): how far apart documents of the same topic are.
- **Between-pile distance** $S_B$ (signal): how far apart the topic centers are.

$$
J=\frac{S_B}{S_W}=\frac{\text{between distance}}{\text{within fatness}}=\frac{\text{signal}}{\text{noise}},\qquad
\eta^2=\frac{S_B}{S_B+S_W}=\frac{J}{J+1}\in[0,1]
$$

Archery analogy: two archers each shoot a group of arrows. **The tighter each group ($S_W$ small) and the farther the two bullseyes ($S_B$ large) → the easier to tell who shot which → the higher the Fisher ratio**; scattered arrows or nearby bullseyes → the two heaps overlap → low Fisher.

$\eta^2$ reads as "**what fraction of the total spread is explained by topic**" — literally the $R^2$ of a one-way ANOVA. $\eta^2=0.15$ means only 15% of the spread comes from "different topics," 85% is "documents within the same topic differ wildly."

### 2.2 It is descriptive — no prediction, no cut

$\eta^2$ **classifies no point and draws no boundary**. It just "takes a ruler to the layout and reports a number" — the **labeled cousin** of anisotropy / participation ratio: pure geometry, bounded in $[0,1]$, **no inversion**.

How it's actually computed (5 steps, all with true labels, no clustering, no cut):

```
1. Group points into 20 piles by true label y     ← by the answer key, not KMeans
2. Each pile's center μ_c; the global center μ
3. S_W = Σ squared distance from each point to ITS pile center   (how fat)
4. S_B = Σ squared distance from each pile center to the global center   (how spread)
5. η² = S_B / (S_B + S_W)
```

Real numbers at L12 (after standardization):

| L12 | $S_W$ within | $S_B$ between | η² |
|---|---:|---:|---:|
| pretrained | 1,306,927 | **229,073** | 0.149 |
| random-init | 1,500,838 | **35,162** | 0.023 |

Look at the $S_B$ column: random-init's 20 true topic piles have **centers that barely separate** (35k vs pretrained's 229k), so η² is very low.

### 2.3 Why the trace ratio, not full Fisher

The full Fisher criterion needs $S_W^{-1}$, but in 768 dims with ~tens of samples per class, $S_W$ is near-singular. The trace ratio $\eta^2=\operatorname{tr}(S_B)/\operatorname{tr}(S_T)$ is the **inversion-free, well-conditioned** version — it sums over all 768 dims **uniformly**, exactly the "raw, untouched geometry," distinct from the LDA **classifier** below (which handles the singularity via shrinkage).

---

## 3. η² vs the LDA classifier: the divide is not "flat vs curved," it's "pick directions or not"

This is 5.3's key point and easy to get wrong: η², LDA, and logistic regression are **all linear — no curve anywhere** (curves need QDA / kernels / MLP, deliberately avoided in this series). Their real watershed is:

| | Cut? | **Pick directions / reweight?** | Nature |
|---|---|---|---|
| **Fisher η²** | No | **No** — sum over 768 dims weighted by their own variance (isotropic) | descriptive |
| **LDA / logistic regression** | Flat cut | **Yes** — recombine directions according to the training objective, covariance, and regularization | predictive |

Both come from the same ingredients ($S_W, S_B$); the usage differs: **η² sums the scatter uniformly; LDA uses $S_W^{-1}S_B$ to pick the best cut direction.** Same ingredients, one "measures evenly," the other "picks a direction and cuts."

> A directional note: it is **Fisher's criterion → derives the best cut** (LDA's cut direction = the direction maximizing the Fisher ratio), not "cut first, then compute Fisher." And our reported η² is the trace version — it picks no direction and makes no cut.

---

## 4. Result A: LDA classifier ≈ logistic regression (robustness cross-check)

![LDA accuracy per layer](lda_probe_accuracy.png)

| Model | L0 | L12 |
|---|---:|---:|
| LDA pretrained | 0.597 | 0.636 |
| LDA random-init | 0.372 | 0.283 |
| (ref) logreg pretrained | 0.563 | 0.623 |
| (ref) logreg random-init | 0.380 | 0.275 |

LDA (Gaussian analytical optimum) and logistic regression (convex optimum) curves **nearly coincide**: two linear optima from different starting points give the same `separability(L)`.

> Conclusion: the curve is robust to these two regularized linear estimators. It remains a probe-dependent readout and does not show that the model natively uses the decoded information.

As in 5.2, random-init's LDA accuracy is also **well above chance (0.05)** and decays with depth.

---

## 5. Result B: Fisher geometry η² — random-init very low

![Fisher geometry η²](fisher_geometry.png)

| Model | L0 | Middle | L11 (peak) | L12 |
|---|---:|---:|---:|---:|
| pretrained η² | 0.045 | ~0.10 plateau | **0.157** | 0.149 |
| random-init η² | 0.023 | 0.023 | 0.023 | 0.023 |

- **pretrained**: η² rises ~3.5× across depth, three-staged (early rise — mid plateau — strong L10-12 rise), peaking at L11. Yet even at its strongest, only **~15%** of total variance is between-class.
- **random-init**: about 0.023 throughout, roughly flat and about 7× below pretrained's peak. $(K-1)/(N-1)\approx0.01$ is only the scale of a same-sample null reference, not an empirical permutation confidence interval from this experiment.

---

## 6. Core observation: geometry vs classifier diverge on random-init

Put results A and B side by side for random-init:

| Measurement on random-init | Result | Resembles |
|---|---|---|
| Fisher **geometry** η² | ~0.023, low and nearly flat | like 5.1's low alignment |
| LDA / logreg **classifier** accuracy | 0.28–0.38, **well above chance** | like 5.2 probe |

**The same random-init representation has low aggregate geometry, yet a classifier predicts part of the topic label.** How can both hold?

### 6.1 Retired explanation: signal hides in the low-variance tail

The 2026-06 account was: aggregate η² is low while linear accuracy is high, therefore discriminative signal must live in low-variance directions that LDA / logreg amplify. That inference is **not identifiable**. Accumulation across many weak directions, covariance structure, regularization, and lexical/random-feature cues can produce the same “low aggregate / high readout” pattern.

The 2026-07 audit directly computes each raw centered PCA direction's variance, per-PC η², and between-scatter contribution. On pretrained L12:

- PC1 per-PC $\eta^2=0.669$;
- PC≤100 contains 82.4% of variance and 98.7% of between-class scatter;
- Spearman(PC variance, per-PC $\eta^2$) = +0.718.

This points opposite to “the main signal lives in the full spectrum's low-variance tail.” It supports a narrower description: topic-aligned class-mean structure is concentrated in the **leading subspace**. Because whitening retains the first 100 PCs and rescales them, its benefit is more consistent with **spectral rebalancing within the leading subspace**. No causal whitening intervention is established here.

### 6.2 Revised umbrella: the rulers are not equivalent

| Method | Measurement operator | What it cannot establish alone |
|---|---|---|
| 5.1 clustering + NMI | label alignment after an unsupervised partition | that information is absent / that NMI chance is 0.05 |
| whitening + clustering | changes distance weighting within leading PCs | that the main signal comes from the low-variance tail |
| Fisher trace η² | aggregates class-mean scatter fraction over directions | where each direction lies / whether a classifier can decode it |
| logreg / shrinkage LDA | fits a labeled linear decision rule | native model use / awareness of the information |

> **Revised conclusion: linear decodability, cluster alignment, aggregate Fisher geometry, and direction-level spectral attribution measure different objects. They may disagree; the disagreement is a result, not unique proof of one mechanism.**

Random-init's above-chance probe may also come from lexical cues preserved by the pretrained tokenizer and mean-pooled random token features. Anisotropy may affect distance-based clustering, but is not the unique cause isolated by this experiment.

---

## 7. What to look at: the "gap" between η² and accuracy

One curve is not enough. Putting η² and accuracy together reveals measurement sensitivity, but their “gap” does not by itself locate the signal in variance rank:

| Situation | η² | acc | Reading |
|---|---|---|---|
| aggregate and readout both strong | high | high | both measurements are strong; direction location still needs spectral attribution |
| aggregate weak, readout strong | low | high | the readout uses structure not prominent in the aggregate trace; low variance is only one possible cause |
| both measurements weak | low | low | both are weak under this probe / sample / regularization; information is not proven universally absent |

> **The gap only says that two operators have different sensitivity.** To ask where signal lies in variance rank, measure per-direction attribution directly, as in the 2026-07 audit.

Three views in one line: **clustering asks "does it self-separate," Fisher η² asks "without picking a direction, does it separate at all," the probe asks "with the best direction, can it be separated."**

---

## 8. Three-view synthesis

![Legacy exploratory three-view overlay](three_view_synthesis.png)

> **Current status: legacy exploratory overlay.** The left min-max normalizes different metrics while the right retains native units. It is useful for recalling curve shapes, not for establishing a shared mechanism or treating NMI≈0.06 as classification chance 0.05. Fisher η² and the direction-level audit should be read as separate measurements.

---

## 9. Conclusions

1. Shrinkage LDA and logistic regression give nearly the same `separability(L)` → the trend is robust to two regularized linear estimators.
2. Fisher geometry η²: pretrained rises to ~0.15 (peak L11, three-staged), random-init stays near the ~0.023 floor throughout.
3. **Aggregate geometry and classifier readout diverge on random-init**. This is measurement non-equivalence, not unique evidence for a low-variance mechanism.
4. The direction-level audit contradicts the low-variance-tail hypothesis: pretrained-L12 between scatter is concentrated in the leading subspace.
5. Whitening is better described as leading-subspace spectral rebalancing; random-init readout still needs lexical/random-feature and multiple-seed controls.

Short version:

> Fisher gives two non-equivalent readings of the same representation: aggregate class-mean geometry and regularized linear readout. Their divergence motivates direct direction-level measurement; that audit localizes pretrained-L12 between-class scatter to the leading subspace and retires the low-variance-tail explanation.

---

## 10. Current boundaries

- Only 20 Newsgroups, `n=2000` pilot scale, one random seed.
- η² is a **global, rotation-invariant, coarse** geometry scalar (trace ratio), direction-agnostic; it and classifier accuracy measure different facets, so fine differences like "η² flat / classifier decaying" should not be over-interpreted.
- η² depends on the label set: a different labeling (e.g. sentiment instead of topic) changes it; it is "**a geometric property of layer L's representation as seen through the 20NG topic labels**," not a task-free intrinsic property.
- The full Fisher discriminant ($S_W^{-1}S_B$ eigenspectrum) is not done — the trace ratio is used deliberately to avoid high-dim singularity.
- The 2026-07 direction-level attribution uses labels on the same `n=2000` sample and is a descriptive audit without an independent confirmation split.
- The initial “low-variance directions + reweighting” unifying hypothesis is contradicted and retired. Leading-subspace rebalancing remains descriptive, not causally verified.

---

## Appendix: reproduction

Embeddings reuse the cached `outputs/cache/*.npz` (if absent, first run `experiments\extract_embeddings.py`).

### A.1 LDA classifier (Result A)

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_linear_probe.py --probe lda --output outputs/tables/probe/lda_probe.csv
.\.venv\Scripts\python.exe experiments\probe\plot_linear_probe.py --csv outputs/tables/probe/lda_probe.csv --filename lda_probe_accuracy.png
```

### A.2 Fisher geometry η² (Result B)

```powershell
.\.venv\Scripts\python.exe experiments\probe\fisher_geometry.py
```

### A.3 Legacy exploratory three-view overlay

```powershell
.\.venv\Scripts\python.exe experiments\synthesis\plot_three_view.py
```

### A.4 2026-07 direction-level spectrum audit

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_spectral_attribution.py
```
