---
date: '2026-06-06T00:00:00+09:00'
draft: false
title: "[Artifact-5.2] BERT 线性探针视角 Pilot Note"
summary: "Artifact-5 多视角对照系列的线性探针视角：在 BERT 每一层的文档片段表征上训练逻辑回归，测话题信息的「线性可解码度」随层如何变化，并与随机初始化对照、与 5.1 聚类视角对照——发现监督线性探针能读出无监督聚类完全读不到的话题信息。"
description: "Artifact-5.2 是 BERT 表征探针系列下的线性探针视角 child artifact：复用 5.1 缓存的层间表征，用逐层逻辑回归 + 5 折交叉验证测话题线性可分性，pretrained vs random-init 对照，并与聚类视角三角对照，给出可复现的监督探针完整记录。"
tags:
  - "Artifact"
  - "BERT"
  - "Linear Probe"
  - "Representation Analysis"
  - "Logistic Regression"
  - "20 Newsgroups"
categories:
  - "Artifacts"
weight: 52
math: true
aliases:
  - /artifacts/05-2-linear-probe/
  - /artifacts/bert-linear-probe/
---

项目地址：本地仓库 `D:\Dev\repos\bert-cluster-stability`（暂未推 GitHub）。
这篇 artifact 是 5.2 线性探针视角的完整记录，完成于 2026-06。它和 5.1 共享同一份缓存的 BERT 层间表征，只换了「探针」。

## 1. 目标

5.1 用**无监督聚类**作探针，问"BERT 表征里**有没有自发浮现**的话题结构"。
5.2 换一个问法——用**监督线性探针**：

> **BERT 第 L 层把一篇文档变成的那串数字里，"它属于哪个话题"这个信息，能不能用一个线性分类器轻松读出来？**

更短地说：

**话题信息是否被排布成了一种「线性可读」的几何，且这种可读性随层数怎么变？**

当前结论：

> 预训练 BERT 把话题信息逐层排成越来越线性可读的几何（L12 最强）；但线性可解码本身是个低门槛——**连随机初始化 BERT 都远高于瞎猜**，而且它的可读性随层数**衰减**，与预训练的**上升**正好相反。

---

## 2. 问题设置

### 2.1 数据与模型（与 5.1 完全一致，复用缓存）

| 项目 | 值 |
|---|---|
| 数据集 | 20 Newsgroups（去 headers/footers/quotes，过滤过短文档）|
| 当前 pilot 样本 | `n_docs=2000`, `sample_seed=42` |
| 输入粒度 | 文档片段，前 512 WordPiece tokens，非 padding mean-pool |
| 主模型 | `bert-base-uncased` |
| 对照模型 | 同架构、随机初始化、`seed=1` |
| 探测层 | embedding 层 0 + encoder 层 1..12 = 13 层 |
| 缓存形状 | `(2000, 13, 768)` |

**关键点：embeddings 是从 5.1 的 `outputs/cache/*.npz` 直接读的，5.2 不重跑任何 BERT forward。** 这也是 5.2 / 5.3 并行的前提——三视角共享同一份表征，只换探针。

### 2.2 探针与协议

| 项目 | 值 |
|---|---|
| 探针 | 多分类逻辑回归（multinomial logistic regression）|
| 预处理 | `StandardScaler`（放进 Pipeline，**仅在训练折上 fit**）|
| 评估 | 5 折 StratifiedKFold 交叉验证，报 mean ± std |
| 主指标 | accuracy（辅 macro-F1）|
| 基准线 | chance = 1/20 = 0.05；majority ≈ 0.06 |
| 正则 | `C=1.0`（固定）|

---

## 3. 为什么是「线性」探针

这一节回答一个容易被跳过、但决定整件事意义的问题：为什么探针必须是**线性**的、而且要**弱**？

线性分类器（逻辑回归）的判别规则只有一条——把一个点的 768 个坐标**各乘一个权重、加起来、再加偏置**：

$$
w_1 x_1 + w_2 x_2 + \dots + w_{768} x_{768} + b \;\gtrless\; 0
$$

它的分界面（`=0` 那一面）在几何上**永远是一个超平面（直的）**——式子里没有 $x^2$、没有 $x_i x_j$，所以它**数学上拐不了弯**。

于是有两种可能：

- **直平面就能分开** → 话题信息**摆在明面上、好读**。✅ 这正是我们想测的。
- **必须用弯曲面才分得开** → 信息在，但**缠在一起、藏得深**。

