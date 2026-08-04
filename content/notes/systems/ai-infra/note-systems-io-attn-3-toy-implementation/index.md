---
date: '2026-06-22T08:00:00+09:00'
draft: false
title: '底层架构 / IO 感知注意力 Part 3：复现并验证 online softmax 与 tiled attention'
summary: "前两篇读了 FlashAttention v1 和 online softmax 的原始推导，这一篇把它建出来：用 numpy 实现 naive / tiled+online-softmax 两版 attention，再用一套 invariant 把 tiled==naive 钉死。重点不在算法（前两篇讲过），而在验证设计——block-size invariance 是最强的一条——以及两个数值洞见：误差是精度地板而非累积，rebase 公式的增益≈1。最后划清边界：这只是数学正确性，硬件性能和低精度行为还没证。"
description: "A hands-on companion to the IO-aware attention notes: implementing naive and tiled+online-softmax attention in numpy and verifying tiled==naive via an invariant suite. Focuses on verification design (block-size invariance as the strongest invariant) and two numerical insights — error is a precision floor not an accumulation, and the rebase recurrence has gain≈1 — then draws the boundary between mathematical exactness and unverified hardware performance."
tags: ["Systems", "AI Infra", "Attention", "Softmax"]
categories: ["Notes"]
series: ["IO-Aware Attention"]
note_kind: "topic"
aliases:
  - /notes/笔记-底层架构-io感知注意力3-复现并验证-online-softmax-与-tiled-attention/
  - /notes/note-systems-io-attn-3-toy-implementation/
---

> **主题入口：** [IO-Aware Attention 档案](/notes/topics/io-aware-attention/)

# 底层架构 / IO 感知注意力 Part 3：复现并验证 online softmax 与 tiled attention

[Part 1](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/) 拆 FlashAttention v1，[Part 2](/notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/) 追到 online softmax 的原始推导。这一篇**建出来并证明是对的**。具体说就是：用 numpy 写两版 attention，然后用一套 invariant 确认"tiled==naive"，并看看在真浮点上跑出来学到了什么。

---

# 1. 目标与分工

四个目标：

1. 写 naive attention（标准 `softmax(QKᵀ)V`），当后续实验基准
2. 写 tiled attention + online softmax，分块在线累加
3. 验证 tiled == naive **逐位相等**（float64 下 ~1e-15）
4. 产出误差对比图 + rebase 因子的数学严格性说明

---

# 2. 三个零件落到代码

## 2.1 naive：gold standard

最直接的版本，对应 Part 1 的 Algorithm 0：把整个 `N×N` 的中间矩阵 materialize 出来。

```python
def safe_softmax(scores):
    m = np.max(scores, axis=-1, keepdims=True)
    e = np.exp(scores - m)
    return e / np.sum(e, axis=-1, keepdims=True)

def naive_attention(Q, K, V):
    scores = Q @ K.T          # (N, N) —— 这个就是 FA 要躲开的大矩阵
    P = safe_softmax(scores)
    return P @ V
```

它慢、它吃内存，但它**正确**。后面所有 tiled 的正确性都对照它。

小坑：`keepdims=True` 不能省。`np.max(scores, axis=-1)` 出来是 `(N,)`，去广播 `(N, N)` 时 numpy 会拿它对齐最后一轴而不是行轴——不报错，但全错。`keepdims=True` 给出 `(N, 1)`，才会逐行广播。

## 2.2 online：1D 的 (m, ℓ) 递推

Part 2 的 Algorithm 3 单独抽出：

```python
m = -np.inf
ell = 0.0
for xi in x:
    m_new = max(m, xi)
    ell = ell * np.exp(m - m_new) + np.exp(xi - m_new)
    m = m_new
return m, ell
```

两个初始化值是 (max, +) 两个 reduction 各自的单位元：`m = -inf` 是 max 的单位元（空集的最大值），保证 $\max(-\infty, x_1) = x_1$，让 `m` 从第一个元素起就精确追踪 running max；`ell = 0` 是加法的单位元。它俩配对，第一步 $0 \cdot e^{-\infty} + e^0 = 1$ 干净，不产生 NaN。

注意顺序：**先算 `m_new`，再用它 rebase 旧的 `ell`，最后才覆盖 `m`**。

## 2.3 tiled：加上 O 累加器

从 `(m, ℓ)` 升到 `(m, ℓ, O)`。先写单 query 行的版本，把递推映射：

```python
m = -np.inf
ell = 0.0
O = np.zeros_like(q)
for i in range(0, K.shape[0], block_size):
    K_block = K[i:i + block_size]
    V_block = V[i:i + block_size]
    S = q @ K_block.T
    m_tilde = np.max(S)
    P = np.exp(S - m_tilde)        # 保持未归一化
    l_tilde = np.sum(P)
    m_new = max(m, m_tilde)
    ell = ell * np.exp(m - m_new) + l_tilde * np.exp(m_tilde - m_new)
    O   = O   * np.exp(m - m_new) + np.exp(m_tilde - m_new) * (P @ V_block)
    m = m_new
O = O / ell
```

