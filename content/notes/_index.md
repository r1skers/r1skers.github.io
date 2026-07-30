---
title: "笔记"
description: "课程笔记与自学记录。"
summary: "课程笔记与自学记录目录。"
aliases:
  - /study-notes/
  - /notebook/
---

<details open>
<summary><strong>数学</strong></summary>

<details class="note-subgroup">
<summary><strong>线性代数</strong></summary>

以定义、定理和证明为主线；Part 0 给出全系列静态路线，后续九篇依次承接代数结构、几何、方程、谱、分解、近似、稳定性与计算。

- [**Part 0** — 矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)
- [**Part 1** — 向量空间、基、秩与四基本子空间](/notes/math/linear-algebra/note-la-1-vector-spaces-rank/)
- [**Part 2** — 内积、正交投影与最小二乘](/notes/math/linear-algebra/note-la-2-inner-product-projection/)
- [**Part 3** — 线性方程、伪逆与最小范数解](/notes/math/linear-algebra/note-la-3-linear-equations-pseudoinverse/)
- [**Part 4** — 特征值、不变子空间、Schur 与 Jordan](/notes/math/linear-algebra/note-la-4-eigen-schur-jordan/)
- [**Part 5** — 对称、正规、二次型与谱定理](/notes/math/linear-algebra/note-la-5-symmetric-normal-psd-spectral/)
- [**Part 6** — LU、QR、Cholesky、SVD 与极分解](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)
- [**Part 7** — 低秩近似、PCA 与结构化近似](/notes/math/linear-algebra/note-la-7-low-rank-pca/)
- [**Part 8** — 条件数、数值稳定性与正则化](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)
- [**Part 9** — 矩阵函数、迭代法与结构化计算](/notes/math/linear-algebra/note-la-9-matrix-functions-iterative-structured/)

</details>

<details class="note-subgroup">
<summary><strong>实分析与泛函</strong></summary>

- [**实分析 1** — 收敛、唯一性、有界性与柯西列](/notes/math/real-analysis/note-ra-1-convergence-cauchy)
- [**实分析 2** — 确界公理、单调收敛与完备性等价链](/notes/math/real-analysis/note-ra-2-supremum-completeness)
- [**实分析 3** — 度量空间、赋范空间、Hilbert 空间与傅里叶基础](/notes/math/real-analysis/note-ra-3-metric-normed-hilbert-fourier)
- [**实分析 4** — 有界线性算子、对偶空间、谱理论与紧算子](/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact)
- [**实分析 5** — 弱收敛、Hahn-Banach 与 Banach 不动点定理](/notes/math/real-analysis/note-ra-5-weak-convergence-hahn-banach-fixed-point)
- [**实分析 6** — 测度、可测函数与 Lebesgue 积分](/notes/math/real-analysis/note-ra-6-measure-lebesgue-integral)
- [**实分析 7** — MCT、Fatou、DCT 与 L^p 空间](/notes/math/real-analysis/note-ra-7-convergence-theorems-lp)

</details>

<details class="note-subgroup">
<summary><strong>信号与系统</strong></summary>

这条线作为实分析与泛函的应用分支：从 Hilbert 空间、正交展开和算子语言，落到信号与系统里的变换方法（Fourier / Laplace / 线性系统）。

- [**第 1 篇** — 傅里叶变换](/notes/math/linear-systems/note-linsys-1-fourier)
- [**第 2 篇** — 拉普拉斯变换](/notes/math/linear-systems/note-linsys-2-laplace)
- [**第 3 篇** — RLC 电路：微分方程与拉普拉斯方法](/notes/math/linear-systems/note-linsys-3-laplace-pde)

</details>

<details class="note-subgroup">
<summary><strong>优化与变分</strong></summary>

从局部微分结构出发，依次建立凸性、一阶收敛与二阶方法；随后进入约束优化和变分分支。

