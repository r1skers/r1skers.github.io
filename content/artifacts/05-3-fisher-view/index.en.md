---
date: '2026-06-06T00:00:00+09:00'
draft: false
title: "[Artifact-5.3] BERT Fisher View — Pilot Note"
summary: "The Fisher view of the Artifact-5 multi-probe series: use LDA as a supervised linear probe (cross-checking 5.2 logistic regression), and use the Fisher trace ratio η²=tr(S_B)/tr(S_T) to measure topic 'within-class compactness / between-class separation' geometry directly. The geometry (η²) and the classifier (accuracy) diverge on random-init — revealing the mechanism running through the whole umbrella: topic information lives in low-variance directions, and only direction-reweighting methods read it."
description: "Artifact-5.3 is the Fisher view child artifact of the BERT representation-probes series: reuse cached representations, measure layerwise topic separability with both an LDA classifier and the Fisher trace ratio, and unify the 5.1 clustering / 5.2 logistic / 5.3 Fisher views under one 'low-variance discriminative directions + reweighting' thread."
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

Source project: local repo `D:\Dev\repos\bert-cluster-stability` (now on GitHub).
This artifact is the complete record of the 5.3 Fisher view, finished 2026-06. It shares the same cached BERT layerwise representations with 5.1 / 5.2 — only the probe changes.

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

5.3's unique contribution is not "another supervised linear classifier," but that **Fisher provides a classifier-independent pure geometry scalar** — so we can split "geometry" from "classifier" and watch them diverge, the divergence itself being the mechanism of the whole umbrella.

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
| **LDA / logistic regression** | Flat cut | **Yes** — hunt for the most-separating direction, amplifying "low-variance but useful" ones | predictive |

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

> Conclusion: the curve is **not a byproduct of one classifier; it is a real property of the representation**.

As in 5.2, random-init's LDA accuracy is also **well above chance (0.05)** and decays with depth.

---

## 5. Result B: Fisher geometry η² — random-init very low

![Fisher geometry η²](fisher_geometry.png)

| Model | L0 | Middle | L11 (peak) | L12 |
|---|---:|---:|---:|---:|
| pretrained η² | 0.045 | ~0.10 plateau | **0.157** | 0.149 |
| random-init η² | 0.023 | 0.023 | 0.023 | 0.023 |

- **pretrained**: η² rises ~3.5× across depth, three-staged (early rise — mid plateau — strong L10-12 rise), peaking at L11. Yet even at its strongest, only **~15%** of total variance is between-class.
- **random-init**: **near the floor ~0.023 throughout** (the random-label floor is about $(K-1)/(N-1)\approx0.01$, so there is only faint real signal), **flat across layers**, about 7× below pretrained's peak.

---

## 6. Core finding: geometry vs classifier diverge on random-init

Put results A and B side by side for random-init:

| Measurement on random-init | Result | Resembles |
|---|---|---|
| Fisher **geometry** η² | ~0.023, **near floor** | like 5.1 clustering |
| LDA / logreg **classifier** accuracy | 0.28–0.38, **well above chance** | like 5.2 probe |

**The same random-init representation: pure geometry says "almost no between-class structure," the classifier says "plenty of topic is readable."** How can both hold?

### 6.1 Explanation: the signal hides in low-variance directions; only reweighting sees it

η² and clustering both **see the world by variance** — they measure "what fraction of total variance is between-class." But BERT's (especially random-init's) topic-discriminative directions are **low-variance** (buried in the narrow-cone residual, see 5.1 §15 anisotropy). So:

- η² / clustering: **weight by raw variance** → low-variance discriminative directions are drowned → random-init looks like a floor.
- LDA ($S_W^{-1}$) / logistic regression (learned weights $w$): **reweight directions** → amplify the low-variance discriminative direction → random-init well above chance.

> What decides "can you read the topic" is **not "supervised vs unsupervised," but "does the method reweight directions."**
> The Fisher pair (geometry η² without reweighting / LDA classifier with reweighting) **isolates this variable** by itself.

### 6.2 This thread unifies the whole umbrella

| Method | Reweights directions? | On random-init |
|---|---|---|
| 5.1 naive clustering | No | floor |
| **5.1 whitening + clustering** | **Yes** (whitening = rescaling each direction) | unpacks the structure |
| 5.3 Fisher geometry η² | No | floor |
| 5.2 logistic regression | Yes (learned $w$) | well above chance |
| 5.3 LDA classifier | Yes ($S_W^{-1}$ + shrinkage) | well above chance |