`O` 那行和 `ell` 那行**结构一模一样**，因为它俩是同一个加权和：$\ell = \sum_j e^{x_j-m}$、$O = \sum_j e^{x_j-m}\,V_j$，一个不带 $V$ 一个带 $V$（$\ell$ 就是 $O$ 在 $V\equiv 1$ 时的特例）。换基准时它俩当然用**同一对** rebase 因子同步缩放。

两个重点：

- **`P` 保持未归一化**（不在块内除 `l_tilde`）。归一化的活全交给 $\ell$，**最后一次性除**。在块内提前除会重复归一化，数学崩，而且后面的 block-size invariance 会挂。
- **只在最后除一次 $\ell$**。每块都除是另一种等价写法（Part 1 里 FA1 Algorithm 1 的行 12，带 $\operatorname{diag}(\ell_\text{new})^{-1}$），但多做除法、多一处放大误差源。选末尾除的写法（FA2 风格），更干净。

升到全 Q-block 版只是把标量 $m, \ell$ 换成 per-row 向量、$O$ 换成矩阵，逻辑不变——只是 2.1 那个 `keepdims` 坑会再来一次，这次是把 `(N,)` 的 `m_tilde` 用 `[:, None]` 升成 `(N, 1)` 才能对齐 `(N, b)` 的 `S`。

---

# 3. 验证设计 

## 3.1 Block-size invariance（最关注）

同一组 `Q, K, V`，跑 `block_size ∈ {1, 2, 3, 5, 7, 11, N}`，**两两结果相等**。

```python
ref = tiled_attention(Q, K, V, block_size=N)   # 单块 == 不分块
for bs in (1, 2, 3, 5, 7, 11):
    assert np.allclose(tiled_attention(Q, K, V, bs), ref, atol=1e-13)
```

这条比"tiled==naive"更本质。它直接测**切法无关**——不管怎么分块，结果不动。而"切法无关"正是 FA 是 *exact* attention 而非近似的实证：如果分块是个近似（像 Linformer/Performer），块越多误差越大；它不动，说明分块只换了计算顺序，没动数学。

## 3.2 分量 invariant

不止看最终的 `O`，还单独断言中间量：

- `m_final` == 全局 rowmax
- `ell_final` == 真实分母 $\sum_j e^{x_j - m_\text{final}}$

这两条把"`(m, ℓ)` 在末态确实收敛到正确的值"独立验出来，而不是寄希望于"O 对了它俩大概也对"。

## 3.3 数值稳定性 stress

把 logit 放大（`scale=30`），看 unsafe 的 naive（不减 max）直接 `exp` 溢出成 `inf`，而 online/tiled 路径仍然有限且正确。呼应 Part 2 §6 的 fp32 安全窗口（≈88）。

---

# 4. 两个数值洞见

前两篇 Part 讲算法，这里讲**运行在真浮点上看到了什么**。

## 4.1 误差是精度地板，不是累积

tiled 和 naive 在 **exact arithmetic** 下逐位相等（block-size invariance 证明的就是这个），所以理论上误差是 **0**。但实际跑出来不是 0——因为**浮点加法不满足结合律**：naive 减全局 max 后一口气加整行，tiled 分块带 rebase 一块块加，**同一个和，加的顺序不同**，末位就会漂。

漂移的尺度等于 dtype 的机器精度 ε：

| dtype | 尾数位 | ε | 误差地板 |
|---|---|---|---|
| float64 | 52 | ≈ 2.2e-16 | ~1e-15 |
| float32 | 23 | ≈ 1.2e-7 | ~1e-6 |

