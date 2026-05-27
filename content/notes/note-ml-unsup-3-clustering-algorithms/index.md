---
date: '2026-05-25T12:10:00+09:00'
draft: false
title: '机器学习 / 无监督学习 Part 3：KMeans、GMM、层次聚类与 DBSCAN'
summary: "整理主要聚类算法的核心假设：KMeans 的中心原型、spherical KMeans 的方向原型、GMM 的概率云、层次聚类的树结构，以及 DBSCAN / HDBSCAN 的密度连通视角。"
description: "无监督学习第三篇：KMeans、spherical KMeans、Gaussian Mixture Model、hierarchical clustering、DBSCAN 与 HDBSCAN。重点比较不同算法对“簇”的不同假设。"
tags: ["Unsupervised Learning", "Clustering", "KMeans", "Spherical KMeans", "GMM", "EM Algorithm", "Hierarchical Clustering", "DBSCAN", "HDBSCAN", "Representation Geometry"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习3-kmeansgmm层次聚类与dbscan/
---

# 机器学习 / 无监督学习 Part 3：KMeans、GMM、层次聚类与 DBSCAN

前两篇主要处理“空间”和“图”：

$$
\text{PCA / whitening} \longrightarrow \text{邻域图} \longrightarrow \text{spectral embedding}
$$

这一篇开始进入聚类算法本身。但聚类算法不只是“把数据分组”的工具。每一种算法都暗含一个问题：

> 你认为“簇”应该长什么样？

KMeans 认为簇像围绕中心的紧凑团块。spherical KMeans 认为簇像单位球面上的语义方向。GMM 认为簇像一个概率分布。层次聚类认为簇可以从细到粗组成一棵树。DBSCAN 则认为簇是高密度连通区域。

所以这一篇的主线是：

$$
\text{中心原型} \longrightarrow \text{方向原型} \longrightarrow \text{概率分布} \longrightarrow \text{层次树} \longrightarrow \text{密度连通}
$$

---

## 1. KMeans：中心原型聚类

KMeans 的问题可以写成一句话：

> 能不能用 $K$ 个中心点代表整批数据？

设数据为

$$
x_1,x_2,\ldots,x_n,
$$

每个点被分到某个簇

$$
c_i\in\{1,\ldots,K\},
$$

每个簇有一个中心

$$
\mu_1,\mu_2,\ldots,\mu_K.
$$

KMeans 的目标函数是

$$
\sum_{i=1}^{n}\lVert x_i-\mu_{c_i}\rVert^2.
$$

也就是让每个点到自己所属中心的平方距离之和尽量小。

这直接决定了 KMeans 的偏好：

```text
有明确中心
点围绕中心紧凑分布
簇形状接近球形
不同簇方差不要差太多
```

因此 KMeans 不是一般意义上的“密度聚类”，而是一种 **中心原型聚类**。

---

## 2. Lloyd 算法

KMeans 的目标同时包含簇分配 $c_i$ 和中心 $\mu_k$，直接求全局最优很难。Lloyd 算法采用交替优化：

```text
初始化 K 个中心
重复：
  1. assignment step：每个点分给最近中心
  2. update step：每个中心更新为簇内均值
直到收敛
```

assignment step 是

$$
c_i=\arg\min_k \lVert x_i-\mu_k\rVert^2.
$$

update step 是

$$
\mu_k=\frac{1}{|C_k|}\sum_{i:c_i=k}x_i.
$$

这两步都很自然。中心固定时，每个点分给最近中心会让目标最小；分组固定时，簇内均值就是最小化平方误差的最优中心。

因此 Lloyd 每一步都会让目标函数不增加。但它只能保证收敛到局部最优，不能保证全局最优。

这也是为什么实际使用中常见：

```text
k-means++
多随机初始化 n_init
选择目标函数最低的一次
```

---

## 3. KMeans 在 embedding 里的解释

如果把 KMeans 用在 BERT 或 CLIP embedding 上，它等价于假设：

> 每个簇中心代表一个语义原型，样本属于离自己最近的语义原型。

比如在文本话题聚类里，某些中心可能对应：

```text
体育 / 比赛 / 球队
科技 / 图像 / 系统
航天 / NASA / orbit
政治 / 政府 / election
```

但这里的“近”默认是欧氏距离：

$$
\lVert x_i-\mu_k\rVert^2.
$$

这不一定等于语义近。BERT embedding 里可能混入：

- 文本长度；
- 高频词；
- 文体；
- pooling 方式带来的偏移；
- 各向异性 common direction；
- 大方差非语义方向。

所以直接 KMeans 通常只是 baseline。更常见的文本 embedding 流程是：

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

## 4. Spherical KMeans：方向原型聚类

spherical KMeans 可以理解为：

> 把所有向量放到单位球面上，然后按方向相似度聚类。

先对样本做 L2 normalize：

$$
\hat{x}_i=\frac{x_i}{\lVert x_i\rVert}.
$$

这样

$$
\lVert \hat{x}_i\rVert=1
$$

在单位球面上，欧氏距离和内积有关系：

$$
\begin{aligned}
\lVert \hat{x}-\hat{\mu}\rVert^2
&=
2-2\hat{x}^\top \hat{\mu}
\end{aligned}
$$

因此最小化单位向量之间的欧氏距离，等价于最大化内积，也就是最大化 cosine similarity。

spherical KMeans 的 assignment step 是

$$
c_i=\arg\max_k \hat{x}_i^\top \mu_k.
$$

update step 先求簇内平均方向：

$$
m_k=\sum_{i:c_i=k}\hat{x}_i,
$$

再归一化：

$$
\mu_k=\frac{m_k}{\lVert m_k\rVert}.
$$

所以普通 KMeans 的中心是“平均位置”，spherical KMeans 的中心是“平均方向”。

---

## 5. Whitening、L2 Normalize 和 Spherical KMeans

在文本或多模态 embedding 中，spherical KMeans 常和 whitening 搭配：

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

这里每一步处理的问题不同：

| 步骤 | 处理的问题 |
|---|---|
| whitening | 主方向方差差异过大 |
| L2 normalize | 样本向量模长差异 |
| spherical KMeans | 按方向原型聚类 |

所以可以这样理解：

> whitening 先削弱主方向尺度差异，L2 normalize 再消除样本模长差异，最后 spherical KMeans 用内积读语义方向。

这也是为什么在 BERT 聚类实验里，`whiten + l2 + spherical KMeans` 往往是很强的 baseline。

---

## 6. GMM：每个簇是一团概率云

KMeans 里，每个簇是一个中心点。GMM 则把每个簇看成一个 Gaussian 分布。

Gaussian Mixture Model 假设数据来自若干 Gaussian 的混合：

$$
p(x)=\sum_{k=1}^{K}\pi_k\mathcal{N}(x\mid \mu_k,\Sigma_k).
$$

其中：

- $\pi_k$ 是第 $k$ 个簇的混合权重；
- $\mu_k$ 是均值；
- $\Sigma_k$ 是协方差矩阵。

并且

$$
\sum_{k=1}^{K}\pi_k=1.
$$

相比 KMeans，GMM 多了两件事：

```text
簇可以是椭圆形概率云
每个点可以软归属到多个簇
```

对于样本 $x_i$，它属于第 $k$ 个 Gaussian 的后验概率叫 responsibility：

$$
\begin{aligned}
\gamma_{ik}
&=
\frac{\pi_k\mathcal{N}(x_i\mid\mu_k,\Sigma_k)}
{\sum_{\ell=1}^{K}\pi_\ell\mathcal{N}(x_i\mid\mu_\ell,\Sigma_\ell)}
\end{aligned}
$$

这表示第 $k$ 个簇对样本 $x_i$ 负责多少。

---

## 7. EM 算法

GMM 通常用 EM 算法训练。

E-step 固定当前参数，计算每个样本对每个簇的 responsibility：

$$
\begin{aligned}
\gamma_{ik}
&=
\frac{\pi_k\mathcal{N}(x_i\mid\mu_k,\Sigma_k)}
{\sum_{\ell=1}^{K}\pi_\ell\mathcal{N}(x_i\mid\mu_\ell,\Sigma_\ell)}
\end{aligned}
$$

M-step 用这些 soft assignment 更新参数。先定义有效样本数：

$$
N_k=\sum_{i=1}^{n}\gamma_{ik}
$$

更新混合权重：

$$
\pi_k=\frac{N_k}{n}
$$

更新均值：

$$
\begin{aligned}
\mu_k=
\frac{1}{N_k}
\sum_{i=1}^{n}\gamma_{ik}x_i
\end{aligned}
$$

更新协方差：

$$
\begin{aligned}
\Sigma_k=
\frac{1}{N_k}
\sum_{i=1}^{n}\gamma_{ik}(x_i-\mu_k)(x_i-\mu_k)^\top
\end{aligned}
$$

所以 GMM 的更新可以理解成 KMeans 均值更新的 soft version：每个点不是只属于一个簇，而是按概率给多个簇贡献权重。

---

## 8. GMM 和 KMeans 的关系

KMeans 可以看成 GMM 的一个特殊极限：

```text
每个簇都是球形 Gaussian
所有簇协方差相同
分配趋向 hard assignment
```

所以从表达能力看：

```text
KMeans ⊂ GMM
```

GMM 理论上更灵活，可以表达椭圆簇、不同大小的簇和软边界样本。

但这不意味着 GMM 实际上总是更好。高维 embedding 中，full covariance 很难估计。比如 100 维 PCA 后的 full covariance，每个簇就有大约

$$
\frac{100\times 101}{2}=5050
$$

个协方差参数。如果 $K=20$，光协方差就超过十万个参数。

因此，在样本量不大、目标是语义对齐而不是 density modeling 时，spherical KMeans 这种简单方向原型反而可能更稳。

---

## 9. 层次聚类：从细到粗的一棵树

KMeans 和 GMM 都要求先给定 $K$。层次聚类不急着给一个固定划分，而是先构造一棵树。

Agglomerative clustering 是自底向上的版本：

```text
一开始每个点都是一个簇
↓
每次合并最近的两个簇
↓
直到所有点合成一棵树
```

这棵树叫 dendrogram。

关键问题是：两个簇之间的距离怎么算？这由 linkage 决定。

| linkage | 定义 | 直觉 |
|---|---|---|
| single | 最近点对距离 | 只要有短桥就容易合并 |
| complete | 最远点对距离 | 合并后整体仍要紧凑 |
| average | 所有点对距离平均 | 折中看整体接近程度 |
| Ward | 合并后 SSE 增量 | 尽量保持簇内平方误差小 |

Ward linkage 和 KMeans 很像，都偏好紧凑、球形的簇。single linkage 可以追踪长条或链式结构，但容易被噪声点桥接。

层次聚类的价值在于它给的是多尺度结构，而不是单一答案。

比如 20 Newsgroups 的文本可能先形成细粒度话题：

```text
hockey
baseball
space
graphics
medicine
religion
politics
```

再往上合并成更粗的结构：

```text
sports
science / tech
belief / politics
```

这类层级关系是 KMeans 很难直接表达的。

---

## 10. DBSCAN：密度连通聚类

DBSCAN 完全换了一个视角：

> 簇不是围绕中心形成的，而是由高密度区域连起来的。

它有两个核心参数：

- `eps`：邻域半径；
- `min_samples`：邻域内至少需要多少点才算高密度。

对一个点 $x_i$，它的 eps 邻域是

$$
N_\epsilon(x_i)=\{x_j:\lVert x_j-x_i\rVert\le \epsilon\}.
$$

DBSCAN 把点分成三类：

| 点类型 | 含义 |
|---|---|
| core point | eps 邻域内至少有 `min_samples` 个点 |
| border point | 自己不够密，但落在某个 core point 的邻域中 |
| noise point | 既不是 core，也不是 border |

DBSCAN 的簇是由 core point 串起来的高密度连通区域。

所以它能处理 KMeans 不擅长的形状，例如：

```text
弯月形
环形
长条形
带噪声的不规则区域
```

KMeans 会强迫每个点属于某个簇，而 DBSCAN 可以把一些点标成 noise。这在真实文本里很有意义，因为有些文档本来就是混合主题或边界样本。

---

## 11. eps 为什么难选

DBSCAN 最大的问题是 `eps` 强烈依赖数据尺度。

如果所有坐标乘以 10，距离也会变成 10 倍，原来合适的 `eps` 就不再合适。

不同数据集之间也一样：

```text
密集数据集：小 eps 就能连起来
稀疏数据集：同样 eps 可能让所有点都变成 noise
```

高维 embedding 里更麻烦。距离可能集中，导致：

```text
eps 稍小：几乎没人连上
eps 稍大：很多区域突然全连起来
```

因此 DBSCAN 通常不适合直接用在 768 维原始 BERT embedding 上。更稳的做法仍然是：

```text
embedding
↓
PCA / whitening / L2 normalize
↓
选择合适距离
↓
DBSCAN / HDBSCAN
```

HDBSCAN 可以粗略理解成：

> 不固定单一 eps，而是在多个密度尺度上寻找稳定存在的簇。

它缓解了 DBSCAN 对单个 eps 的依赖，但也更复杂。

---

## 12. 几种聚类视角的对比

到这里，可以把这一篇的算法压成一张表：

| 方法 | 它认为簇是什么 |
|---|---|
| KMeans | 围绕中心点的紧凑团块 |
| spherical KMeans | 单位球面上的方向团块 |
| GMM | 一个 Gaussian 概率云 |
| hierarchical clustering | 树上的一个分支 |
| DBSCAN / HDBSCAN | 高密度连通区域 |
| spectral clustering | 图上的强连接子图 |

这张表比公式更重要。因为聚类没有唯一正确答案，不同算法是在用不同语言定义“结构”。

所以真正的问题不是“哪个聚类算法最好”，而是：

> 当前数据里的结构，更像中心、方向、概率云、树分支、密度区域，还是图连通区域？

---

## 总结

这一篇整理了主要聚类算法的核心假设：

1. KMeans 用 $K$ 个中心点解释数据，偏好球形、紧凑、方差相近的簇。
2. spherical KMeans 在单位球面上按方向聚类，更适合 BERT / CLIP 这类语义 embedding。
3. GMM 把每个簇建模成 Gaussian 分布，能表达软归属和椭圆簇，但高维 covariance 估计很贵。
4. 层次聚类给出从细到粗的 dendrogram，适合探索多尺度关系。
5. DBSCAN / HDBSCAN 从密度连通出发，能识别噪声和不规则形状，但对尺度和高维距离敏感。
6. 聚类算法的差异，本质是对“簇应该长什么样”的假设差异。

下一篇进入聚类评估：内部指标、外部指标和稳定性。因为算法一定会给结果，但结果有没有意义，要靠评估来判断。
