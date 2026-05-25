---
date: '2026-05-25T11:20:00+09:00'
draft: false
title: '机器学习 / 无监督学习 Part 2：Spectral Embedding 与 Spectral Clustering'
summary: "从样本近邻图出发，理解图拉普拉斯、低频特征向量、spectral embedding 和 spectral clustering。重点解释它们如何把点云改写成图结构表示，以及为什么 spectral clustering 可以看成“先换表达方式，再做 KMeans”。"
description: "无监督学习第二篇：spectral embedding 与 spectral clustering。围绕相似度图、图拉普拉斯、低频特征向量、图上平滑性和 attention 类比，理解基于图结构的非线性聚类。"
tags: ["Unsupervised Learning", "Spectral Embedding", "Spectral Clustering", "Graph Laplacian", "Graph Learning", "KMeans", "Representation Geometry"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习2-spectralembedding与spectralclustering/
---

# 机器学习 / 无监督学习 Part 2：Spectral Embedding 与 Spectral Clustering

上一篇从 PCA、whitening、t-SNE / UMAP 出发，主要讨论的是：

$$
\text{表征空间} \longrightarrow \text{方向与尺度} \longrightarrow \text{局部邻域可视化}
$$

这一篇继续往前走，把“邻域”正式写成一张图：

$$
\text{数据点} \longrightarrow \text{相似度图} \longrightarrow \text{图拉普拉斯} \longrightarrow \text{低频结构表示} \longrightarrow \text{聚类}
$$

spectral embedding 和 spectral clustering 的核心直觉是：

> 不直接相信原始欧氏空间里的形状，而是先根据样本之间的相似度建图，再从图的全局低频模式中读结构。

这和 attention 有一点异曲同工：两者都不是孤立地看每个点，而是先建立点与点之间的关系。区别在于，attention 的关系权重通常是模型学出来的，而 spectral 方法里的图权重通常由距离或近邻规则手工构造。

---

## 1. 从点云到图

设数据点为

$$
x_1,x_2,\ldots,x_n.
$$

在 spectral 方法里，每个样本先被看成图上的一个节点。然后定义样本之间的相似度：

$$
W_{ij}.
$$

如果 $x_i$ 和 $x_j$ 很相似，$W_{ij}$ 大；如果它们相距很远，$W_{ij}$ 小，甚至可以直接设为 0。

常见建图方式有两类。

第一类是 kNN 图：

```text
每个点只连接自己最近的 k 个邻居
```

第二类是 RBF kernel：

$$
W_{ij}=\exp\left(-\frac{\lVert x_i-x_j\rVert^2}{2\sigma^2}\right).
$$

距离越近，权重越接近 1；距离越远，权重越接近 0。

这样就得到相似度矩阵

$$
W\in \mathbb{R}^{n\times n}.
$$

这里要注意：$W$ 的大小由样本数 $n$ 决定，而不是由特征维度 $d$ 决定。这意味着 spectral 方法关注的是样本之间的关系结构。

---

## 2. 度矩阵和图拉普拉斯

每个节点的 degree 定义为它和其他节点连接强度的总和：

$$
d_i=\sum_j W_{ij}.
$$

度矩阵 $D$ 是对角矩阵：

$$
D_{ii}=d_i.
$$

最基础的图拉普拉斯定义为

$$
L=D-W
$$

它最关键的性质是：

$$
\begin{aligned}
f^\top Lf
&=
\frac{1}{2}\sum_{i,j}W_{ij}(f_i-f_j)^2
\end{aligned}
$$

这里 $f$ 是图上的一个函数，也就是给每个节点分配一个数：

$$
x_i \longmapsto f_i.
$$

这个公式的含义非常直接：

> 如果 $W_{ij}$ 很大，也就是节点 $i$ 和节点 $j$ 强连接，那么为了让 $f^\top Lf$ 小，就希望 $f_i$ 和 $f_j$ 不要差太多。

所以图拉普拉斯可以理解成一个“图上平滑性”的矩阵。强连接的点，在新的坐标函数里也应该接近。

---

## 3. 为什么要看低频特征向量

如果我们只最小化

$$
f^\top Lf,
$$

最简单的解是所有节点取同一个值：

$$
f_1=f_2=\cdots=f_n.
$$

这样每一项 $f_i-f_j$ 都是 0，目标函数也就是 0。但这个解没有任何区分能力。

因此需要排除常数解。图拉普拉斯最小的特征值通常是 0，对应常数特征向量：

$$
u_1\propto \mathbf{1}.
$$

这个向量表示整张图作为一个整体，没有任何分裂。

真正有信息的是后面的低频特征向量：

$$
u_2,u_3,\ldots.
$$

它们是图上变化最平滑的非平凡模式。可以把它们理解成图结构中的“低频振动模式”：

- $u_1$：整张图的全局常数模式；
- $u_2$：第一个主要的非平凡划分方向；
- $u_3$：下一个主要变化方向；
- 更高阶特征向量：越来越细的局部变化。

这有点像傅里叶分析里的低频和高频：低频描述整体趋势，高频描述局部细节。

---

## 4. Spectral Embedding：给每个样本换一种表达

如果想把图嵌入到二维，通常取图拉普拉斯的两个非平凡低频特征向量，例如 $u_2$ 和 $u_3$。

每个 $u_j$ 都是长度为 $n$ 的向量：

$$
u_j=
\begin{pmatrix}
u_j(1)\\
u_j(2)\\
\vdots\\
u_j(n)
\end{pmatrix}.
$$

于是第 $i$ 个样本的新坐标可以写成

$$
y_i=(u_2(i),u_3(i)).
$$

如果取 $K$ 个低频模式，也可以写成

$$
y_i=(u_1(i),u_2(i),\ldots,u_K(i)),
$$

具体是否包含常数向量取决于使用哪种 normalized Laplacian 和算法实现。

这里和 PCA 有一个重要区别：

| 方法 | 特征向量长度 | 作用 |
|---|---:|---|
| PCA | $d$ | 在特征空间中找主方向 |
| spectral embedding | $n$ | 在样本图上给每个样本分配结构坐标 |

所以 spectral embedding 不是在原始特征维度里旋转坐标轴，而是根据样本之间的图关系，为每个样本生成一个 structure-aware embedding。

---

## 5. 和 attention 的类比

这个地方很容易联想到 self-attention。

在 self-attention 里，关系矩阵来自

$$
A=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right).
$$

