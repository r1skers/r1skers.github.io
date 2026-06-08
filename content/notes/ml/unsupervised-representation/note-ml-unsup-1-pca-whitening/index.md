---
date: '2026-05-25T10:30:00+09:00'
draft: false
title: '机器学习 / 无监督学习 Part 1：PCA、Whitening 与邻域可视化'
summary: "从 PCA 的最大方差方向开始，理解线性降维、协方差谱分解、whitening 的几何尺度校正，以及 t-SNE / UMAP 这类邻域可视化方法为什么适合提出假设而不能直接证明簇结构。"
description: "无监督学习第一篇：PCA、whitening、t-SNE 与 UMAP。围绕表征空间的方向、尺度、局部邻域和可视化误差，建立后续 embedding 聚类的几何基础。"
tags: ["Unsupervised Learning", "PCA", "Whitening", "t-SNE", "UMAP", "Dimensionality Reduction", "Representation Geometry", "KL Divergence"]
categories: ["Crucible"]
math: true
aliases:
  - /notes/笔记-机器学习-无监督学习1-pcawhitening与邻域可视化/
  - /notes/note-ml-unsup-1-pca-whitening/
---

# 机器学习 / 无监督学习 Part 1：PCA、Whitening 与邻域可视化

这一篇从无监督学习里最基础的几何问题开始：

$$
\text{高维表征} \longrightarrow \text{主方向} \longrightarrow \text{尺度校正} \longrightarrow \text{邻域可视化}
$$

后面的 KMeans、spherical KMeans、GMM、spectral clustering 都默认我们已经有一个“可比较”的向量空间。但 embedding 空间本身并不天然可靠。BERT、CLIP、ViT、VAE 的 latent code 都可能有偏移、各向异性、大方差主方向、局部邻域扭曲等问题。

所以，在聚类之前，先要问：

> 这个空间的距离、方向和尺度，是否真的能承载我们想读出的结构？

这一篇主要是三个工具：

- PCA：找出数据变化最大的线性方向；
- whitening：把主方向上的尺度拉平；
- t-SNE / UMAP：把局部邻域关系画出来，但不把图像当成证明。

---

## 1. PCA：寻找最大方差方向

设中心化后的数据矩阵为

$$
X\in \mathbb{R}^{N\times d},
$$

其中 $N$ 是样本数，$d$ 是特征维度。PCA 就是：

> 找一个单位方向 $w$，让数据投影到这个方向后的方差最大。

单个样本 $x_i$ 在方向 $w$ 上的投影是

$$
z_i=w^\top x_i
$$

第一主成分就是

$$
w_1=\arg\max_{\lVert w\rVert=1}\operatorname{Var}(w^\top x)
$$

这里要求 $\lVert w\rVert=1$，是因为 PCA 比较的是方向，不是向量长度。如果不限制长度，把 $w$ 放大就能让投影方差无限变大。

PCA 的几何直觉是：原来的坐标轴未必顺着数据展开的方向。PCA 会把坐标轴旋转到数据最主要的变化方向上。

---

## 2. 中心化和协方差矩阵

PCA 之前通常先做中心化：

$$
\tilde{x}_i=x_i-\bar{x}
$$

其中

$$
\bar{x}=\frac{1}{N}\sum_{i=1}^N x_i
$$

中心化的意思是把数据整体平移到均值附近。PCA 关心的是“围绕平均值的变化方向”，而不是数据整体离原点有多远。

中心化后，协方差矩阵为

$$
\Sigma=\frac{1}{N}X^\top X
$$

它记录的是每个特征和每个特征之间如何一起变化。PCA 的主方向来自协方差矩阵的特征值分解：

$$
\Sigma v_j=\lambda_j v_j
$$

其中：

- $v_j$ 是第 $j$ 个主成分方向；
- $\lambda_j$ 是该方向上的方差；
- 特征值越大，说明数据沿该方向变化越大。

因此 PCA 的基本流程是：

```text
中心化数据
↓
计算协方差矩阵
↓
特征值分解
↓
按特征值从大到小排序
↓
取前 k 个特征向量作为新坐标轴
```

如果取前 $k$ 个主方向

$$
V_k=[v_1,v_2,\ldots,v_k]
$$

则降维后的表示为

$$
Z=XV_k
$$

---


## 3. PCA 的第二种理解：最小重构误差