- [**Part 0 路线图** — 从局部几何到约束与变分](/notes/math/optimization-variation/note-opt-0-roadmap/)
- [**Part 1** — 梯度、Hessian、Taylor 与凸性](/notes/math/optimization-variation/note-opt-1-gradient-hessian-convexity/)
- [**Part 2** — 梯度下降、收敛率与谱滤波](/notes/math/optimization-variation/note-opt-2-gradient-descent/)
- [**Part 3** — Newton、阻尼与拟 Newton](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)
- [**约束与变分入口** — 拉格朗日函数与拉格朗日算子](/notes/math/optimization-variation/note-opt-lagrangian/)

</details>

<details class="note-subgroup">
<summary><strong>概率与统计</strong></summary>

从概率空间与事件代数出发，经随机变量、分布、期望和条件结构，分流到渐近理论、统计推断与随机过程。

- [**Part 0 路线图** — 从概率空间到统计推断与随机过程](/notes/math/probability/note-prob-0-roadmap/)
- [**Part 1** — 概率空间、条件概率、独立性与 Bayes](/notes/math/probability/note-prob-1-probability-space-events/)
- [**Part 2** — 随机变量、CDF 与常见分布族](/notes/math/probability/note-prob-2-random-variables-distributions/)
- [**Part 3** — 期望、联合分布、条件期望与方差分解](/notes/math/probability/note-prob-3-expectation-conditioning/)
- [**Part 4** — 收敛方式、大数定律、中心极限定理与集中不等式](/notes/math/probability/note-prob-4-limits-concentration/)
- [**Part 5** — Likelihood、MLE、MAP、区间、检验与 EM](/notes/math/probability/note-prob-5-statistical-inference-em/)
- [**Part 6** — 随机过程、Markov 链、排队与尾延迟](/notes/math/probability/note-prob-6-stochastic-processes-queues/)

</details>

<details class="note-subgroup">
<summary><strong>信息论与信息几何</strong></summary>

从自信息、熵与 KL 建立共同基础，随后分成 Information Geometry 主线与 Shannon / Source Coding 支线。当前重点在信息几何；Shannon 支线暂止于 AEP 与典型集，不展开信道理论。

- [**Part 0 路线图** — 共同基础与两条分支](/notes/math/information-theory/note-it-0-roadmap/)

**共同基础**

- [**信息论 Part 1** — 自信息、熵与平均不确定性](/notes/math/information-theory/note-it-1-entropy-self-information/)
- [**信息论 Part 2** — 联合熵、条件熵与链式法则](/notes/math/information-theory/note-it-2-joint-conditional-entropy/)
- [**信息论 Part 3** — 交叉熵、KL 散度与互信息](/notes/math/information-theory/note-it-3-cross-entropy-kl-mutual-information/)

**Information Geometry 主线**

- [**G1** — Score Function 与 Fisher Information](/notes/math/information-geometry/note-ig-1-score-fisher/)
- [**G2** — KL 的局部二阶结构、Natural Gradient 与 K-FAC](/notes/math/information-geometry/note-ig-2-kl-natural-gradient/)
- [**G3** — 指数族、Log-partition 与 Expectation Parameter](/notes/math/information-geometry/note-ig-3-exponential-family/)
- [**G4** — Legendre 对偶、Bregman 散度与 KL](/notes/math/information-geometry/note-ig-4-dual-bregman/)

**Shannon / Source Coding 支线**

- [**S1** — AEP、典型集与熵的渐近意义](/notes/math/information-theory/note-it-4-aep-typical-set/)

</details>

<details class="note-subgroup">
<summary><strong>复分析</strong></summary>

- [**复变 1** — 复变函数](/notes/math/complex-analysis/note-math-1-complex-analysis)

</details>

<details class="note-subgroup">
<summary><strong>问题集</strong></summary>

配套笔记的题目，按学科分子页、逐题列举，每题附可展开的参考解答。

