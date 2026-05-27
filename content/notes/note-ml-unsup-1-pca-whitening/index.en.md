---
date: '2026-05-25T10:30:00+09:00'
draft: false
title: 'Machine Learning / Unsupervised Learning Part 1: PCA, Whitening, and Neighborhood Visualization'
summary: "Starting from PCA's maximum-variance directions, this note builds the geometric foundation for embedding analysis: linear dimensionality reduction, covariance eigenspectra, whitening as scale correction, and why t-SNE / UMAP should be used to form hypotheses rather than prove cluster structure."
description: "The first note in the unsupervised learning series: PCA, whitening, t-SNE, and UMAP, centered on representation geometry, direction, scale, local neighborhoods, and visualization error."
tags: ["Unsupervised Learning", "PCA", "Whitening", "t-SNE", "UMAP", "Dimensionality Reduction", "Representation Geometry", "KL Divergence"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习1-pcawhitening与邻域可视化/
---

# Machine Learning / Unsupervised Learning Part 1: PCA, Whitening, and Neighborhood Visualization

This note starts from the most basic geometric question in unsupervised learning:

$$
\text{high-dimensional representations} \longrightarrow \text{principal directions} \longrightarrow \text{scale correction} \longrightarrow \text{neighborhood visualization}
$$

Later methods such as KMeans, spherical KMeans, GMM, and spectral clustering all assume that we already have a vector space where comparisons are meaningful. But embedding spaces are not automatically reliable. BERT, CLIP, ViT, and VAE latent codes can all contain shifts, anisotropy, dominant high-variance directions, and distorted local neighborhoods.

So before clustering, the first question is:

> Can the distances, directions, and scales in this space really carry the structure we want to read out?

This note focuses on three tools:

- PCA: find the linear directions along which the data varies the most;
- whitening: flatten the variance scale along principal directions;
- t-SNE / UMAP: visualize local neighborhoods, without treating the picture itself as proof.

---

## 1. PCA: Finding Maximum-Variance Directions

Let the centered data matrix be

$$
X\in \mathbb{R}^{N\times d},
$$

where $N$ is the number of samples and $d$ is the feature dimension. PCA asks:

> Find a unit direction $w$ such that the projected data has maximum variance.

The projection of a sample $x_i$ onto direction $w$ is

$$
z_i=w^\top x_i
$$

The first principal component is

$$
w_1=\arg\max_{\lVert w\rVert=1}\operatorname{Var}(w^\top x)
$$

The constraint $\lVert w\rVert=1$ matters because PCA compares directions, not vector lengths. Without it, one could simply scale $w$ up and make the projected variance arbitrarily large.

Geometrically, PCA rotates the coordinate axes toward the main directions along which the data spreads.

---

## 2. Centering and the Covariance Matrix

PCA usually starts with centering:

$$
\tilde{x}_i=x_i-\bar{x}
$$

where

$$
\bar{x}=\frac{1}{N}\sum_{i=1}^N x_i
$$

Centering moves the data around its mean. PCA cares about variation around the mean, not about how far the whole cloud is from the origin.

After centering, the covariance matrix is

$$
\Sigma=\frac{1}{N}X^\top X
$$

The principal directions come from the eigendecomposition

$$
\Sigma v_j=\lambda_j v_j
$$

where $v_j$ is the $j$-th principal direction and $\lambda_j$ is the variance along that direction.

The basic PCA pipeline is:

```text
center the data
↓
compute the covariance matrix
↓
eigendecompose it
↓
sort by eigenvalue
↓
take the top k eigenvectors as the new axes
```

If we keep the top $k$ directions

$$
V_k=[v_1,v_2,\ldots,v_k],
$$

the reduced representation is

$$
Z=XV_k
$$

---

## 3. PCA as Minimum Reconstruction Error

PCA also has an equivalent reconstruction view:

> Among all $k$-dimensional linear subspaces, PCA chooses the one with minimum reconstruction error.

If

$$
z_i=V_k^\top x_i
$$

and

$$
\hat{x}_i=V_kz_i,
$$

then PCA minimizes

$$
\sum_i\lVert x_i-\hat{x}_i\rVert^2
$$

So PCA is an optimal linear compressor. The two words are both important: it is linear, and it is optimal under squared reconstruction error.

If the data lies on a curved manifold such as two moons or a Swiss roll, PCA can only find a flat projection plane. It cannot truly unfold the curved structure.

---

## 4. Explained Variance

PCA returns eigenvalues

$$
\lambda_1\ge \lambda_2\ge \cdots \ge \lambda_d
$$

The explained variance ratio of component $j$ is

$$
\frac{\lambda_j}{\sum_{\ell=1}^{d}\lambda_\ell}
$$

The cumulative explained variance of the top $k$ components is

$$
\frac{\sum_{j=1}^{k}\lambda_j}{\sum_{\ell=1}^{d}\lambda_\ell}
$$

If a few components explain a very large fraction of the variance, most variation is concentrated in a small number of directions. In high-dimensional embeddings, this can be a sign of anisotropy.

But high variance is not the same as semantic importance. A dominant direction may encode text length, frequent words, a common component, or some global shift in the representation space.

---

## 5. Whitening: Turning an Ellipse into a Circle

PCA rotates the axes, but it does not remove scale differences between directions.

Let

$$
\Sigma=V\Lambda V^\top
$$

where

$$
\Lambda=\operatorname{diag}(\lambda_1,\lambda_2,\ldots,\lambda_d)
$$

The PCA projection is

$$
Z=XV
$$

In $Z$, the dimensions are decorrelated, but the variance along direction $j$ is still $\lambda_j$.

Whitening adds a rescaling step:

$$
Z_{\text{white}}=XV\Lambda^{-1/2}
$$

where

$$
\begin{aligned}
\Lambda^{-1/2}
&=
\operatorname{diag}\left(
\frac{1}{\sqrt{\lambda_1}},
\frac{1}{\sqrt{\lambda_2}},
\ldots,
\frac{1}{\sqrt{\lambda_d}}
\right)
\end{aligned}
$$

In words:

```text
large-variance directions are shrunk
small-variance directions are amplified
```

The covariance of the whitened data becomes close to the identity:

$$
\operatorname{Cov}(Z_{\text{white}})=I
$$

Geometrically:

```text
PCA       = rotate the axes and align the ellipse
whitening = rotate + rescale, turning the ellipse into a circle
```

---

## 6. The Regularization Flavor of Whitening

Whitening is a kind of geometric preconditioning. It does not add a penalty term to the loss, but it does suppress the dominance of high-variance directions in distance computations.

It also has a risk similar to ill-conditioned inverse problems. The scaling factor is

$$
\frac{1}{\sqrt{\lambda_j}}
$$

If $\lambda_j$ is very small, that direction is amplified strongly. If the small-variance direction mostly contains noise, full whitening amplifies noise.

This is why truncated whitening is often used:

$$
X_{\text{white},k}=XV_k\Lambda_k^{-1/2}
$$

First keep the top $k$ relatively reliable PCA directions, then whiten them.

One can also add a stabilizer:

$$
X_{\text{white}}=XV(\Lambda+\epsilon I)^{-1/2}
$$

This has the same spirit as ridge / Tikhonov regularization: do not fully trust tiny eigenvalue directions; put a floor under the spectral scaling to avoid noise blow-up.

---

## 7. PCA Whitening and ZCA Whitening

There are two common whitening variants.

PCA whitening:

$$
X_{\text{PCA-white}}=XV\Lambda^{-1/2}
$$

This puts the data in PCA coordinates.

ZCA whitening:

$$
X_{\text{ZCA-white}}=XV\Lambda^{-1/2}V^\top
$$

This first performs PCA whitening, then rotates the data back to the original coordinate system. The result is still whitened, but it stays as close as possible to the original data.

ZCA whitening was common in image preprocessing because the whitened image still looked image-like. In embedding clustering, we usually care more about distances and directions than returning to the original coordinates, so PCA whitening is often the more natural choice.

---

## 8. t-SNE / UMAP: Visualizing Local Neighborhoods

PCA and whitening focus on global linear directions. t-SNE and UMAP ask a different question:

> Can points that are neighbors in high dimension remain close in a two-dimensional map?

t-SNE turns high-dimensional distances into neighbor probabilities $p_{ij}$, constructs low-dimensional neighbor probabilities $q_{ij}$, and minimizes

$$
D_{\mathrm{KL}}(P\|Q)=\sum_{i,j}p_{ij}\log\frac{p_{ij}}{q_{ij}}
$$

Its emphasis is local neighborhood preservation. If two points are close in the high-dimensional space, then $p_{ij}$ is large; placing them far apart in the low-dimensional map makes $q_{ij}$ small and incurs a large penalty.

This explains several properties of t-SNE:

- local neighbor relations are relatively meaningful;
- distances between islands should not be overinterpreted;
- island size and area should not be read literally;
- different perplexities, initializations, and learning rates may produce different maps.

UMAP is closer to the following picture:

```text
high-dimensional data
↓
construct a nearest-neighbor graph
↓
reconstruct a similar graph in 2D
```

Its common parameters are `n_neighbors` and `min_dist`. The former controls the local-global balance; the latter controls how tightly points may pack in the 2D layout.

---

## 9. KL: The Connection to VAE

The KL divergence in t-SNE and the KL term in VAE are the same measuring tool, but they compare different objects.

In VAE, the common term is

$$
D_{\mathrm{KL}}\left(q_\phi(z\mid x)\middle\|p(z)\right)
$$

It pulls the approximate posterior produced by the encoder toward the prior, usually a standard normal distribution.

In t-SNE, the term is

$$
D_{\mathrm{KL}}(P\|Q)
$$

where $P$ is the high-dimensional neighbor distribution and $Q$ is the low-dimensional neighbor distribution. It pushes the 2D neighborhood structure toward the original high-dimensional one.

So:

> KL is a tool for aligning distributions; VAE uses it to organize latent space, while t-SNE uses it to organize neighborhood relations in a visualization.

---

## 10. Why t-SNE / UMAP Error Is Hard to Control

PCA has a clear error story. After keeping the top $k$ components, the lost variance can be computed directly.

t-SNE and UMAP optimize objectives that are not the same as the geometric errors our eyes tend to read from the plot.

The eye wants to interpret:

```text
two clusters are far apart
this cluster is larger
this cluster is tighter
there is a clear gap here
```

But the algorithms optimize:

```text
whether neighbor probabilities match
whether nearest-neighbor graph structure is preserved
```

Those are not the same thing.

Therefore, t-SNE / UMAP are good for forming hypotheses, not for directly proving cluster structure. A safer workflow is:

1. sweep multiple parameters instead of trusting one plot;
2. avoid overinterpreting inter-cluster distance and area;
3. cross-check with PCA, whitening, and metrics in the original space;
4. finally validate with clustering metrics and stability.

---

## 11. A Common Workflow for Embedding Analysis

For BERT, CLIP, or other deep representations, a common workflow is:

```text
embedding
↓
center
↓
PCA to k dims
↓
whitening
↓
L2 normalize
↓
visualize or cluster
```

Each step has a role:

| step | role |
|---|---|
| center | remove the global mean shift |
| PCA | find major directions, denoise, and compress |
| whitening | flatten principal-direction scales and reduce high-variance dominance |
| L2 normalize | remove sample-length differences and move toward directional geometry |
| t-SNE / UMAP | inspect local neighborhood structure |
| spherical KMeans | cluster by semantic direction on the unit sphere |

This is why `PCA whitening + L2 normalize + spherical KMeans` is often more stable than direct KMeans for text embeddings.

---

## Summary

This note establishes the first geometric layer of unsupervised learning:

1. PCA finds maximum-variance directions; it rotates the axes and performs optimal linear compression.
2. PCA keeps high-variance directions, but high variance is not necessarily semantic importance.
3. Whitening equalizes variances in PCA coordinates; geometrically, it turns an ellipse into a circle.
4. Whitening has a regularization flavor: truncation and an $\epsilon$ term can prevent small-eigenvalue directions from amplifying noise.
5. t-SNE / UMAP focus on local neighborhood visualization, but global distance, area, and cluster count in the plot should not be treated as direct conclusions.
