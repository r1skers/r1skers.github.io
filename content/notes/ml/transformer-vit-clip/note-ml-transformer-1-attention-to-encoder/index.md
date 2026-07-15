---
date: '2026-05-12T10:00:00+09:00'
draft: false
title: '机器学习 / Transformer 与序列建模：从注意力到编码器'
summary: "从 self-attention 的动机出发，推导 scaled dot-product、multi-head、masking 与 positional encoding，最后用 PyTorch 复现一个最小 encoder-only Transformer，并在两个合成任务上验证 PE 的必要性。"
description: "A study note on Transformer fundamentals — self-attention, multi-head, positional encoding, pre-norm encoder block — with a minimal encoder-only reforge on two synthetic argmax-style tasks."
tags: ["Transformer", "Self-Attention", "Positional Encoding", "PyTorch", "Encoder"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-transformer1-从注意力到编码器/
  - /notes/笔记-机器学习-transformer与序列建模1-从注意力到编码器/
  - /notes/note-ml-transformer-1-attention-to-encoder/
---

# 机器学习 / Transformer 与序列建模：从注意力到编码器

上一组笔记里我把 CNN 系列从 LeNet-5 一直走到了 ResNet，这一篇切到 Transformer。Attention 不是 CNN/RNN 的小改良，是一种**全新的序列处理算子**，所以这一篇从 motivation 开始到 encoder block，最后落到一个 PyTorch 最小复现，并用两个合成任务做 ablation。

复现代码：[paper-reforge/Transformer](https://github.com/r1skers/paper-reforge/tree/main/Transformer)
论文链接：[Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762)

---

# Abstract

- **问题**：CNN 用局部 receptive field 处理序列，long-range 依赖必须靠堆深度才能传到；RNN 串行处理，长序列信息被反复压缩进固定大小 hidden state，而且无法并行。
- **解决方法**：用 **self-attention** 让序列里任意两个位置直接交互，且交互是 **content-based**（按内容相似度）而非 **position-based**（按位置距离）。
- **配件**：
  1. **Scaled dot-product** 控制 softmax 不饱和
  2. **Multi-head** 在多个子空间并行学习相关度模式
  3. **Sinusoidal PE** 显式注入位置信息（attention 本身是 permutation-equivariant 的）
  4. **Pre-norm + residual** 让深堆栈训练稳定（warmup-free）

---

# 1. Motivation：为什么需要 attention

CNN 和 RNN 在序列上各自的局限：

| 架构 | 关系类型 | 远距离信息怎么办 | 并行性 |
| --- | --- | --- | --- |
| CNN | local receptive field | 堆深度（每层扩展感受野） | 高（卷积可并行） |
| RNN | sequential bottleneck | 串行经过 hidden state | 低（顺序依赖） |
| Attention | content-based 全局 | 任意两位置直接交互 | 高（矩阵乘可并行） |

**核心思想**：

> 让序列里任意两个位置之间直接产生交互，而且交互的强度由它们**的内容**决定。

CNN 是 position-based 的局部交互，RNN 是 position-based 的逐步交互，attention 是 **content-based 的全局交互**——这就是它和前两者的本质区别。

## Soft lookup 直觉

我的理解是：把 attention 想成一个 **soft 版字典查询**。

普通字典 (hard lookup)：

```text
给定 query q，字典里若干 (key_i, value_i) 对。
找 key_i == q 的那条，返回 value_i。
```

但是连续向量没法"完全相等"。soft 版：

```text
和每个 key 算相似度 -> 得到一组权重 -> 用权重加权所有 value。
返回的不是某一个 value，而是所有 value 的加权混合。
```

每个 token 同时扮演 **Q (我想要什么)、K (我能提供什么的索引)、V (我实际带的信息载荷)** 三个角色，每个角色是同一个输入经过**三个不同的可学习线性投影**得到的。也就是 **self-attention**——Q/K/V 都来自自己。

---

# 2. Scaled Dot-Product Attention

## 公式

设输入是 $X \in \mathbb{R}^{n \times d}$。三个角色化投影：

$$Q = X W_Q \in \mathbb{R}^{n \times d_k},\quad K = X W_K \in \mathbb{R}^{n \times d_k},\quad V = X W_V \in \mathbb{R}^{n \times d_v}$$

相关度分数（点积）：

$$S = \frac{Q K^\top}{\sqrt{d_k}} \in \mathbb{R}^{n \times n}$$

$S[i, j]$ 就是位置 $i$ 的 query 和位置 $j$ 的 key 的相似度。

行 softmax 归一化：

$$A = \mathrm{softmax}_{\text{row}}(S) \in \mathbb{R}^{n \times n}$$

每一行加起来 = 1，是一个概率分布——"$i$ 对所有 $j$ 的关注权重"。

最后加权 value：

$$\mathrm{Attention}(Q, K, V) = A V \in \mathbb{R}^{n \times d_v}$$

输出第 $i$ 行 = 所有 value 按 $A[i, :]$ 这个权重做加权和。

## 为什么除 $\sqrt{d_k}$


直觉：如果 $q_i, k_j$ 的每个分量近似 i.i.d. 均值 0、方差 1，那么 $\langle q_i, k_j \rangle = \sum_l q_{il} k_{jl}$ 是 $d_k$ 个零均值乘积之和，方差 $\approx d_k$，标准差 $\approx \sqrt{d_k}$。

$d_k$ 越大，分数的 magnitude 就越大。softmax(大数) 趋近 one-hot：梯度容易饱和，训练会变得不稳定或收敛困难。
。

除 $\sqrt{d_k}$ 把分数 std 拉回 $\sim 1$，softmax 输出"软"的分布，梯度健康。

> **除 $\sqrt{d_k}$ 是为了让 softmax 不在维度增大时退化成 argmax**。这是优化问题，不是过拟合问题。

我做了一个小 ablation：随机权重，三个 $d_k$ 设置下看 attention 矩阵的 "sharpness"（每行 max attention weight 的均值），结果（来自 `attention_numpy.py` 的 ablation 部分）：

```text
   d_k | with sqrt(d_k) | no sqrt(d_k)
   ---------------------------------------
     4 |     0.579      |     0.763
    64 |     0.438      |     0.882
   512 |     0.585      |     1.000   <- saturated
```

不除 $\sqrt{d_k}$ 时 $d_k=512$ 直接退化成 one-hot；除了之后无论 $d_k$ 多大都稳定在 0.4-0.6 之间。

---

# 3. Multi-Head Attention

## 为什么

单头 attention 一次只能学**一种**相关度模式。但语言/视觉里的依赖关系是 multi-relational——同一个 token 可能既要看语法关系，又要看语义关系，又要看局部相邻关系。单头被迫把这些都压进一个分布，信息互相干扰。

Multi-head 的思想是：

> 并行跑 $h$ 个独立的 attention，每个头在不同子空间学不同的相关度模式，最后融合。

## Shape 推导

设 $d_{\text{model}} = 8$, $h = 2$，所以 $d_k = d_v = d_{\text{model}} / h = 4$。

```text
X                 : (n, 8)
W_Q^(i)           : (8, 4)            for i = 1..h
Q^(i) = X W_Q^(i) : (n, 4)            K^(i), V^(i) 同理

head_i = softmax(Q^(i) K^(i)^T / sqrt(d_k)) V^(i)  : (n, 4)

concat(head_1, head_2)            : (n, 8)     = (n, h * d_v)

W_O                                : (8, 8)
Output = concat(...) W_O           : (n, 8)    回到 d_model
```

两个关键点：
1. **$d_k = d_{\text{model}}/h$ 是参数量约定**——让总参数量 $\approx$ 单头版本，不是数学必须
2. **$W_O$ 必须有**——concat 几何上是"分块独立"（维度 $0..d_k$ 来自 head 1，$d_k..2d_k$ 来自 head 2），head 之间不通气。$W_O$ 是一个 $(d_{\text{model}}, d_{\text{model}})$ 的可学习线性变换，把 $h$ 个 head 的信息**混合**起来


## 实现技巧：一次大投影 + reshape

工程实现里不会真的开 $h$ 套独立 $W_Q$，而是**一次大投影** `W_Q : (d_model, d_model)`，再 reshape 成 `(n, h, d_k)`、transpose 成 `(h, n, d_k)`，**并行**算 $h$ 个 attention。

PyTorch 多了 batch 维 B：

```python
# self.W_Q = nn.Linear(d_model, d_model, bias=False)
Q = self.W_Q(x)                                  # (B, n, d_model)
Q = Q.reshape(B, n, h, d_k).transpose(1, 2)      # (B, h, n, d_k)
# K, V 同理
S = Q @ K.transpose(-2, -1) / math.sqrt(d_k)     # (B, h, n, n)
attn = F.softmax(S, dim=-1)
head_out = attn @ V                              # (B, h, n, d_k)
output = head_out.transpose(1, 2).reshape(B, n, d_model)
output = self.W_O(output)
```

注意细节：
- 用 `.transpose(-2, -1)`，不用 `.T`——后者会反转所有轴，3D/4D 张量上会出错
- 用 `.reshape()`，不用 `.view()`——`view` 要求 contiguous，`transpose` 之后通常不是
- `bias=False` 在 Q/K/V 投影上是原论文的设定

## 数值验证

我先用 numpy 写了一个参考版本（`attention_numpy.py`），再用 PyTorch 写 `MultiHeadSelfAttention` (nn.Module)，然后**强制把 numpy 的 $W_Q$ 转置后赋值给 PyTorch 的 `nn.Linear.weight`**
float64 下两边的最大数值差异：

```text
max |out_torch  - out_numpy |  = 6.22e-15
max |attn_torch - attn_numpy|  = 2.22e-16
```

这是 float64 机器精度的下限——**算法层面 bit-equivalent**。
---

# 4. Masking

## Padding mask

batch 里序列长度不一，短的要 pad。Attention 不能让真实 token 关注到 padding 位置（垃圾信息）。做法：在 softmax **之前**，把 $S$ 矩阵对应 pad key 的整列设为 $-\infty$：

$$S[:, j_{\text{pad}}] \leftarrow -\infty,\quad A = \mathrm{softmax}(S)\implies A[:, j_{\text{pad}}] = 0$$

因为 $\mathrm{softmax}(-\infty) = 0$ 严格成立，且 $-\infty$ 在反向传播里不贡献梯度。

PyTorch 实现：

```python
# mask shape (B, n): True = real, False = pad
m = mask[:, None, None, :]                    # (B, 1, 1, n) 广播到 (B, h, n, n)
S = S.masked_fill(~m, float('-inf'))
```

**重要细节**：只 mask **key 维度**（列），不要 mask **query 维度**（行）。如果某个 query 整行 keys 全是 $-\infty$，$\mathrm{softmax}$ 会得到 $\mathrm{NaN}$（分子分母都是 0）。pad 行作为 query 反正不会进 loss，让它的输出是垃圾值无所谓，但**不能让它产生 NaN 污染整个 batch**。

---

# 5. Positional Encoding

## 为什么

Self-attention 是 **permutation-equivariant** （置换等变）的：

> 把 token 顺序打乱，attention 输出也会相应打乱，但**内容完全一样**——它根本不知道谁在前谁在后。

但语言/图像不能没有位置信息（"猫追狗" $\neq$ "狗追猫"）。所以 Transformer 必须**显式注入位置信息**到 token embedding。

## Sinusoidal PE

原论文公式：

$$\mathrm{PE}[pos, 2i] = \sin\!\left(\frac{pos}{10000^{2i / d_{\text{model}}}}\right),\quad \mathrm{PE}[pos, 2i+1] = \cos\!\left(\frac{pos}{10000^{2i / d_{\text{model}}}}\right)$$

偶数维度用 sin、奇数维度用 cos，频率随维度递减（波长从 $2\pi$ 一路涨到 $10000 \cdot 2\pi$）。

## 三个设计理由

### (1) 多频率位置编码

每对 (sin, cos) 维度对应一个频率分量。低维 → 高频（编码精细位置，相邻 token 区分），高维 → 低频（编码粗糙位置，长距离结构）。

> 整个 $d_{\text{model}}$ 维度被一组**几何递降的频率**铺满。这就是傅里叶分解的思想——位置 = 多个频率分量的叠加。

### (2) 相对位置可线性表达

对任意固定 offset $k$，$\mathrm{PE}[pos+k]$ 可以写成 $\mathrm{PE}[pos]$ 的**线性变换**（用 sin/cos 的和差化积公式）。

写成矩阵形式：

$$\begin{bmatrix} \sin(\theta(pos+k)) \\ \cos(\theta(pos+k)) \end{bmatrix} = \begin{bmatrix} \cos(\theta k) & \sin(\theta k) \\ -\sin(\theta k) & \cos(\theta k) \end{bmatrix} \begin{bmatrix} \sin(\theta \cdot pos) \\ \cos(\theta \cdot pos) \end{bmatrix}$$

每对 (sin, cos) 构成一个 2D 平面上的单位向量，offset $k$ 对应在这个平面上**旋转角度** $\theta k$。

**为什么必须 sin 和 cos 配对**：单独 sin 不行。因为 $\sin(\theta(pos+k)) = \sin(\theta pos)\cos(\theta k) + \cos(\theta pos)\sin(\theta k)$，必须有独立的 $\cos(\theta pos)$ 分量才能写成 $\sin(\theta pos)$ 的线性变换。少了 cos，这个线性关系断了。

这个 2D 旋转结构后来被 **RoPE (Rotary Position Embedding)** 推到极致——LLaMA、GPT-NeoX 都用 RoPE。

### (3) 可外推（理论上）

因为是确定性函数，可以给出训练时没见过的更长序列的 PE。实际效果有限，但概念上比 learned PE 自然。

## Sinusoidal vs Learned PE

| 方案 | 工作中 |
| --- | --- |
| Sinusoidal | 原 Transformer (2017)，buffer 不训练 |
| Learned | BERT、ViT，每个位置一个 `nn.Parameter` 向量 |

ViT 实际用的是 learned PE。原论文两种都试过，效果接近，但 learned 需要预定最大长度。

## 实现要点：buffer 而非 parameter

```python
pos = torch.arange(max_len).unsqueeze(1).float()                # (max_len, 1)
div_term = torch.exp(-math.log(10000.0)
                     * torch.arange(0, d_model, 2).float()
                     / d_model)                                  # (d_model/2,)

pe = torch.zeros(max_len, d_model)
pe[:, 0::2] = torch.sin(pos * div_term)
pe[:, 1::2] = torch.cos(pos * div_term)

self.register_buffer('pe', pe)
```

**两个 idiom 提醒**：

1. **log-space 计算频率**：用 `torch.exp(-log(10000) * arange / d_model)` 而不是 `1 / 10000 ** (...)`。前者更数值稳定，也是所有 reference 实现的标准写法（`torch.pow(base, x)` 内部对非整数指数本来就是 `exp(x * log(base))`）。

2. **`register_buffer` 不是 `nn.Parameter`**：buffer 跟着模型 `.to(device)` 走、`save/load` 保存、但**不收梯度**。

   **如果错用 `nn.Parameter(pe)`**：训练时 optimizer 会更新 pe，sinusoidal 表会**漂移成"自己学的某种奇怪东西"**——既不是 sinusoidal 也不是真正的 learned PE。

---

# 6. Encoder Block

## 组件

- **LayerNorm**：对每个样本沿 feature 维做归一化
- **Residual**：$x + \mathrm{Sublayer}(x)$，来自 ResNet
- **FFN (Position-wise Feed-Forward)**：两层 MLP，中间 ReLU/GeLU，$d_{\text{ff}} = 4 d_{\text{model}}$

## LayerNorm vs BatchNorm

为什么 Transformer 用 LN 不用 BN？

| 维度 | BN | LN |
| --- | --- | --- |
| 统计沿什么 | batch 维（跨样本，同一通道） | feature 维（同一样本内） |
| 推理时 | 用 running stats | 直接算 |
| 序列长度可变 | 难处理 | 不影响 |
| Batch size 小 | 统计噪声大 | 不影响 |

**核心**：LN 对每个样本独立做归一化，**跟 batch 完全无关**。NLP 任务里 batch size 普遍小，序列长度可变，BN 的统计假设根本不成立。LN 是同样本跨维度归一（**纵切**），BN 是跨样本同维度归一（**横切**）——你 ECE 做信号处理时这两种思路是完全不同的。

## Pre-Norm vs Post-Norm

两种摆法：

```python
# Post-norm (原论文 2017)：
x  = LayerNorm(x + MHA(x))
y  = LayerNorm(x + FFN(x))

# Pre-norm (现代主流，GPT/LLaMA/ViT)：
x  = x + MHA(LayerNorm(x))
y  = x + FFN(LayerNorm(x))
```

肉眼差异看似很小，训练行为差异巨大。

**关键差异在 residual 的路径**：

- Post-norm：residual 加完之后被 LN 卡了一下。梯度反向必须每层穿过 LN，LN 的 gain/bias 缩放梯度。深堆栈累计扭曲严重——**必须 warmup**（原论文 warmup 4000 步）。
- Pre-norm：LN 在 sublayer 内部，**residual 路径是 $x \to x + \mathrm{Sublayer}(\mathrm{LN}(x))$，一条恒等 highway**。梯度可以从最深处一路无衰减传回浅层。

> **核心一句话**：pre-norm 把 residual 路径保持成 identity，梯度有一条**高速公路**可以无损穿过整个网络。

代价：pre-norm 输出 scale 会随深度增长（没人再归一），所以 pre-norm 架构通常**最后加一个 final LN**：

```text
input -> Embedding + PE -> [Block × L] -> final LayerNorm -> output
```

## FFN：position-wise channel mixing

```text
FFN(x) = activation(x W_1 + b_1) W_2 + b_2
```

- $W_1 \in \mathbb{R}^{d_{\text{model}} \times d_{\text{ff}}}$, $W_2 \in \mathbb{R}^{d_{\text{ff}} \times d_{\text{model}}}$，通常 $d_{\text{ff}} = 4 d_{\text{model}}$
- 激活函数：ReLU (原论文) → GeLU (BERT) → SwiGLU (LLaMA)，逐代变平滑/带 gating
- **Position-wise** = 同一个 MLP 应用到序列里**每个位置**（对位置维 share，对每个位置内部的 $d_{\text{model}}$ 维做非线性）

## 为什么 Attention + FFN 交替

```text
Attention :  token 之间的信息流动   <- token mixing (横向)
FFN       :  每个 token 内部的非线性 <- channel mixing (纵向)
```

- Attention 本身近似线性（softmax 加权和），表达能力薄弱。**它的唯一非线性来自 softmax**，而 softmax 是个**弱**非线性（本质是归一化），不提供任意函数逼近能力。
- FFN 不让位置间通信，但提供位置内的非线性容量。

两者交替 = **横向通信 + 纵向非线性**，这才是 Transformer 表达力的来源。

> **如果删掉 FFN 只堆 attention**，会出现 **rank collapse**——纯 attention 多层堆叠会导致 token 表征逐层趋同，深度越深所有 token 越像同一个向量。相关参考：*Attention is Not All You Need: Pure Attention Loses Rank Doubly Exponentially with Depth* (2021)。

---

# 7. 完整 Encoder Model

一个 encoder-only Transformer 的全貌：

```text
int tokens (B, n)
    -> nn.Embedding(vocab_size, d_model)         : (B, n, d_model)
    -> [+ SinusoidalPositionalEncoding]           : (B, n, d_model)
    -> N x EncoderBlock                           : (B, n, d_model)
    -> final LayerNorm                            : (B, n, d_model)
    -> task-specific head                         : depends
```

对于我们的"指位置"任务，head 是一个 **shared `nn.Linear(d_model, 1)`**：

```python
logits = self.score_head(h).squeeze(-1)   # (B, n, d_model) -> (B, n, 1) -> (B, n)
```

这一层是 shared（跨所有位置共享一份权重），每个位置独立打一个 scalar，最后 `(B, n)` 的 logits 用 `F.cross_entropy(logits, y)` 训练——把序列长度 $n$ 当作类别数。

**这就是 pointer head**：模型不输出类别，而是输出一个分布"我指向输入序列的哪个位置"。BERT 的 SQuAD QA head、DETR 的 query-based detection 都是这个思路。

为什么 score_head 是 shared 而不是 per-position？

- **位置不变性**：是不是答案是个 content question，不取决于位置编号
- **泛化**：shared head 可以应用到任意长度的序列
- **参数少**：$(d_{\text{model}}, 1)$ vs $(n \cdot d_{\text{model}}, n)$，差几百倍

位置信息从哪进来？已经在 PE 里了——每个位置的 repr 是 `token_emb + PE(i) + attention 抽取的全局信息`。score_head 只需要读这个指纹，shared 但能区分。

---

# 8. 实验 1：Argmax Position 任务

## 任务定义

输入：长度 $n$ 的整数序列，值在 $[0, V)$，但保证其中**恰好一个位置**是 $V-1$（unique max）。
输出：这个 max 出现的位置 $\in [0, n)$。

数据生成：

```python
# Sample base values < max
x = torch.randint(0, vocab_size - 1, (B, n))
# Pick random max position per row
y = torch.randint(0, n, (B,))
# Plant the (unique) max via advanced indexing
x[torch.arange(B), y] = vocab_size - 1
```

`x[torch.arange(B), y]` 是 PyTorch 最常用的 **advanced indexing** 之一——"**每行挑一格**"。等价于 for-loop `x[i, y[i]] = ...`，但是向量化的。

## 训练

配置：`vocab=10, n=20, d_model=32, heads=4, layers=2, lr=1e-3, batch=64, steps=2000`。

```text
device = cpu
model params = 25,569
step    0:  init_loss = 2.9592   init_acc = 0.033   (random baseline ~ 0.050)
step  100:  train_loss = 0.0099   val_loss = 0.0098   val_acc = 1.000
step  200:  train_loss = 0.0044   ...                val_acc = 1.000
...
step 2000:  train_loss = 0.0001   val_loss = 0.0001   val_acc = 1.000
final accuracy = 1.000   total time = 15.7s
```

两个理论验证点：

1. **init_loss = 2.9592** ≈ $\log(20) = 2.996$。这正是均匀随机分布在 20 类上的 cross-entropy，**实验值精准命中理论值**，说明初始化 + loss 计算都对。
2. **init_acc = 0.033** ≈ $1/n = 0.05$，统计噪声范围内。

收敛快得离谱——100 步就到 100%。原因：任务结构性极强，模型 25k 参数对这个任务有大量冗余容量。

## Ablation: 6 个 variant 全部 100%

| variant | use_pe | layers | heads | final_acc | steps_to_95 |
| --- | --- | --- | --- | --- | --- |
| baseline | True  | 2 | 4 | 1.000 | 100 |
| no_pe    | False | 2 | 4 | 1.000 | 100 |
| 1_layer  | True  | 1 | 4 | 1.000 | 100 |
| 4_layers | True  | 4 | 4 | 1.000 | 100 |
| 1_head   | True  | 2 | 1 | 1.000 | 100 |
| 8_heads  | True  | 2 | 8 | 1.000 | 100 |

**所有变体都饱和，连 `no_pe` 也是 100%**。这其实暴露了我最初的一个错觉——以为"任务输出是 index，所以必须 PE"。实际上：

> 这个任务是 **content-addressable** 的（找"值是 9 的那个"），不是 **position-addressable** 的。模型只要识别"我的 content 是 9"就赢——它不需要知道自己在哪个位置，只需要把那个位置的 score 调高，其它低。**位置信息是隐含在 (B, n) 输出 layout 里的，不需要 PE 提供**。

**Ablation 方法论的教训**：

> 如果 ablation 全部 work，大概率不是模型 robust，而是 task 没饱和模型。Signal 出现在 capacity 边界。

类比 Stage 1 ResNet：plain20 和 resnet20 在 CIFAR-10 上差不多，真正爆发在 plain56 vs resnet56——深度增加才显现 degradation。

---

# 9. 实验 2：Second-Max Position 任务（强制 PE）

## 任务定义

为了尝试逼出 PE 必要性，把任务改成：

> 序列里有**两个 identical max tokens**（位置 $p_1 \lt p_2$，token 值都是 $V-1$）。输出 **$p_2$**——第二个出现的位置。

数据生成：

```python
# Base values < max
x = torch.randint(0, vocab_size - 1, (B, n))
# Pick two distinct positions per row via argsort-of-random trick
rand_scores = torch.rand(B, n)
perm = rand_scores.argsort(dim=-1)             # 每行一个随机 permutation
pos = perm[:, :2]                              # 取前两个
pos, _ = pos.sort(dim=-1)                      # 排序保证 p1 < p2
p1, p2 = pos[:, 0], pos[:, 1]

# Plant identical max at both positions
batch_idx = torch.arange(B)
x[batch_idx, p1] = vocab_size - 1
x[batch_idx, p2] = vocab_size - 1
return x, p2                                   # label = p2
```

**关键 idiom**：`argsort(torch.rand(B, n), dim=-1)` 是 batched 版的 random permutation——`torch.randperm` 只能单行，这个 trick 一次性给 $B$ 个独立 permutation。

## 为什么这个任务**必须** PE

两个 max 位置：

- token embedding 严格相等（同一个 token id）
- 没有 PE 时：attention 中两位置的 query 严格相等，K/V 也完全一样 → 输出严格相等
- score_head 是 shared linear → **两个位置 score 严格相等**
- `argmax(logits)` 在 tie 时 PyTorch 返回 lower index → 永远预测 $p_1$
- 但 ground truth 永远是 $p_2$ → accuracy = **严格 0**

数学上必然失败，不是"统计上接近 0"。

## Ablation 结果

| variant | use_pe | layers | heads | **final_acc** | steps_to_95 |
| --- | --- | --- | --- | --- | --- |
| baseline | True  | 2 | 4 | **1.000** | 100 |
| **no_pe**    | **False** | 2 | 4 | **0.000** | **----** |
| 1_layer  | True  | 1 | 4 | 1.000 | 100 |
| 4_layers | True  | 4 | 4 | 1.000 | 100 |
| 1_head   | True  | 2 | 1 | 1.000 | 100 |
| 8_heads  | True  | 2 | 8 | 1.000 | 100 |

**`no_pe` 是精确的 0.000**，其它配置全 100%。**Day 2 推 PE 必要性的理论预测在代码上精准复现**。

---

# 10. Attention Visualization

把训练好的模型在一条 sample 序列上做 forward，用 **forward hook** 在每个 EncoderBlock 的 `self.attn` 上挂 hook，捕获 attention 矩阵：

```python
captured = {}
def make_hook(idx):
    def hook(module, inputs, outputs):
        captured[idx] = outputs[1].detach().cpu()   # outputs = (out, attn)
    return hook

for i, block in enumerate(model.blocks):
    block.attn.register_forward_hook(make_hook(i))

model.eval()
with torch.no_grad():
    logits = model(x)
# captured[0], captured[1] 是各 block 的 attention weights, shape (B, h, n, n)
```

## Argmax 任务的 attention

![argmax attention](attn_argmax.png)

- **左**：输入序列（红柱 = max token 在位置 9，绿虚线 = label = 9，橙点线 = pred = 9）
- **中**：layer 0 head-averaged attention，颜色相对均匀，模型还在"摸索"
- **右**：layer 1 head-averaged attention，**column 9 一根垂直亮线**——所有 query 都重度关注 key 位置 9

**怎么读这张图**：纵轴 = query 位置（"我是谁在看"），横轴 = key 位置（"我看向哪里"）。每一**行**是一个 query 的 softmax 分布，加起来 = 1。垂直亮线 = **每一行**都在同一个 column 处亮，意思是"全班同学都在抄 9 号的答案"。

## Second-Max 任务的 attention

![second-max attention](attn_second_max.png)

- **左**：两个红柱（位置 9 和 19），label = 19，pred = 19
- **中**：layer 0 出现两个 attention 斑点（两个 max 位置都被检测到）
- **右**：layer 1 **column 19 一根强亮线，column 9 颜色暗淡**——模型明确选择了第二个 max

**同一个架构，同一个训练时长，唯一差别是任务从"找唯一 max"换成"找第二个 max"**——attention pattern 就从"亮线在 max"变成"亮线在第二个 max"。

层与层的对比也很有意思：layer 0 messy → layer 1 focused。这是 Transformer 多层堆叠的标准画面——**深一点的层做精化，浅一点的层做粗扫**。

## Attention map vs Logits 是两件事

需要区分:
- **Attention map**：信息流动（哪些位置之间传递信号）
- **Score head 输出 logits**：决策（哪个位置赢）

---

# 11. 总结

## Idiom checklist

学到的 PyTorch idiom ：

- **stable softmax**：`exp(x - x.max(dim=-1, keepdims=True))` 防 overflow
- **多头 reshape**：`(B, n, d_model) -> (B, n, h, d_k) -> (B, h, n, d_k)`，先 reshape 再 transpose
- **batched transpose**：`.transpose(-2, -1)`，不是 `.T`（后者反转所有轴）
- **safe reshape**：transpose 之后用 `.reshape()` 不用 `.view()`
- **mask broadcast**：`mask[:, None, None, :]` → `(B, 1, 1, n)` 广播过 head 和 query 维
- **`masked_fill(~m, -inf)`**：mask 应用方向（True = keep）
- **`register_buffer` 而非 `nn.Parameter`**：固定的 PE 表
- **`@torch.no_grad()` 装饰器**：eval 函数标配
- **`F.cross_entropy(logits, y)`** + 三步走 `zero_grad / backward / step`
- **`model.token_emb.weight.grad` 非零** = 整个 autograd 链路完好
- **forward hook**：不改模型代码就能捕获中间张量
- **`x[torch.arange(B), y]` advanced indexing**："每行挑一格"
- **`argsort(torch.rand(B, n))`**：batched 随机 permutation

## 概念 checklist

- attention 是 **content-based 全局交互**，CNN/RNN 是 **position-based**
- `/sqrt(d_k)` 是为了防止 softmax 饱和，不是过拟合
- multi-head 里 $W_O$ 是混合层，不能省
- sinusoidal PE 的 sin/cos 配对构成 **2D 旋转**——这是 RoPE 的前身
- pre-norm 的 **identity-highway** 是深堆栈稳定的关键
- **attention 通信，FFN 思考**——非线性表达靠 FFN
- BN 跨样本（横切），LN 同样本跨维度（纵切）
- ablation 方法论：**所有 variant 都 work** = task 没饱和 model

---

# 复现仓库

完整代码：[github.com/r1skers/paper-reforge/tree/main/Transformer](https://github.com/r1skers/paper-reforge/tree/main/Transformer)

```
Transformer/
├── src/
│   ├── attention_numpy.py       <- numpy 参考实现（金标准）
│   ├── attention.py             <- MultiHeadSelfAttention (PyTorch nn.Module)
│   ├── positional_encoding.py   <- SinusoidalPositionalEncoding
│   ├── transformer_block.py     <- PositionWiseFFN + EncoderBlock (pre-norm)
│   ├── model.py                 <- ArgmaxPositionModel (完整 encoder + pointer head)
│   └── data.py                  <- gen_argmax_batch + gen_second_max_batch
├── tests/                       <- Tests, 100% green
└── experiments/
    ├── train.py                 <- 训练脚本
    ├── ablation.py              <- argmax ablation
    ├── ablation_second_max.py   <- second-max ablation (PE 必要性证据)
    └── visualize_attention.py   <- attention 可视化
```