PCA 还有一个等价视角：

> 在所有 $k$ 维线性子空间中，PCA 选择让重构误差最小的那个。

如果降维表示为

$$
z_i=V_k^\top x_i
$$

重构为

$$
\hat{x}_i=V_kz_i
$$

PCA 最小化的是

$$
\sum_i\lVert x_i-\hat{x}_i\rVert^2
$$

所以 PCA 是一种最优线性压缩器。这里的两个限制很重要：

- 它是线性的；
- 它按平方重构误差最优。

如果数据结构是弯曲流形，比如 two moons 或 Swiss roll，PCA 只能找一张平直的投影平面，不能真正展开弯曲结构。

---

## 4. Explained Variance

PCA 得到的特征值满足

$$
\lambda_1\ge \lambda_2\ge \cdots \ge \lambda_d
$$

第 $j$ 个主成分解释的方差比例为

$$
\frac{\lambda_j}{\sum_{\ell=1}^{d}\lambda_\ell}
$$

前 $k$ 个主成分累计解释方差为

$$
\frac{\sum_{j=1}^{k}\lambda_j}{\sum_{\ell=1}^{d}\lambda_\ell}
$$

如果前几个主成分解释了非常高的方差，说明数据的大部分变化集中在少数方向上。这在高维 embedding 中很常见，也可能是各向异性的一种信号。

这时要注意的是：高方差方向不一定就是语义方向。它可能对应文本长度、高频词、整体 common component，或者模型表征空间中的某种偏移。

---

## 5. Whitening：把椭圆压成圆

PCA 做了旋转，但没有消除各方向尺度差异。

设协方差矩阵分解为

$$
\Sigma=V\Lambda V^\top
$$

其中

$$
\Lambda=
\operatorname{diag}(\lambda_1,\lambda_2,\ldots,\lambda_d)
$$

PCA 投影为

$$
Z=XV
$$

在 $Z$ 里，各维已经不相关，但第 $j$ 个方向的方差仍然是 $\lambda_j$。

whitening 继续做缩放：

$$
Z_{\text{white}}=XV\Lambda^{-1/2}
$$

其中

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

也就是：

```text
方差大的方向压小
方差小的方向放大
```

最终 whitened data 的协方差接近单位矩阵：

$$
\operatorname{Cov}(Z_{\text{white}})=I
$$

几何上：

```text
PCA       = 旋转坐标轴，把椭圆摆正
whitening = 旋转 + 缩放，把椭圆压成圆
```

---


## 6. Whitening 的正则化味道

whitening 很像一种几何预条件化。它不是在 loss 里加惩罚项，但它确实在抑制大方差方向对距离的支配。

同时，它也有和反问题正则化相似的风险。因为缩放因子是

$$
\frac{1}{\sqrt{\lambda_j}}
$$

如果某个 $\lambda_j$ 很小，这个方向会被大幅放大。若小方差方向主要是噪声，完全 whitening 就会放大噪声。

因此实际中常用截断 whitening：

$$
X_{\text{white},k}=XV_k\Lambda_k^{-1/2}
$$

也就是先保留前 $k$ 个较可靠的 PCA 方向，再 whitening。

还可以加一个稳定项：

$$
X_{\text{white}}=XV(\Lambda+\epsilon I)^{-1/2}
$$

这和 ridge / Tikhonov 正则化的思想很像：不完全相信小特征值方向，给谱缩放加一个地板，避免噪声爆炸。

一个配套的最小实验见：[Artifact-5.1.1：PCA Whitening 如何修复各向异性导致的聚类失败](/artifacts/05-1-1-pca-whitening-demo/)。  
那个 demo 人为加入一个与标签无关的大方差方向，展示普通 KMeans 如何被 nuisance anisotropy 误导，以及 whitening 如何让低能量簇结构重新变得可读。

---

## 7. PCA Whitening 与 ZCA Whitening

常见 whitening 有两种。

PCA whitening：

$$
X_{\text{PCA-white}}=XV\Lambda^{-1/2}
$$

它把数据放在 PCA 坐标系里。

ZCA whitening：

$$
X_{\text{ZCA-white}}=XV\Lambda^{-1/2}V^\top
$$

它先做 PCA whitening，再转回原坐标系。ZCA 的结果仍然白化，但尽量保持和原数据相似。