其中 $A_{ij}$ 表示 token $i$ 应该从 token $j$ 那里拿多少信息。然后输出为

$$
H'=AV.
$$

也就是说，每个 token 的新表示是其他 token value 的加权平均。

spectral 方法也先构造一个 pairwise relation matrix：

$$
W_{ij}.
$$

但它不是用 $W$ 去加权汇聚 value，而是构造

$$
L=D-W,
$$

再通过特征分解读出图上的全局低频结构。

可以并排理解：

| 角度 | self-attention | spectral embedding |
|---|---|---|
| 节点 | token / patch | 样本 |
| 关系矩阵 | $A_{ij}$ | $W_{ij}$ |
| 关系来源 | 模型学习、输入动态生成 | 距离、kernel 或 kNN 规则 |
| 表示更新 | 加权聚合 value | 图拉普拉斯特征向量 |
| 目标 | 上下文表示 | 图结构坐标 |

所以，简单总结就是：

```text
attention：学出来的关系图 + 信息聚合
spectral：手工构造的关系图 + 谱分解
```

---

## 6. CLS 和低频特征向量

Transformer 里的 `[CLS]` token 可以理解成一个全局汇总槽。经过多层 attention 后，它从其他 token 聚合信息，形成整个输入的全局表示，再交给分类头或对比学习目标。

spectral embedding 里没有一个额外的 CLS 节点，但图拉普拉斯的低频特征向量承担了另一种全局角色。

最小特征向量

$$
u_1\propto \mathbf{1}
$$

对应整张图的全局常数模式。后面的 $u_2,u_3,\ldots$ 则刻画图的非平凡全局结构。

因此可以这样区分：

| 对象 | 作用 |
|---|---|
| CLS | 从全体 token 聚合出一个 global representation |
| spectral 低频特征向量 | 给每个样本一个在全局图结构中的坐标 |

也就是说，CLS 更像全局读出；spectral embedding 更像给每个点换一种结构化表达方式。

