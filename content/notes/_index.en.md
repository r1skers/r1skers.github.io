---
title: "Notes"
description: "Current research threads, topic dossiers, and a foundations library."
summary: "Problem-driven reading paths with canonical subject homes in mathematics, machine learning, systems, and engineering."
aliases:
  - /en/study-notes/
  - /en/notebook/
---

This section keeps two complementary organizations. Foundations retain a canonical subject home, while research material is reassembled into problem-driven topic dossiers. An article is stored once but may participate in several reading paths.

<details open>
<summary><strong>Current Research Thread</strong></summary>

### Error Analysis: From Approximation to Reliable Computation

Starting from a reference, approximation, and metric, this thread tracks how errors are defined, introduced, propagated, estimated, controlled, and traded against cost.

- [**Thread overview** — Error Analysis: From Approximation to Reliable Computation](/en/notes/systems/error-analysis/)
- [**Topic 1: Taylor Expansion** — From remainders to error control](/en/notes/systems/error-analysis/taylor-expansion/)
- **Topic 2: Softmax Numerical Error (in progress)** — Operation-level error from max subtraction, exp, accumulation, division, casting, and evaluation order.

<details class="note-subgroup">
<summary><strong>The three Taylor chapters</strong></summary>

**I. Error language and representation**

- [Taylor 1 — (R), (O), (o), and error bounds](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/)
- [Taylor 2 — Lagrange, integral, and Peano remainders](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-2-remainder-forms/)

**II. Bounds and propagation**

- [Taylor 3 — Why a correct bound can still be unconvincing](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/)
- [Taylor 4 — How errors propagate](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/)

**III. Error budgets and control**

- [Taylor 5 — From step size to Richardson extrapolation](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/)
- [Taylor 6 — Putting noise into the error budget](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-6-statistical-noise/)

</details>

</details>

<details open>
<summary><strong>Topic Dossiers</strong></summary>

Topic dossiers assemble material from Notes, Artifacts, and code repositories into coherent problem chains without duplicating content or changing existing URLs.

- [**Dossier index**](/en/notes/topics/)
- [**IO-Aware Attention**](/en/notes/topics/io-aware-attention/) — Online Softmax, FlashAttention, tiled reproduction, numerical error, and sparse-approximation error.
- [**Variational Autoencoders**](/en/notes/topics/variational-autoencoders/) — ELBO, reparameterization, minimal reproduction, and CNN-VAE.
- [**Representation Geometry**](/en/notes/topics/representation-geometry/) — PCA, whitening, clustering evaluation, and BERT representation probes.
- [**Inverse Modeling and Reliable Computation**](/en/notes/topics/inverse-modeling/) — Forward models, observations, inversion, regularization, credibility, and project validation.

</details>

<details>
<summary><strong>Foundations · Mathematics</strong></summary>

<details class="note-subgroup">
<summary><strong>Linear Algebra</strong></summary>

[Part 0 roadmap](/notes/math/linear-algebra/note-la-0-foundation/) connects linear maps and coordinates to spaces, equations, spectra, factorizations, approximation, stability, and structured computation.

- [Part 1 — Vector spaces, bases, rank, and the four fundamental subspaces](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)
- [Part 2 — Inner products, orthogonal projection, and least squares](/notes/math/linear-algebra/note-la-2-inner-product-projection/)
- [Part 3 — Linear equations, pseudoinverses, and minimum-norm solutions](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)
- [Part 4 — Eigenvalues, invariant subspaces, Schur, and Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)
- [Part 5 — Symmetry, normality, quadratic forms, and the spectral theorem](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)
- [Part 6 — LU, QR, Cholesky, SVD, and polar decomposition](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)
- [Part 7 — Low-rank approximation, PCA, and structured approximation](/notes/math/linear-algebra/note-la-7-low-rank-pca/)
- [Part 8 — Conditioning, numerical stability, and regularization](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)
- [Part 9 — Matrix functions, iterative methods, and structured computation](/notes/math/linear-algebra/note-la-9-matrix-functions-iterative-structured/)

</details>

<details class="note-subgroup">
<summary><strong>Real and Functional Analysis</strong></summary>

