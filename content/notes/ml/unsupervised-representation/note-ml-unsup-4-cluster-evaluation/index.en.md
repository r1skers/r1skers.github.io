---
date: '2026-05-25T13:00:00+09:00'
draft: false
title: 'Machine Learning / Unsupervised Learning Part 4: Clustering Evaluation, External Metrics, and Stability'
summary: "Clustering algorithms always return results, but those results need evaluation. This note covers internal metrics such as silhouette, Davies-Bouldin, and Calinski-Harabasz; external metrics such as NMI, ARI, and purity; and the role of resampling stability."
description: "The fourth note in the unsupervised learning series: clustering evaluation through internal metrics, external metrics, and stability, distinguishing geometric compactness, semantic label alignment, and robustness under perturbation."
tags: ["Unsupervised Learning", "Clustering Evaluation", "Silhouette", "Davies-Bouldin", "Calinski-Harabasz", "NMI", "ARI", "Purity", "Stability", "Resampling"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/note-ml-unsup-4-cluster-evaluation/
---

# Machine Learning / Unsupervised Learning Part 4: Clustering Evaluation, External Metrics, and Stability

The previous notes covered dimensionality reduction, graph representations, and major clustering algorithms. Now comes the practical question:

> Clustering algorithms always return results, but do those results mean anything?

KMeans returns $K$ clusters. GMM returns $K$ probability distributions. DBSCAN returns density-connected regions and noise points. Spectral clustering returns a graph-structural partition. But these results may reflect real structure, or they may be artifacts of distance scale, algorithmic bias, random initialization, or parameter choice.

So clustering evaluation has three layers:

$$
\text{geometric quality} \longrightarrow \text{semantic label alignment} \longrightarrow \text{stability under perturbation}
$$

In terms of metrics:

```text
internal metrics: silhouette, Davies-Bouldin, Calinski-Harabasz
external metrics: NMI, ARI, purity
stability: resampling stability, seed stability, parameter stability
```

---

## 1. Internal Metrics: Geometry Without Labels

Internal metrics use only the data $X$ and the clustering result $C$. They do not use ground-truth labels.

They ask:

> Geometrically, are clusters compact internally and separated externally?

Common internal metrics include:

| metric | intuition | direction |
|---|---|---|
| silhouette | are same-cluster points close and other-cluster points far? | higher is better |
| Davies-Bouldin | is within-cluster scatter small relative to between-cluster distance? | lower is better |
| Calinski-Harabasz | is between-cluster dispersion large relative to within-cluster dispersion? | higher is better |

Their shared preference is:

```text
compact within clusters
well separated between clusters
regular shapes
```

So they are well suited for KMeans-like spherical, convex, separated structures, but not necessarily for every real structure.

---

## 2. Silhouette: Near Inside, Far Outside

Silhouette is the most intuitive internal metric.

For each sample $x_i$, define

$$
a(i)
$$

as its average distance to other points in the same cluster:

```text
how close this point is to its own cluster
```

Define

$$
b(i)
$$

as its average distance to the nearest other cluster:

```text
how far this point is from the closest different cluster
```

The silhouette score is

$$
s(i)=\frac{b(i)-a(i)}{\max(a(i),b(i))}.
$$

It lies in

$$
-1\le s(i)\le 1.
$$

If $a(i)$ is small and $b(i)$ is large, then the point is close to its own cluster and far from others:

$$
s(i)\approx 1.
$$

If $a(i)\approx b(i)$, the point is near a boundary:

$$
s(i)\approx 0.
$$

If $a(i)>b(i)$, the point is closer to another cluster than to its own:

$$
s(i)<0.
$$

The overall silhouette score is usually the average over all samples.

---

## 3. Davies-Bouldin: Find the Worst Neighbor

The Davies-Bouldin index, or DB index, starts from the within-cluster scatter $S_i$ of each cluster. This can be understood as the average distance from points to the cluster center. It also uses the distance $M_{ij}$ between cluster centers.

The badness between two clusters can be written as

$$
R_{ij}=\frac{S_i+S_j}{M_{ij}}.
$$

If two clusters are internally scattered and their centers are close, then $R_{ij}$ is large.

For each cluster $i$, DB finds its worst neighbor:

$$
\max_{j\ne i}R_{ij}.
$$

Then it averages over clusters:

$$
DB=\frac{1}{K}\sum_i\max_{j\ne i}R_{ij}.
$$

So:

```text
more compact within clusters
farther between clusters
lower DB
```

Lower DB is better.

---

## 4. Calinski-Harabasz: Between-Cluster / Within-Cluster Variance

The Calinski-Harabasz index, or CH index, has an ANOVA-like intuition:

> Good clustering should separate cluster centers while keeping each cluster compact.

Roughly:

$$
CH=
\frac{\text{between-cluster dispersion}/(K-1)}
{\text{within-cluster dispersion}/(n-K)}.
$$

A larger numerator means clusters are more separated; a smaller denominator means clusters are more compact.

So higher CH is better.

---

## 5. The Blind Spot of Internal Metrics

The largest blind spot of internal metrics is:

> Geometric compactness is not the same as semantic alignment.

Consider two moons:

```text
)     (
```

Human intuition sees two clusters, and DBSCAN or spectral clustering can recover the density-connected or graph-connected structure. But silhouette may not be very high, because each moon is not spherical and within-cluster average distance may not look clean.

The same issue appears in BERT embeddings. Traditional geometric metrics may show little difference between pretrained BERT and randomly initialized BERT, while NMI / purity may differ substantially. This means:

> Semantic structure does not always appear as compact spherical geometry.

Internal metrics answer:

```text
is this clustering geometrically compact and separated?
```

not:

```text
is this clustering semantically meaningful?
```

---

## 6. External Metrics: Alignment with Reference Labels

External metrics require reference labels $Y$. They compare clustering result $C$ against labels $Y$:

$$
C \quad \text{vs.} \quad Y.
$$

Common external metrics include:

| metric | intuition |
|---|---|
| NMI | how much information the clustering and labels share |
| ARI | whether pairwise same-cluster relations match the labels |
| purity | whether each cluster can be explained by a dominant label |

External metrics ask:

> Does this unsupervised structure align with a known semantic partition?

For 20 Newsgroups, if the question is whether BERT embeddings contain topic geometry, then topic labels are a reasonable reference.

---

## 7. NMI: How Much Information Is Shared

NMI is Normalized Mutual Information.

Start with mutual information:

$$
I(C;Y).
$$

It measures how much knowing cluster labels $C$ reduces uncertainty about true labels $Y$.

If clustering and labels agree strongly, mutual information is high. If they are nearly independent, mutual information is close to 0.

Since MI is affected by the number of clusters and classes, it is normalized. One common form is

$$
NMI(C,Y)=\frac{I(C;Y)}{\sqrt{H(C)H(Y)}}.
$$

Here $H(C)$ and $H(Y)$ are entropies.

NMI is usually between $0$ and $1$, with larger values meaning more shared information between clusters and labels.

---

## 8. ARI: Pairwise Agreement

ARI is Adjusted Rand Index.

It starts from pairs of samples. For any two samples, ask:

```text
are they in the same cluster?
are they in the same true class?
```

If the two judgments agree, the score improves.

Rand Index measures pairwise agreement. ARI further adjusts for the expected agreement under random partitions, making it more appropriate for comparing clusterings with different numbers of clusters.

Intuitively:

```text
ARI = 1: perfect agreement
ARI ≈ 0: close to random
ARI < 0: worse than random
```

ARI is useful because it accounts for a random baseline and is not as easily inflated by increasing the number of clusters.

---

## 9. Purity: Can Each Cluster Be Named by One Label?

Purity is very intuitive.

For each cluster, find the most frequent true label inside it.

If a cluster contains:

```text
80 sports
15 politics
5 tech
```

then its purity is

$$
\frac{80}{100}=0.8.
$$

Overall purity is the sum of majority-label counts across clusters divided by the total number of samples:

$$
purity=
\frac{1}{n}\sum_k\max_j |C_k\cap Y_j|.
$$

Its advantage is interpretability:

> Can each cluster be named by one dominant label?

But it has a serious issue:

> More clusters tend to increase purity.

In the extreme case where each point forms its own cluster, purity is 1, which is obviously not meaningful clustering.

Therefore, purity should not be used alone. It should be read together with $K$, NMI, ARI, and stability.

---

## 10. External Labels Are Not the Only Truth

External metrics should not be treated as absolute truth.

Labels are one reference partition. In 20 Newsgroups, the labels are topics, but text may also organize by:

```text
writing style
text length
whether code is quoted
emotion
argument intensity
vocabulary complexity
```

If clustering does not align with topic labels, it does not necessarily mean there is no structure. It means:

> It does not align with the label dimension we are currently evaluating.

So external metrics must be tied to the research question.

If the question is:

```text
Do BERT representations contain topic geometry?
```

then NMI / ARI / purity against topic labels are meaningful.

If the question is:

```text
Do BERT representations contain writing-style structure?
```

then topic labels are not the right external metric.

---

## 11. Stability: Is the Structure Reproducible?

Stability evaluation asks:

> If I slightly perturb the data, initialization, parameters, or preprocessing, does the clustering structure remain?

Common perturbations include:

- changing random seeds;
- changing KMeans initialization;
- bootstrap / subsampling;
- changing PCA dimension;
- changing whitening dimension;
- changing DBSCAN eps;
- changing kNN graph parameter $k$.

Then compare clusterings across runs:

```text
ARI(cluster_run_1, cluster_run_2)
NMI(cluster_run_1, cluster_run_2)
cluster size consistency
center alignment
topic distribution consistency
```

If ARI between runs is high, the structure is stable. If every run differs substantially, the clustering may depend heavily on initialization or parameters.

---

## 12. Resampling Stability

Resampling stability is one common stability framework.

The basic workflow is:

```text
sample a subset of the data
↓
run clustering
↓
sample another subset
↓
run clustering again
↓
compare clustering consistency on overlapping samples
```

If a structure is real, it should reappear across different subsamples.

If it only appears in one sampling run, it may be accidental.

This also connects to the spirit of HDBSCAN: instead of trusting clusters at one eps value, HDBSCAN looks for clusters that persist across a range of density scales.

Thus stability can be summarized as:

> A nice-looking clustering result only proves that it appeared once; repeated appearance is what makes it look like structure.

---

## 13. Combining the Three Evaluation Layers

It is usually unsafe to rely on only one metric.

A more robust analysis is:

```text
internal metrics: is the geometry compact and separated?
external metrics: does it align with the target semantic labels?
stability: does the structure survive perturbation?
```

Correspondingly:

| evaluation type | question answered |
|---|---|
| silhouette / DB / CH | is the geometry compact and separated? |
| NMI / ARI / purity | does it align with reference labels? |
| stability | is it reproducible? |

For embedding clustering, avoid these common mistakes:

- high silhouette does not imply high NMI;
- high NMI does not imply high silhouette;
- high purity may simply mean $K$ is too large;
- a good single run does not imply stability;
- geometric compactness is not semantic alignment.

---

## 14. Meaning for BERT Clustering Experiments

For BERT embedding clustering, evaluation is best separated into layers.

First, look at geometry:

```text
silhouette
Davies-Bouldin
Calinski-Harabasz
anisotropy
participation ratio
```

Second, look at semantic alignment:

```text
NMI(topic, cluster)
ARI(topic, cluster)
purity(topic, cluster)
cluster-topic heatmap
```

Third, look at stability:

```text
consistency across seeds
consistency across subsamples
consistency across whitening dimensions
continuous trends across K
```

This helps distinguish several cases:

| observation | possible interpretation |
|---|---|
| high internal metrics, low external metrics | geometrically compact but not aligned with target semantics |
| low internal metrics, high external metrics | semantic structure exists but is not traditionally compact or spherical |
| high external metrics, low stability | may be an artifact of parameters or random seed |

A convincing conclusion usually needs:

```text
metric improvement
semantic interpretability
stability under perturbation
clear gap from reasonable baselines
```

---

## Summary

This note organized clustering evaluation into three layers:

1. Internal metrics only use geometry and ask whether clusters are compact and separated.
2. Silhouette should be larger, Davies-Bouldin smaller, and Calinski-Harabasz larger.
3. External metrics compare clustering with reference labels; common examples are NMI, ARI, and purity.
4. Purity is easy to interpret, but it favors more clusters and should not be used alone.
5. Stability checks whether clustering structure survives sampling, initialization, and parameter perturbations.
6. Geometric compactness, semantic alignment, and stability are different things and should be evaluated separately.

At this point, the first pass through the unsupervised learning series is complete: from representation geometry, to graph structure, to clustering algorithms, and finally to evaluation and stability.