---

## 7. Spectral Clustering：先换表达方式，再 KMeans

spectral clustering 可以压缩成一句话：

> 先用图拉普拉斯的低频特征向量重新表示每个点，再在这个新空间里做 KMeans。

完整流程是：

```text
原始数据点
↓
构造相似度图 W
↓
构造度矩阵 D
↓
构造图拉普拉斯 L
↓
取低频特征向量
↓
得到每个点的 spectral embedding
↓
KMeans 聚类
```

它不是不用 KMeans，而是先把原始空间换成一个更适合 KMeans 的结构空间。

这也是为什么 spectral clustering 能处理 two moons 这类非凸结构。原始二维坐标里，两条月牙不是球形簇，KMeans 很容易切错。但如果先构造近邻图：

```text
同一条月牙内部：近邻连接强
两条月牙之间：近邻连接弱
```

图拉普拉斯的低频模式就会捕捉这种弱连接结构。换到 spectral embedding 空间后，两条月牙往往变得更容易被 KMeans 分开。

---

## 8. 图分割直觉

spectral clustering 背后的聚类观念不是“离哪个中心近”，而是：

> 簇内部连接强，簇之间连接弱。

这和 KMeans 的假设不同。

KMeans 偏好：

```text
围绕中心紧凑分布的球形簇
```

spectral clustering 偏好：

```text
图上强连接的子图，子图之间弱连接
```

因此它更适合非凸结构、流形状结构和一些图连通结构。但这也说明它非常依赖图的构造方式。

---

## 9. 建图参数是核心风险

spectral 方法最脆弱的地方往往不是特征分解，而是 $W$ 怎么建。

如果 kNN 的 $k$ 太小：

```text
图可能断裂成太多碎片
```

如果 $k$ 太大：

```text
本不该连接的区域被连起来，结构被抹平
```

如果 RBF 的 $\sigma$ 太小：

```text
只有极近点之间有边
```

如果 $\sigma$ 太大：

```text
大家都和大家连接，局部结构消失
```

所以 spectral clustering 的参数不只是簇数 $K$，还包括：

- 相似度怎么定义；
- 使用 kNN 图还是全连接 RBF 图；
- kNN 的 $k$；
- RBF 的 $\sigma$；
- 是否使用 normalized Laplacian。

这也是 spectral 方法和 t-SNE / UMAP 的共同点：它们都依赖邻域结构，而邻域结构本身是由参数和距离定义塑造出来的。

---

## 10. 对 embedding 聚类的意义

对于 BERT、CLIP 这类 embedding，spectral clustering 的意义是：

> 不直接要求语义簇是球形或椭圆形，而是检查样本之间的近邻图是否存在弱连接的语义区域。

比如在文本数据里，一个话题可能不是一个完美球形团块，而是由多个子话题连成的区域。KMeans 可能偏向按中心切开，GMM 可能偏向用椭圆拟合，而 spectral clustering 会更关注近邻图上的连通结构。

但高维 embedding 直接建图也会有风险。通常仍然需要：

```text
embedding
↓
center / PCA / whitening / L2 normalize
↓
construct neighbor graph
↓
spectral embedding / spectral clustering
```

也就是说，Part 1 的几何预处理并没有消失，而是变成建图前的基础。

---

## 总结

这一篇建立了 spectral 方法的核心直觉：

1. spectral embedding 先把样本点变成图，再从图拉普拉斯中读取低频结构。
2. 图拉普拉斯的关键公式是 $f^\top Lf=\frac{1}{2}\sum_{i,j}W_{ij}(f_i-f_j)^2$，表示强连接点在新坐标中也应该接近。
3. 低频特征向量不是特征维度里的方向，而是图上每个样本的结构坐标。
4. spectral clustering 可以理解成“先换表达方式，再做 KMeans”。
5. 它和 attention 都从 pairwise relation 出发，但 attention 学关系并聚合信息，spectral 方法手工建图并做谱分解。
6. spectral 方法的成败高度依赖图如何构造。

下一篇进入聚类算法本身：KMeans、spherical KMeans、GMM、层次聚类和 DBSCAN。重点偏向每种算法到底假设“簇”应该长什么样。