> **Unifying principle: BERT's topic information lives in low-variance directions. Any method that reweights directions (whitening / $S_W^{-1}$ / learned weights) can read it; any method that respects the raw variance geometry (naive clustering / Fisher trace ratio η²) sees the floor.**

5.1 once "got lucky" unpacking the structure via whitening; 5.3 gives it a **supervised-geometry explanation**: whitening's reweighting is the same kind of operation as LDA's $S_W^{-1}$ and logreg's $w$.

---

## 7. What to look at: the "gap" between η² and accuracy

One curve is not enough — **putting η² (no direction-picking) and acc (best direction picked) side by side, the gap is the information**:

| Situation | η² | acc | Reading |
|---|---|---|---|
| Signal **out in the open** | high | high | separation is on a high-variance direction; picking doesn't matter |
| Signal **buried in low variance** | **low** | **high** | invisible in raw geometry, but the right direction cuts it → **this is random-init** |
| Truly no signal | low | low (≈chance) | nothing separates it |

> **The gap = how much picking directions (reweighting) helps = how low-variance the topic signal is buried.** Not a vague "some other factor," but **precisely the one factor of "low-variance discriminative directions"**: small contribution to η² (variance-weighted), large contribution to the probe (direction-picking) — comparing the two forces it out.

Three views in one line: **clustering asks "does it self-separate," Fisher η² asks "without picking a direction, does it separate at all," the probe asks "with the best direction, can it be separated."**

---

## 8. Three-view synthesis

![Three-view synthesis](three_view_synthesis.png)

The synthesis figure (left: pretrained, normalized shapes; right: random-init, native units) uses the three **classifier/alignment** views (5.1 NMI / 5.2 logreg acc / 5.3 LDA acc). Fisher's **geometry** η² adds a fourth clue: on the right, the supervised probes are "well above chance" on random-init, while η² tells you the **raw geometry is actually a floor** — the difference between them is exactly the work of "reweighting."

---

## 9. Conclusions

1. LDA (analytical optimum) and logistic regression (convex optimum) give nearly the same `separability(L)` → the curve is a real property of the representation, not an estimator artifact.
2. Fisher geometry η²: pretrained rises to ~0.15 (peak L11, three-staged), random-init stays near the ~0.023 floor throughout.
3. **Geometry vs classifier diverge on random-init**: pure geometry (η²) says "almost no between-class structure," the classifier (LDA/logreg) says "topic is readable."
4. Explanation: the discriminative signal is in **low-variance directions**; variance-weighting methods (η²/clustering) miss it, reweighting methods ($S_W^{-1}$ / $w$ / whitening) read it.
5. **This "low-variance directions + reweighting" thread unifies the whole umbrella**: what decides readability is not supervision, but whether directions are reweighted.

Short version:

> Fisher gives two readings of the same representation: a raw geometry scalar (η², which puts random-init near the floor like clustering) and an LDA classifier (which, like logistic regression, reads random-init well above chance). Their divergence pinpoints the mechanism behind the whole umbrella — topic information lives in low-variance directions, visible only to methods that reweight directions (whitening, $S_W^{-1}$, learned weights), invisible to variance-respecting methods (naive clustering, the Fisher trace ratio).

---

## 10. Current boundaries

- Only 20 Newsgroups, `n=2000` pilot scale, one random seed.
- η² is a **global, isotropic, coarse** geometry scalar (trace ratio), direction-agnostic; it and classifier accuracy measure different facets, so fine differences like "η² flat / classifier decaying" should not be over-interpreted.
- η² depends on the label set: a different labeling (e.g. sentiment instead of topic) changes it; it is "**a geometric property of layer L's representation as seen through the 20NG topic labels**," not a task-free intrinsic property.
- The full Fisher discriminant ($S_W^{-1}S_B$ eigenspectrum) is not done — the trace ratio is used deliberately to avoid high-dim singularity.
- "Low-variance directions + reweighting" is a mechanistic **hypothesis**, consistent with 5.1's anisotropy geometry and the 5.1.1 synthetic demo, but not causally verified at the direction level on BERT.

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

### A.3 Three-view synthesis figure

```powershell
.\.venv\Scripts\python.exe experiments\synthesis\plot_three_view.py
```