我们**故意只用直的探针**，因为我们测的是"**好不好读**"，不是"**到底有没有**"。换一个强探针（MLP、核方法），就算它把缠在一起的信息抠出来，你测到的也是**探针的本事**，而不是**表征几何的整齐度**。

> **探针的「弱」是设计的一部分**：它让测量只反映"话题信息被排得有多线性可达"，而不是"信息存不存在"。

### 3.1 探针在做什么（内积视角）

逐层逻辑回归，本质是给 20 个话题各训一个**探测器** $w_k$（一支 768 维的方向箭头）。一个点 $x$ 的话题分 = **点与探测器的内积**：

$$
\text{score}_k = \langle x, w_k\rangle + b_k = \|x\|\,\|w_k\|\cos\theta + b_k
$$

内积大 = 点与 $w_k$ 方向越对齐 = 越像话题 k。20 个分打包成一次矩阵乘法 `coef_ @ x`（`coef_` 形状 `(20, 768)`），取最高分即预测。把"考试集"里预测对的比例作为该层 accuracy。

（这个"内积 = 对齐度"的原语，和 Transformer 里 $QK^\top$ 是同一个——注意力测词与词对齐，探针测点与话题方向对齐。）

---

## 4. 主结果：accuracy(L)

固定协议，扫 13 层，pretrained vs random-init：

![线性探针逐层准确率](linear_probe_accuracy.png)

当前观察（5 折 CV accuracy，chance = 0.05）：

| 模型 | L0 | 中段(L4–9) | L12 | 形状 |
|---|---:|---:|---:|---|
| pretrained | 0.563 | ~0.58 平台 | **0.623** | 低起步 → 中段平台 → 末段再升 |
| random-init | **0.380** | ~0.31 | 0.275 | 高起步 → **单调衰减** |

两件值得说的事：

1. **预训练曲线随深度上升**，L10–L12 再抬头，L12 最强——和 5.1 聚类 NMI 的"末段增强"呼应。
2. **随机初始化曲线反向衰减**，但**全程远高于 chance（0.05）**。

### 4.1 random-init 为什么不在地板，而且为什么衰减

L0 是 embedding 层的 mean-pool ≈ **一袋词向量 ≈ BOW 的随机投影**。20NG 的 BOW 本来就线性可分，所以**随机权重在 L0 就能拿 0.38**——这部分可读性是**架构白送的，不是学来的**。

往深走，随机的非线性 mixing 在**逐层破坏**这种线性可读性 → 衰减。而预训练反过来，在**逐层构建**话题几何 → 上升。

> 深度对两个模型做的是**相反的事**：预训练在搭话题结构，随机初始化在销毁输入端的词汇结构。

因此真正归因给"学习"的，不是 pretrained 的绝对值，而是：

$$
\text{预训练贡献}(L) \approx \text{pretrained}(L) - \text{random-init}(L)
$$

这个差随层张开（L12 ≈ 0.62 − 0.28 = 0.34）。

---

## 5. 与 5.1 的对照：可线性解码 ≠ 结构自组织

这是 5.2 真正的 payoff，也是整个"多探针三角测量"的意义所在。

![三视角合成图](three_view_synthesis.png)

**左图（pretrained，归一化）**：把三个视角各自 min-max 归一化后看形状——5.1 聚类 / 5.2 逻辑回归 / 5.3 LDA **在"话题信息在哪层浮现"上基本一致**（早升—中段—末段强升），聚类的深度依赖最强，两条监督探针几乎重叠。→ 三视角**形状互证**。

**右图（random-init，原始单位）**：核心分歧。**聚类趴在地板（NMI ≈ 0.06 ≈ chance），监督探针却有 ~0.38 且随深度衰减。**

同一份随机初始化权重：

- **无监督聚类**说"什么话题结构都没有"；
- **监督线性探针**说"有，而且不少"。

为什么分歧？回到 5.1 的几何解释：随机初始化的表征**各向异性极强**（窄锥，平均成对余弦 ≈ 0.97）。无监督聚类被这个窄锥主方向带偏，只能切出一个与话题无关的 trivial cut；但话题信号**一直在低方差残差里**，监督探针有标签当老师，**直接钻进残差找判别方向**，绕开了主方向。

> **聚类是各向异性的受害者；线性探针对各向异性近乎免疫**（逻辑回归能把可逆线性畸变吸收进权重）。

也就是说：

> **"信息可被线性解码"和"结构会自己聚成簇"是两件解耦的事。单一探针会得出错误结论（"random-init 没有话题信息"），多探针对照才看清真相。**

---

## 6. 5.3 LDA 印证：两个监督最优彼此一致

