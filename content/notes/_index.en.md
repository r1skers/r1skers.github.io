---
title: "Notes"
description: "Course notes and self-study records."
summary: "An index of course notes and self-study records."
---

<details open>
<summary><strong>Machine Learning</strong></summary>

### Unsupervised Learning and Representation Geometry
Starting from PCA and whitening, this series builds a toolkit for analyzing embedding spaces through direction, scale, neighborhood graphs, clustering assumptions, and stability.

- [**1. PCA / Whitening** — Principal Directions, Scale Correction, and Neighborhood Visualization](/en/notes/note-ml-unsup-1-pca-whitening/)
- [**2. Spectral Methods** — Graph Laplacians, Structural Embeddings, and Spectral Clustering](/en/notes/note-ml-unsup-2-spectral/)
- [**3. Clustering Algorithms** — KMeans, GMM, Hierarchical Clustering, and DBSCAN](/en/notes/note-ml-unsup-3-clustering-algorithms/)
- [**4. Clustering Evaluation** — Internal Metrics, External Metrics, and Stability](/en/notes/note-ml-unsup-4-cluster-evaluation/)

### Generative Models
- [**1. VAE** — The Basic Idea and the ELBO](/notes/note-ml-gen-1-vae-elbo/)
- [**2. VAE** — A Minimal Reproduction](/notes/note-ml-gen-2-vae-minimal/)
- [**3. CNN-VAE** — From MLPs to Convolutional Structure](/notes/note-ml-gen-3-cnn-vae/)

### CNN and Visual Representation
This series follows CNNs from early handwritten digit recognition to large-scale ImageNet classification and then to deep visual backbones.

- [**1. LeNet-5** — From LeNet-5 to Modern CNN](/notes/note-ml-cnn-1-lenet-to-modern/)
- [**2. AlexNet** — The Starting Point of Deep Visual Learning](/notes/note-ml-cnn-2-alexnet/)
- [**3. VGG** — Depth and Small Convolution Filters](/notes/note-ml-cnn-3-vgg/)
- [**4. ResNet** — Residual Learning and the Degradation Problem](/notes/note-ml-cnn-4-resnet/)

### Transformer, ViT, and CLIP
Reproduce a minimal encoder-only Transformer from self-attention and validate PE necessity, carry the same encoder over to vision tasks as ViT, then stitch the two towers into a shared space for CLIP — completing the path from unimodal to multimodal alignment.

- [**1. Transformer** — From Attention to the Encoder](/notes/note-ml-transformer-1-attention-to-encoder/)
- [**2. ViT** — From Patches to Attention-Based Classification](/notes/note-ml-vit-1-patches-to-attention/)
- [**3. CLIP** — From Contrastive Learning to a Shared Image-Text Space](/notes/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details>
<summary><strong>AI Infrastructure</strong></summary>

Starting from GPU memory hierarchy, IO-aware algorithms, and inference systems, this section tracks the low-level mechanisms that actually shape throughput, latency, and memory usage in AI infrastructure.

- [**1. FlashAttention v1** — IO-Aware Attention and Tiling Softmax](/notes/note-systems-io-attn-1-flashattention/)
- [**2. Online Softmax** — Original Derivation and Top-K Fusion](/notes/note-systems-io-attn-2-online-softmax/)

</details>

<details>
<summary><strong>Mathematics</strong></summary>

- [**Complex Analysis 1** — Complex Analysis](/notes/note-math-1-complex-analysis)
- [**Real Analysis 1** — Convergence, Uniqueness, Boundedness, and Cauchy Sequences](/notes/note-ra-1-convergence-cauchy)
- [**Real Analysis 2** — The Supremum Axiom, Monotone Convergence, and the Equivalence Chain of Completeness](/notes/note-ra-2-supremum-completeness)
- [**Real Analysis 3** — Metric Spaces, Normed Spaces, Hilbert Spaces, and the Foundations of Fourier](/notes/note-ra-3-metric-normed-hilbert-fourier)
- [**Real Analysis 4** — Bounded Linear Operators, Dual Space, Spectral Theory, and Compact Operators](/notes/note-ra-4-operators-dual-spectrum-compact)

</details>

<details>
<summary><strong>Linear Algebra</strong></summary>

- 🗺️ [**Unified Knowledge Map** — Interactive concept map across 8 branches (search · hover cards · shareable URLs)](/notes/note-la-map/)
- [**Part 0** — Intuition for Rank, Null Space, and SVD](/notes/note-la-0-rank-nullspace-svd)
- [**Part 1** — Singular Matrices and Parameter Identifiability](/notes/note-la-1-singular-and-identifiability)
- [**Part 2** — Regularization and Stable Inversion](/notes/note-la-2-regularization-and-stable-inversion)

</details>

<details>
<summary><strong>Linear Systems</strong></summary>

- [**Part 1** — Fourier Transform](/notes/note-linsys-1-fourier)
- [**Part 2** — Laplace Transform](/notes/note-linsys-2-laplace)
- [**Part 3** — RLC Circuit Analysis: Differential Equations vs. Laplace Transform](/notes/note-linsys-3-laplace-pde)

</details>

<details>
<summary><strong>Quantum Mechanics</strong></summary>

- [**Part 1** — From Schrödinger to Wave Functions](/notes/note-qm-1-schrodinger)
- [**Part 2** — How Electrons Are Distributed](/notes/note-qm-2-fermions)

</details>

<details>
<summary><strong>Computational Science and High-Reliability Systems Design</strong></summary>

- [**Part 1** — Problem Setup and Spatial Field Construction](/notes/note-csys-1-problem-spatial-field)
- [**Part 2** — From Terrain to Temporal Evolution](/notes/note-csys-2-terrain-to-time)
- [**Part 3** — From Full Trajectories to Observations](/notes/note-csys-3-trajectory-to-observation)
- [**Part 4** — From Observations to Parameter Inversion](/notes/note-csys-4-observation-to-inversion)
- [**Part 5** — Parameter Inversion I: Finite-Difference Gradient and Gradient Descent](/notes/note-csys-5-finite-diff-gradient-descent)
- [**Part 6** — Inversion Result Analysis and Parameter Credibility](/notes/note-csys-6-inversion-credibility)
- [**Part 7** — From Finite-Difference Gradient Descent to L-BFGS and Log-Parameterization](/notes/note-csys-7-lbfgs-log-parameterization)
- [**Part 8** — Regularization, Priors, and Stable Inversion](/notes/note-csys-8-regularization-prior)
- [**Part 9** — Smoothness Terms, Prior Terms, and Regularization Strength](/notes/note-csys-9-smoothness-prior-strength)
- [**Part 10** — A Full-Chain Summary from Spatial Fields to Stable Inversion](/notes/note-csys-10-summary)

</details>

<details>
<summary><strong>Rock Mechanics</strong></summary>

- [**Part 1** — Mineral Composition, Structural Features, and Discontinuity Basics](/notes/note-rock-mech-1-basics)

</details>

<details>
<summary><strong>Planned</strong></summary>

- GAN
- Diffusion
- Electromagnetism
- Electric Circuits

</details>
