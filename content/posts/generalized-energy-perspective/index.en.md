---
date: '2026-06-07T00:00:00+09:00'
draft: true
title: "A Generalized Energy View: Structure, Information, and Representation"
summary: "A meta-synthesis for the energy-view series: not a grand unified energy theory, but a structural comparison table across L², information, and geometry, with attention to the gaps."
description: "Starting from the Born, Ax=b, and convolution posts, this essay compares roles such as state, scalar relation, residual, weak direction, prior, and flow across L², information, and geometry."
tags: ["Information Theory", "Information Geometry", "Exponential Family", "Functional Analysis"]
categories: ["Posts"]
series: ["Energy Perspective"]
---

# Setup: Looking for Shared Structure

After writing the three posts on [Born's rule and auto-correlation](/en/posts/born-rule-autocorrelation-energy/), [the energy view of $Ax=b$](/en/posts/ax-b-energy-perspective/), and [convolution under an energy lens](/en/posts/convolution-energy-perspective/), I kept having the same feeling: in all three places, I wanted to use the word "energy." The more I thought about it, the more it felt like there might be some shared structure underneath.

Expanded slightly, the question is:

> What are the corresponding roles of state, scalar relation, intrinsic part, residual, weak direction, prior, and flow in $L^2$, information, geometry, and related domains? Similar roles may be transferable; mismatched roles may point to things not yet understood.

So this essay is more like an unfinished structural table. Its goal is: if domain A has a role, ask what the corresponding role is in domain B; if a cell is missing, ask whether the missing cell is structurally predicted, or whether it should not exist in the first place.

The iron rule stays in force:

> **"Energy" in different domains cannot be directly identified. The analogy is legitimate only after the space, metric, objective, and conservation or optimization rule have been specified.**

What this essay tries to do is turn that warning into a tool for finding questions.

# 1. The Energy-Structure Table

There are four ways to read the table.

**Horizontally**: the same role takes different names in different theories. A residual is $\|r\|^2$ in $L^2$, $D_{\mathrm{KL}}(p\Vert q)$ on the information side, and a suboptimality gap or model mismatch in optimization.

**Vertically**: each domain has its own internal chain. First there is a state space; then a scalar relation is placed on it; only after that do decomposition, residuals, weak directions, regularization, and flows make sense.

Here, "scalar relation" is not a new theory. It is just a convenient phrase: given a state, how do we compute a comparable scalar, and how can that scalar be decomposed into an intrinsic part, an explained part, and a residual part?

**Through bridges**: when two formulas look identical, it is not always an accident. Sometimes a bridge temporarily welds two columns together. The Gaussian bridge is the cleanest example.

**Through gaps**: if a role is clear in domain A but absent in domain B, there may be a research question there.

But "gap = research question" is dangerous. The gaps in Mendeleev's periodic table had predictive force because an underlying periodic law forced them to be filled. Cross-domain analogies do not automatically have that guarantee. So there are two kinds of gaps.

The first kind is a **bridge-backed gap**: a known structure forces the correspondence. A Gaussian negative log-likelihood becomes an $L^2$ residual. A Bregman divergence connects convex functions, tangent-line gaps, and residuals. Small eigenvalues connect weak directions to the need for priors. These gaps are worth pursuing.

The second kind is a **pure analogy gap**: it looks as if a corresponding role should exist, but no structure forces it. Such a gap may be genuinely empty. Asking "what is the Parseval theorem for Wasserstein distance?" is dangerous in this sense: Wasserstein distance generally does not come from an ordinary inner product, so an "orthogonal energy distribution" may simply have no counterpart there. That is not a hidden problem; it is a structural mismatch.

So the table has one rule:

> **A cell is legitimate only when we can name the structural map that forces it to exist.**

This is the iron rule in table form. It turns the energy view from a game of resemblance into a checkable structural comparison.

# 2. The Table

A rough table, as a current roadmap:

| Role | $L^2$ / Hilbert | Information / Probability | Geometry / Optimization |
|---|---|---|---|
| **State** | vector / function $x$ | distribution $p$ | parameter point / manifold point $\theta$ |
| **Total scalar relation** | $\|x\|^2$ | CE / free energy | objective / action / loss |
| **Intrinsic part** | projected energy $\|\hat x\|^2$ | entropy $H(p)$ | optimum floor / irreducible objective |
| **Residual** | $\|r\|^2$ | $D_{\mathrm{KL}}(p\Vert q)$ | suboptimality gap / model mismatch |
| **Decomposition** | orthogonal projection | variational projection / information projection | tangent-space approximation |
| **Closure** | Parseval / Pythagoras | $\mathrm{CE}=H+\mathrm{KL}$ | Taylor / Newton local model |
| **Weak direction** | small $\sigma$ | low Fisher / high uncertainty | small Hessian / Fisher eigenvalues |
| **Regularization** | Ridge / Tikhonov | prior / KL penalty | damping / trust region / prior metric |
| **Flow** | GD / Landweber | variational inference / sampling | gradient flow / natural gradient |
| **Bridge** | Gaussian quadratic case | exponential family | Fisher metric |

# 3. Reading the Roles

Start with **state and scalar relation**. Each column first chooses a state space, then places a comparable scalar relation on top of it: in $L^2$, this is the squared norm of a vector or function; on the information side, it is a distributional relation such as cross-entropy or free energy; in geometry and optimization, it is an objective, loss, or action. The relation must be scalar, otherwise comparison, optimization, and decomposition do not even get off the ground.

Then come **intrinsic part, residual, decomposition, and closure**.

The $L^2$ side is the cleanest. If $\hat x$ is the orthogonal projection of $x$ onto a subspace, and $r=x-\hat x$ lies in the orthogonal complement, then

$$
\|x\|^2=\|\hat x\|^2+\|r\|^2.
$$

This closure is not invented after the fact to balance the books. Once the orthogonal structure is fixed, it follows from Pythagoras. Parseval says the same thing: after changing to an orthonormal basis, the total energy is merely redistributed across modes.

The information side also has an exact decomposition:

$$
\mathrm{CE}(p,q)=H(p)+D_{\mathrm{KL}}(p\Vert q).
$$

Here $p$ is the true distribution and $q$ is the model distribution. Cross-entropy is the total average code length, $H(p)$ is the irreducible floor of the true distribution itself, and the extra cost is KL. When the data distribution is fixed, minimizing cross-entropy is equivalent to minimizing KL.

This resembles the $L^2$ Pythagorean relation in shape: total = intrinsic + residual. But it is **not** the same Pythagorean theorem. KL is asymmetric, and it is not a distance induced by an ordinary inner product. Deeper down, information geometry has its own KL-style Pythagorean theorems under certain projection structures, but this essay does not develop that line. The only point needed here is: **the information side has exact bookkeeping of its own; it is not merely an approximation borrowed from Gaussians.**

The geometry / optimization side is more local. Taylor expansion, Newton, Gauss-Newton, and natural gradient all do something similar: near a state, they build a local model that tells us how expensive it is to move in each direction. The closure here is not a global exact identity like in the first two columns; it is more often a local quadratic model.

Now look at **weak directions and regularization**. This is one of the most transferable rows.

In $L^2$ / SVD, small $\sigma$ directions are weakly constrained by the data. In inversion, $1/\sigma$ amplifies noise. Ridge / Tikhonov lays an energy floor in those directions.

On the information and geometry sides, the counterparts are low Fisher, flat Hessian, and high-uncertainty directions. The data does not tell us how to move there, so information must come from outside. That outside information is a prior, a regularizer, a trust region, damping, early stopping, or a structural assumption.

A useful portable sentence is:

> **Weak directions are directions underconstrained by data; regularization is buying prior information in those directions.**

So whenever a column shows a small eigenvalue, a flat direction, or high uncertainty, the next question should be: what prior is being injected here?

Finally, **flow**. Once a scalar relation is given a clock, its fate is determined by the evolution rule, not by the relation itself. In a conservative flow, $dE/dt=0$ and energy converts between terms. In a dissipative flow, $dE/dt\le 0$ and the modeled relation moves downward. Machine-learning training is usually closer to a dissipative flow than to a conservative one.

# 4. Known Bridges

The first bridge is the **Gaussian quadratic case**:

$$
-\log\mathcal N(x;\mu,\sigma^2)=\frac{1}{2\sigma^2}\|x-\mu\|^2+\text{const}.
$$

The left side is an information-side negative log probability, and the right side is an $L^2$ quadratic residual. This equality matters a lot, but it is a gift from the Gaussian bridge, not a universal truth. Once we leave that bridge, the information-side scalar relation still exists, but it is no longer identical to the $L^2$ orthogonal Pythagorean relation.

The second bridge is the alignment **Ridge = Wiener = MMSE**. Under a linear Gaussian observation model, quadratic loss, and the corresponding prior and noise assumptions, the same solution can be read as Ridge in the Fourier basis and as Gaussian MMSE. This is one of the cleanest examples of a bridge-backed cell.

The third bridge is the **Fisher metric**. It connects KL on the information side with curvature on the geometry side:

$$
D_{\mathrm{KL}}(p_\theta\Vert p_{\theta+d\theta})
\approx
\frac12 d\theta^\top I(\theta)d\theta.
$$

This is still a local quadratic approximation; it does not turn global KL into Euclidean distance. But it explains why Fisher, natural gradient, Hessian-like curvature, and local KL often appear together.

These bridges give the table predictive force. It is not just "these things look similar"; there is actual structure pushing cells together.

# 5. Gaps: Where the Table Becomes Useful

There are a few interesting gaps in the current table.

**1. A residual spectrum on the information side?**

The $L^2$ residual can be decomposed along singular directions or Fourier modes:

$$
\|r\|^2=\sum_i |r_i|^2.
$$

If KL is an information-side residual, can it be decomposed along Fisher eigen-directions, latent dimensions, or representation modes? This is not made up from nothing: the local quadratic form of KL is supported by Fisher. The real question is when such a decomposition is meaningful, and when it is merely a local approximation.

**2. A non-Gaussian Wiener counterpart?**

Gaussian assumptions align Ridge, Wiener, and MMSE. What happens under another likelihood or prior? A Laplace prior pushes toward $\ell_1$ and sparsity; a Poisson likelihood changes the residual structure away from simple squared error. The question is not "is there another Wiener formula?" but rather: under non-Gaussian assumptions, how do frequency-domain inversion, priors, and estimation criteria realign?

**3. Spectral energy distribution in representation space?**

Fourier has a clear energy distribution, PCA has a variance spectrum, and SVD has a singular spectrum. Is there an analogous energy distribution in representation space?

This cell already has one piece of evidence. In the [BERT representation probe series](/en/artifacts/05-bert-representation-probes/), low-variance directions can carry discriminative information. Methods that respect raw variance may miss it, while direction-reweighting methods such as whitening, $S_W^{-1}$, or learned weights can read it. The [Fisher view](/en/artifacts/05-3-fisher-view/) makes this split especially clear: the Fisher geometry scalar and the LDA classifier diverge on random-init representations. That matches the rows on weak directions, reweighting, and priors.

This means the table is not purely decorative. It has already helped explain a real phenomenon: some information does not live on high-variance axes, but it can still be read by the right probe.

# 6. Back to Time: Conservative and Dissipative Flows

So far the discussion has mostly been about scalar relations on a state slice. Now add a clock.

The same scalar relation can have different fates under different evolution rules:

| Flow type | What happens over time | $dE/dt$ | Typical examples |
|---|---|---|---|
| **Conservative flow** | total remains fixed; terms convert into one another | $=0$ | Hamiltonian, unitary, lossless systems |
| **Dissipative flow** | the modeled relation decreases | $\le 0$ | gradient descent, training, diffusion |

For example, the same Parseval slice

$$
\|f\|^2=\sum_k|\hat f_k|^2
$$

can be conserved under unitary / lossless evolution. Under heat diffusion,

$$
\partial_t f=\Delta f,
$$

it instead satisfies

$$
\frac{d}{dt}\|f\|^2=-2\|\nabla f\|^2\le 0.
$$

Same scalar relation, different flow: one conservative, one dissipative. The fate is decided by the flow, not by the relation itself.

Machine-learning training is usually closer to a dissipative flow. Gradient flow

$$
\dot x=-\nabla E(x)
$$

gives

$$
\frac{dE}{dt}=-\|\nabla E(x)\|^2\le 0.
$$

This is not conservation; it is Lyapunov descent. A safer phrasing is not "the residual necessarily goes to zero," but "the modeled scalar relation is pushed downward." Irreducible error, local minima, and model-capacity limits may all remain.

In open physical systems, dissipation can often be restored to complete conservation by expanding to system + bath. For ML, that analogy can be useful, but it should not be forced: there may not be a natural bath. More safely, training lowers the modeled scalar account, while unexplained terms, optimization dynamics, data noise, and structure outside the model carry the remaining explanation.

# 7. Closing: An Incomplete Table

This essay is not a "grand energy theory." It is a cross-domain structural table: state, scalar relation, residual, weak direction, prior, and flow are placed side by side across columns. Similarities can be borrowed, and gaps may become questions — but only bridge-backed gaps count.

The $L^2$ column is the most developed here because it already has the Born, Ax=b, and convolution posts behind it, plus the Hilbert / Parseval / operator-spectrum foundation. The information and geometry columns are still only connected at the bridgehead: the information side deserves its own expansion through entropy, cross-entropy, KL, ELBO, and information geometry; the geometry side deserves its own expansion through Hessian, Fisher, natural gradient, and trust regions.

## References and Extensions

Internal notes and posts:

- [Born's rule and auto-correlation](/en/posts/born-rule-autocorrelation-energy/): the entry point for $|\psi|^2$, auto-correlation, inner products, and the energy intuition.
- [Reading $Ax=b$ through an engineering energy lens](/en/posts/ax-b-energy-perspective/): SVD, Ridge, PCA, weak singular directions, and energy spectra.
- [Convolution under an energy lens](/en/posts/convolution-energy-perspective/): the Fourier basis, Parseval, and Wiener as Ridge in the Fourier basis.
- [Real Analysis Part 3](/en/notes/math/real-analysis/note-ra-3-metric-normed-hilbert-fourier/): Hilbert spaces, orthogonal decomposition, Parseval, and the Fourier foundation.
- [Real Analysis Part 4](/en/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact/): bounded operators, spectra, compact operators, small singular values, and Tikhonov.
- [PCA / Whitening note](/en/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/): principal directions, scale correction, and whitening in representation spaces.
- [Spectral methods note](/en/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/): graph Laplacians, low-frequency eigenvectors, and spectral clustering as another structural-spectrum view.
- [VAE and ELBO derivation](/en/notes/ml/generative-models/note-ml-gen-1-vae-elbo/): an internal entry point for ELBO, KL, and variational free energy.
- [CLIP: contrastive learning to shared space](/en/notes/ml/transformer-vit-clip/note-ml-clip-1-contrastive-to-shared-space/): how cross-entropy / InfoNCE turns a similarity matrix into a training objective.
- [BERT representation probes](/en/artifacts/05-bert-representation-probes/) and the [Fisher view](/en/artifacts/05-3-fisher-view/): low-variance discriminative directions, reweighting, and weak directions in representation space.

One final thought remains: perhaps there really is a larger bridge that has not been found yet. I do not rule that out. But if such a bridge exists, it must explain the cracks already visible here: why KL is asymmetric, why Wasserstein does not come from an ordinary inner product, and why leaving the Gaussian bridge breaks the direct identification with $L^2$ quadratic residuals.

> **Maybe a larger bridge exists. But the first step toward finding it is to mark every crack and every empty cell honestly, instead of covering them with one big word.**
