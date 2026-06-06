---
date: '2026-06-06T00:00:00+09:00'
draft: false
title: "[Artifact-5.3] BERT Fisher 几何视角 Pilot Note"
summary: "Artifact-5 多视角对照系列的 Fisher 视角：用 LDA 作监督线性探针（与 5.2 逻辑回归互证），并用 Fisher 迹比 η²=tr(S_B)/tr(S_T) 直接量话题的「类内紧凑 / 类间分离」几何。发现几何（η²）和分类器（准确率）在随机初始化上分道扬镳——揭示出贯穿整个 umbrella 的机制：话题信息藏在低方差方向，重加权的方法才读得到。"
description: "Artifact-5.3 是 BERT 表征探针系列的 Fisher 几何视角 child artifact：复用缓存表征，用 LDA 分类器 + Fisher 迹比双重测量层间话题可分性，统一 5.1 聚类 / 5.2 逻辑回归 / 5.3 Fisher 三视角于'低方差判别方向 + 重加权'一条主线。"
tags:
  - "Artifact"
  - "BERT"
  - "Fisher Discriminant"
  - "LDA"
  - "Representation Analysis"
  - "20 Newsgroups"
categories:
  - "Artifacts"
weight: 53
math: true
aliases:
  - /artifacts/05-3-fisher-view/
  - /artifacts/05-3-fisher-discriminant/
  - /artifacts/bert-fisher/
---

项目地址：本地仓库 `D:\Dev\repos\bert-cluster-stability`（暂未推 GitHub）。
这篇 artifact 是 5.3 Fisher 几何视角的完整记录，完成于 2026-06。它和 5.1 / 5.2 共享同一份缓存的 BERT 层间表征，只换了「探针」。

## 1. 定位：同一份表征，第三把尺子

5.1 用无监督聚类，5.2 用逻辑回归，5.3 用 **Fisher / LDA**。三者是同一张表里的近亲——按"**生成式 vs 判别式**"和"**用不用标签**"两个轴排开：

| | 不给标签（无监督）| 给标签（监督）|
|---|---|---|
| **生成式**（先建模每类点云 $p(x\mid 类)$ 再贝叶斯反推）| **GMM 聚类**（5.1 用过）| **LDA**（5.3）/ QDA |
| **判别式**（不管点云形状，直接画界 $p(类\mid x)$）| — | **逻辑回归**（5.2）|

**关于标签的一个澄清**（贯穿三视角）：话题标签是 **20 Newsgroups 数据集自带的**（每帖发在哪个新闻组 = 它的真话题），不是任何方法"算出来"的。三把尺子**从头就握着同一份真标签**，区别只在用法：

- **5.1 聚类**：分组时**不看**标签（蒙眼），分完才用标签**打分**（NMI）。
- **5.2 / 5.3**：**全程睁眼用**标签。

> 一句话：5.1 是"扣着答案做题、做完对答案"；5.2 / 5.3 是"答案正面朝上做题"。

5.3 真正的独有贡献不是"再做一遍监督线性分类"，而是：**Fisher 给出一个不依赖分类器的纯几何量**，于是我们能把"几何"和"分类器"拆开看——它们会分道扬镳，而分歧本身就是整个 umbrella 的机制所在。

---

## 2. Fisher 几何 η² 是什么（直觉）

### 2.1 信噪比

把每层的点按真话题分成 20 团，看两样东西：

- **团内胖瘦** $S_W$（噪声）：同一话题的文章彼此差多远。
- **团间距离** $S_B$（信号）：不同话题的团心离多远。

$$
J=\frac{S_B}{S_W}=\frac{\text{团间距离}}{\text{团内胖瘦}}=\frac{\text{信号}}{\text{噪声}},\qquad
\eta^2=\frac{S_B}{S_B+S_W}=\frac{J}{J+1}\in[0,1]
$$

