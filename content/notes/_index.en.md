---
title: "Notes"
description: "Course notes and self-study records."
summary: "An index of course notes and self-study records."
---

<details open>
<summary><strong>Mathematics</strong></summary>

<details class="note-subgroup">
<summary><strong>Linear Algebra</strong></summary>

> 🗺️ [**Unified Knowledge Map**](https://r1skers.github.io/r1skers-knowledge-map/) — Standalone knowledge map site with search, draggable canvas, node cards, and shareable `?node=` URLs.

- [**Part 0** — Matrix, Linear Map, and Coordinate Language](/notes/math/linear-algebra/note-la-0-foundation/) — The series foundation: matrix as the coordinate representation of a linear map

</details>

<details class="note-subgroup">
<summary><strong>Real Analysis and Functional Analysis</strong></summary>

- [**Real Analysis 1** — Convergence, Uniqueness, Boundedness, and Cauchy Sequences](/en/notes/math/real-analysis/note-ra-1-convergence-cauchy)
- [**Real Analysis 2** — The Supremum Axiom, Monotone Convergence, and the Equivalence Chain of Completeness](/en/notes/math/real-analysis/note-ra-2-supremum-completeness)
- [**Real Analysis 3** — Metric Spaces, Normed Spaces, Hilbert Spaces, and the Foundations of Fourier](/en/notes/math/real-analysis/note-ra-3-metric-normed-hilbert-fourier)
- [**Real Analysis 4** — Bounded Linear Operators, Dual Space, Spectral Theory, and Compact Operators](/en/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact)
- [**Real Analysis 5** — Weak Convergence, Hahn-Banach, and the Banach Fixed-Point Theorem](/en/notes/math/real-analysis/note-ra-5-weak-convergence-hahn-banach-fixed-point)
- [**Real Analysis 6** — Measures, Measurable Functions, and the Lebesgue Integral](/en/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral)
- [**Real Analysis 7** — MCT, Fatou, DCT, and L^p Spaces](/en/notes/math/real-analysis/note-ra-7-convergence-theorems-lp)

</details>

<details class="note-subgroup">
<summary><strong>Fourier / Laplace / Linear Systems</strong></summary>

This branch hangs under real and functional analysis: Hilbert spaces, orthogonal expansions, and operators become the transform methods used in signals and systems.

- [**Part 1** — Fourier Transform](/en/notes/math/linear-systems/note-linsys-1-fourier)
- [**Part 2** — Laplace Transform](/en/notes/math/linear-systems/note-linsys-2-laplace)
- [**Part 3** — RLC Circuit Analysis: Differential Equations vs. Laplace Transform](/en/notes/math/linear-systems/note-linsys-3-laplace-pde)

</details>

<details class="note-subgroup">
<summary><strong>Probability and Statistics</strong></summary>

- Probability Theory
- Mathematical Statistics
- Stochastic Processes

</details>

<details class="note-subgroup">
<summary><strong>Complex Analysis</strong></summary>

- [**Complex Analysis 1** — Complex Analysis](/en/notes/math/complex-analysis/note-math-1-complex-analysis)

</details>

</details>

<details>
<summary><strong>Machine Learning</strong></summary>

<details class="note-subgroup">
<summary><strong>Unsupervised Learning and Representation Geometry</strong></summary>

Starting from PCA and whitening, this series builds a toolkit for analyzing embedding spaces through direction, scale, neighborhood graphs, clustering assumptions, and stability.

- [**0. Roadmap** — Core Questions in Unsupervised Learning](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)
- [**1. PCA / Whitening** — Principal Directions, Scale Correction, and Neighborhood Visualization](/en/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
- [**2. Spectral Methods** — Graph Laplacians, Structural Embeddings, and Spectral Clustering](/en/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
- [**3. Clustering Algorithms** — KMeans, GMM, Hierarchical Clustering, and DBSCAN](/en/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
- [**4. Clustering Evaluation** — Internal Metrics, External Metrics, and Stability](/en/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)

</details>

<details class="note-subgroup">
<summary><strong>CNN and Visual Representation</strong></summary>

This series follows CNNs from early handwritten digit recognition to large-scale ImageNet classification and then to deep visual backbones.

- [**1. LeNet-5** — From LeNet-5 to Modern CNN](/en/notes/ml/cnn/note-ml-cnn-1-lenet-to-modern/)
- [**2. AlexNet** — The Starting Point of Deep Visual Learning](/en/notes/ml/cnn/note-ml-cnn-2-alexnet/)
- [**3. VGG** — Depth and Small Convolution Filters](/en/notes/ml/cnn/note-ml-cnn-3-vgg/)
- [**4. ResNet** — Residual Learning and the Degradation Problem](/en/notes/ml/cnn/note-ml-cnn-4-resnet/)

</details>

<details class="note-subgroup">
<summary><strong>Transformer, ViT, and CLIP</strong></summary>

Reproduce a minimal encoder-only Transformer from self-attention and validate PE necessity, carry the same encoder over to vision tasks as ViT, then stitch the two towers into a shared space for CLIP — completing the path from unimodal to multimodal alignment.

- [**1. Transformer** — From Attention to the Encoder](/en/notes/ml/transformer-vit-clip/note-ml-transformer-1-attention-to-encoder/)
- [**2. ViT** — From Patches to Attention-Based Classification](/en/notes/ml/transformer-vit-clip/note-ml-vit-1-patches-to-attention/)
- [**3. CLIP** — From Contrastive Learning to a Shared Image-Text Space](/en/notes/ml/transformer-vit-clip/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details class="note-subgroup">
<summary><strong>Generative Models</strong></summary>

- [**1. VAE** — The Basic Idea and the ELBO](/en/notes/ml/generative-models/note-ml-gen-1-vae-elbo/)
- [**2. VAE** — A Minimal Reproduction](/en/notes/ml/generative-models/note-ml-gen-2-vae-minimal/)
- [**3. CNN-VAE** — From MLPs to Convolutional Structure](/en/notes/ml/generative-models/note-ml-gen-3-cnn-vae/)

</details>

</details>

<details>
<summary><strong>Systems and Computation</strong></summary>

<details class="note-subgroup">
<summary><strong>AI Infrastructure</strong></summary>

Starting from GPU memory hierarchy, IO-aware algorithms, and inference systems, this section tracks the low-level mechanisms that actually shape throughput, latency, and memory usage in AI infrastructure.

- [**1. FlashAttention v1** — IO-Aware Attention and Tiling Softmax](/en/notes/systems/ai-infra/note-systems-io-attn-1-flashattention/)
- [**2. Online Softmax** — Original Derivation and Top-K Fusion](/en/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/)
- [**3. Reproduce and Verify** — Implementing Tiled Attention and Verifying tiled==naive with Invariants](/en/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/)

</details>

<details class="note-subgroup">
<summary><strong>Computational Science and High-Reliability Systems Design</strong></summary>

- [**Part 1** — Problem Setup and Spatial Field Construction](/en/notes/systems/computational-science/note-csys-1-problem-spatial-field)
- [**Part 2** — From Terrain to Temporal Evolution](/en/notes/systems/computational-science/note-csys-2-terrain-to-time)
- [**Part 3** — From Full Trajectories to Observations](/en/notes/systems/computational-science/note-csys-3-trajectory-to-observation)
- [**Part 4** — From Observations to Parameter Inversion](/en/notes/systems/computational-science/note-csys-4-observation-to-inversion)
- [**Part 5** — Parameter Inversion I: Finite-Difference Gradient and Gradient Descent](/en/notes/systems/computational-science/note-csys-5-finite-diff-gradient-descent)
- [**Part 6** — Inversion Result Analysis and Parameter Credibility](/en/notes/systems/computational-science/note-csys-6-inversion-credibility)
- [**Part 7** — From Finite-Difference Gradient Descent to L-BFGS and Log-Parameterization](/en/notes/systems/computational-science/note-csys-7-lbfgs-log-parameterization)
- [**Part 8** — Regularization, Priors, and Stable Inversion](/en/notes/systems/computational-science/note-csys-8-regularization-prior)
- [**Part 9** — Smoothness Terms, Prior Terms, and Regularization Strength](/en/notes/systems/computational-science/note-csys-9-smoothness-prior-strength)
- [**Part 10** — A Full-Chain Summary from Spatial Fields to Stable Inversion](/en/notes/systems/computational-science/note-csys-10-summary)

</details>

</details>

<details>
<summary><strong>Physics and Engineering</strong></summary>

<details class="note-subgroup">
<summary><strong>Quantum Mechanics</strong></summary>

- [**Part 1** — From Schrodinger to Wave Functions](/en/notes/science/quantum-mechanics/note-qm-1-schrodinger)
- [**Part 2** — How Electrons Are Distributed](/en/notes/science/quantum-mechanics/note-qm-2-fermions)

</details>

<details class="note-subgroup">
<summary><strong>Rock Mechanics</strong></summary>

- [**Part 1** — Mineral Composition, Structural Features, and Discontinuity Basics](/en/notes/science/rock-mechanics/note-rock-mech-1-basics)

</details>

</details>

<details>
<summary><strong>Planned</strong></summary>

<details class="note-subgroup">
<summary><strong>Future Branches</strong></summary>

- GAN
- Diffusion
- Probabilistic Graphical Models
- Electromagnetism
- Electric Circuits

</details>

</details>
