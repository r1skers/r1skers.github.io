---
date: '2026-05-16T10:00:00+09:00'
draft: false
title: 'Machine Learning / CLIP and Multimodal Alignment: From Contrastive Learning to a Shared Image-Text Space'
summary: "Starting from the paradigm shift of 'replacing labels with natural language', this note derives InfoNCE step by step as a B-way classification problem, then explains the three core components — symmetric loss, temperature, and L2 normalize. We then refit the existing ViT into an image encoder, write a text encoder with causal Transformer + EOS feature extraction, and assemble them into a dual-tower CLIP. Finally we run sanity training on CIFAR-10 + template captions, push sim_gap from 0 to 0.45, and use a similarity heatmap to watch contrastive learning project semantic geometry onto the unit sphere."
description: "A study note on CLIP — reframing image-text alignment as B-way classification, deriving symmetric InfoNCE loss, understanding learnable temperature and the batch-size coupling, L2 normalize as spherical geometry, causal text encoder with EOS feature extraction, and CIFAR-10 sanity training that visualizes emergent semantic structure on the unit sphere."
tags: ["Machine Learning", "Contrastive Learning", "Multimodal"]
categories: ["Notes"]
series: ["Transformer, ViT, and CLIP"]
note_kind: "topic"
aliases:
---

# Machine Learning / CLIP and Multimodal Alignment: From Contrastive Learning to a Shared Image-Text Space

The previous note walked ViT from patch embedding all the way to CLS-based classification. This one stitches ViT together with an NLP Transformer encoder **into a single shared (image, text) space** — that's CLIP (Contrastive Language–Image Pre-training). The subtitle "from contrastive learning to a shared image-text space" captures everything new at this stop: images and texts go through two independent towers and get pulled onto the same d-dimensional sphere, matched pairs drawn close and mismatched pairs pushed apart. This machinery lets one model do image retrieval, zero-shot classification, and double as a representation extractor for BLIP / LLaVA later on.

