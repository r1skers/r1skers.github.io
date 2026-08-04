---
title: "笔记"
description: "当前研究主线、主题档案与基础知识库。"
summary: "按研究问题组织阅读路径，同时保留数学、机器学习、系统与工程的 canonical 知识归档。"
aliases:
  - /study-notes/
  - /notebook/
---

这里同时保留两种组织方式：基础知识按学科归档，研究材料按主题重新编排。同一篇文章只有一个 canonical home，但可以被多个主题档案引用。

<details open>
<summary><strong>当前研究主线</strong></summary>

### 误差分析：从近似到可靠计算

围绕 reference、approximation 与 metric，持续追踪误差的定义、来源、传播、估计、控制和精度—成本权衡。

- [**主线说明** — 误差分析：从近似到可靠计算](/notes/systems/error-analysis/)
- [**Topic 1：Taylor 展开** — 从余项到误差控制](/notes/systems/error-analysis/taylor-expansion/)
- **Topic 2：Softmax 数值误差（研究中）** — 研究 max subtraction、exp、累加、除法、cast 与计算顺序带来的 operation-level error。

<details class="note-subgroup">
<summary><strong>Taylor Topic 的三章</strong></summary>

**I. 误差语言与表示**

- [Taylor 1 — (R)、(O)、(o) 与误差界](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/)
- [Taylor 2 — Lagrange、积分与 Peano 余项](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-2-remainder-forms/)

**II. 界与传播**

- [Taylor 3 — 正确的界为什么可能没有说服力](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/)
- [Taylor 4 — 误差怎样传播](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/)

**III. 误差预算与控制**

- [Taylor 5 — 从步长到 Richardson 外推](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/)
- [Taylor 6 — 把噪声写进误差预算](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-6-statistical-noise/)

</details>

</details>

<details open>
<summary><strong>主题档案</strong></summary>

主题档案把分散在 Notes、Artifacts 和代码仓库中的材料组成完整问题链，不复制原文，也不改变原有 URL。

- [**主题档案总览**](/notes/topics/)
- [**IO-Aware Attention**](/notes/topics/io-aware-attention/) — Online Softmax、FlashAttention、分块复现、数值误差与稀疏近似误差。
- [**Variational Autoencoder**](/notes/topics/variational-autoencoders/) — ELBO、重参数化、最小复现与 CNN-VAE。
- [**表征几何**](/notes/topics/representation-geometry/) — PCA、whitening、聚类评估与 BERT 表征探针。
- [**反问题与可靠计算**](/notes/topics/inverse-modeling/) — forward model、观测、反演、正则化、可信度与项目验证。

</details>

<details>
<summary><strong>基础知识库 · 数学</strong></summary>

<details class="note-subgroup">
<summary><strong>线性代数</strong></summary>

[Part 0 路线图](/notes/math/linear-algebra/note-la-0-foundation/) 从矩阵、线性映射与坐标语言出发，连接空间、方程、谱、分解、近似、稳定性与结构化计算。

- [Part 1 — 向量空间、基、秩与四基本子空间](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)
- [Part 2 — 内积、正交投影与最小二乘](/notes/math/linear-algebra/note-la-2-inner-product-projection/)
- [Part 3 — 线性方程、伪逆与最小范数解](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)
- [Part 4 — 特征值、不变子空间、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)
- [Part 5 — 对称、正规、二次型与谱定理](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)
- [Part 6 — LU、QR、Cholesky、SVD 与极分解](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)
- [Part 7 — 低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/)
- [Part 8 — 条件数、数值稳定性与正则化](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)
- [Part 9 — 矩阵函数、迭代法与结构化计算](/notes/math/linear-algebra/note-la-9-matrix-functions-iterative-structured/)

</details>

<details class="note-subgroup">
<summary><strong>实分析与泛函</strong></summary>