射箭比方：两个射手各射一组箭。**每组箭群越紧（$S_W$ 小）、两个靶心离得越远（$S_B$ 大）→ 越容易分清谁射的 → Fisher 越高**；箭群散开或靶心挨近 → 两堆重叠 → Fisher 低。

$\eta^2$ 读作"**话题解释了总散布的几成**"——其实就是一元方差分析的 $R^2$。$\eta^2=0.15$ 意思是只有 15% 的散布来自"话题不同"，85% 是"同话题里文章千差万别"。

### 2.2 描述性的

$\eta^2$ **不分类任何点、不画任何界**。它只是"拿尺子量一眼分布、报个数"——是 anisotropy / participation ratio 的**带标签版几何诊断**：纯几何、$[0,1]$ 有界、**不求逆**。

具体怎么算（5 步，全用真标签，无聚类、无切线）：

```
1. 用真标签 y 把点分成 20 团        ← 照答案分，不是 KMeans
2. 每团算中心 μ_c，全体算全局中心 μ
3. S_W = Σ 每点到“本团中心”的平方和   (团多胖)
4. S_B = Σ 团心到“全局中心”的平方和   (团心多散)
5. η² = S_B / (S_B + S_W)
```

L12 实数（标准化后）：

| L12 | $S_W$ 团内 | $S_B$ 团间 | η² |
|---|---:|---:|---:|
| pretrained | 1,306,927 | **229,073** | 0.149 |
| random-init | 1,500,838 | **35,162** | 0.023 |

看 $S_B$ 那列：random-init 的 20 个真话题团**团心几乎没分开**（35k vs pretrained 229k），所以 η² 极低。

### 2.3 为什么用迹比，不用完整 Fisher

完整 Fisher 准则要 $S_W^{-1}$，但 768 维、每类才几十样本，$S_W$ 接近奇异。迹比 $\eta^2=\operatorname{tr}(S_B)/\operatorname{tr}(S_T)$ 是**无需求逆、良态**的那一版——它把 768 维**一视同仁地求和**，正是"原封不动的几何"本身，和下面 LDA**分类器**（靠 shrinkage 处理奇异）是两回事。

---

## 3. η² 和 LDA 分类器：区别不是"直 vs 弯"，是"挑不挑方向"

这一点是 5.3 的关键，容易想偏：η²、LDA、逻辑回归**全都是线性的，没有任何曲线参与**（弯的要到 QDA / 核 / MLP，本系列故意不用）。它们真正的分水岭是：

| | 切吗 | **挑方向 / 重加权吗** | 性质 |
|---|---|---|---|
| **Fisher η²** | 不切 | **不挑**——768 维按各自方差**平摊**着量（各向同性）| 描述 |
| **LDA / 逻辑回归** | 直切 | **挑**——专找最能分开的方向，把"低方差但好用"的方向**放大** | 预测 |

两边同源（都来自 $S_W, S_B$ 这套料），用法不同：**η² 平摊量散布；LDA 用 $S_W^{-1}S_B$ 挑最佳切方向。** 同一堆料，一个"平摊着量"，一个"挑方向切"。

> 顺带厘清方向：是 **Fisher 准则 → 推出最佳切法**（LDA 切线的方向 = 让 Fisher 比最大的方向），不是"切完再算 Fisher"。而我们报的 η² 是迹比版——连方向都不挑、不切。

---

## 4. 结果 A：LDA 分类器 ≈ 逻辑回归（稳健性互证）

![LDA 逐层准确率](lda_probe_accuracy.png)

| 模型 | L0 | L12 |
|---|---:|---:|
| LDA pretrained | 0.597 | 0.636 |
| LDA random-init | 0.372 | 0.283 |
| （对照）logreg pretrained | 0.563 | 0.623 |
| （对照）logreg random-init | 0.380 | 0.275 |

LDA（高斯解析最优）和逻辑回归（凸优化最优）**曲线几乎重合**：两个出发点完全不同的线性最优给出同一条 `可分性(L)`。

