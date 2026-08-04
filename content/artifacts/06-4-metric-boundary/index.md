---
date: '2026-07-04T16:40:00+09:00'
draft: false
title: "[Artifact-6.4] Metric Boundary：局部误差不是行为 Oracle"
summary: "Artifact-6 的第四份记录：在 BERT/GPT-2 真实 attention 上确认 rel-hat 是强局部 sparse-attention scorer 之后，继续把评价指标推过 W_O、next-token KL 和整层干预。结果显示局部误差控制能迁移到 W_O 投影层面，但 local oracle 不是 behavioral oracle；越接近读出结构，局部最优与 KL 最优的错位越明显。"
description: "记录 Value-Aware Sparse Attention 的 metric-boundary 阶段：W_O-projected error、GPT-2 single-head next-token KL、whole-layer KL intervention，以及 local sparse-attention error 与 model-level behavioral impact 之间的边界。"
tags:
  - "Attention"
  - "Sparse Attention"
  - "Error Analysis"
  - "Reliability"
categories:
  - "Artifacts"
series:
  - "Value-Aware Sparse Attention"
weight: 64
math: true
---

项目本体见 GitHub 仓库 [value-aware-sparse-attention](https://github.com/r1skers/value-aware-sparse-attention)。前三篇分别完成了：

- [Artifact-6.1：公式推导与现象观察](/artifacts/06-1-formulas-and-phenomenon-observation/)：从分解式 $\|o-\tilde o\|=\delta\|\mu_R-\mu_S\|$ 建立误差信号层级。
- [Artifact-6.2：Cheap Value Proxies](/artifacts/06-2-cheap-value-proxies/)：在合成台架上设计 cheap value-aware proxy，区分 predictor correlation 与 allocation quality。
- [Artifact-6.3：真实 Attention：从 BERT 到 GPT-2 迁移](/artifacts/06-3-real-attention-cross-model/)：把 rel-hat 切进真实 BERT / GPT-2 attention，建立 exact-budget 协议，并验证它不是 BERT-only trick。

这篇是 Artifact-6 的边界实验。

前面我们已经知道一件事：UTC-rel-hat 是一个很强的**局部 sparse-attention scorer**。它在 head-output relative error 上跨 BERT / GPT-2 成立，在 exact-budget 协议下能吃掉 fixed 到 restricted oracle 差距的大部分。

但这还不是模型最终关心的量。

真实模型最后感受到的不是某个 head 的 $\|o-\tilde o\|$，而是经过 $W_O$、残差流、后续层、LayerNorm、MLP、LM head 之后的 next-token distribution。于是最后一个问题变成：

> 局部 attention 误差控制，能不能一路代表模型行为误差？

然后这篇的结论：

> **局部误差控制是成立的，并且能迁移到 $W_O$ 投影层面；但它不能自动成为 next-token KL 的 oracle。局部误差不是行为 oracle。**

## 1. metric boundary

前面所有实验的核心目标都是局部的。对一个 attention row，有完整输出

$$
o_i=\sum_j p_{ij}v_j
$$

和重归一化后的 sparse 输出

$$
\tilde o_i(k)=\frac{1}{m_i(k)}\sum_{j\in S_i(k)}p_{ij}v_j.
$$

局部 relative error 是：

$$
E_i(k)=\frac{\|o_i-\tilde o_i(k)\|}{\|o_i\|+\eta}.
$$

rel-hat 要估计的是这个量的 cheap proxy：

$$
\widehat E_{\text{rel-hat}}(k)=\frac{\delta(k)\lVert\hat\mu_R(k)-\mu_S(k)\rVert}{\lVert\hat o(k)\rVert+\eta}.
$$

这个定义直接对应 restricted oracle 的局部目标。但模型最终输出不是 $o_i$，而是 logits：

$$
z_t = f_{\text{rest}}(o_1,\ldots,o_n).
$$

next-token KL 衡量的是：

$$
D_{\mathrm{KL}}
\left(
p_{\text{dense}}(x_{t+1}\mid x_{\le t})
\;\|\;
p_{\text{sparse}}(x_{t+1}\mid x_{\le t})
\right).
$$

这两个目标之间隔着很多东西：

- $W_O$ 会重加权 head 输出方向；
- 后续层会放大、吸收或抵消扰动；
- 有些 token 位置对 next-token prediction 更重要；
- head 之间可能有冗余；
- KL 是 softmax 之后的分布差异，不是简单的向量范数。

所以 metric boundary 的任务不是继续证明 rel-hat，而是确认：

> 我们优化的局部误差，到模型行为层还剩多少意义？

## 2. Stage 4A：过 $W_O$，优势还在但衰减

第一层边界测试：把 head-space error 过 attention output projection $W_O$。

原来的局部误差看：

$$
\|o-\tilde o\|.
$$

$W_O$ 投影后看：

$$
\|(o-\tilde o)W_O\|.
$$

这里仍然是局部指标，但已经进入模型真实的 residual-stream 方向。实验在 BERT 和 GPT-2 上都重算 projected restricted oracle，然后用相同 exact-budget allocation 比较 scorer。

结果：

```text
BERT rel-hat:
head-space mean gap closed       0.790
W_O-projected mean gap closed    0.755

GPT-2 rel-hat:
head-space mean gap closed       0.828
W_O-projected mean gap closed    0.702
```

排序没有崩。rel-hat 仍然是 leading scorer，但是优势被压缩。这个结果很重要，因为它排除了一个最糟糕的解释：

> 我们走错了方向。

不是。至少到 $W_O$ 投影层面，局部 value-aware error control 仍然有意义。

但它也给了一个警告：越接近模型真实计算路径，局部优势越会被下游结构压平。

## 3. Stage 4B：单 head KL，local oracle 反转

下一步把指标推进到 GPT-2 next-token KL。

实验方式：

```text
选定一个 GPT-2 layer / head / budget
用 fixed / mass / UTC-abs / UTC-rel / UTC-rel-hat / projected-oracle 选 k
只替换这个 head 的 sparse attention context
继续跑完整 GPT-2 后续层
比较 sparse logits 与 dense logits 的 next-token KL
```

这里有一个实现细节：为了确认 intervention 是真的，我们做了 dense manual reconstruction。也就是说，如果不剪枝，只用手工重建的 dense $PV$ context 继续 forward，logits 应该对上原模型。

校验结果：

```text
layer 0  max logit diff 0.00387, mean diff 8.7e-05
layer 5  max logit diff 0.00066, mean diff 2.3e-05
layer 11 max logit diff 0.00012, mean diff 7.2e-06
```

这一步中间还有个实现 bug：最初 patch 单个 head 时，非目标 head 被错误替换成 raw V 而不是 dense attention context $PV$。dense reconstruction check 把这个 bug 挡住了。这个小插曲说明后面的 KL 结果不是从一个坏 intervention 得来的。

Stage 4B 的 per-configuration KL improvement 是：

```text
mean next-token KL improvement vs fixed:

projected_oracle  -0.407
mass              -0.083
UTC-abs           -0.042
UTC-rel           -0.205
UTC-rel-hat       -0.091
```

单看这个表，rel-hat 没赢，UTC-abs 更稳。但真正大的信号不是 rel-hat 掉队，而是：

> **projected-oracle 也平均输给 fixed。**

projected-oracle 是 $W_O$ 局部误差下的 restricted oracle。如果它在 next-token KL 上输给 fixed，说明问题不是某个 scorer 没拟合好，而是评价轴已经换了。

局部 oracle 优化的是：

$$
\min_k \max_i E_i^{W_O}(k).
$$

KL 真正关心的是：

$$
\min_k
D_{\mathrm{KL}}
(p_{\text{dense}}\|p_{\text{sparse}(k)}).
$$

这两个不是同一个目标。

更细地看，per-config ratio metric 本身也很脆弱：单 head intervention 的 fixed KL 跨 8 个数量级，很多配置下干预本来就几乎没有行为影响。于是 ratio improvement 很容易被小分母噪声支配。

如果改看 aggregate KL risk，结果又是另一面：

```text
aggregate mean-KL reduction vs fixed:

projected_oracle  -0.192
mass              -0.229
UTC-abs            0.146
UTC-rel            0.057
UTC-rel-hat        0.183
```

rel-hat 仍然是 aggregate KL 最好的 deployable scorer。但 projected-oracle 反转没有消失。这说明它不是 rel-hat 的小问题，而是 local-error oracle 到 KL oracle 的断裂。

## 4. Stage 4C：整层干预排除 single-head 伪影

Stage 4B 还有一个合理怀疑：

> 只改一个 head 太不像部署，也太容易被模型冗余吸收。也许 KL 错配只是 single-head intervention 太弱造成的。

所以 Stage 4C 改成 whole-layer intervention：

```text
选定一个 GPT-2 layer / budget
同一层所有 heads 同时 sparse
每个 head 仍用自己的 exact-budget allocator
继续跑后续模型
比较 next-token KL
```

这样更接近真实 sparse attention 部署形态，也让效应量更大。

确实，信号量级变健康了：

```text
Stage 4B single-head fixed mean KL: 0.00303
Stage 4C whole-layer fixed mean KL: 0.02578
```

也就是说，single-head 的小信号问题是真的。

但关键问题是：scorer ladder 有没有回来？

结果：

```text
mean next-token KL improvement vs fixed:

projected_oracle  -1.554
mass              -0.146
UTC-abs            0.096
UTC-rel           -0.262
UTC-rel-hat       -0.026
```

aggregate KL risk：

```text
aggregate mean-KL reduction vs fixed:

projected_oracle  -0.527
mass              -0.193
UTC-abs            0.069
UTC-rel           -0.049
UTC-rel-hat        0.074
```

整层干预让 KL 信号变大了，但没有恢复局部 scorer ladder。projected-oracle 不仅没有回来，反而在 aggregate KL 上更差。

这就是 Stage 4C 的判决：

> Stage 4B 的问题不只是 single-head 噪声伪影。局部 sparse-attention / $W_O$ 误差和 next-token KL 之间确实存在目标边界。

## 5. 中心图：度量阶梯、oracle 反转、深度梯度

把 Stage 4A/B/C 放在一张图里，结构会更清楚。

![Metric boundary triptych](fig_64_metric_boundary_triptych.png)

左图是 metric ladder。head output 和 $W_O$ projected 两层里，local oracle 是定义上的上界，rel-hat 也保持领先；但到了 KL，local oracle 掉到负区间。

中图是 oracle inversion。single-head KL 里，projected-oracle 已经让 aggregate KL 变差；whole-layer KL 里，这个反转更强。

右图是 whole-layer KL 的 depth gradient：

```text
layer 0:
UTC-rel-hat aggregate KL reduction  +0.114

layer 5:
UTC-rel-hat aggregate KL reduction  -0.051

layer 11:
UTC-rel-hat aggregate KL reduction  -0.205
projected-oracle aggregate KL reduction -3.194
```

这让负结果变得有结构。

边界不是一堵平墙，而是随深度递增的错位：早层里，局部保真仍然有行为意义；越靠近读出端，局部最优越可能沿着对 logits 敏感但被局部范数忽略的方向出问题。

换句话说：

> 局部误差控制止步于模型的读出结构。

## 6. 反思

这是不是说明前面白做了？不是。

前面的结论仍然完好：

- 分解式 $\|o-\tilde o\|=\delta\|\mu_R-\mu_S\|$ 仍然是精确恒等式；
- value geometry 在高熵 / 弥散 attention 里确实重要；
- UTC / rel-hat 确实是便宜的 value-aware local scorer；
- BERT / GPT-2 的 head-space 和 $W_O$-projected 结果都说明它不是合成幻觉；
- 21 个 starvation failure 也说明它的局部失败模式是可诊断的。

Stage 4 回答了另一个问题：

> 这个局部框架能不能自动延伸到模型行为指标？

答案是：不能自动延伸。

这给前面的工作画出了适用域。局部 error control 是一个成立的问题；behavioral KL control 是另一个问题。

这两者之间差了一个读出结构：

$$
\Delta o
\rightarrow
\Delta o W_O
\rightarrow
\text{residual stream}
\rightarrow
\text{later blocks}
\rightarrow
\Delta z
\rightarrow
D_{\mathrm{KL}}.
$$

前半段可以用 value geometry 控制。后半段还需要位置权重、层深、head 冗余、logit-sensitive direction 等信息。

## 7. 收尾边界

Artifact-6 最初的问题是：

> 剪掉一些 attention，误差会怎样？

现在它被拆成：

```text
1. 误差由 dropped mass × value centroid displacement 决定。
2. 两个因子的主导权随 entropy regime 切换。
3. 只看 Q,K 的 dropped mass 在尖锐区很强，在弥散区失效。
4. cheap value-aware proxy 可以在局部误差目标上追回大量 restricted-oracle 余量。
5. 这个局部控制能跨真实 BERT/GPT-2，并能过 W_O 投影。
6. 但 next-token KL 需要新的 behavioral reference axis。
```

换句话说就是：

> **项目把"剪 attention 的代价"从一句模糊担忧，变成了一张有刻度的尺子：代价由什么组成、在哪里可以被便宜预测、预测到什么程度、以及这种预测在哪里停止有意义。**

所以这篇算是个边界记录：

> Value-aware local sparse-attention error can be controlled cheaply and transfers through $W_O$ with attenuation, but local restricted oracles are not behavioral oracles under next-token KL.

如果继续往下，应该开新问题：KL-aware / readout-aware sparse attention。那会需要新的 oracle、新的 budget objective，甚至可能要接训练回路和真实 wall-clock。它不是 Artifact-6 的未完成部分，而是它量出来的下一个研究对象。

至此，Artifact-6 的 research-style implementation 版本收束：公式、regime、cheap proxy、真实迁移、失效模式、度量边界，都有自己的数字和边界。
