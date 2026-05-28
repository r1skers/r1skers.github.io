---
date: '2026-05-25T10:00:00+09:00'
draft: false
title: '机器学习 / 无监督学习 Part 0：路线图与核心问题'
summary: "无监督学习专题的入口笔记。从“没有标签并不等于没有目标”出发，整理表征空间、距离尺度、降维、聚类假设、图结构和聚类评估之间的主线。"
description: "无监督学习路线图：从表征空间和距离几何出发，理解 PCA、whitening、t-SNE/UMAP、spectral embedding、KMeans、GMM、DBSCAN 以及聚类评估的核心位置。"
tags: ["Unsupervised Learning", "Representation Geometry", "Clustering", "Dimensionality Reduction", "PCA", "Whitening", "KMeans", "GMM", "Spectral Clustering", "DBSCAN", "Evaluation"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习0-路线图与核心问题/
---

# 机器学习 / 无监督学习 Part 0：路线图与核心问题

这一篇开始进入无监督学习，但真正想建立的是一条关于 **表征空间如何被理解** 的主线：

$$
\text{数据点} \longrightarrow \text{距离与相似度} \longrightarrow \text{空间几何} \longrightarrow \text{聚类结构} \longrightarrow \text{评估与稳定性}
$$

监督学习里，标签会直接告诉模型什么是目标。无监督学习没有这个外部答案，但这不表示它没有目标。它只是把问题换成了：

> 给定一批样本或 embedding，我们怎样判断里面是否存在可被读出的结构？

这组笔记后面会沿着 PCA、whitening、t-SNE/UMAP、spectral embedding、KMeans、spherical KMeans、GMM、层次聚类、DBSCAN 和聚类评估一路往下走。它既是无监督学习的基础路线，也会接到 BERT、CLIP、VAE 这些模型产生的表征空间上。

---

## 1. 没有标签，不等于没有目标

设数据集为

$$
X=\{x_1,x_2,\ldots,x_n\}, \qquad x_i\in \mathbb{R}^d.
$$

在监督学习里，每个样本通常还有标签

$$
y_i.
$$

模型的任务是学一个函数 $f_\theta(x)$，让预测结果接近 $y$。错了有 loss，loss 会告诉模型往哪里改。

无监督学习没有这个 $y$。因此它不再直接问“应该预测哪个标签”，而是问：

- 数据是否主要分布在某些低维方向上？
- 样本之间的距离或夹角是否有语义意义？
- 数据是否自然形成若干组？
- 这些组是中心型、椭圆型、图连通型，还是密度连通型？
- 聚类结果是稳定结构，还是算法和参数制造出来的偶然现象？

所以，无监督学习不是“漫无目的地看数据”。它的目标更隐蔽：**从数据内部读出结构**。

---

## 2. 表征空间是第一对象

无监督学习常常从一个向量空间开始。图片、文本、音频、地形窗口、神经网络 hidden state，都可以被表示成向量。

比如一篇文档经过 BERT 之后得到一个 768 维 embedding。此时我们真正面对的不是原始文本，而是一批点：

$$
x_i \in \mathbb{R}^{768}.
$$

这时最基础的问题不是“马上聚类”，而是先问这个空间本身是否可靠：

- 向量长度是否携带我们关心的信息？
- 欧氏距离是否等价于语义接近？
- cosine similarity 是否比欧氏距离更自然？
- 某些大方差方向是否支配了所有距离？
- 表征是否挤在一个 narrow cone 里？

这也是为什么 PCA 和 whitening 会出现在聚类之前。它们不是装饰性的预处理，而是在检查和校正表征空间的几何。

---

## 3. 降维：先看空间怎样展开

降维方法的第一层作用是可视化，第二层作用是压缩和去噪，第三层作用是暴露隐藏结构。

这部分会先走四个方法：

| 方法 | 核心问题 |
|---|---|
| PCA | 哪些线性方向保留了最多方差？ |
| whitening | 不同主方向的尺度是否需要被拉平？ |
| t-SNE / UMAP | 高维局部邻域能否在二维图上呈现？ |
| spectral embedding | 样本图的低频结构能否给出新的坐标？ |

PCA 关心的是全局线性方差方向。它回答：

> 数据主要沿哪些正交方向变化？

whitening 接着问：

> 如果少数方向方差特别大，它们是否正在垄断距离计算？

t-SNE / UMAP 则换成邻域视角：

> 高维里互为近邻的点，在二维里能否继续靠近？

spectral embedding 进一步把样本变成图，用图拉普拉斯的特征向量刻画结构。它和 attention 有一点异曲同工：两者都从 pairwise relation 出发，只是 spectral 方法用固定图和谱分解，attention 用可学习的关系权重和信息聚合。

---

## 4. 聚类：不同算法在问不同问题

聚类不是“把数据分组”这么简单。每个聚类算法都暗含一种对簇结构的假设。

| 方法 | 它在问的问题 |
|---|---|
| KMeans | 能否用 $K$ 个中心点代表数据？ |
| spherical KMeans | 能否用 $K$ 个语义方向代表单位球面上的数据？ |
| GMM | 数据能否看成若干 Gaussian 分布的混合？ |
| hierarchical clustering | 数据是否存在从细到粗的层级结构？ |
| spectral clustering | 样本图是否存在弱连接的子图？ |
| DBSCAN / HDBSCAN | 高密度区域是否形成连通簇？ |

KMeans 偏好中心型、球形、簇内紧凑的结构。放到 BERT embedding 里，它相当于假设每个簇有一个语义原型，样本离哪个原型最近，就属于哪个簇。

spherical KMeans 把关注点从欧氏距离转向方向相似度。经过 whitening 和 L2 normalize 之后，样本被推到更接近各向同性的单位球面上，这时用内积或 cosine similarity 来读语义方向更自然。

GMM 比 KMeans 表达能力更强，因为每个簇不只是一个中心，而是一个概率分布。但这种表达能力有代价：高维 embedding 里估计 covariance 很贵，也更容易不稳定。因此在一些表征聚类实验里，GMM 未必明显超过 spherical KMeans。

层次聚类给出的是树，而不是单一划分。它适合探索话题之间是否存在从细到粗的关系。

DBSCAN 则完全换了视角。它不问中心在哪里，而问高密度区域是否连通。它能识别噪声，但 eps 这个尺度参数非常依赖数据集和预处理。

这一部分最重要的观念是：

> 聚类结果 = 数据几何 + 距离定义 + 算法假设 + 参数选择。

算法改变，问题本身也改变。

---

## 5. 图视角：从局部关系到全局结构

spectral embedding 和 spectral clustering 单独值得拿出来看，因为它们把“点云”改写成了“图”。

给定相似度矩阵 $W$，定义度矩阵

$$
D_{ii}=\sum_j W_{ij},
$$

图拉普拉斯为

$$
L=D-W.
$$

它的关键公式是

$$
f^\top Lf
=
\frac{1}{2}\sum_{i,j}W_{ij}(f_i-f_j)^2.
$$

这句话的意思是：如果 $W_{ij}$ 大，那么点 $i$ 和点 $j$ 在新的坐标函数 $f$ 上就不应该差太远。

所以 spectral embedding 不是像 PCA 那样在特征维度里找方向，而是在样本图上找平滑的非平凡全局模式。第二小、第三小等低频特征向量，可以看成整张图的结构坐标。

这也解释了 spectral clustering 的流程：

$$
\text{原始样本}
\longrightarrow
\text{相似度图}
\longrightarrow
\text{图拉普拉斯低频特征向量}
\longrightarrow
\text{新的结构表示}
\longrightarrow
\text{KMeans}.
$$

也就是说，spectral clustering 并不是不用 KMeans，而是先把样本换到一个更适合分簇的图谱空间里。

---

## 6. 评估：聚类结果不自动可信

聚类算法一定会给结果，但结果有没有意义，需要评估。

评估可以分成三类：

| 类型 | 常见指标 | 回答的问题 |
|---|---|---|
| 内部指标 | silhouette, Davies-Bouldin, Calinski-Harabasz | 几何上是否紧凑分离？ |
| 外部指标 | NMI, ARI, purity | 是否对齐某个参考标签？ |
| 稳定性 | resampling stability, seed stability | 扰动后结构是否还存在？ |

内部指标不需要标签，但它们偏爱几何上紧凑、分离、形状规整的簇。因此 silhouette 高，不一定代表语义好。

外部指标需要参考标签。比如在 20 Newsgroups 上，NMI / ARI / purity 可以用来判断聚类是否对齐话题标签。但标签也不是唯一真理。文本还可以按文体、长度、情绪、词汇风格来组织。

稳定性则问一个更朴素的问题：

> 换随机种子、换子样本、轻微改参数之后，这个结构还在不在？

一次漂亮的聚类结果只能说明它出现过。反复出现，才更像结构。

---

## 7. 和现有笔记的关系

这条无监督学习路线会接到之前几组机器学习笔记上。

在 CLIP 里，图像和文本表示会被 L2 normalize 到单位球面上，然后用内积做相似度。这正好通向 spherical KMeans 和 cosine geometry。

在 Transformer / BERT 表征分析里，我们会关心哪一层 hidden state 更有语义结构、mean pooling 或 CLS pooling 哪个更好、PCA whitening 是否能改善聚类结果，以及几何紧密度是否真的等于语义对齐。

在 VAE 里，latent space 本身也可以被无监督工具检查：二维可视化是否可信、latent code 是否聚成稳定结构、t-SNE 图上的团块是否能经受指标验证。

所以这组笔记不是孤立的“聚类算法列表”，而是给已有模型产生的表征空间配一套诊断工具。

---

## 8. 后续路线

后续几篇暂时按下面顺序展开：

1. **降维与表征几何**：PCA、whitening、t-SNE / UMAP。
2. **图视角**：spectral embedding 与 spectral clustering。
3. **聚类算法**：KMeans、spherical KMeans、GMM、层次聚类、DBSCAN。
4. **聚类评估**：内部指标、外部指标与稳定性。

这条路线的学习原则是：

- 先问方法在解决什么问题；
- 再看最小数学形式；
- 然后讨论它对表征空间的假设；
- 最后用指标和稳定性判断结果是否可信。

---

## 总结

这一篇先把无监督学习的主线钉住：

1. 无监督学习没有外部标签，但它的目标是从数据内部读结构。
2. 表征空间的距离、方向、尺度和邻域关系，会直接影响后续聚类。
3. PCA、whitening、t-SNE/UMAP、spectral embedding 是理解空间几何的工具。
4. KMeans、GMM、层次聚类、spectral clustering、DBSCAN 分别对应不同的簇假设。
5. 聚类结果不能只看一次，必须结合内部指标、外部指标和稳定性。

后面第一篇正式进入 PCA 和 whitening。PCA 负责找到主方向，whitening 负责校正方向尺度；它们会构成后续 embedding 聚类的几何基础。
