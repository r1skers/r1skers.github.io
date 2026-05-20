---
date: '2026-05-20T11:00:00+09:00'
draft: false
title: '底层架构 / IO 感知注意力 Part 2：Online Softmax 原始推导'
summary: "Milakov & Gimelshein 2018 的 8 页 NVIDIA tech report。它从大词表 softmax 的 memory-bound 瓶颈出发，对比 naive、safe 和 online 三种 softmax：naive 扫两遍但不安全，safe 多扫一遍解决 overflow，online 把 max 和 normalizer 合并到同一次扫描里，恢复到两遍访存。这就是 FlashAttention v1 里 rebase trick 的直接源头。"
description: "A study note on Milakov & Gimelshein 2018 (arXiv 1805.02867). It compares naive, safe, and online softmax, derives the online normalizer recurrence, explains why it is mathematically equivalent to safe softmax, and follows the paper's fused softmax + top-K extension."
tags: ["Online Softmax", "Softmax", "Memory Bandwidth", "Numerical Stability", "Top-K", "NMT", "AI Infra", "IO-aware"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/
---

# 底层架构 / IO 感知注意力 Part 2：Online Softmax 原始推导

[上一篇](/notes/笔记-底层架构-io感知注意力1-flashattention-v1-与-tiling-softmax/) 把 FlashAttention v1 里的分块 softmax 更新写成了 **rebase trick**。这一篇往前追一步：这个 trick 不是 FA1 发明的，它来自 Milakov 和 Gimelshein 2018 年的 NVIDIA tech report：

[Online normalizer calculation for softmax (Milakov & Gimelshein, 2018)](https://arxiv.org/abs/1805.02867)

原论文很短，只有 8 页，目标也很直接：**减少 softmax 的 global memory 访问**。它最初面对的不是 attention，而是 NMT / 大词表语言模型里的输出层 softmax。词表大小 $V$ 动辄 $10\text{K}$ 到 $100\text{K}$，每次 decode 都要对整张 vocabulary 做 softmax，然后经常还要接 top-K。这个过程算得不重，但搬数据很重。

这篇 paper 我读完后的压缩版大概是：

> 把 safe softmax 里“先找 max、再算 normalizer”的两次扫描，合并成一次 online normalizer 扫描。

---

# Abstract

- **问题**：naive softmax 只扫两遍数据，但 $e^{x_i}$ 容易 overflow；safe softmax 用 max-subtract 解决数值稳定性，却需要扫三遍数据。对于大词表 softmax，这多出来的一遍 global memory 访问会变成实际瓶颈。
- **方法**：在线维护两个量：running max $m_i$ 和 running normalizer $d_i$。每来一个新元素，如果 max 改变，就把旧 normalizer 通过 $e^{m_\text{old}-m_\text{new}}$ 重新缩放到新基准。
- **结果**：完整 softmax 仍然需要第二遍写输出，但 normalizer 的计算从两遍压成一遍。因此 safe softmax 从 `3 reads + 1 write` 回到 `2 reads + 1 write`。
- **扩展**：把 online softmax 和 top-K 融成一个 kernel。因为 top-K 只需要前 $K$ 个概率，所以不必把整张 $V$ 长的概率向量写到 global memory 再读回来。
- **跟 FA1 的关系**：FA1 把这里的一维 online normalizer 推广到二维 attention blocks。Algorithm 3 的 rebase 因子，正是 FlashAttention 中 $(m,\ell)$ 逐块更新的原型。

---

# 1. Softmax 的 Memory Bound

对一个向量 $x \in \mathbb{R}^V$，softmax 定义为：

$$
y_i = \frac{e^{x_i}}{\sum_{j=1}^{V} e^{x_j}}
$$

这里的计算量并不大：每个元素做一次指数、一次加法或除法。麻烦在于要反复扫描长度为 $V$ 的向量。

如果 $V$ 是 50K，一个 batch 里有很多行，每行都要扫多遍，那么 bottleneck 很快就不在 ALU，而在 memory bandwidth。论文一开始就把问题定性得很清楚：**softmax 是一个 memory-bound operation**。

下面三种算法，本质上是在比较：

```text
为了算同一个 softmax，需要从 global memory 读写几次？
```

---

# 2. 三种 Softmax 算法

Paper 的主线就是三种实现的对照：

| Algorithm | 扫描结构 | 数值安全 | 每元素 global memory 访问 |
|---|---|---|---|
| **Alg 1** naive softmax | normalizer pass + output pass | 否 | 2 reads + 1 write |
| **Alg 2** safe softmax | max pass + normalizer pass + output pass | 是 | 3 reads + 1 write |
| **Alg 3** online normalizer | online normalizer pass + output pass | 是 | 2 reads + 1 write |

Alg 3 的卖点不是“整个 softmax 只扫一遍”。完整输出 $y$ 还是需要第二遍，因为最终的 $m_V$ 和 $d_V$ 要等第一遍扫完才知道。

它真正省掉的是 safe softmax 里额外的那一遍：

```text
safe:
  pass 1: find max
  pass 2: compute denominator
  pass 3: write output

online:
  pass 1: compute max and denominator together
  pass 2: write output
```

## 2.1 Algorithm 1：Naive Softmax

按定义：

$$
d_V = \sum_{j=1}^{V} e^{x_j}, \qquad
y_i = \frac{e^{x_i}}{d_V}
$$

伪代码：

```text
d = 0
for j = 1..V:
    d = d + exp(x_j)

for i = 1..V:
    y_i = exp(x_i) / d
```

这只需要两遍读 $x$：

- 第一遍读 $x_j$，累加 normalizer $d$
- 第二遍再读 $x_i$，写出 $y_i$

因此每个元素是：

```text
read x once
read x again
write y once
```

也就是 `2 reads + 1 write`。

问题是它不安全。fp32 下 $\exp(x)$ 大约在 $x > 88$ 时 overflow。如果某个 logit 稍大，$e^{x_i}$ 直接变成 `inf`，分母 $d$ 也跟着坏掉。

## 2.2 Algorithm 2：Safe Softmax

经典做法是 max-subtract：

$$
m = \max_j x_j
$$

$$
y_i
= \frac{e^{x_i - m}}{\sum_{j=1}^{V} e^{x_j - m}}
$$

这个式子和 naive softmax 数学等价，因为分子分母都除以了 $e^m$：

$$
\begin{aligned}
\frac{e^{x_i}}{\sum_j e^{x_j}}
&=
\frac{e^{x_i}/e^m}{\sum_j e^{x_j}/e^m} \\
&=
\frac{e^{x_i-m}}{\sum_j e^{x_j-m}}
\end{aligned}
$$

好处是 $x_i - m \le 0$，所以：

$$
e^{x_i - m} \le 1
$$

overflow 消失了。

代价是多扫一遍：

```text
m = -inf
for j = 1..V:
    m = max(m, x_j)

d = 0
for j = 1..V:
    d = d + exp(x_j - m)

for i = 1..V:
    y_i = exp(x_i - m) / d
```

每个元素变成：

```text
read x for max
read x for denominator
read x for output
write y
```

也就是 `3 reads + 1 write`。

这就是 paper 要消掉的东西：**为了数值安全，多出来的一次 global memory read**。

## 2.3 Algorithm 3：Online Normalizer

Alg 3 的想法很妙：不要先完整求 $m$，再完整求 $d$。我们可以一边扫描，一边维护“到目前为止的 max”和“在当前 max 基准下的 normalizer”。

扫到第 $i$ 个元素时，定义：

$$
m_i = \max(x_1, \ldots, x_i)
$$

$$
d_i = \sum_{j=1}^{i} e^{x_j - m_i}
$$

新元素 $x_i$ 到来时，先更新 max：

$$
m_i = \max(m_{i-1}, x_i)
$$

然后更新 normalizer：

$$
d_i = e^{m_{i-1} - m_i} d_{i-1} + e^{x_i - m_i}
$$

第二个式子就是整篇 paper 的关键。

旧的 $d_{i-1}$ 是在旧基准 $m_{i-1}$ 下算的：

$$
d_{i-1} = \sum_{j=1}^{i-1} e^{x_j - m_{i-1}}
$$

现在 max 可能变成了 $m_i$。如果基准变了，旧 normalizer 也必须换基准：

$$
\begin{aligned}
\sum_{j=1}^{i-1} e^{x_j - m_i}
&=
\sum_{j=1}^{i-1} e^{x_j - m_{i-1}} e^{m_{i-1}-m_i} \\
&=
e^{m_{i-1}-m_i} d_{i-1}
\end{aligned}
$$

然后加上新元素在新基准下的贡献：

$$
e^{x_i - m_i}
$$

于是得到递推式。

伪代码就是：

```text
m = -inf
d = 0
for i = 1..V:
    m_new = max(m, x_i)
    d = d * exp(m - m_new) + exp(x_i - m_new)
    m = m_new

for i = 1..V:
    y_i = exp(x_i - m) / d
```

这样第一遍同时得到最终的 $m_V$ 和 $d_V$，第二遍写输出。数值安全性来自 max-subtract，访存量回到 naive softmax 的 `2 reads + 1 write`。

---

# 3. Theorem 1：为什么等价

论文的 Theorem 1 证明的是：Alg 3 扫完以后得到的 $m_V$ 和 $d_V$，与 safe softmax 中先求全局 max、再求 normalizer 的结果一致。

更直白地说：

> online normalizer 不是近似。它只是把 safe softmax 的 normalizer 换了一种扫描顺序。

证明用归纳就够了。

假设扫到 $i-1$ 时已经有：

$$
m_{i-1} = \max(x_1,\ldots,x_{i-1})
$$

$$
d_{i-1} = \sum_{j=1}^{i-1} e^{x_j - m_{i-1}}
$$

现在看第 $i$ 个元素。

**情形 A：$x_i \le m_{i-1}$**

此时 max 不变：

$$
m_i = m_{i-1}
$$

rebase 因子变成 $1$：

$$
e^{m_{i-1}-m_i} = 1
$$

所以：

$$
d_i = d_{i-1} + e^{x_i-m_i}
$$

这就是直接把新元素加进去。

**情形 B：$x_i > m_{i-1}$**

此时新元素成为新的 max：

$$
m_i = x_i
$$

递推式变成：

$$
d_i = e^{m_{i-1}-x_i} d_{i-1} + 1
$$

把 $d_{i-1}$ 展开：

$$
\begin{aligned}
e^{m_{i-1}-x_i} d_{i-1}
&=
e^{m_{i-1}-x_i}
\sum_{j=1}^{i-1} e^{x_j-m_{i-1}} \\
&=
\sum_{j=1}^{i-1} e^{x_j-x_i}
\end{aligned}
$$

再加上新元素自己：

$$
1 = e^{x_i-x_i}
$$

于是：

$$
d_i = \sum_{j=1}^{i} e^{x_j-m_i}
$$

归纳成立。

这里需要稍微注意措辞：在 exact arithmetic 里它们数学等价；在真实浮点实现中，运算顺序变化可能带来最后几 bit 的差异。所以更稳妥的说法是 **mathematically equivalent**，而不是把它说成严格的 bitwise identical。

---

# 4. 实验：带宽利用率

论文在 P100 / V100 上 benchmark，不同 batch size 和 vocabulary size 下比较 cuDNN softmax、safe softmax、online softmax 以及 fused softmax + top-K。

结论符合 memory-bound 直觉：

- **小 $V$**：收益有限。向量太短时，kernel launch、调度和指令开销占比更高，少扫一遍数据不一定显著。
- **大 $V$**：online softmax 更明显。$V$ 越大，global memory traffic 越主导，少一次 read 就更值钱。

从访问量看，safe softmax 是：

```text
3 reads + 1 write = 4V element accesses
```

online softmax 是：

```text
2 reads + 1 write = 3V element accesses
```

也就是少了约四分之一的元素级 global memory 访问。

这也是为什么论文报告 softmax 本身最多约 1.3x 加速，而不是夸张的数量级提升。它没有改变 softmax 的数学，也没有避免输出 $V$ 个概率；它只是把一个明确的多余 pass 拿掉了。

---

# 5. Fused Softmax + Top-K

## 5.1 top-K

在 NMT beam search 或 LM sampling 里，softmax 后面经常不是“我要完整概率向量”，而是：

```text
我要概率最大的 K 个 token
```

传统 pipeline 通常像这样：

```text
Kernel A: safe softmax
  read logits several times
  write all V probabilities to global memory

Kernel B: top-K
  read all V probabilities from global memory
  write K selected results
```

中间那张 $V$ 长的概率向量会被完整写一次、再完整读一次。

这对 top-K 来说很浪费，因为最终只需要 $K$ 个结果。

## 5.2 融合的关键

softmax 是单调的：

$$
x_a > x_b
\quad\Longleftrightarrow\quad
\frac{e^{x_a-m}}{d} > \frac{e^{x_b-m}}{d}
$$

所以 top-K 概率对应的就是 top-K logits。我们不需要先算出所有概率再排序，只需要在扫描 logits 时维护 top-K logits。

融合后的结构是：

```text
Pass 1:
  scan logits x
  update online (m, d)
  update a size-K top-K buffer / min-heap over logits

Pass 2:
  normalize only those K selected logits
  write K probabilities and indices
```

这样：

```text
完整的 V 概率向量从未落地 global memory
```

这是 paper 里比 softmax 本身更大的收益来源。arXiv 摘要里报告：softmax alone up to 1.3x，而 Softmax+TopK combined and fused up to 5x。

## 5.3  K 的大小控制

fusion 不是没有条件的。

top-K 的中间状态需要放在片上资源里，否则如果又跑去 global memory 维护 top-K，就把收益吃掉。K 越大，top-K buffer / heap 占用的 shared memory 或 registers 越多，会挤压 occupancy 和主 softmax 计算。

所以论文的经验结论是：

> 当 K 足够小，fusion 很赚；当 K 太大，fusion 的片上资源压力可能超过少一次 global memory 往返带来的收益。


---

# 6. 数值稳定性

## 6.1 fp32 下的 safe softmax

fp32 最大有限值约为：

$$
3.4 \times 10^{38}
$$

对应：

$$
\log(3.4 \times 10^{38}) \approx 88
$$

所以 naive softmax 里，一旦 $x_i > 88$，$e^{x_i}$ 就可能 overflow。

safe softmax 通过减 max 保证：

$$
x_i - m \le 0
$$

因此：

$$
e^{x_i-m} \le 1
$$

overflow 被消掉了。

underflow 端也比较好理解：如果某个 $x_i$ 比 max 小太多，$e^{x_i-m}$ 可能 underflow 成 0。但这类项本来对 softmax 分布的贡献就几乎为 0，所以通常是良性的。

## 6.2 mixed precision 里的现实情况

原 paper 主要讨论 fp32。放到后来的 Transformer / FlashAttention 语境里，还要考虑 mixed precision。

fp16 的最大有限值是 $65{,}504$，指数安全窗口大约只有：

$$
\log(65504) \approx 11
$$

这比 fp32 的 88 窄很多。因此实际训练/推理实现里，softmax 往往会用 fp32 accumulator 或专门的 mixed-precision 路径处理，而不是完全裸 fp16 算到底。

这也解释了为什么 attention kernel 里 softmax 部分总是被特别照顾：它既是 memory-bound，又是 numerical-sensitive。

## 6.3 Rebase factor 的 underflow

online 递推里的 rebase factor 是：

$$
e^{m_{i-1}-m_i}
$$

因为 $m_i \ge m_{i-1}$，指数一定不大于 0，所以它不会 overflow。

它可能 underflow。例如新 max 比旧 max 大很多：

$$
m_i - m_{i-1} \gg 0
$$

那么：

$$
e^{m_{i-1}-m_i}
$$

可能直接变成 0。

这在数学上通常是良性的：旧项在新 max 基准下本来就极小，贡献可以忽略。换句话说，rebase factor underflow 表示“旧概率质量相对新 max 已经太小了”，而不是 softmax 算法坏了。

---

# 7. 和 FlashAttention 的关系

这篇 paper 做的是一维向量 softmax：

```text
scan x_1, x_2, ..., x_V
maintain m and d
```

FlashAttention 做的是二维 attention block：

```text
scan K/V blocks
maintain row-wise m and l for each Q block
```

形式上几乎一样：

| Online softmax | FlashAttention |
|---|---|
| 新元素 $x_i$ | 新 score block $S_{ij} = Q_i K_j^\top$ |
| running max $m_i$ | row-wise running max $m_i$ |
| running normalizer $d_i$ | row-wise running sum $\ell_i$ |
| rebase $e^{m_\text{old}-m_\text{new}}$ | 同样的 rebase 因子 |
| 最后写 $y_i$ | 同步更新输出 block $O_i$ |

区别在于：FlashAttention 不只是更新 denominator，还要同步更新 $O = PV$ 的部分输出。因此 FA1 的公式看起来更复杂，但心脏就是这里的 online normalizer。

---

# 8. 总结

Milakov & Gimelshein 这篇 paper 解决的问题很小，但思想很干净：

> 如果一个 reduction 的基准会变化，就维护一个 running state，并在基准变化时把旧 state rebase 到新基准。

对 softmax 来说，变化的基准是 max；running state 是 normalizer。这个动作把 safe softmax 从三遍扫描压回两遍扫描，在大词表场景下直接减少 global memory traffic。

更重要的是，它给了后来的 FlashAttention 一个现成的数学零件：只要能在线维护 row-wise max 和 normalizer，就可以让 softmax 不再依赖完整 materialized matrix。

## 概念 checklist

- Naive softmax：两遍扫描，但 $e^{x_i}$ 可能 overflow
- Safe softmax：先减 max，数值安全，但需要三遍扫描
- Online normalizer：一遍同时维护 $m$ 和 $d$，完整 softmax 回到两遍扫描
- Rebase 因子 $e^{m_\text{old}-m_\text{new}}$ 的作用：把旧 normalizer 改写到新 max 基准
- Theorem 1 说明 online normalizer 与 safe normalizer 在数学上等价，不是近似
- Softmax alone 的收益有限但稳定；Softmax + Top-K fusion 的收益更大，因为避免了整张概率向量落地
- Top-K fusion 适合小 K；K 太大会带来片上资源压力
- fp32 下 max-subtract 基本解决 overflow；mixed precision 下 softmax 仍需要特殊处理
- FlashAttention 把这个一维 online softmax 推广成二维 block-wise attention

---
# 个人笔记
{{< details summary="Notes" >}}

![Online Softmax 1](/notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/online-softmax-back.jpg)
![Online Softmax 2](/notes/笔记-底层架构-io感知注意力2-online-softmax-原始推导/online-softmax-front.jpg)

{{< /details >}}