- [Part 1 — Convergence, uniqueness, boundedness, and Cauchy sequences](/en/notes/math/real-analysis/note-ra-1-convergence-cauchy/)
- [Part 2 — The supremum axiom, monotone convergence, and completeness](/en/notes/math/real-analysis/note-ra-2-supremum-completeness/)
- [Part 3 — Metric, normed, and Hilbert spaces with Fourier foundations](/en/notes/math/real-analysis/note-ra-3-metric-normed-hilbert-fourier/)
- [Part 4 — Bounded operators, dual spaces, spectra, and compact operators](/en/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact/)
- [Part 5 — Weak convergence, Hahn–Banach, and Banach fixed points](/en/notes/math/real-analysis/note-ra-5-weak-convergence-hahn-banach-fixed-point/)
- [Part 6 — Measures, measurable functions, and the Lebesgue integral](/en/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral/)
- [Part 7 — MCT, Fatou, DCT, and (L^p) spaces](/en/notes/math/real-analysis/note-ra-7-convergence-theorems-lp/)

</details>

<details class="note-subgroup">
<summary><strong>Optimization and Variational Methods</strong></summary>

- [Part 0 roadmap — From local geometry to constraints and variation](/notes/math/optimization-variation/note-opt-0-roadmap/)
- [Part 1 — Gradients, Hessians, Taylor expansion, and convexity](/notes/math/optimization-variation/note-opt-1-gradient-hessian-convexity/)
- [Part 2 — Gradient descent, convergence rates, and spectral filtering](/notes/math/optimization-variation/note-opt-2-gradient-descent/)
- [Part 3 — Newton, damping, and quasi-Newton methods](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)
- [Constraints and variation — The Lagrangian function and operator](/en/notes/math/optimization-variation/note-opt-lagrangian/)

</details>

<details class="note-subgroup">
<summary><strong>Probability and Statistics</strong></summary>

- [Part 0 roadmap — From probability spaces to inference and stochastic processes](/notes/math/probability/note-prob-0-roadmap/)
- [Part 1 — Probability spaces, conditioning, independence, and Bayes](/notes/math/probability/note-prob-1-probability-space-events/)
- [Part 2 — Random variables, CDFs, and distribution families](/notes/math/probability/note-prob-2-random-variables-distributions/)
- [Part 3 — Expectation, joint distributions, conditioning, and variance decomposition](/notes/math/probability/note-prob-3-expectation-conditioning/)
- [Part 4 — Modes of convergence, LLN, CLT, and concentration](/notes/math/probability/note-prob-4-limits-concentration/)
- [Part 5 — Likelihood, MLE, MAP, intervals, tests, and EM](/notes/math/probability/note-prob-5-statistical-inference-em/)
- [Part 6 — Stochastic processes, Markov chains, queues, and tail latency](/notes/math/probability/note-prob-6-stochastic-processes-queues/)

</details>

<details class="note-subgroup">
<summary><strong>Information Theory and Information Geometry</strong></summary>

The [shared roadmap](/notes/math/information-theory/note-it-0-roadmap/) begins with entropy, cross-entropy, KL, and mutual information before branching into Information Geometry and Shannon / Source Coding.

- [Information Theory 1 — Self-information, entropy, and uncertainty](/notes/math/information-theory/note-it-1-entropy-self-information/)
- [Information Theory 2 — Joint entropy, conditional entropy, and chain rules](/notes/math/information-theory/note-it-2-joint-conditional-entropy/)
- [Information Theory 3 — Cross-entropy, KL divergence, and mutual information](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)
- [Information Geometry G1 — Score Function and Fisher Information](/notes/math/information-geometry/note-ig-1-score-fisher/)
- [Information Geometry G2 — KL, Natural Gradient, and K-FAC](/notes/math/information-geometry/note-ig-2-kl-natural-gradient/)
- [Information Geometry G3 — Exponential families and log-partition](/notes/math/information-geometry/note-ig-3-exponential-family/)
- [Information Geometry G4 — Legendre duality, Bregman divergence, and KL](/notes/math/information-geometry/note-ig-4-dual-bregman/)
- [Shannon S1 — AEP, typical sets, and the asymptotic meaning of entropy](/notes/math/information-theory/note-it-4-aep-typical-set/)

</details>

<details class="note-subgroup">
<summary><strong>Signals, Systems, and Complex Analysis</strong></summary>

