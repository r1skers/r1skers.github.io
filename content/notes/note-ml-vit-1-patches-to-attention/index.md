---
date: '2026-05-15T10:00:00+09:00'
draft: false
title: '机器学习 / ViT 与视觉 Transformer：从图像分块到注意力分类'
summary: "从'图像即 token 序列'的核心思想出发，推导 patch embedding 与 Conv2d(stride=kernel) 的数学等价性，理清 CLS、learnable PE、reused EncoderBlock 各自承担的角色，最后用 PyTorch 在 MNIST / CIFAR-10 上复现一个最小 ViT，并通过 attention rollout 验证模型确实学到判别 patch。"
description: "A study note on Vision Transformer (ViT) — patch embedding as Conv2d(stride=kernel), CLS token, learnable position embedding, reused encoder block, the inductive-bias trade-off, and attention rollout visualization. Built on top of the Transformer module from the previous note."
tags: ["ViT", "Vision Transformer", "Patch Embedding", "Self-Attention", "Attention Rollout", "PyTorch"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-vit1-从图像分块到注意力分类/
  - /notes/笔记-机器学习-vit与视觉transformer1-从图像分块到注意力分类/
---

# 机器学习 / ViT 与视觉 Transformer：从图像分块到注意力分类

上一篇笔记把 Transformer encoder 从 self-attention 一直推到 pre-norm encoder block。这一篇接着把 **同一套 Transformer encoder 搬到视觉任务上**——也就是 ViT (Vision Transformer)。题目里"从图像分块到注意力分类"概括了这一站的全部新东西：图像不再被 conv 一层层扫，而是被切成 patch、拉平、当成 token 序列丢给 Transformer。

复现代码：[paper-reforge/ViT](https://github.com/r1skers/paper-reforge/tree/main/ViT)
论文链接：[An Image is Worth 16x16 Words (Dosovitskiy et al., 2020)](https://arxiv.org/abs/2010.11929)

---

# Abstract

- **问题**：在 ViT 之前，视觉任务的 SOTA 是 CNN 系。CNN 凭 locality + translation equivariance 两个先天 inductive bias 在中小数据上效率极高。但 NLP 的 Transformer 在大数据下已经超越了所有 task-specific 架构——CV 能否复制这条路？
- **解决方法**：把图像切成 16×16 的不重叠 patch，每个 patch 拉平后过线性投影变成 token，再加 CLS、加 learnable position embedding，**剩下的全部沿用 NLP Transformer encoder**。
- **配件**：
  1. **PatchEmbed** = Conv2d(kernel=P, stride=P) ≡ 切 patch + flatten + Linear（数学等价）
  2. **CLS token** = 共享 `nn.Parameter`，序列首位的"汇总槽"（沿用 BERT）
  3. **Learnable 1D PE** = 直接学，不用 sinusoidal（因为图像分辨率固定，不需要外推）
  4. **复用** Transformer 的 EncoderBlock × L 不改架构
  5. **分类头** = 取 `z_L[:, 0]` 过 LN 过 Linear，**砍掉了 BERT 的 tanh pooler**
- **核心结论**：在足够大的数据上，没有 image-specific inductive bias 的纯 Transformer 能超过 CNN；但在中小数据上 ViT 反而输给 ResNet——**先验是数据的替代品**。

---

# 1. Motivation：图像为什么能当成"句子"

CNN 处理图像的方式是：

```text
image (C, H, W) -> conv1 -> conv2 -> ... -> feature map -> head
```

每一层 conv 用小窗口扫整张图，**locality**（只看邻居）和 **translation equivariance**（窗口扫到哪里都一样）这两个 inductive bias 写进了网络结构本身。这是 CNN 在 ImageNet 时代统治视觉的根本原因——结构上就已经把"图像该怎么处理"的先验拿到了，不需要从数据里学。

但 NLP 的 Transformer 走了一条相反的路：**架构上几乎不带任何关于"语言"的先验**，全靠数据 + 容量学出语言规律。在足够大的数据上，这种"白纸"架构反而超过了 LSTM 这种自带 sequential bias 的架构。

ViT 的赌注：

> **如果数据足够多，纯 Transformer 处理图像也能学出比 CNN 手工先验更精细的视觉规律——locality 不是必须写进架构里的。**

这条赌注论文用 JFT-300M 大规模预训练 + 中小数据下游验证了：
- 在 ImageNet-1k 上从头训：ViT < ResNet（不够数据，吃亏在 inductive bias）
- 在 JFT-300M 预训练 + ImageNet finetune：ViT > ResNet（数据够多，没先验反而是优势）

这就是 abstract 那句 "large scale training trumps inductive bias" 的实证。

---

# 2. PatchEmbed：图像 → token 序列

这是 ViT **唯一真正新的输入端组件**。它做一件事：

```text
(B, C, H, W)  ──PatchEmbed──>  (B, N, d_model)
   一张图像                       N 个 d_model 维 token
```

之后送进 Transformer，模型再也不知道这是张 2D 图像——它就是一个长度 N 的 token 序列，和 NLP 处理一句话在数据结构上无差别。**这就是论文标题 "An Image is Worth 16×16 Words" 的字面意思**。

## 两种数学等价的实现

ViT 论文给出的是"切 patch + flatten + Linear"三步：

```text
Step 1.  把 (C, H, W) 切成 N = (H/P)·(W/P) 个不重叠的 (C, P, P) patch
Step 2.  每个 patch 拉平成 C·P·P 维向量
Step 3.  过一个共享的 Linear(C·P·P, d_model)
```

但实际代码里几乎所有实现都写成一行 `nn.Conv2d`：

```python
self.proj = nn.Conv2d(C, d_model, kernel_size=P, stride=P)
```

**这两种实现在数学上是 bit-exact 等价的**。原因：

| | 切+Linear 路径 | Conv2d(stride=kernel) 路径 |
|---|---|---|
| 输入 | 一个 (C, P, P) 的 patch | 一次 conv 在 (C, P, P) 的窗口内 |
| 运算 | 拉平成 `R^{C·P²}`，过 Linear | 卷积核 (C, P, P) 内积 |
| 参数 | `W_lin ∈ R^{d, C·P²}` | `W_conv ∈ R^{d, C, P, P}` |

**关键**：`W_lin = W_conv.flatten(1)`——把后三维（C, P, P）拍平成一维。两种路径用的是**同一组 48 个数**（CIFAR-10 patch=4 时），只是排成 3D 还是 1D 的区别，PyTorch 默认 C-major 展开顺序两边一致，所以乘出来逐元素相等。

## stride = kernel 是关键

为什么 PatchEmbed 用 conv 但 ViT **不等于 CNN**？关键在 stride：

- **stride < kernel**：窗口滑动重叠 → 这是 CNN 风格的特征提取，输出是密集 feature map
- **stride = kernel**：窗口紧贴不重叠 → 这是 tokenization，输出是 N 个独立 token
- **stride > kernel**：跳跃采样，丢信息，一般不用

所以同一个 `nn.Conv2d` 算子，**stride 的选择决定了它是"feature extractor"还是"tokenizer"**。ViT 选 stride=kernel，把 conv 当一次性的输入压缩用，不当主干。后面的 Transformer encoder 处理的就是 N 个独立 token 之间的全局交互。

## bit-exact 数值验证

我写了两份独立实现 (`PatchEmbedConv` 和 `PatchEmbedUnfold`)，然后做一个 weight transfer 测试：

```python
# Build both modules with same config, cast to float64
conv   = PatchEmbedConv  (img_size=32, patch_size=4, in_chans=3, d_model=128).double()
unfold = PatchEmbedUnfold(img_size=32, patch_size=4, in_chans=3, d_model=128).double()

# Copy conv weights into the linear layer with correct flattening
with torch.no_grad():
    # conv.proj.weight: (128, 3, 4, 4) → flatten(1) → (128, 48)
    unfold.proj.weight.copy_(conv.proj.weight.flatten(1))
    unfold.proj.bias  .copy_(conv.proj.bias)

x = torch.randn(2, 3, 32, 32, dtype=torch.float64)
max_diff = (conv(x) - unfold(x)).abs().max().item()
assert max_diff < 1e-12     # 实测 max_diff ~ 1e-15
```

float64 下两边 max diff 在 $10^{-15}$ 量级，即机器精度下限——**数学层面 bit-equivalent**。这不是"timm 这么写所以是对的"，是数学上必然相等，怎么写都得到同一个结果。

---

# 3. CLS Token：从 BERT 借来的"汇总槽"

PatchEmbed 把图像变成 N 个 token，但分类任务最后只能输出一个 d_model 维表征。怎么把 N 个 token 压成 1 个？两种合法做法：

1. **GAP** (Global Average Pooling)：对所有 N 个 token 输出做均匀平均
2. **CLS token**：在序列最前面塞一个"汇总专用 token"，最后取它的输出

ViT 选了 CLS，直接照搬 **BERT**（Devlin et al., 2018）的设计：

```python
self.cls_token = nn.Parameter(torch.zeros(1, 1, d_model))

# forward 里:
cls = self.cls_token.expand(B, -1, -1)        # (1,1,d) → (B,1,d)
x = torch.cat([cls, x], dim=1)                # (B, N+1, d)
```

## 为什么 CLS 能学到"汇总"

CLS **不来自任何 patch**，是一个独立的共享 `nn.Parameter`——所有图像共用一份初始向量。但它在 self-attention 里和 patch token 是**完全对等**的，没有任何特殊待遇：

```text
每一层 attention 都重复:
  Q_cls (来自 CLS 当前状态) × K_all (所有 token 的 keys)
    -> attention 权重 α
  α × V_all (所有 token 的 values)
    -> CLS 的新状态
```

经过 L 层这种"提问 → 收集 value 加权和"的循环，CLS 最终输出 `z_L^0` 凝聚了全图语义。**整个过程没有显式监督 CLS**——梯度通过最终分类 loss 端到端回流到 cls_token，告诉它"这个起始向量调成什么样，能让模型在 L 层之后从中读出分类信息最容易"。

## 一组容易混的概念

ViT 里有两个东西名字接近但完全不同：

| 对象 | 形状 | 是否 learnable | 是否因图而异 |
|---|---|---|---|
| `cls_token` | (1, 1, d) | ✅ | ❌（所有图共用） |
| `z_L^0`（CLS 位置的最终输出） | (B, d) | ❌（中间张量） | ✅ |

> `cls_token` 像一个**空玻璃瓶**——模型里只有一个，形状固定。
> `z_L^0` 像**装满了水的玻璃瓶**——同一个空瓶，放进不同图像的"水池"走一圈，出来时里面的水各不相同。

训练学的是**瓶子的形状**，不是水的内容。

## CLS vs GAP 的实测对比

论文 Appendix D 实测两种都能工作，效果几乎一样，但有个细节：**GAP 版本需要更小的 learning rate 才能稳定收敛**。所以选 CLS 主要是为了和 BERT 对齐 + 调参更鲁棒，不是数学必然。

---

# 4. Learnable Position Embedding

Self-attention 是 **permutation-equivariant** 的——把 token 顺序打乱，输出也跟着打乱但内容完全一样。所以 Transformer 必须显式注入位置信息，否则模型把图像当成"一袋无序 patch"。

ViT 用 learnable 1D PE：

```python
self.pos_embed = nn.Parameter(torch.zeros(1, N + 1, d_model))     # +1 给 CLS

# forward 里直接相加:
x = x + self.pos_embed       # broadcast (B, N+1, d) + (1, N+1, d)
```

## 为什么是 learnable 而不是 sinusoidal

| | NLP Transformer | ViT |
|---|---|---|
| 选择 | sinusoidal（手工设计） | learnable（直接学） |
| 主要驱动 | 序列长度变化巨大，需要外推 | 输入分辨率固定，不需要外推 |
| 实现 | `register_buffer` | `nn.Parameter` |

ViT 论文 Appendix D.4 实测了三种 PE：
- 无 PE：ImageNet top-1 ≈ 64%
- sinusoidal 1D：≈ 77.5%
- learnable 1D：≈ 77.6%
- learnable 2D（拼接 row + col）：≈ 77.6%

→ **PE 的有无很关键（差 13 个点），具体形式不关键（差 0.1 个点）**。论文选 learnable 主要是实现简单。

## 一个反直觉发现：learnable 1D 自发学出 2D 结构

直觉上图像是 2D 的，PE 也应该是 2D-aware 的。但论文 Fig 10 显示：训练完后，196 个 learnable PE 之间的相似度矩阵自发体现出 **2D 网格结构**——同一行/同一列的 PE 互相更接近。

也就是说，**虽然 PE 是 1D 索引，模型自己从数据里发现了"位置 14 和位置 15 是水平邻居"这种关系**。完美印证了 ViT 的核心论点：图像是 2D 这个先验是冗余的，数据够多模型自己会发现。这也解释了为什么 2D-aware PE 效果不比 1D 好。

## 一个 silent bug 警告

```python
# ✅ 对：参与训练
self.pos_embed = nn.Parameter(torch.zeros(1, N+1, d))

# ❌ 错：永远停在初始零值，相当于"无 PE"
self.register_buffer('pos_embed', torch.zeros(1, N+1, d))
```

写错不会报错，但模型分类准确率会掉 ~13 个点。 `test_pos_embed_is_learnable` 测试专门防这个 bug：

```python
assert isinstance(model.pos_embed, nn.Parameter), "silent bug if it isn't"
assert model.pos_embed.requires_grad
```

---

# 5. 复用 Transformer 的 EncoderBlock

ViT 的主干**完全照搬** NLP Transformer 的 pre-norm encoder block。：

```python
# ViT/src/vit.py
sys.path.append(str(_TRANSFORMER_SRC))   # 加 Transformer 的 src 到路径
from transformer_block import EncoderBlock

# 后面:
self.blocks = nn.ModuleList([
    EncoderBlock(d_model, num_heads, d_ff=d_ff,
                 dropout=dropout, activation='gelu')
    for _ in range(depth)
])
```

唯一需要注意的小细节：

1. **`nn.ModuleList` 而不是普通 list**——只有前者会把 block 注册为子模块，optimizer 才能看到它们的参数。普通 list 写出来的网络看起来正常但**不训练**。
2. **激活函数用 GELU 而不是 ReLU**——这是 ViT 和原 Transformer 的唯一架构差异。BERT 也用 GELU，所以这一行迁移很自然。

`EncoderBlock` 本体在上一篇笔记里已经详细推过（pre-norm、identity-highway、token mixing vs channel mixing），这里不重复。

## 一个 pre-norm 的尾巴

pre-norm 把 LN 放在 sublayer **内部**：

```python
x = x + Sublayer(LN(x))     # residual 路径是裸的，没过 LN
```

所以最后一层 block 出来的 `z_L` **本身没有经过 LN**——它是"上一层 + 一个被 norm 过的修正"。直接拿去喂 classifier 数值不稳定。

修复：encoder 之后再加一个独立的 LN，对应论文方程 (4) 里的 `LN(z_L^0)`：

```python
self.norm = nn.LayerNorm(d_model)
# forward:
x = self.norm(x)                    # (B, N+1, d)
cls_out = x[:, 0]                   # (B, d) — 取 CLS 位置
```

---

# 6. 分类头：一个 Linear，砍掉 pooler

```python
self.head = nn.Linear(d_model, num_classes)
```

这里只有一行。**没有 hidden layer，没有非线性，没有 dropout**。

BERT 这里还塞了一个 `tanh(W @ z + b)` 的 pooler——那是为了 NSP 预训练任务的额外处理头。ViT 没有 NSP，**主动砍掉**这一层。

为什么这么简单还能 work？因为 CLS 输出 `z_L^0` 经过了 L 层 attention 的精炼，已经是高度结构化的图像表征向量，**线性可分性已经足够**，再加非线性是冗余的。论文实测在 head 里加 MLP 没有显著提升。

---

# 7. 整体步骤

把前面所有部件串起来，ViT 的 forward 就 8 行：

```python
def forward(self, x):
    # Stage 1: PatchEmbed
    x = self.patch_embed(x)                       # (B,C,H,W) → (B, N, d)

    # Stage 2: prepend CLS + add PE
    B = x.shape[0]
    cls = self.cls_token.expand(B, -1, -1)
    x = torch.cat([cls, x], dim=1)                # (B, N+1, d)
    x = x + self.pos_embed

    # Stage 3: L × EncoderBlock (reused from Transformer module)
    for blk in self.blocks:
        x = blk(x)

    # Stage 4: final LN, take CLS
    x = self.norm(x)
    cls_out = x[:, 0]                             # (B, d)

    # Stage 5: classifier head
    return self.head(cls_out)                     # (B, num_classes)
```

**70% 是复用** Transformer 的 EncoderBlock + MultiHeadSelfAttention，**30% 是新写**的 PatchEmbed + CLS + PE + 分类头。

---

# 8. Inductive Bias：ViT 的核心 trade-off

论文 §3.1 末尾专门讨论 ViT 比 CNN 少了哪些 inductive bias：

| 先验 | CNN | ViT |
|---|---|---|
| locality（看邻居） | ✅ 每层 conv 都有 | ❌ self-attention 是全局 |
| translation equivariance（窗口扫到哪都一样） | ✅ 每层 conv 都有 | 弱（只 FFN 内部有） |
| 2D 网格结构 | ✅ 卷积核就是 2D 的 | 残留（只在 patch 切分这一步） |

**CNN 是"全栈贯穿先验"，ViT 是"几乎裸的 Transformer"**。这个 trade-off 的两面：

- **代价（小数据）**：ImageNet-1k 单独训 ViT < ResNet。模型要从零学这些先验，样本不够学不出来。
- **回报（大数据）**：JFT-300M 预训练后 ViT > ResNet。没有先验束缚，模型容量更"灵活"，学出比 CNN 手工先验更精细的视觉规律。

> **先验是数据的替代品——数据少时先验有用，数据多时先验是限制。**

这就是 abstract 那句 "large scale training trumps inductive bias" 的完整解释。

---

# 9. 实验 1：MNIST（smoke test）

## 配置

```text
img_size=28, patch_size=7, in_chans=1, num_classes=10
d_model=64, depth=4, num_heads=4, dropout=0.1
N = (28/7)² = 16 tokens
AdamW(lr=3e-4, weight_decay=0.05) + CosineAnnealingLR
batch=128, epochs=10, device=cpu
```

## 训练曲线

```text
ep   1/10  train loss=0.96  acc=68.6%   test loss=0.48  acc=85.16%   lr=2.93e-04   t=48s
ep   2/10  train loss=0.44  acc=86.1%   test loss=0.27  acc=91.83%   lr=2.71e-04   t=48s
ep   3/10  train loss=0.28  acc=91.5%   test loss=0.19  acc=94.47%   lr=2.38e-04   t=50s
ep   5/10  train loss=0.17  acc=94.8%   test loss=0.14  acc=95.59%   lr=1.50e-04   t=47s
ep  10/10  train loss=0.10  acc=97.0%   test loss=0.10  acc=97.00%   lr=0.00e+00   t=46s
```

CPU 训完 10 epoch 8 分钟，test_acc 97.00%。

## 几个验证点

1. **train_acc ≈ test_acc**（96.96% vs 97.00%）：完全没有 overfit，模型容量和任务难度匹配
2. **loss 一路单调下降**：训练健康
3. **cosine 调度正常工作**：lr 从 3e-4 平滑降到 0
4. **97% 是合理表现**：和 ResNet 在 MNIST 通常的 99%+ 比有 ~2 点 gap，差距来源主要是 ViT 在小数据上 inductive bias 短板。**这一点 gap 在小数据集上看起来不显眼，到 CIFAR-10 就放大成几十个点。**

---

# 10. 实验 2：CIFAR-10（验证 inductive bias gap）

## 配置（**和 MNIST 同样的模型容量**，只换数据）

```text
img_size=32, patch_size=8, in_chans=3, num_classes=10
d_model=64, depth=4, num_heads=4, dropout=0.1
N = (32/8)² = 16 tokens                            # 故意和 MNIST 一样
+ data augmentation: RandomCrop(padding=4) + HorizontalFlip
epochs=15, 其余同 MNIST
```

## 训练曲线

```text
ep   1/15  train loss=1.91  acc=28.2%   test loss=1.81  acc=33.79%
ep   5/15  train loss=1.53  acc=43.8%   test loss=1.47  acc=47.11%
ep  10/15  train loss=1.36  acc=50.4%   test loss=1.34  acc=51.54%
ep  15/15  train loss=1.31  acc=52.5%   test loss=1.28  acc=53.77%   best 53.89% @ ep 14
```

CPU 训完 15 epoch 11 分钟，best test_acc **53.89%**。

## 核心数据：43 个点的 inductive bias gap

把两次实验放一起：

| 数据集 | 模型配置 | 任务难度 | test_acc |
|---|---|---|---|
| MNIST | 同上 (N=16, d=64, L=4) | 简单（手写数字，居中，单色） | **97.00%** |
| CIFAR-10 | 同上 (N=16, d=64, L=4) | 中等（自然图像，多类，三色） | **53.89%** |
| Gap | 同样的 ViT，只换数据 | | **−43.1 pp** |

对比 Stage 1 我的 ResNet20 在 CIFAR-10 上的结果（典型水平 ~91%）——**同等"小数据"上，ResNet 的 locality 先验给它白送了 35+ 个点**。

这是论文那句 "much less image-specific inductive bias" 的最直接实证。**模型完全一样，区别只在"图像变难"，性能就崩了**——因为 ViT 没有 CNN 那种"我天然懂图像结构"的先验，难图像就吃亏。

## 两个观察细节

1. **train_acc < test_acc**（52.5% vs 53.8%）：不是 bug，是数据增强的副作用。train 端图像被 RandomCrop + Flip 扰动过，难度更高；test 端是原图。所以这种倒挂反而说明增强在工作。

2. **模型显著 underfit**：loss 到 1.30 还在下降，但 acc 平台化。这个 capacity 已经吃满，要扩到 patch=4 / d=128 / depth=6 才能继续上去。**但即使上 ViT-base，在 CIFAR-10 上**仍然**输给同等大小的 ResNet——inductive bias gap 是结构性的，不是 capacity 能补的。**

---

# 11. Attention Visualization

## Hook + CLS attention 切片

复用上一篇笔记的 forward hook 套路，挂在每个 EncoderBlock 的 `.attn` 上：

```python
attn_maps = {}
def make_hook(idx):
    def hook(module, inputs, outputs):
        attn_maps[idx] = outputs[1].detach().cpu()    # (B, H, N+1, N+1)
    return hook

for i, blk in enumerate(model.blocks):
    blk.attn.register_forward_hook(make_hook(i))
```

forward 一次，`attn_maps[l]` 装着 layer l 的 attention，shape `(B, H, N+1, N+1)`。

我们关心的是 **CLS 对所有 patch 的关注度**，所以切 `attn[:, :, 0, 1:]` 得到 `(B, H, N)`，再 reduce heads：

```python
cls_attn = attn[:, :, 0, 1:].mean(dim=1)    # (B, N)
```

把 `(B, N)` reshape 成 `(B, 1, √N, √N)`，bilinear 上采样到 `(B, img_size, img_size)`，逐图归一化，就是 heatmap。

## 单层 attention 的局限

直接看 **layer 0 head-max** 的 attention（即"最 sharp 的那个 head 在第 0 层关注了哪里"）：

- "4"：热点恰好在两笔交叉处（4 的唯一判别特征）✓
- "9"：热点在上面的圆环 ✓
- "1"：热点在上方钩 + 竖线 ✓
- 但 "0" 和 "2" 的热点偏到背景空白区 ✗
- 整张图可见 4×4 方格痕迹 ✗

**为什么单层 attention 有 hit-or-miss**：
1. ViT 后期层 attention 趋于均匀（每个 token 都已经聚合全图信息），早期层更 local 但只看局部
2. 不同 head 关注不同模式，单独取一个未必能反映模型整体判别逻辑

## Attention Rollout（推荐做法）

论文 Fig 6 用的是 **attention rollout**（Abnar & Zuidema 2020）——把所有层的 attention 矩阵相乘，得到"从输入到输出"的累积 attention：

$$
\tilde{A}_\ell = 0.5\, A_\ell + 0.5\, I, \quad
\text{rollout} = \tilde{A}_L \cdot \tilde{A}_{L-1} \cdots \tilde{A}_1
$$

两个关键点：

1. **`0.5*A + 0.5*I`**：每一层加 identity 模拟残差通路（信息一半通过 attention 流、一半通过残差直通）。两者都行和为 1，所以 `0.5*A + 0.5*I` 行和保持 1，无需重归一。
2. **左乘**：因为 `z_l = A_l @ z_{l-1}`，链式应用要把新层放左边。

代码：

```python
def attention_rollout(attn_maps, head_reduce="mean"):
    L = len(attn_maps)
    first = attn_maps[0].mean(dim=1)              # (B, N+1, N+1)
    B, n, _ = first.shape
    I = torch.eye(n).expand(B, n, n)

    rollout = 0.5 * first + 0.5 * I
    for l in range(1, L):
        A_l = 0.5 * attn_maps[l].mean(dim=1) + 0.5 * I
        rollout = A_l @ rollout                   # 左乘
    return rollout[:, 0, 1:]                      # CLS 行去掉 CLS→CLS
```

## Rollout 效果

![ViT rollout attention on MNIST](attn_rollout.png)

切换到 rollout 后明显改善：

- **"1"（两张）**：热力沿整个竖直笔画铺开，且两张图模式高度一致
- **"0"**：热点覆盖椭圆环的左侧 + 上弧，识别出闭环结构
- **"4"（两张）**：热点都在两笔交叉处，与判别特征对齐
- **"9"**：紧锁上面的圆环
- **"7"**：热力覆盖整个上面的横折
- **方格痕迹几乎消失**：多层叠加平滑了硬边界

**Consistency** 是 rollout 最大的胜利——同类样本（两个 "1"、两个 "4"）的 attention 模式一致，说明模型对同类学到了**稳定的判别注意力模式**，不是看一张算一张。

> Rollout 给的不是"某一层瞬时关注哪里"，而是"模型整体的判别逻辑"——这就是论文为什么用它做主图。

---

# 12. 总结

## 概念 checklist

- ViT 的"新东西"只有 PatchEmbed + CLS + learnable PE + 分类头；**主干是上篇 Transformer 模块复用**
- PatchEmbed 数学上 ≡ "切 patch + flatten + Linear"，bit-exact 等价
- stride=kernel 的 conv 是 tokenizer 不是 CNN：和"ViT 是 CNN 的变种"这种说法划清界限
- CLS 提供"汇总槽位"，PE 提供"位置信息"——**两者正交**，缺一个会致命（缺 PE）或可替代（缺 CLS 用 GAP）
- `cls_token`（参数，所有图共用）和 `z_L^0`（中间张量，每图各异）是两件事
- Inductive bias 是 trade-off：**先验是数据的替代品**——少了先验要更多数据补
- Attention rollout 给的是"模型整体判别逻辑"，单层 attention 给的是"某一层瞬时活动"——可视化时优先用 rollout
- ViT 在 CIFAR-10 上输给同等大小 ResNet 是**架构性**的，不是 capacity 能补的


# 复现仓库

完整代码：[github.com/r1skers/paper-reforge/tree/main/ViT](https://github.com/r1skers/paper-reforge/tree/main/ViT)

```text
ViT/
├── 2010.11929_ViT.pdf
├── src/
│   ├── patch_embed.py          <- PatchEmbedConv + PatchEmbedUnfold (双实现)
│   ├── vit.py                  <- ViT 主模型（reuse EncoderBlock）
│   └── data.py                 <- MNIST + CIFAR-10 dataloaders
├── tests/
│   ├── test_patch_embed.py     <- 5 个测试（含 bit-exact）
│   └── test_vit.py             <- 5 个测试（含 silent-bug 防火墙）
├── experiments/
│   ├── train.py                <- AdamW + CosineAnnealingLR + best-ckpt 保存
│   └── visualize_attention.py  <- single_layer + rollout 两种可视化模式
└── outputs/
    ├── default/                <- MNIST 实验
    └── cifar10_smoke/          <- CIFAR-10 实验
```