> 结论：这条曲线**不是某个分类器的副产物，是表征的真实性质**。

和 5.2 一样，random-init 的 LDA 准确率也**远高于 chance（0.05）**、且随层衰减。

---

## 5. 结果 B：Fisher 几何 η²——random-init 极低

![Fisher 几何 η²](fisher_geometry.png)

| 模型 | L0 | 中段 | L11（峰）| L12 |
|---|---:|---:|---:|---:|
| pretrained η² | 0.045 | ~0.10 平台 | **0.157** | 0.149 |
| random-init η² | 0.023 | 0.023 | 0.023 | 0.023 |

- **pretrained**：η² 随层升约 3.5×，三段式（早升—中段平台—L10-12 强升），峰在 L11。但即便最强，也只有 **~15%** 的总方差是类间的。
- **random-init**：**全程接近地板 ~0.023**（纯随机标签的理论底约 $(K-1)/(N-1)\approx0.01$，所以只有微弱真信号），**不随层变化**，比 pretrained 峰值低约 7×。

---

## 6. 核心发现：几何 vs 分类器，在 random-init 上分道扬镳

把结果 A、B 并到一起看 random-init：

| random-init 上的测量 | 结果 | 像谁 |
|---|---|---|
| Fisher **几何** η² | ~0.023，**接近地板** | 像 5.1 聚类 |
| LDA / logreg **分类器**准确率 | 0.28–0.38，**远超 chance** | 像 5.2 探针 |

**同一份随机初始化表征：纯几何说"几乎没有类间结构"，分类器却说"读得出不少话题"。** 怎么会同时成立？

### 6.1 解释：判别信号藏在低方差方向，重加权才看得到

η² 和聚类都**按方差大小看世界**——衡量"类间差异在总方差里占多大份额"。而 BERT（尤其 random-init）的话题判别方向是**低方差**的（藏在窄锥残差里，见 5.1 §15 各向异性分析）。于是：

- η² / 聚类：**按原始方差平摊** → 低方差的判别方向被淹没 → random-init 看着像地板。
- LDA（$S_W^{-1}$）/ 逻辑回归（学权重 $w$）：**重加权方向** → 把低方差判别方向**放大**出来 → random-init 远超 chance。

> 决定"读不读得到话题"的，**不是"监督 vs 无监督"，而是"这个方法重不重加权方向"**。
> Fisher 这一对（几何 η² 不重加权 / LDA 分类器重加权）把这个变量**单独隔离**了出来。

### 6.2 这条线统一了整个 umbrella

| 方法 | 是否重加权方向 | random-init 上 |
|---|---|---|
| 5.1 朴素聚类 | 否 | 地板 |
| **5.1 whitening + 聚类** | **是**（白化 = 重标定各方向）| 把结构解压出来 |
| 5.3 Fisher 几何 η² | 否 | 地板 |
| 5.2 逻辑回归 | 是（学 $w$）| 远超 chance |
| 5.3 LDA 分类器 | 是（$S_W^{-1}$ + shrinkage）| 远超 chance |

> **统一原理：BERT 的话题信息藏在低方差方向。任何重加权方向的方法（白化 / $S_W^{-1}$ / 学权重）都能读到它；任何尊重原始方差几何的方法（朴素聚类 / Fisher 迹比 η²）都看到地板。**

5.1 当初靠 whitening "碰运气"解压结构，5.3 在这里给了它一个**监督几何的解释**：whitening 的重加权，和 LDA 的 $S_W^{-1}$、logreg 的 $w$ 是同一类操作。

---

## 7. 该看什么：η² 与准确率的"落差"

单看一条不够，**把 η²（不挑方向）和 acc（挑最优方向）并起来看，落差才是信息**：

| 情况 | η² | acc | 读出 |
|---|---|---|---|
| 信号**摆在明面** | 高 | 高 | 话题分离就在大方差方向上，挑不挑都行 |
| 信号**埋在低方差** | **低** | **高** | 原始几何看不出，挑对方向就能切 → **random-init 正是这样** |
| 真没信号 | 低 | 低（≈chance）| 怎么挑都切不开 |