- [Fourier Transform](/en/notes/math/linear-systems/note-linsys-1-fourier/)
- [Laplace Transform](/en/notes/math/linear-systems/note-linsys-2-laplace/)
- [RLC circuits through differential equations and Laplace transforms](/en/notes/math/linear-systems/note-linsys-3-laplace-pde/)
- [Complex functions: from analyticity to residues](/en/notes/math/complex-analysis/note-math-1-complex-analysis/)

</details>

</details>

<details>
<summary><strong>Foundations · Machine Learning</strong></summary>

<details class="note-subgroup">
<summary><strong>Unsupervised Learning and Representation Geometry</strong></summary>

- [Roadmap and core questions](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)
- [PCA, Whitening, and neighborhood visualization](/en/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
- [Spectral Embedding and Spectral Clustering](/en/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
- [KMeans, GMM, hierarchical clustering, and DBSCAN](/en/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
- [Clustering evaluation, external metrics, and stability](/en/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)
- [Topic dossier: Representation Geometry](/en/notes/topics/representation-geometry/)

</details>

<details class="note-subgroup">
<summary><strong>CNN and Visual Representation</strong></summary>

- [From LeNet-5 to modern CNNs](/en/notes/ml/cnn/note-ml-cnn-1-lenet-to-modern/)
- [AlexNet: The beginning of deep vision](/en/notes/ml/cnn/note-ml-cnn-2-alexnet/)
- [VGG: Depth and small convolution kernels](/en/notes/ml/cnn/note-ml-cnn-3-vgg/)
- [ResNet: Residual learning and degradation](/en/notes/ml/cnn/note-ml-cnn-4-resnet/)

</details>

<details class="note-subgroup">
<summary><strong>Transformer, ViT, and CLIP</strong></summary>

- [Transformer: From attention to the encoder](/en/notes/ml/transformer-vit-clip/note-ml-transformer-1-attention-to-encoder/)
- [ViT: From image patches to attention classification](/en/notes/ml/transformer-vit-clip/note-ml-vit-1-patches-to-attention/)
- [CLIP: From contrastive learning to a shared image-text space](/en/notes/ml/transformer-vit-clip/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details class="note-subgroup">
<summary><strong>Generative Models</strong></summary>

- [Topic dossier: Variational Autoencoders](/en/notes/topics/variational-autoencoders/)
- [The basic idea of VAE and the ELBO derivation](/en/notes/ml/generative-models/note-ml-gen-1-vae-elbo/)
- [A minimal VAE reproduction](/en/notes/ml/generative-models/note-ml-gen-2-vae-minimal/)
- [CNN-VAE: From MLP to convolution](/en/notes/ml/generative-models/note-ml-gen-3-cnn-vae/)

</details>

</details>

<details>
<summary><strong>Foundations · Systems, Physics, and Engineering</strong></summary>

<details class="note-subgroup">
<summary><strong>Systems and Computation</strong></summary>

- [Topic dossier: IO-Aware Attention](/en/notes/topics/io-aware-attention/)
- [Topic dossier: Inverse Modeling and Reliable Computation](/en/notes/topics/inverse-modeling/)
- [Error Analysis research thread](/en/notes/systems/error-analysis/)

</details>

<details class="note-subgroup">
<summary><strong>Quantum Mechanics</strong></summary>

- [From the Schrödinger equation to wave functions](/en/notes/science/quantum-mechanics/note-qm-1-schrodinger/)
- [How electrons are distributed](/en/notes/science/quantum-mechanics/note-qm-2-fermions/)

</details>

<details class="note-subgroup">
<summary><strong>Rock Mechanics</strong></summary>

- [Mineral composition, structural features, and discontinuity basics](/en/notes/science/rock-mechanics/note-rock-mech-1-basics/)

</details>

</details>

<details>
<summary><strong>Problems and Plans</strong></summary>

- [Real Analysis problems](/en/notes/problems/real-analysis/)
- [Optimization and Variational Methods problems](/en/notes/problems/optimization-variation/)
- [Miscellaneous problems](/en/notes/problems/misc/)

Planned foundation branches include GANs, diffusion models, probabilistic graphical models, electromagnetism, and circuits. A research topic enters the “current research” area only after it develops a clear question and evidence chain.

</details>
