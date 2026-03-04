---
date: '2026-02-26T00:30:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第4部分：单步与多步误差分析（可靠性验收）'
summary: "聚焦 Part 3 模型的误差验收：单步预测误差、多步 rollout 累积误差、跨步长泛化误差，以及可执行门禁。"
description: "Part 4 note on one-step/multi-step error analysis and reliability acceptance."
tags: ["PDE", "Trajectory Learning", "One-Step Error", "Rollout Error", "Cross-Step Validation", "Reliability", "Numerical Methods"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学4-参数反演与OOD告警/
  - /notes/笔记-计算科学与高可靠系统设计4-参数反演与ood告警/
---

# 计算科学与高可靠系统设计 Part 4：单步与多步误差分析

Part 3 已经把 CFL 合规轨迹转成可学习样本。Part 4 只回答一个问题：这个模型到底“准不准、稳不稳、能不能验收”。  

---

## 1. 评估对象与记号

设真实推进算子为 $\Phi_{\Delta t}$，学习模型为 $f_\theta$：  

$$
u^{n+1}=\Phi_{\Delta t}(u^n),\qquad
\hat{u}^{n+1}=f_\theta(u^n,\Delta t)
$$

单步误差定义为：

$$
e_1^n=\hat{u}^{n+1}-u^{n+1}
$$

多步 rollout 误差（从同一初值滚动 $m$ 步）定义为：

$$
\hat{u}^{n+m}=f_\theta^{(m)}(u^n,\Delta t),\qquad
e_m^n=\hat{u}^{n+m}-u^{n+m}
$$

---

## 2. 单步误差：先看局部拟合能力

单步指标建议至少记录三项：  

1. `MAE_1`：平均绝对误差。  
2. `RMSE_1`：均方根误差。  
3. `Linf_1`：最大绝对误差。

对应公式：

$$
\mathrm{MAE}_1=\frac{1}{N}\sum_{k=1}^{N}|e_{1,k}|,\qquad
\mathrm{RMSE}_1=\sqrt{\frac{1}{N}\sum_{k=1}^{N}e_{1,k}^2},\qquad
\mathrm{Linf}_1=\max_k|e_{1,k}|
$$

若单步误差都过不了门槛，多步 rollout 基本不可能可靠。  

---

## 3. 多步误差：看累积与稳定性

多步误差通常随步数增长。关键不是“是否增长”，而是“增长是否可控”。  

建议固定总时长 $T$，比较不同步数下误差曲线：  

$$
\mathrm{MAE}_m,\ \mathrm{RMSE}_m,\ \mathrm{Linf}_m,\quad m=1,\dots,M
$$

工程上可加两个稳定性判据：  

1. 是否出现发散（误差突增、数值爆炸）。  
2. 是否出现非物理值（超出变量合理区间）。

---

## 4. 跨步长泛化：检验 Part 2 方法是否“学到了”

这一步是你当前主线的关键：  


若模型只在训练步长内好、跨步长就崩，说明它记住的是采样分布，不是推进规律。  

---

## 5. 误差阶诊断（非硬门禁）

误差阶用于判断“误差随步长缩小是否符合预期”，它是诊断指标，不直接替代 PASS/FAIL 门禁。  

观测误差阶常用写法：

$$
p_{\mathrm{obs}}\approx \log_2\!\left(\frac{E(h)}{E(h/2)}\right)
$$

其中 $E$ 可取单步或多步指标（如固定 $T$ 下的 $\mathrm{RMSE}_M$）。  

时间步长示例（应接近一阶）：  

$$
E(\Delta t=0.04)=1.60\times10^{-3},\quad
E(\Delta t=0.02)=8.20\times10^{-4}
$$

$$
p_t\approx \log_2\!\left(\frac{1.60\times10^{-3}}{8.20\times10^{-4}}\right)\approx 0.96
$$

空间步长示例（五点差分常见接近二阶）：  

$$
E(\Delta x=0.20)=3.80\times10^{-4},\quad
E(\Delta x=0.10)=9.60\times10^{-5}
$$

$$
p_x\approx \log_2\!\left(\frac{3.80\times10^{-4}}{9.60\times10^{-5}}\right)\approx 1.98
$$

如果阶数明显偏离预期（如长期低于 $0.5$ 或波动很大），通常要回查数据构建、边界处理或训练分布。  

---

## 6. 验收流程与门禁（精简版）

把门禁和流程合在一起执行即可：  

$$
\text{PASS} \Longleftrightarrow
(\mathrm{MAE}_1\le \tau_{\mathrm{mae1}})
\land
(\mathrm{RMSE}_M\le \tau_{\mathrm{roll}})
\land
(\mathrm{CrossStepRMSE}\le \tau_{\mathrm{cross}})
\land
(\text{NoDivergence})
$$

1. 生成 CFL 合规的三档轨迹（$\Delta t,\Delta t/2,\Delta t/4$）。  
2. 训练一步模型并做单步指标筛选。  
3. 固定 $T$ 做 rollout 误差曲线。  
4. 做跨步长测试并按上式给出 PASS/FAIL。

这一步能避免“单步很好但 rollout 失控”的误判。  

---

## 7. 与前几篇关系

- Part 1：提供空间离散算子。
- Part 2：提供 CFL 与步长设计。
- Part 3：提供步长轨迹学习模型。
- Part 4：提供单步/多步/跨步长的可靠性验收框架。

---

## 8. 小结

- Part 4 的核心不是再造新模型，而是给现有模型可执行的误差验收标准。  
- 单步指标决定“局部是否学到”，多步指标决定“长期是否可用”。  
- 误差阶用于诊断收敛规律，门禁用于做最终验收，二者职责不同。  
- 跨步长验证是检验“是否学到 Part 2 方法”最关键的一关。  
