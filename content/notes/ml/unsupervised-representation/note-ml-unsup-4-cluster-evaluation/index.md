---
date: '2026-05-25T13:00:00+09:00'
draft: false
title: '机器学习 / 无监督学习 Part 4：聚类评估、外部指标与稳定性'
summary: "聚类算法一定会给出结果，但结果是否有意义需要评估。本篇整理内部指标 silhouette、Davies-Bouldin、Calinski-Harabasz，外部指标 NMI、ARI、purity，以及 resampling stability 的基本直觉和使用边界。"
description: "无监督学习第四篇：聚类评估。围绕内部指标、外部指标和稳定性，理解几何紧密度、语义标签对齐和扰动可复现性之间的区别。"
tags: ["Unsupervised Learning", "Clustering Evaluation", "Silhouette", "Davies-Bouldin", "Calinski-Harabasz", "NMI", "ARI", "Purity", "Stability", "Resampling"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习4-聚类评估内部指标外部指标与稳定性/
  - /notes/note-ml-unsup-4-cluster-evaluation/
---

# 机器学习 / 无监督学习 Part 4：聚类评估、外部指标与稳定性

前面几篇已经整理了降维、图表示和主要聚类算法。现在要处理一个更现实的问题：

> 聚类算法一定会给出结果，但这个结果到底有没有意义？

KMeans 会给出 $K$ 个簇。GMM 会给出 $K$ 个概率分布。DBSCAN 会给出密度连通区域和噪声点。spectral clustering 会给出图结构划分。可是这些结果可能来自真实结构，也可能只是距离尺度、算法偏好、随机初始化或参数选择制造出来的假象。

所以聚类评估要分三层：

$$
\text{几何是否好看} \longrightarrow \text{是否对齐目标语义} \longrightarrow \text{扰动下是否稳定}
$$

对应到指标就是：

```text
内部指标：silhouette, Davies-Bouldin, Calinski-Harabasz
外部指标：NMI, ARI, purity
稳定性：resampling stability, seed stability, parameter stability
```

---

## 1. 内部指标：不看标签，只看几何

内部指标只使用数据 $X$ 和聚类结果 $C$，不使用真实标签。

它们问的是：

> 从几何上看，这个聚类结果是否簇内紧、簇间远？

常见内部指标包括：

| 指标 | 直觉 | 趋势 |
|---|---|---|
| silhouette | 同簇近、异簇远是否同时成立 | 越大越好 |
| Davies-Bouldin | 簇内散度相对簇间距离是否小 | 越小越好 |
| Calinski-Harabasz | 簇间离散度相对簇内离散度是否大 | 越大越好 |

这些指标的共同偏好是：

```text
簇内紧凑
簇间分离
形状规整
```

因此它们很适合评价 KMeans 喜欢的球形、凸、分离结构，但不一定适合所有真实结构。

---

## 2. Silhouette：同簇近，异簇远

silhouette 是最直观的内部指标。

对每个样本 $x_i$，定义

$$
a(i)
$$

为它到同簇其他点的平均距离。它衡量：

```text
这个点和自己簇里的人有多近
```

再定义

$$
b(i)
$$

为它到最近其他簇的平均距离。它衡量：

```text
这个点离最近的别簇有多远
```

silhouette score 为

$$
s(i)=\frac{b(i)-a(i)}{\max(a(i),b(i))}.
$$

它的范围是

$$
-1\le s(i)\le 1.
$$

如果 $a(i)$ 小、$b(i)$ 大，说明同簇近、异簇远，则

$$
s(i)\approx 1.
$$

如果 $a(i)\approx b(i)$，说明这个点接近边界，则

$$
s(i)\approx 0.
$$

如果 $a(i)>b(i)$，说明它离别的簇比离自己簇更近，则

$$
s(i)\lt0.
$$

整体 silhouette 通常取所有样本的平均。

---

## 3. Davies-Bouldin：找最坏邻居

Davies-Bouldin index，简称 DB index。

它先计算每个簇的簇内散度 $S_i$，可以理解成簇内点到中心的平均距离。再计算两个簇中心之间的距离 $M_{ij}$。

两个簇之间的不良程度可以写成

$$
R_{ij}=\frac{S_i+S_j}{M_{ij}}.
$$

如果两个簇内部很散，同时中心又很近，那么 $R_{ij}$ 就大，说明这两个簇分得不好。

对每个簇 $i$，DB index 找到它最坏的邻居：

$$
\max_{j\ne i}R_{ij}.
$$

然后对所有簇平均：

$$
DB=\frac{1}{K}\sum_i\max_{j\ne i}R_{ij}.
$$

所以：

```text
簇内越紧
簇间越远
DB 越小
```

DB index 越小越好。

---

## 4. Calinski-Harabasz：类间方差 / 类内方差

Calinski-Harabasz index，简称 CH index。

它的直觉接近方差分析：

> 好的聚类应该让簇中心之间分得开，同时簇内部尽量紧。

可以粗略写成

$$
CH=
\frac{\text{between-cluster dispersion}/(K-1)}
{\text{within-cluster dispersion}/(n-K)}.
$$

分子越大，说明簇间分离越明显；分母越小，说明簇内越紧凑。

所以 CH 越大越好。

---

## 5. 内部指标的盲点

内部指标最大的盲点是：

> 几何紧密度不等于语义对齐。

比如 two moons：

```text
)     (
```

人眼会认为是两个簇，DBSCAN 或 spectral clustering 也能读出这两个密度连通或图连通结构。但 silhouette 未必很高，因为每个月牙不是球形，簇内平均距离可能不够漂亮。

在 BERT embedding 里也会出现类似现象。传统几何指标可能显示预训练 BERT 和随机初始化 BERT 差别不大，但 NMI / purity 却差很多。这说明：

> 语义结构不一定表现为传统内部指标喜欢的紧凑球形结构。

所以内部指标回答的是：

```text
这个聚类几何上紧不紧、远不远？
```

而不是：

```text
这个聚类有没有语义？
```

---

## 6. 外部指标：和参考标签对齐多少

外部指标需要参考标签 $Y$。它们比较聚类结果 $C$ 和标签 $Y$：

$$
C \quad \text{vs.} \quad Y.
$$

常见外部指标包括：

| 指标 | 直觉 |
|---|---|
| NMI | 聚类和标签共享了多少信息 |
| ARI | 两两样本的同簇关系是否和标签一致 |
| purity | 每个簇能否被一个主标签解释 |

外部指标回答的是：

> 这个无监督结构是否对齐了某个已知语义划分？

比如在 20 Newsgroups 上，如果研究问题是“BERT embedding 中是否存在话题几何”，那么 topic label 就是合理的参考标签。

---

## 7. NMI：共享了多少信息

NMI 是 Normalized Mutual Information。

先看 mutual information：

$$
I(C;Y).
$$

它衡量知道聚类标签 $C$ 后，能减少多少关于真实标签 $Y$ 的不确定性。

如果聚类和真实标签高度一致，互信息高；如果二者几乎独立，互信息接近 0。

但 MI 会受类别数和簇数影响，因此要归一化。常见形式之一是

$$
NMI(C,Y)=\frac{I(C;Y)}{\sqrt{H(C)H(Y)}}.
$$

其中 $H(C)$ 和 $H(Y)$ 是熵。

NMI 通常在 $[0,1]$ 之间，越大表示聚类和标签共享的信息越多。

---

## 8. ARI：两两关系是否一致

ARI 是 Adjusted Rand Index。

它从样本对出发。对任意两个样本，问两个问题：

```text
聚类结果里，它们是否同簇？
真实标签里，它们是否同类？
```

如果这两个判断一致，就加分。

普通 Rand Index 衡量 pairwise agreement。ARI 在此基础上减去了随机划分的期望影响，因此更适合比较不同簇数下的聚类结果。

直觉上：

```text
ARI = 1：完全一致
ARI ≈ 0：接近随机
ARI < 0：比随机还差
```

ARI 的优势是它对随机基线做了校正，不容易被“多分几个簇”轻易骗高。

---

## 9. Purity：每个簇能否被一个主标签解释

purity 很直观。

对每个簇，看里面最多的真实标签是哪一个。

如果某个簇里有：

```text
80 个 sports
15 个 politics
5 个 tech
```

那么这个簇的 purity 是

$$
\frac{80}{100}=0.8.
$$

整体 purity 是所有簇的多数类样本数加起来，再除以总样本数：

$$
purity=
\frac{1}{n}\sum_k\max_j |C_k\cap Y_j|.
$$

purity 的优点是好解释：

> 每个簇是否能被一个主要标签命名？

但它有一个很大的问题：

> 簇数越多，purity 越容易变高。

极端情况下，每个点单独成簇，purity 就是 1，但这显然不是有意义的聚类。

所以 purity 不能单独看，必须结合 $K$、NMI、ARI 和稳定性一起看。

---

## 10. 外部标签不是唯一真理

外部指标也不能被神化。

标签只是某一种参考划分。20 Newsgroups 的标签是话题，但文本也可能按别的方式组织：

```text
写作风格
文本长度
是否引用代码
情绪
争论强度
词汇复杂度
```

如果聚类没有对齐 topic label，不一定说明它没有结构。只能说明：

> 它没有对齐我们当前关心的这组标签。

所以外部指标必须和研究问题绑定。

如果研究问题是：

```text
BERT 表征是否有话题几何？
```

那么 NMI / ARI / purity 对 topic label 很有意义。

如果研究问题是：

```text
BERT 表征是否有文体结构？
```

那么 topic label 就不是合适的外部指标。

---

## 11. 稳定性：这个结构是否可复现

稳定性评估问的是：

> 如果我轻微扰动数据、初始化、参数或预处理，这个聚类结构还在吗？

常见扰动包括：

- 换随机种子；
- 换 KMeans 初始化；
- bootstrap / subsampling；
- 改 PCA 维度；
- 改 whitening 维度；
- 改 DBSCAN 的 eps；
- 改 kNN 图的 $k$。

然后比较不同 run 之间的聚类结果，例如：

```text
ARI(cluster_run_1, cluster_run_2)
NMI(cluster_run_1, cluster_run_2)
cluster size consistency
center alignment
topic distribution consistency
```

如果不同 run 之间 ARI 很高，说明结构稳定；如果每次结果差别很大，说明聚类可能很依赖初始化或参数。

---

## 12. Resampling Stability

resampling stability 是最常见的稳定性思路之一。

基本流程是：

```text
从数据中抽一个子样本
↓
跑聚类
↓
再抽另一个子样本
↓
再跑聚类
↓
比较重叠样本上的聚类一致性
```

如果某个结构是数据中的真实规律，它应该在不同子样本中反复出现。

如果某个结构只在某一次采样中出现，就要小心它可能只是偶然。

这和 HDBSCAN 的思想也有相通之处：HDBSCAN 不只看某一个 eps 下的簇，而是看哪些簇能在一段密度尺度上稳定存在。

因此可以把稳定性理解成：

> 一次漂亮的聚类结果只能说明它出现过；反复出现，才更像结构。

---

## 13. 三类评估怎么搭配

聚类评估最好不要只看一种指标。

比较稳的分析流程是：

```text
内部指标：几何上是否紧凑分离？
外部指标：是否对齐目标语义标签？
稳定性：扰动后结构是否还在？
```

对应到问题：

| 评估类型 | 回答的问题 |
|---|---|
| silhouette / DB / CH | 几何形状是否紧凑分离 |
| NMI / ARI / purity | 是否对齐参考标签 |
| stability | 是否可复现 |

在 embedding 聚类里，尤其要避免几个误解：

- 高 silhouette 不一定高 NMI；
- 高 NMI 不一定高 silhouette；
- 高 purity 可能只是 $K$ 太大；
- 单次结果好不代表稳定；
- 几何紧密度不等于语义对齐。

---

## 14. 对 BERT 聚类实验的意义

对 BERT embedding 做聚类时，评估最好拆成几层：

第一层，看几何：

```text
silhouette
Davies-Bouldin
Calinski-Harabasz
anisotropy
participation ratio
```

第二层，看语义对齐：

```text
NMI(topic, cluster)
ARI(topic, cluster)
purity(topic, cluster)
cluster-topic heatmap
```

第三层，看稳定性：

```text
不同 seed 是否一致
不同 subsample 是否一致
不同 whitening dim 是否一致
不同 K 是否有连续趋势
```

这能帮助区分三种情况：

| 现象 | 可能解释 |
|---|---|
| 内部指标高，外部指标低 | 几何紧凑但未对齐目标语义 |
| 内部指标低，外部指标高 | 语义结构存在，但不是传统紧凑球形 |
| 外部指标高但稳定性低 | 可能是参数或随机种子的偶然结果 |

因此，真正可信的结论通常需要同时满足：

```text
指标上有提升
语义上可解释
扰动下稳定
和合理 baseline 有差距
```

---

## 总结

这一篇整理了聚类评估的三层结构：

1. 内部指标只看几何，回答簇内是否紧、簇间是否远。
2. silhouette 越大越好，Davies-Bouldin 越小越好，Calinski-Harabasz 越大越好。
3. 外部指标看聚类和参考标签的对齐，常用 NMI、ARI、purity。
4. purity 好解释，但会偏向更多簇，不能单独使用。
5. 稳定性评估检验聚类结构是否能经受采样、初始化和参数扰动。
6. 几何紧密度、语义对齐和稳定性是三件不同的事，必须分开看。

到这里，无监督学习这组笔记完成了第一轮主线：从表征几何，到图结构，再到聚类算法，最后用评估和稳定性收束。
