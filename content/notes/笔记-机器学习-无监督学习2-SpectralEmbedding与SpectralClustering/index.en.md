---
date: '2026-05-25T11:20:00+09:00'
draft: false
title: 'Machine Learning / Unsupervised Learning Part 2: Spectral Embedding and Spectral Clustering'
summary: "Starting from nearest-neighbor graphs, this note explains the graph Laplacian, low-frequency eigenvectors, spectral embedding, and spectral clustering. The core view is that spectral clustering first rewrites the data into a graph-structural representation, then applies KMeans."
description: "The second note in the unsupervised learning series: spectral embedding and spectral clustering, centered on similarity graphs, graph Laplacians, low-frequency eigenvectors, graph smoothness, and the analogy with attention."
tags: ["Unsupervised Learning", "Spectral Embedding", "Spectral Clustering", "Graph Laplacian", "Graph Learning", "KMeans", "Representation Geometry"]
categories: ["Crucible"]
math: true
---

# Machine Learning / Unsupervised Learning Part 2: Spectral Embedding and Spectral Clustering

The previous note started from PCA, whitening, and t-SNE / UMAP. Its main thread was:

$$
\text{representation space} \longrightarrow \text{direction and scale} \longrightarrow \text{local neighborhood visualization}
$$

This note takes the next step and turns neighborhoods into an explicit graph:

$$
\text{data points} \longrightarrow \text{similarity graph} \longrightarrow \text{graph Laplacian} \longrightarrow \text{low-frequency structural representation} \longrightarrow \text{clustering}
$$

The core intuition behind spectral embedding and spectral clustering is:

> Do not trust the raw Euclidean shape directly. First build a graph from pairwise similarities, then read structure from the graph's global low-frequency modes.

This has a family resemblance to attention: both methods start from relationships between points rather than looking at each point in isolation. The difference is that attention weights are usually learned by the model, while spectral graph weights are usually constructed from distances or nearest-neighbor rules.

---

## 1. From Point Clouds to Graphs

Let the data points be

$$
x_1,x_2,\ldots,x_n.
$$

In spectral methods, each sample is first treated as a graph node. Then we define a similarity between samples:

$$
W_{ij}.
$$

If $x_i$ and $x_j$ are similar, $W_{ij}$ is large. If they are far apart, $W_{ij}$ is small, or even set to 0.

There are two common ways to build the graph.

The first is a kNN graph:

```text
each point connects only to its k nearest neighbors
```

The second is an RBF kernel:

$$
W_{ij}=\exp\left(-\frac{\lVert x_i-x_j\rVert^2}{2\sigma^2}\right).
$$

Short distances lead to weights close to 1; long distances lead to weights close to 0.

This gives a similarity matrix

$$
W\in \mathbb{R}^{n\times n}.
$$

Notice that the size of $W$ is determined by the number of samples $n$, not by the feature dimension $d$. Spectral methods focus on relations between samples.

---

## 2. Degree Matrix and Graph Laplacian

The degree of a node is the total strength of its connections:

$$
d_i=\sum_j W_{ij}.
$$

The degree matrix $D$ is diagonal:

$$
D_{ii}=d_i.
$$

The basic graph Laplacian is

$$
L=D-W
$$

Its key property is:

$$
\begin{aligned}
f^\top Lf
&=
\frac{1}{2}\sum_{i,j}W_{ij}(f_i-f_j)^2
\end{aligned}
$$

Here $f$ is a function on the graph: it assigns one scalar to each node,

$$
x_i \longmapsto f_i.
$$

The meaning is direct:

> If $W_{ij}$ is large, nodes $i$ and $j$ are strongly connected. To make $f^\top Lf$ small, $f_i$ and $f_j$ should be close.

So the graph Laplacian can be understood as a matrix of graph smoothness. Strongly connected points should remain close in the new coordinate function.

---

## 3. Why Low-Frequency Eigenvectors Matter

If we only minimize

$$
f^\top Lf,
$$

the simplest solution assigns the same value to every node:

$$
f_1=f_2=\cdots=f_n.
$$

Then every difference $f_i-f_j$ is 0, and the objective is 0. But this solution cannot distinguish anything.

So we need to exclude the constant solution. The smallest eigenvalue of the graph Laplacian is usually 0, with a constant eigenvector:

$$
u_1\propto \mathbf{1}.
$$

This vector represents the whole graph as one undivided object.

The informative modes come after it:

$$
u_2,u_3,\ldots.
$$

These are the smoothest nontrivial modes on the graph. They can be understood as low-frequency vibration modes of the graph structure:

- $u_1$: the global constant mode;
- $u_2$: the first major nontrivial partition direction;
- $u_3$: the next major variation direction;
- higher eigenvectors: increasingly local variations.

This resembles Fourier analysis: low frequencies describe global trends, while high frequencies describe local details.

---

## 4. Spectral Embedding: Re-Expressing Each Sample

To embed the graph into two dimensions, we often take two nontrivial low-frequency eigenvectors of the graph Laplacian, for example $u_2$ and $u_3$.

Each $u_j$ is a vector of length $n$:

$$
u_j=
\begin{pmatrix}
u_j(1)\\
u_j(2)\\
\vdots\\
u_j(n)
\end{pmatrix}.
$$

The new coordinate of sample $i$ can be written as

$$
y_i=(u_2(i),u_3(i)).
$$

If we take $K$ low-frequency modes, we can write

$$
y_i=(u_1(i),u_2(i),\ldots,u_K(i)),
$$

although whether the constant vector is included depends on the normalized Laplacian and the specific implementation.

This is a crucial difference from PCA:

| method | eigenvector length | role |
|---|---:|---|
| PCA | $d$ | find directions in feature space |
| spectral embedding | $n$ | assign structural coordinates to samples on the graph |

Spectral embedding does not rotate axes in the original feature space. It creates a structure-aware embedding for each sample based on graph relations between samples.

---

## 5. The Analogy with Attention

This is where self-attention becomes a useful analogy.

In self-attention, the relation matrix comes from

$$
A=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right).
$$

Here $A_{ij}$ tells how much token $i$ should take from token $j$. The output is

$$
H'=AV.
$$

That is, each token's new representation is a weighted average of other token values.

Spectral methods also start by constructing a pairwise relation matrix:

$$
W_{ij}.
$$

But instead of using $W$ to aggregate values, they build

$$
L=D-W,
$$

and use eigendecomposition to read out the graph's global low-frequency structure.

Side by side:

| angle | self-attention | spectral embedding |
|---|---|---|
| nodes | tokens / patches | samples |
| relation matrix | $A_{ij}$ | $W_{ij}$ |
| relation source | learned, input-dependent | distance, kernel, or kNN rule |
| representation update | weighted aggregation of values | graph Laplacian eigenvectors |
| goal | contextual representation | graph-structural coordinates |

In short:

```text
attention: learned relation graph + information aggregation
spectral: hand-built relation graph + eigendecomposition
```

---

## 6. CLS and Low-Frequency Eigenvectors

The `[CLS]` token in a Transformer can be understood as a global aggregation slot. After multiple attention layers, it gathers information from other tokens and becomes a global representation of the input, which is then passed to a classifier or a contrastive objective.

Spectral embedding has no extra CLS node, but the low-frequency eigenvectors of the graph Laplacian play a different kind of global role.

The smallest eigenvector

$$
u_1\propto \mathbf{1}
$$

corresponds to the global constant mode of the graph. The next eigenvectors $u_2,u_3,\ldots$ describe nontrivial global structure.

So we can distinguish them as:

| object | role |
|---|---|
| CLS | aggregates all tokens into one global representation |
| spectral low-frequency eigenvectors | assign each sample a coordinate in the global graph structure |

In other words, CLS is closer to a global readout, while spectral embedding re-expresses every point in a structured coordinate system.

---

## 7. Spectral Clustering: Re-Express First, Then KMeans

Spectral clustering can be summarized as:

> Use low-frequency graph Laplacian eigenvectors to re-represent each point, then run KMeans in that new space.

The full workflow is:

```text
raw data points
↓
construct similarity graph W
↓
construct degree matrix D
↓
construct graph Laplacian L
↓
take low-frequency eigenvectors
↓
obtain spectral embedding for each point
↓
run KMeans
```

It does not abandon KMeans. It first moves the data into a graph-structural space where KMeans is more appropriate.

This is why spectral clustering can handle nonconvex structures such as two moons. In the original 2D coordinate space, the two moons are not spherical clusters, so KMeans can cut them incorrectly. But if we build a nearest-neighbor graph:

```text
within each moon: strong neighbor connections
between the two moons: weak neighbor connections
```

The low-frequency modes of the graph Laplacian capture that weak-connection structure. In spectral embedding space, the two moons often become easier for KMeans to separate.

---

## 8. The Graph-Cut Intuition

The clustering intuition behind spectral clustering is not "which center is closest?" Instead, it is:

> Connections inside a cluster should be strong, while connections between clusters should be weak.

This differs from KMeans.

KMeans prefers:

```text
compact spherical clusters around centers
```

Spectral clustering prefers:

```text
strongly connected subgraphs with weak links between them
```

This makes it suitable for nonconvex structures, manifold-shaped structures, and graph connectivity patterns. It also means that the method depends heavily on how the graph is built.

---

## 9. Graph Construction Is the Main Risk

The fragile part of spectral methods is often not eigendecomposition, but the construction of $W$.

If the kNN parameter $k$ is too small:

```text
the graph may break into too many fragments
```

If $k$ is too large:

```text
regions that should remain separate get connected, blurring the structure
```

If the RBF scale $\sigma$ is too small:

```text
only extremely close points get edges
```

If $\sigma$ is too large:

```text
almost everyone connects to everyone else, and local structure disappears
```

So the parameters of spectral clustering include more than the number of clusters $K$:

- how similarity is defined;
- whether to use a kNN graph or a fully connected RBF graph;
- the kNN parameter $k$;
- the RBF scale $\sigma$;
- whether to use a normalized Laplacian.

This is also what spectral methods share with t-SNE and UMAP: they depend on neighborhood structure, and that structure is shaped by parameters and distance definitions.

---

## 10. Meaning for Embedding Clustering

For BERT or CLIP embeddings, spectral clustering means:

> Do not require semantic clusters to be spherical or elliptical; instead, ask whether the nearest-neighbor graph contains weakly connected semantic regions.

In text data, a topic may not form a perfect spherical blob. It may be a region connected by several subtopics. KMeans tends to cut by centers, GMM tends to fit ellipses, while spectral clustering focuses more on connectivity in the neighbor graph.

But directly building a graph in a high-dimensional embedding space is also risky. A safer workflow is still:

```text
embedding
↓
center / PCA / whitening / L2 normalize
↓
construct neighbor graph
↓
spectral embedding / spectral clustering
```

So the geometric preprocessing from Part 1 does not disappear. It becomes the foundation before graph construction.

---

## Summary

This note establishes the core intuition behind spectral methods:

1. Spectral embedding first turns samples into a graph, then reads low-frequency structure from the graph Laplacian.
2. The key formula is $f^\top Lf=\frac{1}{2}\sum_{i,j}W_{ij}(f_i-f_j)^2$: strongly connected points should remain close in the new coordinate.
3. Low-frequency eigenvectors are not directions in feature space; they are structural coordinates over graph samples.
4. Spectral clustering can be understood as "re-express first, then run KMeans."
5. Spectral methods and attention both start from pairwise relations, but attention learns relations and aggregates information, while spectral methods hand-build the graph and perform eigendecomposition.
6. The success of spectral methods depends heavily on how the graph is constructed.

The next note moves into clustering algorithms themselves: KMeans, spherical KMeans, GMM, hierarchical clustering, and DBSCAN. The emphasis will be on what each algorithm assumes a "cluster" should look like.