> **落差 = 挑方向（重加权）帮了多大忙 = 话题信号埋得有多低方差。** 这不是泛泛的"有别的因素"，而是**精确指向"低方差判别方向"这一个因素**：它对 η²（按方差看）贡献小，对探针（挑方向）贡献大，两者一比就把它逼出来。

三视角合一句：**聚类问"自发分不分得开"，Fisher η² 问"不挑方向本来分不分得开"，探针问"挑最优方向能不能分开"。**

---

## 8. 三视角合成

![三视角合成图](three_view_synthesis.png)

合成图（左：pretrained 归一化形状；右：random-init 原始单位）用的是三个**分类器/对齐**视角（5.1 NMI / 5.2 logreg acc / 5.3 LDA acc）。Fisher **几何** η² 给它加了第四条线索：右图里监督探针在 random-init 上"远超 chance"，而 η² 告诉你**原始几何其实是地板**——两者之差，正是"重加权"的功劳。

---

## 9. 当前结论

1. LDA（解析最优）与逻辑回归（凸最优）的 `可分性(L)` 曲线几乎重合 → 曲线是表征的真实性质，非估计器副产物。
2. Fisher 几何 η²：pretrained 随层升至 ~0.15（峰 L11，三段式），random-init 全程接近 ~0.023 地板。
3. **几何 vs 分类器在 random-init 上分歧**：纯几何（η²）说"几乎无类间结构"，分类器（LDA/logreg）说"话题可读"。
4. 解释：判别信号在**低方差方向**；按方差看世界的方法（η²/聚类）漏掉，重加权的方法（$S_W^{-1}$ / $w$ / whitening）读到。
5. **这条"低方差方向 + 重加权"统一了整个 umbrella**：决定能否读到话题的不是监督与否，而是是否重加权方向。

短版结论：

> Fisher gives two readings of the same representation: a raw geometry scalar (η², which puts random-init near the floor like clustering) and an LDA classifier (which, like logistic regression, reads random-init well above chance). Their divergence pinpoints the mechanism behind the whole umbrella — topic information lives in low-variance directions, visible only to methods that reweight directions (whitening, $S_W^{-1}$, learned weights), invisible to variance-respecting methods (naive clustering, the Fisher trace ratio).

---

## 10. 当前边界

- 只在 20 Newsgroups、`n=2000` pilot 规模、单 random seed。
- η² 是**全局各向同性**的粗粒度几何量（迹比），不分方向；它和分类器准确率本就度量不同侧面，"η² 平 / 分类器衰减"这类细节差异不宜过度解读。
- η² 依赖标签集：换一套标签（如情感而非话题）会变；它是"**第 L 层表征在 20NG 话题视角下的几何性质**"，非脱离任务的内禀属性。
- 完整 Fisher 判别（$S_W^{-1}S_B$ 特征谱）未做——刻意用迹比避开高维奇异。
- "低方差方向 + 重加权"是机制**假说**，与 5.1 各向异性几何、5.1.1 合成 demo 自洽，但未在 BERT 上做方向级因果验证。

---

## 附录：复现主链

embeddings 复用缓存的 `outputs/cache/*.npz`（若不存在，先跑 `experiments\extract_embeddings.py`）。

### A.1 LDA 分类器（结果 A）

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_linear_probe.py --probe lda --output outputs/tables/probe/lda_probe.csv
.\.venv\Scripts\python.exe experiments\probe\plot_linear_probe.py --csv outputs/tables/probe/lda_probe.csv --filename lda_probe_accuracy.png
```

### A.2 Fisher 几何 η²（结果 B）

```powershell
.\.venv\Scripts\python.exe experiments\probe\fisher_geometry.py
```

### A.3 三视角合成图

```powershell
.\.venv\Scripts\python.exe experiments\synthesis\plot_three_view.py
```