5.2（逻辑回归，凸优化最优）和 5.3（Fisher LDA，高斯解析最优）走的是**同一套 harness**，只换了估计器。

![LDA 逐层准确率](lda_probe_accuracy.png)

| 模型 | L0 | L12 |
|---|---:|---:|
| LDA pretrained | 0.597 | 0.636 |
| LDA random-init | 0.372 | 0.283 |

LDA 曲线和逻辑回归**几乎重合**。两个出发点完全不同的线性最优（一个靠梯度纠错、一个靠类内/类间散度的解析解）给出同一条曲线 → **这条 `可分性(L)` 不是某个分类器的副产物，是表征的真实性质。**

（实现细节：高维下 `S_W`（768×768）由 ~1600 样本估计、接近奇异，所以 LDA 用 `lsqr + 自动 shrinkage`。这是个小注脚——"解析最优"在高维下**也得正则化**，和逻辑回归的 `C` 是同一件事的两种长相。）

---

## 7. 怎么读"线性可解码"——三条精确边界

为避免把结论说过头，三处用词要拧紧：

1. **是"线性可分 / 可解码"，不是"线性关系"。** y 是 20 个类别不是连续值；问的是"能不能用超平面读出来"，不是 Pearson 相关。
2. **测的是"信息的几何排布"，不是"信息存不存在"。** accuracy 0.62 不代表 BERT 只懂 62% 的话题——它说话题信息里有这么多是**线性够得着**的；换非线性探针可能抠出更多。这是一句关于**表征几何**的陈述。
3. **要扣对照。** 线性可解码是低门槛（架构白送一大半）；预训练的功劳藏在 `pretrained − random` 的差里。

---

## 8. 当前结论

当前 pilot 可以收束成六条：

1. 预训练 BERT 中，话题信息的线性可解码度**随层上升**，L10–L12 最强（L12 acc ≈ 0.62 vs chance 0.05）。
2. 随机初始化 BERT 的线性可解码度**全程远高于 chance**，但随层**衰减**——与预训练相反。
3. random-init L0 的高起点 ≈ BOW 随机投影；可读性主要是**架构白送**，预训练贡献藏在 `pretrained − random` 的差里，且随深度张开。
4. **可线性解码 ≠ 结构自组织**：监督线性探针能读出无监督聚类完全读不到的话题信息（random-init 上聚类趴地板、探针远超 chance）。
5. 这个分歧的几何根源是各向异性——聚类是其受害者，线性探针对其近乎免疫。
6. 逻辑回归与 Fisher LDA 两个监督最优曲线几乎重合 → 结论不是单一估计器的产物。

短版结论：

> Across BERT layers, topic information becomes increasingly **linearly decodable** in pretrained BERT (peaking at L12), but linear decodability is decoupled from unsupervised cluster structure: a linear probe reads topic information well above chance even from random-init BERT — information that clustering, derailed by anisotropy, cannot see at all.

---

## 9. 当前边界

- 只在 20 Newsgroups 上验证；只在 `n=2000` pilot 规模，未全量。
- 对照只 1 个 random seed；`C` 固定未扫。
- 趋势稳健（两探针一致、CV 误差带窄），但**绝对数值是 pilot 级**。
- pooling 仍是 mean-pool，未系统比较 CLS / IDF 加权等。

---

## 10. 下一步

1. 三视角 synthesis 已成图（本页 §5）；下一步是把它写进**整个 umbrella 的综述 + SOP 段落**。
2. 时间允许则 scale 到全量 20NG（窄 scope 验证主效应）。
3. 5.3 Fisher 视角的独立成文（几何/曲率解释 random-init 衰减）。

---

## 附录：复现主链

embeddings 复用 5.1 已缓存的 `outputs/cache/*.npz`（若不存在，先跑 5.1 的 `experiments\extract_embeddings.py`）。

### A.1 逻辑回归探针（5.2）

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_linear_probe.py
.\.venv\Scripts\python.exe experiments\probe\plot_linear_probe.py
```

### A.2 Fisher LDA 探针（5.3，同一 harness）

```powershell
.\.venv\Scripts\python.exe experiments\probe\run_linear_probe.py --probe lda --output outputs/tables/probe/lda_probe.csv
.\.venv\Scripts\python.exe experiments\probe\plot_linear_probe.py --csv outputs/tables/probe/lda_probe.csv --filename lda_probe_accuracy.png
```

### A.3 三视角合成图

```powershell
.\.venv\Scripts\python.exe experiments\synthesis\plot_three_view.py
```
