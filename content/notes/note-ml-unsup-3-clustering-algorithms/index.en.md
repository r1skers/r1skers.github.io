---
date: '2026-05-25T12:10:00+09:00'
draft: false
title: 'Machine Learning / Unsupervised Learning Part 3: KMeans, GMM, Hierarchical Clustering, and DBSCAN'
summary: "A comparison of the core assumptions behind major clustering algorithms: KMeans as center prototypes, spherical KMeans as directional prototypes, GMM as probabilistic clouds, hierarchical clustering as tree structure, and DBSCAN / HDBSCAN as density connectivity."
description: "The third note in the unsupervised learning series: KMeans, spherical KMeans, Gaussian Mixture Models, hierarchical clustering, DBSCAN, and HDBSCAN, focusing on what each algorithm assumes a cluster should look like."
tags: ["Unsupervised Learning", "Clustering", "KMeans", "Spherical KMeans", "GMM", "EM Algorithm", "Hierarchical Clustering", "DBSCAN", "HDBSCAN", "Representation Geometry"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习3-kmeansgmm层次聚类与dbscan/
---

# Machine Learning / Unsupervised Learning Part 3: KMeans, GMM, Hierarchical Clustering, and DBSCAN

The previous two notes focused on spaces and graphs:

$$
\text{PCA / whitening} \longrightarrow \text{neighborhood graph} \longrightarrow \text{spectral embedding}
$$

This note moves into clustering algorithms themselves. But clustering algorithms are not just tools for "grouping data." Each one asks an implicit question:

> What do you think a cluster should look like?

KMeans thinks clusters are compact groups around centers. Spherical KMeans thinks clusters are semantic directions on a unit sphere. GMM thinks each cluster is a probability distribution. Hierarchical clustering thinks clusters can form a tree from fine to coarse. DBSCAN thinks clusters are density-connected regions.

So the main thread is:

$$
\text{center prototypes} \longrightarrow \text{direction prototypes} \longrightarrow \text{probability distributions} \longrightarrow \text{hierarchical trees} \longrightarrow \text{density connectivity}
$$

---

## 1. KMeans: Center-Prototype Clustering

KMeans can be summarized as:

> Can we represent the whole dataset using $K$ center points?

Let the data be

$$
x_1,x_2,\ldots,x_n,
$$

with each point assigned to a cluster

$$
c_i\in\{1,\ldots,K\},
$$

and each cluster having a center

$$
\mu_1,\mu_2,\ldots,\mu_K.
$$

The KMeans objective is

$$
\sum_{i=1}^{n}\lVert x_i-\mu_{c_i}\rVert^2.
$$

It minimizes the sum of squared distances from each point to its assigned center.

This directly determines what KMeans prefers:

```text
a clear center
points compactly distributed around the center
roughly spherical cluster shape
similar variance across clusters
```

So KMeans is not density clustering in the general sense. It is **center-prototype clustering**.

---

## 2. Lloyd's Algorithm

The KMeans objective contains both assignments $c_i$ and centers $\mu_k$, so solving the global optimum directly is hard. Lloyd's algorithm uses alternating optimization:

```text
initialize K centers
repeat:
  1. assignment step: assign each point to the nearest center
  2. update step: update each center to the mean of its assigned points
until convergence
```

The assignment step is

$$
c_i=\arg\min_k \lVert x_i-\mu_k\rVert^2.
$$

The update step is

$$
\mu_k=\frac{1}{|C_k|}\sum_{i:c_i=k}x_i.
$$

Both steps are natural. If centers are fixed, assigning each point to the closest center minimizes the objective. If assignments are fixed, the cluster mean is the optimal center under squared error.

Therefore, each Lloyd step does not increase the objective. But it only guarantees convergence to a local optimum, not the global optimum.

This is why practical KMeans often uses:

```text
k-means++
multiple random initializations n_init
choose the run with the lowest objective
```

---

## 3. KMeans in Embedding Spaces

When applied to BERT or CLIP embeddings, KMeans assumes:

> Each cluster center represents a semantic prototype, and each sample belongs to the nearest prototype.

For text-topic clustering, centers may correspond to directions like:

```text
sports / games / teams
technology / images / systems
space / NASA / orbit
politics / government / election
```

But "nearest" here defaults to Euclidean distance:

$$
\lVert x_i-\mu_k\rVert^2.
$$

That is not always semantic closeness. BERT embeddings may mix in:

- text length;
- frequent words;
- writing style;
- shifts introduced by pooling;
- anisotropic common directions;
- high-variance non-semantic directions.

So direct KMeans is usually only a baseline. A more common text-embedding workflow is:

```text
embedding
↓
center / PCA / whitening
↓
L2 normalize
↓
spherical KMeans
```

---

## 4. Spherical KMeans: Direction-Prototype Clustering

Spherical KMeans can be understood as:

> Put all vectors on the unit sphere, then cluster by directional similarity.

First apply L2 normalization:

$$
\hat{x}_i=\frac{x_i}{\lVert x_i\rVert}.
$$

Then

$$
\lVert \hat{x}_i\rVert=1.
$$

On the unit sphere, Euclidean distance and inner product are related:

$$
\begin{aligned}
\lVert \hat{x}-\hat{\mu}\rVert^2
&=
2-2\hat{x}^\top \hat{\mu}
\end{aligned}
$$

Thus minimizing Euclidean distance between unit vectors is equivalent to maximizing inner product, which is cosine similarity.

The spherical KMeans assignment step is

$$
c_i=\arg\max_k \hat{x}_i^\top \mu_k.
$$

The update step first averages directions inside the cluster:

$$
m_k=\sum_{i:c_i=k}\hat{x}_i,
$$

then normalizes:

$$
\mu_k=\frac{m_k}{\lVert m_k\rVert}.
$$

So the center in ordinary KMeans is an average position, while the center in spherical KMeans is an average direction.

---

## 5. Whitening, L2 Normalize, and Spherical KMeans

For text or multimodal embeddings, spherical KMeans is often paired with whitening:

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
spherical KMeans
```

Each step handles a different problem:

| step | problem handled |
|---|---|
| whitening | variance scales differ too much across principal directions |
| L2 normalize | sample vector norms differ |
| spherical KMeans | cluster by directional prototypes |

In short:

> Whitening first weakens principal-direction scale imbalance, L2 normalization removes sample-length differences, and spherical KMeans finally reads semantic directions through inner products.

This is why `whiten + l2 + spherical KMeans` is often a strong baseline in BERT clustering experiments.

---

## 6. GMM: Each Cluster as a Probability Cloud

In KMeans, each cluster is a center point. In GMM, each cluster is a Gaussian distribution.

Gaussian Mixture Model assumes that data comes from a mixture of Gaussians:

$$
p(x)=\sum_{k=1}^{K}\pi_k\mathcal{N}(x\mid \mu_k,\Sigma_k).
$$

Here:

- $\pi_k$ is the mixture weight of cluster $k$;
- $\mu_k$ is the mean;
- $\Sigma_k$ is the covariance matrix.

And

$$
\sum_{k=1}^{K}\pi_k=1.
$$

Compared with KMeans, GMM adds two things:

```text
clusters can be elliptical probability clouds
each point can softly belong to multiple clusters
```

For a sample $x_i$, the posterior probability that it belongs to Gaussian $k$ is called its responsibility:

$$
\begin{aligned}
\gamma_{ik}
&=
\frac{\pi_k\mathcal{N}(x_i\mid\mu_k,\Sigma_k)}
{\sum_{\ell=1}^{K}\pi_\ell\mathcal{N}(x_i\mid\mu_\ell,\Sigma_\ell)}
\end{aligned}
$$

It measures how much cluster $k$ is responsible for sample $x_i$.

---

## 7. EM Algorithm

GMM is usually trained with EM.

The E-step fixes the current parameters and computes each sample's responsibility for each cluster:

$$
\begin{aligned}
\gamma_{ik}
&=
\frac{\pi_k\mathcal{N}(x_i\mid\mu_k,\Sigma_k)}
{\sum_{\ell=1}^{K}\pi_\ell\mathcal{N}(x_i\mid\mu_\ell,\Sigma_\ell)}
\end{aligned}
$$

The M-step updates the parameters using these soft assignments. First define the effective number of samples in cluster $k$:

$$
N_k=\sum_{i=1}^{n}\gamma_{ik}.
$$

Update the mixture weight:

$$
\pi_k=\frac{N_k}{n}.
$$

Update the mean:

$$
\begin{aligned}
\mu_k=
\frac{1}{N_k}
\sum_{i=1}^{n}\gamma_{ik}x_i
\end{aligned}
$$

Update the covariance:

$$
\begin{aligned}
\Sigma_k=
\frac{1}{N_k}
\sum_{i=1}^{n}\gamma_{ik}(x_i-\mu_k)(x_i-\mu_k)^\top
\end{aligned}
$$

So GMM updates can be understood as a soft version of KMeans mean updates: each point contributes to multiple clusters with probabilistic weights.

---

## 8. The Relationship Between GMM and KMeans

KMeans can be seen as a special limiting case of GMM:

```text
each cluster is a spherical Gaussian
all clusters share the same covariance
assignments approach hard assignment
```

So in terms of expressive power:

```text
KMeans ⊂ GMM
```

GMM is theoretically more flexible: it can represent elliptical clusters, clusters of different sizes, and ambiguous boundary points.

But this does not mean GMM is always better in practice. In high-dimensional embedding spaces, full covariance is hard to estimate. For example, after reducing to 100 PCA dimensions, one full covariance matrix already has about

$$
\frac{100\times 101}{2}=5050
$$

covariance parameters. If $K=20$, covariance alone exceeds one hundred thousand parameters.

Therefore, when the sample size is limited and the goal is semantic alignment rather than density modeling, a simple directional-prototype method such as spherical KMeans may be more stable.

---

## 9. Hierarchical Clustering: A Tree from Fine to Coarse

KMeans and GMM require specifying $K$ first. Hierarchical clustering does not immediately commit to a single flat partition; it first builds a tree.

Agglomerative clustering is the bottom-up version:

```text
each point starts as its own cluster
↓
merge the two closest clusters at each step
↓
continue until all points form one tree
```

The tree is called a dendrogram.

The key question is: how should the distance between two clusters be defined? This is determined by the linkage.

| linkage | definition | intuition |
|---|---|---|
| single | closest pair distance | a short bridge is enough to merge |
| complete | farthest pair distance | the merged cluster should remain compact |
| average | average over all pairwise distances | a balanced notion of overall closeness |
| Ward | increase in SSE after merging | preserve small within-cluster squared error |

Ward linkage is close in spirit to KMeans: both prefer compact, spherical clusters. Single linkage can trace long chains or elongated structures, but it is easily bridged by noise points.

The value of hierarchical clustering is that it gives a multi-scale structure rather than a single answer.

For example, 20 Newsgroups texts may first form fine-grained topics:

```text
hockey
baseball
space
graphics
medicine
religion
politics
```

Then these may merge into coarser structures:

```text
sports
science / tech
belief / politics
```

Such hierarchical relations are hard for KMeans to express directly.

---

## 10. DBSCAN: Density-Connected Clustering

DBSCAN changes the perspective completely:

> A cluster is not formed around a center; it is formed by connected high-density regions.

It has two core parameters:

- `eps`: neighborhood radius;
- `min_samples`: minimum number of points required inside the neighborhood to count as dense.

For a point $x_i$, its eps-neighborhood is

$$
N_\epsilon(x_i)=\{x_j:\lVert x_j-x_i\rVert\le \epsilon\}.
$$

DBSCAN classifies points into three types:

| point type | meaning |
|---|---|
| core point | its eps-neighborhood contains at least `min_samples` points |
| border point | not dense enough itself, but lies in a core point's neighborhood |
| noise point | neither core nor border |

A DBSCAN cluster is a density-connected region formed by chains of core points.

This allows it to handle shapes KMeans struggles with:

```text
moons
rings
long strips
irregular regions with noise
```

KMeans forces every point into a cluster, while DBSCAN may label some points as noise. This is meaningful for real text data, where some documents are genuinely mixed-topic or boundary cases.

---

## 11. Why eps Is Hard to Choose

The biggest issue with DBSCAN is that `eps` depends strongly on data scale.

If all coordinates are multiplied by 10, distances also become 10 times larger, and the old `eps` no longer works.

The same holds across datasets:

```text
dense dataset: a small eps may connect points
sparse dataset: the same eps may turn everything into noise
```

High-dimensional embeddings are even harder. Distances may concentrate, causing:

```text
eps slightly too small: almost no points connect
eps slightly too large: many regions suddenly merge
```

Therefore, DBSCAN is usually not suitable for raw 768-dimensional BERT embeddings. A safer workflow is:

```text
embedding
↓
PCA / whitening / L2 normalize
↓
choose an appropriate distance
↓
DBSCAN / HDBSCAN
```

HDBSCAN can be roughly understood as:

> Instead of fixing a single eps, search for clusters that persist across multiple density scales.

It reduces the dependence on one eps value, but it is also more complex.

---

## 12. Comparing Clustering Views

The algorithms in this note can be compressed into one table:

| method | what it thinks a cluster is |
|---|---|
| KMeans | a compact group around a center |
| spherical KMeans | a directional group on the unit sphere |
| GMM | a Gaussian probability cloud |
| hierarchical clustering | a branch in a tree |
| DBSCAN / HDBSCAN | a density-connected region |
| spectral clustering | a strongly connected subgraph |

This table is more important than the formulas. Clustering has no single correct answer; different algorithms define "structure" in different languages.

So the real question is not "which clustering algorithm is best?" but:

> Does the structure in this dataset look more like centers, directions, probability clouds, tree branches, density regions, or graph-connected regions?

---

## Summary

This note organized the core assumptions behind major clustering algorithms:

1. KMeans explains data with $K$ centers and prefers spherical, compact clusters with similar variance.
2. Spherical KMeans clusters by direction on the unit sphere, making it suitable for semantic embeddings such as BERT / CLIP.
3. GMM models each cluster as a Gaussian distribution, allowing soft assignments and elliptical clusters, but high-dimensional covariance estimation is expensive.
4. Hierarchical clustering produces a dendrogram from fine to coarse, which is useful for exploring multi-scale relations.
5. DBSCAN / HDBSCAN start from density connectivity and can identify noise and irregular shapes, but they are sensitive to scale and high-dimensional distances.
6. The difference between clustering algorithms is fundamentally a difference in assumptions about what a cluster should look like.

The next note moves into clustering evaluation: internal metrics, external metrics, and stability. Algorithms always return results; evaluation is how we decide whether those results mean anything.