- [实分析 1 — 收敛、唯一性、有界性与柯西列](/notes/math/real-analysis/note-ra-1-convergence-cauchy/)
- [实分析 2 — 确界公理、单调收敛与完备性等价链](/notes/math/real-analysis/note-ra-2-supremum-completeness/)
- [实分析 3 — 度量空间、赋范空间、Hilbert 空间与傅里叶基础](/notes/math/real-analysis/note-ra-3-metric-normed-hilbert-fourier/)
- [实分析 4 — 有界线性算子、对偶空间、谱理论与紧算子](/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact/)
- [实分析 5 — 弱收敛、Hahn–Banach 与 Banach 不动点定理](/notes/math/real-analysis/note-ra-5-weak-convergence-hahn-banach-fixed-point/)
- [实分析 6 — 测度、可测函数与 Lebesgue 积分](/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral/)
- [实分析 7 — MCT、Fatou、DCT 与 (L^p) 空间](/notes/math/real-analysis/note-ra-7-convergence-theorems-lp/)

</details>

<details class="note-subgroup">
<summary><strong>优化与变分</strong></summary>

- [Part 0 路线图 — 从局部几何到约束与变分](/notes/math/optimization-variation/note-opt-0-roadmap/)
- [Part 1 — 梯度、Hessian、Taylor 与凸性](/notes/math/optimization-variation/note-opt-1-gradient-hessian-convexity/)
- [Part 2 — 梯度下降、收敛率与谱滤波](/notes/math/optimization-variation/note-opt-2-gradient-descent/)
- [Part 3 — Newton、阻尼与拟 Newton](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)
- [约束与变分入口 — 拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/)

</details>

<details class="note-subgroup">
<summary><strong>概率与统计</strong></summary>

- [Part 0 路线图 — 从概率空间到统计推断与随机过程](/notes/math/probability/note-prob-0-roadmap/)
- [Part 1 — 概率空间、条件概率、独立性与 Bayes](/notes/math/probability/note-prob-1-probability-space-events/)
- [Part 2 — 随机变量、CDF 与常见分布族](/notes/math/probability/note-prob-2-random-variables-distributions/)
- [Part 3 — 期望、联合分布、条件期望与方差分解](/notes/math/probability/note-prob-3-expectation-conditioning/)
- [Part 4 — 收敛方式、大数定律、中心极限定理与集中不等式](/notes/math/probability/note-prob-4-limits-concentration/)
- [Part 5 — Likelihood、MLE、MAP、区间、检验与 EM](/notes/math/probability/note-prob-5-statistical-inference-em/)
- [Part 6 — 随机过程、Markov 链、排队与尾延迟](/notes/math/probability/note-prob-6-stochastic-processes-queues/)

</details>

<details class="note-subgroup">
<summary><strong>信息论与信息几何</strong></summary>

[共同路线图](/notes/math/information-theory/note-it-0-roadmap/) 从熵、交叉熵、KL 与互信息出发，分流到 Information Geometry 和 Shannon / Source Coding。

- [信息论 Part 1 — 自信息、熵与平均不确定性](/notes/math/information-theory/note-it-1-entropy-self-information/)
- [信息论 Part 2 — 联合熵、条件熵与链式法则](/notes/math/information-theory/note-it-2-joint-conditional-entropy/)
- [信息论 Part 3 — 交叉熵、KL 散度与互信息](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)
- [信息几何 G1 — Score Function 与 Fisher Information](/notes/math/information-geometry/note-ig-1-score-fisher/)
- [信息几何 G2 — KL、Natural Gradient 与 K-FAC](/notes/math/information-geometry/note-ig-2-kl-natural-gradient/)
- [信息几何 G3 — 指数族与 Log-partition](/notes/math/information-geometry/note-ig-3-exponential-family/)
- [信息几何 G4 — Legendre 对偶、Bregman 散度与 KL](/notes/math/information-geometry/note-ig-4-dual-bregman/)
- [Shannon S1 — AEP、典型集与熵的渐近意义](/notes/math/information-theory/note-it-4-aep-typical-set/)

</details>

<details class="note-subgroup">
<summary><strong>信号、系统与复分析</strong></summary>

