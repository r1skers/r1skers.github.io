---
date: '2026-03-01T00:10:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第6部分：反演结果分析与参数可信度'
summary: "Part 5 得到的是一组能够较好解释 observation 的参数，但这并不自动等于真参数。本篇开始区分 observation 拟合、validation 能力与 truth-level 对照，并讨论结果到底该怎么看。"
description: "Part 6 on inversion-result analysis, validation, and parameter credibility."
tags: ["Computational Science", "Inverse Problem", "Reliability"]
categories: ["Notes"]
series: ["Inverse Modeling and Reliable Computation"]
note_kind: "topic"
aliases:
  - /notes/笔记-应用数学6-参数反演-l-bfgs-b/
  - /notes/笔记-计算科学与高可靠系统设计6-参数反演2-参数处理/
  - /notes/笔记-计算科学与高可靠系统设计6-反演结果分析与参数可信度/
  - /notes/note-csys-6-inversion-credibility/
---

> **主题入口：** [反问题与可靠计算档案](/notes/topics/inverse-modeling/)

# 计算科学与高可靠系统设计 Part 6：反演结果分析与参数可信度

Part 5 解决的是“怎样让反演真正开始迭代”。  
到了 Part 6，问题就不再只是目标函数能不能降下来，而是：**这组已经拟合 observation 的参数，到底靠不靠谱。**

---

## 1. 可辨识性

首先要明确的是，Part 5 中我们得到的那组参数，严格来说只是一个**能够较好解释 observation 的解**。  
它说明的是：在当前 observation、当前目标函数、当前参数化方式之下，这组参数可以把 prediction 和 observation 的差压得比较小。

但这并不自动意味着它就是“真实参数”。

原因很简单：我们现在拿到的并不是完整 truth，而只是经过时间截取、空间截取和噪声污染之后的 observation。  
也就是说，反演面对的从一开始就不是系统的全部信息，而只是其中一部分投影。

在这种情况下，就有可能出现一种现象：

- 一组参数可以较好拟合 observation；
- 另一组不同的参数，也可能给出相近的 prediction；
- 最终两组参数在 observation 层面上都“解释得通”。

这就是这里所说的可辨识性问题。

换句话说，反演里真正困难的地方，并不只是“目标函数能不能降下来”，而是：

**当目标函数已经降下来了，我们还能不能根据现有 observation，把参数唯一而稳定地区分出来。**

如果不能，那么这组参数就只能被称为“一个合理解”或者“一个可行解”，而不能轻易说它就是唯一正确的真参数。

所以 Part 6 关心的重点，不再是如何继续更新参数，而是要开始区分两件事：

- 这组参数是否能拟合 observation；
- 这组参数是否真的足够可信。

## 2. 可信度检测

既然 observation 拟合得好，并不自动意味着参数已经被正确恢复，那么接下来就需要把“结果怎么看”这件事拆开。  
更准确地说，我们至少要分清三层：

- 这组参数是否拟合了参与反演的 observation；
- 这组参数对未参与反演的数据是否还有解释力；
- 在模拟实验里，这组参数和完整 truth 到底还有多大差距。

也就是说，可信度检测并不是只盯着一个 loss，而是要从 observation、validation 和 truth 这几个层面分别看。

## 2.1 训练集和验证集（项目中未使用）

比较严格一点的做法，是把现有 observation 再切成两部分：

- 一部分参与反演，作为真正的 inversion set；
- 另一部分不参与反演，只在最后用来做 validation。

这样做的意义在于，它可以帮助我们区分两件事：

- 这组参数是不是只把当前这批 observation 拟合住了；
- 还是它对没参与反演的数据也仍然有解释力。

如果只是前者，那么它更像是在“记住”已有 observation；  
如果后者也成立，那么它才更接近于学到了相对稳定的规律。

目前项目里的实现还没有显式地把 observation 划成 train / validation 两部分。  
在 `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py` 里，当前的 objective 还是直接在整份 observation CSV 上计算 `obs_mse` 和 `obs_rmse`。

所以这里把训练集和验证集单独提出来，并不是说项目已经完整实现了这一层，而是为了说明：  
**如果后面要进一步增强结果的说服力，这会是一个非常自然的方向。**

## 2.2 模拟实验中的 truth-level 后验对照

除了 observation 层面的误差之外，在模拟实验里我们还有一个现实中很难直接拥有的优势：  
我们知道完整 truth，也知道 true $\kappa$。

这意味着，反演完成之后，我们还可以继续做更后验的对照：

- 用 recovered $\kappa$ 重新跑一次完整 rollout；
- 把 rollout 的结果和 truth trajectory 做比较；
- 再把 recovered $\kappa$ 和 true $\kappa$ 直接比较。

这样得到的，就不再只是“它能不能拟合 observation”，而是：

- 它在完整轨迹层面上离 truth 还有多远；
- 它在参数层面上离真参数还有多远。

在项目里，这一层主要对应 `01_inversion_kappa_field/scripts/evaluate_inversion_block.py`。  
这里会进一步输出：

- rollout 过程中的 `rmse` / `mae`
- 最终场的残差
- `kappa_block_mae`
- `kappa_block_rmse`

这些指标的意义在于，它们把“拟合 observation”与“恢复参数”这两件事正式区分开了。

也就是说，一组参数即使已经把 observation 拟合得很好，依然可能：

- rollout 结果和完整 truth 还有差距；
- recovered $\kappa$ 和 true $\kappa$ 并不完全一致。

需要特别强调的是，这一层是**模拟实验专属的后验检验**，而不是现实反演里普适可用的验证方式。  
现实里往往没有完整 truth，也不知道 true $\kappa$，所以不能把这一层当成默认前提。

也正因为如此，2.1 那种基于 hold-out observation 的验证思路，才会更接近现实场景；  
而 2.2 的价值更多在于：在模拟环境下帮助我们判断“拟合 observation”和“恢复真参数”这两件事到底有多一致。

所以到这里，可信度检测真正要看的就不只是目标函数有没有降下来，而是：

- observation 层面，它拟合得怎么样；
- validation 层面，它对未参与反演的数据有没有解释力；
- truth 层面，在模拟实验里它离完整 truth 还有多远；
- 参数层面，它到底恢复到了什么程度。