ε 由**尾数位**定、overflow 窗口由**指数位**定，背后是 IEEE 754 的 bit 分配——完整拆解见知识图谱 [浮点与混合精度](https://r1skers.github.io/r1skers-knowledge-map/?map=ai-infra&node=%E6%B5%AE%E7%82%B9%E4%B8%8E%E6%B7%B7%E5%90%88%E7%B2%BE%E5%BA%A6) 节点。

把误差对 block_size 画出来：

![误差随 block_size 变化：fp64 与 fp32 两条线都平，分别压在 ~1e-15 和 ~1e-6](/notes/systems/ai-infra/note-systems-io-attn-3-toy-implementation/error_vs_blocksize.png)

关键不是两条线的高度差（那只是 fp32 比 fp64 少约 9 个十进制位），而是**两条线都"平"**——误差不随 block_size 增长。这才是 exact 的证据：块再多，加的还是同一个和，只是顺序变，舍入误差被 ε 封顶，不发散。如果它会累积，线就该往上爬。

所以这张图也说明了：**误差 = 精度地板（由 dtype 定），不是逼近误差（由块数定）。** 这也是为什么 test 里用 `atol=1e-13` 而不是 `==`——数学等价，但不是 bitwise identical。

## 4.2 增益≈1：减 running max 锁住三条性质

误差不"累积"，不是因为算法去**缩小**它（降不到 ε 以下，谁都做不到），而是因为算法**不放大**它。

打个比方：硬件舍入是一个**固定的噪声地板**（ε）。病态算法像个增益 ≫ 1 的放大器，把地板噪声放大成大误差；良态算法增益 ≈ 1，原样透传，误差就停在地板上。

把这套贴回递推公式，会发现"减 running max"这**一个动作**同时锁死三条不放大的性质：

$$ m_\text{new} = \max(m, \tilde m) \;\Longrightarrow\; \text{所有指数} \le 0 \;\Longrightarrow\; \text{所有 } e^{(\cdot)} \in (0, 1] $$

由此：

- **rebase 因子 $e^{m-m_\text{new}} \le 1$** —— 只缩不放，不放大（性质：无放大）
- **$\tilde P = e^{S-\tilde m} \le 1$ 且全正** —— 形成权重时没有大数相减，无灾难性抵消
- **$\ell \ge 1$**（全局 max 那项保底贡献 $e^0 = 1$）—— 最后 $O/\ell$ 不会除以极小数炸大

指数的符号也是在这里定的：是 $m_\text{old} - m_\text{new}$（≤ 0，缩）而不是反过来（≥ 0，放）——**符号 = 增益方向**，写反了就从"缩"变"放"。

反过来看就更清楚了，前面 2.3 里反复提到的"别这么写"，对应：

- **去掉减 max**（直接 `exp(S)`）：指数可能 > 0，`exp` 溢出，增益拉爆。
- **块内提前除 `l_tilde`**：等于在分母还没集齐时先除一个**局部的、可能很小的** $\tilde\ell$，破坏"分母 ≥ 1"那条。

所以"减 running max + 最后才除全局 ℓ"这个顺序本身就是把增益钉在 1 的设计——**公式和数值稳定性是同一件事的两面**，不是两套要分别记的东西。

---

# 5. 边界：数学正确 ≠ 硬件验证

这里有个容易错的地方，分两个轴：**正确性** 和 **性能**。

**已经证实的：**

- **算法层正确**：tiled == naive in exact arithmetic，invariant 套 + block-size invariance 锤死。
- **fp32/64 的真实舍入地板**：numpy 也是真 IEEE-754，跑在真 FPU 上，那个 1e-15 / 1e-6 是真·机器舍入误差，不是模拟。

**还没证实的：**

1. **性能收益**。numpy 把内存层次**全抽象掉了**——看不到 SRAM/cache 是否真塞下、是否真少搬数据、wall-clock 是否真变快。"切块 → 装进快内存 → 加速"这条收益，在 numpy 上**完全没被验证**。
2. **真实低精度融合 kernel 的数值行为**。这里用的是 fp32/fp64。真 attention kernel 跑在 fp16/bf16 + fp32 accumulator 上，还有硬件近似的 `exp`、FMA 的特定舍入顺序——这些会带来 numpy 版看不到的行为。

换句话说，目前证的是**代数精确性**，不是性能。它的价值是当**判官**：将来写 C / SIMD 版时，拿它对照"优化得对不对"，角色和 naive 一样。

而上面那两个洞没补的洞——真内存、真低精度——是 **Part 4**（规划中）的事：用 C 内循环第一次真的碰内存搬运，用 AVX2 测真带宽。

---

# 6. 总结

- **tiling** 负责"装得下"（把 `N×N` 切成能进快内存的窄条）
- **online softmax** 负责"切了还对"（rebase 把局部统计精确拼回全局）
- **误差是地板不是累积**（算法增益 ≈ 1，舍入不被放大）

正确性已经验证，性能验证则等到硬件阶段。

## 概念 checklist

- naive attention = 教科书 Algorithm 0，materialize 整个 N×N，作 gold standard
- online softmax 的 (m, ℓ) 递推：更新顺序是 m_new 先算 → rebase 旧 ℓ → 覆盖 m
- `m = -inf` / `ell = 0` 是 (max, +) 两个 reduction 的单位元，配对保证第一步不出 NaN
- tiled 多的唯一新东西是 O 累加器；O 与 ℓ 共用同一对 rebase 因子（ℓ 是 O 在 V≡1 的特例）
- P̃ 保持未归一化，归一化（除 ℓ）只在最后一次
- **Block-size invariance** 是最强 invariant：切法无关 ⟹ exact 非近似
- 误差是**精度地板**（由 dtype 的 ε 定，fp64~1e-15 / fp32~1e-6），不是逼近误差（由块数定）
- 浮点误差不"累积"是因为算法**增益≈1**：减 running max ⟹ 因子≤1、P̃≤1、ℓ≥1 三条同时成立
- 边界：已证数学正确性 + 真实舍入地板；未证性能收益与低精度融合 kernel 的数值行为
- numpy 版是将来 C/SIMD 版的 gold standard