- [傅里叶变换](/notes/math/linear-systems/note-linsys-1-fourier/)
- [拉普拉斯变换](/notes/math/linear-systems/note-linsys-2-laplace/)
- [RLC 电路：微分方程与拉普拉斯方法](/notes/math/linear-systems/note-linsys-3-laplace-pde/)
- [复变函数：从解析性到留数](/notes/math/complex-analysis/note-math-1-complex-analysis/)

</details>

</details>

<details>
<summary><strong>基础知识库 · 机器学习</strong></summary>

<details class="note-subgroup">
<summary><strong>无监督学习与表征几何</strong></summary>

- [路线图与核心问题](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)
- [PCA、Whitening 与邻域可视化](/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
- [Spectral Embedding 与 Spectral Clustering](/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
- [KMeans、GMM、层次聚类与 DBSCAN](/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
- [聚类评估、外部指标与稳定性](/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)
- [主题档案：表征几何](/notes/topics/representation-geometry/)

</details>

<details class="note-subgroup">
<summary><strong>CNN 与视觉表征</strong></summary>

- [LeNet-5 到 Modern CNN](/notes/ml/cnn/note-ml-cnn-1-lenet-to-modern/)
- [AlexNet：深度视觉时代的起点](/notes/ml/cnn/note-ml-cnn-2-alexnet/)
- [VGG：深度与小卷积核](/notes/ml/cnn/note-ml-cnn-3-vgg/)
- [ResNet：残差学习与退化问题](/notes/ml/cnn/note-ml-cnn-4-resnet/)

</details>

<details class="note-subgroup">
<summary><strong>Transformer、ViT 与 CLIP</strong></summary>

- [Transformer：从注意力到编码器](/notes/ml/transformer-vit-clip/note-ml-transformer-1-attention-to-encoder/)
- [ViT：从图像分块到注意力分类](/notes/ml/transformer-vit-clip/note-ml-vit-1-patches-to-attention/)
- [CLIP：从对比学习到图文共享空间](/notes/ml/transformer-vit-clip/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details class="note-subgroup">
<summary><strong>生成模型</strong></summary>

- [主题档案：Variational Autoencoder](/notes/topics/variational-autoencoders/)
- [VAE 的基本思想与 ELBO 推导](/notes/ml/generative-models/note-ml-gen-1-vae-elbo/)
- [VAE 的最小复现](/notes/ml/generative-models/note-ml-gen-2-vae-minimal/)
- [CNN-VAE：从 MLP 到卷积结构](/notes/ml/generative-models/note-ml-gen-3-cnn-vae/)

</details>

</details>

<details>
<summary><strong>基础知识库 · 系统、物理与工程</strong></summary>

<details class="note-subgroup">
<summary><strong>系统与计算</strong></summary>

- [主题档案：IO-Aware Attention](/notes/topics/io-aware-attention/)
- [主题档案：反问题与可靠计算](/notes/topics/inverse-modeling/)
- [误差分析主线](/notes/systems/error-analysis/)

</details>

<details class="note-subgroup">
<summary><strong>量子力学</strong></summary>

- [从薛定谔方程到波函数](/notes/science/quantum-mechanics/note-qm-1-schrodinger/)
- [电子如何分布](/notes/science/quantum-mechanics/note-qm-2-fermions/)

</details>

<details class="note-subgroup">
<summary><strong>岩体力学</strong></summary>

- [矿物组成、结构特征与结构面基础](/notes/science/rock-mechanics/note-rock-mech-1-basics/)

</details>

</details>

<details>
<summary><strong>问题集与计划</strong></summary>

- [实分析问题集](/notes/problems/real-analysis/)
- [优化与变分问题集](/notes/problems/optimization-variation/)
- [其他问题集](/notes/problems/misc/)

计划中的基础方向包括 GAN、Diffusion、概率图模型、电磁学与电路。研究主题只有在形成明确问题和证据链后才进入“当前研究主线”。

</details>