Reforge code: [paper-reforge/CLIP](https://github.com/r1skers/paper-reforge/tree/main/CLIP)
Paper: [Learning Transferable Visual Models From Natural Language Supervision (Radford et al., 2021)](https://arxiv.org/abs/2103.00020)

---

# Abstract

- **Problem**: Before CLIP, almost every vision model was trained with ImageNet-style hand-labeled categories — a **closed set**. Whatever classes the model saw at training time were all it could recognize at inference time. Adding a new class or task meant re-labeling. How do we get out of this "annotation bottleneck"?
- **Solution**: Train on **400M (image, caption) pairs** scraped from the web, with an image encoder and a text encoder that pull matched pairs close in vector space and push mismatched pairs apart. At inference time, translate any classification task into "image vs class-name text" similarity matching.
- **Building blocks**:
  1. **Dual-tower architecture** = ViT image encoder + causal Transformer text encoder, **fully independent**, no cross-attention
  2. **Shared-space projection** = each tower ends with a `Linear(d_model, d_shared, bias=False)` that pulls modalities into the same d-dim space
  3. **Symmetric InfoNCE loss** = average the cross-entropy of "image→text retrieval" and "text→image retrieval"
  4. **L2 normalize** = push features onto the unit sphere so inner product = cosine similarity
  5. **Learnable temperature τ** = `1/τ = exp(logit_scale)`, model learns the optimal softmax sharpness
  6. **EOS feature extraction** = under causal mask only the last position sees the whole sentence, so use the EOS-position output as the sentence representation
- **Bottom line**: CLIP's contribution is a **paradigm**, not an architecture — every component (ViT, Transformer, InfoNCE) was off-the-shelf. Its revolution comes from two things: using natural language instead of labels turns the class space **into an open set**; using contrastive learning (not generation) at 400M-pair industrial scale makes it actually work.

---

# 1. Motivation: From Closed-Set Labels to Open-Set Natural Language

The CNN / ViT-era training recipe:

```text
14M ImageNet images × one hand-labeled class each
  → train an nn.Linear(d_model, 1000) classification head
  → model only recognizes those 1000 classes
```

This recipe has three **structural limits**, all of which CLIP cracks at once:

| Limit | Symptom | Consequence |
|---|---|---|
| **Annotation cost** | 14M images, all human-labeled | Tedious repeated labor |
| **Closed set** | Classes seen at training = classes recognizable at inference | Give it a "unicorn" image and the model can only pick the most similar one of the 1000 — it **doesn't know what it doesn't know** |
| **Task rigidity** | One model = one task | Constantly swapping models |

CLIP's answer: **don't use labels, use natural language**.

## Two New Properties of Natural Language as Supervision

OpenAI scraped 400M (image, alt-text) pairs from the web — captions are **free** (already on the page), **rich** (the same cat might be written as "a cat" / "my Siamese" / "Whiskers on the windowsill"), and **open** (caption space doesn't have ImageNet's "pick one of these 1000" constraint).

The bigger payoff comes at inference time:

```python
# Want to classify CIFAR-10? Make 10 strings on the fly, encode into 10 text features.
text_features = text_encoder([f"a photo of a {c}" for c in cifar10_classes])

# Want medical image classification? Swap the class names and encode again.
text_features = text_encoder(["a CT scan of healthy lung", "a CT scan of pneumonia"])

# Same model → any classification task → zero extra training
prediction = (image_encoder(image) @ text_features.T).argmax()
```

> Even with "massive data + big model", training with **natural language** instead of labels turns "classifier weights" from "a fixed learnable `nn.Linear`" into "a vector produced on the fly by the text encoder". That's the root cause of zero-shot capability — not that the model got smarter, but that the classifier became the text encoder's output.

## The Origin of CLIP

**CLIP did not invent any new component:**

- Image encoder is the off-the-shelf ViT (2020) or ResNet (2015)
- Text encoder is a GPT-style causal Transformer (2018)
- Contrastive loss is something SimCLR (2020) already did
- L2 normalize + cosine similarity has been textbook since the 1980s

Its contribution is:

1. Took "natural-language-as-supervision" to **industrial scale** (400M pairs)
2. **Demonstrated this paradigm beats supervised models at zero-shot** — the same CLIP model gets 76.2% top-1 zero-shot ImageNet, matching supervised ResNet-50 (76.1%)

This is a **methodology + engineering** win, not an architecture win. That's also why later work (BLIP / LLaVA / Stable Diffusion) leaves CLIP's architecture alone and changes the training method and data instead.

---

# 2. InfoNCE: From "Alignment" to "Classification"

CLIP's math hinges on translating "make image and text features align" into an **optimizable objective**.

## 2.1 First Translation: alignment → similarity

The simplest idea: have two encoders map images and texts into the same vector space $\mathbb{R}^d$, and define "alignment" as —

```text
matched (image, text) pair → high vector similarity
mismatched (image, text) pair → low vector similarity
```

Notation:

- $\mathbf{v}_i = f_\text{img}(x_i^\text{img}) \in \mathbb{R}^d$
- $\mathbf{u}_i = f_\text{txt}(x_i^\text{txt}) \in \mathbb{R}^d$
- $s_{ij} = \mathbf{v}_i^\top \mathbf{u}_j$ (after L2 normalize this is cosine)

Desired state: for the $B$ pairs in a batch $\{(x_i^\text{img}, x_i^\text{txt})\}_{i=1}^B$,

$$
s_{ii} \gg s_{ij}, \quad \forall j \neq i
$$

But $\gg$ is not a differentiable objective. We need another translation.

## 2.2 Second Translation: similarity → cross-entropy

Here's the **crucial perspective shift** shared by every contrastive-learning method (SimCLR / MoCo / CLIP):

> **Re-express "finding the match" as a B-way classification problem**:
>
> Given image $\mathbf{v}_i$, pick the right text out of the B texts $\{\mathbf{u}_1, ..., \mathbf{u}_B\}$ in the batch (i.e. $\mathbf{u}_i$).

This is a B-way classification problem; the logits are $s_{i1}, ..., s_{iB}$ and the correct index is $i$. So the loss is just cross-entropy. **This is the embryonic form of InfoNCE**:

$$
\mathcal{L}_{i \to t}(i) = -\log \frac{\exp(s_{ii})}{\sum_{j=1}^{B} \exp(s_{ij})}
$$

Once written this way, everything becomes **mechanical** — it's softmax + nll, structurally identical to ImageNet classification, except "number of classes" $B$ is the batch size and "class vectors" are the batch's text features rather than learnable classifier weights.

## 2.3 The Penalty — the Soul of Contrastive Learning

Expand the loss:

$$
\mathcal{L}_{i \to t}(i) = -s_{ii} + \log \sum_{j=1}^B \exp(s_{ij})
$$

- First term $-s_{ii}$: **higher positive similarity, lower loss** → pull matched pairs together
- Second term $\log \sum_j \exp(s_{ij})$ is **LogSumExp** ≈ $\max_j s_{ij}$ (the soft version of max when the scale is large)

What does LogSumExp penalize?

> **Any single negative similarity going up in the batch**. Even one $s_{ij}$ ($j \neq i$) rising will push LogSumExp up and the loss with it.

This is the core idea of contrastive loss: **positive pairs must be pulled together, AND all negatives must be pushed apart**.

> Geometric picture: imagine the B images and B texts all sitting on the unit sphere. The loss is doing exactly this: pull image $i$ and its text together, AND push the other B-1 texts away.

## 2.4 Batch Size and Contrastive Learning

The denominator has $B-1$ negatives, so the larger $B$ is, the more discriminative the model is forced to be:

- $B = 2$: only needs to "differ from this one negative" — **almost no discriminative pressure**
- $B = 32768$ (CLIP's original): must "differ from 32767 negatives" — **representations are extremely discriminative**

CLIP's paper showed that dropping batch size from 8k to 4k visibly hurts performance. That's why contrastive learning is famously *"the bigger the batch the better"*.

**Implication for the toy-scale CPU reproduction**: batch=128 caps the alignment strength we can reach. It's not that the model is wrong; it's a physical limit of the batch size. That's also why pushing sim_gap to 0.45 on CIFAR-10 already counts as success — significantly above random baseline already proves the signal is being learned.

---

# 3. Symmetric Loss

InfoNCE as derived is **single-direction**: fix the image as the anchor, pick the match out of B texts. But the same batch can be flipped: fix the text as the anchor, pick the match out of B images. CLIP averages both directions:

$$
\mathcal{L}_\text{CLIP} = \frac{1}{2} \left(
\underbrace{-\log \frac{\exp(s_{ii})}{\sum_j \exp(s_{ij})}}_{i \to t,\ \text{row softmax}}
+
\underbrace{-\log \frac{\exp(s_{ii})}{\sum_j \exp(s_{ji})}}_{t \to i,\ \text{column softmax}}
\right)
$$

Two lines of code:

```python
loss_i2t = F.cross_entropy(logits,    arange(B))   # softmax along rows
loss_t2i = F.cross_entropy(logits.T,  arange(B))   # softmax along columns
loss = (loss_i2t + loss_t2i) / 2
```

But **why must it be symmetric**?

## 3.1 Rows vs Columns: Two Different Discrimination Tasks

Intuitively:

- **i → t** (row softmax): "Given an image, pick the matching text out of B" — this is **text retrieval**
- **t → i** (column softmax): "Given a text, pick the matching image out of B" — this is **image retrieval**

i → t checks **each row**: diagonal element > other elements in that row.
t → i checks **each column**: diagonal element > other elements in that column.

## 3.2 The Specific Failure Mode a Single Direction Misses

Suppose we only train i → t and the model takes a shortcut, producing this 4×4 similarity matrix:

```text
                text_0   text_1   text_2   text_3
       img_0  [  0.9      0.7      0.1      0.05 ]
       img_1  [  0.2      0.8      0.2      0.1  ]
       img_2  [  0.1      0.75     0.85     0.1  ]
       img_3  [  0.1      0.7      0.1      0.95 ]
```

**Row-wise check (i → t)**: every row's diagonal is the row max → loss is low ✓

But look at **column 1**: `[0.7, 0.8, 0.75, 0.7]` — `text_1` is **similar to all four images**! Meaning `text_1` as a vector **is badly learned** — it has no discriminative power, it looks like almost everything.

i → t cannot detect this, because it only looks at rows.

t → i catches it immediately: column-softmax over column 1 demands that the similarity of `text_1` to `image_1` (0.8) significantly exceed its similarity to other images — `0.7` and `0.75` are too close, the loss spikes, and the model is forced to push `text_1` away from `img_0` and `img_2`.

> **i → t checks rows, t → i checks columns**. The two directions cover different failure modes: a single direction has blind spots in either "row OK but columns collapse" or "columns OK but rows collapse". Symmetric loss constrains both the row structure and the column structure of the matrix, making the diagonal the maximum in both its row and its column.

## 3.3 A Pretty Mathematical Property

Symmetric loss is invariant under transpose: $\mathcal{L}_\text{CLIP}(S) = \mathcal{L}_\text{CLIP}(S^\top)$. I wrote a dedicated test for this in `tests/test_loss.py`:

```python
def test_loss_symmetric_in_transpose():
    for B in [3, 5, 8]:
        logits = torch.randn(B, B, dtype=torch.float64) * 2.0
        loss_S  = info_nce_symmetric(logits).item()
        loss_ST = info_nce_symmetric(logits.T).item()
        assert abs(loss_S - loss_ST) < 1e-12
```

The diff stays below $10^{-12}$ in float64 — equality at the mathematical level, not a numerical coincidence.

---

# 4. Temperature τ: The Softmax Sharpness Knob

Temperature looks like a small hyperparameter, but it is contrastive learning's lifeblood. **Note: it is NOT equivalent to learning rate**.

## 4.1 The Full InfoNCE Formula

Bake temperature into the loss:

$$
\mathcal{L} = -\log \frac{\exp(s_{ii}/\tau)}{\sum_j \exp(s_{ij}/\tau)}
$$

More common in code is to call $1/\tau$ `logit_scale`:

$$
\text{logits} = \frac{1}{\tau} \cdot S = \text{logit\_scale} \cdot S
$$

## 4.2 Physical Meaning: Softmax Sharpness

Get a feel for what different τ values do.

Suppose raw similarities are `[1.0, 0.8, 0.6, 0.4]` (the first is the positive).

| τ | scaled logits | softmax | meaning |
|---|---|---|---|
| $\tau = 1.0$ | `[1.0, 0.8, 0.6, 0.4]` | `[0.35, 0.29, 0.23, 0.19]` | nearly uniform |
| $\tau = 0.1$ | `[10, 8, 6, 4]` | `[0.84, 0.11, 0.02, 0.003]` | concentrated on the positive |
| $\tau = 0.01$ | `[100, 80, 60, 40]` | `[~1, ~0, ~0, ~0]` | fully one-hot |
| $\tau = 10$ | `[0.1, 0.08, 0.06, 0.04]` | `[0.26, 0.25, 0.25, 0.24]` | fully uniform |

- **τ → 0** (hard): softmax degenerates to argmax, only the top match matters
- **τ → ∞** (soft): softmax degenerates to uniform, every negative is treated equally

## 4.3 Temperature vs Learning Rate: A Critical Distinction

| | Learning rate η | Temperature τ |
|---|---|---|
| Acts on | parameter update step size | the scale of softmax inputs |
| Does changing it make the model learn **something different**? | **No** (only changes speed) | **Yes** (changes the learned geometry) |

- `lr=0.1` vs `lr=0.01` — in theory the models learn **the same thing**, just at different speeds. Given enough steps both converge to the same minimum.
- `τ=0.01` vs `τ=1.0` — the **learned representation geometries are entirely different**. The first learns a feature space with "sharp boundaries, intensely focused on the hardest negatives"; the second learns one that is "soft and uniformly spread". **Not a fast-vs-slow path to the same minimum — different minima**.

Why such a big difference? Temperature acts **before** softmax, changing "which negatives are attended to and by how much" — this changes the **direction** of the gradient, not just its magnitude. Learning rate only scales gradient length, not direction.

> **A better analogy**: temperature is more like the $\sqrt{d_k}$ scaling inside attention — it decides whether softmax lands in the "near-argmax" or "near-uniform" zone, **shaping what the model pays attention to**.

## 4.4 Hidden Function: Automatic Hard-Negative Mining

Write out the gradient w.r.t. the positive logit:

$$
\frac{\partial \mathcal{L}}{\partial s_{ii}} = -\frac{1 - p_i}{\tau}, \quad
\frac{\partial \mathcal{L}}{\partial s_{ij}} = \frac{p_j}{\tau} \quad (j \neq i)
$$

where $p_j$ is the softmax probability of negative $j$. Large $p_j$ = this negative was incorrectly considered a likely match = **hard negative**. It receives a correspondingly large "push-away" gradient. That's the **automatic hard-negative mining** mechanism baked into contrastive learning.

- Small τ → sharp softmax → only a few near-positive negatives count as "hard" → model focuses on the hardest negatives → learns a sharp boundary
- Large τ → smooth softmax → all negatives attended uniformly → learns a softer boundary

## 4.5 Learnable τ + log-scale + clamp

CLIP doesn't fix τ — it **learns** it:

```python
self.logit_scale = nn.Parameter(torch.ones([]) * np.log(1/0.07))  # init τ=0.07

# forward:
logit_scale = self.logit_scale.exp().clamp(max=np.log(100))
logits = logit_scale * image_features @ text_features.T
```

Three design decisions, each with a reason:

1. **Learnable**: optimal τ varies across datasets, batch sizes, training phases. Learnable lets the model find it.
2. **log-scale**: we store $\log(1/\tau)$ and `.exp()` in forward. Why:
   - $1/\tau$ must be positive → `exp()` guarantees this
   - parameters spanning multiple orders of magnitude should be learned in log space (the same gradient step is a huge change for small values, a tiny change for large ones)
3. **Clamp upper bound**: as $\tau \to 0$ the gradient blows up. CLIP's original clamps $1/\tau \le 100$ ($\tau \ge 0.01$). This is a fuse — prevents τ from racing toward 0 during training and killing itself.

Trained CLIP τ usually settles around ~0.01 — pinned to the clamp boundary. This itself reveals something about contrastive learning: **the model always wants sharper softmax**.

## 4.6 The Batch Size ↔ τ Coupling

| | Big batch | Small batch |
|---|---|---|
| Negatives per anchor | 32k - 1 | 127 |
| Is the "hardest negative" actually hard? | Yes (semantically hard) | Not necessarily (could be unlucky) |
| τ you should use | Small (trust the hardest) | Large (can't trust the hardest) |

Our toy experiment is batch=128, so we use `init_temperature=0.2` (larger than CLIP's 0.07) and `max_logit_scale=log(20)` (tighter than the original `log(100)`). That's the standard hack for small-batch contrastive learning.

> This pair of dials (batch size and τ) is contrastive learning's **core coupling** — tuning one demands considering the other.

---

# 5. L2 Normalize: Putting Contrastive Learning on the Unit Sphere

InfoNCE looks like it could be computed without L2 normalize, but **in practice it must be normalized** — and normalize and temperature must coexist.

## 5.1 The Meaning of Normalize

Plain inner product has a **shortcut loophole**: it is sensitive to vector norm.

```text
v_a = [1, 0],     u_a = [1, 0]      → inner product = 1
v_b = [10, 0],    u_b = [10, 0]     → inner product = 100
```

Same direction but similarities differ by 100×. If the model learns to **inflate all vector norms**, all positive similarities go up — but that's a shortcut, not a real directional alignment.

Worse: in early training, image encoder output norms might be ~10 while text encoder output norms are ~1. The two sides have different scales and softmax distributions skew.

## 5.2 The Geometry of Normalize

L2 normalize forces every vector onto the **unit sphere**:

$$
\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2}, \quad \|\hat{\mathbf{v}}\|_2 = 1
$$

Inner product becomes:

$$
\hat{\mathbf{v}}^\top \hat{\mathbf{u}} = \cos\theta \in [-1, 1]
$$

Strip away the norm; only **direction** is left as signal.

## 5.3 Normalize and Temperature Must Coexist

**Only normalize, no temperature**: similarity ∈ [-1, 1], softmax input is always in that range, $\exp(1)/\exp(-1) \approx 7.4$, softmax is always "soft". The model cannot learn sharp discrimination.

**No normalize but with temperature**: the model can sidestep τ by **inflating norms**, scrambling τ's effect.

So:

$$
\boxed{\text{logit}_{ij} = \frac{1}{\tau} \cdot \cos(\hat{\mathbf{v}}_i, \hat{\mathbf{u}}_j)}
$$

Normalize decouples direction and scale; τ reintroduces a **controllable** scale. This is the standard recipe of contrastive learning.

## 5.4 Alignment + Uniformity

Wang & Isola (2020) have a clean analysis:

> Good contrastive representation = alignment + uniformity
>
> - **Alignment**: positive pairs **close** on the sphere (the numerator of InfoNCE)
> - **Uniformity**: all samples **spread evenly** on the sphere (the denominator — pushing every negative away = covering the sphere)

These two properties can only be **precisely quantified on the compact geometry of the sphere**. Without normalize the theoretical framework doesn't even apply.

Section 10 below will show this geometry **emerging spontaneously** in the toy experiment via the similarity heatmap.

---

# 6. Text Encoder: Causal Transformer + EOS Feature

CLIP's text encoder is a **GPT-style** Transformer (causal mask), not BERT-style (bidirectional). This section is about two design choices.

## 6.1 Why CLIP's Text Encoder Is Causal

This is **engineering inertia + pragmatism**, not theoretical necessity:

1. **Reuse the GPT training stack**: in 2021, OpenAI's internal GPT codebases were all causal Transformer-based, directly inherited
2. **Keep the door open for LM as a byproduct**: causal allows the text encoder to do next-token prediction in parallel (CLIP doesn't add an LM loss, but the option remains)
3. **Matches text's sequential nature**: text has a natural temporal order, causal is at least reasonable

Later work (BLIP, some SigLIP variants) uses bidirectional and gets slightly better retrieval performance (1-2 pp), but causal stayed the de facto standard because CLIP's checkpoints are too widespread.

## 6.2 Causal Mask: Upper-Triangle -inf on the Key Axis

```python
def build_causal_mask(L):
    mask = torch.full((L, L), float('-inf'))
    mask = torch.triu(mask, diagonal=1)
    return mask
```

Shape (L, L), **strict upper triangle is -inf** (main diagonal stays 0 — a query must be able to see itself, or softmax produces NaN rows):

```text
        k=0    k=1    k=2    k=3
q=0  [  0   -inf   -inf   -inf ]   ← position 0 sees only itself
q=1  [  0    0    -inf   -inf ]
q=2  [  0    0     0    -inf ]
q=3  [  0    0     0     0   ]   ← last position sees everything past
```

The mask is **additive** — added straight into scaled-dot scores:

```python
S = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
if attn_mask is not None:
    S = S + attn_mask                  # broadcast (L,L) → (B,h,L,L)
attn = F.softmax(S, dim=-1)
```

This differs from the padding mask in the Transformer/ViT stages (multiplicative `masked_fill`) — additive is more general; causal / padding / custom masks all can be summed together.

## 6.3 EOS Feature Extraction: CLIP's Sneakiest Detail

ViT takes its sentence feature from the **CLS token** (the position-0 output). What does CLIP's text encoder use?

**The EOS token's output**:

```python
# After tokenization:
#   tokens = [SOS, "a", "photo", "of", "a", "cat", EOS, PAD, PAD, ...]
#   positions: 0     1     2    3    4    5    6   7    8

# After running the text transformer we have x: (B, L, d)
text_features = x[torch.arange(B), eos_pos]   # (B, d)
```

**Why EOS instead of SOS (position 0)?**

Back to causal mask:
- Position 0 (SOS) **only sees itself** when encoded, completely uninformed about the whole sentence
- EOS at encoding time **sees all preceding tokens**
- So EOS is **the only position that aggregates the whole sentence's information**

> This is a direct consequence of causal attention — CLS-at-start makes no sense in a causal model; we must use "summary-at-end" instead. BERT can use CLS at the start because it is bidirectional, so position 0 sees every token.

## 6.4 A Causality Confusion Worth Naming

> **Cause**: CLIP picked causal mask (engineering reasons) →
> **Effect**: SOS position can't see what's behind it →
> **Necessary consequence**: must use the EOS position as the summary

**Not**: "because the first token isn't important → so use causal → so take EOS".

If someone built a bidirectional CLIP (which some SigLIP variants do), it could use CLS-at-position-0 fine. **CLS and EOS are functionally equivalent (both are "the position that aggregates the whole sequence") — the difference is determined by mask choice, not by linguistics.**

---

# 7. Image Encoder: ViT Reuse, End with Projection

The image encoder is basically the previous note's ViT, except **drop the classification head and replace with `Linear(d_model, d_shared, bias=False)`**:

```python
class ImageEncoderViT(nn.Module):
    def forward(self, images):
        x = self.patch_embed(images)              # (B, N, d_model)
        B = x.shape[0]
        cls = self.cls_token.expand(B, -1, -1)
        x = torch.cat([cls, x], dim=1)            # (B, N+1, d_model)
        x = x + self.pos_embed
        for blk in self.blocks:
            x = blk(x)                            # bidirectional, no mask
        x = self.final_norm(x)
        cls_out = x[:, 0]                          # (B, d_model)
        return self.image_projection(cls_out)     # (B, d_shared)
```

The only new piece is the trailing `image_projection`:

```python
self.image_projection = nn.Linear(d_model, d_shared, bias=False)
```

**Why bias=False**: matches `text_projection` — in the shared space we care about direction (cosine geometry), and a bias introduces an offset that breaks that geometry.

**Why a projection at all (even when d_model = d_shared)**:
1. The image encoder's and text encoder's internal d_model don't have to match; projection aligns them to a single d_shared
2. The projection is the only independently-tunable bridge between the image and text representation spaces; during training it does the work of pulling the two spaces into alignment

## Side-by-Side Tower Structure

| Stage | Text | Image |
|---|---|---|
| Input | (B, L) token ids | (B, 3, 32, 32) |
| Tokenization | `Embedding` + learned PE | PatchEmbedConv + CLS + learned PE |
| Backbone | $N \times$ CausalEncoderBlock | $N \times$ EncoderBlock (bidirectional) |
| Pooling | `x[arange(B), eos_pos]` | `x[:, 0]` (CLS slice) |
| Projection | `Linear(d_model, d_shared, bias=False)` | `Linear(d_model, d_shared, bias=False)` |
| Output | (B, d_shared) | (B, d_shared) |

**Alignment happens at the `d_shared` layer** — until then each tower runs in its own internal representation space; from projection onward they share a space.

---

# 8. CLIPModel: The Complete Dual-Tower Forward

Stringing all the pieces together, a CLIP training step is six lines:

```python
# 1. Encode each tower
image_features = image_encoder(images)              # (B, d_shared)
text_features  = text_encoder(tokens, eos_pos)      # (B, d_shared)

# 2. L2 normalize → unit sphere
image_features = F.normalize(image_features, dim=-1)
text_features  = F.normalize(text_features,  dim=-1)

# 3. Clamp + exp to get 1/τ
with torch.no_grad():
    self.logit_scale.clamp_(max=self.max_logit_scale)
logit_scale = self.logit_scale.exp()

# 4. Similarity matrix
logits_per_image = logit_scale * image_features @ text_features.T   # (B, B)
logits_per_text  = logits_per_image.T

# 5. Symmetric InfoNCE
labels = torch.arange(B, device=logits.device)
loss = (F.cross_entropy(logits_per_image, labels)
        + F.cross_entropy(logits_per_text,  labels)) / 2

# 6. Backprop + step
loss.backward()
optimizer.step()
```

These six lines map cleanly onto the math in §2-§5.

---

# 9. Experiment: CIFAR-10 + Template Captions (Pipeline Sanity)

Real CLIP retrieval training needs (image, real-caption) pairs — Flickr8k or COCO. But at toy scale, we use **CIFAR-10 + templated captions** as a sanity check. The goal isn't to actually learn retrieval, just to verify:

1. The forward + InfoNCE + backward chain works
2. Loss actually decreases
3. The similarity matrix diagonal actually brightens

## 9.1 Data Strategy: Randomly Sampled Template Captions

```python
TEMPLATES = [
    "a photo of a {}",
    "a blurry photo of a {}",
    "a black and white photo of a {}",
    "a low quality photo of a {}",
    "a close up of a {}",
    "a photo of one {}",
    "a small photo of a {}",
]
CIFAR10_CLASSES = ["airplane", "automobile", "bird", "cat", "deer",
                    "dog", "frog", "horse", "ship", "truck"]
```

Each image randomly picks a template in `__getitem__`, so the same dog image gets "a photo of a dog" this epoch and possibly "a blurry photo of a dog" next epoch — exposing the model to the stability of the word "dog" across caption contexts, which is key to learning discriminative features in the CLIP recipe.

## 9.2 Config

```text
img_size=32, patch_size=4, in_chans=3
img_d_model=128, img_depth=2, img_num_heads=4
txt_d_model=128, txt_depth=2, txt_num_heads=4, max_len=16
d_shared=128
init_temperature=0.2, max_logit_scale=log(20)
AdamW(lr=3e-4, weight_decay=0.01) + CosineAnnealingLR
batch=128, epochs=3, device=cpu
```

## 9.3 Training Curve

```text
epoch  train_loss  test_loss  sim_diag  sim_off   sim_gap   τ        lr
0      (baseline)  4.852      0.000     0.000     0.000     0.200    -
1      4.300       4.062      +0.536    +0.180    +0.356    0.198    2.25e-4
2      3.984       3.937      +0.571    +0.143    +0.428    0.194    7.5e-5
3      3.850       3.818      +0.590    +0.144    +0.447    0.191    0.0
```

3 epochs on CPU in ~4 minutes; sim_gap moves from 0 to +0.447.

## 9.4 Three Pass/Fail Criteria

| Criterion | Expected | Actual | Verdict |
|---|---|---|---|
| `test_loss` significantly < baseline | < $\log(128) \approx 4.85$ | **3.82** | ✅ |
| `sim_gap` > 0 and monotonically increasing | > 0.05 | 0.36 → 0.43 → 0.45 | ✅ |
| τ doesn't blow up | not at clamp ceiling | 0.20 → 0.19 | ✅ |

> Matched-pair cosine ≈ 0.59, mismatched-pair cosine ≈ 0.14. On the 128-dim sphere there is **a 0.45 cosine margin between positives and negatives** — already enough to do retrieval / zero-shot classification.

## 9.5 A Subtle "Tied Positives" Problem

CIFAR-10 has only 10 classes and 7 templates, giving $7 \times 10 = 70$ distinct captions. In a batch of 128 there must be many caption collisions — say 5 dog images in the batch, possibly 2 of them assigned the **identical** caption "a photo of a dog".

InfoNCE's `labels = arange(B)` becomes **label-noisy** here — the model pulling dog_image_2 toward dog_image_1's caption row (which is actually the right thing, since the captions are identical) gets penalized as "misclassified" by row-softmax.

This is why sim_gap's growth tapers after 0.45 — the theoretical ceiling is capped by tied positives. With Flickr8k (M5 territory), every image has a unique caption and this problem disappears.

**Insight into the CLIP original**: this is also why OpenAI used 400M real captions instead of templates. Real captions barely repeat; label noise is negligible.

---

# 10. Visualization: Semantic Geometry Spontaneously Emerges on the Sphere

Loading the trained best.pt, taking one image per CIFAR-10 class with the same `"a photo of a {class}"` template, we plot two similarity heatmaps — one at random init, one after training.

![CLIP similarity matrix before vs after training on CIFAR-10](similarity.png)

## 10.1 Left (Before Training): Uniform Noise

```text
diag = +0.044    off = +0.044    gap = -0.001
```

A uniformly pale blue map — at random init, both image and text features are random points on the sphere, and the inner product of two random unit vectors in 128 dimensions has expectation 0. This is the **"learn nothing" baseline**, exactly as predicted.

## 10.2 Right (After Training): Clear Diagonal + Semantic Structure

```text
diag = +0.678    off = +0.051    gap = +0.627
```

Note the right gap of 0.627 is higher than the batch-level 0.447 reported during training — the visualization uses one image per class, so there is **no tied-positives problem**, and we see the actual "no-label-noise" theoretical ceiling.

But the right map's most striking feature is **not** the diagonal — it's the **semantic structure off the diagonal**. Look at a few pairs:

**Vehicle cluster** (airplane / automobile / ship / truck mutually positive):
- `automobile × truck`: clearly positive → the model learned "both are vehicles"
- `airplane × ship`: weakly positive → both have sky/water/horizon backgrounds
- `truck × automobile`: clearly positive → similar shape and color

**Animal cluster** (bird / cat / deer / dog / frog / horse mutually positive):
- `bird × cat` / `bird × dog`: positive → small furry creatures
- `dog × cat`: positive → the classic "cats look like dogs"
- `horse × deer`: positive → large hoofed mammals

**The two most negatively correlated**:
- `frog × airplane`: deep blue (< -0.4) — the two semantically furthest concepts in CIFAR-10

## 10.3 This Is What Alignment + Uniformity Looks Like

> The trained feature space is not "10 isolated points + 90 unrelated points" — it is **10 points naturally distributed across the sphere by semantic distance** — animals on one side, vehicles on the other, frog and airplane at the two poles.

This is CLIP's core magic: **it doesn't learn captions as labels — it distills the semantic geometry of the caption space into the image feature space**. Even with just 3 training epochs, 7 templates, and a CPU, that geometry surfaces — and **nobody told the model that frog and airplane should sit at opposite poles**; that structure is learned purely by InfoNCE + L2 normalize.

CLIP trained on 400M pairs produces a feature space with the same geometry, only finer, more robust, and higher-dimensional.

---

# 11. Wrap-Up

## Concept Checklist

- CLIP's contribution is **a paradigm (natural language replaces labels)**, not an architecture — every component is off-the-shelf
- InfoNCE re-expresses "finding a match" as **B-way cross-entropy classification** — the denominator is the "competition pool", deciding what the model is forced to differ from
- Symmetric loss simultaneously constrains the similarity matrix's **row structure and column structure**; single direction has blind spots
- Temperature τ is a softmax sharpness knob, **not equivalent to learning rate** — it changes the learned geometry, not just speed
- Batch size and τ form contrastive learning's **core coupling** — small batch → large τ, large batch → small τ
- L2 normalize turns inner product into cosine and puts contrastive learning on the **unit sphere** — and must coexist with temperature
- CLIP's text encoder uses causal because of engineering inertia (GPT stack reuse) — **therefore** it must use the **EOS feature**, not SOS
- The image encoder is basically ViT, **with the classification head replaced by `Linear(d_model, d_shared, bias=False)`**
- "Tied positives" is an inherent limit of template captions; real caption datasets don't suffer from it

---

# Reforge Repository

Full code: [github.com/r1skers/paper-reforge/tree/main/CLIP](https://github.com/r1skers/paper-reforge/tree/main/CLIP)

```text
CLIP/
├── src/
│   ├── attention.py            <- vendored (from Transformer/)
│   ├── transformer_block.py    <- vendored (from Transformer/)
│   ├── patch_embed.py          <- vendored (from ViT/)
│   ├── tokenizer.py            <- minimal word-level tokenizer
│   ├── causal_attention.py     <- CausalMultiHeadSelfAttention (additive mask)
│   ├── text_encoder.py         <- TextTransformer (causal + EOS feature)
│   ├── image_encoder.py        <- ImageEncoderViT (ViT reuse, projection at the end)
│   ├── clip_model.py           <- CLIPModel (dual-tower + L2 normalize + learnable τ)
│   ├── loss.py                 <- InfoNCE PyTorch (F.cross_entropy × 2 averaged)
│   └── data.py                 <- CIFAR10ClipDataset (random template captions)
├── tests/
│   ├── test_tokenizer.py
│   ├── test_text_encoder.py    <- includes the causal-property key test
│   ├── test_image_encoder.py
│   ├── test_clip_model.py      <- includes logit_scale clamp + grad-flow tests
│   └── test_loss.py            <- includes boundary + symmetric-in-transpose tests
├── experiments/
│   ├── train_cifar.py          <- CIFAR-10 template sanity training
│   └── visualize_similarity.py <- before/after similarity heatmap
└── outputs/
    └── smoke/                   <- log.csv + best.pt + similarity.png
```

**Design principle**: the CLIP module is fully self-contained. All dependencies (EncoderBlock, PatchEmbedConv, etc.) are vendored into the local `src/`, with no `sys.path.append` crossing into `Transformer/` or `ViT/`. The cost is ~200 LOC of duplication; the reward is that CLIP can be lifted out and shown as a standalone portfolio piece.
