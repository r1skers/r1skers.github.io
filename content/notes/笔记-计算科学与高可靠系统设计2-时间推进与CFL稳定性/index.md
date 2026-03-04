---
date: '2026-02-19T00:00:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第2部分：时间推进与CFL稳定性（步长设计与多步长轨迹）'
summary: "从 Part 1 的空间离散算子出发，建立时间推进框架，给出 CFL ratio 约束与工程步长设计方法（固定 dt"
description: "Part 2 note on explicit time stepping, CFL constraints, and trajectory sampling strategy."
tags: ["PDE", "Time Marching", "CFL", "Explicit Euler", "Numerical Stability", "Step Size", "Numerical Methods"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学2-误差分析与理查德森外推/
  - /notes/笔记-计算科学与高可靠系统设计2-系统可靠性与误差控制/
---

# Part 2：时间推进与 CFL 稳定性

Part 1 得到的是空间离散算子 $L_h$。Part 2 讨论的是：在这个算子上，时间步长如何选，轨迹如何采样，结果才稳定可用。  

主线是：半离散系统 -> 时间推进格式 -> CFL 约束 -> 步长设计 -> 多步长轨迹。  

---

## 1. 从 Part 1 到时间推进

Part 1 可写成半离散系统：

$$
\frac{d u}{d t}=\kappa L_h u
$$

这里 $L_h$ 是空间离散算子。它是“时间演化生成元”，但不是一步推进矩阵本体。  

引入时间离散后，才得到一步推进映射。以前向欧拉为例：

$$
u^{n+1}=u^n+\Delta t\,\kappa L_h u^n=(I+\Delta t\,\kappa L_h)u^n
$$

---

## 2. CFL ratio 与稳定性门槛

对二维扩散显式格式（五点空间离散）定义：

$$
r_x=\frac{\kappa\Delta t}{\Delta x^2},\qquad
r_y=\frac{\kappa\Delta t}{\Delta y^2}
$$

### 2.0 CFL 约束推导（沿用 Part 1 口径）

这里给出和 Part 1 一致的推导思路：从显式更新式重排系数，得到稳定性门槛。  

对二维扩散方程采用显式更新（$\Delta x,\Delta y$ 可不同）：

$$
h_{i,j}^{n+1}=h_{i,j}^{n}+\kappa\Delta t\left(\frac{h_{i+1,j}^{n}-2h_{i,j}^{n}+h_{i-1,j}^{n}}{\Delta x^2}+\frac{h_{i,j+1}^{n}-2h_{i,j}^{n}+h_{i,j-1}^{n}}{\Delta y^2}\right)
$$

用 $r_x=\kappa\Delta t/\Delta x^2,\ r_y=\kappa\Delta t/\Delta y^2$ 记号，可写成：

$$
h_{i,j}^{n+1}=(1-2r_x-2r_y)h_{i,j}^{n}+r_x(h_{i+1,j}^{n}+h_{i-1,j}^{n})+r_y(h_{i,j+1}^{n}+h_{i,j-1}^{n})
$$

按本笔记采用的“中心系数非负”判据：

$$
1-2r_x-2r_y\ge 0
$$

即可得到 CFL 约束：

$$
r_x+r_y\le \frac{1}{2}
$$

因此后续工程设计里，我们就以 $r_x+r_y\le \frac{1}{2}$ 作为稳定性门槛。  

若 $\Delta x=\Delta y$，则退化为熟悉形式：

$$
r=\frac{\kappa\Delta t}{\Delta x^2}\le \frac{1}{4}
$$

工程上通常再乘安全系数 $s\in(0,1)$（如 $s=0.8$），避免贴边运行。  

### 2.1 为什么要做“步长设计”

第 3 节引入三种步长设计，不是在“换个写法”，而是在对应三类真实工程约束入口：  

- 你可能先定了网格分辨率（固定 $\Delta x,\Delta y$）；  
- 你可能先定了采样周期（固定 $\Delta t$）；  
- 你也可能为了跨网格可比性，先定 CFL ratio（固定 $r$）。  

这三种方式的共同目标是：在 CFL 稳定性门槛内生成可比较的多步长轨迹样本（如 $\Delta t,\Delta t/2,\Delta t/4$）。这些样本就是后续学习、对比和验收的统一数据基线。  

---

## 3. 三种步长设计方式

### 3.1 固定网格 $\Delta x,\Delta y$，反推 $\Delta t$

这是最常见模式：先定空间分辨率，再按稳定性反推时间步长。  

$$
\Delta t
\le
s\cdot\frac{1}{2\kappa\left(\frac{1}{\Delta x^2}+\frac{1}{\Delta y^2}\right)}
$$

等间距网格下：

$$
\Delta t\le s\cdot\frac{\Delta x^2}{4\kappa}
$$

### 3.2 固定 $\Delta t$，反推网格尺度

适合采样周期已固定的控制系统或数据采集链路。  

等间距网格下，可由稳定性得到：

$$
\Delta x\ge \sqrt{\frac{4\kappa\Delta t}{s}}
$$

### 3.3 固定 CFL ratio（推荐）

给定目标 ratio（例如 $r=0.2$），随网格变化自动缩放 $\Delta t$：

$$
\Delta t=\frac{r\Delta x^2}{\kappa},\qquad r\le \frac{1}{4}
$$

这种方式最利于不同网格结果可比。  

---

## 4. 多步长轨迹采样（用于学习与验收）

在同一空间网格上，可选三档步长：

$$
\Delta t,\quad \frac{\Delta t}{2},\quad \frac{\Delta t}{4}
$$

并保持都满足 CFL 门槛。常见用途：

1. 观察数值耗散/平滑速度随步长变化。
2. 构建“粗到细”的时间分辨率轨迹数据。
3. 为后续学习、误差评估与可信度判断提供统一样本基线。

为了公平比较，通常固定同一物理时长 $T$，只改变步数 $N_t=T/\Delta t$。  

---

## 5. 沙地模型中的边界与步长

延续 Part 1 的沙层厚度模型 $h(x,y,t)$：  

- 左侧给料器可用 Dirichlet（固定高度）；
- 右侧出沙口或墙面可用 Neumann（固定通量或零通量）；
- 若建模封闭循环输运带，可用 Periodic。

对应英文简述：

边界先定义“如何与外界交换”，CFL 再约束“每步能走多快”。两者共同决定仿真是否可用。  

---

## 6. 小结

- Part 1 给出空间离散算子 $L_h$；Part 2 在此基础上构建时间推进。  
- 显式格式的核心门槛是 CFL ratio，而不是“随意调步长”。  
- 工程上优先推荐“固定 ratio”策略，便于多网格与多实验比较。  
- 多步长轨迹（$\Delta t,\Delta t/2,\Delta t/4$）是后续可靠性评估的基础数据层。  