- [**实分析**](/notes/problems/real-analysis/) — 数列、完备性、测度、$L^p$；单工具起步，解答先给骨架。
- [**优化与变分**](/notes/problems/optimization-variation/) — 拉格朗日乘子、最大熵、softmax、凸对偶。
- [**其他**](/notes/problems/misc/) — 鸽笼原理等组合 / 离散杂题。

</details>

</details>

<details>
<summary><strong>机器学习</strong></summary>

<details class="note-subgroup">
<summary><strong>无监督学习与表征几何</strong></summary>

从 PCA 与 whitening 开始，沿着方向、尺度、邻域图和聚类评估建立分析 embedding 空间的工具箱。

- [**0. 路线图** — 无监督学习的核心问题](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)
- [**1. PCA / Whitening** — 主方向、尺度校正与邻域可视化](/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/)
- [**2. Spectral 方法** — 图拉普拉斯、结构表示与谱聚类](/notes/ml/unsupervised-representation/note-ml-unsup-2-spectral/)
- [**3. 聚类算法** — KMeans、GMM、层次聚类与 DBSCAN](/notes/ml/unsupervised-representation/note-ml-unsup-3-clustering-algorithms/)
- [**4. 聚类评估** — 内部指标、外部指标与稳定性](/notes/ml/unsupervised-representation/note-ml-unsup-4-cluster-evaluation/)

</details>

<details class="note-subgroup">
<summary><strong>CNN 与视觉表征</strong></summary>

从 LeNet-5 到 ResNet，这一组笔记记录 CNN 从早期手写数字识别，到 ImageNet 大规模分类，再到深层视觉 backbone 的演化。

- [**1. LeNet-5** — 从 LeNet-5 到 Modern CNN](/notes/ml/cnn/note-ml-cnn-1-lenet-to-modern/)
- [**2. AlexNet** — 深度视觉时代的起点](/notes/ml/cnn/note-ml-cnn-2-alexnet/)
- [**3. VGG** — 深度与小卷积核](/notes/ml/cnn/note-ml-cnn-3-vgg/)
- [**4. ResNet** — 残差学习与退化问题](/notes/ml/cnn/note-ml-cnn-4-resnet/)

</details>

<details class="note-subgroup">
<summary><strong>Transformer、ViT 与 CLIP</strong></summary>

从 self-attention 出发复现一个最小 encoder-only Transformer 并验证 PE 必要性，把同一套 encoder 搬到视觉任务上做 ViT，再把两塔拼到同一个共享空间里做 CLIP，完成从单模态到多模态对齐的过渡。

- [**1. Transformer** — 从注意力到编码器](/notes/ml/transformer-vit-clip/note-ml-transformer-1-attention-to-encoder/)
- [**2. ViT** — 从图像分块到注意力分类](/notes/ml/transformer-vit-clip/note-ml-vit-1-patches-to-attention/)
- [**3. CLIP** — 从对比学习到图文共享空间](/notes/ml/transformer-vit-clip/note-ml-clip-1-contrastive-to-shared-space/)

</details>

<details class="note-subgroup">
<summary><strong>生成模型</strong></summary>

- [**1. VAE** — 基本思想与 ELBO 推导](/notes/ml/generative-models/note-ml-gen-1-vae-elbo/)
- [**2. VAE** — 最小复现](/notes/ml/generative-models/note-ml-gen-2-vae-minimal/)
- [**3. CNN-VAE** — 从 MLP 到卷积结构](/notes/ml/generative-models/note-ml-gen-3-cnn-vae/)

</details>

</details>

<details>
<summary><strong>系统与计算</strong></summary>

<details class="note-subgroup">
<summary><strong>误差分析与可靠计算</strong></summary>

以具体 topic 为入口，追踪误差的定义、来源、传播、估计、控制与精度—成本权衡；推导结论与 Error Atlas 中的可复现实验互相校验。

- [**主线说明** — 误差分析：从近似到可靠计算](/notes/systems/error-analysis/)