在图像预处理中，ZCA 曾经比较常见，因为它让白化后的图片仍然看起来像原图。在 embedding 聚类里，我们通常更关心距离和方向，不关心是否回到原坐标系，因此 PCA whitening 更常用。

---

## 8. t-SNE / UMAP：可视化局部邻域

PCA 和 whitening 关心全局线性方向。t-SNE / UMAP 换了一个问题：

> 高维里互为近邻的点，在二维图上能否仍然靠近？

t-SNE 会把高维距离转成邻居概率 $p_{ij}$，再在二维空间里构造邻居概率 $q_{ij}$，然后最小化

$$
D_{\mathrm{KL}}(P\|Q)=\sum_{i,j}p_{ij}\log\frac{p_{ij}}{q_{ij}}
$$

它的重点是保局部邻居关系。若高维里两个点很近，即 $p_{ij}$ 大，但低维里被放远了，即 $q_{ij}$ 小，惩罚会很大。

这解释了 t-SNE 的特点：

- 局部邻居关系相对可信；
- 簇间距离不能过度解释；
- 图上岛的大小和面积不能直接解释；
- 不同 perplexity、初始化和学习率可能给出不同图像。

UMAP 的直觉则更像：

```text
高维数据
↓
构造近邻图
↓
在二维中重建相似的图结构
```

常见参数是 `n_neighbors` 和 `min_dist`。前者控制局部和全局的平衡，后者控制二维图中点可以挤得多紧。

---

## 9. KL：和 VAE 的连接

t-SNE 里的 KL divergence 和 VAE 里的 KL 是同一把尺子，但衡量的对象不同。

VAE 里常见的是

$$
D_{\mathrm{KL}}\left(q_\phi(z\mid x)\middle\|p(z)\right)
$$

它让 encoder 产生的近似后验靠近 prior，通常是标准正态分布。

t-SNE 里是

$$
D_{\mathrm{KL}}(P\|Q)
$$

其中 $P$ 是高维邻居概率，$Q$ 是低维邻居概率。它让二维图中的邻居关系靠近高维空间中的邻居关系。

也就是可以明白：

> KL 是分布对齐的工具；VAE 用它整理 latent space，t-SNE 用它整理可视化中的邻域关系。

---

## 10. t-SNE / UMAP 的误差难以控制

PCA 的误差很清楚。保留前 $k$ 个主成分后，损失了多少方差可以直接计算。

t-SNE / UMAP 的优化目标则不等于人眼看到的几何误差。

肉眼容易解释：

```text
两个簇离得远
这个簇更大
这个簇更紧
这里有明显空隙
```

但算法真正优化的是：

```text
邻居概率是否匹配
近邻图结构是否相似
```

这两者不是一回事。

因此 t-SNE / UMAP 适合提出假设，而不适合直接证明簇结构。更稳健的是：

1. 扫多个参数，而不是只看一张图；
2. 不过度解释簇间距离和面积；
3. 和 PCA / whitening / 原空间指标交叉检查；
4. 最后用聚类指标和稳定性验证。

---

## 11. 实际 embedding 分析中的常见流程

对于 BERT、CLIP 或其他深度表征，常见流程是：

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
可视化或聚类
```

这里每一步都有明确作用：

| 步骤 | 作用 |
|---|---|
| center | 去掉整体均值偏移 |
| PCA | 找主要方向，降噪和压缩 |
| whitening | 拉平主方向尺度，减少大方差方向支配 |
| L2 normalize | 去掉样本模长差异，转向方向几何 |
| t-SNE / UMAP | 观察局部邻域结构 |
| spherical KMeans | 在单位球面上按语义方向聚类 |

这也是为什么在文本 embedding 聚类中，`PCA whitening + L2 normalize + spherical KMeans` 往往比直接 KMeans 更稳。

---

## 总结

这一篇主要是建立了无监督学习的第一层几何基础：

1. PCA 找最大方差方向，本质是旋转坐标轴并做最优线性压缩。
2. PCA 保留的是高方差方向，但高方差不一定等于语义重要。
3. whitening 在 PCA 坐标系里拉平各方向方差，几何上是把椭圆压成圆。
4. whitening 有正则化味道：截断和 $\epsilon$ 项可以防止小特征值方向放大噪声。
5. t-SNE / UMAP 关注局部邻域可视化，但图像中的全局距离、面积和簇数不能直接当结论。
