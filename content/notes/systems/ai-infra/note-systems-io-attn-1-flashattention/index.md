---
date: '2026-05-18T20:00:00+09:00'
draft: false
title: '底层架构 / IO 感知注意力 Part 1：FlashAttention v1 与 tiling-softmax'
summary: "从 GPU 内存层次和 arithmetic intensity 入手，把 attention 重新框定为 memory-bound 问题；推导 tiling + online softmax 的 rebase 等价性、recompute 的反传论证，以及 $O(N^2 d^2 / M)$ 复杂度的来历与硬件代入。FA1 的算法零件——tiling、online softmax、recompute——都是教科书老把戏；它真正贡献的是把效率问题从 FLOPs 重新定义为 HBM 带宽。"
description: "A study note on FlashAttention v1 — reframing attention as a memory-bound problem on top of the GPU memory hierarchy, deriving online softmax's rebase trick as mathematically exact (not approximate), the recompute trade-off for backward, and the $O(N^2 d^2 / M)$ HBM traffic complexity plus its Aggarwal-Vitter lower bound."
tags: ["FlashAttention", "Attention", "Transformer", "GPU", "Memory Hierarchy", "IO-aware", "Online Softmax", "AI Infra"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-flashattention-v1/
  - /notes/笔记-底层架构-flashattention-v1/
  - /notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/
  - /notes/笔记-底层架构-io感知注意力1-flashattention-v1与tiling-softmax/
  - /notes/note-systems-io-attn-1-flashattention/
---

# 底层架构 / IO 感知注意力 Part 1：FlashAttention v1 与 tiling-softmax

读 *Attention is All You Need* 时，attention 看起来是一个非常优美的纯数学公式：

$$
O = \mathrm{softmax}(QK^\top)\, V
$$

按理说，这只是几个矩阵乘加上一个 softmax。但真正去训练长序列 Transformer 时，会发现 attention 不仅算得慢，还**特别吃显存**——长一点的输入直接 OOM。
这一篇笔记就是拆开来看看。

论文链接：[FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al., 2022)](https://arxiv.org/abs/2205.14135)

---

# Abstract

- **问题**：标准 attention 在长序列上算得慢、吃显存，长一点直接 OOM。教科书直觉认为问题在 $O(N^2 d)$ FLOPs，所以人们朝着"减少 FLOPs"的方向去做 Linformer / Performer 这类近似。但**实测瓶颈不在算力**，而在 attention 中间矩阵 $P = \mathrm{softmax}(QK^\top)$ 反复在 HBM 上搬运的 IO 开销。
- **解决方法**：把 attention 重新框定为 **IO-aware** 问题，让 $N \times N$ 的中间矩阵**永远不落地 HBM**——所有中间状态只在 SRAM 临时出现、用完即弃。
- **配件**：
  1. **GPU 内存层次抽象** = 把"显存"细分成 HBM（慢大）和 SRAM（快小）+ 用 arithmetic intensity 区分 compute-bound 和 memory-bound
  2. **Tiling** = 把 $Q, K, V$ 切成能装进 SRAM 的小块，让一对小块的乘积能在 SRAM 内闭环
  3. **Online softmax + rebase trick** = 用 $(m, \ell)$ 两个标量逐块更新，让"按块逐步算"和"一口气整行算" **数学上严格相等**（不是近似）
  4. **Recompute** = 前向**不**存 $P$，反传时按块**重算** $P$——用 FLOPs 换 memory，但因为反传本身也是 memory-bound，净效应是 wall-clock 加速
- **核心结论**：FA1 没有发明新算法零件，主要是**视角**——把 attention 从"算力问题"重写为"带宽问题"。HBM 流量复杂度 $\Theta(N^2 d^2 / M)$ 在 Aggarwal-Vitter I/O 模型下**已经触底**；后续 FA2 / FA3 / PagedAttention 改进的是常数、并行度、KV cache 重用，不是复杂度本身。

---

# 1. 背景：GPU 内存层次

首先是理解 GPU 的结构。

## 1.1 内存金字塔

现代 GPU 不是只有一种"显存"，而是一个**多级内存金字塔**，越往上越快越小：

| 层级 | 容量 | 带宽（A100）| 类比 |
| --- | --- | --- | --- |
| Registers（寄存器） | 每 thread 数十个 | 极快 | 和 CPU 寄存器一样 |
| **SRAM**（片上） | 192 KB / SM | ~19 TB/s | CPU 的 L1/L2 cache |
| **HBM**（片外） | 40–80 GB | 1.5–2.0 TB/s | 平时说的"显存" |

注意两组数字：

- SRAM **比 HBM 快约 10 倍**
- SRAM **比 HBM 小数千倍**

可以想象成：HBM 是仓库，货很多但远；SRAM 是桌面，小但伸手就够。FA1 整篇文章想做的就是——**「能在桌面上算完的，别老跑仓库」**。

## 1.2 kernel 执行模型

GPU 上跑一段计算叫执行一个 **kernel**。一个标准 kernel 的生命周期是：

> Load inputs from HBM → registers/SRAM → compute → write outputs to HBM.

也就是说，**任何计算都要先从 HBM 搬到 SRAM，算完再写回 HBM**。SRAM 是临时桌面，永远不持久。这两次搬运的代价，就是 FA1 的目标。

## 1.3 Compute-bound vs Memory-bound

定义：

$$
\text{Arithmetic Intensity} = \frac{\text{算术操作数 (FLOPs)}}{\text{访存字节数 (bytes)}}
$$

中文叫**算术强度**，意思是"每搬一个字节做几次算"。按它的大小，operations 分成两类：

| 类型 | 含义 | 例子 |
| --- | --- | --- |
| **Compute-bound** | 算得多搬得少，瓶颈在 FLOPs | 大 matmul、大 channel conv |
| **Memory-bound** | 算得少搬得多，瓶颈在 HBM 带宽 | softmax、layernorm、dropout，几乎所有 elementwise 和 reduction 操作 |

> 反直觉的是：标准 attention 的瓶颈常常不是 FLOPs 总量，而是 materialized $N \times N$ 中间状态带来的 HBM 流量

---

# 2. 问题：标准 attention 的瓶颈

## 2.1 标准 attention 实现 (Algorithm 0)

教科书版本的 attention 在 paper 里写成这样：

---

**Algorithm 0** &nbsp; Standard Attention Implementation

**Require**：Matrices $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM.

1. Load $Q, K$ by blocks from HBM, compute $S = QK^\top$, write $S$ to HBM.
2. Read $S$ from HBM, compute $P = \mathrm{softmax}(S)$, write $P$ to HBM.
3. Load $P$ and $V$ by blocks from HBM, compute $O = PV$, write $O$ to HBM.
4. Return $O$.

---

注意每一步都**显式包含**对 HBM 的读写——$S$ 和 $P$ 这两个 $N \times N$ 中间矩阵都要进出 HBM 一次。把这 4 步按 bound 类型分类：

| 步骤 | 操作 | bound 类型 |
| --- | --- | --- |
| ① | $S = QK^\top$ | compute-bound（matmul）|
| ② | 写 $S$ 回 HBM | 纯搬运 |
| ③ | 读 $S$，算 $P = \mathrm{softmax}(S)$，写 $P$ | **memory-bound** |
| ④ | 读 $P$，读 $V$，算 $O = PV$ | compute-bound |

注意 $S$ 和 $P$ 都是 $N \times N$ 的——序列越长，这两个矩阵越大。$N = 2048$ 时它们各占 8 MB（fp16），远远塞不进 192 KB 的 SRAM。

## 2.2 中间矩阵 $P$ 

第 ③ 步是 memory-bound 的源头。softmax 是 elementwise + reduction 操作，**计算量极小**（每个元素几次 exp 和加法），**但搬运代价极大**（要把整个 $N \times N$ 矩阵从 HBM 完整读一遍、再写一遍）。加上 mask、dropout 等步骤，整个 $N \times N$ 矩阵还会被反复读写好几次。

**整个 attention 的 wall-clock 时间，主要花在反复搬运这块中间矩阵上，而不是花在算 $QK^\top$ 和 $PV$ 上。**


## 2.3 Naive kernel fusion 的局限

加速 memory-bound 操作的常规思路是 **kernel fusion**：把多个连续操作合并成一个 kernel，输入只搬一次，中间结果留在 SRAM 不写回 HBM。

但这套思路在 attention 上有一个致命阻碍：**训练时 backward 需要 $P$ 矩阵**。单纯前向 fusion 不够，因为训练 backward 仍然需要 softmax 概率；如果没有 recompute 设计，就只能把 $P$ 写回 HBM。

所以问题被精确化成：

> **能不能在前向时不让 $P$ 落地 HBM，并且不影响反传的正确性？**

---

# 3. 算法：tiling + online softmax + recompute

FA1 用三件事一起回答上面这个问题：

1. **Tiling**：把 $Q, K, V$ 切成小块，让一对小块的乘积能装进 SRAM
2. **Online softmax**：让 softmax 能"按块逐步算"，且数学上和"一口气整行算"完全相等
3. **Recompute**：前向不存 $P$，反传时重算

Paper 里把这三件事合在一个 kernel 里，写成 Algorithm 1：

{{< details summary="Algorithm 1：FlashAttention（paper 原文）" >}}

**Require**：Matrices $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM；on-chip SRAM of size $M$.

1. Set block sizes $B_c = \lceil M/(4d) \rceil$, $B_r = \min(\lceil M/(4d) \rceil, d)$.
2. Initialize $O = (0)_{N \times d} \in \mathbb{R}^{N \times d}$, $\ell = (0)_N \in \mathbb{R}^N$, $m = (-\infty)_N \in \mathbb{R}^N$ in HBM.
3. Divide $Q$ into $T_r = \lceil N/B_r \rceil$ blocks $Q_1, \ldots, Q_{T_r}$ of size $B_r \times d$ each; divide $K, V$ into $T_c = \lceil N/B_c \rceil$ blocks $K_1, \ldots, K_{T_c}$ and $V_1, \ldots, V_{T_c}$ of size $B_c \times d$ each.
4. Divide $O$ into $T_r$ blocks $O_1, \ldots, O_{T_r}$ of size $B_r \times d$ each; divide $\ell$ into $T_r$ blocks $\ell_1, \ldots, \ell_{T_r}$ of size $B_r$ each; divide $m$ into $T_r$ blocks $m_1, \ldots, m_{T_r}$ of size $B_r$ each.
5. **for** $1 \le j \le T_c$ **do** &nbsp; *(outer: K/V blocks)*
6. &emsp;&emsp; Load $K_j, V_j$ from HBM to on-chip SRAM.
7. &emsp;&emsp; **for** $1 \le i \le T_r$ **do** &nbsp; *(inner: Q blocks)*
8. &emsp;&emsp;&emsp;&emsp; Load $Q_i, O_i, \ell_i, m_i$ from HBM to on-chip SRAM.
9. &emsp;&emsp;&emsp;&emsp; On chip, compute $S_{ij} = Q_i K_j^\top \in \mathbb{R}^{B_r \times B_c}$.
10. &emsp;&emsp;&emsp;&emsp; On chip, compute $\tilde m_{ij} = \mathrm{rowmax}(S_{ij}) \in \mathbb{R}^{B_r}$, $\tilde P_{ij} = \exp(S_{ij} - \tilde m_{ij}) \in \mathbb{R}^{B_r \times B_c}$ (pointwise), $\tilde \ell_{ij} = \mathrm{rowsum}(\tilde P_{ij}) \in \mathbb{R}^{B_r}$.
11. &emsp;&emsp;&emsp;&emsp; On chip, compute $m_i^{\text{new}} = \max(m_i, \tilde m_{ij}) \in \mathbb{R}^{B_r}$, $\ell_i^{\text{new}} = e^{m_i - m_i^{\text{new}}} \ell_i + e^{\tilde m_{ij} - m_i^{\text{new}}} \tilde \ell_{ij} \in \mathbb{R}^{B_r}$.
12. &emsp;&emsp;&emsp;&emsp; Write $O_i \leftarrow \mathrm{diag}(\ell_i^{\text{new}})^{-1} \left( \mathrm{diag}(\ell_i)\, e^{m_i - m_i^{\text{new}}} O_i + e^{\tilde m_{ij} - m_i^{\text{new}}} \tilde P_{ij} V_j \right)$ to HBM.
13. &emsp;&emsp;&emsp;&emsp; Write $\ell_i \leftarrow \ell_i^{\text{new}}$, $m_i \leftarrow m_i^{\text{new}}$ to HBM.
14. &emsp;&emsp; **end for**
15. **end for**
16. Return $O$.

{{< /details >}}

## 3.1 目标：不让 $N \times N$ 落地 HBM

**最终目标**：算出 $O \in \mathbb{R}^{N \times d}$，但中间的 $S = QK^\top$ 和 $P = \mathrm{softmax}(S)$ 这两个 $N \times N$ 矩阵**全程不出现在 HBM 里**，只在 SRAM 里临时出现、用完即弃。

为此先做块切分（对应 Algorithm 1 的 **行 1 + 行 3**）：

> **Require**: $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM；on-chip SRAM of size $M$.
>
> 1. Set block sizes $B_c = \lceil M/(4d) \rceil$, $B_r = \min(\lceil M/(4d) \rceil, d)$.
> 2. Divide $Q$ into $T_r = \lceil N/B_r \rceil$ blocks $Q_1, \ldots, Q_{T_r}$ of size $B_r \times d$ each; divide $K, V$ into $T_c = \lceil N/B_c \rceil$ blocks $K_1, \ldots, K_{T_c}$ and $V_1, \ldots, V_{T_c}$ of size $B_c \times d$ each.

也就是 $Q$ 按行切 $Q_i \in \mathbb{R}^{B_r \times d}$，$K, V$ 按行切 $K_j, V_j \in \mathbb{R}^{B_c \times d}$，每块都能装进 SRAM。

## 3.2 障碍：softmax 不是局部操作

Matmul 是天然可分块的：

$$
QK^\top = \begin{bmatrix} Q_1 \\ Q_2 \end{bmatrix} \begin{bmatrix} K_1^\top & K_2^\top \end{bmatrix}
$$

每个输出块只依赖对应的 Q 块和 K 块。

但 softmax 不行：

$$
\mathrm{softmax}(x)_i = \frac{e^{x_i - m}}{\sum_j e^{x_j - m}}, \quad m = \max_j x_j
$$

无论是 $m$ 还是分母里的求和，**都需要看完整行**。如果只看一个块，你既不知道真正的 max，也不知道真正的 sum。

如果直接按 K 维度切块算 $QK^\top$ 然后局部 softmax——**结果是错的**，因为用的是局部 max 而不是全局 max。

## 3.3 Online softmax 的 rebase trick


解法是为每一行维护**两个标量**，扫过所有块的过程中持续更新：

| 符号 | 含义 |
| --- | --- |
| $m$ | running max — 到目前为止看过的元素里的最大值 |
| $\ell$ | running sum — 到目前为止 $\sum e^{x - m}$，用**当前**的 $m$ |

更新规则如下。假设已经处理完前 $j-1$ 块，持有 $(m^{(j-1)}, \ell^{(j-1)})$。新来的第 $j$ 块的局部统计量是：

$$
\tilde m^{(j)} = \max(x^{(j)}), \qquad \tilde\ell^{(j)} = \sum_{x \in x^{(j)}} e^{x - \tilde m^{(j)}}
$$

合并方式：

$$
m^{(j)} = \max\!\left(m^{(j-1)},\, \tilde m^{(j)}\right)
$$

$$
\ell^{(j)} = e^{m^{(j-1)} - m^{(j)}} \cdot \ell^{(j-1)} \;+\; e^{\tilde m^{(j)} - m^{(j)}} \cdot \tilde\ell^{(j)}
$$

第二个式子是整个 trick 的心脏。逐项看它在做什么：

$\ell^{(j-1)}$ 当初是**用旧的 max** $m^{(j-1)}$ 算的：

$$
\ell^{(j-1)} = \sum_{x \in \text{旧块}} e^{x - m^{(j-1)}}
$$

现在 max 可能变大，全局基准换成了 $m^{(j)}$。我们要把"旧块的求和"**改写**成用新基准：

$$
\sum_{x \in \text{旧块}} e^{x - m^{(j)}} = \sum_{x \in \text{旧块}} e^{x - m^{(j-1)}} \cdot e^{m^{(j-1)} - m^{(j)}} = \ell^{(j-1)} \cdot e^{m^{(j-1)} - m^{(j)}}
$$

这就是第一项的由来。同理，第二项把新块从局部基准 $\tilde m^{(j)}$ 改写到全局基准 $m^{(j)}$。两个因子合起来，就是**通过变量替换把不同基准下的求和精确改写到同一基准**。

> **这不是近似，是严格等价**。所以 FA1 是 *exact* attention，而非 Linformer / Performer 那类近似 attention。

## 3.4 输出 $O$ 的累加

同样的 trick 也用在输出 $O_i$ 上。逐块累加时，每次新块到来，$O_i$ 要被两类因子调整：

- $e^{m^{(j-1)} - m^{(j)}}$ 把"用旧 max 算出的 exp 项"改写到新 max
- $\ell^{(j-1)} / \ell^{(j)}$ 把"用旧分母归一化过的部分输出"改写到新分母

整个 §3 的"巧"，归结为同一个动作：

> **每来一块新数据，把旧累加器的尺度更新到新基准。**

## 3.5 反传与 recompute

到这里前向已经搞定，但还有一个隐患：**反传需要 $P$**。

看一眼反传要用的式子：

$$
P_{ij} = \frac{e^{S_{ij} - m_i}}{\ell_i} = \frac{e^{Q_i K_j^\top - m_i}}{\ell_i}
$$

要重算 $P_{ij}$，需要 $Q, K$（HBM 里本来就有）+ 每行的 $(m_i, \ell_i)$（**每行只两个标量**，总额外开销 $O(N)$）。

所以 FA1 的策略是：

- 前向**只**把 $O$ 和 $(m_i, \ell_i)$ 写回 HBM
- 反传时按块**重算** $P$，而不是从 HBM 读

这是用 FLOPs 换 memory。乍看是亏的——FA1 反传比标准实现多了一次 $QK^\top$。但**反传本身是 memory-bound 的**：标准实现的瓶颈是把 $N \times N$ 的 $P$ 从 HBM 搬来搬去。FA1 多算一遍 $P$，但**不搬**，净结果反而是**反传 wall-clock 也变快**。

> 这种"用更多 compute 换更少 memory"的交易模式，是 LLM infra 的核心母题之一，后续在 speculative decoding、PagedAttention、GPTQ 等等工作里会反复出现。

---

# 4. 复杂度

## 4.1 计数：每块被搬了几次

FA1 的循环结构是 **K/V 在外，Q 在内**：

```text
for j = 1..T_c:                    # outer: K/V blocks
    load K_j, V_j                  # 一次
    for i = 1..T_r:                # inner: Q blocks
        load Q_i, O_i, m_i, ℓ_i    # 每次 inner iter 一次
        compute in SRAM
        write back O_i, m_i, ℓ_i
```

其中 $T_r = N/B_r$，$T_c = N/B_c$。

| 数据 | 加载次数 | 单次大小 | 总流量 |
| --- | --- | --- | --- |
| $K_j, V_j$ | $T_c$ | $B_c d$ 各 | $2 T_c B_c d = 2 N d$ |
| $Q_i$ | $T_c \cdot T_r$ | $B_r d$ | $T_c \cdot N d$ |
| $O_i$（读+写）| $T_c \cdot T_r \times 2$ | $B_r d$ | $2 T_c \cdot N d$ |

主导项是 $T_c \cdot N d$，K/V 那一项的常数倍被它压过。

## 4.2 主导项与最终公式

由块大小约束 $B_c = \Theta(M/d)$（SRAM 要同时塞下 K/V/Q/O 四个块），有：

$$
T_c = \frac{N}{B_c} = \Theta\!\left(\frac{N d}{M}\right)
$$

代回主导项：

$$
T_c \cdot N d = \Theta\!\left(\frac{N d}{M} \cdot N d\right) = \boxed{\Theta\!\left(\frac{N^2 d^2}{M}\right)}
$$

这就是 FA1 的 HBM 流量复杂度。对比标准 attention 的 $\Theta(N^2)$（在 $N \gg d$ 的典型场景下），加速比为：

$$
\frac{\text{Standard}}{\text{FA1}} = \frac{N^2}{N^2 d^2 / M} = \boxed{\frac{M}{d^2}}
$$

## 4.3 加速比 $M/d^2$ 与硬件代入

把硬件参数代进去：

| 配置 | $M$（元素数）| $d$ | $M/d^2$ |
| --- | --- | --- | --- |
| A100, fp32 | ~48,000 | 64 | ~12× |
| A100, fp16 | ~96,000 | 64 | ~23× |
| A100, fp16 | ~96,000 | 128 | ~6× |

论文实测在 A100 上 BERT-large 取得约 7.6× 的 wall-clock 提速——和理论上界 ~12–23× 中间隔着一些工程常数（SRAM 利用率、调度开销、K/V 搬运的次要项）。**量级上能解释为什么会有多倍加速，但实际 wall-clock 还受 occupancy、调度、Tensor Core 利用率、kernel 实现等影响。**

两个思想：

- **$d^2$ 在分母**——$d$ 越大，加速比越小。从 $d=64$ 到 $d=128$ 加速比缩 4 倍。多头 attention 习惯把每头的 $d$ 切小（$d_\text{model}/h \approx 64$）恰好让 FA1 受益最大化。这不是巧合，而是 hardware-algorithm co-design 的一种潜在共振。
- **$M$ 在分子**——SRAM 越大，加速比越大。这就是为什么 H100 上 FA 比 A100 上更猛。

## 4.4 下界与"已触底"

FA1 论文同时证明了一个下界（基于经典的 Aggarwal–Vitter I/O 模型）：

> 任何精确 attention 算法的 HBM 访问都至少是 $\Omega(N^2 d^2 / M)$。

意思是：**FA1 在 IO 复杂度的意义上已经触底**。后续 FA2 / FA3 / PagedAttention 等等工作**不在改进复杂度**，而在改进**常数**、**并行度**、**精度**和 **KV cache 重用**。想真正打破这个下界，要么**放弃 dense exact attention 这个问题设定，比如近似 attention 或 SSM/RNN-style 架构**，要么**改变硬件假设**。

---

# 5. 总结

问题：FA1 给出的算法中没有一个零件是新的——tiling、online softmax、recompute 都是老把戏。它的贡献在哪？

**它的贡献是视角。** 把 attention 重新看成 memory-bound 问题；把 GPU 抽象成"两级内存 + 搬运代价"的 IO 模型；在这个 IO 模型上用朴素工具组装出**复杂度触底**的精确算法。

还有一点：FA1 paper 通篇以 GPU 为载体讲解，但 §3.2 的下界证明用的是**抽象的 Aggarwal–Vitter I/O 模型**，并不绑定 GPU。同一套思路可以套到任何"快小 + 慢大"的两级内存系统：CPU 的 cache 与 DRAM、TPU 的 SMEM 与 HBM、多机分布式中的本地内存与远端内存（即 Ring Attention 走的方向）。

> **FA1 不仅是 attention 的加速器，更是一篇"如何把算法对齐到内存层次"的方法论范本。**

## 概念 checklist

- FA1 的算法零件——**tiling、online softmax、recompute**——都是旧零件
- FA1 真正贡献的是**视角**：把 attention 从"算力问题"重写为"带宽问题"
- GPU 不是一块"显存"，而是 **HBM (慢大) + SRAM (快小) 两级金字塔**；arithmetic intensity 决定一个 op 是 compute-bound 还是 memory-bound
- Attention 整体 FLOPs 不少，但**瓶颈在中间的 $P$ 矩阵反复在 HBM 上搬运**。
- Naive kernel fusion 救不了 attention，因为反传需要 $P$；这才有 FA1 的"recompute"作为 escape hatch
- **Online softmax 的 rebase trick 是严格等价**，不是数值近似；FA1 是 *exact* attention（这条让 FA1 区别于 Linformer / Performer 一类）
- "用更多 compute 换更少 memory" 是 LLM infra 的核心母题，从 FA1 延续到 speculative decoding / PagedAttention / GPTQ
- HBM 流量复杂度 $\Theta(N^2 d^2 / M)$ 在 Aggarwal–Vitter I/O 模型下已经触底，后续 FA2/FA3 改的是常数、并行度、KV cache 重用
- 加速比 $M/d^2$：$d$ 越大加速比越小（多头切小每头 $d$ 受益最大），$M$ 越大加速比越大（H100 > A100）

---
# 个人笔记
{{< details summary="Notes" >}}

![Flash Attention 1](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/flash-attention-front.jpg)
![Flash Attention 2](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/flash-attention-back.jpg)

{{< /details >}}
