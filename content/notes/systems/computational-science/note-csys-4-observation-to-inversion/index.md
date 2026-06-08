---
date: '2026-02-26T00:30:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第4部分：从观测数据到参数反演'
summary: "在 observation 已知、参数场 κ 未知的条件下，说明反演问题如何被建立起来，以及为什么它会自然变成一个基于 forward model 的参数优化问题。"
description: "Part 4 on defining the inversion problem from observations."
tags: ["PDE", "Observation", "Inverse Problem", "Parameter Inversion", "Forward Model", "Kappa"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学4-参数反演与OOD告警/
  - /notes/笔记-计算科学与高可靠系统设计4-参数反演与ood告警/
  - /notes/笔记-计算科学与高可靠系统设计4-反演问题定义/
  - /notes/笔记-计算科学与高可靠系统设计4-从观测数据到参数反演/
  - /notes/笔记-计算科学与高可靠系统设计4-单步与多步误差分析/
  - /notes/note-csys-4-observation-to-inversion/
---

# 计算科学与高可靠系统设计 Part 4：从观测数据到参数反演

Part 3 到这里，我们手里已经不再是完整 truth，而是一组有限、稀疏、带噪的 observation。  
接下来 Part 4 的问题就变成：如何从这些 observation 出发，反推出控制系统演化的参数。

---

## 1. 为什么要反演

正如 Part 3 结尾所说，现实中我们拿到的并不是系统内部的真值，而是经过采样、裁切和噪声污染之后的 observation。  
但我们真正关心的，并不只是“现在测到了什么”，而是这些观测背后更稳定、更普遍的规律。

在这个项目里，这个“更普遍的规律”并不是一个抽象口号，而是控制地形演化的参数场。  
也就是说，我们希望通过已有 observation，反推出是什么样的参数结构，使系统会演化成我们看到的这个样子。

所以反演的目的可以简单理解成：

- observation 是已知的；
- 控制演化的参数是未知的；
- 我们希望根据 observation 去恢复这个未知参数。

## 2. 定义

### 2.1 我们已知什么

反演问题并不是一切都未知。  
在进入 Part 4 之前，我们其实已经知道了不少东西：

- 初始地形 `h0`
- 网格几何 `x_coords`、`y_coords`
- 由 Part 3 得到的 observation 数据
- 以及前面已经建立好的 forward model

也就是说，我们已经知道系统的起点、几何结构，以及“如果参数给定，系统会如何往前演化”。

### 2.2 我们未知什么

现在真正未知的，并不是轨迹本身，而是控制轨迹演化的参数场 $\kappa$。  
在 forward 问题里，$\kappa$ 是输入；而在反演问题里，$\kappa$ 变成了需要恢复的对象。

进一步说，在这个项目里我们通常并不直接反演 full-resolution 的 $\kappa(x,y)$，而是先把它做成较低维的 blockwise 参数。  
这一步的意义，是先把问题从“一个过于自由的未知场”压缩成“一个可以操作、可以优化的参数向量”。

在项目实现里，这一步对应的是 `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py` 和 `01_inversion_kappa_field/scripts/invert_kappa_block_lbfgs_log.py` 里对 blockwise 参数的展开方式。

### 2.3 我们如何判断一个候选 $\kappa$ 好不好

这一步是反演问题真正成立的关键。

既然 observation 已经有了，那么我们就可以先随便给一个候选 $\kappa$，再把它送回 forward model 中，重新生成一条预测轨迹，或者更准确地说，生成一组预测 observation。  

接下来，再把这组预测结果和真实 observation 做比较：

- 如果两者差得很大，说明这个 $\kappa$ 不合理；
- 如果两者差得很小，说明这个 $\kappa$ 更有可能接近真实参数。

也就是说，反演并不是直接从 observation 中“读出”参数，而是：

**不断试探不同的 $\kappa$，让 forward model 产生的结果尽量逼近 observation。**

从这里开始，反演问题就会自然地写成一个优化问题。  
后面我们会进一步把这种“比较误差”的思路写成目标函数，并进入真正的求解过程。

在项目里，这个“给定一个候选 $\kappa$，重新跑一次 forward，再和 observation 比较”的闭环，主要就落在 `_objective_for_params(...)` 这个函数上。

### 2.4 目标函数

一旦“比较 prediction 和 observation”这件事被明确下来，目标函数就会自然出现。  
最简单的理解就是：我们希望找到一个参数，使 forward model 生成的预测 observation 与真实 observation 的差尽量小。

如果写成最朴素的形式，可以先记成：

$$
J(\kappa) = \frac{1}{2}\sum \left(h_{\text{pred}} - h_{\text{obs}}\right)^2
$$

也就是说，反演并不是在直接求一个封闭解，而是在寻找一个让误差最小的 $\kappa$。

在项目里，这一步已经被真正写进代码实现里了。  
对应的是：

- `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py`
- `01_inversion_kappa_field/scripts/invert_kappa_block_lbfgs_log.py`

里的 `_objective_for_params(...)`。

项目里的目标函数不只包含 observation 误差本身，还额外加上了平滑项和先验项。  
也就是说，它的结构更接近：

$$
\text{objective} = \text{obs\_mse} + \text{reg\_smooth} + \text{reg\_prior}
$$

这也说明，在真实的反演实现里，我们并不只是单纯比较 prediction 和 observation，还会通过正则项去约束参数的形状和范围。