<details class="note-subgroup">
<summary><strong>Topic 1 — Taylor 展开</strong></summary>

- [**父页面** — 从余项到误差控制](/notes/systems/error-analysis/taylor-expansion/)
- [**Taylor 1** — 先把 \(R\)、\(O\)、\(o\) 与误差界说清楚](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-1-error-language/)
- [**Taylor 2** — Lagrange、积分与 Peano 余项](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-2-remainder-forms/)
- [**Taylor 3** — 正确的界为什么可能没有说服力](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/)
- [**Taylor 4** — 误差怎样传播](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/)
- [**Taylor 5** — 从步长到 Richardson 外推](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-5-deterministic-control/)
- [**Taylor 6** — 把噪声写进误差预算](/notes/systems/error-analysis/taylor-expansion/note-error-taylor-6-statistical-noise/)

</details>

</details>

<details class="note-subgroup">
<summary><strong>底层架构 / AI Infra</strong></summary>

从 GPU 内存层次、IO-aware 算法和推理系统出发，记录 AI infra 里那些真正卡住吞吐、延迟和显存的底层机制。

- [**1. FlashAttention v1** — IO 感知注意力与 tiling-softmax](/notes/systems/ai-infra/note-systems-io-attn-1-flashattention/)
- [**2. Online Softmax** — 原始推导与 top-K fusion](/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/)
- [**3. 复现与验证** — 亲手实现 tiled attention 并用 invariant 验证 tiled==naive](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/)

</details>

<details class="note-subgroup">
<summary><strong>计算科学与高可靠系统设计</strong></summary>

- [**第 1 篇** — 问题背景与空间场构造](/notes/systems/computational-science/note-csys-1-problem-spatial-field)
- [**第 2 篇** — 从地形到时间演化](/notes/systems/computational-science/note-csys-2-terrain-to-time)
- [**第 3 篇** — 从完整轨迹到观测数据](/notes/systems/computational-science/note-csys-3-trajectory-to-observation)
- [**第 4 篇** — 从观测数据到参数反演](/notes/systems/computational-science/note-csys-4-observation-to-inversion)
- [**第 5 篇** — 有限差分梯度与梯度下降](/notes/systems/computational-science/note-csys-5-finite-diff-gradient-descent)
- [**第 6 篇** — 反演结果分析与参数可信度](/notes/systems/computational-science/note-csys-6-inversion-credibility)
- [**第 7 篇** — 从有限差分梯度下降到 L-BFGS 与对数参数化](/notes/systems/computational-science/note-csys-7-lbfgs-log-parameterization)
- [**第 8 篇** — 正则化、先验与稳定反演](/notes/systems/computational-science/note-csys-8-regularization-prior)
- [**第 9 篇** — 平滑项、先验项与正则化强度](/notes/systems/computational-science/note-csys-9-smoothness-prior-strength)
- [**第 10 篇** — 从空间场到稳定反演的完整链条总结](/notes/systems/computational-science/note-csys-10-summary)

</details>

</details>

<details>
<summary><strong>物理与工程</strong></summary>

<details class="note-subgroup">
<summary><strong>量子力学</strong></summary>

- [**第 1 篇** — 从薛定谔到波函数](/notes/science/quantum-mechanics/note-qm-1-schrodinger)
- [**第 2 篇** — 电子如何分布](/notes/science/quantum-mechanics/note-qm-2-fermions)

</details>

<details class="note-subgroup">
<summary><strong>岩体力学</strong></summary>

- [**第 1 篇** — 矿物组成、结构特征与结构面基础](/notes/science/rock-mechanics/note-rock-mech-1-basics)

</details>

</details>

<details>
<summary><strong>计划中</strong></summary>

<details class="note-subgroup">
<summary><strong>待展开方向</strong></summary>

- GAN
- Diffusion
- 概率图模型
- 电磁学
- 电路
- 周易

</details>

</details>
