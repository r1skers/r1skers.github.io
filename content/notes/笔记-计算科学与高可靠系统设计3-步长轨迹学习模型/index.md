---
title: '计算科学与高可靠系统设计第3部分：步长轨迹学习模型（基于 Part 2 的 dt 分层采样）'
date: '2026-02-26T00:00:00+09:00'
draft: false
summary: "把 Part 2 的稳定步长设计转成可学习数据：用 dt、dt/2、dt/4 轨迹构建样本，训练一步预测模型，并用跨步长验证检查泛化。"
description: "Part 3 note on trajectory-learning model built from CFL-compliant multi-step simulations."
tags:
  - "PDE"
  - "CFL"
  - "Trajectory Learning"
  - "Surrogate Model"
  - "Step Size"
  - "Numerical Methods"
  - "Reliability"
categories:
  - "Crucible"
aliases:
  - /notes/笔记-应用数学3-ink-diffusion串联总结/
  - /notes/笔记-计算科学与高可靠系统设计3-反问题与数据驱动-ink-diffusion/
  - /notes/笔记-计算科学与高可靠系统设计3-学习过程与研究闭环/
---

# 计算科学与高可靠系统设计 Part 3：步长轨迹学习模型

Part 1 给了空间离散算子，Part 2 给了稳定步长规则。Part 3 的核心是把这些“可计算轨迹”转成“可学习样本”。  

---

## 1. 目标：学习 Part 2 的步长轨迹方法

1. 用 Part 2 的 CFL 约束产生稳定轨迹。
2. 用多步长轨迹（$\Delta t,\Delta t/2,\Delta t/4$）构建监督样本。
3. 训练一步预测模型并验证其跨步长泛化能力。

---

## 2. 数据来源：三档步长轨迹

基于 Part 2，先固定空间网格与总物理时长 $T$，再取：

$$
\Delta t,\quad \frac{\Delta t}{2},\quad \frac{\Delta t}{4}
$$

并保证每档都满足 CFL 门槛。  

这样得到的是“同一物理过程，不同时间分辨率”的轨迹族。  

---

## 3. 样本构建：从轨迹到监督学习

对每个网格点与时刻，把邻域状态映射到下一时刻状态：  

$$
\mathbf{x}_{i,j}^{n}=[h_{i,j}^{n},h_{i+1,j}^{n},h_{i-1,j}^{n},h_{i,j+1}^{n},h_{i,j-1}^{n},\Delta t],\qquad
y_{i,j}^{n}=h_{i,j}^{n+1}
$$

这里把 $\Delta t$ 显式作为特征，模型才知道“当前样本属于哪个步长层”。  

可选增强（如果你后续需要更稳健）：

- 增加局部梯度特征（如 $\nabla_h^2 h$ 近似项）；  
- 增加位置编码（$i,j$ 或归一化坐标）；  
- 分层采样平衡不同步长样本数量。

---

## 4. 训练策略：先同步长，再跨步长

建议按两阶段训练/验证：  

1. `In-step`：同一步长内切分训练/验证，先确认模型能学到基本动力学。
2. `Cross-step`：用一种步长训练、另一种步长测试，检查步长迁移能力。

最简单的三组跨步长验证：


---

## 5. 验收指标：不仅看误差，还看稳定性

最低建议记录四类指标：  

1. 点误差：`MAE / RMSE
2. 结构误差：空间平滑度变化或局部梯度统计。  
3. 守恒相关：总量偏移（如质量/能量代理量）。  
4. 稳定性相关：rollout 多步后是否发散或出现非物理值。

如果一个模型误差低但 rollout 发散，它就不算可用模型。  

---

## 6. 与 Part 2 的直接连接句（可复用）

你可以在讲义里直接用这句：  

“Part 2 负责生成 CFL 合规的多步长轨迹；Part 3 负责把这些轨迹转成可学习样本，并验证模型的跨步长泛化能力。”  

---

## 7. 小结

- Part 3 的模型对象是“步长轨迹方法”，不是某个单一案例本身。  
- 三档步长（$\Delta t,\Delta t/2,\Delta t/4$）是最小可用学习数据骨架。  
- 验收必须同时包含误差与稳定性，否则模型在工程上不可靠。  
